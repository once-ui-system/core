import { Column, Heading, Text } from "@once-ui-system/core";
import { projects } from "../../lib/data";

export default function ReportsPage() {
  const rows = [...projects].sort((a, b) => b.issues - a.issues);
  return (
    <Column gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Reports
        </Heading>
        <Text onBackground="neutral-weak">Open issues by project, highest first.</Text>
      </Column>
      <Column as="ul" gap="8">
        {rows.map((p) => (
          <Column as="li" key={p.key} background="page" border radius="m" padding="16" gap="4">
            <Text textVariant="label-strong-m">
              {p.key} · {p.name}
            </Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {p.issues} open issues
            </Text>
          </Column>
        ))}
      </Column>
    </Column>
  );
}
