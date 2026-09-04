import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, requireSuperadmin } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  getPlatformOverview,
  getUsers,
  getUserById,
  suspendUser,
  restoreUser,
} from "../services/adminService.js";
import {
  getAllVerifications,
  approveJobSeekerVerification,
  rejectJobSeekerVerification,
} from "../services/adminVerificationService.js";
import {
  getAllVendorVerifications,
  approveVendorVerification,
  rejectVendorVerification,
} from "../services/adminVendorVerificationService.js";
import {
  getAdminJobs,
  getAdminJobById,
  removeJob,
  restoreJob,
} from "../services/adminJobService.js";
import {
  getReports,
  getReportById,
  resolveReport,
  dismissReport,
} from "../services/adminReportService.js";
import { getAuditLogs } from "../services/adminAuditService.js";
import { logAdminAction } from "../services/adminAuditService.js";
import { createNotification } from "../services/notificationService.js";

const router = Router();

router.use(requireAuth, requireSuperadmin);

// ─── Overview ────────────────────────────────────────────────

router.get(
  "/overview",
  async (_req: Request, res: Response): Promise<void> => {
    const overview = await getPlatformOverview();
    res.json(overview);
  },
);

// ─── Users ───────────────────────────────────────────────────

router.get(
  "/users",
  async (req: Request, res: Response): Promise<void> => {
    const role = typeof req.query.role === "string" ? req.query.role : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const limitRaw = typeof req.query.limit === "string" ? Number(req.query.limit) : 20;
    const offsetRaw = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 && limitRaw <= 100 ? limitRaw : 20;
    const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;

    const result = await getUsers({ role, status, search, limit, offset });
    res.json(result);
  },
);

router.get(
  "/users/:uid",
  async (req: Request, res: Response): Promise<void> => {
    const uid = String(req.params.uid);
    if (!uid || uid.length > 128) {
      throw new AppError(400, "Invalid user ID.");
    }
    const user = await getUserById(uid);
    res.json(user);
  },
);

router.post(
  "/users/:uid/suspend",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const uid = String(req.params.uid);
    if (!uid || uid.length > 128) {
      throw new AppError(400, "Invalid user ID.");
    }

    const { reason } = req.body as { reason?: string };
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      throw new AppError(400, "reason is required.");
    }
    if (reason.length > 500) {
      throw new AppError(400, "reason must be at most 500 characters.");
    }

    const suspended = await suspendUser(uid, user.uid, reason.trim());
    await logAdminAction(user.uid, "USER_SUSPENDED", "user", uid, reason.trim());
    res.json(suspended);
  },
);

router.post(
  "/users/:uid/restore",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const uid = String(req.params.uid);
    if (!uid || uid.length > 128) {
      throw new AppError(400, "Invalid user ID.");
    }

    const restored = await restoreUser(uid);
    await logAdminAction(user.uid, "USER_RESTORED", "user", uid);
    res.json(restored);
  },
);

// ─── Job Seeker Verifications ────────────────────────────────

router.get(
  "/verifications",
  async (req: Request, res: Response): Promise<void> => {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const verifications = await getAllVerifications(status);
    res.json(verifications);
  },
);

router.post(
  "/verifications/:userId/approve",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const userId = String(req.params.userId);
    if (!userId || userId.length > 128) {
      throw new AppError(400, "Invalid user ID.");
    }

    const result = await approveJobSeekerVerification(userId, user.uid);
    await logAdminAction(user.uid, "JOB_SEEKER_VERIFIED", "verification", userId);
    await createNotification({
      recipientId: userId,
      type: "VERIFICATION_APPROVED",
      title: "Verification approved",
      body: "Your identity verification has been approved. You are now a verified job seeker.",
      actorId: user.uid,
      data: { verificationType: "job_seeker" },
    });
    res.json(result);
  },
);

router.post(
  "/verifications/:userId/reject",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const userId = String(req.params.userId);
    if (!userId || userId.length > 128) {
      throw new AppError(400, "Invalid user ID.");
    }

    const { reason } = req.body as { reason?: string };
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      throw new AppError(400, "reason is required.");
    }
    if (reason.length > 500) {
      throw new AppError(400, "reason must be at most 500 characters.");
    }

    const result = await rejectJobSeekerVerification(userId, user.uid, reason.trim());
    await logAdminAction(user.uid, "JOB_SEEKER_REJECTED", "verification", userId, reason.trim());
    await createNotification({
      recipientId: userId,
      type: "VERIFICATION_REJECTED",
      title: "Verification rejected",
      body: "Your identity verification was not approved. Please review and resubmit.",
      actorId: user.uid,
      data: { verificationType: "job_seeker", reason: reason.trim() },
    });
    res.json(result);
  },
);

// ─── Vendor Verifications ────────────────────────────────────

router.get(
  "/vendor-verifications",
  async (req: Request, res: Response): Promise<void> => {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const verifications = await getAllVendorVerifications(status);
    res.json(verifications);
  },
);

