import type { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500">
        {icon}
      </span>
      <p className="mt-4 text-sm font-semibold text-neutral-900">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-neutral-500">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}