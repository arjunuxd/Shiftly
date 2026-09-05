import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { JobForm } from "../../components/vendor/JobForm";
import type { JobFormData } from "../../components/vendor/JobForm";
import { getJob, updateJob } from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";
import type { Job } from "../../types";
import DataErrorState from "../../components/ui/DataErrorState";
import { getFriendlyError } from "../../lib/errors";

export default function VendorJobEditPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getCurrentIdToken();
      const data = await getJob(token, jobId);
      setJob(data);
    } catch (err: unknown) {
      const notFound = err instanceof Error && err.message === "JOB_NOT_FOUND";
      setError(
        notFound
          ? "This job isn't available anymore. It may have been removed."
          : getFriendlyError(err, "We couldn't load this job. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <DataErrorState
          title="We couldn't load this job"
          message={error ?? "This job isn't available anymore."}
          onRetry={() => void load()}
        />
        <div className="mt-4 text-center">
          <Link
            to="/vendor/jobs"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            &larr; Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  if (job.status !== "draft") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="rounded-lg bg-amber-50 p-6 text-sm text-amber-700 border border-amber-200">
          Only draft jobs can be edited. This job is{" "}
          {job.status === "published" ? "published" : "closed"}.
        </div>
        <Link
          to="/vendor/jobs"
          className="mt-4 inline-block text-sm text-primary-600 hover:text-primary-700"
        >
          &larr; Back to jobs
        </Link>
      </div>
    );
  }

  const editingJobId = job.id;

  const initialData: JobFormData = {
    title: job.title,
    description: job.description,
    jobCategory: job.jobCategory,
    workType: job.workType,
    rateType: job.rateType,
    rateAmount: job.rateAmount,
    location: job.location,
    startDate: job.startDate,
    endDate: job.endDate,
    shiftStart: job.shiftStart,
    shiftEnd: job.shiftEnd,
    spotsAvailable: job.spotsAvailable,
  };

  async function handleSave(data: JobFormData) {
    const token = await getCurrentIdToken();
    await updateJob(token, editingJobId, data);
    navigate("/vendor/jobs");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          to="/vendor/jobs"
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          &larr; Back to jobs
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">Edit Job</h1>
        <p className="mt-1 text-neutral-500">
          Update the details of this draft listing.
        </p>
      </div>

      <JobForm
        initialData={initialData}
        onSubmit={handleSave}
        onCancel={() => navigate("/vendor/jobs")}
      />
    </div>
  );
}
