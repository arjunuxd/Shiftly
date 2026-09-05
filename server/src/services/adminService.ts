import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore, getAdminAuth } from "../config/firebaseAdmin.js";
import { AppError } from "../middleware/errorHandler.js";
import type { AccountStatus } from "../types/admin.js";
import type { Role } from "../types/auth.js";
import { MAX_IN_MEMORY_FETCH, sortDocsDesc } from "./queryInMemory.js";

const USERS = "users";

interface AdminUserDocument {
  uid: string;
  email: string;
  role: Role;
  status: AccountStatus;
  suspendedAt: unknown | null;
  suspensionReason: string | null;
  suspendedBy: string | null;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface AdminUserResponse {
  uid: string;
  email: string;
  role: Role;
  status: AccountStatus;
  suspendedAt: string | null;
  suspensionReason: string | null;
  suspendedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

function toIso(v: unknown): string | null {
  if (v && typeof v === "object" && "toDate" in v) {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof v === "string") return v;
  return null;
}

function serializeUser(id: string, data: AdminUserDocument): AdminUserResponse {
  return {
    uid: id,
    email: data.email,
    role: data.role,
    status: data.status,
    suspendedAt: toIso(data.suspendedAt),
    suspensionReason: data.suspensionReason ?? null,
    suspendedBy: data.suspendedBy ?? null,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export async function getPlatformOverview(): Promise<{
  totalUsers: number;
  totalJobSeekers: number;
  totalVendors: number;
  totalSuperadmins: number;
  suspendedUsers: number;
  activeJobs: number;
  pendingVerifications: number;
  openReports: number;
}> {
  const db = getAdminFirestore();

  const [usersSnap, jobsSnap, reportsSnap] = await Promise.all([
    db.collection(USERS).get(),
    db.collection("jobs").where("status", "==", "published").count().get(),
    db.collection("reports").where("status", "==", "open").count().get(),
  ]);

  let totalJobSeekers = 0;
  let totalVendors = 0;
  let totalSuperadmins = 0;
  let suspendedUsers = 0;

  for (const doc of usersSnap.docs) {
    const data = doc.data() as AdminUserDocument;
    if (data.role === "job_seeker") totalJobSeekers++;
    else if (data.role === "vendor") totalVendors++;
    else if (data.role === "superadmin") totalSuperadmins++;
    if (data.status === "suspended") suspendedUsers++;
  }

  let pendingVerifications = 0;
  try {
    const [jsVerSnap, vVerSnap] = await Promise.all([
      db.collection("verifications").where("status", "==", "pending").count().get(),
      db.collection("vendorProfiles").where("verification.status", "==", "pending").count().get(),
    ]);
    pendingVerifications = jsVerSnap.data().count + vVerSnap.data().count;
  } catch {
    pendingVerifications = 0;
  }

  return {
    totalUsers: usersSnap.size,
    totalJobSeekers,
    totalVendors,
    totalSuperadmins,
    suspendedUsers,
    activeJobs: jobsSnap.data().count,
    pendingVerifications,
    openReports: reportsSnap.data().count,
  };
}

export async function getUsers(params: {
  role?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ users: AdminUserResponse[]; total: number }> {
  const db = getAdminFirestore();
  const { role, status, search, limit = 20, offset = 0 } = params;

  const snapshot = await db
    .collection(USERS)
    .limit(MAX_IN_MEMORY_FETCH)
    .get();

  const docs = sortDocsDesc(snapshot.docs, "createdAt");

  let users = docs.map((doc) =>
    serializeUser(doc.id, doc.data() as AdminUserDocument),
  );

  if (role && role !== "all") {
    users = users.filter((u) => u.role === role);
  }
  if (status && status !== "all") {
    users = users.filter((u) => u.status === status);
  }

  if (search && search.trim().length > 0) {
    const lower = search.toLowerCase().trim();
    users = users.filter(
      (u) =>
        u.email.toLowerCase().includes(lower) ||
        u.uid.toLowerCase().includes(lower),
    );
  }

  return {
    users: users.slice(offset, offset + limit),
    total: users.length,
  };
}

export async function getUserById(uid: string): Promise<AdminUserResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(USERS).doc(uid);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "User not found.");
  }

  return serializeUser(snapshot.id, snapshot.data() as AdminUserDocument);
}

export interface CreateAdminParams {
  email: string;
  password: string;
  displayName?: string;
}

export async function createAdmin(params: CreateAdminParams): Promise<AdminUserResponse> {
  const db = getAdminFirestore();
  const auth = getAdminAuth();

  const normalizedEmail = params.email.trim().toLowerCase();

  const existing = await auth.getUserByEmail(normalizedEmail).catch(() => null);
  if (existing) {
    throw new AppError(409, "A user with this email already exists.");
  }

  const record = await auth.createUser({
    email: normalizedEmail,
    password: params.password,
    displayName: params.displayName?.trim() || undefined,
    emailVerified: true,
  });

  await auth.setCustomUserClaims(record.uid, { role: "admin" });

  const now = FieldValue.serverTimestamp();
  await db.collection(USERS).doc(record.uid).set(
    {
      uid: record.uid,
      email: normalizedEmail,
      role: "admin",
      status: "active",
      suspendedAt: null,
      suspensionReason: null,
      suspendedBy: null,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );

  return {
    uid: record.uid,
    email: normalizedEmail,
    role: "admin" as Role,
    status: "active" as AccountStatus,
    suspendedAt: null,
    suspensionReason: null,
    suspendedBy: null,
    createdAt: null,
    updatedAt: null,
  };
}

export async function suspendUser(
  uid: string,
  adminId: string,
  reason: string,
): Promise<AdminUserResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(USERS).doc(uid);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "User not found.");
  }

  const data = snapshot.data() as AdminUserDocument;
  if (data.role === "superadmin") {
    throw new AppError(400, "Cannot suspend a superadmin.");
  }
  if (data.status === "suspended") {
    throw new AppError(400, "User is already suspended.");
  }

  const now = FieldValue.serverTimestamp();
  await ref.update({
    status: "suspended" as AccountStatus,
    suspendedAt: now,
    suspensionReason: reason,
    suspendedBy: adminId,
    updatedAt: now,
  });

  const updated = await ref.get();
  return serializeUser(updated.id, updated.data() as AdminUserDocument);
}

export async function restoreUser(
  uid: string,
): Promise<AdminUserResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(USERS).doc(uid);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "User not found.");
  }

  const data = snapshot.data() as AdminUserDocument;
  if (data.status !== "suspended") {
    throw new AppError(400, "User is not suspended.");
  }

  const now = FieldValue.serverTimestamp();
  await ref.update({
    status: "active" as AccountStatus,
    suspendedAt: null,
    suspensionReason: null,
    suspendedBy: null,
    updatedAt: now,
  });

  const updated = await ref.get();
  return serializeUser(updated.id, updated.data() as AdminUserDocument);
}
