import type { Profile } from "../../types";

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

const WORK_TYPE_LABELS: Record<string, string> = {
  "part-time": "Part-time",
  "temporary": "Temporary",
  freelance: "Freelance",
  "shift-based": "Shift-based",
  "event-work": "Event work",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-neutral-900">{title}</h3>
      {children}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-neutral-400 italic">{text}</p>;
}

export default function ProfileDisplay({ profile }: { profile: Profile }) {
  const { personalInfo, skills, experience, education, availability, workPreferences, location } = profile;

  const hasAvailability = availability.some(
    (a) => a.startTime !== "09:00" || a.endTime !== "17:00",
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
          {personalInfo.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            {personalInfo.fullName}
          </h2>
          {personalInfo.phone && (
            <p className="mt-1 text-sm text-neutral-500">{personalInfo.phone}</p>
          )}
        </div>
      </div>

      {/* About */}
      {personalInfo.bio && (
        <Section title="About">
          <p className="text-sm text-neutral-600 whitespace-pre-line">{personalInfo.bio}</p>
        </Section>
      )}

      {/* Skills */}
      <Section title="Skills">
        {skills.length === 0 ? (
          <EmptyState text="No skills added yet." />
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 border border-primary-100"
              >
                {skill.name}
                <span className="ml-1.5 text-xs text-primary-400">
                  {skill.category}
                </span>
              </span>
            ))}
          </div>
        )}
      </Section>

      {/* Experience */}
      <Section title="Experience">
        {experience.length === 0 ? (
          <EmptyState text="No experience added yet." />
        ) : (
          <div className="flex flex-col gap-4">
            {experience.map((exp) => (
              <div key={exp.id} className="border-l-2 border-primary-200 pl-4">
                <p className="font-medium text-neutral-900">{exp.role}</p>
                <p className="text-sm text-neutral-500">{exp.organization}</p>
                <p className="mt-1 text-xs text-neutral-400">
                  {exp.startDate}
                  {exp.currentlyWorking
                    ? " — Present"
                    : exp.endDate
                      ? ` — ${exp.endDate}`
                      : ""}
                </p>
                {exp.description && (
                  <p className="mt-2 text-sm text-neutral-600">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Education */}
      <Section title="Education">
        {education.length === 0 ? (
          <EmptyState text="No education added yet." />
        ) : (
          <div className="flex flex-col gap-4">
            {education.map((edu) => (
              <div key={edu.id} className="border-l-2 border-primary-200 pl-4">
                <p className="font-medium text-neutral-900">{edu.qualification}</p>
                <p className="text-sm text-neutral-500">{edu.institution}</p>
                <p className="text-sm text-neutral-500">{edu.fieldOfStudy}</p>
                <p className="mt-1 text-xs text-neutral-400">
                  {edu.startYear} — {edu.endYear}
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Availability */}
      <Section title="Availability">
        {hasAvailability ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {availability.map((slot) => (
              <div key={slot.day} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-neutral-700">
                  {slot.day}
                </span>
                <span className="text-sm text-neutral-500">
                  {slot.startTime} — {slot.endTime}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Default availability (09:00–17:00 every day)." />
        )}
      </Section>

      {/* Work Preferences */}
      <Section title="Work Preferences">
        {workPreferences.jobCategories.length === 0 &&
        workPreferences.workTypes.length === 0 ? (
          <EmptyState text="No work preferences set." />
        ) : (
          <div className="flex flex-col gap-4">
            {workPreferences.jobCategories.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700">
                  Job categories
                </p>
                <div className="flex flex-wrap gap-2">
                  {workPreferences.jobCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600"
                    >
                      {CATEGORY_LABELS[cat] ?? cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {workPreferences.workTypes.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700">
                  Work types
                </p>
                <div className="flex flex-wrap gap-2">
                  {workPreferences.workTypes.map((wt) => (
                    <span
                      key={wt}
                      className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600"
                    >
                      {WORK_TYPE_LABELS[wt] ?? wt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Location */}
      <Section title="Preferred Location">
        {location.city || location.state || location.country ? (
          <p className="text-sm text-neutral-600">
            {[location.city, location.state, location.country]
              .filter(Boolean)
              .join(", ")}
          </p>
        ) : (
          <EmptyState text="No location preference set." />
        )}
      </Section>
    </div>
  );
}
