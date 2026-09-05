import { Router } from "express";
import type { Request, Response } from "express";
import {
  requireAuth,
  requireAccountActive,
  requireRole,
} from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  submitVendorVerification,
  removeVendorVerification,
} from "../services/vendorVerificationService.js";
import { getVendorProfile } from "../services/vendorProfileService.js";
import {
  getVerificationDocument,
  saveVerificationDocument,
  deleteVerificationDocument,
} from "../services/verificationDocumentService.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireAccountActive,
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
  requireAccountActive,
  requireRole("vendor"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const result = await submitVendorVerification(user.uid);
    res.status(201).json(result);
  },
);

router.get(
  "/document",
  requireAuth,
  requireAccountActive,
  requireRole("vendor"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const document = await getVerificationDocument(user.uid);

    if (!document) {
      throw new AppError(404, "No document uploaded yet.");
    }

    res.json(document);
  },
);

router.post(
  "/document",
  requireAuth,
  requireAccountActive,
  requireRole("vendor"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const body = (req.body ?? {}) as {
      documentUrl?: unknown;
      documentName?: unknown;
      documentSize?: unknown;
    };

    const document = await saveVerificationDocument(user.uid, {
      documentUrl: String(body.documentUrl ?? ""),
      documentName: String(body.documentName ?? ""),
      documentSize: Number(body.documentSize),
    });

    res.status(201).json(document);
  },
);

router.delete(
  "/document",
  requireAuth,
  requireAccountActive,
  requireRole("vendor"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    await deleteVerificationDocument(user.uid);
    res.json({ ok: true });
  },
);

router.post(
  "/remove",
  requireAuth,
  requireAccountActive,
  requireRole("vendor"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const result = await removeVendorVerification(user.uid);
    res.json(result);
  },
);

export default router;