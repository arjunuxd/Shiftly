import { Router } from "express";
import type { Response } from "express";
import {
  requireAccountActive,
  requireAuth,
  requireRole,
  type AuthenticatedRequest,
} from "../middleware/auth.js";
import {
  PHOTO_ALLOWED_MIMES,
  PHOTO_ALLOWED_PREFIXES,
  PDF_ALLOWED_MIMES,
  PDF_ALLOWED_PREFIXES,
  deleteDocument,
  saveDocument,
} from "../services/documentStore.js";

const PHOTOS_COLLECTION = "profilePhotos";
const RESUMES_COLLECTION = "resumes";
const CERTIFICATES_COLLECTION = "certificates";

const MAX_PHOTO_BYTES = 500 * 1024;
const MAX_PDF_BYTES = 500 * 1024;

function readBodyString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readSize(value: unknown): number {
  return Number(value);
}

const router = Router();

router.use(requireAuth, requireRole("job_seeker"), requireAccountActive);

router.post(
  "/photo",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const uid = req.user!.uid;
    const dataUrl = readBodyString(req.body?.dataUrl);
    const fileName = readBodyString(req.body?.fileName);
    const size = readSize(req.body?.size);

    if (!dataUrl) {
      res.status(400).json({ error: "File data is required." });
      return;
    }

    const saved = await saveDocument(
      PHOTOS_COLLECTION,
      uid,
      { dataUrl, name: fileName ?? "photo", size },
      {
        allowedPrefixes: PHOTO_ALLOWED_PREFIXES,
        allowedMimes: PHOTO_ALLOWED_MIMES,
        kindLabel: "Photo must be a JPG, PNG, or WebP image.",
        maxBytes: MAX_PHOTO_BYTES,
      },
    );

    res.status(201).json({ url: saved.url, updatedAt: saved.updatedAt });
  },
);

router.delete(
  "/photo",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await deleteDocument(PHOTOS_COLLECTION, req.user!.uid);
    res.status(204).end();
  },
);

router.post(
  "/resume",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const uid = req.user!.uid;
    const dataUrl = readBodyString(req.body?.dataUrl);
    const fileName = readBodyString(req.body?.fileName);
    const size = readSize(req.body?.size);

    if (!dataUrl) {
      res.status(400).json({ error: "File data is required." });
      return;
    }

    const saved = await saveDocument(
      RESUMES_COLLECTION,
      uid,
      { dataUrl, name: fileName ?? "resume.pdf", size },
      {
        allowedPrefixes: PDF_ALLOWED_PREFIXES,
        allowedMimes: PDF_ALLOWED_MIMES,
        kindLabel: "Resume must be a PDF.",
        maxBytes: MAX_PDF_BYTES,
      },
    );

    res.status(201).json({ url: saved.url, name: saved.name, updatedAt: saved.updatedAt });
  },
);

router.delete(
  "/resume",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await deleteDocument(RESUMES_COLLECTION, req.user!.uid);
    res.status(204).end();
  },
);

router.post(
  "/certificate",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const uid = req.user!.uid;
    const certificateId = readBodyString(req.body?.certificateId);
    const dataUrl = readBodyString(req.body?.dataUrl);
    const fileName = readBodyString(req.body?.fileName);
    const size = readSize(req.body?.size);

    if (!certificateId || certificateId.length > 64) {
      res
        .status(400)
        .json({ error: "A valid certificate ID is required." });
      return;
    }
    if (!dataUrl) {
      res.status(400).json({ error: "File data is required." });
      return;
    }

    const saved = await saveDocument(
      CERTIFICATES_COLLECTION,
      `${uid}__${certificateId}`,
      { dataUrl, name: fileName ?? "certificate.pdf", size },
      {
        allowedPrefixes: PDF_ALLOWED_PREFIXES,
        allowedMimes: PDF_ALLOWED_MIMES,
        kindLabel: "Certificate must be a PDF.",
        maxBytes: MAX_PDF_BYTES,
      },
    );

    res.status(201).json({ url: saved.url, updatedAt: saved.updatedAt });
  },
);

router.delete(
  "/certificate/:certificateId",
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const certificateId = String(req.params.certificateId);
    if (!certificateId || certificateId.length > 64) {
      res.status(400).json({ error: "A valid certificate ID is required." });
      return;
    }
    await deleteDocument(CERTIFICATES_COLLECTION, `${req.user!.uid}__${certificateId}`);
    res.status(204).end();
  },
);

export default router;