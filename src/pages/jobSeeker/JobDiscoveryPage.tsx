import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  discoverJobs,
  type JobDiscoveryParams,
} from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";
import { useAuth } from "../../context/useAuth";
import { CompactVerificationBadge } from "../../components/ui/VerificationBadge";
import type { PublicJob, JobDiscoveryMeta } from "../../types";
import {
  JOB_CATEGORIES,
  WORK_TYPES,
  RATE_TYPES,
} from "../../types";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "pay-high", label: "Pay: High to Low" },
  { value: "pay-low", label: "Pay: Low to High" },
] as const;

function formatPay(rateType: string, rateAmount: number): string {
  const type = rateType === "hourly" ? "/hr" : rateType === "daily" ? "/day" : "";
  return `$${rateAmount.toLocaleString()}${type}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function JobCard({ job }: { job: PublicJob }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-neutral-900 leading-snug">
                {job.title}
              </h3>
              <CompactVerificationBadge status={job.vendorVerificationStatus} />
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 border border-primary-200">
            {formatPay(job.rateType, job.rateAmount)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            {job.jobCategory.charAt(0).toUpperCase() + job.jobCategory.slice(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {job.workType.charAt(0).toUpperCase() + job.workType.slice(1).replace("-", " ")}
          </span>
          <span className="inline-flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {job.location.city}, {job.location.state}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-neutral-500">
          {job.startDate && (
            <span>{formatDate(job.startDate)}</span>
          )}
          {job.shiftStart && job.shiftEnd && (
            <span>{job.shiftStart} - {job.shiftEnd}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="h-5 bg-neutral-200 rounded w-2/3" />
          <div className="h-6 bg-neutral-200 rounded-full w-20" />
        </div>
        <div className="flex gap-2">
          <div className="h-4 bg-neutral-200 rounded w-24" />
          <div className="h-4 bg-neutral-200 rounded w-20" />
          <div className="h-4 bg-neutral-200 rounded w-32" />
        </div>
        <div className="h-4 bg-neutral-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function JobDiscoveryPage() {
  const { authenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [meta, setMeta] = useState<JobDiscoveryMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [workType, setWorkType] = useState(searchParams.get("workType") ?? "");
  const [rateType, setRateType] = useState(searchParams.get("rateType") ?? "");
  const [minPay, setMinPay] = useState(searchParams.get("minPay") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [state, setState] = useState(searchParams.get("state") ?? "");
  const [area, setArea] = useState(searchParams.get("area") ?? "");
  const [verifiedOnly, setVerifiedOnly] = useState(
    searchParams.get("verifiedOnly") === "true",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") ?? "newest");
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = useCallback(
    async (params: JobDiscoveryParams, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        let token: string | undefined;
        if (authenticated) {
          token = await getCurrentIdToken();
        }
        void token;
        const result = await discoverJobs(params);
        if (append) {
          setJobs((prev) => [...prev, ...result.jobs]);
        } else {
          setJobs(result.jobs);
        }
        setMeta(result.meta);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || "Failed to load jobs. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [authenticated],
  );

  const buildParams = useCallback(
    (overrides: Partial<JobDiscoveryParams> = {}): JobDiscoveryParams => {
      const params: JobDiscoveryParams = {};
      const s = overrides.search ?? search;
      const c = overrides.jobCategory ?? category;
      const w = overrides.workType ?? workType;
      const r = overrides.rateType ?? rateType;
      const mp = overrides.minPay !== undefined ? overrides.minPay : (minPay ? Number(minPay) : undefined);
      const ct = overrides.city ?? city;
      const st = overrides.state ?? state;
      const ar = overrides.area ?? area;
      const vo = overrides.verifiedOnly !== undefined ? overrides.verifiedOnly : verifiedOnly;
      const sort = overrides.sortBy ?? sortBy;

      if (s) params.search = s;
      if (c) params.jobCategory = c;
      if (w) params.workType = w;
      if (r) params.rateType = r;
      if (mp !== undefined && mp > 0) params.minPay = mp;
      if (ct) params.city = ct;
      if (st) params.state = st;
      if (ar) params.area = ar;
      if (vo) params.verifiedOnly = true;
      if (sort) params.sortBy = sort as "newest" | "pay-high" | "pay-low";

      return params;
    },
    [search, category, workType, rateType, minPay, city, state, area, verifiedOnly, sortBy],
  );

  useEffect(() => {
    void fetchJobs(buildParams());
  }, []);

  const handleSearch = () => {
    const params = buildParams();
    updateSearchParams();
    void fetchJobs(params);
  };

  const handleFilterChange = (key: string, value: string) => {
    switch (key) {
      case "category":
        setCategory(value);
        break;
      case "workType":
        setWorkType(value);
        break;
      case "rateType":
        setRateType(value);
        break;
      case "minPay":
        setMinPay(value);
        break;
      case "city":
        setCity(value);
        break;
      case "state":
        setState(value);
        break;
      case "area":
        setArea(value);
        break;
      case "verifiedOnly":
        setVerifiedOnly(value === "true");
        break;
      case "sortBy":
        setSortBy(value);
        break;
    }
  };

  const applyFilters = () => {
    const params = buildParams();
    updateSearchParams();
    void fetchJobs(params);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setWorkType("");
    setRateType("");
    setMinPay("");
    setCity("");
    setState("");
    setArea("");
    setVerifiedOnly(false);
    setSortBy("newest");
    setSearchParams({});
    void fetchJobs({ sortBy: "newest" });
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (workType) params.set("workType", workType);
    if (rateType) params.set("rateType", rateType);
    if (minPay) params.set("minPay", minPay);
    if (city) params.set("city", city);
    if (state) params.set("state", state);
    if (area) params.set("area", area);
    if (verifiedOnly) params.set("verifiedOnly", "true");
    if (sortBy && sortBy !== "newest") params.set("sort", sortBy);
    setSearchParams(params, { replace: true });
  };

  const handleLoadMore = () => {
    if (meta?.nextPageToken) {
      const params = buildParams({ pageToken: meta.nextPageToken });
      void fetchJobs(params, true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const hasActiveFilters =
    category || workType || rateType || minPay || city || state || area || verifiedOnly;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Find Your Next Shift
        </h1>
        <p className="text-neutral-500">
          Browse published opportunities from verified employers.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            aria-label="Search jobs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by title, category, or location..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors text-sm shrink-0"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center justify-center gap-2 px-4 py-3 border rounded-lg text-sm font-medium transition-colors sm:hidden ${
            showFilters || hasActiveFilters
              ? "border-primary-300 bg-primary-50 text-primary-700"
              : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-primary-500" />
          )}
        </button>
      </div>

      {/* Filters Row - Desktop */}
      <div className="hidden sm:flex flex-wrap items-end gap-3 mb-6">
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {JOB_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Work Type</label>
          <select
            value={workType}
            onChange={(e) => handleFilterChange("workType", e.target.value)}
            className="px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            {WORK_TYPES.map((wt) => (
              <option key={wt.value} value={wt.value}>{wt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Pay Type</label>
          <select
            value={rateType}
            onChange={(e) => handleFilterChange("rateType", e.target.value)}
            className="px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Pay Types</option>
            {RATE_TYPES.map((rt) => (
              <option key={rt.value} value={rt.value}>{rt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Min Pay ($)</label>
          <input
            type="number"
            min="0"
            value={minPay}
            onChange={(e) => handleFilterChange("minPay", e.target.value)}
            placeholder="0"
            className="w-24 px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => handleFilterChange("city", e.target.value)}
            placeholder="e.g. Mumbai"
            className="w-36 px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => handleFilterChange("state", e.target.value)}
            placeholder="e.g. Maharashtra"
            className="w-36 px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Area</label>
          <input
            type="text"
            value={area}
            onChange={(e) => handleFilterChange("area", e.target.value)}
            placeholder="e.g. Bandra"
            className="w-36 px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => handleFilterChange("verifiedOnly", e.target.checked ? "true" : "false")}
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            Verified employers only
          </label>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={applyFilters}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Apply
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filters Panel */}
      {showFilters && (
        <div className="sm:hidden mb-6 p-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white"
              >
                <option value="">All</option>
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Work Type</label>
              <select
                value={workType}
                onChange={(e) => handleFilterChange("workType", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white"
              >
                <option value="">All</option>
                {WORK_TYPES.map((wt) => (
                  <option key={wt.value} value={wt.value}>{wt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Pay Type</label>
              <select
                value={rateType}
                onChange={(e) => handleFilterChange("rateType", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white"
              >
                <option value="">All</option>
                {RATE_TYPES.map((rt) => (
                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Min Pay ($)</label>
              <input
                type="number"
                min="0"
                value={minPay}
                onChange={(e) => handleFilterChange("minPay", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => handleFilterChange("state", e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Area</label>
              <input
                type="text"
                value={area}
                onChange={(e) => handleFilterChange("area", e.target.value)}
                placeholder="e.g. Bandra"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => handleFilterChange("verifiedOnly", e.target.checked ? "true" : "false")}
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            Verified employers only
          </label>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => { applyFilters(); setShowFilters(false); }}
              className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
            >
              Apply Filters
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => { clearFilters(); setShowFilters(false); }}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200">
              {JOB_CATEGORIES.find((c) => c.value === category)?.label}
              <button type="button" onClick={() => { setCategory(""); }} className="ml-1 hover:text-primary-900">&times;</button>
            </span>
          )}
          {workType && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200">
              {WORK_TYPES.find((w) => w.value === workType)?.label}
              <button type="button" onClick={() => { setWorkType(""); }} className="ml-1 hover:text-primary-900">&times;</button>
            </span>
          )}
          {rateType && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200">
              {RATE_TYPES.find((r) => r.value === rateType)?.label}
              <button type="button" onClick={() => { setRateType(""); }} className="ml-1 hover:text-primary-900">&times;</button>
            </span>
          )}
          {minPay && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200">
              Min ${minPay}
              <button type="button" onClick={() => { setMinPay(""); }} className="ml-1 hover:text-primary-900">&times;</button>
            </span>
          )}
          {city && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200">
              {city}
              <button type="button" onClick={() => { setCity(""); }} className="ml-1 hover:text-primary-900">&times;</button>
            </span>
          )}
          {state && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200">
              {state}
              <button type="button" onClick={() => { setState(""); }} className="ml-1 hover:text-primary-900">&times;</button>
            </span>
          )}
          {area && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200">
              {area}
              <button type="button" onClick={() => { setArea(""); }} className="ml-1 hover:text-primary-900">&times;</button>
            </span>
          )}
          {verifiedOnly && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200">
              Verified only
              <button type="button" onClick={() => { setVerifiedOnly(false); }} className="ml-1 hover:text-primary-900">&times;</button>
            </span>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex flex-col gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-neutral-700 font-medium mb-2">Something went wrong</p>
          <p className="text-neutral-500 text-sm mb-4">{error}</p>
          <button
            type="button"
            onClick={() => void fetchJobs(buildParams())}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-neutral-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          <p className="text-neutral-700 font-medium mb-2">No jobs found</p>
          <p className="text-neutral-500 text-sm mb-4">
            {hasActiveFilters || search
              ? "No jobs match your current filters. Try adjusting your search criteria."
              : "No published jobs are available right now. Check back soon!"}
          </p>
          {(hasActiveFilters || search) && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-neutral-500 mb-4">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"} found
          </p>
          <div className="flex flex-col gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {meta?.hasMore && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="inline-flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-600" />
                    Loading...
                  </span>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
