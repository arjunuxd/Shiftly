import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import FormField, { FormError, SubmitButton, FriendlyAlert } from "../ui/FormField";
import ConfirmDialog from "../ui/ConfirmDialog";
import UnsavedChangesDialog from "../ui/UnsavedChangesDialog";
import { useUnsavedChangesWarning } from "../../hooks/useUnsavedChangesWarning";
import Avatar from "../ui/Avatar";
import type { Profile } from "../../types";
import { getFriendlyError } from "../../lib/errors";

function isEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

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
  const [pendingRemove, setPendingRemove] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const dirty = !isEqual(form, initialData);
  const blocker = useUnsavedChangesWarning(dirty);

  function requestRemove(
    title: string,
    message: string,
    onConfirm: () => void,
  ) {
    setPendingRemove({ title, message, onConfirm });
  }

  function setPersonalInfo(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  }

  function setHeadline(value: string) {
    setForm((prev) => ({ ...prev, headline: value }));
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
          currentlyStudying: false,
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

  function addCertificate() {
    setForm((prev) => ({
      ...prev,
      certificates: [
        ...prev.certificates,
        {
          id: newId(),
          name: "",
          issuer: "",
          issueDate: "",
          expiryDate: "",
          credentialId: "",
          credentialUrl: "",
        },
      ],
    }));
  }

  function updateCertificate(index: number, field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      certificates: prev.certificates.map((c, i) =>
        i === index ? { ...c, [field]: value } : c,
      ),
    }));
  }

  function addPortfolioLink() {
    setForm((prev) => ({
      ...prev,
      portfolioLinks: [
        ...prev.portfolioLinks,
        { id: newId(), title: "", url: "", description: "" },
      ],
    }));
  }

  function updatePortfolioLink(index: number, field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.map((p, i) =>
        i === index ? { ...p, [field]: value } : p,
      ),
    }));
  }

  function removePortfolioLink(index: number) {
    setForm((prev) => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.filter((_, i) => i !== index),
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
      setError(getFriendlyError(err, "We couldn't save your profile. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
      {error && <FormError title="We couldn't save your profile">{error}</FormError>}
      {success && (
        <FriendlyAlert icon="success" title="Profile saved">
          Your changes are live.
        </FriendlyAlert>
      )}

      {/* Personal Information */}
      <details className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm group" open>
        <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <SectionHeading
          title="Personal Information"
          description="Basic details about you."
        />
        <svg className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </summary>
        <div className="flex flex-col gap-4">
          <FormField
            label="Professional headline"
            value={form.headline}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setHeadline(e.target.value)}
            placeholder="e.g. Experienced barista looking for part-time shifts"
            hint="A short line that tells employers who you are."
          />
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
      </details>

      {/* Profile image */}
      <details className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm group">
        <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <SectionHeading
          title="Profile image"
          description="Optional. Add a URL to an image hosted elsewhere (e.g. LinkedIn, Google Drive). If left blank we'll show your initials."
        />
        <svg className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </summary>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              name={form.personalInfo.fullName}
              src={form.photoUrl}
              className="h-20 w-20"
              textClassName="text-2xl"
            />
            <p className="text-sm text-neutral-500">
              {form.photoUrl
                ? "Your image URL is set. It will be displayed on your profile."
                : "No image URL set yet — we'll show your initials instead."}
            </p>
          </div>
          <FormField
            label="Profile image URL (optional)"
            type="url"
            value={form.photoUrl ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm((prev) => ({ ...prev, photoUrl: e.target.value || null }))
            }
            placeholder="https://example.com/photo.jpg"
            hint="Must be a valid http(s) URL."
          />
        </div>
      </details>

      {/* Resume */}
      <details className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm group">
        <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <SectionHeading
          title="Resume"
          description="Add a link to your resume (e.g. Google Drive or a hosted PDF). Employers can view it when you apply."
        />
        <svg className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </summary>
        <div className="flex flex-col gap-2">
          <FormField
            label="Resume URL"
            type="url"
            value={form.resumeUrl ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm((prev) => ({
                ...prev,
                resumeUrl: e.target.value || null,
                resumeName: e.target.value ? prev.resumeName : null,
              }))
            }
            placeholder="https://drive.google.com/..."
            hint="A valid http(s) link to your resume."
          />
          {form.resumeUrl && (
            <a
              href={form.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View Resume ↗
            </a>
          )}
          <p className="text-xs text-neutral-400">
            Your resume is only shown to employers after you apply for a job.
          </p>
        </div>
      </details>

      {/* Certificates */}
      <details className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm group">
        <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <SectionHeading
          title="Certificates"
          description="Add certifications relevant to the work you're looking for. Each can include a credential URL and ID for verification."
        />
        <svg className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </summary>
        <div className="flex flex-col gap-4">
          {form.certificates.map((cert, i) => (
            <div
              key={cert.id}
              className="relative rounded-lg border border-neutral-100 bg-neutral-50 p-4"
            >
              <button
                type="button"
                onClick={() =>
                  requestRemove(
                    "Remove certificate?",
                    `This removes "${
                      cert.name.trim() || "this certificate"
                    }" from your profile.`,
                    () =>
                      setForm((prev) => ({
                        ...prev,
                        certificates: prev.certificates.filter(
                          (_, ci) => ci !== i,
                        ),
                      })),
                  )
                }
                className="absolute right-3 top-3 rounded p-1 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove certificate ${i + 1}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Certificate name"
                    value={cert.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateCertificate(i, "name", e.target.value)}
                    placeholder="e.g. Food Safety Certification"
                  />
                  <FormField
                    label="Issued by"
                    value={cert.issuer}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateCertificate(i, "issuer", e.target.value)}
                    placeholder="e.g. ServSafe"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Issue date"
                    type="date"
                    value={cert.issueDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateCertificate(i, "issueDate", e.target.value)}
                  />
                  <FormField
                    label="Expiry date (optional)"
                    type="date"
                    value={cert.expiryDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateCertificate(i, "expiryDate", e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Credential URL (optional)"
                    type="url"
                    value={cert.credentialUrl}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateCertificate(i, "credentialUrl", e.target.value)}
                    placeholder="https://..."
                  />
                  <FormField
                    label="Credential ID (optional)"
                    value={cert.credentialId ?? ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateCertificate(i, "credentialId", e.target.value)}
                    placeholder="e.g. FS-2024-12345"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addCertificate}
            className="self-start rounded-lg border border-dashed border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            + Add certificate
          </button>
        </div>
      </details>

      {/* Portfolio */}
      <details className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm group">
        <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <SectionHeading
          title="Portfolio"
          description="Link to work samples, profiles, or personal projects."
        />
        <svg className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </summary>
        <div className="flex flex-col gap-4">
          {form.portfolioLinks.map((item, i) => (
            <div
              key={item.id}
              className="relative rounded-lg border border-neutral-100 bg-neutral-50 p-4"
            >
              <button
                type="button"
                onClick={() =>
                  requestRemove(
                    "Remove this link?",
                    `This removes "${item.title.trim() || "this link"}" from your profile.`,
                    () => removePortfolioLink(i),
                  )
                }
                className="absolute right-3 top-3 rounded p-1 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove portfolio link ${i + 1}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Title"
                    value={item.title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updatePortfolioLink(i, "title", e.target.value)}
                    placeholder="e.g. Personal Website"
                  />
                  <FormField
                    label="URL"
                    type="url"
                    value={item.url}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updatePortfolioLink(i, "url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <FormField
                  label="Description (optional)"
                  value={item.description}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updatePortfolioLink(i, "description", e.target.value)}
                  placeholder="What this link shows"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addPortfolioLink}
            className="self-start rounded-lg border border-dashed border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            + Add link
          </button>
        </div>
      </details>

      {/* Skills */}
      <details className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm group">
        <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <SectionHeading
          title="Skills"
          description="Add skills that are relevant to the work you're looking for."
        />
        <svg className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </summary>
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
                onClick={() =>
                  requestRemove(
                    "Remove this skill?",
                    `This removes "${skill.name.trim() || "this skill"}" from your profile.`,
                    () => removeSkill(i),
                  )
                }
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
      </details>

      {/* Experience */}
      <details className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm group">
        <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <SectionHeading
          title="Work Experience"
          description="Relevant work experience."
        />
        <svg className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </summary>
        <div className="flex flex-col gap-6">
          {form.experience.map((exp, i) => (
            <div
              key={exp.id}
              className="relative rounded-lg border border-neutral-100 bg-neutral-50 p-4"
            >
              <button
                type="button"
                onClick={() =>
                  requestRemove(
                    "Remove this experience?",
                    `This removes "${exp.role.trim() || "this entry"}" from your profile.`,
                    () => removeExperience(i),
                  )
                }
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
      </details>

      {/* Education */}
      <details className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm group">
        <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <SectionHeading
          title="Education"
          description="Your educational background."
        />
        <svg className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </summary>
        <div className="flex flex-col gap-6">
          {form.education.map((edu, i) => (
            <div
              key={edu.id}
              className="relative rounded-lg border border-neutral-100 bg-neutral-50 p-4"
            >
              <button
                type="button"
                onClick={() =>
                  requestRemove(
                    "Remove this education?",
                    `This removes "${
                      edu.institution.trim() || "this entry"
                    }" from your profile.`,
                    () => removeEducation(i),
                  )
                }
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
                  {!edu.currentlyStudying && (
                    <FormField
                      label="End year"
                      type="number"
                      value={String(edu.endYear)}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateEducation(i, "endYear", Number(e.target.value))
                      }
                    />
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm text-neutral-600">
                  <input
                    type="checkbox"
                    checked={Boolean(edu.currentlyStudying)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateEducation(i, "currentlyStudying", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-neutral-300 accent-primary-600"
                  />
                  Currently studying
                </label>
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
      </details>

      {/* Availability */}
      <details className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm group">
        <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <SectionHeading
          title="Availability"
          description="Set your available hours for each day."
        />
        <svg className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </summary>
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
      </details>

      {/* Work Preferences */}
      <details className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm group">
        <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <SectionHeading
          title="Work Preferences"
          description="Select the types of work you're interested in."
        />
        <svg className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </summary>
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
      </details>

      {/* Location */}
      <details className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm group">
        <summary className="flex cursor-pointer list-none select-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <SectionHeading
          title="Preferred Location"
          description="Where you'd prefer to work."
        />
        <svg className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </summary>
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
      </details>

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

      <ConfirmDialog
        open={pendingRemove !== null}
        title={pendingRemove?.title ?? "Confirm removal"}
        message={pendingRemove?.message ?? ""}
        onConfirm={() => {
          if (pendingRemove) pendingRemove.onConfirm();
          setPendingRemove(null);
        }}
        onCancel={() => setPendingRemove(null)}
      />

      <UnsavedChangesDialog blocker={blocker} busy={saving} />
    </form>
  );
}
