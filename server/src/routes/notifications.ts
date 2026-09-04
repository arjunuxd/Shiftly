import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, requireAccountActive } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService.js";
import { validatePageToken, validateNotificationId } from "../validation/notification.js";

const router = Router();

router.use(requireAuth, requireAccountActive);

router.get(
  "/",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const pageToken = validatePageToken(req.query.pageToken);
    const result = await getNotifications(user.uid, pageToken);
    res.json(result);
  },
);

router.get(
  "/unread-count",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const count = await getUnreadCount(user.uid);
    res.json({ unreadCount: count });
  },
);

router.patch(
  "/:notificationId/read",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const notificationId = String(req.params.notificationId);

    if (!validateNotificationId(notificationId)) {
      res.status(400).json({ error: "Invalid notification ID." });
      return;
    }

    try {
      const notification = await markNotificationAsRead(notificationId, user.uid);
      res.json({ notification });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message === "Notification not found.") {
        res.status(404).json({ error: message });
        return;
      }
      if (message === "You do not have access to this notification.") {
        res.status(403).json({ error: message });
        return;
      }
      res.status(500).json({ error: "Failed to update notification." });
    }
  },
);

router.patch(
  "/read-all",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const result = await markAllNotificationsAsRead(user.uid);
    res.json(result);
  },
);

export default router;
