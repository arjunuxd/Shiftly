import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import FormField, { FormError, SubmitButton } from "../ui/FormField";
import type { Job, JobRateType } from "../../types";
import { JOB_CATEGORIES, WORK_TYPES, RATE_TYPES } from "../../types";

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  JOB_CATEGORIES.map((c) => [c.value, c.label]),
);
const WORK_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  WORK_TYPES.map((w) => [w.value, w.label]),
);

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

export type JobFormData = Omit<
  Job,
  "id" | "vendorId" | "status" | "publishedAt" | "closedAt"
>;

const EMPTY_DATA: JobFormData = {
  title: "",
  description: "",
  jobCategory: "",
  workType: "",
  rateType: "hourly",
  rateAmount: 0,
  location: {
    city: "",
    state: "",
    country: "",
    address: "",
    area: "",
  },
  startDate: "",
  endDate: "",
  shiftStart: "",
  shiftEnd: "",
  spotsAvailable: 1,
};

interface JobFormProps {
  initialData?: JobFormData;
  onSubmit: (data: JobFormData) => Promise<void>;
  onCancel: () => void;
}

export function JobForm({ initialData, onSubmit, onCancel }: JobFormProps) {
  const [form, setForm] = useState<JobFormData>(initialData ?? EMPTY_DATA);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  function setField(field: keyof JobFormData, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
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

    if (!form.title.trim()) {
      setError("Job title is required.");
      return;
    }
    if (!form.description.trim()) {
      setError("Job description is required.");
      return;
    }
    if (!form.jobCategory) {
      setError("Please select a job category.");
      return;
    }
    if (!form.workType) {
      setError("Please select a work type.");
      return;
    }
    if (!form.rateAmount || form.rateAmount <= 0) {
      setError("Please enter a rate amount greater than zero.");
      return;
    }
    if (!form.location.city.trim() || !form.location.country.trim()) {
      setError("City and country are required for the job location.");
      return;
    }
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      setError("End date must be on or after the start date.");
      return;
    }
    if (form.shiftStart && form.shiftEnd && form.shiftStart >= form.shiftEnd) {
      setError("Shift end time must be after start time.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(form);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save job.");
    } finally {
      setSaving(false);
    }
  }

  const rateLabel =
    RATE_TYPES.find((r) => r.value === form.rateType)?.label ?? "rate";

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
      {error && <FormError>{error}</FormError>}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">
          Job saved successfully.
        </div>
      )}

      {/* Details */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeading
          title="Job Details"
          description="Describe the role you're hiring for."
        />
        <div className="flex flex-col gap-4">
          <FormField
            label="Job title"
            value={form.title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setField("title", e.target.value)}
            placeholder="e.g. Weekend Barista"
            required
          />
          <FormField
            label="Description"
            value={form.description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setField("description", e.target.value)}
            placeholder="Describe the responsibilities, requirements and expectations..."
            multiline
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Job category
              </label>
              <select
                value={form.jobCategory}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setField("jobCategory", e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Select a category...</option>
                {JOB_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Work type
              </label>
              <select
                value={form.workType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setField("workType", e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Select a work type...</option>
                {WORK_TYPES.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {form.jobCategory && (
            <p className="text-xs text-neutral-500">
              {CATEGORY_LABELS[form.jobCategory]} · {WORK_TYPE_LABELS[form.workType]}
            </p>
          )}
        </div>
      </section>

      {/* Compensation */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeading
          title="Compensation & Spots"
          description="Set the pay and how many people you need."
        />
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Rate type
              </label>
              <select
                value={form.rateType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setField("rateType", e.target.value as JobRateType)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {RATE_TYPES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <FormField
              label={`Amount (${rateLabel})`}
              type="number"
              min="0"
              step="0.01"
              value={String(form.rateAmount)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setField("rateAmount", Number(e.target.value))}
              placeholder="0.00"
            />
            <FormField
              label="Spots available"
              type="number"
              min="1"
              step="1"
              value={String(form.spotsAvailable)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setField("spotsAvailable", Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeading
          title="Schedule"
          description="Optional start/end dates and daily shift times."
        />
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Start date"
              type="date"
              value={form.startDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setField("startDate", e.target.value)}
            />
            <FormField
              label="End date"
              type="date"
              value={form.endDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setField("endDate", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Shift start time"
              type="time"
              value={form.shiftStart}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setField("shiftStart", e.target.value)}
            />
            <FormField
              label="Shift end time"
              type="time"
              value={form.shiftEnd}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setField("shiftEnd", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeading
          title="Job Location"
          description="Where the work takes place."
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
              label="Street address"
              value={form.location.address}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation("address", e.target.value)}
              placeholder="e.g. 123 Market Street"
            />
            <FormField
              label="Area"
              value={form.location.area ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation("area", e.target.value)}
              placeholder="e.g. Bandra West"
            />
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
          {saving ? "Saving..." : "Save Job"}
        </SubmitButton>
      </div>
    </form>
  );
}
