import Link from "next/link";
import { ArrowRight, Bug, FolderKanban, PauseCircle } from "lucide-react";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  const cards = [
    { label: "Open issues", value: openIssues, note: "Across all projects", icon: Bug },
    { label: "Active projects", value: active, note: "Shipping right now", icon: FolderKanban },
    { label: "Paused projects", value: paused, note: "Waiting for a restart", icon: PauseCircle },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">Welcome back, {user.name.split(" ")[0]}!</h1>
        <p className="max-w-2xl text-lg text-muted">
          Here is how things look for your team today. Nice work keeping {openIssues} issues in view.
        </p>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Summary">
        {cards.map(({ label, value, note, icon: Icon }) => (
          <li key={label} className="card flex flex-col gap-4 p-6">
            <span className="flex size-12 items-center justify-center rounded-brand bg-primary-soft text-brand-700">
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <div>
              <p className="text-base font-medium text-muted">{label}</p>
              <p className="font-heading text-4xl font-bold">{value}</p>
              <p className="text-sm text-muted">{note}</p>
            </div>
          </li>
        ))}
      </ul>

      <section id="reports" aria-labelledby="reports-title" className="card scroll-mt-28 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="reports-title" className="text-2xl font-bold">
            Recently updated
          </h2>
          <Link
            href="/projects"
            className="inline-flex min-h-12 items-center gap-2 rounded-brand px-2 font-semibold text-link underline"
          >
            All projects <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {recent.map((p) => (
            <li key={p.key} className="flex flex-wrap items-center justify-between gap-2 py-4">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-muted">
                  {p.key} &middot; {p.issues} open {p.issues === 1 ? "issue" : "issues"}
                </p>
              </div>
              <time dateTime={p.updated} className="text-muted">
                {formatDate(p.updated)}
              </time>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
