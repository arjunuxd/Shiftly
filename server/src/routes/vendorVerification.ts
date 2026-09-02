import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { submitVendorVerification } from "../services/vendorVerificationService.js";
import { getVendorProfile } from "../services/vendorProfileService.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("vendor"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const profile = await getVendorProfile(user.uid);

    res.json({
      status: profile?.verification.status ?? "unverified",
      submittedAt: profile?.verification.submittedAt ?? null,
      reviewedAt: profile?.verification.reviewedAt ?? null,
      rejectionReason: profile?.verification.rejectionReason ?? null,
    });
  },
);

router.post(
  "/",
  requireAuth,
  requireRole("vendor"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const result = await submitVendorVerification(user.uid);
    res.status(201).json(result);
  },
);

export default router;
