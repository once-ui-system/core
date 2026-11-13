"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Column, Grid, Heading, Icon, Row, SegmentedControl, SmartLink, Tag, Text } from "@once-ui-system/core";
import { AlertChips } from "@/components/Alerts";
import { AppHeader } from "@/components/AppHeader";
import { BookingDialog } from "@/components/BookingDialog";
import {
  type Appointment,
  APPOINTMENTS,
  CLOCK_START,
  fmtClock,
  fmtDuration,
  fmtLongToday,
  fmtTime,
  ownerById,
  patientById,
  STATUS_LABEL,
  type Status,
  toMinutes,
  TODAY,
  VETS,
  vetById,
} from "@/lib/data";

const STATUS_TONE: Record<Status, "neutral" | "warning" | "brand" | "success"> = {
  booked: "neutral",
  checked_in: "warning",
  in_exam: "brand",
  done: "success",
  cancelled: "neutral",
};

const LONG_WAIT = 20;

function StatusTag({ status }: { status: Status }) {
  return (
    <Tag
      tone={STATUS_TONE[status]}
      label={STATUS_LABEL[status]}
      dot={status !== "done" && status !== "cancelled"}
      prefixIcon={status === "done" ? "check" : status === "cancelled" ? "close" : undefined}
    />
  );
}

function AppointmentRow({ appt, now, justAdded, onCheckIn }: { appt: Appointment; now: number; justAdded: boolean; onCheckIn: (id: string) => void }) {
  const patient = patientById(appt.patient);
  const owner = patient ? ownerById(patient.owner) : undefined;
  const vet = vetById(appt.vet);
  const muted = appt.status === "done" || appt.status === "cancelled";
  const urgent = !!appt.urgent && !muted;

  return (
    <Row
      as="li"
      fillWidth
      wrap
      gap="16"
      padding="16"
      radius="l"
      vertical="start"
      background={urgent ? "warning-alpha-weak" : "surface"}
      border={urgent ? "warning-strong" : true}
      borderWidth={urgent ? 2 : 1}
    >
      <Column style={{ width: "5.5rem", flex: "none" }} gap="4">
        <Text textVariant="heading-strong-m" style={{ fontVariantNumeric: "tabular-nums" }} onBackground={muted ? "neutral-weak" : "neutral-strong"}>
          {fmtTime(appt.start)}
        </Text>
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          {fmtDuration(appt.minutes)}
        </Text>
      </Column>

      <Column flex="1" gap="8" style={{ minWidth: "14rem" }}>
        <Row gap="8" vertical="center" wrap>
          <SmartLink href={`/patients/${appt.patient}`}>
            <Text
              textVariant="heading-strong-m"
              style={appt.status === "cancelled" ? { textDecoration: "line-through" } : undefined}
            >
              {patient?.name ?? "Unknown patient"}
            </Text>
          </SmartLink>
          {patient && (
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {patient.species}, {patient.breed}
            </Text>
          )}
          {urgent && <Tag tone="warning" variant="gradient" prefixIcon="bolt" label="Urgent" />}
          {justAdded && <Tag tone="success" label="New booking" />}
        </Row>
        <Text textVariant="body-strong-m">{appt.reason}</Text>
        {owner && (
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Owner {owner.name} · {owner.phone}
          </Text>
        )}
        {patient && <AlertChips alerts={patient.alerts} />}
      </Column>

      <Column gap="4" style={{ minWidth: "9rem" }}>
        <Text textVariant="label-strong-m">{vet.name}</Text>
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          {vet.room}
        </Text>
      </Column>

      <Column gap="8" style={{ minWidth: "9rem" }} horizontal="start">
        <StatusTag status={appt.status} />
        {appt.status === "booked" && (
          <Button size="m" prefixIcon="check" onClick={() => onCheckIn(appt.id)} aria-label={`Check in ${patient?.name ?? "patient"} for ${fmtTime(appt.start)}`}>
            Check in
          </Button>
        )}
        {appt.status === "checked_in" && appt.checkedInAt !== undefined && (
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Waiting {fmtDuration(Math.max(0, now - appt.checkedInAt))}
          </Text>
        )}
      </Column>
    </Row>
  );
}

