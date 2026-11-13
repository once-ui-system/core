import type { Metadata } from "next";
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { projects } from "../../lib/data";

export const metadata: Metadata = { title: "Reports" };

const max = Math.max(...projects.map((p) => p.issues));

export default function ReportsPage() {
  return (
    <Column fillWidth gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Reports
        </Heading>
        <Text textVariant="body-default-l" onBackground="neutral-weak">
          Open issues by project.
        </Text>
      </Column>
      <Column background="surface" border radius="l" padding="24" gap="20">
        {projects.map((p) => (
          <Column key={p.key} gap="8">
            <Row horizontal="between">
              <Text textVariant="label-strong-s">{p.name}</Text>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {p.issues}
              </Text>
            </Row>
            <Row fillWidth height="8" radius="full" background="neutral-alpha-weak">
              <Row
                height="8"
                radius="full"
                background="brand-medium"
                style={{ width: `${(p.issues / max) * 100}%` }}
              />
            </Row>
          </Column>
        ))}
      </Column>
    </Column>
  );
}
