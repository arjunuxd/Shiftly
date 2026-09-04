import { useEffect, useState } from "react";
import { getCurrentIdToken } from "../../lib/auth";
import { adminGetOverview } from "../../lib/api";
import type { AdminPlatformOverview } from "../../types";

export default function SuperadminDashboard() {
  const [overview, setOverview] = useState<AdminPlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const token = await getCurrentIdToken();
        const data = await adminGetOverview(token);
        setOverview(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load overview.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!overview) return null;

  const stats = [
    { label: "Total Users", value: overview.totalUsers, color: "bg-blue-50 text-blue-700" },
    { label: "Job Seekers", value: overview.totalJobSeekers, color: "bg-emerald-50 text-emerald-700" },
    { label: "Vendors", value: overview.totalVendors, color: "bg-purple-50 text-purple-700" },
    { label: "Active Jobs", value: overview.activeJobs, color: "bg-amber-50 text-amber-700" },
    { label: "Suspended Users", value: overview.suspendedUsers, color: "bg-red-50 text-red-700" },
    { label: "Pending Verifications", value: overview.pendingVerifications, color: "bg-orange-50 text-orange-700" },
    { label: "Open Reports", value: overview.openReports, color: "bg-rose-50 text-rose-700" },
    { label: "Superadmins", value: overview.totalSuperadmins, color: "bg-neutral-100 text-neutral-700" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Platform Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.color} rounded-lg p-5 border border-transparent`}
          >
            <p className="text-sm font-medium opacity-75">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