function WaitingList({ waiting, now }: { waiting: Appointment[]; now: number }) {
  return (
    <Column
      as="section"
      aria-labelledby="waiting-title"
      background="surface"
      border
      radius="l"
      padding="20"
      gap="16"
      style={{ flex: "1 1 20rem", minWidth: 0 }}
    >
      <Row horizontal="between" vertical="center" gap="8">
        <Heading as="h2" id="waiting-title" textVariant="heading-strong-l">
          Waiting room
        </Heading>
        <Tag tone={waiting.length ? "warning" : "neutral"} label={`${waiting.length} waiting`} />
      </Row>
      {waiting.length === 0 ? (
        <Column gap="8" paddingY="16" horizontal="center">
          <Icon name="smiley" size="l" onBackground="neutral-weak" />
          <Text onBackground="neutral-weak" align="center">
            Nobody is waiting. Check a patient in from the schedule when they arrive.
          </Text>
        </Column>
      ) : (
        <Column as="ol" gap="12" style={{ margin: 0, padding: 0, listStyle: "none" }} aria-live="polite">
          {waiting.map((a, i) => {
            const patient = patientById(a.patient);
            const vet = vetById(a.vet);
            const waited = Math.max(0, now - (a.checkedInAt ?? now));
            const long = waited >= LONG_WAIT;
            return (
              <Column
                as="li"
                key={a.id}
                gap="8"
                padding="12"
                radius="m"
                background={i === 0 ? "brand-alpha-weak" : "neutral-alpha-weak"}
                border={i === 0 ? "brand-alpha-medium" : false}
              >
                <Row horizontal="between" vertical="center" gap="8" wrap>
                  <Row gap="8" vertical="center" wrap>
                    <Text textVariant="label-strong-s" onBackground="neutral-weak">
                      {i + 1}
                    </Text>
                    <SmartLink href={`/patients/${a.patient}`}>
                      <Text textVariant="heading-strong-m">{patient?.name}</Text>
                    </SmartLink>
                    {i === 0 && <Tag tone="brand" label="Next up" size="s" />}
                  </Row>
                  <Tag tone={long ? "warning" : "neutral"} prefixIcon="time" label={fmtDuration(waited)} />
                </Row>
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  {a.reason} · {vet.name}, {vet.room} · booked {fmtTime(a.start)}
                </Text>
                {patient && <AlertChips alerts={patient.alerts} />}
              </Column>
            );
          })}
        </Column>
      )}
    </Column>
  );
}

