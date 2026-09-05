import type { ReactNode } from "react";

export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary-600">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-neutral-500">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}