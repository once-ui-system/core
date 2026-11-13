import Link from "next/link";
import { CircleDot, FolderKanban, PauseCircle, Rocket } from "lucide-react";
import { Card, PageHeading } from "@/components/ui";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { label: "Open issues", value: totalIssues, hint: "Across all projects", icon: CircleDot },
    { label: "Active projects", value: active, hint: "Shipping this month", icon: Rocket },
    { label: "Paused projects", value: paused, hint: "Waiting for a restart", icon: PauseCircle },
    {
      label: "Latest update",
      value: latest.key,
      hint: `${latest.name}, ${formatDate(latest.updated)}`,
      icon: FolderKanban,
    },
  ];

  return (
    <>
      <PageHeading title={`Welcome back, ${user.name.split(" ")[0]}!`}>
        Here is how your team is doing today. Nice work keeping things moving.
      </PageHeading>

      <section aria-label="Summary" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, hint, icon: Icon }) => (
          <Card key={label}>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-base font-semibold text-sand-700">{label}</h2>
              <span className="flex size-11 items-center justify-center rounded-ui bg-brand-50 text-brand-700">
                <Icon aria-hidden="true" className="size-5" />
              </span>
            </div>
            <p className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-bold text-sand-900">
              {value}
            </p>
            <p className="mt-2 text-sm text-sand-600">{hint}</p>
          </Card>
        ))}
      </section>

      <p className="mt-10 text-lg text-sand-700">
        Want the full picture?{" "}
        <Link href="/projects" className="font-semibold underline underline-offset-4">
          Browse all projects
        </Link>
        .
      </p>
    </>
  );
}
