import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import { AppError } from "../middleware/errorHandler.js";
import type { ApplicationDocument } from "../types/application.js";
import { getJob } from "./jobService.js";
import { createNotification } from "./notificationService.js";

const REVIEWS_COLLECTION = "reviews";
const APPLICATIONS_COLLECTION = "applications";

function makeReviewId(applicationId: string, reviewerId: string): string {
  return `${applicationId}_${reviewerId}`;
}

export interface ReputationSummary {
  averageRating: number | null;
  ratingCount: number;
  completedJobs: number;
  repeatHires: number;
  verifiedState: string;
}

// ─── Reviews ────────────────────────────────────────────────

export async function createReview(input: {
  reviewerId: string;
  reviewerRole: "vendor" | "job_seeker";
  applicationId: string;
  rating: number;
  comment: string;
}): Promise<{ id: string; rating: number; comment: string }> {
  const db = getAdminFirestore();
  const appRef = db.collection(APPLICATIONS_COLLECTION).doc(input.applicationId);
  const appSnapshot = await appRef.get();

  if (!appSnapshot.exists) {
    throw new AppError(404, "Application not found.");
  }

  const app = appSnapshot.data() as ApplicationDocument;
  if (app.status !== "completed") {
    throw new AppError(
      400,
      "Reviews can only be given after the work is marked complete.",
    );
  }

  const involved =
    input.reviewerRole === "vendor"
      ? app.vendorId === input.reviewerId
      : app.jobSeekerId === input.reviewerId;
  if (!involved) {
    throw new AppError(403, "You are not part of this application.");
  }

  const revieweeId =
    input.reviewerRole === "vendor" ? app.jobSeekerId : app.vendorId;

  const reviewId = makeReviewId(input.applicationId, input.reviewerId);
  const ref = db.collection(REVIEWS_COLLECTION).doc(reviewId);
  if ((await ref.get()).exists) {
    throw new AppError(409, "You have already reviewed this experience.");
  }

  const doc = {
    applicationId: input.applicationId,
    jobId: app.jobId,
    reviewerId: input.reviewerId,
    reviewerRole: input.reviewerRole,
    revieweeId,
    rating: input.rating,
    comment: input.comment ?? "",
    createdAt: FieldValue.serverTimestamp(),
  };

  await ref.set(doc);

  const job = await getJob(app.jobId);
  await createNotification({
    recipientId: revieweeId,
    type: "REVIEW_RECEIVED",
    title: "You received a rating",
    body:
      input.reviewerRole === "vendor"
        ? `An employer rated your work on "${job?.title ?? "a shift"}".`
        : `A worker rated your hiring on "${job?.title ?? "a shift"}".`,
    actorId: input.reviewerId,
    data: {
      jobId: app.jobId,
      applicationId: input.applicationId,
      rating: input.rating,
    },
  });

  return {
    id: reviewId,
    rating: input.rating,
    comment: input.comment ?? "",
  };
}

export async function getReputationForUser(userId: string): Promise<ReputationSummary> {
  const db = getAdminFirestore();
  const [reviewsSnapshot, appsSnapshot] = await Promise.all([
    db
      .collection(REVIEWS_COLLECTION)
      .where("revieweeId", "==", userId)
      .limit(100)
      .get(),
    db
      .collection(APPLICATIONS_COLLECTION)
      .where("jobSeekerId", "==", userId)
      .limit(2000)
      .get(),
  ]);

  let total = 0;
  let count = 0;
  for (const doc of reviewsSnapshot.docs) {
    const rating = doc.data().rating;
    if (typeof rating === "number") {
      total += rating;
      count += 1;
    }
  }
  const averageRating = count > 0 ? total / count : null;

  const completeJobIds = new Set<string>();
  let completedJobs = 0;
  for (const doc of appsSnapshot.docs) {
    const status = doc.data().status;
    if (status === "completed") {
      completedJobs += 1;
      completeJobIds.add(doc.data().jobId);
    }
  }

  const completedAppsSnapshot = await db
    .collection(APPLICATIONS_COLLECTION)
    .where("jobSeekerId", "==", userId)
    .where("status", "==", "completed")
    .limit(2000)
    .get();

  const vendorIds = new Set<string>();
  for (const doc of completedAppsSnapshot.docs) {
    const vendorId = doc.data().vendorId;
    if (typeof vendorId === "string") vendorIds.add(vendorId);
  }

  let repeatHires = 0;
  if (vendorIds.size > 0) {
    const BATCH = 30;
    const ids = Array.from(vendorIds);
    for (let i = 0; i < ids.length; i += BATCH) {
      const chunk = ids.slice(i, i + BATCH);
      const vendorDocs = await db
        .collection(APPLICATIONS_COLLECTION)
        .where("vendorId", "in", chunk)
        .where("jobSeekerId", "==", userId)
        .where("status", "==", "completed")
        .get();
      const perVendor = new Map<string, number>();
      for (const doc of vendorDocs.docs) {
        const vendorId = doc.data().vendorId;
        perVendor.set(vendorId, (perVendor.get(vendorId) ?? 0) + 1);
      }
      for (const [, n] of perVendor) {
        if (n > 1) repeatHires += 1;
      }
    }
  }

  return {
    averageRating,
    ratingCount: count,
    completedJobs,
    repeatHires,
    verifiedState: "",
  };
}

export async function hasWorkedWithVendor(
  jobSeekerId: string,
  vendorId: string,
): Promise<boolean> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(APPLICATIONS_COLLECTION)
    .where("jobSeekerId", "==", jobSeekerId)
    .where("vendorId", "==", vendorId)
    .where("status", "in", ["accepted", "hired", "completed"])
    .limit(1)
    .get();
  return snapshot.size > 0;
}

export async function getCompletedJobsWithVendor(
  jobSeekerId: string,
  vendorId: string,
): Promise<number> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(APPLICATIONS_COLLECTION)
    .where("jobSeekerId", "==", jobSeekerId)
    .where("vendorId", "==", vendorId)
    .where("status", "==", "completed")
    .get();
  return snapshot.size;
}