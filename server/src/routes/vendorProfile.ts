import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, requireRole, requireAccountActive } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  getVendorProfile,
  createVendorProfile,
  updateVendorProfile,
} from "../services/vendorProfileService.js";
import { validateVendorProfile } from "../validation/vendorProfile.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("vendor"),
  requireAccountActive,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const profile = await getVendorProfile(user.uid);

    if (!profile) {
      throw new AppError(404, "Vendor profile not found");
    }

    res.json(profile);
  },
);

router.post(
  "/",
  requireAuth,
  requireRole("vendor"),
  requireAccountActive,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    const existing = await getVendorProfile(user.uid);
    if (existing) {
      throw new AppError(409, "Vendor profile already exists. Use PATCH to update.");
    }

    const errors = validateVendorProfile(req.body);
    if (errors.length > 0) {
      throw new AppError(400, errors.map((e) => e.message).join("; "));
    }

    const body = req.body as Record<string, unknown>;

    const profile = await createVendorProfile(user.uid, {
      businessInfo: body.businessInfo as {
        businessName: string;
        businessType: string;
        description: string;
        website: string;
        phone: string;
        contactEmail: string;
      },
      location: body.location as {
        city: string;
        state: string;
        country: string;
        address: string;
      },
    });

    res.status(201).json(profile);
  },
);

router.patch(
  "/",
  requireAuth,
  requireRole("vendor"),
  requireAccountActive,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    const existing = await getVendorProfile(user.uid);
    if (!existing) {
      throw new AppError(404, "Vendor profile not found. Use POST to create.");
    }

    const errors = validateVendorProfile(req.body);
    if (errors.length > 0) {
      throw new AppError(400, errors.map((e) => e.message).join("; "));
    }

    const body = req.body as Record<string, unknown>;

    const allowedFields = ["businessInfo", "location"];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const profile = await updateVendorProfile(
      user.uid,
      updates as Parameters<typeof updateVendorProfile>[1],
    );

    res.json(profile);
  },
);

export default router;
