const VALID_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const VALID_WORK_TYPES = [
  "part-time",
  "temporary",
  "freelance",
  "shift-based",
  "event-work",
];

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

export interface ValidationError {
  field: string;
  message: string;
}

export function validateRequiredString(
  value: unknown,
  fieldName: string,
  maxLength: number,
): ValidationError | null {
  if (typeof value !== "string") {
    return { field: fieldName, message: `${fieldName} must be a string.` };
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { field: fieldName, message: `${fieldName} is required.` };
  }
  if (trimmed.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at most ${maxLength} characters.`,
    };
  }
  return null;
}

export function validateOptionalString(
  value: unknown,
  fieldName: string,
  maxLength: number,
): ValidationError | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    return { field: fieldName, message: `${fieldName} must be a string.` };
  }
  if (value.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at most ${maxLength} characters.`,
    };
  }
  return null;
}

function validateSkill(skill: unknown, index: number): ValidationError | null {
  if (!skill || typeof skill !== "object") {
    return { field: `skills[${index}]`, message: "Each skill must be an object." };
  }
  const s = skill as Record<string, unknown>;
  const nameErr = validateRequiredString(s.name, `skills[${index}].name`, 50);
  if (nameErr) return nameErr;
  const catErr = validateRequiredString(s.category, `skills[${index}].category`, 50);
  if (catErr) return catErr;
  return null;
}

function validateExperience(exp: unknown, index: number): ValidationError | null {
  if (!exp || typeof exp !== "object") {
    return { field: `experience[${index}]`, message: "Each experience entry must be an object." };
  }
  const e = exp as Record<string, unknown>;

  const roleErr = validateRequiredString(e.role, `experience[${index}].role`, 100);
  if (roleErr) return roleErr;

  const orgErr = validateRequiredString(e.organization, `experience[${index}].organization`, 100);
  if (orgErr) return orgErr;

  const descErr = validateOptionalString(e.description, `experience[${index}].description`, 1000);
  if (descErr) return descErr;

  const startErr = validateRequiredString(e.startDate, `experience[${index}].startDate`, 20);
  if (startErr) return startErr;
  if (!/^\d{4}-\d{2}-\d{2}$/.test((e.startDate as string).trim())) {
    return { field: `experience[${index}].startDate`, message: "Start date must be in YYYY-MM-DD format." };
  }

  if (e.currentlyWorking !== true) {
    const endErr = validateRequiredString(e.endDate, `experience[${index}].endDate`, 20);
    if (endErr) return endErr;
    if (!/^\d{4}-\d{2}-\d{2}$/.test((e.endDate as string).trim())) {
      return { field: `experience[${index}].endDate`, message: "End date must be in YYYY-MM-DD format." };
    }
    if ((e.startDate as string) > (e.endDate as string)) {
      return { field: `experience[${index}]`, message: "End date must be after start date." };
    }
  }

  return null;
}

function validateEducation(edu: unknown, index: number): ValidationError | null {
  if (!edu || typeof edu !== "object") {
    return { field: `education[${index}]`, message: "Each education entry must be an object." };
  }
  const e = edu as Record<string, unknown>;

  const instErr = validateRequiredString(e.institution, `education[${index}].institution`, 100);
  if (instErr) return instErr;

  const qualErr = validateRequiredString(e.qualification, `education[${index}].qualification`, 100);
  if (qualErr) return qualErr;

  const fieldErr = validateRequiredString(e.fieldOfStudy, `education[${index}].fieldOfStudy`, 100);
  if (fieldErr) return fieldErr;

  const currentYear = new Date().getFullYear();
  if (typeof e.startYear !== "number" || !Number.isInteger(e.startYear) || e.startYear < 1900 || e.startYear > currentYear) {
    return { field: `education[${index}].startYear`, message: `Start year must be between 1900 and ${currentYear}.` };
  }
  if (typeof e.endYear !== "number" || !Number.isInteger(e.endYear) || e.endYear < 1900 || e.endYear > currentYear + 10) {
    return { field: `education[${index}].endYear`, message: `End year must be between 1900 and ${currentYear + 10}.` };
  }
  if (e.endYear < e.startYear) {
    return { field: `education[${index}]`, message: "End year must be after start year." };
  }

  return null;
}

function validateAvailabilityDay(day: unknown, index: number): ValidationError | null {
  if (!day || typeof day !== "object") {
    return { field: `availability[${index}]`, message: "Each availability entry must be an object." };
  }
  const d = day as Record<string, unknown>;

  if (!VALID_DAYS.includes(d.day as string)) {
    return { field: `availability[${index}].day`, message: `Day must be one of: ${VALID_DAYS.join(", ")}.` };
  }

  if (typeof d.startTime !== "string" || !/^\d{2}:\d{2}$/.test(d.startTime)) {
    return { field: `availability[${index}].startTime`, message: "Start time must be in HH:MM format." };
  }
  if (typeof d.endTime !== "string" || !/^\d{2}:\d{2}$/.test(d.endTime)) {
    return { field: `availability[${index}].endTime`, message: "End time must be in HH:MM format." };
  }
  if (d.startTime >= d.endTime) {
    return { field: `availability[${index}]`, message: "End time must be after start time." };
  }

  return null;
}

