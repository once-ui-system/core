import { formatDate, reports } from "@/lib/data";

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Reports</h1>
        <p className="mt-0.5 text-slate-600">Scheduled summaries of your workspace.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <li key={r.name} className="rounded-md border border-slate-200 bg-white p-3">
            <h2 className="text-base font-semibold">{r.name}</h2>
            <p className="mt-1 text-slate-600">{r.description}</p>
            <p className="mt-2 text-xs text-slate-500">
              {r.cadence} · last run <time dateTime={r.lastRun}>{formatDate(r.lastRun)}</time>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
