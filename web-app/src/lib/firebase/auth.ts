import { UserModel } from "@/types/user";
import {
    ConfirmationResult,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signInWithPopup,
} from "firebase/auth";
import { _recaptchaConfigReady, auth } from "./config";
import {
    createUser,
    findUserByEmail,
    findUserByPhone,
    getUserById,
    migrateUserToNewUid,
    updateUser,
} from "./firestore";

// Google Sign-In
export async function signInWithGoogle(): Promise<UserModel | null> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // 1. Check if user already exists by Firebase Auth UID
    let userData = await getUserById(user.uid);

    if (!userData) {
      // 2. Account linking: check if a user with the same email exists
      // (e.g., user registered with phone, added email to profile, now logs in with Google)
      const email = user.email;
      if (email) {
        const existingUser = await findUserByEmail(email);
        if (existingUser && existingUser.id !== user.uid) {
          // Found existing account - migrate data to new UID
          console.log(
            `🔗 Account linking: found existing user by email ${email} (${existingUser.id} → ${user.uid})`,
          );
          userData = await migrateUserToNewUid(existingUser.id, user.uid, {
            email: user.email || undefined,
            fullName: user.displayName || existingUser.fullName || undefined,
            imageUrl: user.photoURL || existingUser.imageUrl || undefined,
          });
        }
      }

      // 3. Also check by phone number if Google account has one
      if (!userData && user.phoneNumber) {
        const existingUser = await findUserByPhone(user.phoneNumber);
        if (existingUser && existingUser.id !== user.uid) {
          console.log(
            `🔗 Account linking: found existing user by phone ${user.phoneNumber} (${existingUser.id} → ${user.uid})`,
          );
          userData = await migrateUserToNewUid(existingUser.id, user.uid, {
            email: user.email || undefined,
            fullName: user.displayName || existingUser.fullName || undefined,
            imageUrl: user.photoURL || existingUser.imageUrl || undefined,
          });
        }
      }
    }

    if (!userData) {
      // 4. No existing account found - create brand new user
      const newUserData: Partial<UserModel> = {
        email: user.email || undefined,
        fullName: user.displayName || undefined,
        phoneNumber: user.phoneNumber || undefined,
        imageUrl: user.photoURL || undefined,
        roles: ["user"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await createUser(user.uid, newUserData);
      userData = await getUserById(user.uid);
    } else {
      // Update last seen and any new profile info from Google
      await updateUser(user.uid, {
        lastSeen: new Date(),
        ...(user.photoURL && !userData.imageUrl
          ? { imageUrl: user.photoURL }
          : {}),
        ...(user.displayName && !userData.fullName
          ? { fullName: user.displayName }
          : {}),
      });
      userData = await getUserById(user.uid);
    }

    return userData;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

// Phone Authentication - Step 1: Send OTP
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

/**
 * Creates and renders an invisible reCAPTCHA verifier.
 * Must be called and awaited before sending phone OTP.
 * With reCAPTCHA Enterprise enabled via initializeRecaptchaConfig(),
 * the invisible verifier works seamlessly in the background.
 */
export async function initRecaptcha(
  elementId: string = "recaptcha-container",
): Promise<RecaptchaVerifier> {
  // Clear any existing verifier
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      console.log("Clearing previous recaptcha failed:", e);
    }
    window.recaptchaVerifier = undefined;
  }

  // Ensure the anchor element exists in DOM
  let el = document.getElementById(elementId);
  if (!el) {
    el = document.createElement("div");
    el.id = elementId;
    document.body.appendChild(el);
  }

  // Wait for reCAPTCHA Enterprise config to be ready before creating verifier
  if (_recaptchaConfigReady) {
    await _recaptchaConfigReady;
  }

  try {
    const verifier = new RecaptchaVerifier(auth, elementId, {
      size: "invisible",
      callback: () => {
        console.log("✅ reCAPTCHA verified");
      },
      "expired-callback": () => {
        console.log("reCAPTCHA expired - will recreate on next send");
        window.recaptchaVerifier = undefined;
      },
    });

    // Explicitly render the verifier — this ensures the reCAPTCHA widget
    // is fully initialised and can generate a valid token.
    await verifier.render();
    console.log("✅ reCAPTCHA verifier rendered");

    window.recaptchaVerifier = verifier;
    return verifier;
  } catch (error) {
    console.error("Failed to initialize reCAPTCHA:", error);
    throw new Error("reCAPTCHA başlatılamadı. Lütfen sayfayı yenileyin.");
  }
}

export async function sendPhoneOTP(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier,
): Promise<ConfirmationResult> {
  try {
    // Phone number must be in E.164 format (+90XXXXXXXXXX)
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier,
    );
    return confirmationResult;
  } catch (error) {
    // On failure clear verifier so next attempt gets a fresh one
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (_) { /* ignore */ }
      window.recaptchaVerifier = undefined;
    }
    console.error("Error sending OTP:", error);
    throw error;
  }
}

// Phone Authentication - Step 2: Verify OTP
export async function verifyPhoneOTP(
  confirmationResult: ConfirmationResult,
  otp: string,
): Promise<UserModel | null> {
  try {
    const result = await confirmationResult.confirm(otp);
    const user = result.user;

    // 1. Check if user already exists by Firebase Auth UID
    let userData = await getUserById(user.uid);

    if (!userData) {
      // 2. Account linking: check if a user with the same phone number exists
      // (e.g., user registered with Google, added phone to profile, now logs in with phone)
      const phoneNumber = user.phoneNumber;
      if (phoneNumber) {
        const existingUser = await findUserByPhone(phoneNumber);
        if (existingUser && existingUser.id !== user.uid) {
          console.log(
            `🔗 Account linking: found existing user by phone ${phoneNumber} (${existingUser.id} → ${user.uid})`,
          );
          userData = await migrateUserToNewUid(existingUser.id, user.uid, {
            phoneNumber: phoneNumber,
          });
        }
      }

      // 3. Also check by email if the phone auth user has one
      if (!userData && user.email) {
        const existingUser = await findUserByEmail(user.email);
        if (existingUser && existingUser.id !== user.uid) {
          console.log(
            `🔗 Account linking: found existing user by email ${user.email} (${existingUser.id} → ${user.uid})`,
          );
          userData = await migrateUserToNewUid(existingUser.id, user.uid, {
            phoneNumber: user.phoneNumber || undefined,
          });
        }
      }
    }

    if (!userData) {
      // 4. No existing account found - create brand new user
      const newUserData: Partial<UserModel> = {
        phoneNumber: user.phoneNumber || undefined,
        roles: ["user"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await createUser(user.uid, newUserData);
      userData = await getUserById(user.uid);
    } else {
      // Update last seen
      await updateUser(user.uid, {
        lastSeen: new Date(),
      });
      userData = await getUserById(user.uid);
    }

    return userData;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
}

// Sign Out
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}
