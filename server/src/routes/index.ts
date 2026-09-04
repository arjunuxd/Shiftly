import { Router } from "express";
import authRoutes from "./auth.js";
import profileRoutes from "./profile.js";
import verificationRoutes from "./verification.js";
import vendorProfileRoutes from "./vendorProfile.js";
import vendorVerificationRoutes from "./vendorVerification.js";
import jobsRoutes from "./jobs.js";
import applicationsRoutes from "./applications.js";
import jobDiscoveryRoutes from "./jobDiscovery.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/verification", verificationRoutes);
router.use("/vendor", vendorProfileRoutes);
router.use("/vendor/verification", vendorVerificationRoutes);
router.use("/jobs", jobsRoutes);
router.use("/applications", applicationsRoutes);
router.use("/discover", jobDiscoveryRoutes);

export default router;
