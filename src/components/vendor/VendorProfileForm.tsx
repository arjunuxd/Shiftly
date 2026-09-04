import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import FormField, { FormError, SubmitButton, FriendlyAlert } from "../ui/FormField";
import type { VendorProfile } from "../../types";
import { BUSINESS_TYPES } from "../../types";

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      )}
    </div>
  );
}

type VendorFormData = Omit<VendorProfile, "id" | "completeness" | "verification">;

interface VendorProfileFormProps {
  mode: "create" | "edit";
  initialData: VendorFormData;
  onSubmit: (data: VendorFormData) => Promise<void>;
  onCancel: () => void;
}

const EMPTY_DATA: VendorFormData = {
  businessInfo: {
    businessName: "",
    businessType: "",
    description: "",
    website: "",
    phone: "",
    contactEmail: "",
  },
  location: {
    city: "",
    state: "",
    country: "",
    address: "",
  },
};

export default function VendorProfileForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: VendorProfileFormProps) {
  const [form, setForm] = useState<VendorFormData>(
    initialData ?? EMPTY_DATA,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setForm(initialData ?? EMPTY_DATA);
  }, [initialData]);

  function setBusinessInfo(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      businessInfo: { ...prev.businessInfo, [field]: value },
    }));
  }

  function setLocation(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.businessInfo.businessName.trim()) {
      setError("Business name is required.");
      return;
    }
    if (!form.businessInfo.businessType) {
      setError("Please select a business type.");
      return;
    }
    if (!form.location.city.trim() || !form.location.state.trim() || !form.location.country.trim()) {
      setError("City, state/province and country are required.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(form);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save vendor profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
      {error && <FormError title="We couldn't save your profile">{error}</FormError>}
      {success && (
        <FriendlyAlert icon="success" title="Profile saved">
          Your business details are live.
        </FriendlyAlert>
      )}

      {/* Business Information */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeading
          title="Business Information"
          description="Basic details about your business."
        />
        <div className="flex flex-col gap-4">
          <FormField
            label="Business name"
            value={form.businessInfo.businessName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setBusinessInfo("businessName", e.target.value)}
            placeholder="e.g. Sunrise Café"
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Business type
            </label>
            <select
              value={form.businessInfo.businessType}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setBusinessInfo("businessType", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Select a business type...</option>
              {BUSINESS_TYPES.map((bt) => (
                <option key={bt.value} value={bt.value}>
                  {bt.label}
                </option>
              ))}
            </select>
          </div>
          <FormField
            label="Description"
            value={form.businessInfo.description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBusinessInfo("description", e.target.value)}
            placeholder="Describe your business and the work you offer..."
            multiline
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Website"
              type="url"
              value={form.businessInfo.website}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setBusinessInfo("website", e.target.value)}
              placeholder="https://example.com"
            />
            <FormField
              label="Phone"
              type="tel"
              value={form.businessInfo.phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setBusinessInfo("phone", e.target.value)}
              placeholder="+1 234 567 8900"
            />
          </div>
          <FormField
            label="Contact email"
            type="email"
            value={form.businessInfo.contactEmail}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setBusinessInfo("contactEmail", e.target.value)}
            placeholder="jobs@yourbusiness.com"
          />
        </div>
      </section>

      {/* Location */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeading
          title="Business Location"
          description="Where your business is based and where staff will work."
        />
        <div className="flex flex-col gap-4">
          <FormField
            label="Street address"
            value={form.location.address}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation("address", e.target.value)}
            placeholder="e.g. 123 Market Street"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              label="City"
              value={form.location.city}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation("city", e.target.value)}
              placeholder="e.g. Mumbai"
            />
            <FormField
              label="State / Province"
              value={form.location.state}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation("state", e.target.value)}
              placeholder="e.g. Maharashtra"
            />
            <FormField
              label="Country"
              value={form.location.country}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation("country", e.target.value)}
              placeholder="e.g. India"
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Cancel
        </button>
        <SubmitButton disabled={saving}>
          {saving
            ? "Saving..."
            : mode === "create"
              ? "Create Vendor Profile"
              : "Save Changes"}
        </SubmitButton>
      </div>
    </form>
  );
}
