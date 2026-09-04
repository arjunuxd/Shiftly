import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { requireRole } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  getProfile,
  createProfile,
  updateProfile,
} from "../services/profileService.js";
import { validateProfile } from "../validation/profile.js";
import type { ProfileCertificate, ProfilePortfolioLink } from "../types/profile.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("job_seeker"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const profile = await getProfile(user.uid);

    if (!profile) {
      throw new AppError(404, "Profile not found");
    }

    res.json(profile);
  },
);

router.post(
  "/",
  requireAuth,
  requireRole("job_seeker"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    const existing = await getProfile(user.uid);
    if (existing) {
      throw new AppError(409, "Profile already exists. Use PATCH to update.");
    }

    const errors = validateProfile(req.body);
    if (errors.length > 0) {
      throw new AppError(400, errors.map((e) => e.message).join("; "));
    }

    const body = req.body as Record<string, unknown>;

    const profile = await createProfile(user.uid, {
      personalInfo: body.personalInfo as {
        fullName: string;
        bio: string;
        phone: string;
      },
      skills: (body.skills as Array<{ name: string; category: string }>) ?? [],
      experience:
        (body.experience as Array<{
          id: string;
          role: string;
          organization: string;
          description: string;
          startDate: string;
          endDate: string;
          currentlyWorking: boolean;
        }>) ?? [],
      education:
        (body.education as Array<{
          id: string;
          institution: string;
          qualification: string;
          fieldOfStudy: string;
          startYear: number;
          endYear: number;
        }>) ?? [],
      availability:
        (body.availability as Array<{
          day: string;
          startTime: string;
          endTime: string;
        }>) ?? [],
      workPreferences: body.workPreferences as {
        jobCategories: string[];
        workTypes: string[];
      },
      location: body.location as {
        city: string;
        state: string;
        country: string;
        latitude: number | null;
        longitude: number | null;
      },
      photoUrl: (body.photoUrl as string | null) ?? null,
      resumeUrl: (body.resumeUrl as string | null) ?? null,
      resumeName: (body.resumeName as string | null) ?? null,
      certificates: (body.certificates as ProfileCertificate[]) ?? [],
      portfolioLinks: (body.portfolioLinks as ProfilePortfolioLink[]) ?? [],
    });

    res.status(201).json(profile);
  },
);

router.patch(
  "/",
  requireAuth,
  requireRole("job_seeker"),
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    const existing = await getProfile(user.uid);
    if (!existing) {
      throw new AppError(404, "Profile not found. Use POST to create.");
    }

    const errors = validateProfile(req.body);
    if (errors.length > 0) {
      throw new AppError(400, errors.map((e) => e.message).join("; "));
    }

    const body = req.body as Record<string, unknown>;

    const allowedFields = [
      "personalInfo",
      "skills",
      "experience",
      "education",
      "availability",
      "workPreferences",
      "location",
      "photoUrl",
      "resumeUrl",
      "resumeName",
      "certificates",
      "portfolioLinks",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const profile = await updateProfile(user.uid, updates as Parameters<typeof updateProfile>[1]);

    res.json(profile);
  },
);

export default router;
