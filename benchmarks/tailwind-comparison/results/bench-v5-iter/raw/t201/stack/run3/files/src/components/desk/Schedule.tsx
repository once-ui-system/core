"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Column,
  Dialog,
  Grid,
  Heading,
  Icon,
  Input,
  Row,
  SegmentedControl,
  Select,
  SmartLink,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import {
  type Appointment,
  type Status,
  findClash,
  getOwner,
  getPatient,
  getVet,
  initialAppointments,
  nowMinutes,
  patients,
  statusLabel,
  toHHMM,
  toMinutes,
  vets,
} from "@/lib/data";
import { AlertTags } from "./AlertTags";

const CLOSING = 17 * 60;
const firstSlot = Math.ceil(nowMinutes / 15) * 15;
const slots: string[] = [];
for (let t = firstSlot; t < CLOSING; t += 15) slots.push(toHHMM(t));
const durations = [15, 20, 30, 45, 60];

const statusScheme: Record<Status, "neutral" | "info" | "accent" | "success"> = {
  booked: "neutral",
  checked_in: "info",
  in_exam: "accent",
  done: "success",
  cancelled: "neutral",
};

const nextStatus: Partial<Record<Status, { to: Status; label: string }>> = {
  booked: { to: "checked_in", label: "Check in" },
  checked_in: { to: "in_exam", label: "Start exam" },
  in_exam: { to: "done", label: "Mark done" },
};

