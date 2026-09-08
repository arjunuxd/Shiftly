import Avatar, { initialsFor } from "../ui/Avatar";
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

function Tile({
  title,
  icon,
  accent = "bg-neutral-100 text-neutral-600",
  className = "",
  children,
}: {
  title: string;
  icon: React.ReactNode;
  accent?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accent}`}
        >
          {icon}
        </span>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {title}
        </h3>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-neutral-400 italic">{text}</p>;
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
    >
      {children}
      <span aria-hidden className="text-primary-400">↗</span>
    </a>
  );
}

function formatDate(date: string): string {
  if (!date) return "";
  const d = new Date(date + (date.length === 10 ? "T00:00:00" : ""));
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const ICONS = {
  user: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
  ),
  phone: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
  ),
  pin: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
  ),
  resume: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
  ),
  cert: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  link: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
  ),
  skills: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
  ),
  experience: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
  ),
  education: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
  ),
  clock: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  briefcase: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>
  ),
};

export default function ProfileDisplay({ profile }: { profile: Profile }) {
  const {
    personalInfo,
    skills,
    experience,
    education,
    availability,
    workPreferences,
    location,
    photoUrl,
    resumeUrl,
    resumeName,
    certificates,
    portfolioLinks,
  } = profile;

  const locationLabel = [location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ");

  const hasAvailability = availability.some(
    (a) => a.startTime !== "09:00" || a.endTime !== "17:00",
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-12">
      {/* ── Identity hero ─────────────────────────────── */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:col-span-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar
            name={personalInfo.fullName}
            src={photoUrl}
            className="h-20 w-20"
            textClassName="text-2xl"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-neutral-900">
                {personalInfo.fullName || "Unnamed Candidate"}
              </h2>
            </div>
            {profile.headline && (
              <p className="mt-0.5 text-base text-neutral-500">
                {profile.headline}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {personalInfo.phone && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-50 px-3 py-1.5 text-sm text-neutral-600 border border-neutral-200">
                  <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                  {personalInfo.phone}
                </span>
              )}
              {locationLabel && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-50 px-3 py-1.5 text-sm text-neutral-600 border border-neutral-200">
                  <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  {locationLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────── */}
      <Tile
        title="About"
        icon={ICONS.user}
        accent="bg-primary-50 text-primary-600"
        className="md:col-span-8"
      >
        {personalInfo.bio ? (
          <p className="text-sm leading-relaxed text-neutral-600 whitespace-pre-line">
            {personalInfo.bio}
          </p>
        ) : (
          <EmptyState text="No bio added yet." />
        )}
      </Tile>

      {/* ── Resume ────────────────────────────────────── */}
      <Tile
        title="Resume"
        icon={ICONS.resume}
        accent="bg-red-50 text-red-500"
        className="md:col-span-4"
      >
        {resumeUrl ? (
          <div className="flex h-full items-center gap-3 rounded-lg bg-neutral-50 border border-neutral-100 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
              {ICONS.resume}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">
                {resumeName || "Resume"}
              </p>
              <ExternalLink href={resumeUrl}>View Resume</ExternalLink>
            </div>
          </div>
        ) : (
          <EmptyState text="No resume link added yet." />
        )}
      </Tile>

      {/* ── Skills ────────────────────────────────────── */}
      <Tile
        title="Skills"
        icon={ICONS.skills}
        accent="bg-sky-50 text-sky-600"
        className="md:col-span-7"
      >
        {skills.length === 0 ? (
          <EmptyState text="No skills added yet." />
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 border border-primary-100"
              >
                {skill.name}
                <span className="ml-1.5 text-xs text-primary-400">
                  {skill.category}
                </span>
              </span>
            ))}
          </div>
        )}
      </Tile>

      {/* ── Certificates ──────────────────────────────── */}
      <Tile
        title="Certificates"
        icon={ICONS.cert}
        accent="bg-emerald-50 text-emerald-600"
        className="md:col-span-5"
      >
        {certificates.length === 0 ? (
          <EmptyState text="No certificates added yet." />
        ) : (
          <div className="flex flex-col gap-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="rounded-lg border border-neutral-100 bg-neutral-50 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900">
                      {cert.name || "Untitled certificate"}
                    </p>
                    {cert.issuer && (
                      <p className="text-xs text-neutral-500">{cert.issuer}</p>
                    )}
                    {(cert.issueDate || cert.expiryDate) && (
                      <p className="mt-0.5 text-xs text-neutral-400">
                        {cert.issueDate ? `Issued ${formatDate(cert.issueDate)}` : ""}
                        {cert.expiryDate ? ` — expires ${formatDate(cert.expiryDate)}` : ""}
                      </p>
                    )}
                  </div>
                  {cert.credentialUrl && (
                    <ExternalLink href={cert.credentialUrl}>Verify</ExternalLink>
                  )}
                </div>
                {cert.credentialId && (
                  <p className="mt-1.5 truncate text-xs text-neutral-400">
                    ID: {cert.credentialId}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Tile>

      {/* ── Experience ────────────────────────────────── */}
      <Tile
        title="Experience"
        icon={ICONS.experience}
        accent="bg-violet-50 text-violet-600"
        className="md:col-span-6"
      >
        {experience.length === 0 ? (
          <EmptyState text="No experience added yet." />
        ) : (
          <div className="flex flex-col gap-4">
            {experience.map((exp) => (
              <div key={exp.id} className="flex gap-3">
                <div className="mt-1.5 flex flex-col items-center">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary-500 ring-4 ring-primary-100" />
                  <span className="mt-1 w-px flex-1 bg-neutral-200" />
                </div>
                <div className="min-w-0 pb-1">
                  <p className="font-medium text-neutral-900">{exp.role}</p>
                  <p className="text-sm text-neutral-500">{exp.organization}</p>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {formatDate(exp.startDate)}
                    {exp.currentlyWorking
                      ? " — Present"
                      : exp.endDate
                        ? ` — ${formatDate(exp.endDate)}`
                        : ""}
                  </p>
                  {exp.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Tile>

      {/* ── Education ─────────────────────────────────── */}
      <Tile
        title="Education"
        icon={ICONS.education}
        accent="bg-amber-50 text-amber-600"
        className="md:col-span-6"
      >
        {education.length === 0 ? (
          <EmptyState text="No education added yet." />
        ) : (
          <div className="flex flex-col gap-4">
            {education.map((edu) => (
              <div key={edu.id} className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                <p className="font-medium text-neutral-900">
                  {edu.qualification || edu.fieldOfStudy || "Qualification"}
                </p>
                <p className="text-sm text-neutral-500">{edu.institution}</p>
                {edu.fieldOfStudy && edu.qualification && (
                  <p className="text-sm text-neutral-500">{edu.fieldOfStudy}</p>
                )}
                <p className="mt-1 text-xs text-neutral-400">
                  {edu.startYear} — {edu.currentlyStudying ? "Present" : edu.endYear}
                </p>
              </div>
            ))}
          </div>
        )}
      </Tile>

      {/* ── Availability ──────────────────────────────── */}
      <Tile
        title="Availability"
        icon={ICONS.clock}
        accent="bg-teal-50 text-teal-600"
        className="md:col-span-6"
      >
        {hasAvailability ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {availability.map((slot) => (
              <div
                key={slot.day}
                className="rounded-lg bg-neutral-50 border border-neutral-100 p-3 text-center"
              >
                <p className="text-sm font-medium text-neutral-700">{slot.day}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {slot.startTime} — {slot.endTime}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Default availability (09:00–17:00 every day)." />
        )}
      </Tile>

      {/* ── Work Preferences ──────────────────────────── */}
      <Tile
        title="Work Preferences"
        icon={ICONS.briefcase}
        accent="bg-fuchsia-50 text-fuchsia-600"
        className="md:col-span-6"
      >
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
      </Tile>

      {/* ── Professional Links ────────────────────────── */}
      <Tile
        title="Professional Links"
        icon={ICONS.link}
        accent="bg-indigo-50 text-indigo-600"
        className="md:col-span-6"
      >
        {portfolioLinks.length === 0 ? (
          <EmptyState text="No professional links added yet." />
        ) : (
          <ul className="space-y-3">
            {portfolioLinks.map((item) => (
              <li key={item.id}>
                <ExternalLink href={item.url}>
                  {item.title || item.url}
                </ExternalLink>
                {item.description && (
                  <p className="text-sm text-neutral-500">{item.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Tile>

      {/* ── Preferred Location ────────────────────────── */}
      <Tile
        title="Preferred Location"
        icon={ICONS.pin}
        accent="bg-rose-50 text-rose-600"
        className="md:col-span-6"
      >
        {locationLabel ? (
          <div className="flex items-center gap-2 rounded-lg bg-neutral-50 border border-neutral-100 p-3">
            <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
            <p className="text-sm text-neutral-700">{locationLabel}</p>
          </div>
        ) : (
          <EmptyState text="No location preference set." />
        )}
      </Tile>
    </div>
  );
}

export { initialsFor };
