import { Router } from "express";
import type { Request, Response } from "express";
import { getAdminAuth } from "../config/firebaseAdmin.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { createUserDocument, getUserDocument } from "../services/userService.js";
import { isPublicRole } from "../types/auth.js";

const router = Router();

router.get(
  "/me",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    const userDoc = await getUserDocument(user.uid);
    const role = userDoc?.role ?? user.role ?? null;

    res.json({
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      role,
    });
  },
);

router.patch(
  "/role",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    const requestedRole = req.body?.role;

    if (!isPublicRole(requestedRole)) {
      throw new AppError(400, "Invalid role");
    }

    await getAdminAuth().setCustomUserClaims(user.uid, { role: requestedRole });
    await createUserDocument(user.uid, user.email ?? "", requestedRole);

    res.json({ role: requestedRole });
  },
);

export default router;
