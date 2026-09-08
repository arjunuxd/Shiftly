import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  discoverJobs,
  type JobDiscoveryParams,
} from "../../lib/api";
import { useAuth } from "../../context/useAuth";
import { useProfile } from "../../context/useProfile";
import { CompactVerificationBadge } from "../../components/ui/VerificationBadge";
import { FriendlyAlert } from "../../components/ui/FormField";
import { getFriendlyError } from "../../lib/errors";
import RecommendedJobs from "../../components/jobSeeker/RecommendedJobs";
import SaveJobButton from "../../components/ui/SaveJobButton";
import type { PublicJob, JobDiscoveryMeta } from "../../types";
import {
  JOB_CATEGORIES,
  WORK_TYPES,
  RATE_TYPES,
} from "../../types";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "location", label: "Near You" },
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

function titleCase(str: string): string {
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function JobCard({ job }: { job: PublicJob }) {
  return (
    <div className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-card-hover hover:border-primary-200 hover:-translate-y-0.5">
      <Link
        to={`/jobs/${job.id}`}
        className="block focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-neutral-900 leading-snug group-hover:text-primary-800 transition-colors">
                  {job.title}
                </h3>
                <CompactVerificationBadge status={job.vendorVerificationStatus} />
              </div>
              {job.distanceKm !== null && job.distanceKm !== undefined && (
                <p className="mt-0.5 text-xs font-medium text-accent-600">
                  {job.distanceKm < 1
                    ? `${Math.round(job.distanceKm * 1000)} m away`
                    : `${job.distanceKm.toFixed(1)} km away`}
                </p>
              )}
            </div>
            <span className="shrink-0 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
              {formatPay(job.rateType, job.rateAmount)}
            </span>
          </div>

        <div className="flex flex-wrap gap-2 text-sm text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            {titleCase(job.jobCategory)}
          </span>
          <span className="inline-flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {titleCase(job.workType)}
          </span>
          <span className="inline-flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {[job.location.city, job.location.area, job.location.state]
              .filter(Boolean)
              .join(", ")}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-neutral-500">
          {job.startDate && (
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {formatDate(job.startDate)}
            </span>
          )}
          {job.shiftStart && job.shiftEnd && (
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {job.shiftStart} – {job.shiftEnd}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-3">
          <span className="text-xs text-neutral-400">
            {job.spotsAvailable} opening{job.spotsAvailable !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors group-hover:bg-primary-700">
            View Shift
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
        </div>
      </Link>
      <div className="mt-3 flex items-center justify-end">
        <SaveJobButton jobId={job.id} />
      </div>
    </div>
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
  const { profile } = useProfile();
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
  const [myLocation, setMyLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const fetchJobs = useCallback(
    async (params: JobDiscoveryParams, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await discoverJobs(params);
        if (append) {
          setJobs((prev) => [...prev, ...result.jobs]);
        } else {
          setJobs(result.jobs);
        }
        setMeta(result.meta);
      } catch (err: unknown) {
        setError(getFriendlyError(err, "Something went wrong while looking for shifts. Please try again."));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
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
      if (sort) params.sortBy = sort as "newest" | "pay-high" | "pay-low" | "location";
      if ((sort === "location") && profile?.location?.city) params.locationCity = profile.location.city;
      if ((sort === "location") && profile?.location?.state) params.locationState = profile.location.state;

      const useCoords = (overrides.lat !== undefined && overrides.lng !== undefined) || myLocation;
      if (sort === "location" && useCoords) {
        const lat = overrides.lat ?? myLocation?.lat;
        const lng = overrides.lng ?? myLocation?.lng;
        if (lat !== undefined && lng !== undefined) {
          params.lat = lat;
          params.lng = lng;
        }
      }

      return params;
    },
    [search, category, workType, rateType, minPay, city, state, area, verifiedOnly, sortBy, profile, myLocation],
  );

  const handleUseMyLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocError("Location isn't supported by this browser.");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
        };
        setMyLocation(coords);
        setSortBy("location");
        setLocating(false);
        void fetchJobs(
          buildParams({ sortBy: "location", lat: coords.lat, lng: coords.lng }),
        );
      },
      () => {
        setLocating(false);
        setLocError(
          "We couldn't access your location. Try allowing location access or set your location in your profile.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, [fetchJobs, buildParams]);

  useEffect(() => {
    void fetchJobs(buildParams());
  }, []);

  const urlSearch = searchParams.get("search") ?? "";
  const prevUrlSearch = useRef(urlSearch);

  useEffect(() => {
    if (urlSearch !== prevUrlSearch.current) {
      prevUrlSearch.current = urlSearch;
      setSearch(urlSearch);
      void fetchJobs(buildParams({ search: urlSearch || undefined }));
    }
  }, [urlSearch]);

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
    setMyLocation(null);
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
    <div className="max-w-6xl mx-auto px-4 pb-16">
      {/* Hero */}
      <div className="py-10 sm:py-14 border-b border-neutral-200 mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent-600 mb-2">
          Find your next shift
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
          Work that fits your life.
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-neutral-500">
          Browse part-time, temporary, and shift-based opportunities from
          verified employers near you.
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
        {!myLocation && (
          <button
            type="button"
            onClick={() => void handleUseMyLocation()}
            disabled={locating}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shrink-0 disabled:opacity-60"
          >
            {locating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-600" />
                Locating...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Use my location
              </>
            )}
          </button>
        )}
        {myLocation && (
          <span className="inline-flex items-center gap-1.5 px-3 py-3 rounded-lg bg-accent-50 border border-accent-200 text-sm font-medium text-accent-800 shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            Near you
            <button
              type="button"
              onClick={() => clearFilters()}
              className="ml-0.5 rounded-full hover:text-accent-900 focus:outline-none"
              aria-label="Clear nearby location filter"
            >
              &times;
            </button>
          </span>
        )}
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

      {locError && (
        <div className="mb-4">
          <FriendlyAlert icon="error" title="Location unavailable">
            {locError}
          </FriendlyAlert>
        </div>
      )}

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
          <div className="mt-4">
            <label className="block text-xs font-medium text-neutral-500 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
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

      {/* Recommended matches (only when no manual filters are active) */}
      {authenticated && !loading && !search && !hasActiveFilters && (
        <RecommendedJobs />
      )}

      {/* Results */}
      {loading ? (
        <div className="flex flex-col gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <div className="mx-auto max-w-md">
          <FriendlyAlert icon="error" title="We couldn't load jobs">
            {error}
          </FriendlyAlert>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => void fetchJobs(buildParams())}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 mb-4">
            <svg className="h-7 w-7 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-neutral-900 mb-1">
            No shifts match your search
          </p>
          <p className="text-neutral-500 text-sm mb-6 max-w-md mx-auto">
            {hasActiveFilters || search
              ? "Try removing a filter or searching for a broader term."
              : "No published shifts are available right now. Check back soon!"}
          </p>
          {(hasActiveFilters || search) && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <p className="text-sm text-neutral-500">
              {meta?.totalEstimate ?? jobs.length} shift
              {jobs.length === 1 ? "" : "s"} matching your search
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="jobs-sort" className="text-sm text-neutral-500">Sort</label>
              <select
                id="jobs-sort"
                value={sortBy}
                onChange={(e) => {
                  handleFilterChange("sortBy", e.target.value);
                  void fetchJobs(buildParams({ sortBy: e.target.value as "newest" | "pay-high" | "pay-low" | "location" }));
                }}
                className="px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
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
