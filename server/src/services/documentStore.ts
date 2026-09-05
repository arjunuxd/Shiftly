import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "../config/firebaseAdmin.js";
import { AppError } from "../middleware/errorHandler.js";

export const MAX_DOCUMENT_BYTES = 500 * 1024;

export const DOCUMENT_ALLOWED_MIMES = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export const DOCUMENT_ALLOWED_PREFIXES = new Set<string>([
  "data:image/jpeg;base64,",
  "data:image/png;base64,",
  "data:image/webp;base64,",
  "data:application/pdf;base64,",
]);

export const PHOTO_ALLOWED_MIMES = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const PHOTO_ALLOWED_PREFIXES = new Set<string>([
  "data:image/jpeg;base64,",
  "data:image/png;base64,",
  "data:image/webp;base64,",
]);

export const PDF_ALLOWED_MIMES = new Set<string>(["application/pdf"]);

export const PDF_ALLOWED_PREFIXES = new Set<string>([
  "data:application/pdf;base64,",
]);

export interface StoredDocumentResponse {
  url: string;
  name: string;
  mime: string;
  size: number;
  updatedAt: string | null;
}

export interface SaveDocumentInput {
  dataUrl: string;
  name: string;
  size: number;
}

interface SaveDocumentOptions {
  allowedPrefixes: Set<string>;
  allowedMimes: Set<string>;
  kindLabel: string;
  maxBytes?: number;
}

function dataUrlPrefix(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const match = /^(data:[a-zA-Z0-9./-]+;base64,)/.exec(url);
  return match ? match[1] : null;
}

function toIso(value: unknown): string | null {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

export async function getDocument(
  collection: string,
  docId: string,
): Promise<StoredDocumentResponse | null> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(collection).doc(docId).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();

  return {
    url: String(data?.url ?? ""),
    name: String(data?.name ?? ""),
    mime: String(data?.mime ?? ""),
    size: Number(data?.size ?? 0),
    updatedAt: toIso(data?.updatedAt),
  };
}

export async function saveDocument(
  collection: string,
  docId: string,
  input: SaveDocumentInput,
  options: SaveDocumentOptions,
): Promise<StoredDocumentResponse> {
  const absoluteMax = options.maxBytes ?? MAX_DOCUMENT_BYTES;

  const prefix = dataUrlPrefix(input.dataUrl);
  if (!prefix || !options.allowedPrefixes.has(prefix)) {
    throw new AppError(
      400,
      `Unsupported file type. ${options.kindLabel}`,
    );
  }

  const mime = prefix.slice("data:".length, -";base64,".length);
  if (!options.allowedMimes.has(mime)) {
    throw new AppError(400, `Unsupported file type. ${options.kindLabel}`);
  }

  if (!input.name || typeof input.name !== "string" || input.name.trim().length === 0) {
    throw new AppError(400, "A file name is required.");
  }
  if (input.name.length > 100) {
    throw new AppError(400, "File name must be at most 100 characters.");
  }

  const size = Number(input.size);
  if (!Number.isFinite(size) || size <= 0 || size > absoluteMax) {
    throw new AppError(
      400,
      `File must be ${Math.floor(absoluteMax / 1024)} KB or smaller.`,
    );
  }

  const base64 = input.dataUrl.slice(prefix.length);
  if (base64.length === 0) {
    throw new AppError(400, "The file appears to be empty.");
  }

  let padding = 0;
  if (base64.endsWith("==")) padding = 2;
  else if (base64.endsWith("=")) padding = 1;
  const estimate = Math.floor((base64.length * 3) / 4) - padding;
  if (Math.abs(estimate - size) > 4) {
    throw new AppError(400, "The file data does not match its declared size.");
  }

  const db = getAdminFirestore();
  await db.collection(collection).doc(docId).set({
    url: input.dataUrl,
    name: input.name.trim(),
    mime,
    size,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const saved = await getDocument(collection, docId);
  if (!saved) {
    throw new AppError(500, "We couldn't store the file. Please try again.");
  }
  return saved;
}

export async function deleteDocument(
  collection: string,
  docId: string,
): Promise<void> {
  const db = getAdminFirestore();
  await db.collection(collection).doc(docId).delete();
}