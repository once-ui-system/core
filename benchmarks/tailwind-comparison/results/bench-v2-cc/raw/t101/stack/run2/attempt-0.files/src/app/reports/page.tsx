import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { projects } from "@/lib/data";

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues), 1);
  const total = projects.reduce((sum, p) => sum + p.issues, 0);

  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="heading-strong-l">
          Reports
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Open issues by project, {total} in total.
        </Text>
      </Column>
      <Column background="page" border radius="m" padding="16" gap="12" as="section" aria-label="Open issues by project">
        {projects.map((p) => (
          <Row key={p.key} gap="12" vertical="center">
            <Row width="40">
              <Tag size="s" label={p.key} />
            </Row>
            <Row flex={1} height="8" background="neutral-alpha-weak" radius="xs" aria-hidden="true">
              <Row height="8" background="brand-strong" radius="xs" style={{ width: `${(p.issues / max) * 100}%` }} />
            </Row>
            <Row width="40" horizontal="end">
              <Text variant="label-default-s">{p.issues}</Text>
            </Row>
          </Row>
        ))}
      </Column>
    </>
  );
}
