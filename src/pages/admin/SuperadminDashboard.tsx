import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentIdToken } from "../../lib/auth";
import { adminGetOverview } from "../../lib/api";
import type { AdminPlatformOverview } from "../../types";
import { getFriendlyError } from "../../lib/errors";
import DataErrorState from "../../components/ui/DataErrorState";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import StatusPill, { PillDot } from "../../components/admin/StatusPill";

type StatKey = keyof AdminPlatformOverview;

const STAT_META: {
  key: StatKey;
  label: string;
  chip: string;
  icon: string;
}[] = [
  {
    key: "totalUsers",
    label: "Total Users",
    chip: "bg-primary-50 text-primary-600",
    icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  },
  {
    key: "totalJobSeekers",
    label: "Job Seekers",
    chip: "bg-emerald-50 text-emerald-600",
    icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  },
  {
    key: "totalVendors",
    label: "Vendors",
    chip: "bg-purple-50 text-purple-600",
    icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0",
  },
  {
    key: "activeJobs",
    label: "Active Jobs",
    chip: "bg-cyan-50 text-cyan-600",
    icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0",
  },
  {
    key: "suspendedUsers",
    label: "Suspended Users",
    chip: "bg-red-50 text-red-600",
    icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
  },
  {
    key: "pendingVerifications",
    label: "Pending Verifications",
    chip: "bg-amber-50 text-amber-600",
    icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    key: "openReports",
    label: "Open Reports",
    chip: "bg-orange-50 text-orange-600",
    icon: "M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5",
  },
  {
    key: "totalSuperadmins",
    label: "Superadmins",
    chip: "bg-neutral-100 text-neutral-700",
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  },
];

const QUEUE_ITEMS: {
  label: string;
  hint: string;
  count: StatKey;
  href: string;
  tone: "amber" | "orange" | "red";
  icon: string;
}[] = [
  {
    label: "Verifications to review",
    hint: "Pending identity & business checks",
    count: "pendingVerifications",
    href: "/admin/verifications",
    tone: "amber",
    icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    label: "Open reports",
    hint: "Reported users and job listings",
    count: "openReports",
    href: "/admin/reports",
    tone: "orange",
    icon: "M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5",
  },
  {
    label: "Suspended users",
    hint: "Accounts currently restricted",
    count: "suspendedUsers",
    href: "/admin/users?status=suspended",
    tone: "red",
    icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
  },
];

function StatCard({ label, value, chip, icon }: { label: string; value: number; chip: string; icon: string }) {
  return (
    <div className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-neutral-500">{label}</p>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${chip}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            <path d={icon} />
          </svg>
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-neutral-900">{value}</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full w-full origin-left scale-x-0 rounded-full bg-primary-500 transition-transform duration-700 group-hover:scale-x-100" />
      </div>
    </div>
  );
}

function QueueCard({
  label,
  hint,
  count,
  href,
  tone,
  icon,
}: {
  label: string;
  hint: string;
  count: number;
  href: string;
  tone: "amber" | "orange" | "red";
  icon: string;
}) {
  const toneChip =
    tone === "amber"
      ? "bg-amber-100 text-amber-600"
      : tone === "orange"
        ? "bg-orange-100 text-orange-600"
        : "bg-red-100 text-red-600";
  const empty = count === 0;

  return (
    <Link
      to={href}
      className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover"
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${empty ? "bg-emerald-100 text-emerald-600" : toneChip}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            {empty ? <path d="M4.5 12.75l6 6 9-13.5" /> : <path d={icon} />}
          </svg>
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900">{label}</p>
          <p className="truncate text-xs text-neutral-500">{hint}</p>
        </div>
      </div>
      <span className="flex shrink-0 items-center gap-2">
        {empty ? (
          <StatusPill tone="green">
            <PillDot />
            All clear
          </StatusPill>
        ) : (
          <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-primary-600 px-2 text-sm font-bold text-white">
            {count}
          </span>
        )}
        <svg className="h-4 w-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

export default function SuperadminDashboard() {
  const [overview, setOverview] = useState<AdminPlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getCurrentIdToken();
      const data = await adminGetOverview(token);
      setOverview(data);
    } catch (e) {
      setError(getFriendlyError(e, "Something went wrong while loading the overview. Please try again."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-3 w-24 rounded bg-neutral-200" />
          <div className="mt-2 h-7 w-56 rounded bg-neutral-200" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="space-y-4 p-5">
                <div className="h-4 w-2/3 rounded bg-neutral-200" />
                <div className="h-8 w-1/2 rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Administration"
          title="Platform Overview"
          description="A snapshot of activity across the Shiftly platform."
        />
        <DataErrorState
          title="We couldn't load the overview"
          message={error}
          onRetry={() => void loadOverview()}
        />
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Administration"
        title="Platform Overview"
        description="A snapshot of activity across the Shiftly platform, latest stats and queues that need your attention."
      />

      {/* Key stats */}
      <section aria-label="Platform statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_META.map((stat) => (
            <StatCard
              key={stat.key}
              label={stat.label}
              value={overview[stat.key]}
              chip={stat.chip}
              icon={stat.icon}
            />
          ))}
        </div>
      </section>

      {/* Attention queue */}
      <section aria-label="Needs attention">
        <div className="mb-3">
          <h3 className="text-base font-bold tracking-tight text-neutral-900">Needs attention</h3>
          <p className="mt-0.5 text-sm text-neutral-500">
            Queues you can act on right now.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {QUEUE_ITEMS.map((item) => (
            <QueueCard
              key={item.href}
              label={item.label}
              hint={item.hint}
              count={overview[item.count]}
              href={item.href}
              tone={item.tone}
              icon={item.icon}
            />
          ))}
        </div>
      </section>
    </div>
  );
}