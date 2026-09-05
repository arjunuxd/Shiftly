import { Router } from "express";
import { isAdminReady } from "../config/firebaseAdmin.js";
import authRoutes from "./auth.js";
import profileRoutes from "./profile.js";
import verificationRoutes from "./verification.js";
import vendorProfileRoutes from "./vendorProfile.js";
import vendorVerificationRoutes from "./vendorVerification.js";
import jobsRoutes from "./jobs.js";
import applicationsRoutes from "./applications.js";
import jobDiscoveryRoutes from "./jobDiscovery.js";
import vendorApplicationsRoutes from "./vendorApplications.js";
import conversationsRoutes from "./conversations.js";
import adminRoutes from "./admin.js";
import notificationsRoutes from "./notifications.js";
import uploadsRoutes from "./uploads.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", adminReady: isAdminReady() });
});

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/verification", verificationRoutes);
router.use("/vendor", vendorProfileRoutes);
router.use("/vendor/verification", vendorVerificationRoutes);
router.use("/jobs", jobsRoutes);
router.use("/applications", applicationsRoutes);
router.use("/discover", jobDiscoveryRoutes);
router.use("/vendor/applications", vendorApplicationsRoutes);
router.use("/conversations", conversationsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/uploads", uploadsRoutes);
router.use("/admin", adminRoutes);

export default router;
