import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import type {
  JobAlertPreferences,
  JobAlertPreferencesResponse,
} from "../types/jobAlert.js";
import type { JobResponse } from "../types/job.js";
import { createNotification } from "./notificationService.js";
import { MAX_IN_MEMORY_FETCH } from "./queryInMemory.js";

const COLLECTION = "jobAlertPreferences";

function serialize(
  data: JobAlertPreferences,
): JobAlertPreferencesResponse {
  return {
    userId: data.userId,
    enabled: data.enabled ?? false,
    locationCity: data.locationCity ?? "",
    locationState: data.locationState ?? "",
    jobCategories: Array.isArray(data.jobCategories) ? data.jobCategories : [],
    workTypes: Array.isArray(data.workTypes) ? data.workTypes : [],
    minRate: typeof data.minRate === "number" ? data.minRate : null,
  };
}

export async function getPreferences(
  userId: string,
): Promise<JobAlertPreferencesResponse | null> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(COLLECTION).doc(userId).get();
  if (!snapshot.exists) {
    return null;
  }
  const data = snapshot.data() as JobAlertPreferences;
  return serialize(data as JobAlertPreferences);
}

export async function savePreferences(
  userId: string,
  prefs: Partial<
    Pick<
      JobAlertPreferences,
      "enabled" | "locationCity" | "locationState" | "jobCategories" | "workTypes" | "minRate"
    >
  >,
): Promise<JobAlertPreferencesResponse> {
  const db = getAdminFirestore();
  const ref = db.collection(COLLECTION).doc(userId);
  const existing = await ref.get();

  if (existing.exists) {
    const current = existing.data() as JobAlertPreferences;
    const merged: JobAlertPreferences = {
      userId,
      enabled: prefs.enabled ?? current.enabled ?? false,
      locationCity: prefs.locationCity ?? current.locationCity ?? "",
      locationState: prefs.locationState ?? current.locationState ?? "",
      jobCategories: prefs.jobCategories ?? current.jobCategories ?? [],
      workTypes: prefs.workTypes ?? current.workTypes ?? [],
      minRate: prefs.minRate !== undefined ? prefs.minRate : (current.minRate ?? null),
      createdAt: current.createdAt,
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.update({
      enabled: merged.enabled,
      locationCity: merged.locationCity,
      locationState: merged.locationState,
      jobCategories: merged.jobCategories,
      workTypes: merged.workTypes,
      minRate: merged.minRate,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return serialize(merged);
  }

  const doc: JobAlertPreferences = {
    userId,
    enabled: prefs.enabled ?? false,
    locationCity: prefs.locationCity ?? "",
    locationState: prefs.locationState ?? "",
    jobCategories: prefs.jobCategories ?? [],
    workTypes: prefs.workTypes ?? [],
    minRate: prefs.minRate ?? null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await ref.set(doc);
  return serialize(doc as JobAlertPreferences);
}

export async function deletePreferences(userId: string): Promise<void> {
  const db = getAdminFirestore();
  await db.collection(COLLECTION).doc(userId).delete();
}

function jobMatchesPreferences(
  job: JobResponse,
  prefs: JobAlertPreferences,
): boolean {
  if (!prefs.enabled) {
    return false;
  }
  const city = prefs.locationCity?.trim().toLowerCase();
  const state = prefs.locationState?.trim().toLowerCase();
  const jobCity = job.location.city?.trim().toLowerCase() ?? "";
  const jobState = job.location.state?.trim().toLowerCase() ?? "";

  if (city && jobCity && jobCity !== city) {
    return false;
  }
  if (state && jobState && jobState !== state) {
    return false;
  }
  if (
    Array.isArray(prefs.jobCategories) &&
    prefs.jobCategories.length > 0 &&
    !prefs.jobCategories.includes(job.jobCategory)
  ) {
    return false;
  }
  if (
    Array.isArray(prefs.workTypes) &&
    prefs.workTypes.length > 0 &&
    !prefs.workTypes.includes(job.workType)
  ) {
    return false;
  }
  if (
    typeof prefs.minRate === "number" &&
    prefs.minRate > 0 &&
    job.rateAmount < prefs.minRate
  ) {
    return false;
  }
  return true;
}

export async function notifyMatchingSeekersForJob(
  job: JobResponse,
  limit = 25,
): Promise<number> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where("enabled", "==", true)
    .limit(MAX_IN_MEMORY_FETCH)
    .get();

  const matches: JobAlertPreferences[] = [];
  for (const doc of snapshot.docs) {
    const data = doc.data() as JobAlertPreferences;
    if (jobMatchesPreferences(job, data)) {
      matches.push(data);
      if (matches.length >= limit) {
        break;
      }
    }
  }

  let created = 0;
  for (const prefs of matches) {
    await createNotification({
      recipientId: prefs.userId,
      type: "JOB_MATCHED",
      title: "New shift matching your preferences",
      body: `"${job.title}" is now open in ${job.location.city}, ${job.location.state}.`,
      actorId: job.vendorId,
      data: { jobId: job.id },
    });
    created += 1;
  }

  return created;
}