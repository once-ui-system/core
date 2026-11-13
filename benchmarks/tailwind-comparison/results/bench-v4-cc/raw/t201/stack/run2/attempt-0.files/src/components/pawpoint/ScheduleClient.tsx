"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Checkbox,
  Column,
  Dialog,
  Grid,
  Heading,
  Icon,
  Input,
  Row,
  SegmentedControl,
  Tag,
  Text,
} from "@once-ui-system/core";
import {
  CLOSE_MINUTES,
  NOW_MINUTES,
  OPEN_MINUTES,
  STATUS_LABEL,
  TODAY,
  findVetConflict,
  formatDate,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  overlaps,
  patients,
  searchPatients,
  timeRange,
  toClock,
  toMinutes,
  vets,
  type Appointment,
  type Patient,
  type Status,
} from "@/lib/data";
import { AlertBanner, AlertTags } from "./Alerts";

const STATUS_SCHEME: Record<Status, "neutral" | "info" | "brand" | "success"> = {
  booked: "neutral",
  checked_in: "info",
  in_exam: "brand",
  done: "success",
  cancelled: "neutral",
};

const SLOTS: number[] = [];
for (let m = OPEN_MINUTES; m < CLOSE_MINUTES; m += 15) SLOTS.push(m);
const DURATIONS = [15, 20, 30, 45, 60];

const controlStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "3rem",
  padding: "0 0.75rem",
  borderRadius: "var(--radius-m)",
  border: "1px solid var(--neutral-alpha-strong)",
  background: "var(--surface-background)",
  color: "var(--neutral-on-background-strong)",
  font: "inherit",
  fontSize: "1rem",
};

const listReset: React.CSSProperties = { listStyle: "none", margin: 0, padding: 0 };

function patientOf(id: string): Patient {
  return getPatient(id) ?? patients[0];
}

/* ---------- search ---------- */

