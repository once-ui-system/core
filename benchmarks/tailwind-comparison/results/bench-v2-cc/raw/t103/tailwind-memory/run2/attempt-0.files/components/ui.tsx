import type { ComponentPropsWithoutRef, ReactNode } from "react";

import type { ProjectStatus } from "@/lib/data";

export const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-ui bg-brand px-4 py-2 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50";

export const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-ui border border-line-strong bg-transparent px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-raised disabled:cursor-not-allowed disabled:opacity-50";

export const inputClasses =
  "block w-full rounded-ui border border-line-strong bg-canvas px-3 py-2 text-sm text-fg placeholder:text-muted read-only:text-muted";

export const linkClasses = "text-brand underline hover:text-brand-hover";

export function Card({ className = "", ...props }: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={`rounded-ui border border-line bg-surface p-5 ${className}`}
      {...props}
    />
  );
}

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-fg">{title}</h1>
        {description ? <p className="mt-1 max-w-prose text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

const statusStyles: Record<ProjectStatus, string> = {
  Active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  Paused: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  Archived: "border-line-strong bg-raised text-muted",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-ui border px-2 py-0.5 font-mono text-xs ${statusStyles[status]}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
