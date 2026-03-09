import { rolesFromFirestore, rolesToFirestore, UserModel } from "@/types/user";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    QueryConstraint,
    setDoc,
    Timestamp,
    updateDoc,
    where
} from "firebase/firestore";
import { db } from "./config";

// Firestore collection paths
export const COLLECTIONS = {
  USERS: "users",
  RESERVATIONS: "reservations",
  VISA_APPLICATIONS: "visaApplications",
  CAMPAIGNS: "campaigns",
  PLACES: "places",
  BLOGS: "blogs",
  NOTIFICATIONS: "notifications",
  REVIEWS: "reviews",
  REFERRALS: "referrals",
  REFERRAL_EARNINGS: "referralEarnings",
  CONTACT_MESSAGES: "contactMessages",
  TOURS: "tours",
  TRANSFERS: "transfers",
  HOTELS: "hotels",
  CARS: "cars",
  GUIDES: "guides",
  PROMOTIONS: "promotions",
  SITE_SETTINGS: "siteSettings",
} as const;

// Helper to convert Firestore Timestamp to Date
export function timestampToDate(timestamp: unknown): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (
    typeof timestamp === "object" &&
    timestamp !== null &&
    "toDate" in timestamp &&
    typeof (timestamp as { toDate?: unknown }).toDate === "function"
  ) {
    return (timestamp as { toDate: () => Date }).toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === "string" || typeof timestamp === "number") {
    return new Date(timestamp);
  }
  return new Date();
}

// Helper to convert Date to Firestore Timestamp
export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

// Convert raw Firestore doc data to UserModel (centralises roles int→string conversion)
function firestoreDataToUser(id: string, data: Record<string, unknown>): UserModel {
  return {
    id,
    ...data,
    roles: rolesFromFirestore(data.roles),
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    lastSeen: data.lastSeen ? timestampToDate(data.lastSeen) : undefined,
  } as UserModel;
}

// User operations
export async function getUserById(userId: string): Promise<UserModel | null> {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (!userDoc.exists()) return null;

    return firestoreDataToUser(userDoc.id, userDoc.data() as Record<string, unknown>);
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function createUser(
  userId: string,
  userData: Partial<UserModel>,
): Promise<void> {
  const now = new Date();
  // Strip undefined values — Firestore rejects them
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(userData)) {
    if (v !== undefined) clean[k] = v;
  }
  // Convert roles from string[] to int[] for mobile compatibility
  if (clean.roles) {
    clean.roles = rolesToFirestore(clean.roles as import("@/types/user").RoleType[]);
  }
  await setDoc(doc(db, COLLECTIONS.USERS, userId), {
    ...clean,
    createdAt: dateToTimestamp(now),
    updatedAt: dateToTimestamp(now),
  });
}

export async function updateUser(
  userId: string,
  userData: Partial<UserModel>,
): Promise<void> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(userData)) {
    if (v !== undefined) clean[k] = v;
  }
  // Convert roles from string[] to int[] for mobile compatibility
  if (clean.roles) {
    clean.roles = rolesToFirestore(clean.roles as import("@/types/user").RoleType[]);
  }
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    ...clean,
    updatedAt: dateToTimestamp(new Date()),
  });
}

// Generic query helper
export async function queryDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
): Promise<T[]> {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    return [];
  }
}

// Find user by email (for cross-provider account linking)
export async function findUserByEmail(
  email: string,
): Promise<UserModel | null> {
  if (!email) return null;
  try {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where("email", "==", email),
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const userDoc = snapshot.docs[0];
    return firestoreDataToUser(userDoc.id, userDoc.data() as Record<string, unknown>);
  } catch (error) {
    console.error("Error finding user by email:", error);
    return null;
  }
}

// Find user by phone number (for cross-provider account linking)
export async function findUserByPhone(
  phoneNumber: string,
): Promise<UserModel | null> {
  if (!phoneNumber) return null;
  try {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where("phoneNumber", "==", phoneNumber),
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const userDoc = snapshot.docs[0];
    return firestoreDataToUser(userDoc.id, userDoc.data() as Record<string, unknown>);
  } catch (error) {
    console.error("Error finding user by phone:", error);
    return null;
  }
}

// Migrate existing user data to a new Firebase Auth UID (account linking)
// When a user logs in with a different provider, their existing Firestore data
// is copied to the new UID and the old document is marked as merged.
export async function migrateUserToNewUid(
  oldUserId: string,
  newUserId: string,
  additionalData?: Partial<UserModel>,
): Promise<UserModel | null> {
  try {
    const oldUser = await getUserById(oldUserId);
    if (!oldUser) return null;

    // Merge: old data as base, overlay non-empty new data
    const mergedData: Record<string, unknown> = { ...oldUser };
    delete mergedData.id;

    // Overlay additional data (e.g. Google profile info) only if non-empty
    if (additionalData) {
      for (const [key, value] of Object.entries(additionalData)) {
        if (value !== undefined && value !== null && value !== "") {
          mergedData[key] = value;
        }
      }
    }

    // Ensure roles are stored as int[] for mobile compatibility
    if (mergedData.roles) {
      const roles = mergedData.roles;
      if (Array.isArray(roles) && roles.length > 0 && typeof roles[0] === "string") {
        mergedData.roles = rolesToFirestore(roles as import("@/types/user").RoleType[]);
      }
    }

    // Preserve original createdAt, update updatedAt
    const createdAt =
      oldUser.createdAt instanceof Date ? oldUser.createdAt : new Date();
    mergedData.createdAt = dateToTimestamp(createdAt);
    mergedData.updatedAt = dateToTimestamp(new Date());

    // Track previous UIDs for reference
    const previousUids: string[] = Array.isArray(mergedData.previousUids)
      ? (mergedData.previousUids as string[])
      : [];
    if (!previousUids.includes(oldUserId)) {
      previousUids.push(oldUserId);
    }
    mergedData.previousUids = previousUids;

    // Create new document with merged data
    await setDoc(doc(db, COLLECTIONS.USERS, newUserId), mergedData);

    // Mark old document as merged (don't delete - safer for data integrity)
    await updateDoc(doc(db, COLLECTIONS.USERS, oldUserId), {
      mergedInto: newUserId,
      active: false,
      updatedAt: dateToTimestamp(new Date()),
    });

    console.log(
      `✅ User migrated: ${oldUserId} → ${newUserId} (account linking)`,
    );
    return getUserById(newUserId);
  } catch (error) {
    console.error("Error migrating user to new UID:", error);
    return null;
  }
}
