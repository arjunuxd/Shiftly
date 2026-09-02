import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import type {
  VendorProfileDocument,
  VendorProfileResponse,
  VendorVerificationStatus,
} from "../types/vendorProfile.js";

const COLLECTION = "vendorProfiles";

function serializeVerification(verification: {
  status: VendorVerificationStatus;
  submittedAt: unknown | null;
  reviewedAt: unknown | null;
  rejectionReason: string | null;
}): VendorProfileResponse["verification"] {
  return {
    status: verification.status,
    submittedAt:
      verification.submittedAt &&
      typeof verification.submittedAt === "object" &&
      "toDate" in verification.submittedAt
        ? (verification.submittedAt as { toDate: () => Date }).toDate().toISOString()
        : null,
    reviewedAt:
      verification.reviewedAt &&
      typeof verification.reviewedAt === "object" &&
      "toDate" in verification.reviewedAt
        ? (verification.reviewedAt as { toDate: () => Date }).toDate().toISOString()
        : null,
    rejectionReason: verification.rejectionReason ?? null,
  };
}

export async function getVendorProfile(uid: string): Promise<VendorProfileResponse | null> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(COLLECTION).doc(uid).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data() as VendorProfileDocument;

  return {
    id: uid,
    businessInfo: data.businessInfo,
    location: data.location,
    verification: serializeVerification(data.verification),
    completeness: calculateCompleteness(data),
  };
}

function newVerification(): VendorProfileDocument["verification"] {
  return {
    status: "unverified",
    submittedAt: null,
    reviewedAt: null,
    rejectionReason: null,
  };
}

export async function createVendorProfile(
  uid: string,
  data: Omit<VendorProfileDocument, "createdAt" | "updatedAt" | "verification">,
): Promise<VendorProfileResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(uid);

  const now = FieldValue.serverTimestamp();

  const doc: VendorProfileDocument = {
    ...data,
    verification: {
      ...newVerification(),
      status: "unverified" as VendorVerificationStatus,
    },
    createdAt: now,
    updatedAt: now,
  };

  await ref.set(doc);

  return {
    id: uid,
    businessInfo: data.businessInfo,
    location: data.location,
    verification: {
      status: "unverified",
      submittedAt: null,
      reviewedAt: null,
      rejectionReason: null,
    },
    completeness: calculateCompleteness(doc),
  };
}

export async function updateVendorProfile(
  uid: string,
  updates: Partial<VendorProfileDocument>,
): Promise<VendorProfileResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(uid);

  const existing = await ref.get();
  if (!existing.exists) {
    throw new Error("Vendor profile not found");
  }

  const { createdAt: _ca, updatedAt: _ua, verification: _v, ...safeUpdates } =
    updates as VendorProfileDocument & Record<string, unknown>;

  await ref.update({
    ...safeUpdates,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await ref.get();
  const data = updated.data() as VendorProfileDocument;

  return {
    id: uid,
    businessInfo: data.businessInfo,
    location: data.location,
    verification: serializeVerification(data.verification),
    completeness: calculateCompleteness(data),
  };
}

export function calculateCompleteness(profile: {
  businessInfo?: {
    businessName?: string;
    businessType?: string;
    description?: string;
    website?: string;
    phone?: string;
    contactEmail?: string;
  };
  location?: { city?: string; state?: string; country?: string; address?: string };
}): number {
  let score = 0;

  const bi = profile.businessInfo;
  if (bi) {
    if (bi.businessName && bi.businessName.trim().length > 0) score += 30;
    if (bi.businessType && bi.businessType.trim().length > 0) score += 15;
    if (bi.description && bi.description.trim().length > 0) score += 15;
    if (bi.phone && bi.phone.trim().length > 0) score += 5;
    if (bi.contactEmail && bi.contactEmail.trim().length > 0) score += 5;
    if (bi.website && bi.website.trim().length > 0) score += 5;
  }

  const loc = profile.location;
  if (loc) {
    if (loc.city && loc.state && loc.country) score += 20;
    else if (loc.city && loc.country) score += 15;
    else if (loc.city) score += 10;
  }

  return Math.min(score, 100);
}
