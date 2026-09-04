import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { app } from "./firebase";

const storage = getStorage(app);

const PHOTO_MAX_BYTES = 500 * 1024;
const RESUME_MAX_BYTES = 200 * 1024;

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadProfilePhoto(
  uid: string,
  file: File,
): Promise<string> {
  if (!PHOTO_TYPES.includes(file.type)) {
    throw new Error("Photo must be JPEG, PNG, or WebP.");
  }
  if (file.size > PHOTO_MAX_BYTES) {
    throw new Error("Photo must be under 500 KB.");
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const storageRef = ref(storage, `profile-photos/${uid}/photo.${ext}`);

  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function deleteProfilePhoto(uid: string): Promise<void> {
  const extensions = ["jpg", "jpeg", "png", "webp"];
  for (const ext of extensions) {
    try {
      const storageRef = ref(storage, `profile-photos/${uid}/photo.${ext}`);
      await deleteObject(storageRef);
      return;
    } catch {
      // try next extension
    }
  }
}

export async function uploadResume(
  uid: string,
  file: File,
): Promise<{ url: string; name: string }> {
  if (file.type !== "application/pdf") {
    throw new Error("Resume must be a PDF.");
  }
  if (file.size > RESUME_MAX_BYTES) {
    throw new Error("Resume must be under 200 KB.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const storageRef = ref(storage, `resumes/${uid}/${safeName}`);

  await uploadBytes(storageRef, file, { contentType: "application/pdf" });
  const url = await getDownloadURL(storageRef);
  return { url, name: file.name };
}

export async function deleteResume(uid: string): Promise<void> {
  const storageRef = ref(storage, `resumes/${uid}`);
  try {
    const listResult = await import("firebase/storage").then((m) =>
      m.listAll(storageRef),
    );
    await Promise.all(listResult.items.map((item) => deleteObject(item)));
  } catch {
    // no-op if folder doesn't exist
  }
}

export async function uploadCertificate(
  uid: string,
  certId: string,
  file: File,
): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Certificate must be a PDF.");
  }
  if (file.size > RESUME_MAX_BYTES) {
    throw new Error("Certificate must be under 200 KB.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const storageRef = ref(storage, `certificates/${uid}/${certId}/${safeName}`);

  await uploadBytes(storageRef, file, { contentType: "application/pdf" });
  return getDownloadURL(storageRef);
}