function waitLabel(mins: number): string {
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} h ${mins % 60} min`;
}

export function Schedule() {
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [vetFilter, setVetFilter] = useState("all");
  const [now, setNow] = useState(nowMinutes);
  const [dialogOpen, setDialogOpen] = useState(false);

  // The desk clock moves on while the page is open, so waits keep counting.
  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      setNow(nowMinutes + Math.floor((Date.now() - start) / 60000));
    }, 15000);
    return () => window.clearInterval(id);
  }, []);

  const sorted = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet),
      ),
    [appointments],
  );
  const visible = sorted.filter((a) => vetFilter === "all" || a.vet === vetFilter);

  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0));
  const inExam = appointments.filter((a) => a.status === "in_exam");
  const count = (s: Status) => appointments.filter((a) => a.status === s).length;

  const advance = (a: Appointment) => {
    const step = nextStatus[a.status];
    if (!step) return;
    setAppointments((list) =>
      list.map((x) =>
        x.id === a.id
          ? { ...x, status: step.to, checkedInAt: step.to === "checked_in" ? now : x.checkedInAt }
          : x,
      ),
    );
    const name = getPatient(a.patient)?.name ?? "Patient";
    addToast({
      variant: "success",
      message:
        step.to === "checked_in"
          ? `${name} checked in. Added to the waiting list.`
          : step.to === "in_exam"
            ? `${name} is in the exam room.`
            : `${name} is done.`,
    });
  };

  const addAppointment = (a: Omit<Appointment, "id">) => {
    const id = `a-${String(appointments.length + 1).padStart(2, "0")}`;
    setAppointments((list) => [...list, { ...a, id }]);
    const name = getPatient(a.patient)?.name ?? "Patient";
    addToast({
      variant: "success",
      message: `${name} booked with ${getVet(a.vet)?.name} at ${a.start}.`,
    });
  };

  return (
    <>
      <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Heading as="h1" variant="display-strong-xs">
            Today&rsquo;s schedule
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Thursday, 12 November 2026 &middot; desk clock {toHHMM(now)}
          </Text>
        </Column>
        <Button prefixIcon="plus" size="l" onClick={() => setDialogOpen(true)}>
          Book appointment
        </Button>
      </Row>

      <Grid columns="4" s={{ columns: "2" }} gap="12" role="list" aria-label="Today at a glance">
        <Stat label="Waiting" value={count("checked_in")} tone={count("checked_in") > 0 ? "info" : "neutral"} />
        <Stat label="In exam" value={count("in_exam")} tone="accent" />
        <Stat label="Still to arrive" value={count("booked")} tone="neutral" />
        <Stat label="Done" value={count("done")} tone="success" />
      </Grid>

      <Row fillWidth gap="24" direction="row-reverse" vertical="start" m={{ direction: "column" }}>
        <Column
          as="aside"
          aria-label="Waiting list"
          gap="16"
          width="24rem"
          minWidth="20rem"
          m={{ width: "100%", minWidth: "0px" }}
        >
          <Column background="surface" border radius="l" padding="20" gap="16">
            <Row horizontal="between" vertical="center">
              <Heading as="h2" variant="heading-strong-l">
                Waiting list
              </Heading>
              <Tag scheme="info" label={`${waiting.length} waiting`} />
            </Row>
            {waiting.length === 0 ? (
              <Text variant="body-default-m" onBackground="neutral-weak">
                Nobody is waiting. Checked-in patients appear here.
              </Text>
            ) : (
              <Column as="ol" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
                {waiting.map((a, i) => {
                  const p = getPatient(a.patient);
                  const v = getVet(a.vet);
                  const waited = Math.max(0, now - (a.checkedInAt ?? now));
                  return (
                    <Column
                      as="li"
                      key={a.id}
                      gap="8"
                      padding="12"
                      radius="m"
                      border={i === 0 ? "brand-alpha-strong" : true}
                      background={i === 0 ? "brand-alpha-weak" : "page"}
                    >
                      <Row horizontal="between" vertical="center" gap="8" wrap>
                        <Row gap="8" vertical="center">
                          <Text variant="label-strong-s" onBackground="neutral-weak">
                            {i + 1}.
                          </Text>
                          <SmartLink href={`/patients/${a.patient}`}>
                            <Text variant="label-strong-l">{p?.name}</Text>
                          </SmartLink>
                          {i === 0 && <Tag scheme="brand" size="s" label="Next" />}
                        </Row>
                        <Row gap="4" vertical="center">
                          <Icon name="time" size="s" onBackground={waited >= 30 ? "warning-strong" : "neutral-weak"} />
                          <Text variant="label-strong-s" onBackground={waited >= 30 ? "warning-strong" : "neutral-strong"}>
                            Waiting {waitLabel(waited)}
                          </Text>
                        </Row>
                      </Row>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {a.reason} &middot; {v?.name}, {v?.room}
                      </Text>
                      <AlertTags alerts={p?.alerts ?? []} size="s" />
                      <Row>
                        <Button size="s" variant="secondary" onClick={() => advance(a)} aria-label={`Start exam for ${p?.name}`}>
                          Start exam
                        </Button>
                      </Row>
                    </Column>
                  );
                })}
              </Column>
            )}
          </Column>

          <Column background="surface" border radius="l" padding="20" gap="12">
            <Heading as="h2" variant="heading-strong-l">
              In exam now
            </Heading>
            {inExam.length === 0 ? (
              <Text variant="body-default-m" onBackground="neutral-weak">
                No exams in progress.
              </Text>
            ) : (
              <Column as="ul" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
                {inExam.map((a) => {
                  const p = getPatient(a.patient);
                  const v = getVet(a.vet);
                  return (
                    <Column as="li" key={a.id} gap="4">
                      <Row horizontal="between" gap="8" wrap>
                        <SmartLink href={`/patients/${a.patient}`}>
                          <Text variant="label-strong-m">{p?.name}</Text>
                        </SmartLink>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {v?.room} &middot; {v?.name}
                        </Text>
                      </Row>
                      <AlertTags alerts={p?.alerts ?? []} size="s" />
                    </Column>
                  );
                })}
              </Column>
            )}
          </Column>
        </Column>

        <Column fillWidth gap="12" minWidth="0px">
          <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
            <Heading as="h2" variant="heading-strong-l">
              Appointments
            </Heading>
            <SegmentedControl
              defaultValue="all"
              onChange={(v) => setVetFilter(v)}
              buttons={[
                { value: "all", label: "All vets" },
                ...vets.map((v) => ({ value: v.id, label: v.name })),
              ]}
            />
          </Row>

          <Column as="ul" background="surface" border radius="l" margin="0" padding="0" overflow="hidden" style={{ listStyle: "none" }}>
            {visible.map((a, i) => (
              <AppointmentRow key={a.id} a={a} first={i === 0} onAdvance={advance} />
            ))}
            {visible.length === 0 && (
              <Text as="li" variant="body-default-m" onBackground="neutral-weak" padding="24">
                No appointments for this vet today.
              </Text>
            )}
          </Column>
        </Column>
      </Row>

      <BookDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        appointments={appointments}
        onBook={(a) => {
          addAppointment(a);
          setDialogOpen(false);
        }}
      />
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "neutral" | "info" | "accent" | "success" }) {
  return (
    <Column as="div" role="listitem" background="surface" border radius="l" padding="16" gap="4">
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text variant="display-strong-s" onBackground={tone === "neutral" ? "neutral-strong" : `${tone}-strong`}>
        {value}
      </Text>
    </Column>
  );
}

function AppointmentRow({
  a,
  first,
  onAdvance,
}: {
  a: Appointment;
  first: boolean;
  onAdvance: (a: Appointment) => void;
}) {
  const p = getPatient(a.patient);
  const o = p ? getOwner(p.owner) : undefined;
  const v = getVet(a.vet);
  const step = nextStatus[a.status];
  const cancelled = a.status === "cancelled";
  const end = toHHMM(toMinutes(a.start) + a.minutes);
  return (
    <Row
      as="li"
      fillWidth
      gap="16"
      padding="16"
      vertical="start"
      borderTop={first ? undefined : true}
      background={a.urgent && !cancelled ? "warning-alpha-weak" : undefined}
      s={{ direction: "column", gap: "8" }}
      style={{
        opacity: cancelled ? 0.6 : 1,
        boxShadow: a.urgent && !cancelled ? "inset 4px 0 0 var(--warning-solid-strong)" : undefined,
      }}
    >
      <Column width="6rem" gap="0" s={{ width: "100%" }}>
        <Text variant="heading-strong-l">{a.start}</Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          until {end} &middot; {a.minutes} min
        </Text>
      </Column>

      <Column flex={1} gap="4" minWidth="0px">
        <Row gap="8" vertical="center" wrap>
          <SmartLink href={`/patients/${a.patient}`}>
            <Text variant="label-strong-l" onBackground="brand-strong" style={cancelled ? { textDecoration: "line-through" } : undefined}>
              {p?.name}
            </Text>
          </SmartLink>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {p?.species}, {p?.breed}
          </Text>
          {a.urgent && !cancelled && <Tag scheme="warning" size="m" prefixIcon="bolt" label="Urgent" />}
        </Row>
        <Text variant="body-default-m">{a.reason}</Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {o?.name} &middot; {o?.phone}
        </Text>
        <AlertTags alerts={p?.alerts ?? []} size="s" />
      </Column>

      <Column width="11rem" gap="0" s={{ width: "100%" }}>
        <Text variant="label-default-m">{v?.name}</Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {v?.room}
        </Text>
      </Column>

      <Column width="10rem" gap="8" s={{ width: "100%" }} horizontal="start">
        <Tag scheme={statusScheme[a.status]} size="m" label={statusLabel[a.status]} />
        {step && (
          <Button
            size="m"
            variant={a.status === "booked" ? "primary" : "secondary"}
            onClick={() => onAdvance(a)}
            aria-label={`${step.label}: ${p?.name}, ${a.start}`}
          >
            {step.label}
          </Button>
        )}
      </Column>
    </Row>
  );
}

function BookDialog({
  open,
  onClose,
  appointments,
  onBook,
}: {
  open: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onBook: (a: Omit<Appointment, "id">) => void;
}) {
  const [patient, setPatient] = useState("");
  const [vet, setVet] = useState("");
  const [time, setTime] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [reason, setReason] = useState("");

  const mins = Number(minutes);
  const complete = Boolean(patient && vet && time && reason.trim());
  const clash = vet && time ? findClash(appointments, vet, time, mins) : undefined;
  const pastClosing = time ? toMinutes(time) + mins > CLOSING : false;
  const patientRecord = getPatient(patient);

  // Earliest slot for this vet, at or after the chosen time, that does not clash.
  const suggestion = useMemo(() => {
    if (!clash || !vet || !time) return undefined;
    return slots.find(
      (s) =>
        toMinutes(s) >= toMinutes(time) &&
        toMinutes(s) + mins <= CLOSING &&
        !findClash(appointments, vet, s, mins),
    );
  }, [clash, vet, time, mins, appointments]);

  const reset = () => {
    setPatient("");
    setVet("");
    setTime("");
    setMinutes("20");
    setReason("");
  };

  const canBook = complete && !clash && !pastClosing;

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      title="Book appointment"
      description="Pick the patient, the vet and a time. A vet cannot be booked twice at once."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canBook) return;
          onBook({ patient, vet, start: time, minutes: mins, reason: reason.trim(), status: "booked" });
          reset();
        }}
      >
        <Column gap="16" paddingTop="8">
          <Select
            id="book-patient"
            label="Patient"
            value={patient}
            onSelect={(v) => setPatient(String(v))}
            searchable
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.species}), ${getOwner(p.owner)?.name}`,
            }))}
          />
          {patientRecord && patientRecord.alerts.length > 0 && <AlertTags alerts={patientRecord.alerts} />}
          <Select
            id="book-vet"
            label="Vet"
            value={vet}
            onSelect={(v) => setVet(String(v))}
            options={vets.map((v) => ({ value: v.id, label: `${v.name}, ${v.room}` }))}
          />
          <Row gap="12" s={{ direction: "column" }}>
            <Select
              id="book-time"
              label="Time"
              value={time}
              onSelect={(v) => setTime(String(v))}
              options={slots.map((s) => ({ value: s, label: s }))}
            />
            <Select
              id="book-length"
              label="Length"
              value={minutes}
              onSelect={(v) => setMinutes(String(v))}
              options={durations.map((d) => ({ value: String(d), label: `${d} min` }))}
            />
          </Row>
          <Input id="book-reason" label="Reason for visit" value={reason} onChange={(e) => setReason(e.target.value)} />

          {clash && (
            <Column
              role="alert"
              gap="8"
              padding="12"
              radius="m"
              background="danger-alpha-weak"
              border="danger-alpha-strong"
            >
              <Row gap="8" vertical="start">
                <Icon name="danger" size="s" onBackground="danger-strong" />
                <Text variant="body-default-s" onBackground="danger-strong">
                  {getVet(vet)?.name} already has {getPatient(clash.patient)?.name} at {clash.start} to{" "}
                  {toHHMM(toMinutes(clash.start) + clash.minutes)}. Choose another time or vet.
                </Text>
              </Row>
              {suggestion && (
                <Row>
                  <Button size="s" variant="secondary" type="button" onClick={() => setTime(suggestion)}>
                    Use {suggestion} instead
                  </Button>
                </Row>
              )}
            </Column>
          )}
          {!clash && pastClosing && (
            <Text role="alert" variant="body-default-s" onBackground="danger-strong">
              That runs past closing at 17:00. Pick an earlier time or a shorter visit.
            </Text>
          )}

          <Row gap="12" horizontal="end">
            <Button
              type="button"
              variant="tertiary"
              onClick={() => {
                onClose();
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canBook}>
              Book appointment
            </Button>
          </Row>
        </Column>
      </form>
    </Dialog>
  );
}
