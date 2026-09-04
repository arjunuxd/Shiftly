import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import type { Role } from "../types/auth.js";
import type { AccountStatus } from "../types/admin.js";

export interface UserDocument {
  uid: string;
  email: string;
  role: Role;
  status: AccountStatus;
  suspendedAt: unknown | null;
  suspensionReason: string | null;
  suspendedBy: string | null;
  createdAt: ReturnType<typeof FieldValue.serverTimestamp>;
  updatedAt: ReturnType<typeof FieldValue.serverTimestamp>;
}

export async function createUserDocument(
  uid: string,
  email: string,
  role: Role,
): Promise<void> {
  const db = getAdminFirestore();
  const ref = db.collection("users").doc(uid);

  const now = FieldValue.serverTimestamp();

  await ref.set(
    {
      uid,
      email,
      role,
      status: "active",
      suspendedAt: null,
      suspensionReason: null,
      suspendedBy: null,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function getUserDocument(
  uid: string,
): Promise<UserDocument | null> {
  const db = getAdminFirestore();
  const snapshot = await db.collection("users").doc(uid).get();
  if (!snapshot.exists) {
    return null;
  }
  return snapshot.data() as UserDocument;
}

export async function isUserActive(uid: string): Promise<boolean> {
  const doc = await getUserDocument(uid);
  if (!doc) return true;
  return doc.status !== "suspended";
}
