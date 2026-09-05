import type { DocumentSnapshot } from "firebase-admin/firestore";

export const MAX_IN_MEMORY_FETCH = 5000;

function fieldMillis(snap: DocumentSnapshot, field: string): number {
  const data = snap.data();
  if (!data) {
    return 0;
  }
  const value = data[field];
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  return 0;
}

export function sortDocsDesc(
  docs: DocumentSnapshot[],
  field: string,
): DocumentSnapshot[] {
  return [...docs].sort(
    (a, b) => fieldMillis(b, field) - fieldMillis(a, field),
  );
}