import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { PageTitle } from "@/components/PageTitle";
import { projects } from "@/lib/data";

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues), 1);

  return (
    <>
      <PageTitle title="Reports" description="Open issues by project." />
      <Column background="page" border radius="m" padding="16" gap="12">
        <Heading as="h2" variant="heading-strong-s">
          Open issues
        </Heading>
        {projects.map((p) => (
          <Row key={p.key} vertical="center" gap="12">
            <Text variant="label-default-s" style={{ width: "8rem" }}>
              {p.name}
            </Text>
            <Row flex={1} height="8" background="neutral-alpha-weak" radius="s">
              <Row
                height="8"
                background="brand-medium"
                radius="s"
                style={{ width: `${(p.issues / max) * 100}%` }}
              />
            </Row>
            <Text variant="code-default-s" onBackground="neutral-weak">
              {p.issues}
            </Text>
          </Row>
        ))}
      </Column>
    </>
  );
}
