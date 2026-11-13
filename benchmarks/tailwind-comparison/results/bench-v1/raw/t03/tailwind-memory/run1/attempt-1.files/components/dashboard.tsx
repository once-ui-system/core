import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate, members, projects, recentProjects, user } from "@/lib/data";

export function Dashboard() {
  const openIssues = projects.reduce((n, p) => n + p.issues, 0);
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const activeMembers = members.filter((m) => m.status === "Active").length;
  const pending = members.filter((m) => m.status === "Invited").length;

  const stats = [
    { label: "Open issues", value: openIssues, note: "across all projects" },
    { label: "Active projects", value: activeProjects, note: `of ${projects.length} total` },
    { label: "Active members", value: activeMembers, note: `${pending} invites pending` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user.name.split(" ")[0]}</h1>
      <p className="mt-1 text-sm opacity-70">
        Here’s what’s happening across your workspace. Press the search button in the header to jump anywhere.
      </p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-500/25 bg-slate-500/5 p-4">
            <dt className="text-sm opacity-70">{s.label}</dt>
            <dd className="mt-1 text-3xl font-semibold">{s.value}</dd>
            <dd className="mt-1 text-xs opacity-60">{s.note}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="recent-heading" className="mt-8">
        <div className="flex items-center justify-between">
          <h2 id="recent-heading" className="text-lg font-semibold">
            Recently updated
          </h2>
          <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:underline">
            All projects <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-slate-500/20 rounded-xl border border-slate-500/25">
          {recentProjects.map((p) => (
            <li key={p.key} className="flex items-center gap-3 px-4 py-3">
              <span className="rounded bg-indigo-600/15 px-2 py-0.5 text-xs font-semibold text-indigo-500">
                {p.key}
              </span>
              <span className="flex-1 truncate font-medium">{p.name}</span>
              <span className="hidden text-sm opacity-70 sm:inline">{p.issues} open issues</span>
              <span className="text-sm opacity-70">{formatDate(p.updated)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
