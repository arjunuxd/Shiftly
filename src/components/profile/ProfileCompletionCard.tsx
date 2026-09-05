import { Link } from "react-router-dom";
import { useProfile } from "../../context/useProfile";

interface CompletionItem {
  label: string;
  done: boolean;
  to: string;
  hint: string;
}

export default function ProfileCompletionCard() {
  const { profile, profileLoading } = useProfile();

  if (profileLoading) return null;
  if (!profile) return null;

  const p = profile;
  const items: CompletionItem[] = [
    {
      label: "Full name",
      done: Boolean(p.personalInfo.fullName?.trim()),
      to: "/job-seeker/profile/edit",
      hint: "Tell employers who you are.",
    },
    {
      label: "Headline",
      done: Boolean(p.headline?.trim()),
      to: "/job-seeker/profile/edit",
      hint: "A short line about your work.",
    },
    {
      label: "Profile photo",
      done: Boolean(p.photoUrl),
      to: "/job-seeker/profile/edit",
      hint: "A clear photo builds trust.",
    },
    {
      label: "Bio",
      done: Boolean(p.personalInfo.bio?.trim()),
      to: "/job-seeker/profile/edit",
      hint: "One short paragraph about you.",
    },
    {
      label: "Skills",
      done: p.skills.length > 0,
      to: "/job-seeker/profile/edit",
      hint: "Add your relevant skills.",
    },
    {
      label: "Work experience",
      done: p.experience.length > 0,
      to: "/job-seeker/profile/edit",
      hint: "List past roles or jobs.",
    },
    {
      label: "Education",
      done: p.education.length > 0,
      to: "/job-seeker/profile/edit",
      hint: "Add your qualifications.",
    },
    {
      label: "Availability",
      done: p.availability.some((a) => a.startTime || a.endTime),
      to: "/job-seeker/profile/edit",
      hint: "Set your weekly availability.",
    },
    {
      label: "Resume",
      done: Boolean(p.resumeUrl),
      to: "/job-seeker/profile/edit",
      hint: "PDF up to 500 KB.",
    },
    {
      label: "Certificates",
      done: p.certificates.length > 0,
      to: "/job-seeker/profile/edit",
      hint: "Add relevant certifications.",
    },
    {
      label: "Portfolio",
      done: p.portfolioLinks.length > 0,
      to: "/job-seeker/profile/edit",
      hint: "Link to your work.",
    },
  ];

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-neutral-900">
          Profile completion
        </h2>
        <span
          className={`text-sm font-bold tabular-nums ${
            profile.completeness >= 80
              ? "text-accent-600"
              : profile.completeness >= 40
                ? "text-amber-600"
                : "text-neutral-400"
          }`}
        >
          {profile.completeness}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 mb-1">
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-500"
          style={{ width: `${profile.completeness}%` }}
        />
      </div>
      <p className="text-xs text-neutral-400 mb-4">
        {doneCount} of {items.length} sections complete. A complete profile is
        more likely to get noticed by employers.
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              to={item.to}
              className="group flex items-start gap-2.5 rounded-md py-1.5 px-1 -mx-1 hover:bg-neutral-50 transition-colors"
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  item.done
                    ? "border-accent-300 bg-accent-50 text-accent-600"
                    : "border-neutral-300 bg-white text-transparent group-hover:border-primary-300"
                }`}
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-sm truncate ${
                    item.done ? "text-neutral-500" : "font-medium text-neutral-800"
                  }`}
                >
                  {item.label}
                </span>
                {!item.done && (
                  <span className="block text-xs text-neutral-400">
                    {item.hint}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {(profile.completeness < 100 || doneCount < items.length) && (
        <Link
          to="/job-seeker/profile/edit"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          Complete your profile
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      )}
    </div>
  );
}