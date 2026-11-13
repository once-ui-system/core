import { Column, Heading, Text } from "@once-ui-system/core";
import { projects } from "../../lib/data";

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  return (
    <Column gap="16">
      <Heading as="h1" textVariant="heading-strong-xl">
        Reports
      </Heading>
      <Column background="surface" border radius="m" padding="16" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          Open issues by project
        </Heading>
        <Column as="ul" margin="0" padding="0" gap="4">
          {projects.map((p) => (
            <Text as="li" key={p.key} textVariant="body-default-s" style={{ listStyle: "none" }}>
              {p.name}: {p.issues} ({total ? Math.round((p.issues / total) * 100) : 0}%)
            </Text>
          ))}
        </Column>
      </Column>
    </Column>
  );
}
