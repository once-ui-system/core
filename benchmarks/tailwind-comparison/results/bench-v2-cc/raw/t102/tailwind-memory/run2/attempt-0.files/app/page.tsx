import Link from "next/link";
import { ArrowRight, Bug, FolderKanban, PauseCircle, Clock } from "lucide-react";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const first = user.name.split(" ")[0];

  const cards = [
    { label: "Open issues", value: String(open), note: "across all projects", icon: Bug },
    { label: "Active projects", value: String(active), note: "shipping right now", icon: FolderKanban },
    { label: "Paused projects", value: String(paused), note: "waiting for their moment", icon: PauseCircle },
    { label: "Last update", value: formatDate(latest.updated), note: latest.name, icon: Clock },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-heading text-3xl font-bold text-sand-900 sm:text-4xl">
          Welcome back, {first}!
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-sand-700">
          Your team has {open} open issues across {active} active projects. Here is a friendly
          look at how things are going.
        </p>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon }) => (
          <li
            key={label}
            className="flex flex-col gap-4 rounded-ui border border-sand-200 bg-white p-6 shadow-sm"
          >
            <span className="flex size-12 items-center justify-center rounded-ui bg-brand-100 text-brand-700">
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-sand-600">{label}</p>
              <p className="font-heading text-3xl font-bold text-sand-900">{value}</p>
              <p className="text-sm text-sand-600">{note}</p>
            </div>
          </li>
        ))}
      </ul>

      <section
        id="reports"
        aria-labelledby="reports-heading"
        className="scroll-mt-28 rounded-ui border border-sand-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <h2 id="reports-heading" className="font-heading text-2xl font-bold text-sand-900">
          Reports
        </h2>
        <p className="mt-2 max-w-2xl text-sand-700">
          Customer app is the busiest project this month with{" "}
          {projects.find((p) => p.key === "APP")?.issues} open issues, while Public API keeps
          things calm with {projects.find((p) => p.key === "API")?.issues}.
        </p>
        <Link
          href="/projects"
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-ui bg-brand-600 px-6 text-base font-semibold text-white hover:bg-brand-700"
        >
          Browse projects
          <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </section>
    </div>
  );
}
