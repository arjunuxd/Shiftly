import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, requireRole, requireAccountActive } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  saveJob,
  unsaveJob,
  getSavedJobsForSeeker,
  isJobSaved,
} from "../services/savedJobService.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

const saveLimit = rateLimit({
  windowMs: 60_000,
  max: 40,
  keyPrefix: "saved-jobs",
});

router.use(requireAuth, requireRole("job_seeker"));

router.get(
  "/",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const saved = await getSavedJobsForSeeker(user.uid);
    res.json({ saved });
  },
);

router.get(
  "/:jobId",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const jobId = String(req.params.jobId);
    if (!jobId || jobId.length > 128) {
      throw new AppError(400, "Invalid job ID.");
    }
    const saved = await isJobSaved(user.uid, jobId);
    res.json({ saved });
  },
);

router.post(
  "/:jobId",
  requireAccountActive,
  saveLimit,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const jobId = String(req.params.jobId);
    if (!jobId || jobId.length > 128) {
      throw new AppError(400, "Invalid job ID.");
    }
    const item = await saveJob(user.uid, jobId);
    res.status(201).json(item);
  },
);

router.delete(
  "/:jobId",
  requireAccountActive,
  saveLimit,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const jobId = String(req.params.jobId);
    if (!jobId || jobId.length > 128) {
      throw new AppError(400, "Invalid job ID.");
    }
    await unsaveJob(user.uid, jobId);
    res.json({ saved: false });
  },
);

export default router;