import Link from "next/link";
import { Check, Siren, Stethoscope } from "lucide-react";
import { AlertBadges } from "@/components/alert-badges";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { endTime, type Appointment, type Owner, type Patient, type Vet } from "@/lib/data";
import { cn } from "@/lib/utils";

export const vetDot: Record<string, string> = {
  "v-1": "bg-sky-600",
  "v-2": "bg-violet-600",
  "v-3": "bg-emerald-600",
};

type Props = {
  appointment: Appointment;
  patient: Patient;
  owner: Owner;
  vet: Vet;
  highlighted: boolean;
  onCheckIn: () => void;
  onStartExam: () => void;
  onFinish: () => void;
};

export function AppointmentRow({ appointment: a, patient, owner, vet, highlighted, onCheckIn, onStartExam, onFinish }: Props) {
  const closed = a.status === "done" || a.status === "cancelled";
  return (
    <li
      id={`appt-${a.id}`}
      data-status={a.status}
      data-urgent={a.urgent ? "true" : undefined}
      className={cn(
        "relative grid gap-x-4 gap-y-3 border-b px-4 py-4 transition-colors last:border-b-0 md:grid-cols-[9rem_minmax(0,1.05fr)_minmax(0,1.4fr)_10.5rem]",
        a.urgent && !closed && "bg-red-50 before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-red-600",
        a.status === "in_exam" && !a.urgent && "bg-sky-50/60",
        closed && "bg-muted/40",
        highlighted && "bg-primary/10 ring-2 ring-inset ring-primary",
      )}
    >
      <div className="flex items-baseline gap-3 md:block">
        <p className={cn("text-xl font-semibold leading-none tabular-nums", closed && "text-muted-foreground")}>
          {a.start}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground md:mt-1.5">
          to {endTime(a)} · {a.minutes} min
        </p>
        <p className="ml-auto flex items-center gap-1.5 text-xs font-medium md:ml-0 md:mt-1.5">
          <span aria-hidden className={cn("size-2 rounded-full", vetDot[vet.id])} />
          <span>
            {vet.short}
            <span className="font-normal text-muted-foreground"> · {vet.room}</span>
          </span>
        </p>
      </div>

      <div className="min-w-0">
        <Link
          href={`/patients/${patient.id}`}
          className={cn(
            "rounded-sm text-lg font-semibold leading-tight underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50",
            closed && "text-muted-foreground",
          )}
        >
          {patient.name}
        </Link>
        <p className="text-sm text-muted-foreground">
          {patient.species} · {patient.breed}
        </p>
        <p className="mt-0.5 text-sm">
          <span className="text-muted-foreground">Owner </span>
          {owner.name}
        </p>
      </div>

      <div className="min-w-0 space-y-2">
        <p className={cn("text-sm font-medium", a.status === "cancelled" && "text-muted-foreground line-through")}>
          {a.urgent && (
            <span className="mr-2 inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 align-middle text-xs font-bold uppercase tracking-wide text-white">
              <Siren aria-hidden className="size-3.5" />
              Urgent
            </span>
          )}
          {a.reason}
        </p>
        <AlertBadges alerts={patient.alerts} />
      </div>

      <div className="flex flex-row items-center justify-between gap-2 md:flex-col md:items-stretch md:justify-start">
        <StatusBadge status={a.status} className="self-start md:self-end" />
        {a.status === "booked" && (
          <Button onClick={onCheckIn} className="h-11 flex-1 md:flex-none" aria-label={`Check in ${patient.name}`}>
            <Check aria-hidden />
            Check in
          </Button>
        )}
        {a.status === "checked_in" && (
          <Button onClick={onStartExam} variant="outline" className="h-11 flex-1 md:flex-none" aria-label={`Start exam for ${patient.name}`}>
            <Stethoscope aria-hidden />
            Start exam
          </Button>
        )}
        {a.status === "in_exam" && (
          <Button onClick={onFinish} variant="outline" className="h-11 flex-1 md:flex-none" aria-label={`Mark done, ${patient.name}`}>
            <Check aria-hidden />
            Mark done
          </Button>
        )}
      </div>
    </li>
  );
}