function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchPatients(query), [query]);
  const active = query.trim().length > 0;

  return (
    <Column gap="8" fillWidth style={{ flex: "1 1 18rem", minWidth: 0 }}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (results[0]) router.push(`/patients/${results[0].id}`);
        }}
      >
        <Input
          id="patient-search"
          type="search"
          label="Search patient or owner by name"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </form>
      {active && (
        <Column background="surface" border radius="l" padding="8" gap="4" fillWidth aria-live="polite">
          {results.length === 0 ? (
            <Text variant="body-default-m" onBackground="neutral-weak" padding="8">
              No patient or owner matches &ldquo;{query.trim()}&rdquo;.
            </Text>
          ) : (
            <ul style={{ ...listReset, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {results.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/patients/${p.id}`}
                    style={{ display: "block", textDecoration: "none", color: "inherit", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-m)" }}
                  >
                    <Row gap="12" vertical="center" wrap horizontal="between">
                      <Column gap="2">
                        <Text variant="label-strong-m">
                          {p.name}{" "}
                          <Text as="span" variant="body-default-s" onBackground="neutral-weak">
                            {p.species}, {p.breed}
                          </Text>
                        </Text>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          Owner: {getOwner(p.owner).name}
                        </Text>
                      </Column>
                      <Row gap="8" vertical="center">
                        <AlertTags alerts={p.alerts} />
                        <Icon name="chevronRight" size="s" onBackground="neutral-weak" />
                      </Row>
                    </Row>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Column>
      )}
    </Column>
  );
}

/* ---------- booking ---------- */

interface NewBooking {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  urgent: boolean;
}

function slotProblem(list: Appointment[], now: number, vetId: string, patientId: string, start: number, minutes: number): string | null {
  if (start < now) return "That time has already passed. Pick a later slot.";
  if (start + minutes > CLOSE_MINUTES) return `That visit would run past closing at ${toClock(CLOSE_MINUTES)}.`;
  const vetClash = findVetConflict(list, vetId, start, minutes);
  if (vetClash) {
    return `${getVet(vetId).name} is already booked ${timeRange(vetClash)} with ${patientOf(vetClash.patient).name}.`;
  }
  if (patientId) {
    const own = list.find((a) => a.patient === patientId && overlaps(a, start, minutes));
    if (own) return `${patientOf(patientId).name} already has a visit ${timeRange(own)} with ${getVet(own.vet).name}.`;
  }
  return null;
}

const selectLabel: React.CSSProperties = { fontSize: "0.875rem", fontWeight: 600 };

function BookingDialog({
  open,
  onClose,
  appts,
  now,
  onBook,
}: {
  open: boolean;
  onClose: () => void;
  appts: Appointment[];
  now: number;
  onBook: (b: NewBooking) => void;
}) {
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState("v-1");
  const [minutes, setMinutes] = useState(20);
  const [reason, setReason] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [start, setStart] = useState<number>(() => {
    const free = SLOTS.find((s) => !slotProblem(appts, now, "v-1", "", s, 20));
    return free ?? SLOTS[0];
  });

  const patient = patients.find((p) => p.id === patientId);
  const problem = slotProblem(appts, now, vetId, patientId, start, minutes);
  const vetDay = appts
    .filter((a) => a.vet === vetId && a.status !== "cancelled")
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const canBook = Boolean(patient) && !problem;

  const submit = () => {
    if (!patient || problem) return;
    onBook({ patient: patient.id, vet: vetId, start: toClock(start), minutes, reason: reason.trim() || "Follow-up", urgent });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Book an appointment"
      description={`Today, ${formatDate(TODAY, "long")}. A vet cannot be double-booked.`}
      footer={
        <Row gap="8" horizontal="end" fillWidth wrap>
          <Button variant="secondary" label="Cancel" onClick={onClose} />
          <Button prefixIcon="calendar" label="Book appointment" onClick={submit} disabled={!canBook} />
        </Row>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Column gap="16" fillWidth>
          <Column gap="8" fillWidth>
            <label htmlFor="book-patient" style={selectLabel}>
              Patient
            </label>
            <select id="book-patient" style={controlStyle} value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              <option value="">Choose a patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species}) · {getOwner(p.owner).name}
                  {p.alerts.length ? " · ALERT" : ""}
                </option>
              ))}
            </select>
          </Column>

          {patient && <AlertBanner alerts={patient.alerts} name={patient.name} />}

          <Column gap="8" fillWidth>
            <label htmlFor="book-vet" style={selectLabel}>
              Vet
            </label>
            <select id="book-vet" style={controlStyle} value={vetId} onChange={(e) => setVetId(e.target.value)}>
              {vets.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} · {v.room}
                </option>
              ))}
            </select>
          </Column>

          <Row gap="16" wrap fillWidth>
            <Column gap="8" style={{ flex: "1 1 10rem" }}>
              <label htmlFor="book-time" style={selectLabel}>
                Start time
              </label>
              <select id="book-time" style={controlStyle} value={start} onChange={(e) => setStart(Number(e.target.value))}>
                {SLOTS.map((s) => {
                  const p = slotProblem(appts, now, vetId, patientId, s, minutes);
                  return (
                    <option key={s} value={s} disabled={Boolean(p)}>
                      {toClock(s)}
                      {p ? (s < now ? " (passed)" : " (not free)") : ""}
                    </option>
                  );
                })}
              </select>
            </Column>
            <Column gap="8" style={{ flex: "1 1 10rem" }}>
              <label htmlFor="book-length" style={selectLabel}>
                Length
              </label>
              <select id="book-length" style={controlStyle} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} minutes
                  </option>
                ))}
              </select>
            </Column>
          </Row>

          <Input id="book-reason" label="Reason for visit" value={reason} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)} />
          <Checkbox label="Urgent visit" description="Highlights the booking on the schedule." checked={urgent} onToggle={setUrgent} />

          <Column gap="4" aria-live="polite">
            {problem ? (
              <Row gap="8" vertical="start" role="alert">
                <Icon name="danger" onBackground="danger-strong" size="s" />
                <Text variant="label-strong-s" onBackground="danger-strong">
                  {problem}
                </Text>
              </Row>
            ) : (
              <Text variant="body-default-s" onBackground="success-strong">
                {toClock(start)}&ndash;{toClock(start + minutes)} is free for {getVet(vetId).name}.
              </Text>
            )}
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {getVet(vetId).name} today:{" "}
              {vetDay.length === 0 ? "nothing booked." : vetDay.map((a) => `${timeRange(a)} ${patientOf(a.patient).name}`).join(" · ")}
            </Text>
          </Column>
        </Column>
      </form>
    </Dialog>
  );
}

/* ---------- schedule rows ---------- */

function AppointmentItem({
  a,
  isNew,
  onCheckIn,
}: {
  a: Appointment;
  isNew: boolean;
  onCheckIn: (id: string) => void;
}) {
  const patient = patientOf(a.patient);
  const owner = getOwner(patient.owner);
  const vet = getVet(a.vet);
  const cancelled = a.status === "cancelled";

  return (
    <li style={listReset}>
      <Column
        background={a.urgent && !cancelled ? "danger-alpha-weak" : "surface"}
        border
        radius="l"
        padding="16"
        gap="12"
        opacity={cancelled ? 70 : 100}
        style={a.urgent && !cancelled ? { borderLeft: "6px solid var(--danger-solid-strong)" } : undefined}
      >
        <Row gap="16" wrap vertical="start">
          <Column gap="2" style={{ flex: "0 0 5.5rem" }}>
            <Text variant="heading-strong-l">{a.start}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {a.minutes} min
            </Text>
          </Column>

          <Column gap="8" style={{ flex: "1 1 15rem", minWidth: 0 }}>
            <Row gap="8" vertical="center" wrap>
              <Link href={`/patients/${patient.id}`} style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "3px" }}>
                <Text variant="heading-strong-m" style={cancelled ? { textDecoration: "line-through" } : undefined}>
                  {patient.name}
                </Text>
              </Link>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {patient.species}, {patient.breed}
              </Text>
              {a.urgent && (
                <Tag scheme="danger" prefixIcon="bolt" size="m">
                  <span style={{ fontWeight: 700 }}>Urgent</span>
                </Tag>
              )}
              {isNew && (
                <Tag scheme="success" size="m">
                  Just booked
                </Tag>
              )}
            </Row>
            <Text variant="body-default-m">{a.reason}</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Owner: {owner.name} · {owner.phone}
            </Text>
            <AlertTags alerts={patient.alerts} />
          </Column>

          <Column gap="8" style={{ flex: "1 1 12rem" }} horizontal="start">
            <Row gap="8" vertical="center" wrap>
              <Tag scheme={STATUS_SCHEME[a.status]} size="m">
                {STATUS_LABEL[a.status]}
                {a.status === "checked_in" && a.checkedInAt ? ` ${a.checkedInAt}` : ""}
              </Tag>
            </Row>
            <Text variant="body-default-s">
              {vet.name}
              <Text as="span" variant="body-default-s" onBackground="neutral-weak">
                {" "}
                · {vet.room}
              </Text>
            </Text>
            {a.status === "booked" && (
              <Button
                size="m"
                prefixIcon="check"
                label="Check in"
                aria-label={`Check in ${patient.name}`}
                onClick={() => onCheckIn(a.id)}
              />
            )}
          </Column>
        </Row>
      </Column>
    </li>
  );
}

function StatTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Column background="surface" border radius="l" padding="16" gap="4">
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text variant="display-strong-xs">{value}</Text>
      <Text variant="body-default-xs" onBackground="neutral-weak">
        {hint}
      </Text>
    </Column>
  );
}

/* ---------- page ---------- */

export function ScheduleClient() {
  const [appts, setAppts] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState<number>(NOW_MINUTES);
  const [filter, setFilter] = useState("all");
  const [dialogKey, setDialogKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [addedId, setAddedId] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const visible = useMemo(
    () =>
      appts
        .filter((a) => filter === "all" || a.vet === filter)
        .slice()
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [appts, filter],
  );

  const waiting = useMemo(
    () =>
      appts
        .filter((a) => a.status === "checked_in")
        .slice()
        .sort((a, b) => toMinutes(a.checkedInAt ?? a.start) - toMinutes(b.checkedInAt ?? b.start)),
    [appts],
  );

  const inExam = appts.filter((a) => a.status === "in_exam").length;
  const upcoming = appts
    .filter((a) => a.status === "booked")
    .slice()
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const next = upcoming[0];
  const urgentLeft = upcoming.filter((a) => a.urgent);
  const longest = waiting.length ? Math.max(...waiting.map((a) => now - toMinutes(a.checkedInAt ?? a.start))) : 0;

  const checkIn = (id: string) => {
    const a = appts.find((x) => x.id === id);
    if (!a) return;
    setAppts((list) => list.map((x) => (x.id === id ? { ...x, status: "checked_in", checkedInAt: toClock(now) } : x)));
    setNotice(`${patientOf(a.patient).name} checked in at ${toClock(now)} for ${getVet(a.vet).name}.`);
  };

  const book = (b: NewBooking) => {
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    setAppts((list) => [...list, { id, patient: b.patient, vet: b.vet, start: b.start, minutes: b.minutes, reason: b.reason, status: "booked", urgent: b.urgent || undefined }]);
    setNotice(`Booked ${patientOf(b.patient).name} with ${getVet(b.vet).name} at ${b.start}.`);
    setAddedId(id);
    if (filter !== "all" && filter !== b.vet) setFilter("all");
    setDialogOpen(false);
  };

  const openBooking = () => {
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  return (
    <Column fillWidth maxWidth={80} padding="16" gap="24" paddingBottom="40">
      <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Text variant="label-default-s" onBackground="neutral-weak">
            {formatDate(TODAY, "long")} · Now {toClock(now)}
          </Text>
          <Heading as="h1" variant="display-strong-xs">
            Today&rsquo;s schedule
          </Heading>
        </Column>
      </Row>

      <Row fillWidth gap="16" vertical="start" wrap>
        <PatientSearch />
        <Button prefixIcon="plus" label="Book appointment" size="l" onClick={openBooking} />
      </Row>

      {notice && (
        <Row role="status" background="success-alpha-weak" border="success-medium" radius="m" padding="12" gap="8" vertical="center" fillWidth>
          <Icon name="check" onBackground="success-strong" size="s" />
          <Text variant="label-strong-s" onBackground="success-strong">
            {notice}
          </Text>
        </Row>
      )}

      <Grid columns="4" s={{ columns: "2" }} gap="12" fillWidth>
        <StatTile
          label="Waiting now"
          value={String(waiting.length)}
          hint={waiting.length ? `Longest wait ${longest} min` : "Waiting room is clear"}
        />
        <StatTile label="In exam" value={String(inExam)} hint="With a vet or in surgery" />
        <StatTile label="Next up" value={next ? next.start : "None"} hint={next ? `${patientOf(next.patient).name} with ${getVet(next.vet).name}` : "No more booked visits"} />
        <StatTile
          label="Urgent still to come"
          value={String(urgentLeft.length)}
          hint={urgentLeft.length ? urgentLeft.map((a) => `${patientOf(a.patient).name} ${a.start}`).join(", ") : "None"}
        />
      </Grid>

      <Row fillWidth gap="24" vertical="start" m={{ direction: "column" }}>
        <Column
          as="section"
          aria-labelledby="waiting-title"
          gap="12"
          width="24rem"
          m={{ width: "auto", fillWidth: true }}
          style={{ flexShrink: 0 }}
        >
          <Heading as="h2" id="waiting-title" variant="heading-strong-l">
            Waiting room
          </Heading>
          {waiting.length === 0 ? (
            <Column background="surface" border radius="l" padding="16">
              <Text variant="body-default-m" onBackground="neutral-weak">
                No one is waiting. Check a patient in from the schedule.
              </Text>
            </Column>
          ) : (
            <ol style={{ ...listReset, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {waiting.map((a, i) => {
                const p = patientOf(a.patient);
                const waited = now - toMinutes(a.checkedInAt ?? a.start);
                const long = waited >= 30;
                return (
                  <li key={a.id}>
                    <Column background="surface" border radius="l" padding="16" gap="8">
                      <Row horizontal="between" vertical="center" gap="8" wrap>
                        <Text variant="heading-strong-m">
                          {i + 1}. {p.name}
                        </Text>
                        <Tag scheme={long ? "warning" : "neutral"} prefixIcon="time" size="m">
                          {waited} min
                        </Tag>
                      </Row>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        In at {a.checkedInAt} for {getVet(a.vet).name} ({getVet(a.vet).room}) · {a.reason}
                      </Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        Owner: {getOwner(p.owner).name}
                      </Text>
                      <AlertTags alerts={p.alerts} />
                    </Column>
                  </li>
                );
              })}
            </ol>
          )}
        </Column>

        <Column as="section" aria-labelledby="schedule-title" gap="12" fillWidth style={{ minWidth: 0 }}>
          <Row horizontal="between" vertical="center" gap="12" wrap fillWidth>
            <Heading as="h2" id="schedule-title" variant="heading-strong-l">
              Appointments{" "}
              <Text as="span" variant="body-default-m" onBackground="neutral-weak">
                ({visible.length})
              </Text>
            </Heading>
            <SegmentedControl
              buttons={[
                { value: "all", label: "All vets" },
                ...vets.map((v) => ({ value: v.id, label: v.name.replace("Dr. ", "") })),
              ]}
              value={filter}
              onChange={(v) => setFilter(v)}
            />
          </Row>
          <ul style={{ ...listReset, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {visible.map((a) => (
              <AppointmentItem key={a.id} a={a} isNew={a.id === addedId} onCheckIn={checkIn} />
            ))}
          </ul>
        </Column>
      </Row>

      <BookingDialog key={dialogKey} open={dialogOpen} onClose={() => setDialogOpen(false)} appts={appts} now={now} onBook={book} />
    </Column>
  );
}
