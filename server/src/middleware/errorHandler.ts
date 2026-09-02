import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof Error) {
    const status = "status" in err ? Number((err as { status: unknown }).status) : NaN;

    if (Number.isInteger(status) && status >= 400 && status < 500) {
      res.status(status).json({ error: "Invalid request" });
      return;
    }

    if (env.nodeEnv !== "production") {
      console.error("Unhandled error:", err);
    }
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
}
