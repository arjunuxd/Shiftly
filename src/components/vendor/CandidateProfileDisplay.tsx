import Avatar from "../ui/Avatar";
import type { CandidateProfile } from "../../types";
import { RepeatHireBadge, CandidateRating } from "./TrustBadges";

const PLATFORM_HINTS: Record<string, string> = {
  linkedin: "View profile",
  github: "View projects",
  portfolio: "Explore work",
  instagram: "View profile",
  twitter: "View profile",
  x: "View profile",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <h3 className="mb-4 text-base font-semibold text-neutral-900">{title}</h3>
      {children}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center">
      <p className="text-sm text-neutral-400">{text}</p>
    </div>
  );
}

function formatYearRange(edu: {
  startYear: number;
  endYear: number;
  currentlyStudying?: boolean;
}): string {
  if (edu.currentlyStudying) {
    return `${edu.startYear} — Present`;
  }
  return `${edu.startYear} — ${edu.endYear}`;
}

function formatDateRange(exp: {
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
}): string {
  const start = exp.startDate
    ? new Date(exp.startDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";
  if (exp.currentlyWorking) {
    return `${start} — Present`;
  }
  const end = exp.endDate
    ? new Date(exp.endDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";
  return [start, end].filter(Boolean).join(" — ");
}

function isLikelyPlatform(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").split(".")[0];
    return host;
  } catch {
    return "";
  }
}

export default function CandidateProfileDisplay({
  candidate,
}: {
  candidate: CandidateProfile;
}) {
  const {
    fullName,
    headline,
    bio,
    photoUrl,
    location,
    skills,
    experience,
    education,
    certificates,
    resumeUrl,
    resumeName,
    portfolioLinks,
    completeness,
  } = candidate;

  const locationLabel = [location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col gap-5">
      {/* Identity */}
      <header className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar
              name={fullName}
              src={photoUrl}
              className="h-20 w-20"
              textClassName="text-2xl"
            />
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-neutral-900">{fullName}</h2>
              {headline && (
                <p className="mt-1 text-base text-neutral-500">{headline}</p>
              )}
              {locationLabel && (
                <p className="mt-1.5 inline-flex items-center gap-1 text-sm text-neutral-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {locationLabel}
                </p>
              )}
            </div>
          </div>
          <span
            className="shrink-0 self-start inline-flex items-center rounded-full bg-neutral-50 px-3 py-1 text-sm font-medium text-neutral-600 border border-neutral-200"
            title="Profile strength"
          >
            {completeness}% complete
          </span>
        </div>
      </header>

      {/* Trust & reputation */}
      <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 sm:p-6">
        <h3 className="mb-3 text-base font-semibold text-neutral-900">
          Trust &amp; history
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <RepeatHireBadge
            repeatHire={candidate.repeatHire}
            completedWithVendor={candidate.completedWithVendor}
          />
          <CandidateRating
            averageRating={candidate.averageRating}
            ratingCount={candidate.ratingCount}
          />
          {candidate.completedJobs > 0 && (
            <span className="inline-flex items-center rounded-full bg-neutral-50 px-2.5 py-0.5 text-xs font-medium text-neutral-600 border border-neutral-200">
              {candidate.completedJobs} completed shift
              {candidate.completedJobs === 1 ? "" : "s"} overall
            </span>
          )}
          {(!candidate.repeatHire ||
            !candidate.averageRating ||
            candidate.ratingCount === 0) && (
            <span className="text-xs text-neutral-500 ml-1">
              No history yet — this candidate is new to Shiftly.
            </span>
          )}
        </div>
      </section>

      {/* About */}
      <Section title="About">
        {bio ? (
          <p className="text-sm text-neutral-600 whitespace-pre-line leading-relaxed">
            {bio}
          </p>
        ) : (
          <EmptyState text="No bio provided." />
        )}
      </Section>

      {/* Skills */}
      <Section title="Skills">
        {skills.length === 0 ? (
          <EmptyState text="No skills listed yet." />
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={`${skill.name}-${skill.category}`}
                className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 border border-primary-100"
              >
                {skill.name}
              </span>
            ))}
          </div>
        )}
      </Section>

      {/* Experience */}
      <Section title="Experience">
        {experience.length === 0 ? (
          <EmptyState text="No experience listed yet." />
        ) : (
          <ol className="flex flex-col gap-5">
            {experience.map((exp) => (
              <li key={exp.id} className="border-l-2 border-primary-200 pl-4">
                <p className="font-semibold text-neutral-900">{exp.role}</p>
                <p className="text-sm text-neutral-500">{exp.organization}</p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {formatDateRange(exp)}
                </p>
                {exp.description && (
                  <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </Section>

      {/* Education */}
      <Section title="Education">
        {education.length === 0 ? (
          <EmptyState text="No education listed yet." />
        ) : (
          <ol className="flex flex-col gap-5">
            {education.map((edu) => (
              <li key={edu.id} className="border-l-2 border-primary-200 pl-4">
                <p className="font-semibold text-neutral-900">
                  {edu.qualification}
                </p>
                <p className="text-sm text-neutral-500">{edu.institution}</p>
                <p className="text-sm text-neutral-500">{edu.fieldOfStudy}</p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {formatYearRange(edu)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Section>

      {/* Certificates */}
      <Section title="Certificates">
        {certificates.length === 0 ? (
          <EmptyState text="No certificates listed yet." />
        ) : (
          <ul className="flex flex-col gap-3">
            {certificates.map((cert) => (
              <li
                key={cert.id}
                className="rounded-lg border border-neutral-100 bg-neutral-50 p-4"
              >
                <p className="font-medium text-neutral-900">{cert.name}</p>
                {cert.issuer && (
                  <p className="text-sm text-neutral-500">{cert.issuer}</p>
                )}
                {cert.issueDate && (
                  <p className="mt-0.5 text-xs text-neutral-400">
                    Issued{" "}
                    {new Date(cert.issueDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                    {cert.expiryDate
                      ? ` · Expires ${new Date(cert.expiryDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}`
                      : ""}
                  </p>
                )}
                {cert.credentialUrl ? (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    View credential ↗
                  </a>
                ) : (
                  <p className="mt-2 text-xs text-neutral-400">No credential link</p>
                )}
                {cert.credentialId && (
                  <p className="mt-1.5 text-xs text-neutral-400">
                    ID: {cert.credentialId}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Resume */}
      <Section title="Resume / CV">
        {resumeUrl ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {resumeName ?? "Resume"}
                </p>
                <p className="text-xs text-neutral-400">
                  Shared link
                </p>
              </div>
            </div>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
              </svg>
              View Resume ↗
            </a>
          </div>
        ) : (
          <EmptyState text="No resume link provided." />
        )}
      </Section>

      {/* External links */}
      <Section title="Links">
        {portfolioLinks.length === 0 ? (
          <EmptyState text="No professional links shared." />
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {portfolioLinks.map((link) => {
              const platform = isLikelyPlatform(link.url);
              const action =
                PLATFORM_HINTS[platform] ??
                (link.title ? `View ${link.title}` : "Open link");
              return (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-4 py-3 transition-colors hover:border-primary-300 hover:bg-primary-50/50"
                  >
                    <span className="text-sm font-medium text-neutral-800">
                      {link.title || platform || "External link"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm text-primary-600">
                      {action}
                      <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}