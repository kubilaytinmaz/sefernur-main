import 'package:firebase_auth/firebase_auth.dart';
import 'package:fpdart/fpdart.dart';
import 'package:get/get.dart';

import '../../../dev_utils/dev_utils.dart';
import '../../../utils/utils.dart';
import '../../providers/providers.dart';

class AuthRepository {
  final DioApi dioApi;
  final FirebaseApi firebaseApi;

  AuthRepository(this.dioApi, this.firebaseApi);

  /// --------------------------> User Firebase Authentication
  TaskEither<ServerFailure, User> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) {
    return TaskEither.tryCatch(
      () async {
        final userCredential = await FirebaseAuth.instance.signInWithEmailAndPassword(
          email: email, 
          password: password,
        );

        if (userCredential.user != null && userCredential.user!.emailVerified) {
          cprint(
            'Sign in: $email', 
            event: "user_sign_in", 
            parameter: {"email": email}
          );
          return userCredential.user!;
        } else {
          throw FirebaseAuthException(
            code: 'email-not-verified',
            message: "pleaseVerifyYourEmailAddress".tr,
          );
        }
      },
      (e, _) => ServerFailure(
        message: ErrorHandler.handle(e).message,
        statusCode: ErrorHandler.handle(e).statusCode,
      ),
    );
  }

  /// --------------------------> User Firebase Register
  TaskEither<ServerFailure, User> signUpWithEmailAndPassword({
    required String email,
    required String password,
  }) {
    return TaskEither.tryCatch(() async {
      final userCredential = await FirebaseAuth.instance.createUserWithEmailAndPassword(
        email: email, 
        password: password,
      );

      await userCredential.user!.sendEmailVerification();

      cprint(
        'Sign up: $email', 
        event: "user_sign_up", 
        parameter: {"email": email}
      );

      if (userCredential.user != null) {
        return userCredential.user!;
      } else {
        throw FirebaseAuthException(
          code: 'user-not-created',
          message: "userCouldNotBeCreated".tr,
        );
      }
    }, (e, _) => ServerFailure(
      message: ErrorHandler.handle(e).message,
      statusCode: ErrorHandler.handle(e).statusCode,
    ));
  }

  /// --------------------------> User Firebase Logout
  Future signOut() async {
    try {
      await FirebaseAuth.instance.signOut();
    } catch (e) {
      cprint(
        'Sign Out ${e.toString()}', 
        errorIn: "AuthRepository -> signOut"
      );
    }
  }
}