import { Column, Heading, Text } from "@once-ui-system/core";
import { projects } from "@/lib/data";

export default function Page() {
  const total = projects.reduce((s, p) => s + p.issues, 0);
  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Reports
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Open issues by project, out of {total} in total.
        </Text>
      </Column>
      <Column background="neutral-alpha-weak" border radius="l" padding="24" gap="16">
        {projects.map((p) => (
          <Column key={p.key} gap="8">
            <Text variant="label-default-m">
              {p.name}: {p.issues}
            </Text>
            <Column fillWidth background="neutral-alpha-medium" radius="full" height="8" overflow="hidden">
              <Column background="brand-strong" height="8" radius="full" style={{ width: `${total ? (p.issues / total) * 100 : 0}%` }} />
            </Column>
          </Column>
        ))}
      </Column>
    </Column>
  );
}
