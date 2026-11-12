import type { Metadata } from "next";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports | Lumen" };

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl">Reports</h1>
        <p className="mt-0.5 text-sm text-ink-soft">Open issues by project.</p>
      </div>
      <div className="card p-3">
        <ul className="flex flex-col gap-2">
          {projects.map((p) => {
            const pct = total === 0 ? 0 : Math.round((p.issues / total) * 100);
            return (
              <li key={p.key} className="grid grid-cols-[3rem_1fr_4.5rem] items-center gap-3 text-sm">
                <span className="font-mono text-xs font-semibold text-ink-soft">{p.key}</span>
                <div className="h-2 rounded-sm bg-line" aria-hidden="true">
                  <div className="h-2 rounded-sm bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-right tabular-nums text-ink-soft">
                  {p.issues} ({pct}%)
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
