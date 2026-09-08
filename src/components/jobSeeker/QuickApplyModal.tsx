import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { applyToJob } from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";
import { getFriendlyError } from "../../lib/errors";
import { useProfile } from "../../context/useProfile";
import { FriendlyAlert } from "../ui/FormField";
import type { PublicJob } from "../../types";

function CheckRow({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          done ? "bg-emerald-100 text-emerald-600" : "bg-neutral-100 text-neutral-400"
        }`}
        aria-hidden="true"
      >
        {done ? (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </span>
      <span className={done ? "text-neutral-700" : "text-neutral-400"}>{label}</span>
    </li>
  );
}

export default function QuickApplyModal({
  job,
  onClose,
  onApplied,
}: {
  job: PublicJob;
  onClose: () => void;
  onApplied: () => void;
}) {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasProfile = profile !== null && profile.completeness >= 50;
  const hasSkills = (profile?.skills?.length ?? 0) > 0;
  const hasExperience = (profile?.experience?.length ?? 0) > 0;
  const hasEducation = (profile?.education?.length ?? 0) > 0;
  const hasCertificates = (profile?.certificates?.length ?? 0) > 0;
  const hasResume = Boolean(profile?.resumeUrl);
  const hasLinks = (profile?.portfolioLinks?.length ?? 0) > 0;

  const handleApply = async () => {
    if (applying) return;
    setApplying(true);
    setError(null);
    try {
      const token = await getCurrentIdToken();
      await applyToJob(token, job.id);
      onApplied();
    } catch (err: unknown) {
      setError(getFriendlyError(err, "We couldn't submit your application. Please try again."));
      setApplying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Review and confirm your application"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !applying) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {hasProfile ? "Quick apply" : "Finish your profile to apply"}
            </h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              {job.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={applying}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {hasProfile ? (
          <>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 mb-4">
              <p className="text-sm font-semibold text-neutral-800 mb-2">
                Your Shiftly profile will be shared with this employer:
              </p>
              <ul className="space-y-1.5">
                <CheckRow done label="Professional profile" />
                <CheckRow done={hasSkills} label="Skills" />
                <CheckRow done={hasExperience} label="Experience" />
                <CheckRow done={hasEducation} label="Education" />
                <CheckRow done={hasCertificates} label="Certifications" />
                <CheckRow done={hasResume} label="Resume link" />
                <CheckRow done={hasLinks} label="Relevant professional links" />
              </ul>
              <p className="text-xs text-neutral-500 mt-3">
                Your phone number is only shared after you&apos;re hired.
              </p>
            </div>

            {error && (
              <div className="mb-4">
                <FriendlyAlert icon="error" title="We couldn't submit your application">
                  {error}
                </FriendlyAlert>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void handleApply()}
                disabled={applying}
                className="flex-1 px-4 py-3 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60"
              >
                {applying ? "Submitting application..." : "Confirm application"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={applying}
                className="px-4 py-3 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div>
            <div className="rounded-xl border border-accent-200 bg-accent-50 p-4 text-sm text-accent-800 mb-4">
              Employers review your profile when you apply. Complete your profile to
              unlock applications — it takes a few minutes.
            </div>
            <button
              type="button"
              onClick={() => navigate(profile ? "/job-seeker/profile/edit" : "/job-seeker/profile/create")}
              className="block w-full px-4 py-3 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Complete my profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}