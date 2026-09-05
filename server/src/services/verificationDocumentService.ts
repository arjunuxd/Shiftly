import {
  DOCUMENT_ALLOWED_MIMES,
  DOCUMENT_ALLOWED_PREFIXES,
  MAX_DOCUMENT_BYTES,
  deleteDocument,
  getDocument,
  saveDocument,
} from "./documentStore.js";

const COLLECTION = "verificationDocuments";

export const MAX_VERIFICATION_DOCUMENT_BYTES = MAX_DOCUMENT_BYTES;

export interface VerificationDocumentResponse {
  documentUrl: string;
  documentName: string;
  documentMime: string;
  documentSize: number;
  updatedAt: string | null;
}

export interface SaveVerificationDocumentInput {
  documentUrl: string;
  documentName: string;
  documentSize: number;
}

export async function getVerificationDocument(
  uid: string,
): Promise<VerificationDocumentResponse | null> {
  const stored = await getDocument(COLLECTION, uid);
  if (!stored) {
    return null;
  }
  return {
    documentUrl: stored.url,
    documentName: stored.name,
    documentMime: stored.mime,
    documentSize: stored.size,
    updatedAt: stored.updatedAt,
  };
}

export async function saveVerificationDocument(
  uid: string,
  input: SaveVerificationDocumentInput,
): Promise<VerificationDocumentResponse> {
  const saved = await saveDocument(
    COLLECTION,
    uid,
    {
      dataUrl: input.documentUrl,
      name: input.documentName,
      size: input.documentSize,
    },
    {
      allowedPrefixes: DOCUMENT_ALLOWED_PREFIXES,
      allowedMimes: DOCUMENT_ALLOWED_MIMES,
      kindLabel: "Please upload a JPG, PNG, WEBP, or PDF file.",
      maxBytes: MAX_VERIFICATION_DOCUMENT_BYTES,
    },
  );

  return {
    documentUrl: saved.url,
    documentName: saved.name,
    documentMime: saved.mime,
    documentSize: saved.size,
    updatedAt: saved.updatedAt,
  };
}

export async function deleteVerificationDocument(uid: string): Promise<void> {
  return deleteDocument(COLLECTION, uid);
}