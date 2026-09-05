import { useRef, useState } from "react";
import { FriendlyAlert } from "../ui/FormField";
import { prepareVerificationDocument } from "../../lib/documentUpload";

export interface VerificationDocumentValue {
  documentUrl: string;
  documentName: string;
  documentMime: string;
}

interface Props {
  label: string;
  hint: string;
  value: VerificationDocumentValue | null;
  onSave: (doc: {
    documentUrl: string;
    documentName: string;
    documentSize: number;
  }) => Promise<void>;
  onRemove: () => Promise<void>;
  disabled?: boolean;
}

export default function VerificationDocumentUpload({
  label,
  hint,
  value,
  onSave,
  onRemove,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const prepared = await prepareVerificationDocument(file);
      await onSave(prepared);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "We couldn't upload that document. Please try again.",
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setError(null);
    setBusy(true);
    try {
      await onRemove();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "We couldn't remove that document. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const isImage = Boolean(value?.documentMime?.startsWith("image/"));

  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-left">
      <p className="text-sm font-medium text-neutral-800">{label}</p>
      <p className="mt-1 text-sm text-neutral-500">{hint}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        disabled={disabled || busy}
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="mt-4 flex items-center gap-3">
          {isImage ? (
            <img
              src={value.documentUrl}
              alt={value.documentName}
              className="h-16 w-16 rounded-lg border border-neutral-200 bg-white object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {value.documentName}
            </p>
            <span className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              Uploaded
            </span>
          </div>
          <a
            href={value.documentUrl}
            download={isImage ? value.documentName : undefined}
            target={isImage ? undefined : "_blank"}
            rel="noreferrer"
            className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:border-primary-300 hover:text-primary-700"
          >
            View
          </a>
          <button
            type="button"
            onClick={() => void handleRemove()}
            disabled={disabled || busy}
            className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || busy}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-primary-300 hover:text-primary-700 disabled:opacity-60"
        >
          {busy ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
              Uploading…
            </span>
          ) : (
            "Choose file"
          )}
        </button>
      )}

      {error && (
        <div className="mt-3">
          <FriendlyAlert icon="error" title="We couldn't save the document">
            {error}
          </FriendlyAlert>
        </div>
      )}
    </div>
  );
}