import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import { AppError } from "../middleware/errorHandler.js";
import type { VendorVerificationStatus } from "../types/vendorProfile.js";

const VENDOR_PROFILES = "vendorProfiles";

interface VendorProfileDocument {
  businessInfo: {
    businessName: string;
    businessType: string;
    description: string;
    website: string;
    phone: string;
    contactEmail: string;
  };
  location: {
    city: string;
    state: string;
    country: string;
    address: string;
  };
  verification: {
    status: VendorVerificationStatus;
    submittedAt: unknown | null;
    reviewedAt: unknown | null;
    rejectionReason: string | null;
  };
  createdAt: unknown;
  updatedAt: unknown;
}

export interface VendorVerificationResponse {
  id: string;
  businessName: string;
  businessType: string;
  city: string;
  country: string;
  status: VendorVerificationStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

function toIso(v: unknown): string | null {
  if (v && typeof v === "object" && "toDate" in v) {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof v === "string") return v;
  return null;
}

function serializeVendorVerification(
  id: string,
  data: VendorProfileDocument,
): VendorVerificationResponse {
  return {
    id,
    businessName: data.businessInfo.businessName,
    businessType: data.businessInfo.businessType,
    city: data.location.city,
    country: data.location.country,
    status: data.verification.status,
    submittedAt: toIso(data.verification.submittedAt),
    reviewedAt: toIso(data.verification.reviewedAt),
    rejectionReason: data.verification.rejectionReason ?? null,
  };
}

export async function getPendingVendorVerifications(): Promise<VendorVerificationResponse[]> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(VENDOR_PROFILES)
    .where("verification.status", "==", "pending")
    .get();

  return snapshot.docs.map((doc) =>
    serializeVendorVerification(doc.id, doc.data() as VendorProfileDocument),
  );
}

export async function getAllVendorVerifications(
  status?: string,
): Promise<VendorVerificationResponse[]> {
  const db = getAdminFirestore();
  let query: FirebaseFirestore.Query = db.collection(VENDOR_PROFILES);

  if (status && status !== "all") {
    query = query.where("verification.status", "==", status);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) =>
    serializeVendorVerification(doc.id, doc.data() as VendorProfileDocument),
  );
}

export async function approveVendorVerification(
  uid: string,
  _adminId: string,
): Promise<VendorVerificationResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(VENDOR_PROFILES).doc(uid);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "Vendor profile not found.");
  }

  const data = snapshot.data() as VendorProfileDocument;
  if (data.verification.status !== "pending") {
    throw new AppError(400, `Cannot approve a verification with status "${data.verification.status}".`);
  }

  const now = FieldValue.serverTimestamp();
  await ref.update({
    "verification.status": "approved" as VendorVerificationStatus,
    "verification.reviewedAt": now,
    "verification.rejectionReason": null,
    updatedAt: now,
  });

  const updated = await ref.get();
  return serializeVendorVerification(uid, updated.data() as VendorProfileDocument);
}

export async function rejectVendorVerification(
  uid: string,
  _adminId: string,
  reason: string,
): Promise<VendorVerificationResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(VENDOR_PROFILES).doc(uid);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new AppError(404, "Vendor profile not found.");
  }

  const data = snapshot.data() as VendorProfileDocument;
  if (data.verification.status !== "pending") {
    throw new AppError(400, `Cannot reject a verification with status "${data.verification.status}".`);
  }

  const now = FieldValue.serverTimestamp();
  await ref.update({
    "verification.status": "rejected" as VendorVerificationStatus,
    "verification.reviewedAt": now,
    "verification.rejectionReason": reason,
    updatedAt: now,
  });

  const updated = await ref.get();
  return serializeVendorVerification(uid, updated.data() as VendorProfileDocument);
}
