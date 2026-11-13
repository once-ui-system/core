import type { Role, Status } from "@/lib/data";

const roleStyles: Record<Role, string> = {
  Owner: "bg-violet-50 text-violet-800 ring-violet-600/25",
  Admin: "bg-indigo-50 text-indigo-800 ring-indigo-600/25",
  Member: "bg-sky-50 text-sky-800 ring-sky-600/25",
  Viewer: "bg-slate-100 text-slate-700 ring-slate-500/25",
};

const statusStyles: Record<Status, { badge: string; dot: string }> = {
  Active: { badge: "bg-emerald-50 text-emerald-800 ring-emerald-600/25", dot: "bg-emerald-500" },
  Invited: { badge: "bg-amber-50 text-amber-900 ring-amber-600/30", dot: "bg-amber-500" },
  Suspended: { badge: "bg-rose-50 text-rose-800 ring-rose-600/25", dot: "bg-rose-500" },
};

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap";

export function RoleBadge({ role }: { role: Role }) {
  return <span className={`${base} ${roleStyles[role]}`}>{role}</span>;
}

export function StatusBadge({ status }: { status: Status }) {
  const s = statusStyles[status];
  return (
    <span className={`${base} ${s.badge}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
