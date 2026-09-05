export default function PaginationControls({
  offset,
  limit,
  total,
  onPrev,
  onNext,
}: {
  offset: number;
  limit: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (total <= limit) return null;
  const from = offset + 1;
  const to = Math.min(offset + limit, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-neutral-500">
        Showing <span className="font-medium text-neutral-700">{from}</span>–
        <span className="font-medium text-neutral-700">{to}</span> of{" "}
        <span className="font-medium text-neutral-700">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={offset === 0}
          onClick={onPrev}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        <button
          type="button"
          disabled={offset + limit >= total}
          onClick={onNext}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}