import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  createApplication,
  getApplicationsForJobSeeker,
  getApplication,
  withdrawApplication,
} from "../services/applicationService.js";
import {
  validateApplicationBody,
  validateWithdrawBody,
} from "../validation/application.js";

const router = Router();

router.use(requireAuth, requireRole("job_seeker"));

router.get(
  "/",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const applications = await getApplicationsForJobSeeker(user.uid);
    res.json(applications);
  },
);

router.post(
  "/",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    const errors = validateApplicationBody(req.body);
    if (errors.length > 0) {
      throw new AppError(400, errors.map((e) => e.message).join("; "));
    }

    const { jobId } = req.body as { jobId: string };

    const application = await createApplication(user.uid, jobId);
    res.status(201).json(application);
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

    const application = await getApplication(applicationId, user.uid);
    res.json(application);
  },
);

router.patch(
  "/:applicationId/withdraw",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const applicationId = String(req.params.applicationId);

    if (!applicationId || applicationId.length > 128) {
      throw new AppError(400, "Invalid application ID.");
    }

    const errors = validateWithdrawBody(req.body);
    if (errors.length > 0) {
      throw new AppError(400, errors.map((e) => e.message).join("; "));
    }

    const application = await withdrawApplication(applicationId, user.uid);
    res.json(application);
  },
);

export default router;
