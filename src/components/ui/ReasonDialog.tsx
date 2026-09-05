import { useState } from "react";

interface ReasonDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  reasonRequired?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  maxLength?: number;
  busy?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export default function ReasonDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  reasonRequired = true,
  reasonLabel = "Reason",
  reasonPlaceholder = "Explain why...",
  maxLength = 500,
  busy = false,
  onConfirm,
  onCancel,
}: ReasonDialogProps) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  const canConfirm = !reasonRequired || reason.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
        {message && <p className="mt-2 text-sm text-neutral-600">{message}</p>}

        <label className="mt-4 block">
          <span className="text-sm font-medium text-neutral-700">
            {reasonLabel}
            {reasonRequired && <span className="text-red-500"> *</span>}
          </span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={maxLength}
            rows={3}
            placeholder={reasonPlaceholder}
            autoFocus
            className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="mt-1 block text-right text-xs text-neutral-400">
            {reason.length}/{maxLength}
          </span>
        </label>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim())}
            disabled={busy || !canConfirm}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}