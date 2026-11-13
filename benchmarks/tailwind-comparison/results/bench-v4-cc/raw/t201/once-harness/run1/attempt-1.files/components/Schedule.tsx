"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Button,
  Column,
  Dialog,
  Grid,
  Heading,
  Input,
  Row,
  SegmentedControl,
  Select,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import {
  CLOSE_MINUTES,
  NOW_MINUTES,
  OPEN_MINUTES,
  TODAY,
  type Appointment,
  type Status,
  findOwner,
  findPatient,
  findVet,
  formatDuration,
  formatLongDate,
  formatMinutes,
  formatTime,
  fromMinutes,
  initialAppointments,
  patients,
  toMinutes,
  vets,
} from "@/lib/data";
import { AlertBanner, AlertTags } from "./Alerts";
import { Panel } from "./Panel";

type ToneName = "neutral" | "brand" | "accent" | "info" | "success" | "warning" | "danger";

const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};
const STATUS_TONE: Record<Status, ToneName> = {
  booked: "neutral",
  checked_in: "warning",
  in_exam: "accent",
  done: "success",
  cancelled: "neutral",
};

const SLOT_OPTIONS = (() => {
  const out: { value: string; label: string }[] = [];
  for (let t = OPEN_MINUTES; t < CLOSE_MINUTES; t += 15) {
    out.push({ value: fromMinutes(t), label: formatMinutes(t) });
  }
  return out;
})();

const DURATION_OPTIONS = [15, 20, 30, 45, 60, 90].map((m) => ({ value: String(m), label: formatDuration(m) }));

function overlaps(aStart: number, aLen: number, bStart: number, bLen: number) {
  return aStart < bStart + bLen && bStart < aStart + aLen;
}

function findClash(list: Appointment[], vetId: string, start: number, len: number) {
  return list.find(
    (a) => a.vet === vetId && a.status !== "cancelled" && overlaps(start, len, toMinutes(a.start), a.minutes),
  );
}

function nextFree(list: Appointment[], vetId: string, from: number, len: number) {
  for (let t = from; t + len <= CLOSE_MINUTES; t += 15) {
    if (!findClash(list, vetId, t, len)) return t;
  }
  return null;
}

