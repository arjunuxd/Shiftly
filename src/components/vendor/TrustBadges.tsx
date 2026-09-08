import { RatingStars } from "../ui/RatingStars";

export function RepeatHireBadge({
  repeatHire,
  completedWithVendor,
}: {
  repeatHire: boolean;
  completedWithVendor: number;
}) {
  if (!repeatHire && completedWithVendor === 0) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200"
      title={`Worked ${completedWithVendor} prior shift${completedWithVendor === 1 ? "" : "s"} with you`}
    >
      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
      {repeatHire ? "Repeat hire" : `${completedWithVendor} prior shift${completedWithVendor === 1 ? "" : "s"}`}
    </span>
  );
}

export function CandidateRating({
  averageRating,
  ratingCount,
}: {
  averageRating: number | null;
  ratingCount: number;
}) {
  if (!averageRating || ratingCount === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-neutral-50 px-2.5 py-0.5 text-xs font-medium text-neutral-500 border border-neutral-200">
        No ratings yet
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-neutral-50 px-2 py-0.5 border border-neutral-200">
      <RatingStars rating={averageRating} size="sm" />
      <span className="ml-1 text-xs text-neutral-500">
        {ratingCount} review{ratingCount === 1 ? "" : "s"}
      </span>
    </span>
  );
}