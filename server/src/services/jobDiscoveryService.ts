import { getAdminFirestore } from "../config/firebaseAdmin.js";
import type { JobDocument, JobResponse } from "../types/job.js";
import type {
  JobDiscoveryFilters,
  JobDiscoveryMeta,
  JobDiscoveryItem,
} from "../types/jobDiscovery.js";

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

function applySorting(
  jobs: JobResponse[],
  sortBy: string | undefined,
): JobResponse[] {
  const sorted = [...jobs];

  switch (sortBy) {
    case "pay-high":
      sorted.sort((a, b) => b.rateAmount - a.rateAmount);
      break;
    case "pay-low":
      sorted.sort((a, b) => a.rateAmount - b.rateAmount);
      break;
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
): JobDiscoveryItem {
  const { vendorId: _, ...rest } = job;
  return {
    ...rest,
    vendorVerificationStatus: (verificationMap.get(
      job.vendorId,
    ) ?? "unverified") as JobDiscoveryItem["vendorVerificationStatus"],
  };
}

export async function getPublishedJobs(
  filters: JobDiscoveryFilters = {},
  pageToken?: string,
): Promise<{ jobs: JobDiscoveryItem[]; meta: JobDiscoveryMeta }> {
  const db = getAdminFirestore();
  let query = db
    .collection(JOBS_COLLECTION)
    .where("status", "==", "published")
    .where("moderationStatus", "!=", "removed")
    .orderBy("publishedAt", "desc");

  if (filters.jobCategory) {
    query = query.where("jobCategory", "==", filters.jobCategory);
  }
  if (filters.workType) {
    query = query.where("workType", "==", filters.workType);
  }

  const fetchLimit = PAGE_SIZE + 1;

  if (pageToken) {
    const startDoc = await db.collection(JOBS_COLLECTION).doc(pageToken).get();
    if (startDoc.exists) {
      query = query.startAfter(startDoc);
    }
  }

  query = query.limit(fetchLimit);

  const snapshot = await query.get();
  let jobs = snapshot.docs.map((doc) =>
    serializeJob(doc.id, doc.data() as JobDocument),
  );

  const hasMore = jobs.length > PAGE_SIZE;
  if (hasMore) {
    jobs = jobs.slice(0, PAGE_SIZE);
  }

  jobs = applyServerSideFilters(jobs, filters);
  jobs = applySorting(jobs, filters.sortBy);

  const vendIds = new Set(jobs.map((job) => job.vendorId));
  const verificationMap = await getVerificationMap(vendIds);

  let publicJobs = jobs.map((job) => toPublicJob(job, verificationMap));

  if (filters.verifiedOnly) {
    publicJobs = publicJobs.filter(
      (job) => job.vendorVerificationStatus === "approved",
    );
  }

  const lastDoc = snapshot.docs[hasMore ? PAGE_SIZE - 1 : snapshot.docs.length - 1];
  const nextPageToken = hasMore && lastDoc ? lastDoc.id : null;

  return {
    jobs: publicJobs,
    meta: {
      totalEstimate: publicJobs.length,
      hasMore: hasMore || publicJobs.length === PAGE_SIZE,
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
