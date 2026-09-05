const SENTINELS = new Set([
  "PROFILE_NOT_FOUND",
  "VENDOR_PROFILE_NOT_FOUND",
  "JOB_NOT_FOUND",
  "APPLICATION_NOT_FOUND",
]);

const TECHNICAL_PATTERNS: RegExp[] = [
  /\bstatus\s+\d{3}\b/i,
  /network ?error/i,
  /\bfailed to fetch\b/i,
  /\bload failed\b/i,
  /net_err_/i,
  /err_internet/i,
  /^undefined$/i,
  /internal server error/i,
  /gateway timeout|bad gateway/i,
  /service unavailable/i,
  /request failed/i,
  /\baxios\w*\b/i,
  /\bfirebase\w*\b/i,
  /^error:/i,
  /\berr_[a-z0-9]+/i,
  /unexpected token/i,
  /\bjson\.parse\b/i,
  /\bcannot read propert/i,
  /is not defined$|is not a function$/i,
  /\bat\s+[\w$]+\.\w+|at file:\/\//i,
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i,
];

function looksTechnical(message: string): boolean {
  return TECHNICAL_PATTERNS.some((pattern) => pattern.test(message));
}

export function isApiErrorSentinel(message: string | null | undefined): boolean {
  return SENTINELS.has((message ?? "").trim());
}

export function humanizeApiError(
  message: string | null | undefined,
  fallback: string,
): string {
  const normalized = (message ?? "").trim();

  if (isApiErrorSentinel(normalized)) {
    return normalized;
  }

  if (!normalized) {
    return fallback;
  }

  if (normalized.length > 160 || looksTechnical(normalized)) {
    return fallback;
  }

  return normalized;
}

export function getFriendlyError(
  err: unknown,
  fallback: string,
): string {
  const message = err instanceof Error ? err.message : String(err);
  return humanizeApiError(message, fallback);
}