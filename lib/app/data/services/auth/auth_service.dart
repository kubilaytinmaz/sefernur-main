import 'dart:convert';
import 'dart:math';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:crypto/crypto.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:flutter_firebase_chat_core/flutter_firebase_chat_core.dart';
import 'package:get/get.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../../../view/widgets/dialogs/dialogs.dart';
import '../../enums/enums.dart';
import '../../models/models.dart';
import '../../providers/providers.dart';
import '../../repositories/repository.dart';
import '../services.dart';

class AuthService extends GetxService {
  static final FirebaseAuth _auth = FirebaseAuth.instance;
  static final GoogleSignIn _googleSignIn = GoogleSignIn.instance;
  
  late AuthRepository authRepository;
  late UserRepository userRepository;

  NotificationService? notificationService;
  StorageService? stroge;

  var user = UserModel().obs;
  
  /// Indicates if the current user is browsing as a guest (not logged in)
  final isGuest = true.obs;
  
  /// Returns true if user is authenticated (not a guest)
  bool get isAuthenticated => !isGuest.value && user.value.id != null;

  Future<AuthService> init() async {
    authRepository = AuthRepository(DioApi(), FirebaseApi());
    userRepository = UserRepository(DioApi(), FirebaseApi());
    stroge = Get.find<StorageService>();
    // Eagerly try to resolve NotificationService (may not yet be registered in some app start flows)
    if (Get.isRegistered<NotificationService>()) {
      notificationService = Get.find<NotificationService>();
    }
    
    // Initialize Google Sign-In (required in v7.x)
    try {
      await _googleSignIn.initialize();
    } catch (e) {
      print('Google Sign-In initialization failed: $e');
    }

    if (kDebugMode) {
      await _configurePhoneAuthForDebug();
    }
    
    return this;
  }

  Future<void> _configurePhoneAuthForDebug() async {
    try {
      await _auth.setSettings(appVerificationDisabledForTesting: true);
      print('📱 [AUTH-DEBUG] appVerificationDisabledForTesting=true (debug)');
      print('📱 [AUTH-DEBUG] Simulator için Firebase test phone number kullanın.');
    } catch (e) {
      print('📱 [AUTH-DEBUG] setSettings failed: $e');
    }
  }

  Future<void> userBindStream(String userId) async {
    user.bindStream(
      userRepository.streamUserData(userId)
    );
  }

  // Ensure notification service is available before using
  void _ensureNotificationService() {
    if (notificationService == null && Get.isRegistered<NotificationService>()) {
      notificationService = Get.find<NotificationService>();
    }
  }

  Future<void> validateNavigation(UserModel user) async {
    // Check if user needs email verification based on their sign-in method
    if (shouldRequireEmailVerification()) {
      _ensureNotificationService();
      // notificationService null olabilir; subscribe çağrısı güvenli şekilde yapılır
      notificationService?.subscribeToTopic(topic: 'general');
      this.user.value = user;
      isGuest.value = false; // User is now authenticated
      await userBindStream(user.id!);
      // Referral data bootstrap
      if (Get.isRegistered<ReferralService>()) {
        try { await Get.find<ReferralService>().bootstrap(user.id!); } catch (_) {}
      }
    } else {
      FailureDialog.show(
        "emailNotVerified".tr,
      );
    }
  }

  bool shouldRequireEmailVerification() {
    final currentUser = _auth.currentUser;
    if (currentUser == null) return false;
    
    // If user signed in with phone, Google, or Apple, they don't need email verification
    final providerIds = currentUser.providerData.map((info) => info.providerId).toList();
    
    // Check if user has phone, Google, or Apple provider
    bool hasPhoneProvider = providerIds.contains('phone');
    bool hasGoogleProvider = providerIds.contains('google.com');
    bool hasAppleProvider = providerIds.contains('apple.com');
    
    // If user signed in with phone, Google, or Apple, skip email verification
    if (hasPhoneProvider || hasGoogleProvider || hasAppleProvider) {
      return true; // They are considered "verified" through their provider
    }
    
    // For email/password users, check email verification
    return currentUser.emailVerified;
  }

  Future<bool> signInWithEmailAndPassword(String email, String password) async {
    final result = await authRepository.signInWithEmailAndPassword(
      email: email, 
      password: password,
    ).run();

    return result.match(
      (failure) {
        FailureDialog.show(
          failure.message,
        );
        return false;
      },
      (user) async {
        await submitSignIn(user.uid);
        return true;
      },
    );
  }

  Future<bool> submitSignIn(String uId) async {
    // Ensure notification service & refresh FCM token
    if (Get.isRegistered<NotificationService>()) {
      notificationService = Get.find<NotificationService>();
    }
    final result = await userRepository.readUserData(uId).run();
    return result.match(
      (failure) {
        FailureDialog.show(
          failure.message,
        );
        return false;
      },
      (user) async {
        if (user != null) {
          // Ensure user has roles, if not assign default 'user' role
          final updatedUser = await _ensureUserHasRoles(user);
          // Refresh FCM token and persist if changed
          await _refreshAndPersistFcmToken(updatedUser);
          validateNavigation(updatedUser);
          return true;
        } else {
          // Kullanıcı verisi bulunamadı, Firebase Auth'dan temel bilgileri al ve Firestore'a kaydet
          return await createUserFromFirebaseAuth(uId);
        }
      },
    );
  }

