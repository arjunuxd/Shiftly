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
  getVerificationStatus,
  submitVerification,
  removeVerification,
} from "../services/verificationService.js";
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
  requireAccountActive,
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

router.get(
  "/document",
  requireAuth,
  requireAccountActive,
  requireRole("job_seeker"),
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
  requireRole("job_seeker"),
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
  requireRole("job_seeker"),
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
  requireRole("job_seeker"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    await removeVerification(user.uid);
    res.json({
      status: "unverified",
      submittedAt: null,
      reviewedAt: null,
      rejectionReason: null,
    });
  },
);

export default router;