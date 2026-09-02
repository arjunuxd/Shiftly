import cors from "cors";
import type { CorsOptions } from "cors";
import { env } from "../config/env.js";
import { AppError } from "./errorHandler.js";

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (env.allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new AppError(403, "Origin not allowed by CORS"));
  },
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
