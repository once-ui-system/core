import type { ReactNode } from "react";

export function PageHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 sm:mb-10">
      <h1 className="text-3xl font-bold text-sand-900 sm:text-4xl">{title}</h1>
      {children && <p className="mt-3 max-w-2xl text-lg text-sand-700">{children}</p>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-ui border border-sand-200 bg-white p-6 shadow-card sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-900",
  Paused: "bg-amber-100 text-amber-900",
  Archived: "bg-sand-200 text-sand-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
        statusStyles[status] ?? statusStyles.Archived
      }`}
    >
      {status}
    </span>
  );
}
