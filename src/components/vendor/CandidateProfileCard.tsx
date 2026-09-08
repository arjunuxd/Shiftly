import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import type { VendorApplicationWithJob } from "../../types";
import { APPLICATION_STATUS_LABELS } from "../../types";
import { RepeatHireBadge, CandidateRating } from "./TrustBadges";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    applied: "bg-green-50 text-green-700 border-green-200",
    withdrawn: "bg-neutral-50 text-neutral-600 border-neutral-200",
    accepted: "bg-primary-50 text-primary-700 border-primary-200",
    hired: "bg-primary-50 text-primary-700 border-primary-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
        styles[status] ?? styles.applied
      }`}
    >
      {
        APPLICATION_STATUS_LABELS[
          status as keyof typeof APPLICATION_STATUS_LABELS
        ] ?? status
      }
    </span>
  );
}

export default function CandidateProfileCard({
  application,
}: {
  application: VendorApplicationWithJob;
}) {
  const { candidate, status, jobId, appliedAt } = application;

  if (!candidate) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-neutral-900">
              Candidate hasn&apos;t completed a profile yet.
            </p>
            {appliedAt && (
              <p className="mt-1 text-sm text-neutral-500">
                Applied {formatDate(appliedAt)}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={status} />
          </div>
        </div>
      </div>
    );
  }

  const location = [candidate.location.city, candidate.location.state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <Avatar
            name={candidate.fullName}
            src={candidate.photoUrl}
            className="h-12 w-12"
            textClassName="text-sm"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="font-semibold text-neutral-900">
                {candidate.fullName}
              </p>
              <StatusBadge status={status} />
              <RepeatHireBadge
                repeatHire={candidate.repeatHire}
                completedWithVendor={candidate.completedWithVendor}
              />
            </div>
            {candidate.headline && (
              <p className="mt-0.5 text-sm text-neutral-500 truncate">
                {candidate.headline}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
              <CandidateRating
                averageRating={candidate.averageRating}
                ratingCount={candidate.ratingCount}
              />
              {location && (
                <span className="inline-flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {location}
                </span>
              )}
              {appliedAt && <span>Applied {formatDate(appliedAt)}</span>}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:items-end">
          <span
            className="inline-flex items-center rounded-full bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-600 border border-neutral-200"
            title="Profile strength"
          >
            {candidate.completeness}% complete
          </span>
          <Link
            to={`/vendor/applicants/${application.id}`}
            className="inline-flex items-center rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            View profile
          </Link>
        </div>
      </div>

      {candidate.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-neutral-100">
          {candidate.skills
            .slice(0, 4)
            .map((skill) => (
              <span
                key={`${skill.name}-${skill.category}`}
                className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 border border-primary-100"
              >
                {skill.name}
              </span>
            ))}
          {candidate.skills.length > 4 && (
            <span className="inline-flex items-center rounded-full bg-neutral-50 px-2.5 py-0.5 text-xs font-medium text-neutral-500 border border-neutral-100">
              +{candidate.skills.length - 4} more
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        {candidate.resumeUrl && (
          <a
            href={candidate.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            View Resume ↗
          </a>
        )}
        {jobId && (
          <span className="ml-auto text-xs text-neutral-400">
            Job ID: {jobId.slice(0, 8)}
          </span>
        )}
      </div>
    </div>
  );
}