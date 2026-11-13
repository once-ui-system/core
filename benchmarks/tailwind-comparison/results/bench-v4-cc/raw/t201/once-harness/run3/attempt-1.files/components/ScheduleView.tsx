"use client";

import { useMemo, useState } from "react";
import { Button, Column, Grid, Heading, Row, SegmentedControl, SmartLink, Switch, Tag, Text } from "@once-ui-system/core";
import { TODAY, ownerById, patientById, vetById, vets } from "@/lib/data";
import { fmtRange, formatLongDate, toMin } from "@/lib/time";
import { AlertTags } from "@/components/Alerts";
import { useDesk } from "@/components/DeskProvider";
import { StatusTag } from "@/components/StatusTag";
import { WaitingList } from "@/components/WaitingList";

function Stat({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <Column background="surface" border radius="l" padding="16" gap="4">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="display-strong-xs" style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Text>
      {note && (
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {note}
        </Text>
      )}
    </Column>
  );
}

export function ScheduleView() {
  const { appointments, now, highlightId, checkIn, openBooking } = useDesk();
  const [vetFilter, setVetFilter] = useState("all");
  const [hideFinished, setHideFinished] = useState(false);

  const sorted = useMemo(
    () =>
      [...appointments].sort((a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet)),
    [appointments],
  );
  const visible = sorted.filter(
    (a) =>
      (vetFilter === "all" || a.vet === vetFilter) &&
      !(hideFinished && (a.status === "done" || a.status === "cancelled")),
  );

  const waiting = appointments.filter((a) => a.status === "checked_in").length;
  const inExam = appointments.filter((a) => a.status === "in_exam").length;
  const upcoming = sorted.filter((a) => a.status === "booked");
  const done = appointments.filter((a) => a.status === "done").length;
  const next = upcoming[0];
  const nextNote = next ? `Next: ${patientById[next.patient]?.name} at ${next.start}` : "No more bookings";

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
      <Column maxWidth="l" gap="32">
        <Row horizontal="between" vertical="end" gap="16" wrap>
          <Column gap="4">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {formatLongDate(TODAY)}
            </Text>
            <Heading as="h1" textVariant="display-strong-xs">
              Today&rsquo;s schedule
            </Heading>
          </Column>
          <Button variant="secondary" prefixIcon="plus" onClick={() => openBooking()}>
            Book a follow-up
          </Button>
        </Row>

        <Grid columns="4" gap="12" m={{ columns: "2" }}>
          <Stat label="Waiting now" value={waiting} />
          <Stat label="In exam" value={inExam} />
          <Stat label="Still to arrive" value={upcoming.length} note={nextNote} />
          <Stat label="Finished" value={done} />
        </Grid>

        <WaitingList />

        <Column as="section" aria-labelledby="schedule-title" gap="16">
          <Row horizontal="between" vertical="center" gap="16" wrap>
            <Heading as="h2" id="schedule-title" textVariant="heading-strong-l">
              All appointments
            </Heading>
            <Switch
              label="Hide done and cancelled"
              checked={hideFinished}
              onCheckedChange={setHideFinished}
            />
          </Row>
          <SegmentedControl
            buttons={[
              { value: "all", label: "All vets" },
              ...vets.map((v) => ({ value: v.id, label: v.name })),
            ]}
            value={vetFilter}
            onValueChange={setVetFilter}
            aria-label="Filter by vet"
          />

          {visible.length === 0 ? (
            <Column background="surface" border radius="l" padding="24">
              <Text onBackground="neutral-medium">No appointments match this filter.</Text>
            </Column>
          ) : (
            <Column as="ul" gap="8">
              {visible.map((a) => {
                const patient = patientById[a.patient];
                const owner = patient ? ownerById[patient.owner] : undefined;
                const vet = vetById[a.vet];
                const finished = a.status === "done" || a.status === "cancelled";
                const waited = Math.max(0, now - (a.checkedInAt ?? now));
                return (
                  <Row
                    as="li"
                    key={a.id}
                    background={a.urgent ? "warning-alpha-weak" : a.id === highlightId ? "brand-alpha-weak" : "surface"}
                    border={a.urgent ? "warning-strong" : a.id === highlightId ? "brand-strong" : true}
                    borderWidth={a.urgent ? 2 : 1}
                    radius="l"
                    overflow="hidden"
                    vertical="stretch"
                  >
                    {a.urgent && <Row width={8} background="warning-strong" aria-hidden="true" />}
                    <Row fillWidth wrap gap="16" padding="16" vertical="center" opacity={finished ? 70 : 100}>
                      <Column gap="2" style={{ flex: "0 0 5.5rem" }}>
                        <Text textVariant="heading-strong-l" style={{ fontVariantNumeric: "tabular-nums" }}>
                          {a.start}
                        </Text>
                        <Text textVariant="body-default-xs" onBackground="neutral-weak">
                          {fmtRange(a.start, a.minutes).split("–")[1]} &middot; {a.minutes} min
                        </Text>
                      </Column>

                      <Column gap="4" style={{ flex: "1 1 14rem" }}>
                        <Row gap="8" vertical="center" wrap>
                          <SmartLink href={`/patients/${a.patient}`}>
                            <Text textVariant="heading-strong-m">{patient?.name}</Text>
                          </SmartLink>
                          <Text textVariant="body-default-s" onBackground="neutral-weak">
                            {patient?.species}
                          </Text>
                          {a.urgent && <Tag tone="warning" prefixIcon="bolt" label="Urgent" />}
                        </Row>
                        <Text textVariant="body-default-s" onBackground="neutral-medium">
                          {owner?.name} &middot; {owner?.phone}
                        </Text>
                        <AlertTags alerts={patient?.alerts ?? []} />
                      </Column>

                      <Column gap="2" style={{ flex: "1 1 11rem" }}>
                        <Text textVariant="label-strong-m">{a.reason}</Text>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          {vet?.name} &middot; {vet?.room}
                        </Text>
                      </Column>

                      <Row gap="12" vertical="center" wrap style={{ flex: "0 0 auto" }}>
                        <StatusTag status={a.status} />
                        {a.status === "booked" && (
                          <Button
                            size="s"
                            prefixIcon="check"
                            onClick={() => checkIn(a.id)}
                            aria-label={`Check in ${patient?.name}`}
                          >
                            Check in
                          </Button>
                        )}
                        {a.status === "checked_in" && (
                          <Text textVariant="label-strong-s" onBackground="warning-strong">
                            Waiting {waited} min
                          </Text>
                        )}
                      </Row>
                    </Row>
                  </Row>
                );
              })}
            </Column>
          )}
        </Column>
      </Column>
    </Column>
  );
}
