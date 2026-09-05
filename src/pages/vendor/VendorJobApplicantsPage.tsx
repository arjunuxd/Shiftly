import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { getCurrentIdToken } from "../../lib/auth";
import {
  getVendorJobApplications,
  acceptApplication,
  rejectApplication,
  createConversation,
  getJob,
} from "../../lib/api";
import type { VendorApplicationWithJob, Job } from "../../types";
import { FriendlyAlert } from "../../components/ui/FormField";
import DataErrorState from "../../components/ui/DataErrorState";
import { getFriendlyError } from "../../lib/errors";
import CandidateProfileCard from "../../components/vendor/CandidateProfileCard";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function VendorJobApplicantsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [applications, setApplications] = useState<VendorApplicationWithJob[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: "accept" | "reject";
    app: VendorApplicationWithJob;
  } | null>(null);

  const load = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getCurrentIdToken();
      const [apps, jobData] = await Promise.all([
        getVendorJobApplications(token, jobId),
        getJob(token, jobId).catch(() => null),
      ]);
      setApplications(apps);
      setJob(jobData);
    } catch (err: unknown) {
      setError(getFriendlyError(err, "Something went wrong while loading the applicants. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAccept(app: VendorApplicationWithJob) {
    setPendingAction(null);
    setActionError(null);
    setActingId(app.id);
    try {
      const token = await getCurrentIdToken();
      await acceptApplication(token, app.id);
      await load();
    } catch (err: unknown) {
      setActionError(getFriendlyError(err, "We couldn't accept this applicant. Please try again."));
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(app: VendorApplicationWithJob) {
    setPendingAction(null);
    setActionError(null);
    setActingId(app.id);
    try {
      const token = await getCurrentIdToken();
      await rejectApplication(token, app.id);
      await load();
    } catch (err: unknown) {
      setActionError(getFriendlyError(err, "We couldn't decline this applicant. Please try again."));
    } finally {
      setActingId(null);
    }
  }

  async function handleStartMessaging(app: VendorApplicationWithJob) {
    setActionError(null);
    setActingId(app.id);
    try {
      const token = await getCurrentIdToken();
      await createConversation(token, {
        jobSeekerId: app.jobSeekerId,
        applicationId: app.id,
        jobId: app.jobId,
      });
      window.location.href = "/vendor/messages";
    } catch (err: unknown) {
      setActionError(getFriendlyError(err, "We couldn't start the conversation. Please try again."));
    } finally {
      setActingId(null);
    }
  }

  const candidateName =
    pendingAction?.app.candidate?.fullName || "this applicant";
  const isAccept = pendingAction?.type === "accept";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          to="/vendor/jobs"
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          &larr; My Jobs
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">
          Applicants{job ? ` for ${job.title}` : ""}
        </h1>
        {job && (
          <p className="mt-1 text-neutral-500">
            {job.spotsAvailable} spot{job.spotsAvailable !== 1 ? "s" : ""} remaining
          </p>
        )}
      </div>

      {actionError && (
        <div className="mb-4">
          <FriendlyAlert icon="error" title="We couldn't complete that action">
            {actionError}
          </FriendlyAlert>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : error ? (
        <DataErrorState
          title="We couldn't load the applicants"
          message={error}
          onRetry={() => void load()}
        />
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
            <svg className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <p className="mt-4 font-medium text-neutral-900">
            No applications yet
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            When candidates apply, they&apos;ll appear here.
          </p>
          <Link
            to="/vendor/jobs"
            className="mt-5 inline-flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Back to my jobs
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {applications.map((app) => (
            <div key={app.id} className="flex flex-col">
              <CandidateProfileCard application={app} />
              <div className="mt-2 flex flex-wrap items-center gap-2 pl-1">
                {app.appliedAt && app.jobId && (
                  <span className="text-xs text-neutral-400">
                    Applied {formatDate(app.appliedAt)}
                  </span>
                )}
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  {app.status === "applied" && (
                    <>
                      <button
                        type="button"
                        disabled={actingId === app.id}
                        onClick={() => setPendingAction({ type: "accept", app })}
                        className="inline-flex items-center rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                      >
                        {actingId === app.id ? "..." : "Accept"}
                      </button>
                      <button
                        type="button"
                        disabled={actingId === app.id}
                        onClick={() => setPendingAction({ type: "reject", app })}
                        className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {app.status === "accepted" && (
                    <button
                      type="button"
                      disabled={actingId === app.id}
                      onClick={() => void handleStartMessaging(app)}
                      className="inline-flex items-center rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
                    >
                      {actingId === app.id ? "..." : "Message"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingAction !== null}
        title={isAccept ? "Accept this applicant?" : "Reject this applicant?"}
        message={
          isAccept
            ? `Accepting "${candidateName}" fills one spot and notifies them. This can't be undone.`
            : `Rejecting "${candidateName}" will notify them. This can't be undone.`
        }
        confirmLabel={isAccept ? "Accept" : "Reject"}
        busy={actingId === pendingAction?.app.id}
        onConfirm={() => {
          if (!pendingAction) return;
          if (pendingAction.type === "accept") {
            void handleAccept(pendingAction.app);
          } else {
            void handleReject(pendingAction.app);
          }
        }}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}