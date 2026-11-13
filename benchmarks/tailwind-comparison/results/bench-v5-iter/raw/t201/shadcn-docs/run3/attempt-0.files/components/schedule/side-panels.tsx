import Link from "next/link";
import { Hourglass } from "lucide-react";
import { AlertBadges } from "@/components/alert-badges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPatient, getVet, toMin, vets, type Appointment } from "@/lib/data";
import { vetDot } from "@/components/schedule/appointment-row";
import { cn } from "@/lib/utils";

const LONG_WAIT = 30;

export function WaitingList({ appointments, now }: { appointments: Appointment[]; now: number }) {
  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => toMin(a.checkedInAt ?? a.start) - toMin(b.checkedInAt ?? b.start));

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Hourglass aria-hidden className="size-4 text-amber-700" />
          Waiting room
          <Badge variant="secondary" className="ml-auto tabular-nums" aria-label={`${waiting.length} waiting`}>
            {waiting.length}
          </Badge>
        </CardTitle>
        <CardDescription>Checked in, longest wait first</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        {waiting.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Nobody is waiting. Check a patient in from the schedule.
          </p>
        ) : (
          <ol className="space-y-2" aria-label="Waiting list">
            {waiting.map((a, i) => {
              const p = getPatient(a.patient)!;
              const v = getVet(a.vet);
              const waited = Math.max(0, now - toMin(a.checkedInAt ?? a.start));
              const long = waited >= LONG_WAIT;
              return (
                <li
                  key={a.id}
                  className={cn("rounded-lg border p-3", long ? "border-amber-300 bg-amber-50" : "bg-background")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/patients/${p.id}`}
                          className="rounded-sm font-semibold underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          {p.name}
                        </Link>
                        {i === 0 && (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/10" variant="outline">
                            Next up
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.start} with {v.short} · {v.room}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={cn(
                          "text-lg font-semibold leading-none tabular-nums",
                          long && "text-amber-800",
                        )}
                      >
                        {waited} min
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {long ? "long wait · " : ""}in at {a.checkedInAt}
                      </p>
                    </div>
                  </div>
                  <AlertBadges alerts={p.alerts} className="mt-2" />
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export function RoomsPanel({ appointments }: { appointments: Appointment[] }) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base">Vets and rooms</CardTitle>
        <CardDescription>Who is with whom right now</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <ul className="divide-y">
          {vets.map((v) => {
            const current = appointments.find((a) => a.vet === v.id && a.status === "in_exam");
            const next = appointments
              .filter((a) => a.vet === v.id && (a.status === "booked" || a.status === "checked_in"))
              .sort((a, b) => toMin(a.start) - toMin(b.start))[0];
            const cur = current ? getPatient(current.patient) : undefined;
            const nxt = next ? getPatient(next.patient) : undefined;
            return (
              <li key={v.id} className="py-2.5 first:pt-0 last:pb-0">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <span aria-hidden className={cn("size-2.5 rounded-full", vetDot[v.id])} />
                  {v.name}
                  <span className="font-normal text-muted-foreground">· {v.room}</span>
                </p>
                <p className="mt-0.5 text-sm">
                  {cur ? (
                    <>
                      <span className="font-medium text-sky-900">In exam:</span> {cur.name}
                      {cur.alerts.length > 0 && (
                        <span className="ml-1.5 rounded bg-red-700 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                          Alert
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Free right now</span>
                  )}
                </p>
                {next && nxt && (
                  <p className="text-xs text-muted-foreground">
                    Next: {next.start} {nxt.name}
                    {next.status === "checked_in" ? " (waiting)" : ""}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
