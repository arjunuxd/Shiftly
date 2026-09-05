import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, requireRole, requireAccountActive } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  getApplicationsForVendorJob,
  getApplicationForVendor,
  getCandidateProfileForVendor,
  acceptApplication,
  rejectApplication,
} from "../services/vendorApplicationService.js";

const router = Router();

router.use(requireAuth, requireRole("vendor"));

router.get(
  "/",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const jobId = req.query.jobId as string | undefined;

    if (!jobId || jobId.trim().length === 0) {
      throw new AppError(400, "jobId query parameter is required.");
    }
    if (jobId.length > 128) {
      throw new AppError(400, "Invalid jobId.");
    }

    const applications = await getApplicationsForVendorJob(jobId, user.uid);
    res.json(applications);
  },
);

router.get(
  "/:applicationId",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const applicationId = String(req.params.applicationId);

    if (!applicationId || applicationId.length > 128) {
      throw new AppError(400, "Invalid application ID.");
    }

    const application = await getApplicationForVendor(applicationId, user.uid);
    res.json(application);
  },
);

router.get(
  "/:applicationId/candidate",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const applicationId = String(req.params.applicationId);

    if (!applicationId || applicationId.length > 128) {
      throw new AppError(400, "Invalid application ID.");
    }

    const candidate = await getCandidateProfileForVendor(applicationId, user.uid);
    res.json(candidate);
  },
);

router.patch(
  "/:applicationId/accept",
  requireAccountActive,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const applicationId = String(req.params.applicationId);

    if (!applicationId || applicationId.length > 128) {
      throw new AppError(400, "Invalid application ID.");
    }

    const application = await acceptApplication(applicationId, user.uid);
    res.json(application);
  },
);

router.patch(
  "/:applicationId/reject",
  requireAccountActive,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const applicationId = String(req.params.applicationId);

    if (!applicationId || applicationId.length > 128) {
      throw new AppError(400, "Invalid application ID.");
    }

    const application = await rejectApplication(applicationId, user.uid);
    res.json(application);
  },
);

export default router;
