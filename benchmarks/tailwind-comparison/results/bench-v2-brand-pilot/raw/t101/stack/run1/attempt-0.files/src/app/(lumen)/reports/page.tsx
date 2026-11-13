import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects } from "@/lib/data";

export const metadata = { title: "Reports · Lumen" };

export default function ReportsPage() {
  const byIssues = [...projects].sort((a, b) => b.issues - a.issues);
  const max = Math.max(...projects.map((p) => p.issues), 1);

  return (
    <>
      <Column gap="4">
        <Text variant="label-default-s" onBackground="brand-medium">
          Analytics
        </Text>
        <Heading as="h1" variant="display-strong-xs">
          Reports
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Open issues per project, largest first.
        </Text>
      </Column>
      <Column background="surface" border radius="l" padding="16" gap="12">
        {byIssues.map((p) => (
          <Row key={p.key} vertical="center" gap="12">
            <Tag size="s">{p.key}</Tag>
            <Column flex={1} gap="4">
              <Text variant="body-default-s">{p.name}</Text>
              <Row
                height="8"
                background="neutral-alpha-weak"
                radius="s"
                overflow="hidden"
                role="img"
                aria-label={`${p.issues} open issues`}
              >
                <Row
                  background="brand-solid-strong"
                  height="8"
                  style={{ width: `${(p.issues / max) * 100}%` }}
                />
              </Row>
            </Column>
            <Text variant="label-default-s" className="lumen-figures">
              {p.issues}
            </Text>
            <Text variant="body-default-xs" onBackground="neutral-weak" className="lumen-figures">
              {formatDate(p.updated)}
            </Text>
          </Row>
        ))}
      </Column>
    </>
  );
}
