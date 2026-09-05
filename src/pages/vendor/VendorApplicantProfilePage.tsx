import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCurrentIdToken } from "../../lib/auth";
import { getCandidateProfile, getVendorApplication } from "../../lib/api";
import type { CandidateProfile } from "../../types";
import CandidateProfileDisplay from "../../components/vendor/CandidateProfileDisplay";
import { FriendlyAlert } from "../../components/ui/FormField";
import { getFriendlyError } from "../../lib/errors";

export default function VendorApplicantProfilePage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!applicationId) {
        setError("We couldn't load this applicant.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const token = await getCurrentIdToken();
        const [profile, app] = await Promise.all([
          getCandidateProfile(token, applicationId),
          getVendorApplication(token, applicationId).catch(() => null),
        ]);
        if (!active) return;
        setCandidate(profile);
        if (app) {
          setJobTitle(app.jobTitle);
          setStatus(app.status);
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            getFriendlyError(
              err,
              "We couldn't load this applicant's profile.",
            ),
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [applicationId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"
            role="status"
            aria-live="polite"
          />
          <span className="sr-only">Loading applicant profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <FriendlyAlert icon="error" title="We couldn't load this applicant">
          {error}
        </FriendlyAlert>
        <Link
          to="/vendor/jobs"
          className="mt-6 inline-flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          Back to my jobs
        </Link>
      </div>
    );
  }

  if (!candidate) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm text-neutral-500">
            <Link
              to="/vendor/jobs"
              className="text-primary-600 hover:text-primary-700 transition-colors"
            >
              My Jobs
            </Link>
            <span className="mx-1.5 text-neutral-300">/</span>
            {jobTitle ? (
              <span>{jobTitle}</span>
            ) : (
              <span>Applicants</span>
            )}
          </div>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">
            Applicant Profile
          </h1>
          {status && (
            <span className="mt-1 inline-flex items-center rounded-full bg-neutral-50 px-2.5 py-0.5 text-xs font-medium text-neutral-600 border border-neutral-200">
              {status
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </span>
          )}
        </div>
      </div>

      <CandidateProfileDisplay candidate={candidate} />

      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        Contact details aren&apos;t shown here. Start a conversation with the
        candidate through the Messages section after accepting an application.
      </div>
    </div>
  );
}