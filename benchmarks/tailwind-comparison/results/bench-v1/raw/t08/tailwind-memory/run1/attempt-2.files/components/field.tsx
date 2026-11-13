import type { ReactNode } from "react";

export function inputClass(invalid: boolean): string {
  return (
    "block min-h-11 w-full rounded-lg border bg-white px-3 text-base text-slate-900 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 sm:text-sm " +
    (invalid ? "border-red-600" : "border-slate-300")
  );
}

export function FieldShell({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-900">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
