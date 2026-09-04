import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler.js";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function sweepExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix: string;
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, keyPrefix } = options;

  return (req: Request, _res: Response, next: NextFunction): void => {
    const now = Date.now();

    if (buckets.size > 10000) {
      sweepExpired(now);
    }

    const auth = req.header("authorization");
    const token = /^Bearer\s+(.+)$/i.exec(auth ?? "")?.[1] ?? "anon";
    const key = `${keyPrefix}:${req.ip}:${token}`;

    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (bucket.count >= max) {
      next(
        new AppError(
          429,
          "Too many requests. Please slow down and try again later.",
        ),
      );
      return;
    }

    bucket.count += 1;
    next();
  };
}
