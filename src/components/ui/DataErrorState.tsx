export default function DataErrorState({
  title,
  message,
  onRetry,
  retryLabel = "Try Again",
}: {
  title: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/60 px-6 py-16 text-center"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </span>
      <p className="mt-4 text-sm font-semibold text-neutral-900">{title}</p>
      {message && (
        <p className="mt-1 max-w-md text-sm leading-relaxed text-neutral-600">
          {message}
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {retryLabel}
        </button>
      )}
    </div>
  );
}