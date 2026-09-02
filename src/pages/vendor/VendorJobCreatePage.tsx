import { Link, useNavigate } from "react-router-dom";
import { JobForm } from "../../components/vendor/JobForm";
import type { JobFormData } from "../../components/vendor/JobForm";
import { createJob } from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";

export default function VendorJobCreatePage() {
  const navigate = useNavigate();

  async function handleSave(data: JobFormData) {
    const token = await getCurrentIdToken();
    await createJob(token, data);
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
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">Create a Job</h1>
        <p className="mt-1 text-neutral-500">
          Create a draft job listing. You can publish it anytime once you're
          happy with the details.
        </p>
      </div>

      <JobForm onSubmit={handleSave} onCancel={() => navigate("/vendor/jobs")} />
    </div>
  );
}
