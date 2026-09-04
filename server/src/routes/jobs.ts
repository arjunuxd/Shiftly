import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, requireRole, requireAccountActive } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  getJobsForVendor,
  getJob,
  createJob,
  updateJobFields,
  publishJob,
  closeJob,
} from "../services/jobService.js";
import {
  validateJobFields,
  validateJobStatusValue,
} from "../validation/job.js";
import type { JobRateType } from "../types/job.js";

const router = Router();

router.use(requireAuth, requireRole("vendor"));

async function loadOwnedJob(uid: string, jobId: string) {
  const job = await getJob(jobId);
  if (!job) {
    throw new AppError(404, "Job not found");
  }
  if (job.vendorId !== uid) {
    throw new AppError(403, "You do not own this job");
  }
  return job;
}

router.get(
  "/",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const jobs = await getJobsForVendor(user.uid);
    res.json(jobs);
  },
);

router.post(
  "/",
  requireAccountActive,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    const errors = validateJobFields(req.body);
    if (errors.length > 0) {
      throw new AppError(400, errors.map((e) => e.message).join("; "));
    }

    const body = req.body as Record<string, unknown>;

    const job = await createJob(user.uid, {
      title: body.title as string,
      description: body.description as string,
      jobCategory: body.jobCategory as string,
      workType: body.workType as string,
      rateType: body.rateType as JobRateType,
      rateAmount: body.rateAmount as number,
      location: body.location as {
        city: string;
        state: string;
        country: string;
        address: string;
      },
      startDate: (body.startDate as string) ?? "",
      endDate: (body.endDate as string) ?? "",
      shiftStart: (body.shiftStart as string) ?? "",
      shiftEnd: (body.shiftEnd as string) ?? "",
      spotsAvailable: (body.spotsAvailable as number) ?? 1,
    });

    res.status(201).json(job);
  },
);

router.patch(
  "/:jobId",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const jobId = String(req.params.jobId);
    const job = await loadOwnedJob(user.uid, jobId);

    if (job.status !== "draft") {
      throw new AppError(409, "Only draft jobs can be edited.");
    }

    const body = req.body as Record<string, unknown>;

    const errors = validateJobFields(req.body);
    if (errors.length > 0) {
      throw new AppError(400, errors.map((e) => e.message).join("; "));
    }

    if (body.status !== undefined && !validateJobStatusValue(body.status)) {
      throw new AppError(400, "Invalid status value.");
    }

    const allowedFields = [
      "title",
      "description",
      "jobCategory",
      "workType",
      "rateType",
      "rateAmount",
      "location",
      "startDate",
      "endDate",
      "shiftStart",
      "shiftEnd",
      "spotsAvailable",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const updated = await updateJobFields(
      jobId,
      user.uid,
      updates as Parameters<typeof updateJobFields>[2],
    );

    res.json(updated);
  },
);

router.post(
  "/:jobId/publish",
  requireAccountActive,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const jobId = String(req.params.jobId);
    await loadOwnedJob(user.uid, jobId);
    const updated = await publishJob(jobId, user.uid);
    res.json(updated);
  },
);

router.post(
  "/:jobId/close",
  requireAccountActive,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const jobId = String(req.params.jobId);
    await loadOwnedJob(user.uid, jobId);
    const updated = await closeJob(jobId, user.uid);
    res.json(updated);
  },
);

router.get(
  "/:jobId",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const job = await loadOwnedJob(user.uid, String(req.params.jobId));
    res.json(job);
  },
);

export default router;
