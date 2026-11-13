import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { projects } from "@/lib/data";

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-m">
          Reports
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Where your open issues sit right now.
        </Text>
      </Column>
      <Column background="page" border radius="l" padding="8">
        {projects.map((p) => (
          <Row key={p.key} paddingX="16" paddingY="16" gap="16" vertical="center" horizontal="between">
            <Text variant="label-strong-m">{p.name}</Text>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {p.issues} of {total} open issues
            </Text>
          </Row>
        ))}
      </Column>
    </>
  );
}
