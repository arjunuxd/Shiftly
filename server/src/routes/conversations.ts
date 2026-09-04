import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, requireAccountActive } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  getOrCreateConversation,
  getConversationsForUser,
  getMessages,
  createConversationMessage,
} from "../services/conversationService.js";
import {
  validateMessageBody,
  validateConversationBody,
} from "../validation/conversation.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

const messageSendLimit = rateLimit({
  windowMs: 10_000,
  max: 20,
  keyPrefix: "message-send",
});

router.use(requireAuth);

router.get(
  "/",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const role = user.role;

    if (role !== "vendor" && role !== "job_seeker") {
      throw new AppError(403, "Insufficient permissions.");
    }

    const conversations = await getConversationsForUser(
      user.uid,
      role as "vendor" | "job_seeker",
    );
    res.json(conversations);
  },
);

router.post(
  "/",
  requireAccountActive,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    if (user.role !== "vendor") {
      throw new AppError(403, "Only vendors can create conversations.");
    }

    const errors = validateConversationBody(req.body);
    if (errors.length > 0) {
      throw new AppError(400, errors.map((e) => e.message).join("; "));
    }

    const { jobSeekerId, applicationId, jobId } = req.body as {
      jobSeekerId: string;
      applicationId: string;
      jobId: string;
    };

    const conversation = await getOrCreateConversation(
      user.uid,
      jobSeekerId,
      applicationId,
      jobId,
    );
    res.status(201).json(conversation);
  },
);

router.get(
  "/:conversationId/messages",
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const conversationId = String(req.params.conversationId);

    if (!conversationId || conversationId.length > 256) {
      throw new AppError(400, "Invalid conversation ID.");
    }

    const limitRaw = req.query.limit;
    const limit = typeof limitRaw === "string" ? Number(limitRaw) : 50;
    const safeLimit = Number.isFinite(limit) && limit > 0 && limit <= 100 ? limit : 50;

    const before = typeof req.query.before === "string" ? req.query.before : undefined;

    const messages = await getMessages(conversationId, user.uid, safeLimit, before);
    res.json(messages);
  },
);

router.post(
  "/:conversationId/messages",
  requireAccountActive,
  messageSendLimit,
  async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const conversationId = String(req.params.conversationId);

    if (!conversationId || conversationId.length > 256) {
      throw new AppError(400, "Invalid conversation ID.");
    }

    const errors = validateMessageBody(req.body);
    if (errors.length > 0) {
      throw new AppError(400, errors.map((e) => e.message).join("; "));
    }

    const { text } = req.body as { text: string };
    const message = await createConversationMessage(conversationId, user.uid, text.trim());
    res.status(201).json(message);
  },
);

export default router;
