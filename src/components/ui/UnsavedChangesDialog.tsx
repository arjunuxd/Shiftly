import type { Blocker } from "react-router-dom";

interface UnsavedChangesDialogProps {
  blocker: Blocker;
  busy?: boolean;
}

export default function UnsavedChangesDialog({
  blocker,
  busy = false,
}: UnsavedChangesDialogProps) {
  if (blocker.state !== "blocked") return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Unsaved changes"
    >
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-xl">
        <h2 className="text-base font-semibold text-neutral-900">
          Discard unsaved changes?
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          You have unsaved changes from {blocker.location.pathname}. Leave
          without saving?
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={blocker.reset}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
          >
            Stay
          </button>
          <button
            type="button"
            onClick={blocker.proceed}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            Leave anyway
          </button>
        </div>
      </div>
    </div>
  );
}