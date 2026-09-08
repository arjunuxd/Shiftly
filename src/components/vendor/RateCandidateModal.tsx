import { useState } from "react";
import { createReview } from "../../lib/api";
import { getCurrentIdToken } from "../../lib/auth";
import { getFriendlyError } from "../../lib/errors";
import { StarRatingInput } from "../ui/RatingStars";
import { FriendlyAlert } from "../ui/FormField";

export default function RateCandidateModal({
  applicationId,
  candidateName,
  onClose,
  onRated,
  title = `Rate ${candidateName}`,
  subtitle = "Your rating builds this worker's reputation and helps other employers trust them.",
  placeholder = "Was this worker reliable, skilled, and on time?",
}: {
  applicationId: string;
  candidateName: string;
  onClose: () => void;
  onRated: () => void;
  title?: string;
  subtitle?: string;
  placeholder?: string;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (busy || rating === 0) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getCurrentIdToken();
      await createReview(token, { applicationId, rating, comment: comment.trim() || undefined });
      onRated();
    } catch (err: unknown) {
      setError(getFriendlyError(err, "We couldn't submit your review. Please try again."));
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
            <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="rate-stars" className="block text-sm font-medium text-neutral-700 mb-1">
            Rating
          </label>
          <div id="rate-stars">
            <StarRatingInput value={rating} onChange={setRating} />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="rate-comment" className="block text-sm font-medium text-neutral-700 mb-1">
            Comment <span className="text-neutral-400">(optional)</span>
          </label>
          <textarea
            id="rate-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder={placeholder}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {error && (
          <div className="mb-4">
            <FriendlyAlert icon="error" title="We couldn't submit your review">
              {error}
            </FriendlyAlert>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={busy || rating === 0}
            className="flex-1 px-4 py-3 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60"
          >
            {busy ? "Submitting rating..." : "Submit rating"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-3 border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}