export function Schedule() {
  const { addToast } = useToast();
  const [appts, setAppts] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(NOW_MINUTES);
  const [vetFilter, setVetFilter] = useState("all");

  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [vetId, setVetId] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("20");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow((n) => n + 1), 60000);
    return () => window.clearInterval(id);
  }, []);

  const sorted = useMemo(
    () =>
      [...appts].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [appts],
  );
  const visible = sorted.filter((a) => vetFilter === "all" || a.vet === vetFilter);
  const waiting = useMemo(
    () =>
      appts
        .filter((a) => a.status === "checked_in")
        .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0)),
    [appts],
  );
  const active = appts.filter((a) => a.status !== "cancelled");
  const counts = {
    total: active.length,
    waiting: waiting.length,
    inExam: appts.filter((a) => a.status === "in_exam").length,
    upcoming: appts.filter((a) => a.status === "booked").length,
  };

  function setStatus(id: string, status: Status) {
    setAppts((list) =>
      list.map((a) =>
        a.id === id ? { ...a, status, checkedInAt: status === "checked_in" ? now : a.checkedInAt } : a,
      ),
    );
  }

  function checkIn(a: Appointment) {
    setStatus(a.id, "checked_in");
    const p = findPatient(a.patient);
    addToast({ tone: "success", message: `${p?.name ?? "Patient"} checked in at ${formatMinutes(now)}.` });
  }

  /* ----- booking form ----- */
  const len = Number(duration);
  const start = time ? toMinutes(time) : null;
  const clash = start !== null && vetId ? findClash(appts, vetId, start, len) : undefined;
  const pastClose = start !== null && start + len > CLOSE_MINUTES;
  const suggestion = clash && start !== null ? nextFree(appts, vetId, start, len) : null;
  const selectedPatient = patientId ? findPatient(patientId) : undefined;

  let timeError = "";
  if (submitted && !time) timeError = "Pick a start time.";
  else if (pastClose) timeError = `Runs past closing time (${formatMinutes(CLOSE_MINUTES)}). Pick an earlier start or a shorter visit.`;
  else if (clash) {
    const cp = findPatient(clash.patient);
    const cv = findVet(clash.vet);
    timeError = `${cv?.name} already has ${cp?.name} from ${formatTime(clash.start)} to ${formatMinutes(
      toMinutes(clash.start) + clash.minutes,
    )}.${suggestion !== null ? ` Next free start: ${formatMinutes(suggestion)}.` : " No free slot left today."}`;
  }

  function resetForm() {
    setPatientId("");
    setVetId("");
    setTime("");
    setDuration("20");
    setReason("");
    setSubmitted(false);
  }

  function closeDialog() {
    setOpen(false);
    resetForm();
  }

  function submit() {
    setSubmitted(true);
    if (!patientId || !vetId || !time || !reason.trim() || clash || pastClose) return;
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    const created: Appointment = {
      id,
      patient: patientId,
      vet: vetId,
      start: time,
      minutes: len,
      reason: reason.trim(),
      status: "booked",
    };
    setAppts((list) => [...list, created]);
    addToast({
      tone: "success",
      message: `${selectedPatient?.name} booked with ${findVet(vetId)?.name} at ${formatTime(time)}.`,
    });
    setOpen(false);
    resetForm();
  }

  return (
    <Column fillWidth gap="24">
      <Row horizontal="between" vertical="end" gap="16" wrap>
        <Column gap="4">
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            {formatLongDate(TODAY)}
          </Text>
          <Heading as="h1" textVariant="display-strong-xs">
            Today&apos;s schedule
          </Heading>
        </Column>
        <Row gap="12" vertical="center">
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Front desk time {formatMinutes(now)}
          </Text>
          <Button prefixIcon="plus" onClick={() => setOpen(true)}>
            Book appointment
          </Button>
        </Row>
      </Row>

      <Grid columns="4" s={{ columns: 2 }} gap="12" fillWidth>
        <Stat label="Appointments" value={counts.total} />
        <Stat label="Waiting" value={counts.waiting} tone={counts.waiting > 0 ? "warning" : undefined} />
        <Stat label="In exam" value={counts.inExam} />
        <Stat label="Still to arrive" value={counts.upcoming} />
      </Grid>

      <Row direction="row-reverse" gap="24" m={{ direction: "column" }} fillWidth vertical="start">
        <Column width={360} m={{ fillWidth: true }} gap="24">
          <Panel id="waiting-heading" title="Waiting room" aside={<Tag tone={waiting.length ? "warning" : "neutral"} size="s" label={`${waiting.length} waiting`} />}>
            <Column gap="12" aria-live="polite">
              {waiting.length === 0 ? (
                <Text onBackground="neutral-weak">Nobody is waiting. Checked-in patients appear here.</Text>
              ) : (
                <Column as="ol" gap="12" padding="0" margin="0">
                  {waiting.map((a, i) => {
                    const p = findPatient(a.patient);
                    const vet = findVet(a.vet);
                    const waited = Math.max(0, now - (a.checkedInAt ?? now));
                    const long = waited >= 20;
                    return (
                      <Column
                        as="li"
                        key={a.id}
                        gap="8"
                        padding="12"
                        radius="m"
                        background={long ? "warning-alpha-weak" : "neutral-alpha-weak"}
                        border={long ? "warning-alpha-medium" : undefined}
                      >
                        <Row horizontal="between" vertical="center" gap="8" wrap>
                          <Row gap="8" vertical="center">
                            <Text textVariant="label-strong-s" onBackground="neutral-weak">
                              {i + 1}.
                            </Text>
                            <Link href={`/patients/${p?.id}`} style={{ color: "inherit", textUnderlineOffset: "3px" }}>
                              <Text textVariant="heading-strong-m">{p?.name}</Text>
                            </Link>
                            {i === 0 ? <Tag tone="brand" size="s" label="Next" /> : null}
                          </Row>
                          <Text textVariant="label-strong-m" onBackground={long ? "warning-strong" : "neutral-strong"}>
                            {formatDuration(waited)}
                          </Text>
                        </Row>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          {a.reason} · {vet?.name}, {vet?.room} · booked {formatTime(a.start)}
                        </Text>
                        <AlertTags alerts={p?.alerts ?? []} />
                        <Row>
                          <Button
                            size="s"
                            variant="secondary"
                            prefixIcon="arrowRight"
                            aria-label={`Send ${p?.name} to ${vet?.room}`}
                            onClick={() => setStatus(a.id, "in_exam")}
                          >
                            Send to {vet?.room}
                          </Button>
                        </Row>
                      </Column>
                    );
                  })}
                </Column>
              )}
            </Column>
          </Panel>

          <Panel id="vets-heading" title="Vets today">
            <Column gap="12">
              {vets.map((v) => {
                const current = appts.find((a) => a.vet === v.id && a.status === "in_exam");
                const left = appts.filter((a) => a.vet === v.id && (a.status === "booked" || a.status === "checked_in")).length;
                return (
                  <Row key={v.id} horizontal="between" vertical="center" gap="12">
                    <Column gap="0">
                      <Text textVariant="label-strong-m">{v.name}</Text>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        {v.room} · {left} to see
                      </Text>
                    </Column>
                    <Tag
                      tone={current ? "accent" : "success"}
                      size="s"
                      dot
                      label={current ? `With ${findPatient(current.patient)?.name}` : "Free"}
                    />
                  </Row>
                );
              })}
            </Column>
          </Panel>
        </Column>

        <Column fillWidth gap="16">
          <SegmentedControl
            aria-label="Filter schedule by vet"
            value={vetFilter}
            onValueChange={setVetFilter}
            buttons={[
              { value: "all", label: "All vets" },
              ...vets.map((v) => ({ value: v.id, label: v.name })),
            ]}
          />
          <Column as="ul" gap="12" padding="0" margin="0" fillWidth>
            {visible.map((a) => (
              <AppointmentRow key={a.id} a={a} now={now} onCheckIn={checkIn} onStatus={setStatus} />
            ))}
            {visible.length === 0 ? (
              <Text onBackground="neutral-weak">No appointments for this vet today.</Text>
            ) : null}
          </Column>
        </Column>
      </Row>

      <Dialog
        open={open}
        onClose={closeDialog}
        title="Book appointment"
        description={`${formatLongDate(TODAY)}. A vet cannot be double-booked.`}
        footer={
          <Row gap="8" horizontal="end" fillWidth>
            <Button variant="secondary" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={submit}>Book appointment</Button>
          </Row>
        }
      >
        <Column gap="16" paddingY="8">
          <Select
            id="book-patient"
            label="Patient"
            value={patientId}
            onValueChange={(v) => setPatientId(v as string)}
            error={submitted && !patientId}
            errorMessage="Pick a patient."
            searchable
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.species}), owner ${findOwner(p.owner)?.name}`,
            }))}
          />
          {selectedPatient ? <AlertBanner alerts={selectedPatient.alerts} patientName={selectedPatient.name} /> : null}
          <Select
            id="book-vet"
            label="Vet"
            value={vetId}
            onValueChange={(v) => setVetId(v as string)}
            error={submitted && !vetId}
            errorMessage="Pick a vet."
            options={vets.map((v) => ({ value: v.id, label: `${v.name}, ${v.room}` }))}
          />
          <Row gap="12" s={{ direction: "column" }}>
            <Select
              id="book-time"
              label="Start time"
              value={time}
              onValueChange={(v) => setTime(v as string)}
              error={!!timeError}
              errorMessage={timeError}
              options={SLOT_OPTIONS}
            />
            <Select
              id="book-duration"
              label="Length"
              value={duration}
              onValueChange={(v) => setDuration(v as string)}
              options={DURATION_OPTIONS}
            />
          </Row>
          <Input
            id="book-reason"
            label="Reason for visit"
            value={reason}
            error={submitted && !reason.trim()}
            errorMessage="Add a short reason."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
          />
        </Column>
      </Dialog>
    </Column>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: ToneName }) {
  return (
    <Column background="surface" border radius="l" padding="16" gap="4">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="display-strong-xs" onBackground={tone === "warning" ? "warning-strong" : "neutral-strong"}>
        {value}
      </Text>
    </Column>
  );
}

function AppointmentRow({
  a,
  now,
  onCheckIn,
  onStatus,
}: {
  a: Appointment;
  now: number;
  onCheckIn: (a: Appointment) => void;
  onStatus: (id: string, s: Status) => void;
}) {
  const p = findPatient(a.patient);
  const owner = p ? findOwner(p.owner) : undefined;
  const vet = findVet(a.vet);
  const cancelled = a.status === "cancelled";
  const urgent = a.urgent && a.status !== "done" && !cancelled;
  const end = toMinutes(a.start) + a.minutes;
  const late = a.status === "booked" && toMinutes(a.start) < now;

  return (
    <Row
      as="li"
      fillWidth
      background={urgent ? "danger-alpha-weak" : "surface"}
      border={urgent ? "danger-alpha-strong" : true}
      borderWidth={urgent ? 2 : 1}
      radius="l"
      padding="16"
      gap="16"
      vertical="center"
      wrap
      opacity={cancelled ? 60 : 100}
    >
      <Column width="72" gap="0">
        <Text textVariant="label-strong-l">{formatTime(a.start)}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          to {formatMinutes(end)}
        </Text>
      </Column>

      <Column flex="1" minWidth="220px" gap="4">
        <Row gap="8" vertical="center" wrap>
          <Link
            href={`/patients/${a.patient}`}
            style={{
              color: "inherit",
              textUnderlineOffset: "3px",
              textDecoration: cancelled ? "line-through" : "underline",
            }}
          >
            <Text textVariant="heading-strong-m">{p?.name}</Text>
          </Link>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {p?.species}, {p?.breed}
          </Text>
          {urgent ? <Tag tone="danger" variant="gradient" prefixIcon="bolt" size="s" label="Urgent" /> : null}
        </Row>
        <Text textVariant="body-default-m">{a.reason}</Text>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Owner {owner?.name} · {vet?.name}, {vet?.room}
        </Text>
        <AlertTags alerts={p?.alerts ?? []} />
      </Column>

      <Row gap="8" vertical="center" wrap marginLeft="auto">
        {late ? <Tag tone="warning" size="s" prefixIcon="time" label="Not here yet" /> : null}
        <Tag tone={STATUS_TONE[a.status]} size="m" dot label={STATUS_LABEL[a.status]} />
        {a.status === "booked" ? (
          <Button size="s" prefixIcon="check" aria-label={`Check in ${p?.name}`} onClick={() => onCheckIn(a)}>
            Check in
          </Button>
        ) : null}
        {a.status === "checked_in" ? (
          <Button size="s" variant="secondary" aria-label={`Start exam for ${p?.name}`} onClick={() => onStatus(a.id, "in_exam")}>
            Start exam
          </Button>
        ) : null}
        {a.status === "in_exam" ? (
          <Button size="s" variant="secondary" aria-label={`Mark ${p?.name} done`} onClick={() => onStatus(a.id, "done")}>
            Mark done
          </Button>
        ) : null}
      </Row>
    </Row>
  );
}
