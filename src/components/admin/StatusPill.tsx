import type { ReactNode } from "react";

export type PillTone =
  | "neutral"
  | "green"
  | "red"
  | "amber"
  | "blue"
  | "indigo"
  | "purple"
  | "orange";

const TONES: Record<PillTone, string> = {
  neutral: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
};

export default function StatusPill({
  tone = "neutral",
  children,
}: {
  tone?: PillTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function PillDot({ className }: { className?: string }) {
  return <span className={`h-1.5 w-1.5 rounded-full ${className ?? "bg-current opacity-60"}`} />;
}