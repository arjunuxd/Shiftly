import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

const isProduction = process.env.NODE_ENV === "production";

if (!isProduction && existsSync(".env")) {
  loadEnvFile();
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0),
} as const;
