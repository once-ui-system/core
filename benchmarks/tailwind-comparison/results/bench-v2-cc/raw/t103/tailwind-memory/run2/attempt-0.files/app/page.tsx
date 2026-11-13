import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, PageHeading, StatusBadge, linkClasses } from "@/components/ui";
import { formatDate, projects, summarize, user } from "@/lib/data";

export default function DashboardPage() {
  const s = summarize();
  const firstName = user.name.split(" ")[0];
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4);

  const cards = [
    { label: "Open issues", value: String(s.openIssues), note: `across ${s.total} projects` },
    { label: "Active projects", value: String(s.active), note: "shipping this month" },
    { label: "Paused projects", value: String(s.paused), note: "waiting on a decision" },
    { label: "Last update", value: formatDate(s.latest.updated), note: `${s.latest.key}: ${s.latest.name}` },
  ];

  return (
    <>
      <PageHeading
        title={`Welcome back, ${firstName}`}
        description="Here is where your workspace stands today."
      />

      <section aria-label="Summary">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <li key={card.label}>
              <Card className="h-full">
                <p className="text-sm text-muted">{card.label}</p>
                <p className="mt-2 font-mono text-3xl font-semibold text-fg">{card.value}</p>
                <p className="mt-1 text-sm text-muted">{card.note}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <Card className="mt-6" aria-labelledby="recent-heading">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="recent-heading" className="text-lg font-semibold">
            Recently updated
          </h2>
          <Link href="/projects" className={`inline-flex items-center gap-1 text-sm ${linkClasses}`}>
            All projects
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <ul className="divide-y divide-line">
          {recent.map((p) => (
            <li key={p.key} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <span className="w-12 font-mono text-sm font-semibold text-brand">{p.key}</span>
              <span className="min-w-0 flex-1 text-sm">{p.name}</span>
              <StatusBadge status={p.status} />
              <span className="w-24 text-right text-sm text-muted">{formatDate(p.updated)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
