import { getAdminFirestore } from "../config/firebaseAdmin.js";
import type { JobDocument, JobResponse } from "../types/job.js";
import type {
  JobDiscoveryFilters,
  JobDiscoveryMeta,
  JobDiscoveryItem,
} from "../types/jobDiscovery.js";
import { MAX_IN_MEMORY_FETCH } from "./queryInMemory.js";

const JOBS_COLLECTION = "jobs";
const VENDOR_PROFILES_COLLECTION = "vendorProfiles";
const PAGE_SIZE = 20;

function serializeJob(id: string, data: JobDocument): JobResponse {
  const toIso = (v: unknown): string | null =>
    v && typeof v === "object" && "toDate" in v
      ? (v as { toDate: () => Date }).toDate().toISOString()
      : null;

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

function matchesTextSearch(job: JobResponse, search: string): boolean {
  const lower = search.toLowerCase();
  return (
    job.title.toLowerCase().includes(lower) ||
    job.jobCategory.toLowerCase().includes(lower) ||
    job.location.city.toLowerCase().includes(lower) ||
    job.location.state.toLowerCase().includes(lower) ||
    (job.location.area ?? "").toLowerCase().includes(lower) ||
    job.description.toLowerCase().includes(lower)
  );
}

function applyServerSideFilters(
  jobs: JobResponse[],
  filters: JobDiscoveryFilters,
): JobResponse[] {
  let result = jobs;

  if (filters.search && filters.search.trim().length > 0) {
    result = result.filter((job) => matchesTextSearch(job, filters.search!));
  }

  if (filters.rateType) {
    result = result.filter((job) => job.rateType === filters.rateType);
  }

  if (filters.minPay !== undefined && filters.minPay > 0) {
    result = result.filter((job) => job.rateAmount >= filters.minPay!);
  }

  if (filters.city && filters.city.trim().length > 0) {
    const cityLower = filters.city.toLowerCase().trim();
    result = result.filter((job) =>
      job.location.city.toLowerCase().includes(cityLower),
    );
  }

  if (filters.state && filters.state.trim().length > 0) {
    const stateLower = filters.state.toLowerCase().trim();
    result = result.filter((job) =>
      job.location.state.toLowerCase().includes(stateLower),
    );
  }

  if (filters.area && filters.area.trim().length > 0) {
    const areaLower = filters.area.toLowerCase().trim();
    result = result.filter((job) =>
      (job.location.area ?? "").toLowerCase().includes(areaLower),
    );
  }

  return result;
}

function locationScore(
  job: JobResponse,
  hint: { city?: string; state?: string },
): number {
  const jobCity = job.location.city.toLowerCase().trim();
  const jobState = job.location.state.toLowerCase().trim();
  const hintCity = (hint.city ?? "").toLowerCase().trim();
  const hintState = (hint.state ?? "").toLowerCase().trim();
  if (hintCity && hintState && jobCity === hintCity && jobState === hintState) return 0;
  if (hintCity && jobCity === hintCity) return 1;
  if (hintState && jobState === hintState) return 2;
  if (hintCity && jobCity.includes(hintCity)) return 3;
  if (hintState && jobState.includes(hintState)) return 4;
  return 5;
}

function applySorting(
  jobs: JobResponse[],
  sortBy: string | undefined,
  locationHint?: { city?: string; state?: string },
): JobResponse[] {
  const sorted = [...jobs];

  switch (sortBy) {
    case "pay-high":
      sorted.sort((a, b) => b.rateAmount - a.rateAmount);
      break;
    case "pay-low":
      sorted.sort((a, b) => a.rateAmount - b.rateAmount);
      break;
    case "location": {
      const byNewest = (a: JobResponse, b: JobResponse) =>
        (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
      if (locationHint && (locationHint.city || locationHint.state)) {
        sorted.sort((a, b) => {
          const scoreDiff = locationScore(a, locationHint) - locationScore(b, locationHint);
          if (scoreDiff !== 0) return scoreDiff;
          return byNewest(a, b);
        });
      } else {
        sorted.sort(byNewest);
      }
      break;
    }
    case "newest":
    default:
      sorted.sort((a, b) => {
        const aDate = a.publishedAt ?? "";
        const bDate = b.publishedAt ?? "";
        return bDate.localeCompare(aDate);
      });
      break;
  }

  return sorted;
}

async function getVerificationMap(
  vendorIds: Set<string>,
): Promise<Map<string, string>> {
  if (vendorIds.size === 0) {
    return new Map();
  }
  const db = getAdminFirestore();
  const map = new Map<string, string>();
  const BATCH = 30;
  const ids = Array.from(vendorIds);
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const snapshot = await db
      .collection(VENDOR_PROFILES_COLLECTION)
      .where("__name__", "in", chunk)
      .select("verification.status")
      .get();
    for (const doc of snapshot.docs) {
      const data = doc.data() as {
        verification?: { status?: string };
      };
      map.set(
        doc.id,
        data.verification?.status ?? "unverified",
      );
    }
  }
  // Any vendorId not found defaults to unverified
  for (const id of ids) {
    if (!map.has(id)) {
      map.set(id, "unverified");
    }
  }
  return map;
}

function toPublicJob(
  job: JobResponse,
  verificationMap: Map<string, string>,
  location?: { lat?: number; lng?: number },
): JobDiscoveryItem {
  const { vendorId: _, ...rest } = job;
  let distanceKm: number | null = null;
  if (
    location &&
    typeof location.lat === "number" &&
    typeof location.lng === "number" &&
    typeof job.location.latitude === "number" &&
    typeof job.location.longitude === "number"
  ) {
    distanceKm = haversineKm(
      location.lat,
      location.lng,
      job.location.latitude,
      job.location.longitude,
    );
  }
  return {
    ...rest,
    vendorVerificationStatus: (verificationMap.get(
      job.vendorId,
    ) ?? "unverified") as JobDiscoveryItem["vendorVerificationStatus"],
    distanceKm,
  };
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getPublishedJobs(
  filters: JobDiscoveryFilters = {},
  pageToken?: string,
): Promise<{ jobs: JobDiscoveryItem[]; meta: JobDiscoveryMeta }> {
  const db = getAdminFirestore();

  // Composite queries (equality + orderBy / inequality) require composite
  // Firestore indexes. To avoid depending on manually-created indexes, fetch
  // with a single-field equality filter and filter/sort/page in memory.
  const snapshot = await db
    .collection(JOBS_COLLECTION)
    .where("status", "==", "published")
    .limit(MAX_IN_MEMORY_FETCH)
    .get();

  let jobs: JobResponse[] = [];
  for (const doc of snapshot.docs) {
    const data = doc.data() as JobDocument & {
      moderationStatus?: string;
    };
    if (data.moderationStatus === "removed") {
      continue;
    }
    jobs.push(serializeJob(doc.id, data));
  }

  if (filters.jobCategory) {
    jobs = jobs.filter((job) => job.jobCategory === filters.jobCategory);
  }
  if (filters.workType) {
    jobs = jobs.filter((job) => job.workType === filters.workType);
  }

  jobs = applyServerSideFilters(jobs, filters);
  jobs = applySorting(jobs, filters.sortBy, filters.locationHint);

  const vendIds = new Set(jobs.map((job) => job.vendorId));
  const verificationMap = await getVerificationMap(vendIds);

  const locationCoords =
    typeof filters.lat === "number" && typeof filters.lng === "number"
      ? { lat: filters.lat, lng: filters.lng }
      : undefined;
  let publicJobs = jobs.map((job) =>
    toPublicJob(job, verificationMap, locationCoords),
  );

  if (locationCoords) {
    publicJobs = publicJobs.filter(
      (job) => typeof job.distanceKm === "number",
    );
    publicJobs.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }

  if (filters.verifiedOnly) {
    publicJobs = publicJobs.filter(
      (job) => job.vendorVerificationStatus === "approved",
    );
  }

  let startIndex = 0;
  if (pageToken) {
    const cursorIndex = publicJobs.findIndex((job) => job.id === pageToken);
    if (cursorIndex !== -1) {
      startIndex = cursorIndex + 1;
    }
  }

  const page = publicJobs.slice(startIndex, startIndex + PAGE_SIZE);
  const hasMore = startIndex + PAGE_SIZE < publicJobs.length;
  const nextPageToken =
    hasMore && page.length > 0 ? page[page.length - 1].id : null;

  return {
    jobs: page,
    meta: {
      totalEstimate: page.length,
      hasMore,
      nextPageToken,
    },
  };
}

export async function getPublishedJob(
  jobId: string,
): Promise<JobDiscoveryItem | null> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(JOBS_COLLECTION).doc(jobId).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data() as JobDocument;
  if (data.status !== "published") {
    return null;
  }

  const moderationStatus = (data as unknown as { moderationStatus?: string }).moderationStatus;
  if (moderationStatus === "removed") {
    return null;
  }

  const job = serializeJob(snapshot.id, data);
  const verificationMap = await getVerificationMap(new Set([job.vendorId]));
  return toPublicJob(job, verificationMap);
}
