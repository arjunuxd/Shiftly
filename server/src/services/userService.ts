import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import type { Role } from "../types/auth.js";

export interface UserDocument {
  uid: string;
  email: string;
  role: Role;
  status: "active";
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
