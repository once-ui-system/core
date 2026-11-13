"use client";

import { CircleCheck, Hourglass, TriangleAlert } from "lucide-react";
import { tableById } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { Card } from "./ui";

export default function RulesPanel() {
  const plan = usePlan();
  const broken = plan.results.filter((r) => r.status === "broken").length;
  const waiting = plan.results.filter((r) => r.status === "pending").length;
  const kept = plan.results.filter((r) => r.status === "ok").length;

  return (
    <Card
      title="The couple's rules"
      action={
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            broken > 0 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {broken > 0 ? `${broken} broken` : "None broken"}
        </span>
      }
    >
      <p className="px-4 pt-3 text-sm text-stone-600" role="status">
        {broken} broken, {waiting} waiting on seating, {kept} kept.
      </p>
      <ul className="divide-y divide-stone-100 p-1.5">
        {plan.results.map((r) => {
          const Icon = r.status === "broken" ? TriangleAlert : r.status === "ok" ? CircleCheck : Hourglass;
          const color =
            r.status === "broken" ? "text-rose-600" : r.status === "ok" ? "text-emerald-600" : "text-amber-600";
          const statusText = r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Waiting";
          const first = r.tables[0];
          const body = (
            <>
              <Icon className={`mt-0.5 size-4 shrink-0 ${color}`} aria-hidden />
              <span className="min-w-0 text-left">
                <span className="block text-sm font-medium text-stone-900">
                  <span className="sr-only">{statusText}. </span>
                  {r.title}
                </span>
                <span className="block text-xs text-stone-600">{r.detail}</span>
                <span className="block text-xs text-stone-400 italic">{r.rule.note}</span>
                {r.status === "broken" && r.tables.length > 0 ? (
                  <span className="mt-1 block text-xs font-medium text-rose-700">
                    Flagged: {r.tables.map((t) => tableById.get(t)?.name ?? t).join(", ")}
                  </span>
                ) : null}
              </span>
            </>
          );
          return (
            <li key={r.index} className={r.status === "broken" ? "rounded-xl bg-rose-50/60" : undefined}>
              {first ? (
                <button
                  type="button"
                  onClick={() => plan.select(first)}
                  className="flex min-h-11 w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 hover:bg-stone-50"
                >
                  {body}
                </button>
              ) : (
                <div className="flex items-start gap-2.5 px-2.5 py-2.5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
