import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = projects.reduce((a, b) => (b.issues > a.issues ? b : a));
  const latest = projects.reduce((a, b) => (b.updated > a.updated ? b : a));

  const cards = [
    { label: "Open issues", value: String(openIssues), note: `Across ${projects.length} projects` },
    { label: "Active projects", value: String(active), note: "1 paused, 1 archived" },
    { label: "Busiest project", value: busiest.key, note: `${busiest.name}, ${busiest.issues} open issues` },
    { label: "Last activity", value: formatDate(latest.updated), note: latest.name },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted">
          Here is the state of your workspace at Acme Labs.
        </p>
      </div>

      <section aria-label="Summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-4">
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 font-mono text-3xl font-semibold">{card.value}</p>
            <p className="mt-1 text-sm text-muted">{card.note}</p>
          </div>
        ))}
      </section>

      <section id="reports" aria-labelledby="reports-heading" className="card scroll-mt-20 p-4 md:p-5">
        <h2 id="reports-heading" className="text-lg font-semibold">
          Reports
        </h2>
        <p className="mt-1 text-sm text-muted">Open issues per project, latest first.</p>
        <ul className="mt-4 flex flex-col gap-3">
          {[...projects]
            .sort((a, b) => b.issues - a.issues)
            .map((p) => (
              <li key={p.key} className="grid grid-cols-[3rem_1fr_2rem] items-center gap-3 text-sm">
                <span className="font-mono text-muted">{p.key}</span>
                <div
                  role="img"
                  aria-label={`${p.name}: ${p.issues} open issues`}
                  className="h-2 overflow-hidden rounded-sm bg-raised"
                >
                  <div
                    className="h-full bg-brand"
                    style={{ width: `${(p.issues / busiest.issues) * 100}%` }}
                  />
                </div>
                <span className="text-right font-mono">{p.issues}</span>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