export function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(APPOINTMENTS);
  const [now, setNow] = useState(CLOCK_START);
  const [vetFilter, setVetFilter] = useState("all");
  const [bookingKey, setBookingKey] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  const sorted = useMemo(
    () => [...appts].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [appts],
  );
  const visible = vetFilter === "all" ? sorted : sorted.filter((a) => a.vet === vetFilter);
  const waiting = useMemo(
    () => appts.filter((a) => a.status === "checked_in").sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0)),
    [appts],
  );
  const count = (s: Status) => appts.filter((a) => a.status === s).length;

  const checkIn = (id: string) => {
    const a = appts.find((x) => x.id === id);
    if (!a || a.status !== "booked") return;
    setAppts((list) => list.map((x) => (x.id === id ? { ...x, status: "checked_in", checkedInAt: now } : x)));
    setNotice(`${patientById(a.patient)?.name ?? "Patient"} checked in at ${fmtClock(now)}. Added to the waiting room.`);
  };

  const book = (draft: Omit<Appointment, "id" | "status">) => {
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    setAppts((list) => [...list, { ...draft, id, status: "booked" }]);
    setLastAdded(id);
    setBookingOpen(false);
    setNotice(
      `Booked ${patientById(draft.patient)?.name ?? "patient"} with ${vetById(draft.vet).name} at ${fmtTime(draft.start)}.`,
    );
  };

  const stats: { label: string; value: number; icon: "time" | "paw" | "calendar" | "check" }[] = [
    { label: "Waiting", value: count("checked_in"), icon: "time" },
    { label: "In exam", value: count("in_exam"), icon: "paw" },
    { label: "Still to arrive", value: count("booked"), icon: "calendar" },
    { label: "Done today", value: count("done"), icon: "check" },
  ];

  const vetButtons = [
    { value: "all", label: "All vets" },
    ...VETS.map((v) => ({ value: v.id, label: v.name })),
  ];

  return (
    <Column fillWidth minHeight="100vh">
      <AppHeader />
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
        <Column fillWidth gap="24" style={{ maxWidth: "80rem" }}>
          <Row fillWidth wrap gap="16" vertical="center" horizontal="between">
            <Column gap="4">
              <Heading as="h1" textVariant="display-strong-xs">
                Today’s schedule
              </Heading>
              <Text onBackground="neutral-weak" textVariant="body-default-m">
                {fmtLongToday(TODAY)} · desk time {fmtClock(now)} · 3 vets
              </Text>
            </Column>
            <Button
              size="l"
              prefixIcon="plus"
              onClick={() => {
                setBookingKey((k) => k + 1);
                setBookingOpen(true);
              }}
            >
              Book appointment
            </Button>
          </Row>

          <div role="status" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
            {notice}
          </div>
          {notice && (
            <Row aria-hidden="true" gap="8" vertical="center" padding="12" radius="m" background="success-alpha-weak" border="success-alpha-medium">
              <Icon name="check" size="s" onBackground="success-strong" />
              <Text textVariant="label-strong-m" onBackground="success-strong">
                {notice}
              </Text>
            </Row>
          )}

          <Grid columns="4" s={{ columns: "2" }} gap="12" fillWidth>
            {stats.map((s) => (
              <Row key={s.label} background="surface" border radius="l" padding="16" gap="12" vertical="center">
                <Icon name={s.icon} size="m" onBackground="neutral-weak" />
                <Column>
                  <Text textVariant="display-strong-xs" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {s.value}
                  </Text>
                  <Text textVariant="label-default-s" onBackground="neutral-weak">
                    {s.label}
                  </Text>
                </Column>
              </Row>
            ))}
          </Grid>

          <Row fillWidth wrap gap="24" vertical="start">
            <WaitingList waiting={waiting} now={now} />

            <Column as="section" aria-labelledby="schedule-title" gap="16" style={{ flex: "3 1 32rem", minWidth: 0 }}>
              <Row fillWidth wrap gap="12" vertical="center" horizontal="between">
                <Heading as="h2" id="schedule-title" textVariant="heading-strong-l">
                  All appointments ({visible.length})
                </Heading>
                <Row role="group" aria-label="Filter by vet" style={{ maxWidth: "100%" }}>
                  <SegmentedControl buttons={vetButtons} value={vetFilter} onValueChange={setVetFilter} />
                </Row>
              </Row>
              <Column as="ul" gap="12" style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {visible.map((a) => (
                  <AppointmentRow key={a.id} appt={a} now={now} justAdded={a.id === lastAdded} onCheckIn={checkIn} />
                ))}
                {visible.length === 0 && (
                  <Column padding="24">
                    <Text onBackground="neutral-weak">No appointments for this vet today.</Text>
                  </Column>
                )}
              </Column>
            </Column>
          </Row>
        </Column>
      </Column>

      {bookingOpen && (
        <BookingDialog key={bookingKey} open={bookingOpen} onClose={() => setBookingOpen(false)} appointments={appts} now={now} onBook={book} />
      )}
    </Column>
  );
}
