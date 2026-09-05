export default function TableSkeleton({ rows = 6, cells = 5 }: { rows?: number; cells?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-t border-neutral-100">
          {Array.from({ length: cells }).map((__, c) => (
            <td key={c} className="px-4 py-4">
              <div
                className="h-4 animate-pulse rounded bg-neutral-200/70"
                style={{ width: c === 0 ? "55%" : `${45 + ((c * 13) % 35)}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}