export function validateProfile(body: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== "object") {
    return [{ field: "body", message: "Request body must be a JSON object." }];
  }

  const b = body as Record<string, unknown>;

  if (b.personalInfo && typeof b.personalInfo === "object") {
    const pi = b.personalInfo as Record<string, unknown>;
    const nameErr = validateRequiredString(pi.fullName, "personalInfo.fullName", 100);
    if (nameErr) errors.push(nameErr);
    const bioErr = validateOptionalString(pi.bio, "personalInfo.bio", 500);
    if (bioErr) errors.push(bioErr);
    const phoneErr = validateOptionalString(pi.phone, "personalInfo.phone", 20);
    if (phoneErr) errors.push(phoneErr);
  }

  if (b.skills !== undefined) {
    if (!Array.isArray(b.skills)) {
      errors.push({ field: "skills", message: "Skills must be an array." });
    } else if (b.skills.length > 20) {
      errors.push({ field: "skills", message: "Skills must contain at most 20 items." });
    } else {
      const seen = new Set<string>();
      for (let i = 0; i < b.skills.length; i++) {
        const err = validateSkill(b.skills[i], i);
        if (err) {
          errors.push(err);
        } else {
          const name = ((b.skills[i] as Record<string, unknown>).name as string).toLowerCase().trim();
          if (seen.has(name)) {
            errors.push({ field: `skills[${i}].name`, message: "Duplicate skill names are not allowed." });
          }
          seen.add(name);
        }
      }
    }
  }

  if (b.experience !== undefined) {
    if (!Array.isArray(b.experience)) {
      errors.push({ field: "experience", message: "Experience must be an array." });
    } else if (b.experience.length > 20) {
      errors.push({ field: "experience", message: "Experience must contain at most 20 items." });
    } else {
      for (let i = 0; i < b.experience.length; i++) {
        const err = validateExperience(b.experience[i], i);
        if (err) errors.push(err);
      }
    }
  }

  if (b.education !== undefined) {
    if (!Array.isArray(b.education)) {
      errors.push({ field: "education", message: "Education must be an array." });
    } else if (b.education.length > 10) {
      errors.push({ field: "education", message: "Education must contain at most 10 items." });
    } else {
      for (let i = 0; i < b.education.length; i++) {
        const err = validateEducation(b.education[i], i);
        if (err) errors.push(err);
      }
    }
  }

  if (b.availability !== undefined) {
    if (!Array.isArray(b.availability)) {
      errors.push({ field: "availability", message: "Availability must be an array." });
    } else if (b.availability.length > 7) {
      errors.push({ field: "availability", message: "Availability must contain at most 7 entries." });
    } else {
      const seenDays = new Set<string>();
      for (let i = 0; i < b.availability.length; i++) {
        const err = validateAvailabilityDay(b.availability[i], i);
        if (err) {
          errors.push(err);
        } else {
          const day = (b.availability[i] as Record<string, unknown>).day as string;
          if (seenDays.has(day)) {
            errors.push({ field: `availability[${i}].day`, message: `Duplicate day: ${day}.` });
          }
          seenDays.add(day);
        }
      }
    }
  }

  if (b.workPreferences !== undefined) {
    if (!b.workPreferences || typeof b.workPreferences !== "object") {
      errors.push({ field: "workPreferences", message: "Work preferences must be an object." });
    } else {
      const wp = b.workPreferences as Record<string, unknown>;
      if (!Array.isArray(wp.jobCategories)) {
        errors.push({ field: "workPreferences.jobCategories", message: "Job categories must be an array." });
      } else if (wp.jobCategories.length === 0) {
        errors.push({ field: "workPreferences.jobCategories", message: "Select at least one job category." });
      } else {
        for (const cat of wp.jobCategories) {
          if (!VALID_JOB_CATEGORIES.includes(cat as string)) {
            errors.push({ field: "workPreferences.jobCategories", message: `Invalid job category: ${cat}.` });
          }
        }
      }
      if (!Array.isArray(wp.workTypes)) {
        errors.push({ field: "workPreferences.workTypes", message: "Work types must be an array." });
      } else if (wp.workTypes.length === 0) {
        errors.push({ field: "workPreferences.workTypes", message: "Select at least one work type." });
      } else {
        for (const wt of wp.workTypes) {
          if (!VALID_WORK_TYPES.includes(wt as string)) {
            errors.push({ field: "workPreferences.workTypes", message: `Invalid work type: ${wt}.` });
          }
        }
      }
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
    }
  }

  return errors;
}

export function validateExperienceArray(items: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!Array.isArray(items)) {
    return [{ field: "experience", message: "Experience must be an array." }];
  }
  if (items.length > 20) {
    return [{ field: "experience", message: "Experience must contain at most 20 items." }];
  }
  for (let i = 0; i < items.length; i++) {
    const err = validateExperience(items[i], i);
    if (err) errors.push(err);
  }
  return errors;
}

export function validateEducationArray(items: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!Array.isArray(items)) {
    return [{ field: "education", message: "Education must be an array." }];
  }
  if (items.length > 10) {
    return [{ field: "education", message: "Education must contain at most 10 items." }];
  }
  for (let i = 0; i < items.length; i++) {
    const err = validateEducation(items[i], i);
    if (err) errors.push(err);
  }
  return errors;
}