  Future<bool> createUserFromFirebaseAuth(String uId) async {
    try {
      final firebaseUser = _auth.currentUser;
      if (firebaseUser != null) {
        // ── Account Linking: check if existing user by email or phone ──
        final existingUser = await _findExistingUserByEmailOrPhone(
          firebaseUser.email,
          firebaseUser.phoneNumber,
          uId,
        );
        if (existingUser != null) {
          final migrated = await userRepository.migrateUserToNewUid(
            existingUser.id!,
            uId,
            additionalData: UserModel().copyWith(
              email: firebaseUser.email ?? '',
              fullName: firebaseUser.displayName ?? '',
              firstName: firebaseUser.displayName?.split(' ').first ?? '',
              lastName: (firebaseUser.displayName?.split(' ').length ?? 0) > 1
                  ? firebaseUser.displayName!.split(' ').last
                  : '',
              imageUrl: firebaseUser.photoURL ?? '',
            ),
          );
          if (migrated != null) {
            final updated = await _ensureUserHasRoles(migrated);
            await _refreshAndPersistFcmToken(updated);
            validateNavigation(updated);
            return true;
          }
        }
        // ── End Account Linking ──

        final userModel = UserModel().copyWith(
          id: uId,
          email: firebaseUser.email ?? '',
          fullName: firebaseUser.displayName ?? '',
          firstName: firebaseUser.displayName?.split(' ').first ?? '',
          lastName: (firebaseUser.displayName?.split(' ').length ?? 0) > 1 
              ? firebaseUser.displayName!.split(' ').last 
              : '',
          imageUrl: firebaseUser.photoURL ?? '',
          isAnonymous: firebaseUser.isAnonymous,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        final createResult = await userRepository.createUserData(userModel).run();
        return createResult.match(
          (failure) {
            FailureDialog.show(
              failure.message,
            );
            return false;
          },
          (success) async {
            if (success) {
              // Ensure user has roles before proceeding
              final updatedUser = await _ensureUserHasRoles(userModel);
              await _refreshAndPersistFcmToken(updatedUser);
              // Check pending invite referral code to link referral now
              try {
                if (Get.isRegistered<StorageService>() && Get.isRegistered<ReferralService>()) {
                  final storage = Get.find<StorageService>();
                  final pending = storage.getPendingInviteCode();
                  if (pending != null) {
                    final referralService = Get.find<ReferralService>();
                    final inviterId = await referralService.repository.resolveInviterIdByCode(pending);
                    if (inviterId != null && inviterId != uId) {
                      final existing = await referralService.repository.findReferral(inviterId, uId);
                      if (existing == null) {
                        final refId = await referralService.createReferral(inviterId, uId, code: pending);
                        await referralService.grantSignupEarningIfConfigured(inviterId: inviterId, referralId: refId);
                      }
                    }
                    await storage.clearPendingInviteCode();
                  }
                }
              } catch (_) {}
              validateNavigation(userModel);
              return true;
            } else {
              FailureDialog.show(
                "userDataNotSaved".tr,
              );
              return false;
            }
          },
        );
      } else {
        FailureDialog.show(
          "userNotFound".tr,
        );
        return false;
      }
    } catch (e) {
      FailureDialog.show(
        "userDataNotSaved".tr,
      );
      return false;
    }
  }

  Future<bool> signUpWithEmailAndPassword(
    String email, 
    String password,
    String firstName,
    String lastName,
    String phoneNumber,
    String imageUrl,
  ) async {
    final result = await authRepository.signUpWithEmailAndPassword(
      email: email,
      password: password,
    ).run();
    return await result.match(
      (failure) {
        FailureDialog.show(
          failure.message,
        );
        return false;
      },
      (user) async {
        await FirebaseChatCore.instance.createUserInFirestore(
          types.User(
            firstName: firstName,
            lastName: lastName,
            id: user.uid,
            imageUrl: imageUrl,
          ),
        );
        var tempUser = UserModel().copyWith(
          id: user.uid,
          email: email,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
          imageUrl: imageUrl,
        );
        await submitSignUp(tempUser);
        return true;
      },
    );
  }

  Future submitSignUp(UserModel userModel) async {
    notificationService = Get.find<NotificationService>();
    final result = await userRepository.updateUserData(userModel).run();
    await result.match(
      (failure) {
        FailureDialog.show(
          failure.message,
        );
      },
      (isSet) async {
        if (isSet) {
          final result = await userRepository.readUserData(userModel.id!).run();
          await result.match(
            (failure) {
              FailureDialog.show(
                failure.message,
              );
            },
            (user) async {
              if (user != null) {
                // Ensure user has roles
                final updatedUser = await _ensureUserHasRoles(user);
                await _refreshAndPersistFcmToken(updatedUser);
                // Consume pending invite code if exists (email sign up path)
                try {
                  if (Get.isRegistered<StorageService>() && Get.isRegistered<ReferralService>()) {
                    final storage = Get.find<StorageService>();
                    final pending = storage.getPendingInviteCode();
                    if (pending != null) {
                      final referralService = Get.find<ReferralService>();
                      final inviterId = await referralService.repository.resolveInviterIdByCode(pending);
                      if (inviterId != null && inviterId != user.id) {
                        final existing = await referralService.repository.findReferral(inviterId, user.id!);
                        if (existing == null) {
                          final refId = await referralService.createReferral(inviterId, user.id!, code: pending);
                          await referralService.grantSignupEarningIfConfigured(inviterId: inviterId, referralId: refId);
                        }
                      }
                      await storage.clearPendingInviteCode();
                    }
                  }
                } catch (_) {}
              } else {
                FailureDialog.show(
                  "userDataNotSaved".tr,
                );
              }
            },
          );
        } else {
          FailureDialog.show(
            "userDataNotSaved".tr,
          );
        }
      },
    );
  }

  Future<bool> checkAuthentication() async {
    final uid = getCurrentUserAuthUid();
    if (uid != '') {
      return await submitSignIn(uid);
    } else {
      return false;
    }
  }

  String getCurrentUserAuthUid() {
    return _auth.currentUser?.uid ?? '';
  }

  Future logoutUser() async {
    try {
      if (Get.isRegistered<NotificationService>()) {
        notificationService = Get.find<NotificationService>();
        await notificationService!.unsubscribeFromTopic(topic: 'general');
      }
    } catch (e) {
      print('[AUTH] Failed to unsubscribe from topic during logout: $e');
      // Continue with logout even if unsubscribe fails
    }
    
    user = UserModel().obs;
    isGuest.value = true; // Reset to guest mode after logout
    await authRepository.signOut();
    await _googleSignIn.signOut();
  }
  
  /// Continue browsing as a guest without signing in
  /// This allows users to explore the app without creating an account
  void continueAsGuest() {
    isGuest.value = true;
    user.value = UserModel(); // Reset user to empty model
  }
  
  /// Check if current action requires authentication
  /// Returns true if user is guest and should be prompted to login
  bool requiresAuth() {
    return isGuest.value || user.value.id == null;
  }

  /// Obtain fresh FCM token via NotificationService and persist if new.
  Future<void> _refreshAndPersistFcmToken(UserModel current) async {
    try {
      if (!Get.isRegistered<NotificationService>()) return;
      final notif = Get.find<NotificationService>();
      final token = await notif.getDeviceToken();
      if (token == null || token.isEmpty) return;
      final existingList = List<String>.from(current.fcmTokens ?? const []);
      bool changed = false;
      if (current.fcmToken != token) {
        changed = true;
      }
      if (!existingList.contains(token)) {
        existingList.add(token);
        // Keep only last 10 tokens
        if (existingList.length > 10) {
          existingList.removeRange(0, existingList.length - 10);
        }
        changed = true;
      }
      if (changed) {
        final updated = current.copyWith(
          fcmToken: token,
          fcmTokens: existingList,
          updatedAt: DateTime.now(),
        );
        await userRepository.updateUserData(updated).run();
        user.value = updated;
      }
    } catch (_) {}
  }

  /// Debug method to check Firebase Phone Auth configuration
  /// Call this before attempting phone verification to diagnose issues
  Future<Map<String, dynamic>> checkPhoneAuthConfiguration() async {
    final config = <String, dynamic>{};
    
    try {
      config['firebase_app_name'] = _auth.app.name;
      config['firebase_project_id'] = _auth.app.options.projectId;
      config['current_user'] = _auth.currentUser?.uid;
      config['firebase_connection'] = 'OK';
      
      print('📱 Phone Auth Config Check:');
      config.forEach((key, value) {
        print('   $key: $value');
      });
      
    } catch (e) {
      config['error'] = e.toString();
    }
    
    return config;
  }

  // Phone Authentication Methods
  Future<void> sendPhoneVerification(
    String phoneNumber,
    Function(String) onCodeSent,
    Function(String) onError,
  ) async {
    try {
      print('📱 Starting phone verification for: $phoneNumber');
      print('📱 Firebase Auth instance: ${_auth.app.name}');
      print('📱 Current user before verification: ${_auth.currentUser?.uid ?? "none"}');
      
      // Validate phone number format
      if (!phoneNumber.startsWith('+')) {
        onError('Telefon numarası + ile başlamalı (örn: +905551234567)');
        return;
      }
      
      // Log for debugging - helps identify configuration issues
      print('📱 Phone number format check passed');
      print('📱 Initiating Firebase verifyPhoneNumber...');
      
      await _auth.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        verificationCompleted: (PhoneAuthCredential credential) async {
          // Auto-retrieval or instant verification
          print('✅ Phone verification completed automatically');
          try {
            await _auth.signInWithCredential(credential);
            final user = _auth.currentUser;
            if (user != null) {
              await submitSignIn(user.uid);
            }
          } catch (e) {
            print('❌ Error in auto sign-in: $e');
            onError('Doğrulama tamamlanamadı: ${e.toString()}');
          }
        },
        verificationFailed: (FirebaseAuthException e) {
          String errorMessage = 'Doğrulama başarısız';
          
          print('❌ Phone verification failed: ${e.code} - ${e.message}');
          print('   Stack trace: ${e.stackTrace}');
          print('   Full error details: $e');
          
          switch (e.code) {
            case 'invalid-phone-number':
              errorMessage = 'Geçersiz telefon numarası. Uluslararası formatta girin (örn: +905551234567)';
              break;
            case 'too-many-requests':
              errorMessage = 'Bu cihaz/IP geçici olarak bloklandı (too-many-requests). 1-2 saat bekleyin veya farklı ağ/cihaz deneyin. Debug için Firebase test phone number kullanın.';
              break;
            case 'quota-exceeded':
              errorMessage = 'Günlük SMS kotası aşıldı. Firebase Console\'dan kotayı kontrol edin';
              break;
            case 'missing-phone-number':
              errorMessage = 'Telefon numarası eksik';
              break;
            case 'app-not-authorized':
              errorMessage = 'Firebase Phone Auth aktif değil veya SHA-1/APNs yapılandırması eksik';
              break;
            case 'session-expired':
              errorMessage = 'Oturum süresi doldu. Lütfen tekrar deneyin';
              break;
            case 'missing-client-identifier':
              errorMessage = 'iOS: APNs yapılandırması eksik. Android: SHA-1 fingerprint eksik olabilir';
              break;
            case 'internal-error':
              errorMessage = 'Firebase yapılandırma hatası. Blaze planı ve ödeme yöntemi kontrol edilmeli';
              break;
            case 'network-request-failed':
              errorMessage = 'İnternet bağlantısı yok veya Firebase sunucularına ulaşılamıyor';
              break;
            case 'web-context-cancelled':
              errorMessage = 'reCAPTCHA doğrulaması iptal edildi';
              break;
            case 'recaptcha-sdk-not-linked':
              errorMessage = 'reCAPTCHA yapılandırması eksik. Fiziksel cihazda APNs ile deneyin veya Firebase Console\'da reCAPTCHA Enterprise\'ı yapılandırın';
              break;
            default:
              errorMessage = 'Hata: ${e.code} - ${e.message ?? "Bilinmeyen hata"}';
          }
          
          onError(errorMessage);
        },
        codeSent: (String verificationId, int? resendToken) {
          print('✅ SMS verification code sent successfully');
          print('   Verification ID: $verificationId');
          print('   Resend token: $resendToken');
          onCodeSent(verificationId);
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          print('⏰ Code auto-retrieval timeout: $verificationId');
          // Auto-retrieval timeout - normal behavior, not an error
          // SMS may still arrive after this timeout
        },
        timeout: const Duration(seconds: 120),
      );
      
      print('📱 verifyPhoneNumber call completed without immediate error');
      
    } on FirebaseAuthException catch (e) {
      print('❌ FirebaseAuthException in sendPhoneVerification: ${e.code} - ${e.message}');
      print('   Stack trace: ${e.stackTrace}');
      
      String errorMessage = _getPhoneAuthErrorMessage(e.code, e.message);
      onError(errorMessage);
    } catch (e, stackTrace) {
      print('❌ Exception in sendPhoneVerification: $e');
      print('   Stack trace: $stackTrace');
      
      // Check for common issues
      String errorMessage = 'SMS gönderilirken hata oluştu';
      if (e.toString().contains('billing') || e.toString().contains('payment')) {
        errorMessage = 'Firebase ödeme yapılandırması gerekli. Blaze planına geçin.';
      } else if (e.toString().contains('network') || e.toString().contains('connection')) {
        errorMessage = 'İnternet bağlantınızı kontrol edin.';
      }
      
      onError('$errorMessage\n\nDetay: ${e.toString()}');
    }
  }
  
