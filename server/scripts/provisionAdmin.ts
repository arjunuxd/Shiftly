/**
 * Secure Superadmin provisioning script.
 *
 * This is a CONTROLLED, server-side, manually-run process.
 * It is NOT exposed as a public endpoint and must never be reachable
 * from the frontend. Run it with the backend service-account configured.
 *
 * Usage (from server/):
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json \
 *   node --import tsx scripts/provisionAdmin.ts <email>
 *
 * Security notes:
 *  - Requires the Firebase Admin service-account (server-only).
 *  - Sets the "superadmin" custom claim + user document.
 *  - Never pass admin credentials or this capability through the frontend.
 */

import { resolve } from "node:path";
import { existsSync } from "node:fs";
import admin from "firebase-admin";

const email = process.argv[2];

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage: provisionAdmin.ts <email>");
  process.exit(1);
}

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccountPath || !existsSync(resolve(serviceAccountPath))) {
  console.error(
    "GOOGLE_APPLICATION_CREDENTIALS must point to a valid service-account JSON file.",
  );
  process.exit(1);
}

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(resolve(serviceAccountPath)),
  });
}

async function main(): Promise<void> {
  const existing = await admin.auth().getUserByEmail(email).catch(() => null);

  let uid: string;
  if (existing) {
    uid = existing.uid;
  } else {
    const created = await admin
      .auth()
      .createUser({ email })
      .catch((createError: unknown) => {
        if (
          createError &&
          typeof createError === "object" &&
          "code" in createError &&
          (createError as { code: string }).code === "auth/email-already-exists"
        ) {
          return admin.auth().getUserByEmail(email);
        }
        throw createError;
      });
    uid = created.uid;
  }

  await admin.auth().setCustomUserClaims(uid, { role: "superadmin" });

  const now = admin.firestore.FieldValue.serverTimestamp();
  await admin
    .firestore()
    .collection("users")
    .doc(uid)
    .set(
      {
        uid,
        email,
        role: "superadmin",
        status: "active",
        suspendedAt: null,
        suspensionReason: null,
        suspendedBy: null,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );

  console.log(
    `Superadmin provisioned for ${email} (uid=${uid}). Ask the user to sign out and sign back in to refresh the token.`,
  );
}

main().catch((error) => {
  console.error("Provisioning failed:", error);
  process.exitCode = 1;
});
