import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, requireRole, requireAccountActive } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  createReview,
  getReputationForUser,
} from "../services/reputationService.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

const reviewLimit = rateLimit({
  windowMs: 60_000,
  max: 10,
  keyPrefix: "reviews",
});

router.get(
  "/reputation/me",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const reputation = await getReputationForUser(user.uid);
    res.json({ reputation });
  },
);

router.post(
  "/",
  requireAuth,
  requireRole("vendor", "job_seeker"),
  requireAccountActive,
  reviewLimit,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    const { applicationId, rating, comment } = req.body as Record<string, unknown>;

    if (typeof applicationId !== "string" || applicationId.length > 128) {
      throw new AppError(400, "Invalid application ID.");
    }
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new AppError(400, "Rating must be a whole number between 1 and 5.");
    }
    if (comment !== undefined) {
      if (typeof comment !== "string") {
        throw new AppError(400, "Comment must be text.");
      }
      if (comment.length > 1000) {
        throw new AppError(400, "Comment must be at most 1000 characters.");
      }
    }

    const review = await createReview({
      reviewerId: user.uid,
      reviewerRole: user.role as "vendor" | "job_seeker",
      applicationId,
      rating: numericRating,
      comment: typeof comment === "string" ? comment : "",
    });

    res.status(201).json(review);
  },
);

export default router;