  String _getPhoneAuthErrorMessage(String code, String? message) {
    switch (code) {
      case 'missing-client-identifier':
        return 'iOS: APNs key Firebase\'e yüklenmeli.\nAndroid: SHA-1 fingerprint eklenmeli.\nSimulator\'da reCAPTCHA gerekli.';
      case 'internal-error':
        return 'Firebase yapılandırma hatası.\n\n1. Firebase Console > Blaze planına geçin\n2. Ödeme yöntemi ekleyin\n3. Phone Authentication aktif olmalı';
      case 'app-not-authorized':
        return 'Firebase Phone Auth yetkisi yok.\n\nFirebase Console > Authentication > Sign-in method > Phone aktif edin';
      case 'invalid-phone-number':
        return 'Geçersiz telefon numarası.\nUluslararası formatta girin: +905551234567';
      case 'too-many-requests':
        return 'Bu cihaz/IP geçici olarak bloklandı (too-many-requests).\n1-2 saat bekleyin veya farklı ağ/cihaz deneyin.\nDebug için Firebase test phone number kullanın.';
      case 'quota-exceeded':
        return 'SMS kotası aşıldı.\nFirebase Console\'dan kotayı kontrol edin.';
      default:
        return message ?? 'Bilinmeyen hata: $code';
    }
  }

