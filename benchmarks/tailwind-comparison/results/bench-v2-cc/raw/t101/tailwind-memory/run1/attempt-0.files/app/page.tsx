import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { label: "Open issues", value: String(openIssues), note: `across ${projects.length} projects` },
    { label: "Active projects", value: String(active), note: "currently in progress" },
    { label: "Paused projects", value: String(paused), note: "waiting to resume" },
    { label: "Last update", value: formatDate(latest.updated), note: latest.name },
  ];

  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="mt-0.5 text-sm text-ink-soft">
          Here is where your workspace stands today.
        </p>
      </div>

      <section aria-label="Summary">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <li key={c.label} className="card p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{c.label}</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-ink">{c.value}</p>
              <p className="mt-0.5 text-xs text-ink-soft">{c.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-heading" className="card">
        <div className="flex items-center justify-between border-b border-line px-3 py-2">
          <h2 id="recent-heading" className="text-lg">
            Recently updated
          </h2>
          <Link href="/projects" className="text-sm font-medium underline-offset-2 hover:underline">
            All projects
          </Link>
        </div>
        <ul className="divide-y divide-line">
          {recent.map((p) => (
            <li key={p.key} className="flex items-center gap-3 px-3 py-2">
              <span className="w-10 shrink-0 font-mono text-xs font-semibold text-ink-soft">{p.key}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{p.name}</span>
              <StatusBadge status={p.status} />
              <span className="hidden text-xs text-ink-faint sm:inline">{formatDate(p.updated)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
