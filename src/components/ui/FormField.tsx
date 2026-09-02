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

export function FormError({ children }: { children: ReactNode }) {
  if (!children) {
    return null;
  }
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {children}
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
