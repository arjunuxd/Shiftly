import {
  validateRequiredString,
  validateOptionalString,
  type ValidationError,
} from "./profile.js";

const VALID_JOB_CATEGORIES = [
  "hospitality",
  "retail",
  "logistics",
  "events",
  "office",
  "healthcare",
  "education",
  "technology",
  "creative",
  "other",
];

const VALID_WORK_TYPES = [
  "part-time",
  "temporary",
  "freelance",
  "shift-based",
  "event-work",
];

const VALID_RATE_TYPES = ["hourly", "daily", "fixed"];

const VALID_STATUSES = ["draft", "published", "closed"];

function isValidEnum(value: unknown, allowed: string[]): boolean {
  return typeof value === "string" && allowed.includes(value);
}

function validateDate(
  value: unknown,
  fieldName: string,
  errors: ValidationError[],
): void {
  if (typeof value === "string" && value.trim().length > 0 && !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    errors.push({ field: fieldName, message: `${fieldName} must be in YYYY-MM-DD format.` });
  }
}

function validateTime(
  value: unknown,
  fieldName: string,
  errors: ValidationError[],
): void {
  if (typeof value === "string" && value.trim().length > 0 && !/^\d{2}:\d{2}$/.test(value.trim())) {
    errors.push({ field: fieldName, message: `${fieldName} must be in HH:MM format.` });
  }
}

export function validateJobFields(body: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== "object") {
    return [{ field: "body", message: "Request body must be a JSON object." }];
  }

  const b = body as Record<string, unknown>;

  if (b.title !== undefined) {
    const err = validateRequiredString(b.title, "title", 150);
    if (err) errors.push(err);
  }

  if (b.description !== undefined) {
    const err = validateRequiredString(b.description, "description", 3000);
    if (err) errors.push(err);
  }

  if (b.jobCategory !== undefined && !isValidEnum(b.jobCategory, VALID_JOB_CATEGORIES)) {
    errors.push({
      field: "jobCategory",
      message: `Job category must be one of: ${VALID_JOB_CATEGORIES.join(", ")}.`,
    });
  }

  if (b.workType !== undefined && !isValidEnum(b.workType, VALID_WORK_TYPES)) {
    errors.push({
      field: "workType",
      message: `Work type must be one of: ${VALID_WORK_TYPES.join(", ")}.`,
    });
  }

  if (b.rateType !== undefined && !isValidEnum(b.rateType, VALID_RATE_TYPES)) {
    errors.push({
      field: "rateType",
      message: `Rate type must be one of: ${VALID_RATE_TYPES.join(", ")}.`,
    });
  }

  if (b.rateAmount !== undefined) {
    if (typeof b.rateAmount !== "number" || !Number.isFinite(b.rateAmount) || b.rateAmount <= 0) {
      errors.push({ field: "rateAmount", message: "Rate amount must be a positive number." });
    } else if (b.rateAmount > 100000) {
      errors.push({ field: "rateAmount", message: "Rate amount must be at most 100000." });
    }
  }

  if (b.spotsAvailable !== undefined) {
    if (typeof b.spotsAvailable !== "number" || !Number.isInteger(b.spotsAvailable) || b.spotsAvailable < 1) {
      errors.push({ field: "spotsAvailable", message: "Spots available must be a positive integer." });
    } else if (b.spotsAvailable > 1000) {
      errors.push({ field: "spotsAvailable", message: "Spots available must be at most 1000." });
    }
  }

  if (b.location !== undefined) {
    if (!b.location || typeof b.location !== "object") {
      errors.push({ field: "location", message: "Location must be an object." });
    } else {
      const loc = b.location as Record<string, unknown>;
      const cityErr = validateRequiredString(loc.city, "location.city", 100);
      if (cityErr) errors.push(cityErr);
      const stateErr = validateRequiredString(loc.state, "location.state", 100);
      if (stateErr) errors.push(stateErr);
      const countryErr = validateRequiredString(loc.country, "location.country", 100);
      if (countryErr) errors.push(countryErr);
      const addressErr = validateOptionalString(loc.address, "location.address", 300);
      if (addressErr) errors.push(addressErr);
      const areaErr = validateOptionalString(loc.area, "location.area", 100);
      if (areaErr) errors.push(areaErr);
    }
  }

  validateDate(b.startDate, "startDate", errors);
  validateDate(b.endDate, "endDate", errors);
  if (typeof b.startDate === "string" && typeof b.endDate === "string" && b.startDate.trim() && b.endDate.trim()) {
    if (b.startDate > b.endDate) {
      errors.push({ field: "endDate", message: "End date must be on or after start date." });
    }
  }

  validateTime(b.shiftStart, "shiftStart", errors);
  validateTime(b.shiftEnd, "shiftEnd", errors);
  if (typeof b.shiftStart === "string" && typeof b.shiftEnd === "string" && b.shiftStart.trim() && b.shiftEnd.trim()) {
    if (b.shiftStart >= b.shiftEnd) {
      errors.push({ field: "shiftEnd", message: "Shift end time must be after shift start time." });
    }
  }

  return errors;
}

export function validateJobStatusTransition(
  current: string | undefined,
  requested: string,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isValidEnum(requested, VALID_STATUSES)) {
    return [{
      field: "status",
      message: `Status must be one of: ${VALID_STATUSES.join(", ")}.`,
    }];
  }

  const from = current ?? "draft";

  const allowed: Record<string, string[]> = {
    draft: ["published"],
    published: ["closed"],
    closed: [],
  };

  if (!(allowed[from] ?? []).includes(requested)) {
    errors.push({
      field: "status",
      message: `Invalid status transition from "${from}" to "${requested}".`,
    });
  }

  return errors;
}

export function validateJobStatusValue(value: unknown): boolean {
  return isValidEnum(value, VALID_STATUSES);
}
