import { Link } from "react-router-dom";
import { computeShiftReadiness } from "../../lib/shiftReady";
import type { Profile } from "../../types";

export function ShiftReadyBadge({
  profile,
  emailVerified,
}: {
  profile: Profile | null;
  emailVerified: boolean;
}) {
  const { ready } = computeShiftReadiness(profile, emailVerified);

  if (ready) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 border border-emerald-200">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        SHIFT READY
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-500 border border-neutral-200">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      Not Shift Ready
    </span>
  );
}

export function ShiftReadyCard({
  profile,
  emailVerified,
}: {
  profile: Profile | null;
  emailVerified: boolean;
}) {
  const { ready, checks, profilePercent } = computeShiftReadiness(
    profile,
    emailVerified,
  );

  const missing = checks.filter((c) => !c.done);

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${
        ready
          ? "border-emerald-200 bg-emerald-50/50"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Shift Readiness
          </p>
          <p className="text-lg font-extrabold text-neutral-900">
            {ready ? (
              <span className="inline-flex items-center gap-2 text-emerald-700">
                SHIFT READY
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            ) : (
              "Almost there"
            )}
          </p>
          <p className="text-sm text-neutral-500">
            {ready
              ? "You're ready to start applying. Employers can quickly review you."
              : missing.length > 0
                ? `Complete ${missing.map((c) => c.label.toLowerCase()).join(", ")} to unlock Shift Ready.`
                : "Complete your profile to unlock Shift Ready."}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-extrabold text-neutral-900">
            {profilePercent}%
          </p>
          <p className="text-xs text-neutral-500">profile complete</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {checks.map((check) => (
          <span
            key={check.key}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
              check.done
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-neutral-50 text-neutral-500 border-neutral-200"
            }`}
            title={check.detail}
          >
            {check.done ? (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
            {check.label}: {check.detail}
          </span>
        ))}
      </div>

      {!ready && (
        <div className="mt-4">
          <Link
            to={profile === null ? "/job-seeker/profile/create" : "/job-seeker/profile/edit"}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            {profile === null ? "Create your profile" : "Complete your profile"}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}