router.post(
  "/vendor-verifications/:uid/approve",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const uid = String(req.params.uid);
    if (!uid || uid.length > 128) {
      throw new AppError(400, "Invalid vendor ID.");
    }

    const result = await approveVendorVerification(uid, user.uid);
    await logAdminAction(user.uid, "VENDOR_VERIFIED", "vendorVerification", uid);
    await createNotification({
      recipientId: uid,
      type: "VERIFICATION_APPROVED",
      title: "Business verification approved",
      body: "Your business has been verified. You can now display the verified badge on your listings.",
      actorId: user.uid,
      data: { verificationType: "vendor" },
    });
    res.json(result);
  },
);

router.post(
  "/vendor-verifications/:uid/reject",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const uid = String(req.params.uid);
    if (!uid || uid.length > 128) {
      throw new AppError(400, "Invalid vendor ID.");
    }

    const { reason } = req.body as { reason?: string };
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      throw new AppError(400, "reason is required.");
    }
    if (reason.length > 500) {
      throw new AppError(400, "reason must be at most 500 characters.");
    }

    const result = await rejectVendorVerification(uid, user.uid, reason.trim());
    await logAdminAction(user.uid, "VENDOR_REJECTED", "vendorVerification", uid, reason.trim());
    await createNotification({
      recipientId: uid,
      type: "VERIFICATION_REJECTED",
      title: "Business verification rejected",
      body: "Your business verification was not approved. Please review and resubmit.",
      actorId: user.uid,
      data: { verificationType: "vendor", reason: reason.trim() },
    });
    res.json(result);
  },
);

// ─── Jobs ────────────────────────────────────────────────────

router.get(
  "/jobs",
  async (req: Request, res: Response): Promise<void> => {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const moderationStatus = typeof req.query.moderationStatus === "string" ? req.query.moderationStatus : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const limitRaw = typeof req.query.limit === "string" ? Number(req.query.limit) : 20;
    const offsetRaw = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 && limitRaw <= 100 ? limitRaw : 20;
    const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;

    const result = await getAdminJobs({ status, moderationStatus, search, limit, offset });
    res.json(result);
  },
);

router.get(
  "/jobs/:jobId",
  async (req: Request, res: Response): Promise<void> => {
    const jobId = String(req.params.jobId);
    if (!jobId || jobId.length > 128) {
      throw new AppError(400, "Invalid job ID.");
    }
    const job = await getAdminJobById(jobId);
    res.json(job);
  },
);

router.post(
  "/jobs/:jobId/remove",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const jobId = String(req.params.jobId);
    if (!jobId || jobId.length > 128) {
      throw new AppError(400, "Invalid job ID.");
    }

    const { reason } = req.body as { reason?: string };
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      throw new AppError(400, "reason is required.");
    }
    if (reason.length > 500) {
      throw new AppError(400, "reason must be at most 500 characters.");
    }

    const result = await removeJob(jobId, user.uid, reason.trim());
    await logAdminAction(user.uid, "JOB_REMOVED", "job", jobId, reason.trim());
    res.json(result);
  },
);

router.post(
  "/jobs/:jobId/restore",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const jobId = String(req.params.jobId);
    if (!jobId || jobId.length > 128) {
      throw new AppError(400, "Invalid job ID.");
    }

    const result = await restoreJob(jobId);
    await logAdminAction(user.uid, "JOB_RESTORED", "job", jobId);
    res.json(result);
  },
);

// ─── Reports ─────────────────────────────────────────────────

router.get(
  "/reports",
  async (req: Request, res: Response): Promise<void> => {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const limitRaw = typeof req.query.limit === "string" ? Number(req.query.limit) : 20;
    const offsetRaw = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 && limitRaw <= 100 ? limitRaw : 20;
    const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;

    const result = await getReports({ status, limit, offset });
    res.json(result);
  },
);

router.get(
  "/reports/:reportId",
  async (req: Request, res: Response): Promise<void> => {
    const reportId = String(req.params.reportId);
    if (!reportId || reportId.length > 128) {
      throw new AppError(400, "Invalid report ID.");
    }
    const report = await getReportById(reportId);
    res.json(report);
  },
);

router.post(
  "/reports/:reportId/resolve",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const reportId = String(req.params.reportId);
    if (!reportId || reportId.length > 128) {
      throw new AppError(400, "Invalid report ID.");
    }

    const result = await resolveReport(reportId, user.uid);
    await logAdminAction(user.uid, "REPORT_RESOLVED", "report", reportId);
    res.json(result);
  },
);

router.post(
  "/reports/:reportId/dismiss",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const reportId = String(req.params.reportId);
    if (!reportId || reportId.length > 128) {
      throw new AppError(400, "Invalid report ID.");
    }

    const result = await dismissReport(reportId, user.uid);
    await logAdminAction(user.uid, "REPORT_DISMISSED", "report", reportId);
    res.json(result);
  },
);

// ─── Audit Logs ──────────────────────────────────────────────

router.get(
  "/audit-logs",
  async (req: Request, res: Response): Promise<void> => {
    const limitRaw = typeof req.query.limit === "string" ? Number(req.query.limit) : 50;
    const offsetRaw = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 && limitRaw <= 100 ? limitRaw : 50;
    const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;

    const result = await getAuditLogs({ limit, offset });
    res.json(result);
  },
);

export default router;
