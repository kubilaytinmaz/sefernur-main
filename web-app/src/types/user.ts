// Converted from lib/app/data/models/user/user_model.dart

export type RoleType = "user" | "agent" | "moderator" | "admin";

// Must match mobile enum order: enum RoleType { admin=0, agent=1, moderator=2, user=3 }
const ROLE_INT_ORDER: RoleType[] = ["admin", "agent", "moderator", "user"];

const ROLE_STRING_TO_INT: Record<RoleType, number> = {
  admin: 0,
  agent: 1,
  moderator: 2,
  user: 3,
};

/** Convert web string roles to Firestore int array (mobile compat) */
export function rolesToFirestore(roles?: RoleType[]): number[] | undefined {
  if (!roles || roles.length === 0) return undefined;
  return roles.map((r) => ROLE_STRING_TO_INT[r] ?? 3); // default to "user"=3
}

/** Convert Firestore roles (int[] or string[]) to web string array */
export function rolesFromFirestore(roles: unknown): RoleType[] {
  if (!roles) return ["user"];
  if (Array.isArray(roles)) {
    return roles.map((r) => {
      if (typeof r === "number") return ROLE_INT_ORDER[r] ?? "user";
      if (typeof r === "string" && ["admin", "agent", "moderator", "user"].includes(r))
        return r as RoleType;
      return "user";
    });
  }
  // Firestore can store single int as non-array
  if (typeof roles === "number") return [ROLE_INT_ORDER[roles] ?? "user"];
  return ["user"];
}

export interface UserModel {
  id: string;
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  imageUrl?: string;
  roles: RoleType[];
  fcmToken?: string;
  fcmTokens?: string[];
  metadata?: Record<string, unknown>;
  referralCode?: string;
  createdAt: Date;
  updatedAt: Date;
  lastSeen?: Date;
}

export interface CreateUserData {
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  imageUrl?: string;
  roles?: RoleType[];
  referralCode?: string;
}
