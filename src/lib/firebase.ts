import { initializeApp } from "firebase/app";
import {
  firebaseClientConfig,
  isFirebaseClientConfigured,
} from "./config";

if (!isFirebaseClientConfigured()) {
  throw new Error(
    "Firebase client is not configured. Copy .env.example to .env.local and fill in the Firebase web app configuration values.",
  );
}

export const app = initializeApp(firebaseClientConfig);
