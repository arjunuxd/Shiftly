import { useId } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

interface BaseFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  multiline?: boolean;
}

type InputProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

type FormFieldProps = InputProps | TextareaProps;

export default function FormField({
  label,
  error,
  hint,
  multiline,
  id,
  ...props
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined;

  const fieldClassName = `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
    error
      ? "border-red-300 focus:border-red-500 focus:ring-red-400"
      : "border-neutral-300 focus:border-primary-500 focus:ring-primary-400"
  }`;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={fieldId} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      ) : null}
      {multiline ? (
        <textarea
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${fieldClassName} min-h-[80px] resize-y`}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={fieldClassName}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {hint && !error ? (
        <p id={`${fieldId}-hint`} className="text-xs text-neutral-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${fieldId}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormError({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  if (!children) {
    return null;
  }
  return (
    <FriendlyAlert icon="error" title={title ?? "Something went wrong"}>
      {children}
    </FriendlyAlert>
  );
}

type AlertKind = "error" | "success" | "info";

export function FriendlyAlert({
  children,
  title,
  icon,
}: {
  children: ReactNode;
  title: string;
  icon: AlertKind;
}) {
  const styles: Record<
    AlertKind,
    { wrap: string; icon: string; title: string; body: string }
  > = {
    error: {
      wrap: "border-red-200 bg-red-50",
      icon: "bg-red-100 text-red-600",
      title: "text-red-800",
      body: "text-red-700",
    },
    success: {
      wrap: "border-accent-200 bg-accent-50",
      icon: "bg-accent-100 text-accent-700",
      title: "text-neutral-900",
      body: "text-neutral-600",
    },
    info: {
      wrap: "border-primary-200 bg-primary-50",
      icon: "bg-primary-100 text-primary-700",
      title: "text-neutral-900",
      body: "text-neutral-600",
    },
  };
  const s = styles[icon];

  return (
    <div
      role={icon === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border p-4 ${s.wrap}`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${s.icon}`}
      >
        {icon === "error" ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        ) : icon === "success" ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        )}
      </span>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${s.title}`}>{title}</p>
        <div className={`mt-0.5 text-sm leading-relaxed ${s.body}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function SubmitButton({
  children,
  pending,
  disabled,
}: {
  children: ReactNode;
  pending?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Please wait..." : children}
    </button>
  );
}
