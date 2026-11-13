"use client";

import { Button, Column, Heading, Icon, Row, SmartLink, Tag, Text } from "@once-ui-system/core";
import { ownerById, patientById, vetById } from "@/lib/data";
import { fmt } from "@/lib/time";
import { AlertTags } from "@/components/Alerts";
import { useDesk } from "@/components/DeskProvider";

export function WaitingList() {
  const { appointments, now, startExam } = useDesk();
  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0));

  return (
    <Column as="section" aria-labelledby="waiting-title" gap="12" fillWidth>
      <Row gap="12" vertical="center" wrap>
        <Heading as="h2" id="waiting-title" textVariant="heading-strong-l">
          Waiting room
        </Heading>
        <Tag tone={waiting.length ? "warning" : "neutral"} label={`${waiting.length} waiting`} />
      </Row>

      {waiting.length === 0 ? (
        <Row background="surface" border radius="l" padding="20" gap="12" vertical="center">
          <Icon name="check" size="m" onBackground="success-strong" />
          <Text textVariant="body-default-m" onBackground="neutral-medium">
            Nobody is waiting. Checked-in patients appear here with how long they have waited.
          </Text>
        </Row>
      ) : (
        <Row as="ol" gap="12" wrap>
          {waiting.map((a, index) => {
            const patient = patientById[a.patient];
            const owner = patient ? ownerById[patient.owner] : undefined;
            const vet = vetById[a.vet];
            const waited = Math.max(0, now - (a.checkedInAt ?? now));
            const tone = waited >= 30 ? "danger" : waited >= 15 ? "warning" : "neutral";
            return (
              <Column
                as="li"
                key={a.id}
                background="surface"
                border={index === 0 ? "brand-strong" : true}
                radius="l"
                padding="16"
                gap="12"
                style={{ flex: "1 1 17rem", maxWidth: "26rem" }}
              >
                <Row horizontal="between" vertical="start" gap="8" wrap>
                  <Row gap="8" vertical="center">
                    <Row
                      background={index === 0 ? "brand-medium" : "neutral-alpha-weak"}
                      radius="full"
                      width={32}
                      height={32}
                      center
                      textVariant="label-strong-m"
                    >
                      {index + 1}
                    </Row>
                    <Column gap="2">
                      <SmartLink href={`/patients/${a.patient}`}>
                        <Text textVariant="heading-strong-m">{patient?.name}</Text>
                      </SmartLink>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        {owner?.name}
                      </Text>
                    </Column>
                  </Row>
                  {index === 0 && <Tag tone="brand" label="Next in line" />}
                </Row>
                <AlertTags alerts={patient?.alerts ?? []} />
                <Row gap="8" wrap vertical="center">
                  <Tag tone={tone} prefixIcon="time" label={`Waiting ${waited} min`} />
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    since {fmt(a.checkedInAt ?? now)}
                  </Text>
                </Row>
                <Text textVariant="body-default-s" onBackground="neutral-medium">
                  {a.reason} &middot; {vet?.name}
                </Text>
                <Button
                  variant="secondary"
                  size="s"
                  prefixIcon="arrowRight"
                  onClick={() => startExam(a.id)}
                  aria-label={`Send ${patient?.name} to ${vet?.room}`}
                >
                  Send to {vet?.room}
                </Button>
              </Column>
            );
          })}
        </Row>
      )}
    </Column>
  );
}
