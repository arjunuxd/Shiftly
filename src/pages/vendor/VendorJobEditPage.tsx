import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { JobForm } from "../../components/vendor/JobForm";
import type { JobFormData } from "../../components/vendor/JobForm";
import { getJob, updateJob } from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";
import type { Job } from "../../types";
import { FriendlyAlert } from "../../components/ui/FormField";

export default function VendorJobEditPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    let active = true;
    setLoading(true);
    getCurrentIdToken()
      .then((token) => getJob(token, jobId))
      .then((data) => {
        if (active) setJob(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load job.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [jobId]);

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
        <FriendlyAlert icon="error" title="We couldn't load this job">
          {error ?? "Job not found."}
        </FriendlyAlert>
        <Link
          to="/vendor/jobs"
          className="mt-4 inline-block text-sm text-primary-600 hover:text-primary-700"
        >
          &larr; Back to jobs
        </Link>
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
