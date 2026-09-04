import { getAdminFirestore } from "../config/firebaseAdmin.js";
import type { JobDocument, JobResponse } from "../types/job.js";
import type {
  JobDiscoveryFilters,
  JobDiscoveryMeta,
} from "../types/jobDiscovery.js";

const JOBS_COLLECTION = "jobs";
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

function toPublicJob(job: JobResponse) {
  const { vendorId: _, ...rest } = job;
  return rest;
}

function matchesTextSearch(job: JobResponse, search: string): boolean {
  const lower = search.toLowerCase();
  return (
    job.title.toLowerCase().includes(lower) ||
    job.jobCategory.toLowerCase().includes(lower) ||
    job.location.city.toLowerCase().includes(lower) ||
    job.location.state.toLowerCase().includes(lower) ||
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

export async function getPublishedJobs(
  filters: JobDiscoveryFilters = {},
  pageToken?: string,
): Promise<{ jobs: ReturnType<typeof toPublicJob>[]; meta: JobDiscoveryMeta }> {
  const db = getAdminFirestore();
  let query = db
    .collection(JOBS_COLLECTION)
    .where("status", "==", "published")
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

  const lastDoc = snapshot.docs[hasMore ? PAGE_SIZE - 1 : snapshot.docs.length - 1];
  const nextPageToken = hasMore && lastDoc ? lastDoc.id : null;

  return {
    jobs: jobs.map(toPublicJob),
    meta: {
      totalEstimate: jobs.length,
      hasMore: hasMore || jobs.length === PAGE_SIZE,
      nextPageToken,
    },
  };
}

export async function getPublishedJob(
  jobId: string,
): Promise<ReturnType<typeof toPublicJob> | null> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(JOBS_COLLECTION).doc(jobId).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data() as JobDocument;
  if (data.status !== "published") {
    return null;
  }

  const job = serializeJob(snapshot.id, data);
  return toPublicJob(job);
}
