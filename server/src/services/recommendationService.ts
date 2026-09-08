import { getAdminFirestore } from "../config/firebaseAdmin.js";
import type { JobDocument, JobResponse } from "../types/job.js";
import type { ProfileDocument } from "../types/profile.js";
import type { JobDiscoveryItem } from "../types/jobDiscovery.js";
import { MAX_IN_MEMORY_FETCH } from "./queryInMemory.js";

const JOBS_COLLECTION = "jobs";
const VENDOR_PROFILES_COLLECTION = "vendorProfiles";
const PROFILES_COLLECTION = "profiles";

function toIso(v: unknown): string | null {
  if (v && typeof v === "object" && "toDate" in v) {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

function serializeJob(id: string, data: JobDocument): JobResponse {
  return {
    id,
    vendorId: data.vendorId,
    title: data.title,
    description: data.description,
    jobCategory: data.jobCategory,
    workType: data.workType,
    rateType: data.rateType,
    rateAmount: data.rateAmount,
    requiredSkills: data.requiredSkills ?? undefined,
    location: data.location,
    startDate: data.startDate,
    endDate: data.endDate,
    shiftStart: data.shiftStart,
    shiftEnd: data.shiftEnd,
    spotsAvailable: data.spotsAvailable,
    status: data.status,
    publishedAt: toIso(data.publishedAt),
    closedAt: toIso(data.closedAt),
  };
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function dayOfWeek(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return DAYS[d.getDay()];
}

function timeToMinutes(time: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function timesOverlap(
  jobStart: string,
  jobEnd: string,
  availStart: string,
  availEnd: string,
): boolean {
  const js = timeToMinutes(jobStart);
  const je = timeToMinutes(jobEnd);
  const as = timeToMinutes(availStart);
  const ae = timeToMinutes(availEnd);
  if (js === null || je === null || as === null || ae === null) return false;
  return js < ae && as < je;
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number | null {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface MatchReason {
  kind:
    | "location"
    | "availability"
    | "category"
    | "work-type"
    | "skills"
    | "pay";
  text: string;
}

export interface RecommendedJob extends JobDiscoveryItem {
  matchScore: number;
  matchesAvailability: boolean;
  matchesSkills: number;
  totalSkills: number;
  distanceKm: number | null;
  reasons: MatchReason[];
}

function computeMatch(
  job: JobResponse,
  profile: ProfileDocument,
): { score: number; reasons: MatchReason[]; matchesAvailability: boolean; matchesSkills: number; totalSkills: number; distanceKm: number | null } {
  const reasons: MatchReason[] = [];
  const city = profile.location?.city?.trim().toLowerCase();
  const state = profile.location?.state?.trim().toLowerCase();
  const jobCity = job.location.city?.trim().toLowerCase();
  const jobState = job.location.state?.trim().toLowerCase();

  let score = 0;

  if (
    city &&
    jobCity &&
    state &&
    jobState &&
    city === jobCity &&
    state === jobState
  ) {
    score += 20;
    reasons.push({ kind: "location", text: "In your city" });
  } else if (city && jobCity && city === jobCity) {
    score += 15;
    reasons.push({ kind: "location", text: "Matches your preferred location" });
  } else if (state && jobState && state === jobState) {
    score += 8;
    reasons.push({ kind: "location", text: "In your state" });
  }

  const prefs = profile.workPreferences;
  if (prefs) {
    if ((prefs.jobCategories ?? []).includes(job.jobCategory)) {
      score += 15;
      reasons.push({ kind: "category", text: "Matches your preferred job type" });
    }
    if ((prefs.workTypes ?? []).includes(job.workType)) {
      score += 10;
      reasons.push({ kind: "work-type", text: "Fits your preferred work type" });
    }
  }

  let matchesAvailability = false;
  const availability = Array.isArray(profile.availability) ? profile.availability : [];
  const jobDay = job.startDate ? dayOfWeek(job.startDate) : "";
  const hasShiftHours = Boolean(job.shiftStart && job.shiftEnd);
  if (jobDay && availability.length > 0) {
    const dayRange = availability.filter(
      (a) => a && typeof a === "object" && a.day === jobDay,
    );
    if (dayRange.length > 0) {
      if (!hasShiftHours) {
        matchesAvailability = true;
      } else if (
        dayRange.some((a) => timesOverlap(job.shiftStart!, job.shiftEnd!, a.startTime, a.endTime))
      ) {
        matchesAvailability = true;
      }
    }
  }

  if (matchesAvailability) {
    score += 25;
    reasons.push({ kind: "availability", text: "Matches your availability" });
  }

  const jobSkills = Array.isArray(job.requiredSkills)
    ? job.requiredSkills.filter((s): s is string => typeof s === "string")
    : [];
  const userSkills = (profile.skills ?? []).map((s) =>
    (s.name ?? "").trim().toLowerCase(),
  );
  const matchedSkillNames = jobSkills.filter((skill) =>
    userSkills.includes(skill.trim().toLowerCase()),
  );
  const matchesSkills = matchedSkillNames.length;
  const totalSkills = jobSkills.length;
  if (totalSkills > 0) {
    const ratio = matchesSkills / totalSkills;
    if (matchesSkills > 0) {
      score += Math.round(15 * ratio);
      reasons.push({
        kind: "skills",
        text: `Matches ${matchesSkills} of ${totalSkills} required skill${totalSkills === 1 ? "" : "s"}`,
      });
    }
  }

  if (typeof job.rateAmount === "number" && job.rateAmount >= 15) {
    score += 5;
    reasons.push({ kind: "pay", text: "Competitive pay" });
  }

  const pLat = profile.location?.latitude;
  const pLng = profile.location?.longitude;
  const jLat = job.location.latitude;
  const jLng = job.location.longitude;
  let distanceKm: number | null = null;
  if (
    typeof pLat === "number" &&
    typeof pLng === "number" &&
    typeof jLat === "number" &&
    typeof jLng === "number"
  ) {
    distanceKm = haversineKm(pLat, pLng, jLat, jLng);
  }

  return {
    score,
    reasons,
    matchesAvailability,
    matchesSkills,
    totalSkills,
    distanceKm,
  };
}

async function getVerificationMap(
  vendorIds: Set<string>,
): Promise<Map<string, string>> {
  if (vendorIds.size === 0) return new Map();
  const db = getAdminFirestore();
  const map = new Map<string, string>();
  const ids = Array.from(vendorIds);
  const BATCH = 30;
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const snapshot = await db
      .collection(VENDOR_PROFILES_COLLECTION)
      .where("__name__", "in", chunk)
      .select("verification.status")
      .get();
    for (const doc of snapshot.docs) {
      const data = doc.data() as { verification?: { status?: string } };
      map.set(doc.id, data.verification?.status ?? "unverified");
    }
  }
  return map;
}

export async function getRecommendedJobs(
  jobSeekerId: string,
  limit = 6,
): Promise<RecommendedJob[]> {
  const db = getAdminFirestore();
  const profileSnapshot = await db
    .collection(PROFILES_COLLECTION)
    .doc(jobSeekerId)
    .get();
  if (!profileSnapshot.exists) {
    return [];
  }
  const profile = profileSnapshot.data() as ProfileDocument;
  const profileReady =
    profile.personalInfo?.fullName?.trim() &&
    (profile.location?.city?.trim() || profile.workPreferences?.jobCategories?.length > 0 || (profile.skills ?? []).length > 0);
  if (!profileReady) {
    return [];
  }

  const snapshot = await db
    .collection(JOBS_COLLECTION)
    .where("status", "==", "published")
    .limit(MAX_IN_MEMORY_FETCH)
    .get();

  const jobs: JobResponse[] = [];
  for (const doc of snapshot.docs) {
    const data = doc.data() as JobDocument & { moderationStatus?: string };
    if (data.moderationStatus === "removed") continue;
    jobs.push(serializeJob(doc.id, data));
  }

  const evaluations = jobs
    .map((job) => ({ job, ...computeMatch(job, profile) }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (evaluations.length === 0) return [];

  const vendIds = new Set(evaluations.map((e) => e.job.vendorId));
  const verificationMap = await getVerificationMap(vendIds);

  return evaluations.map((item) => {
    const { vendorId: _vendorId, ...base } = item.job as JobResponse & {
      id: string;
    };
    const isVerified =
      verificationMap.get(item.job.vendorId) ?? "unverified";
    return {
      ...base,
      vendorVerificationStatus: isVerified,
      matchScore: item.score,
      matchesAvailability: item.matchesAvailability,
      matchesSkills: item.matchesSkills,
      totalSkills: item.totalSkills,
      distanceKm: item.distanceKm,
      reasons: item.reasons,
    } as RecommendedJob;
  });
}