  Future<bool> verifyPhoneNumber(
    String verificationId,
    String smsCode,
    Map<String, dynamic>? userData,
  ) async {
    try {
      PhoneAuthCredential credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: smsCode,
      );

      UserCredential userCredential = await _auth.signInWithCredential(credential);
      User? firebaseUser = userCredential.user;

      if (firebaseUser != null) {
        // Kullanıcı var mı kontrol et
        final result = await userRepository.readUserData(firebaseUser.uid).run();
        
        return result.match(
          (failure) {
            FailureDialog.show(failure.message);
            return false;
          },
          (existingUser) async {
            if (existingUser != null) {
              // Mevcut kullanıcı - giriş yap
              final updatedUser = await _ensureUserHasRoles(existingUser);
              validateNavigation(updatedUser);
              return true;
            } else {
              // ── Account Linking: check if existing user by phone or email ──
              final phoneNum = userData?['phoneNumber'] ?? firebaseUser.phoneNumber ?? '';
              final existingByPhone = await _findExistingUserByEmailOrPhone(
                firebaseUser.email,
                phoneNum.isNotEmpty ? phoneNum : null,
                firebaseUser.uid,
              );
              if (existingByPhone != null) {
                final migrated = await userRepository.migrateUserToNewUid(
                  existingByPhone.id!,
                  firebaseUser.uid,
                  additionalData: UserModel().copyWith(
                    phoneNumber: phoneNum,
                  ),
                );
                if (migrated != null) {
                  // Create chat user for new UID
                  await FirebaseChatCore.instance.createUserInFirestore(
                    types.User(
                      firstName: migrated.firstName,
                      lastName: migrated.lastName,
                      id: firebaseUser.uid,
                      imageUrl: migrated.imageUrl ?? '',
                    ),
                  );
                  final updated = await _ensureUserHasRoles(migrated);
                  validateNavigation(updated);
                  return true;
                }
              }
              // ── End Account Linking ──

              // Yeni kullanıcı - otomatik kayıt et (ad-soyad olmadan)
              final userModel = UserModel().copyWith(
                id: firebaseUser.uid,
                phoneNumber: userData?['phoneNumber'] ?? firebaseUser.phoneNumber ?? '',
                email: firebaseUser.email ?? '',
                imageUrl: firebaseUser.photoURL ?? '',
                isAnonymous: false,
                createdAt: DateTime.now(),
                updatedAt: DateTime.now(),
              );

              // Create user in Chat and Firestore
              await FirebaseChatCore.instance.createUserInFirestore(
                types.User(
                  id: firebaseUser.uid,
                  imageUrl: '',
                ),
              );

              final createResult = await userRepository.createUserData(userModel).run();
              return createResult.match(
                (failure) {
                  FailureDialog.show(failure.message);
                  return false;
                },
                (success) {
                  if (success) {
                    validateNavigation(userModel);
                    return true;
                  } else {
                    FailureDialog.show("userDataNotSaved".tr);
                    return false;
                  }
                },
              );
            }
          },
        );
      }
      
      return false;
    } on FirebaseAuthException catch (e) {
      String errorMessage = 'Doğrulama kodu geçersiz';
      
      switch (e.code) {
        case 'invalid-verification-code':
          errorMessage = 'Geçersiz doğrulama kodu';
          break;
        case 'invalid-verification-id':
          errorMessage = 'Doğrulama oturumu geçersiz';
          break;
        case 'session-expired':
          errorMessage = 'Doğrulama oturumu süresi doldu';
          break;
        default:
          errorMessage = e.message ?? 'Doğrulama başarısız';
      }
      
      FailureDialog.show(errorMessage);
      return false;
    } catch (e) {
      FailureDialog.show('Beklenmeyen hata oluştu');
      return false;
    }
  }

  // Google Sign-In Method (Updated for v7.x)
  Future<bool> signInWithGoogle() async {
    try {
      // Check platform support
      if (!_googleSignIn.supportsAuthenticate()) {
        FailureDialog.show('Google Sign-In bu platformda desteklenmiyor');
        return false;
      }

      // Trigger the authentication flow (new v7.x API)
      final GoogleSignInAccount googleUser = await _googleSignIn.authenticate();

      // Obtain the auth details from the request
      final GoogleSignInAuthentication googleAuth = googleUser.authentication;

      if (googleAuth.idToken == null) {
        FailureDialog.show('Google ID Token alınamadı');
        return false;
      }

      // Create a new credential
      // Not: v7 sürümünde accessToken GoogleSignInAuthentication içinde olmayabilir,
      // Firebase için genellikle sadece idToken yeterlidir.
      final credential = GoogleAuthProvider.credential(
        accessToken: null,
        idToken: googleAuth.idToken,
      );

      // Sign in to Firebase with the Google user credential
      UserCredential userCredential = await _auth.signInWithCredential(credential);
      User? firebaseUser = userCredential.user;

      if (firebaseUser != null) {
        // Check if user exists in Firestore
        final result = await userRepository.readUserData(firebaseUser.uid).run();
        
        return result.match(
          (failure) {
            FailureDialog.show(failure.message);
            return false;
          },
          (existingUser) async {
            if (existingUser != null) {
              // Existing user
              final updatedUser = await _ensureUserHasRoles(existingUser);
              validateNavigation(updatedUser);
              return true;
            } else {
              // ── Account Linking: check if existing user by email or phone ──
              final existingByEmail = await _findExistingUserByEmailOrPhone(
                firebaseUser.email,
                firebaseUser.phoneNumber,
                firebaseUser.uid,
              );
              if (existingByEmail != null) {
                final migrated = await userRepository.migrateUserToNewUid(
                  existingByEmail.id!,
                  firebaseUser.uid,
                  additionalData: UserModel().copyWith(
                    email: firebaseUser.email ?? '',
                    fullName: firebaseUser.displayName ?? '',
                    firstName: firebaseUser.displayName?.split(' ').first ?? '',
                    lastName: (firebaseUser.displayName?.split(' ').length ?? 0) > 1
                        ? firebaseUser.displayName!.split(' ').last
                        : '',
                    imageUrl: firebaseUser.photoURL ?? '',
                  ),
                );
                if (migrated != null) {
                  // Create chat user for new UID
                  await FirebaseChatCore.instance.createUserInFirestore(
                    types.User(
                      firstName: migrated.firstName,
                      lastName: migrated.lastName,
                      id: firebaseUser.uid,
                      imageUrl: migrated.imageUrl ?? '',
                    ),
                  );
                  final updated = await _ensureUserHasRoles(migrated);
                  validateNavigation(updated);
                  return true;
                }
              }
              // ── End Account Linking ──

              // New user - create profile
              final userModel = UserModel().copyWith(
                id: firebaseUser.uid,
                email: firebaseUser.email ?? '',
                fullName: firebaseUser.displayName ?? '',
                firstName: firebaseUser.displayName?.split(' ').first ?? '',
                lastName: (firebaseUser.displayName?.split(' ').length ?? 0) > 1 
                    ? firebaseUser.displayName!.split(' ').last 
                    : '',
                imageUrl: firebaseUser.photoURL ?? '',
                isAnonymous: false,
                createdAt: DateTime.now(),
                updatedAt: DateTime.now(),
              );

              // Create user in Chat and Firestore
              await FirebaseChatCore.instance.createUserInFirestore(
                types.User(
                  firstName: userModel.firstName,
                  lastName: userModel.lastName,
                  id: firebaseUser.uid,
                  imageUrl: userModel.imageUrl ?? '',
                ),
              );

              final createResult = await userRepository.createUserData(userModel).run();
              return createResult.match(
                (failure) {
                  FailureDialog.show(failure.message);
                  return false;
                },
                (success) {
                  if (success) {
                    validateNavigation(userModel);
                    return true;
                  } else {
                    FailureDialog.show("userDataNotSaved".tr);
                    return false;
                  }
                },
              );
            }
          },
        );
      }
      
      return false;
    } on GoogleSignInException catch (e) {
      String errorMessage = 'Google ile giriş başarısız';
      
      if (e.code == GoogleSignInExceptionCode.canceled) {
        // User canceled, don't show error
        return false;
      }
      
      // Handle other exception codes
      errorMessage = 'GoogleSignInException: ${e.code} - ${e.description}';
      
      FailureDialog.show(errorMessage);
      return false;
    } on FirebaseAuthException catch (e) {
      String errorMessage = 'Google ile giriş başarısız';
      
      switch (e.code) {
        case 'account-exists-with-different-credential':
          errorMessage = 'Bu e-posta adresi farklı bir yöntemle kayıtlı';
          break;
        case 'invalid-credential':
          errorMessage = 'Geçersiz kimlik bilgileri (Firebase)';
          break;
        case 'operation-not-allowed':
          errorMessage = 'Google ile giriş etkin değil';
          break;
        case 'user-disabled':
          errorMessage = 'Bu hesap devre dışı bırakılmış';
          break;
        default:
          errorMessage = e.message ?? 'Bilinmeyen hata oluştu';
      }
      
      FailureDialog.show(errorMessage);
      return false;
    } catch (e) {
      FailureDialog.show('Google ile giriş yaparken hata oluştu: $e');
      return false;
    }
  }

  // Apple Sign-In Method
  Future<bool> signInWithApple() async {
    try {
      // Generate random nonce for security
      final rawNonce = _generateNonce();
      final nonce = _sha256ofString(rawNonce);

      print('🍎 Starting Apple Sign-In...');
      print('   Raw Nonce: $rawNonce');
      print('   Hashed Nonce: $nonce');

      // Request Apple ID credential
      final appleCredential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
        nonce: nonce,
      );

      print('🍎 Apple ID Credential received');
      print('   Identity Token length: ${appleCredential.identityToken?.length}');
      print('   Authorization Code length: ${appleCredential.authorizationCode.length}');

      // Create OAuth credential for Firebase
      final oauthCredential = OAuthProvider("apple.com").credential(
        idToken: appleCredential.identityToken,
        rawNonce: rawNonce,
        accessToken: appleCredential.authorizationCode,
      );

      // Sign in to Firebase with Apple credential
      UserCredential userCredential = await _auth.signInWithCredential(oauthCredential);
      User? firebaseUser = userCredential.user;

      if (firebaseUser != null) {
        // Check if user exists in Firestore
        final result = await userRepository.readUserData(firebaseUser.uid).run();
        
        return result.match(
          (failure) {
            FailureDialog.show(failure.message);
            return false;
          },
          (existingUser) async {
            if (existingUser != null) {
              // Existing user - sign in
              final updatedUser = await _ensureUserHasRoles(existingUser);
              validateNavigation(updatedUser);
              return true;
            } else {
              // ── Account Linking: check if existing user by email ──
              final appleEmail = appleCredential.email ?? firebaseUser.email ?? '';
              final existingByEmail = await _findExistingUserByEmailOrPhone(
                appleEmail.isNotEmpty ? appleEmail : null,
                firebaseUser.phoneNumber,
                firebaseUser.uid,
              );
              if (existingByEmail != null) {
                String fullName = '';
                if (appleCredential.givenName != null || appleCredential.familyName != null) {
                  fullName = '${appleCredential.givenName ?? ''} ${appleCredential.familyName ?? ''}'.trim();
                }
                final migrated = await userRepository.migrateUserToNewUid(
                  existingByEmail.id!,
                  firebaseUser.uid,
                  additionalData: UserModel().copyWith(
                    email: appleEmail,
                    fullName: fullName.isNotEmpty ? fullName : firebaseUser.displayName ?? '',
                    firstName: appleCredential.givenName ?? '',
                    lastName: appleCredential.familyName ?? '',
                    imageUrl: firebaseUser.photoURL ?? '',
                  ),
                );
                if (migrated != null) {
                  await FirebaseChatCore.instance.createUserInFirestore(
                    types.User(
                      firstName: migrated.firstName,
                      lastName: migrated.lastName,
                      id: firebaseUser.uid,
                      imageUrl: migrated.imageUrl ?? '',
                    ),
                  );
                  final updated = await _ensureUserHasRoles(migrated);
                  await _refreshAndPersistFcmToken(updated);
                  validateNavigation(updated);
                  return true;
                }
              }
              // ── End Account Linking ──

              // New user - auto register
              // Combine first and last name from Apple
              String fullName = '';
              if (appleCredential.givenName != null || appleCredential.familyName != null) {
                fullName = '${appleCredential.givenName ?? ''} ${appleCredential.familyName ?? ''}'.trim();
              }

              final userModel = UserModel().copyWith(
                id: firebaseUser.uid,
                email: appleCredential.email ?? firebaseUser.email ?? '',
                fullName: fullName.isNotEmpty ? fullName : firebaseUser.displayName ?? '',
                firstName: appleCredential.givenName ?? firebaseUser.displayName?.split(' ').first ?? '',
                lastName: appleCredential.familyName ?? 
                    ((firebaseUser.displayName?.split(' ').length ?? 0) > 1 
                        ? firebaseUser.displayName!.split(' ').last 
                        : ''),
                imageUrl: firebaseUser.photoURL ?? '',
                createdAt: DateTime.now(),
                updatedAt: DateTime.now(),
              );

              // Create user in Chat
              await FirebaseChatCore.instance.createUserInFirestore(
                types.User(
                  firstName: userModel.firstName,
                  lastName: userModel.lastName,
                  id: firebaseUser.uid,
                  imageUrl: userModel.imageUrl,
                ),
              );

              // Save user to Firestore
              final createResult = await userRepository.createUserData(userModel).run();
              return createResult.match(
                (failure) {
                  FailureDialog.show(failure.message);
                  return false;
                },
                (success) async {
                  if (success) {
                    await _refreshAndPersistFcmToken(userModel);
                    // Handle pending invite code
                    try {
                      if (Get.isRegistered<StorageService>() && Get.isRegistered<ReferralService>()) {
                        final storage = Get.find<StorageService>();
                        final pending = storage.getPendingInviteCode();
                        if (pending != null) {
                          final referralService = Get.find<ReferralService>();
                          final inviterId = await referralService.repository.resolveInviterIdByCode(pending);
                          if (inviterId != null && inviterId != firebaseUser.uid) {
                            final existing = await referralService.repository.findReferral(inviterId, firebaseUser.uid);
                            if (existing == null) {
                              final refId = await referralService.createReferral(inviterId, firebaseUser.uid, code: pending);
                              await referralService.grantSignupEarningIfConfigured(inviterId: inviterId, referralId: refId);
                            }
                          }
                          await storage.clearPendingInviteCode();
                        }
                      }
                    } catch (_) {}
                    validateNavigation(userModel);
                    return true;
                  } else {
                    FailureDialog.show("userDataNotSaved".tr);
                    return false;
                  }
                },
              );
            }
          },
        );
      }
      
      return false;
    } on SignInWithAppleAuthorizationException catch (e) {
      String errorMessage = 'Apple ile giriş başarısız';
      
      switch (e.code) {
        case AuthorizationErrorCode.canceled:
          // User canceled, don't show error
          return false;
        case AuthorizationErrorCode.failed:
          errorMessage = 'Apple ile giriş başarısız oldu';
          break;
        case AuthorizationErrorCode.invalidResponse:
          errorMessage = 'Geçersiz Apple yanıtı';
          break;
        case AuthorizationErrorCode.notHandled:
          errorMessage = 'Apple girişi işlenemedi';
          break;
        case AuthorizationErrorCode.unknown:
          errorMessage = 'Bilinmeyen Apple giriş hatası';
          break;
        default:
          errorMessage = 'Apple ile giriş yaparken hata oluştu: ${e.code}';
      }
      
      FailureDialog.show(errorMessage);
      return false;
    } on FirebaseAuthException catch (e) {
      String errorMessage = 'Apple ile giriş başarısız';
      
      print('❌ Firebase Auth Error (Apple): ${e.code} - ${e.message}');
      
      switch (e.code) {
        case 'account-exists-with-different-credential':
          errorMessage = 'Bu e-posta adresi farklı bir yöntemle kayıtlı';
          break;
        case 'invalid-credential':
          errorMessage = 'Geçersiz kimlik bilgileri (Apple)';
          break;
        case 'operation-not-allowed':
          errorMessage = 'Apple ile giriş etkin değil';
          break;
        case 'user-disabled':
          errorMessage = 'Bu hesap devre dışı bırakılmış';
          break;
        default:
          errorMessage = e.message ?? 'Bilinmeyen hata oluştu';
      }
      
      FailureDialog.show(errorMessage);
      return false;
    } catch (e) {
      print('❌ General Error (Apple): $e');
      FailureDialog.show('Apple ile giriş yaparken hata oluştu: $e');
      return false;
    }
  }

  // Helper methods for Apple Sign-In
  String _generateNonce([int length = 32]) {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
    final random = Random.secure();
    return List.generate(length, (_) => charset[random.nextInt(charset.length)]).join();
  }

  String _sha256ofString(String input) {
    final bytes = utf8.encode(input);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  /// Check if current user has admin role
  /// Returns false if user is guest or not authenticated
  bool isUserAdmin() {
    if (isGuest.value || user.value.id == null) return false;
    return user.value.roles?.contains(RoleType.admin) ?? false;
  }

  /// Find an existing user by email or phone number for account linking.
  /// Returns the first match that has a different UID than [currentUid].
  Future<UserModel?> _findExistingUserByEmailOrPhone(
    String? email,
    String? phone,
    String currentUid,
  ) async {
    try {
      // Check by email first
      if (email != null && email.isNotEmpty) {
        final existing = await userRepository.findUserByEmail(email);
        if (existing != null && existing.id != currentUid) {
          print('🔗 Account linking: found existing user by email $email (${existing.id} → $currentUid)');
          return existing;
        }
      }
      // Check by phone
      if (phone != null && phone.isNotEmpty) {
        final existing = await userRepository.findUserByPhone(phone);
        if (existing != null && existing.id != currentUid) {
          print('🔗 Account linking: found existing user by phone $phone (${existing.id} → $currentUid)');
          return existing;
        }
      }
      return null;
    } catch (e) {
      print('⚠️ Account linking lookup error: $e');
      return null;
    }
  }

  /// Ensure user has roles assigned. If roles is null or empty, assign default 'user' role
  Future<UserModel> _ensureUserHasRoles(UserModel user) async {
    try {
      if (user.roles == null || user.roles!.isEmpty) {
        print('[AUTH] User ${user.id} has no roles, assigning default "user" role');
        final updatedUser = user.copyWith(
          roles: [RoleType.user],
          updatedAt: DateTime.now(),
        );
        final result = await userRepository.updateUserData(updatedUser).run();
        return result.match(
          (_) => user, // If update fails, return original
          (success) => success ? updatedUser : user,
        );
      }
      return user;
    } catch (e) {
      print('[AUTH] Error ensuring user roles: $e');
      return user;
    }
  }

  // Store / update user's withdrawal IBAN in metadata map
  Future<bool> saveIban(String iban) async {
    try {
      final normalized = iban.replaceAll(' ', '').toUpperCase();
      if (user.value.id == null) return false;
      final meta = Map<String, dynamic>.from(user.value.metadata ?? {});
      meta['withdrawIban'] = normalized;
      final updated = user.value.copyWith(metadata: meta, updatedAt: DateTime.now());
      final result = await userRepository.updateUserData(updated).run();
      final ok = result.match((_) => false, (r) => r);
      if (ok) user.value = updated; // refresh local reactive
      return ok;
    } catch (_) { return false; }
  }

  /// Delete user account completely
  /// Calls Firebase Function to remove Auth user, Firestore user doc, and all user-created data
  /// Returns success status
  Future<bool> deleteAccount() async {
    try {
      print('🗑️ Initiating account deletion...');
      
      // Call Firebase Callable Function
      final callable = FirebaseFunctions.instance.httpsCallable('deleteUserAccount');
      final result = await callable.call();
      
      final data = result.data as Map<String, dynamic>?;
      final success = data?['success'] as bool? ?? false;
      final message = data?['message'] as String? ?? 'Account deleted';
      
      print('🗑️ Account deletion result: success=$success, message=$message');
      
      if (success) {
        // Clear local user state
        user.value = UserModel();
        
        // Sign out from all providers
        await _auth.signOut();
        await _googleSignIn.signOut();
        
        return true;
      }
      
      return false;
    } on FirebaseFunctionsException catch (e) {
      print('❌ Firebase Function error: ${e.code} - ${e.message}');
      FailureDialog.show('Hesap silinirken hata: ${e.message}');
      return false;
    } catch (e) {
      print('❌ Account deletion error: $e');
      FailureDialog.show('Hesap silinemedi: $e');
      return false;
    }
  }
}
