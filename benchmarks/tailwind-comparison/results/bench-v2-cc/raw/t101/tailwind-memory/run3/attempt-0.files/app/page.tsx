import Link from "next/link";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects
    .filter((p) => p.status !== "Archived")
    .reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { label: "Open issues", value: String(openIssues), note: "Across active and paused projects" },
    { label: "Active projects", value: String(active), note: `${paused} paused, ${projects.length - active - paused} archived` },
    { label: "Last activity", value: latest.key, note: `${latest.name}, ${formatDate(latest.updated)}` },
  ];

  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="mt-0.5 text-slate-600">Here is where your projects stand today.</p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.label} className="rounded-md border border-slate-200 bg-white p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-1 font-serif text-2xl font-semibold text-slate-900">{card.value}</p>
            <p className="mt-0.5 text-xs text-slate-600">{card.note}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="recent-heading" className="rounded-md border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
          <h2 id="recent-heading" className="text-base font-semibold">
            Recently updated
          </h2>
          <Link href="/projects" className="text-sm font-medium underline-offset-2 hover:underline">
            All projects
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {recent.map((p) => (
            <li key={p.key} className="flex items-center justify-between gap-3 px-3 py-1.5">
              <span className="min-w-0 truncate">
                <span className="mr-2 font-mono text-xs text-slate-500">{p.key}</span>
                {p.name}
              </span>
              <span className="shrink-0 text-xs text-slate-500">{formatDate(p.updated)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
