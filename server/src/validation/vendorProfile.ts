import {
  validateRequiredString,
  validateOptionalString,
  type ValidationError,
} from "./profile.js";

const VALID_BUSINESS_TYPES = [
  "cafe-restaurant",
  "retail-store",
  "warehouse-logistics",
  "event-agency",
  "office-administration",
  "healthcare-facility",
  "education-facility",
  "cleaning-services",
  "hospitality-services",
  "construction",
  "technology",
  "other",
];

export function validateVendorProfile(body: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== "object") {
    return [{ field: "body", message: "Request body must be a JSON object." }];
  }

  const b = body as Record<string, unknown>;

  if (b.businessInfo !== undefined) {
    if (!b.businessInfo || typeof b.businessInfo !== "object") {
      errors.push({ field: "businessInfo", message: "Business info must be an object." });
    } else {
      const bi = b.businessInfo as Record<string, unknown>;
      const nameErr = validateRequiredString(bi.businessName, "businessInfo.businessName", 120);
      if (nameErr) errors.push(nameErr);
      const typeErr = validateRequiredString(bi.businessType, "businessInfo.businessType", 60);
      if (typeErr) errors.push(typeErr);
      if (typeof bi.businessType === "string" && !VALID_BUSINESS_TYPES.includes(bi.businessType.trim())) {
        errors.push({
          field: "businessInfo.businessType",
          message: `Business type must be one of: ${VALID_BUSINESS_TYPES.join(", ")}.`,
        });
      }
      const descErr = validateOptionalString(bi.description, "businessInfo.description", 1000);
      if (descErr) errors.push(descErr);
      const websiteErr = validateOptionalString(bi.website, "businessInfo.website", 200);
      if (websiteErr) errors.push(websiteErr);
      if (typeof bi.website === "string" && bi.website.trim().length > 0 && !/^https?:\/\/\S+$/.test(bi.website.trim())) {
        errors.push({ field: "businessInfo.website", message: "Website must be a valid http(s) URL." });
      }
      const phoneErr = validateOptionalString(bi.phone, "businessInfo.phone", 20);
      if (phoneErr) errors.push(phoneErr);
      const contactEmailErr = validateOptionalString(bi.contactEmail, "businessInfo.contactEmail", 200);
      if (contactEmailErr) errors.push(contactEmailErr);
      if (typeof bi.contactEmail === "string" && bi.contactEmail.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bi.contactEmail.trim())) {
        errors.push({ field: "businessInfo.contactEmail", message: "Contact email must be a valid email address." });
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
      const addressErr = validateOptionalString(loc.address, "location.address", 300);
      if (addressErr) errors.push(addressErr);
    }
  }

  return errors;
}
