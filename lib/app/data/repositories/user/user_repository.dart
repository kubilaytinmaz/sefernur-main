import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:fpdart/fpdart.dart';
import 'package:get/get.dart';

import '../../../dev_utils/dev_utils.dart';
import '../../../utils/utils.dart';
import '../../models/models.dart';
import '../../providers/providers.dart';

class UserRepository {
  final DioApi dioApi;
  final FirebaseApi firebaseApi;

  UserRepository(this.dioApi, this.firebaseApi);
  
  // ----------------------------> Firebase Storage
  Stream<UserModel> streamUserData(String uid) {
    return firebaseApi.documentStream<UserModel>(
      path: FirestorePaths.userDocument(uid),
      builder: (snapshotData, snapshotId) {
        snapshotData!['id'] = snapshotId;
        return UserModel.fromJson(snapshotData);
      },
    );
  }

  Stream<List<UserModel>> streamUserCollection({
    String? uid,
  }) {
    final result = firebaseApi.collectionStream<UserModel>(
      path: FirestorePaths.userCollection(),
      queryBuilder: (query) {
        if (uid != null) {
          query = query.where('id', isEqualTo: uid);
        }
        return query;
      },
      builder: (snapshotData, snapshotId) {
        snapshotData!['id'] = snapshotId;
        return UserModel.fromJson(snapshotData);
      },
    );
    return result;
  }

  // ----------------------------> Firestore CRUD
  TaskEither<ServerFailure, UserModel?> readUserData(String userId) {
    return firebaseApi.readData<UserModel?>(
      path: FirestorePaths.userDocument(userId),
      builder: (data, docId) {
        cprint('Get user data: $userId');
        if (data != null) {
          data['id'] = docId;
          return UserModel.fromJson(data);
        } else {
          return null;
        }
      },
    );
  }

  TaskEither<ServerFailure, bool> createUserData(UserModel userModel) {
    return firebaseApi.createData<bool>(
      path: FirestorePaths.userDocument(userModel.id!),
      data: userModel.toJson(),
      builder: (data) {
        cprint(
          'Create user data: ${userModel.id}', 
          event: "create_new_user", 
          parameter: {"userId": userModel.id},
        );
        return true;
      },
    );
  }

  TaskEither<ServerFailure, bool> updateUserData(UserModel userData) {
    return firebaseApi.updateData<bool>(
      path: FirestorePaths.userDocument(userData.id!),
      data: userData.toJson(),
      builder: (data) {
        cprint('Update user data: ${userData.id}');
        return true;
      },
    );
  }

  // ----------------------------> Firebase Storage
  TaskEither<ServerFailure, bool> updateUserImage(File? imageFile, String uId) {
    if (imageFile == null) {
      return TaskEither.left(
        ServerFailure(
          message: "noFileProvided".tr, 
          statusCode: 400
        )
      );
    }

    return firebaseApi.uploadFile<String>(
      path: FirestorePaths.profilesImagesPath(uId),
      file: imageFile,
      builder: (data) => data,
    ).flatMap((imageUrl) {
      return updateUserImageData(imageUrl, uId);
    });
  }

  TaskEither<ServerFailure, bool> updateUserImageData(String imageUrl, String uId) {
    return firebaseApi.updateData<bool>(
      path: FirestorePaths.userDocument(uId),
      data: {"photoUrl": imageUrl},
      builder: (data) {
        cprint('Update user image: $imageUrl');
        return true;
      },
    );
  }

  // ----------------------------> Account Linking (Cross-Provider)

  /// Find a user by email address (for account linking across providers)
  Future<UserModel?> findUserByEmail(String email) async {
    if (email.isEmpty) return null;
    try {
      final result = await firebaseApi.readCollectionData<UserModel?>(
        path: FirestorePaths.userCollection(),
        queryBuilder: (query) => query.where('email', isEqualTo: email).limit(1),
        builder: (docs) {
          if (docs == null || docs.isEmpty) return null;
          final data = docs.first.data();
          data['id'] = docs.first.id;
          return UserModel.fromJson(data);
        },
      ).run();
      return result.match((_) => null, (user) => user);
    } catch (e) {
      cprint('Error finding user by email: $e');
      return null;
    }
  }

  /// Find a user by phone number (for account linking across providers)
  Future<UserModel?> findUserByPhone(String phoneNumber) async {
    if (phoneNumber.isEmpty) return null;
    try {
      final result = await firebaseApi.readCollectionData<UserModel?>(
        path: FirestorePaths.userCollection(),
        queryBuilder: (query) => query.where('phoneNumber', isEqualTo: phoneNumber).limit(1),
        builder: (docs) {
          if (docs == null || docs.isEmpty) return null;
          final data = docs.first.data();
          data['id'] = docs.first.id;
          return UserModel.fromJson(data);
        },
      ).run();
      return result.match((_) => null, (user) => user);
    } catch (e) {
      cprint('Error finding user by phone: $e');
      return null;
    }
  }

  /// Migrate an existing user's data to a new Firebase Auth UID.
  /// Used when a user logs in with a different auth provider.
  /// Copies all data from old UID doc to new UID doc and marks old doc as merged.
  Future<UserModel?> migrateUserToNewUid(
    String oldUserId,
    String newUserId, {
    UserModel? additionalData,
  }) async {
    try {
      final readResult = await readUserData(oldUserId).run();
      final oldUser = readResult.match((_) => null, (user) => user);
      if (oldUser == null) return null;

      // Merge: old user data as base, overlay non-empty new data
      final mergedUser = oldUser.copyWith(
        id: newUserId,
        email: (additionalData?.email?.isNotEmpty == true)
            ? additionalData!.email
            : oldUser.email,
        fullName: (additionalData?.fullName?.isNotEmpty == true)
            ? additionalData!.fullName
            : oldUser.fullName,
        firstName: (additionalData?.firstName?.isNotEmpty == true)
            ? additionalData!.firstName
            : oldUser.firstName,
        lastName: (additionalData?.lastName?.isNotEmpty == true)
            ? additionalData!.lastName
            : oldUser.lastName,
        phoneNumber: (additionalData?.phoneNumber?.isNotEmpty == true)
            ? additionalData!.phoneNumber
            : oldUser.phoneNumber,
        imageUrl: (additionalData?.imageUrl?.isNotEmpty == true)
            ? additionalData!.imageUrl
            : oldUser.imageUrl,
        // Preserve original roles and createdAt
        roles: oldUser.roles,
        createdAt: oldUser.createdAt,
        updatedAt: DateTime.now(),
      );

      // Create new document with merged data
      final createResult = await createUserData(mergedUser).run();
      final created = createResult.match((_) => false, (ok) => ok);
      if (!created) return null;

      // Mark old document as merged (don't delete for safety)
      try {
        final firestore = FirebaseFirestore.instance;
        await firestore.doc(FirestorePaths.userDocument(oldUserId)).update({
          'mergedInto': newUserId,
          'active': false,
          'updatedAt': FieldValue.serverTimestamp(),
        });
      } catch (_) {}

      cprint('✅ User migrated: $oldUserId → $newUserId (account linking)');
      return mergedUser;
    } catch (e) {
      cprint('Error migrating user to new UID: $e');
      return null;
    }
  }
}