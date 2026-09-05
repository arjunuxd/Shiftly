import app from "./app.js";
import { env } from "./config/env.js";
import {
  isAdminReady,
  adminInitError,
} from "./config/firebaseAdmin.js";

app.listen(env.port, () => {
  console.log(`Shiftly backend listening on port ${env.port}`);

  if (isAdminReady()) {
    console.log("Firebase Admin SDK: ready");
  } else {
    console.error(
      `Firebase Admin SDK: NOT configured. Set GOOGLE_APPLICATION_CREDENTIALS in server/.env to a service-account JSON path.${adminInitError() ? ` (${adminInitError()})` : ""}`,
    );
    console.error(
      "Authenticated endpoints (login role resolution, profiles, jobs, admin) will return 503 until fixed.",
    );
  }
});
