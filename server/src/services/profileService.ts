import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import type {
  ProfileDocument,
  ProfileResponse,
} from "../types/profile.js";

const PROFILES_COLLECTION = "profiles";

export async function getProfile(uid: string): Promise<ProfileResponse | null> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(PROFILES_COLLECTION).doc(uid).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data() as ProfileDocument;
  return {
    id: uid,
    headline: data.headline ?? "",
    personalInfo: data.personalInfo,
    skills: data.skills,
    experience: data.experience,
    education: data.education,
    availability: data.availability,
    workPreferences: data.workPreferences,
    location: data.location,
    photoUrl: data.photoUrl ?? null,
    resumeUrl: data.resumeUrl ?? null,
    resumeName: data.resumeName ?? null,
    certificates: data.certificates ?? [],
    portfolioLinks: data.portfolioLinks ?? [],
    completeness: calculateCompleteness(data),
  };
}

export async function createProfile(
  uid: string,
  data: Omit<ProfileDocument, "createdAt" | "updatedAt">,
): Promise<ProfileResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(PROFILES_COLLECTION).doc(uid);

  const now = FieldValue.serverTimestamp();

  const doc: ProfileDocument = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await ref.set(doc);

  return {
    id: uid,
    ...data,
    photoUrl: data.photoUrl ?? null,
    resumeUrl: data.resumeUrl ?? null,
    resumeName: data.resumeName ?? null,
    certificates: data.certificates ?? [],
    portfolioLinks: data.portfolioLinks ?? [],
    completeness: calculateCompleteness(data),
  } as ProfileResponse;
}

export async function updateProfile(
  uid: string,
  updates: Partial<ProfileDocument>,
): Promise<ProfileResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(PROFILES_COLLECTION).doc(uid);

  const existing = await ref.get();
  if (!existing.exists) {
    throw new Error("Profile not found");
  }

  const { createdAt: _ca, updatedAt: _ua, ...safeUpdates } = updates as ProfileDocument & Record<string, unknown>;

  await ref.update({
    ...safeUpdates,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await ref.get();
  const data = updated.data() as ProfileDocument;

  return {
    id: uid,
    headline: data.headline ?? "",
    personalInfo: data.personalInfo,
    skills: data.skills,
    experience: data.experience,
    education: data.education,
    availability: data.availability,
    workPreferences: data.workPreferences,
    location: data.location,
    photoUrl: data.photoUrl ?? null,
    resumeUrl: data.resumeUrl ?? null,
    resumeName: data.resumeName ?? null,
    certificates: data.certificates ?? [],
    portfolioLinks: data.portfolioLinks ?? [],
    completeness: calculateCompleteness(data),
  };
}

export function calculateCompleteness(profile: {
  headline?: string;
  personalInfo?: { fullName?: string; bio?: string };
  skills?: unknown[];
  experience?: unknown[];
  education?: unknown[];
  availability?: unknown[];
  workPreferences?: { jobCategories?: unknown[]; workTypes?: unknown[] };
  location?: { city?: string; state?: string; country?: string };
  photoUrl?: string | null;
  resumeUrl?: string | null;
  certificates?: unknown[];
  portfolioLinks?: unknown[];
}): number {
  let score = 0;

  if (profile.personalInfo?.fullName && profile.personalInfo.fullName.trim().length > 0) {
    score += 15;
  }
  if (profile.headline && profile.headline.trim().length > 0) {
    score += 5;
  }
  if (profile.personalInfo?.bio && profile.personalInfo.bio.trim().length > 0) {
    score += 5;
  }

  if (profile.resumeUrl && profile.resumeUrl.trim().length > 0) {
    score += 10;
  }
  if (Array.isArray(profile.certificates) && profile.certificates.length > 0) {
    score += 5;
  }
  if (Array.isArray(profile.portfolioLinks) && profile.portfolioLinks.length > 0) {
    score += 5;
  }

  if (Array.isArray(profile.skills) && profile.skills.length > 0) {
    score += 15;
  }

  if (Array.isArray(profile.experience) && profile.experience.length > 0) {
    score += 15;
  }

  if (Array.isArray(profile.education) && profile.education.length > 0) {
    score += 10;
  }

  if (Array.isArray(profile.availability) && profile.availability.length > 0) {
    score += 5;
  }

  const wp = profile.workPreferences;
  if (wp) {
    if (Array.isArray(wp.jobCategories) && wp.jobCategories.length > 0) score += 5;
    if (Array.isArray(wp.workTypes) && wp.workTypes.length > 0) score += 2;
  }

  const loc = profile.location;
  if (loc?.city && loc.city.trim().length > 0 && loc.country && loc.country.trim().length > 0) {
    score += 3;
  }

  return Math.min(score, 100);
}
