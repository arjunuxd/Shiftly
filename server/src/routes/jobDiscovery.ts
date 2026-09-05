import { Router } from "express";
import type { Request, Response } from "express";
import {
  getPublishedJobs,
  getPublishedJob,
} from "../services/jobDiscoveryService.js";
import { getApplicationForJob } from "../services/applicationService.js";
import { getJob } from "../services/jobService.js";
import {
  validateSearchParam,
  validateEnumParam,
  validateMinPay,
  validatePageToken,
} from "../validation/application.js";

const VALID_CATEGORIES = [
  "hospitality",
  "retail",
  "logistics",
  "events",
  "office",
  "healthcare",
  "education",
  "technology",
  "creative",
  "other",
];

const VALID_WORK_TYPES = [
  "part-time",
  "temporary",
  "freelance",
  "shift-based",
  "event-work",
];

const VALID_RATE_TYPES = ["hourly", "daily", "fixed"];

const VALID_SORT = ["newest", "pay-high", "pay-low", "location"];

const router = Router();

router.get(
  "/",
  async (req: Request, res: Response): Promise<void> => {
    const search = validateSearchParam(req.query.search);
    const jobCategory = validateEnumParam(req.query.jobCategory, VALID_CATEGORIES);
    const workType = validateEnumParam(req.query.workType, VALID_WORK_TYPES);
    const rateType = validateEnumParam(req.query.rateType, VALID_RATE_TYPES);
    const minPay = validateMinPay(req.query.minPay);
    const city = validateSearchParam(req.query.city);
    const state = validateSearchParam(req.query.state);
    const area = validateSearchParam(req.query.area);
    const verifiedOnlyRaw = req.query.verifiedOnly;
    const verifiedOnly =
      verifiedOnlyRaw === "true" || verifiedOnlyRaw === "1";
    const sortBy = validateEnumParam(req.query.sortBy, VALID_SORT) ?? "newest";
    const pageToken = validatePageToken(req.query.pageToken);

    let locationHint:
      | { city?: string; state?: string }
      | undefined;

    if (sortBy === "location") {
      const hintCity = validateSearchParam(req.query.locationCity);
      const hintState = validateSearchParam(req.query.locationState);

      if (hintCity || hintState) {
        locationHint = {
          ...(hintCity && { city: hintCity }),
          ...(hintState && { state: hintState }),
        };
      }
    }

    const filters = {
      ...(search && { search }),
      ...(jobCategory && { jobCategory }),
      ...(workType && { workType }),
      ...(rateType && { rateType }),
      ...(minPay !== undefined && { minPay }),
      ...(city && { city }),
      ...(state && { state }),
      ...(area && { area }),
      ...(verifiedOnly && { verifiedOnly: true }),
      sortBy: sortBy as "newest" | "pay-high" | "pay-low" | "location",
      ...(locationHint && { locationHint }),
    };

    const result = await getPublishedJobs(filters, pageToken);
    res.json(result);
  },
);

router.get(
  "/:jobId",
  async (req: Request, res: Response): Promise<void> => {
    const jobId = String(req.params.jobId);

    if (!jobId || jobId.length > 128) {
      res.status(404).json({ error: "Job not found." });
      return;
    }

    const publicJob = await getPublishedJob(jobId);
    if (!publicJob) {
      res.status(404).json({ error: "Job not found." });
      return;
    }

    const fullJob = await getJob(jobId);
    const vendorId = fullJob?.vendorId;

    let myApplication: { status: string } | null = null;

    try {
      const authHeader = req.header("authorization");
      if (authHeader && vendorId) {
        const { getAdminAuth } = await import(
          "../config/firebaseAdmin.js"
        );
        const tokenMatch = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
        if (tokenMatch) {
          const decoded = await getAdminAuth().verifyIdToken(tokenMatch[1]);
          if (typeof decoded.role === "string" && decoded.role === "job_seeker") {
            const app = await getApplicationForJob(jobId, decoded.uid);
            if (app) {
              myApplication = { status: app.status };
            }
          }
        }
      }
    } catch {
      // Non-blocking: if token is invalid or user is not a job seeker, continue without application info.
    }

    res.json({ ...publicJob, myApplication });
  },
);

export default router;
