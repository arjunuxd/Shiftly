import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, requireRole, requireAccountActive } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  getPreferences,
  savePreferences,
  deletePreferences,
} from "../services/jobAlertService.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

const saveLimit = rateLimit({
  windowMs: 60_000,
  max: 20,
  keyPrefix: "job-alerts",
});

router.use(requireAuth, requireRole("job_seeker"));

router.get(
  "/preferences",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const prefs = await getPreferences(user.uid);
    res.json({ preferences: prefs });
  },
);

router.put(
  "/preferences",
  requireAccountActive,
  saveLimit,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    const { enabled, locationCity, locationState, jobCategories, workTypes, minRate } =
      req.body as Record<string, unknown>;

    const categories = Array.isArray(jobCategories)
      ? jobCategories.filter((c): c is string => typeof c === "string")
      : undefined;
    const types = Array.isArray(workTypes)
      ? workTypes.filter((t): t is string => typeof t === "string")
      : undefined;

    if (
      locationCity !== undefined && typeof locationCity !== "string"
    ) {
      throw new AppError(400, "Invalid city.");
    }
    if (
      locationState !== undefined && typeof locationState !== "string"
    ) {
      throw new AppError(400, "Invalid state.");
    }
    if (
      enabled !== undefined && typeof enabled !== "boolean"
    ) {
      throw new AppError(400, "Invalid enabled value.");
    }
    let rate: number | null | undefined = undefined;
    if (minRate !== undefined && minRate !== null) {
      rate = Number(minRate);
      if (!Number.isFinite(rate) || rate < 0) {
        throw new AppError(400, "Invalid minimum pay.");
      }
    } else if (minRate === null) {
      rate = null;
    }

    const prefs = await savePreferences(user.uid, {
      enabled: enabled as boolean | undefined,
      locationCity: locationCity as string | undefined,
      locationState: locationState as string | undefined,
      jobCategories: categories,
      workTypes: types,
      minRate: rate,
    });
    res.json({ preferences: prefs });
  },
);

router.delete(
  "/preferences",
  requireAccountActive,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    await deletePreferences(user.uid);
    res.json({ preferences: null });
  },
);

export default router;