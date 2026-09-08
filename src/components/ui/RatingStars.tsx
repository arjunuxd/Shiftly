export function RatingStars({
  rating,
  size = "sm",
  className = "",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: { star: "h-3.5 w-3.5", text: "text-sm" },
    md: { star: "h-4 w-4", text: "text-base" },
    lg: { star: "h-5 w-5", text: "text-lg" },
  } as const;
  const dims = sizes[size];

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className={`inline-flex items-center ${dims.text} leading-none`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} aria-hidden="true">
            <svg
              className={dims.star}
              fill={i <= Math.round(rating) ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              style={{ color: i <= Math.round(rating) ? "#f59e0b" : undefined }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </span>
        ))}
      </span>
      <span className={`${dims.text} font-semibold text-neutral-700`}>
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i === 1 ? "" : "s"}`}
          onClick={() => onChange(i)}
          className="p-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
        >
          <svg
            className="h-7 w-7"
            fill={i <= value ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            style={{ color: i <= value ? "#f59e0b" : undefined }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}