import { useState, useEffect } from "react";
import { getCurrentIdToken } from "../../lib/auth";
import {
  getJobAlertPreferences,
  saveJobAlertPreferences,
  deleteJobAlertPreferences,
} from "../../lib/api";
import { useProfile } from "../../context/useProfile";
import { JOB_CATEGORIES, WORK_TYPES } from "../../types";
import type { JobAlertPreferences } from "../../types";
import { FriendlyAlert } from "../ui/FormField";

export default function JobAlertsPreferencesPanel() {
  const { profile } = useProfile();
  const [prefs, setPrefs] = useState<JobAlertPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const token = await getCurrentIdToken();
        const data = await getJobAlertPreferences(token);
        if (!cancelled) setPrefs(data);
      } catch {
        if (!cancelled) setPrefs(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleCategory = (value: string) => {
    setPrefs((prev) => {
      const current = prev ?? defaultPrefs();
      const list = current.jobCategories.includes(value)
        ? current.jobCategories.filter((c) => c !== value)
        : [...current.jobCategories, value];
      return { ...current, jobCategories: list };
    });
  };

  const toggleWorkType = (value: string) => {
    setPrefs((prev) => {
      const current = prev ?? defaultPrefs();
      const list = current.workTypes.includes(value)
        ? current.workTypes.filter((c) => c !== value)
        : [...current.workTypes, value];
      return { ...current, workTypes: list };
    });
  };

  const defaultPrefs = (): JobAlertPreferences => ({
    userId: "",
    enabled: true,
    locationCity: profile?.location?.city ?? "",
    locationState: profile?.location?.state ?? "",
    jobCategories: [],
    workTypes: [],
    minRate: null,
  });

  const handleSave = async (enabledOverride?: boolean) => {
    const effective = prefs ?? defaultPrefs();
    const payload = {
      enabled: enabledOverride ?? effective.enabled,
      locationCity: effective.locationCity ?? "",
      locationState: effective.locationState ?? "",
      jobCategories: effective.jobCategories ?? [],
      workTypes: effective.workTypes ?? [],
      minRate: effective.minRate,
    };
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const token = await getCurrentIdToken();
      const data = await saveJobAlertPreferences(token, payload);
      setPrefs(data);
      setSaved(true);
    } catch {
      setError("We couldn't save your job alert preferences.");
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async () => {
    setSaving(true);
    setError(null);
    try {
      const token = await getCurrentIdToken();
      if (prefs && !prefs.enabled) {
        await deleteJobAlertPreferences(token);
      } else {
        await saveJobAlertPreferences(token, { enabled: false });
      }
      setPrefs((prev) => (prev ? { ...prev, enabled: false } : prev));
      setSaved(true);
    } catch {
      setError("We couldn't update your job alert preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="h-5 bg-neutral-100 rounded w-40 mb-4 animate-pulse" />
        <div className="h-4 bg-neutral-100 rounded w-3/4 mb-2 animate-pulse" />
        <div className="h-4 bg-neutral-100 rounded w-1/2 animate-pulse" />
      </div>
    );
  }

  const effective = prefs ?? defaultPrefs();

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Smart job alerts
          </h2>
          <p className="text-sm text-neutral-500">
            We notify you in-app when new shifts match your preferences.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 cursor-pointer">
          <input
            type="checkbox"
            checked={effective.enabled}
            onChange={(e) => void handleSave(e.target.checked)}
            disabled={saving}
            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          Alerts on
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
            Categories
          </p>
          <div className="flex flex-wrap gap-1.5">
            {JOB_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => toggleCategory(cat.value)}
                aria-pressed={effective.jobCategories.includes(cat.value)}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  effective.jobCategories.includes(cat.value)
                    ? "bg-primary-50 text-primary-700 border-primary-300"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
            Work types
          </p>
          <div className="flex flex-wrap gap-1.5">
            {WORK_TYPES.map((wt) => (
              <button
                key={wt.value}
                type="button"
                onClick={() => toggleWorkType(wt.value)}
                aria-pressed={effective.workTypes.includes(wt.value)}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  effective.workTypes.includes(wt.value)
                    ? "bg-primary-50 text-primary-700 border-primary-300"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                {wt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="alert-city" className="block text-xs font-medium text-neutral-500 mb-1">
            City
          </label>
          <input
            id="alert-city"
            type="text"
            value={effective.locationCity ?? ""}
            onChange={(e) =>
              setPrefs((prev) => ({
                ...(prev ?? defaultPrefs()),
                locationCity: e.target.value,
              }))
            }
            placeholder={profile?.location?.city ?? "e.g. Mumbai"}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label htmlFor="alert-state" className="block text-xs font-medium text-neutral-500 mb-1">
            State
          </label>
          <input
            id="alert-state"
            type="text"
            value={effective.locationState ?? ""}
            onChange={(e) =>
              setPrefs((prev) => ({
                ...(prev ?? defaultPrefs()),
                locationState: e.target.value,
              }))
            }
            placeholder={profile?.location?.state ?? "e.g. Maharashtra"}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label htmlFor="alert-minrate" className="block text-xs font-medium text-neutral-500 mb-1">
            Min rate ($/hr)
          </label>
          <input
            id="alert-minrate"
            type="number"
            min="0"
            value={effective.minRate ?? ""}
            onChange={(e) =>
              setPrefs((prev) => ({
                ...(prev ?? defaultPrefs()),
                minRate: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
            placeholder="Any"
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save preferences"}
        </button>
        {prefs?.enabled && (
          <button
            type="button"
            onClick={() => void handleDisable()}
            disabled={saving}
            className="px-4 py-2.5 border border-neutral-300 text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-50 disabled:opacity-60"
          >
            Turn off alerts
          </button>
        )}
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Saved
          </span>
        )}
      </div>

      {error && (
        <div className="mt-3">
          <FriendlyAlert icon="error" title="We couldn't save your preferences">
            {error}
          </FriendlyAlert>
        </div>
      )}
    </div>
  );
}