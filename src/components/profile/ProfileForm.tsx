import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import FormField, { FormError, SubmitButton } from "../ui/FormField";
import type { Profile } from "../../types";

const JOB_CATEGORY_OPTIONS = [
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

const WORK_TYPE_OPTIONS = ["part-time", "temporary", "freelance", "shift-based", "event-work"];

const SKILL_CATEGORY_OPTIONS = [
  "Hospitality",
  "Customer Service",
  "Retail",
  "Admin",
  "Technical",
  "Creative",
  "Physical",
  "Transport",
  "Other",
];

const WORK_TYPE_LABELS: Record<string, string> = {
  "part-time": "Part-time",
  "temporary": "Temporary",
  freelance: "Freelance",
  "shift-based": "Shift-based",
  "event-work": "Event work",
};

const CATEGORY_LABELS: Record<string, string> = {
  hospitality: "Hospitality",
  retail: "Retail",
  logistics: "Logistics",
  events: "Events",
  office: "Office",
  healthcare: "Healthcare",
  education: "Education",
  technology: "Technology",
  creative: "Creative",
  other: "Other",
};

function newId(): string {
  return Math.random().toString(36).slice(2, 11);
}

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

function CheckboxGroup({
  options,
  selected,
  onChange,
  labels,
}: {
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  labels: Record<string, string>;
}) {
  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label
          key={opt}
          className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors ${
            selected.includes(opt)
              ? "border-primary-500 bg-primary-50 text-primary-700"
              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
          }`}
        >
          <input
            type="checkbox"
            className="sr-only"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
          />
          {labels[opt] ?? opt}
        </label>
      ))}
    </div>
  );
}

interface ProfileFormProps {
  mode: "create" | "edit";
  initialData: Omit<Profile, "id" | "completeness">;
  onSubmit: (data: Omit<Profile, "id" | "completeness">) => Promise<void>;
  onCancel: () => void;
}

export default function ProfileForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  const [form, setForm] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  function setPersonalInfo(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  }

  function setLocation(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  }

  function setWorkPreferences(
    field: "jobCategories" | "workTypes",
    values: string[],
  ) {
    setForm((prev) => ({
      ...prev,
      workPreferences: { ...prev.workPreferences, [field]: values },
    }));
  }

  function addSkill() {
    setForm((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: "", category: "Other" }],
    }));
  }

  function updateSkill(index: number, field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.map((s, i) =>
        i === index ? { ...s, [field]: value } : s,
      ),
    }));
  }

  function removeSkill(index: number) {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }

  function addExperience() {
    setForm((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: newId(),
          role: "",
          organization: "",
          description: "",
          startDate: "",
          endDate: "",
          currentlyWorking: false,
        },
      ],
    }));
  }

  function updateExperience(index: number, field: string, value: unknown) {
    setForm((prev) => ({
      ...prev,
      experience: prev.experience.map((e, i) =>
        i === index ? { ...e, [field]: value } : e,
      ),
    }));
  }

  function removeExperience(index: number) {
    setForm((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }

  function addEducation() {
    setForm((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: newId(),
          institution: "",
          qualification: "",
          fieldOfStudy: "",
          startYear: new Date().getFullYear(),
          endYear: new Date().getFullYear(),
        },
      ],
    }));
  }

  function updateEducation(index: number, field: string, value: unknown) {
    setForm((prev) => ({
      ...prev,
      education: prev.education.map((e, i) =>
        i === index ? { ...e, [field]: value } : e,
      ),
    }));
  }

  function removeEducation(index: number) {
    setForm((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }

  function updateAvailability(index: number, field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.map((a, i) =>
        i === index ? { ...a, [field]: value } : a,
      ),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.personalInfo.fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(form);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
      {error && <FormError>{error}</FormError>}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">
          Profile saved successfully.
        </div>
      )}

      {/* Personal Information */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeading
          title="Personal Information"
          description="Basic details about you."
        />
        <div className="flex flex-col gap-4">
          <FormField
            label="Full name"
            value={form.personalInfo.fullName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPersonalInfo("fullName", e.target.value)}
            placeholder="Jane Smith"
            required
          />
          <FormField
            label="Bio"
            value={form.personalInfo.bio}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPersonalInfo("bio", e.target.value)}
            placeholder="Tell employers about yourself..."
            multiline
          />
          <FormField
            label="Phone number"
            type="tel"
            value={form.personalInfo.phone}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPersonalInfo("phone", e.target.value)}
            placeholder="+1 234 567 8900"
          />
        </div>
      </section>

      {/* Skills */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeading
          title="Skills"
          description="Add skills that are relevant to the work you're looking for."
        />
        <div className="flex flex-col gap-3">
          {form.skills.map((skill, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <FormField
                  label={i === 0 ? "Skill name" : undefined}
                  value={skill.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateSkill(i, "name", e.target.value)}
                  placeholder="e.g. Customer Service"
                />
              </div>
              <div className="w-full sm:w-48">
                {i === 0 && (
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Category
                  </label>
                )}
                <select
                  value={skill.category}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => updateSkill(i, "category", e.target.value)}
                  className={`w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    i !== 0 ? "mt-0 sm:mt-0.5" : ""
                  }`}
                >
                  {SKILL_CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeSkill(i)}
                className="shrink-0 rounded-lg border border-neutral-200 p-2.5 text-neutral-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove skill ${skill.name || i + 1}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSkill}
            className="self-start rounded-lg border border-dashed border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            + Add skill
          </button>
        </div>
      </section>

      {/* Experience */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeading
          title="Work Experience"
          description="Relevant work experience."
        />
        <div className="flex flex-col gap-6">
          {form.experience.map((exp, i) => (
            <div
              key={exp.id}
              className="relative rounded-lg border border-neutral-100 bg-neutral-50 p-4"
            >
              <button
                type="button"
                onClick={() => removeExperience(i)}
                className="absolute right-3 top-3 rounded p-1 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove experience ${i + 1}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Role / title"
                    value={exp.role}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateExperience(i, "role", e.target.value)}
                    placeholder="e.g. Barista"
                  />
                  <FormField
                    label="Organization"
                    value={exp.organization}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateExperience(i, "organization", e.target.value)
                    }
                    placeholder="e.g. Coffee House Ltd"
                  />
                </div>
                <FormField
                  label="Description"
                  value={exp.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    updateExperience(i, "description", e.target.value)
                  }
                  placeholder="Brief description of your role..."
                  multiline
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Start date"
                    type="date"
                    value={exp.startDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateExperience(i, "startDate", e.target.value)
                    }
                  />
                  {!exp.currentlyWorking && (
                    <FormField
                      label="End date"
                      type="date"
                      value={exp.endDate}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateExperience(i, "endDate", e.target.value)
                      }
                    />
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm text-neutral-600">
                  <input
                    type="checkbox"
                    checked={exp.currentlyWorking}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateExperience(i, "currentlyWorking", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-neutral-300 accent-primary-600"
                  />
                  Currently working here
                </label>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addExperience}
            className="self-start rounded-lg border border-dashed border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            + Add experience
          </button>
        </div>
      </section>

      {/* Education */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeading
          title="Education"
          description="Your educational background."
        />
        <div className="flex flex-col gap-6">
          {form.education.map((edu, i) => (
            <div
              key={edu.id}
              className="relative rounded-lg border border-neutral-100 bg-neutral-50 p-4"
            >
              <button
                type="button"
                onClick={() => removeEducation(i)}
                className="absolute right-3 top-3 rounded p-1 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove education ${i + 1}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Institution"
                    value={edu.institution}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateEducation(i, "institution", e.target.value)
                    }
                    placeholder="e.g. State University"
                  />
                  <FormField
                    label="Qualification"
                    value={edu.qualification}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateEducation(i, "qualification", e.target.value)
                    }
                    placeholder="e.g. Bachelor's Degree"
                  />
                </div>
                <FormField
                  label="Field of study"
                  value={edu.fieldOfStudy}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateEducation(i, "fieldOfStudy", e.target.value)
                  }
                  placeholder="e.g. Computer Science"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Start year"
                    type="number"
                    value={String(edu.startYear)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateEducation(i, "startYear", Number(e.target.value))
                    }
                  />
                  <FormField
                    label="End year"
                    type="number"
                    value={String(edu.endYear)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateEducation(i, "endYear", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addEducation}
            className="self-start rounded-lg border border-dashed border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            + Add education
          </button>
        </div>
      </section>

      {/* Availability */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeading
          title="Availability"
          description="Set your available hours for each day."
        />
        <div className="flex flex-col gap-3">
          {form.availability.map((slot, i) => (
            <div
              key={slot.day}
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <span className="w-28 shrink-0 text-sm font-medium text-neutral-700">
                {slot.day}
              </span>
              <input
                type="time"
                value={slot.startTime}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateAvailability(i, "startTime", e.target.value)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <span className="text-sm text-neutral-400">to</span>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateAvailability(i, "endTime", e.target.value)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Work Preferences */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeading
          title="Work Preferences"
          description="Select the types of work you're interested in."
        />
        <div className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Job categories
            </label>
            <CheckboxGroup
              options={JOB_CATEGORY_OPTIONS}
              selected={form.workPreferences.jobCategories}
              onChange={(v) => setWorkPreferences("jobCategories", v)}
              labels={CATEGORY_LABELS}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Work types
            </label>
            <CheckboxGroup
              options={WORK_TYPE_OPTIONS}
              selected={form.workPreferences.workTypes}
              onChange={(v) => setWorkPreferences("workTypes", v)}
              labels={WORK_TYPE_LABELS}
            />
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionHeading
          title="Preferred Location"
          description="Where you'd prefer to work."
        />
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-3">
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
              ? "Create Profile"
              : "Save Changes"}
        </SubmitButton>
      </div>
    </form>
  );
}
