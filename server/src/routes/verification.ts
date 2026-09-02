import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { requireRole } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  getVerificationStatus,
  submitVerification,
} from "../services/verificationService.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("job_seeker"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const verification = await getVerificationStatus(user.uid);

    res.json(verification ?? { status: "unverified" });
  },
);

router.post(
  "/",
  requireAuth,
  requireRole("job_seeker"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    const existing = await getVerificationStatus(user.uid);
    if (existing && existing.status === "pending") {
      throw new AppError(409, "Verification is already pending review.");
    }

    const verification = await submitVerification(user.uid);

    res.status(201).json(verification);
  },
);

export default router;
