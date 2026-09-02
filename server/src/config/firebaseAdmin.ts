import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  applicationDefault,
  cert,
  getApp,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let initialized = false;
let initError: string | null = null;

function readServiceAccountPath(): string | undefined {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!raw || raw.trim().length === 0) {
    return undefined;
  }
  return resolve(raw.trim());
}

function appExists(): boolean {
  try {
    getApp();
    return true;
  } catch {
    return false;
  }
}

export function ensureAdminInitialized(): void {
  if (initialized) {
    return;
  }

  if (appExists()) {
    initialized = true;
    return;
  }

  try {
    const serviceAccountPath = readServiceAccountPath();

    if (serviceAccountPath) {
      if (!existsSync(serviceAccountPath)) {
        throw new Error(
          `GOOGLE_APPLICATION_CREDENTIALS points to a missing file: ${serviceAccountPath}`,
        );
      }
      initializeApp({
        credential: cert(serviceAccountPath),
      });
    } else {
      initializeApp({
        credential: applicationDefault(),
      });
    }

    initialized = true;
  } catch (error) {
    initError =
      error instanceof Error
        ? error.message
        : "Unknown Firebase Admin initialization error";
  }
}

export function isAdminReady(): boolean {
  ensureAdminInitialized();
  return initialized;
}

export function getAdminAuth(): ReturnType<typeof getAuth> {
  ensureAdminInitialized();
  if (!initialized) {
    throw new Error(
      "Firebase Admin SDK is not configured. Set GOOGLE_APPLICATION_CREDENTIALS to a valid service-account JSON path.",
    );
  }
  return getAuth();
}

export function getAdminFirestore(): ReturnType<typeof getFirestore> {
  ensureAdminInitialized();
  if (!initialized) {
    throw new Error(
      "Firebase Admin SDK is not configured. Set GOOGLE_APPLICATION_CREDENTIALS to a valid service-account JSON path.",
    );
  }
  return getFirestore();
}

export function adminInitError(): string | null {
  return initError;
}
