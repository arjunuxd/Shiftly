import type { NextFunction, Request, Response } from "express";
import { getAdminAuth, isAdminReady } from "../config/firebaseAdmin.js";
import { AppError } from "./errorHandler.js";
import type { Role } from "../types/auth.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string | null;
    emailVerified: boolean;
    role: Role | null;
  };
}

function extractBearerToken(header: string | undefined): string | null {
  if (!header) {
    return null;
  }
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1] : null;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!isAdminReady()) {
      throw new AppError(503, "Authentication service unavailable");
    }

    const token = extractBearerToken(req.header("authorization"));
    if (!token) {
      throw new AppError(401, "Authentication required");
    }

    const decoded = await getAdminAuth().verifyIdToken(token);

    const role = typeof decoded.role === "string" ? (decoded.role as Role) : null;

    req.user = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      emailVerified: decoded.email_verified === true,
      role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError(401, "Invalid or expired authentication token"));
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      next(new AppError(403, "Insufficient permissions"));
      return;
    }
    next();
  };
}
