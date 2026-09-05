import { getCurrentIdToken } from "./auth";
import {
  deleteCertificateFile,
  deleteProfilePhotoFile,
  deleteResumeFile,
  uploadCertificateFile,
  uploadProfilePhotoFile,
  uploadResumeFile,
} from "./api";

const PHOTO_MAX_BYTES = 500 * 1024;
const PDF_MAX_BYTES = 500 * 1024;

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadProfilePhoto(
  _uid: string,
  file: File,
): Promise<string> {
  if (!PHOTO_TYPES.includes(file.type)) {
    throw new Error("Photo must be a JPG, PNG, or WebP image.");
  }
  if (file.size > PHOTO_MAX_BYTES) {
    throw new Error("Photo must be 500 KB or smaller.");
  }

  const dataUrl = await fileToDataUrl(file);
  const token = await getCurrentIdToken();
  const result = await uploadProfilePhotoFile(token, dataUrl, file.name, file.size);
  return result.url;
}

export async function deleteProfilePhoto(_uid: string): Promise<void> {
  try {
    const token = await getCurrentIdToken();
    await deleteProfilePhotoFile(token);
  } catch (err: unknown) {
    throw toUploadError(err, "We couldn't remove that photo. Please try again.");
  }
}

export async function uploadResume(
  _uid: string,
  file: File,
): Promise<{ url: string; name: string }> {
  if (file.type !== "application/pdf") {
    throw new Error("Resume must be a PDF.");
  }
  if (file.size > PDF_MAX_BYTES) {
    throw new Error("Resume must be 500 KB or smaller.");
  }

  const dataUrl = await fileToDataUrl(file);
  const token = await getCurrentIdToken();
  const result = await uploadResumeFile(token, dataUrl, file.name, file.size);
  return { url: result.url, name: result.name ?? file.name };
}

export async function deleteResume(_uid: string): Promise<void> {
  try {
    const token = await getCurrentIdToken();
    await deleteResumeFile(token);
  } catch (err: unknown) {
    throw toUploadError(err, "We couldn't remove that resume. Please try again.");
  }
}

export async function uploadCertificate(
  _uid: string,
  certId: string,
  file: File,
): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Certificate must be a PDF.");
  }
  if (file.size > PDF_MAX_BYTES) {
    throw new Error("Certificate must be 500 KB or smaller.");
  }

  const dataUrl = await fileToDataUrl(file);
  const token = await getCurrentIdToken();
  const result = await uploadCertificateFile(token, certId, dataUrl, file.name, file.size);
  return result.url;
}

export async function deleteCertificate(
  _uid: string,
  certId: string,
): Promise<void> {
  try {
    const token = await getCurrentIdToken();
    await deleteCertificateFile(token, certId);
  } catch (err: unknown) {
    throw toUploadError(err, "We couldn't remove that certificate. Please try again.");
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolvePromise, rejectPromise) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolvePromise(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => rejectPromise(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

function toUploadError(err: unknown, fallback: string): Error {
  const message = err instanceof Error ? err.message : String(err);
  return new Error(message || fallback);
}