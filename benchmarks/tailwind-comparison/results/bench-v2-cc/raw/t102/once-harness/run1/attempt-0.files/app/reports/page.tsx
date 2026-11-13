import { Column, Heading, Text } from "@once-ui-system/core";
import { projects } from "@/lib/data";

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Reports
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-l">
          Share of open issues by project.
        </Text>
      </Column>
      <Column background="surface" border radius="l" padding="24" gap="16">
        {projects.map((p) => (
          <Column key={p.key} gap="8">
            <Text textVariant="label-strong-m">
              {p.name}: {p.issues} open ({total ? Math.round((p.issues / total) * 100) : 0}%)
            </Text>
            <Column background="neutral-alpha-weak" radius="full" height="8" fillWidth overflow="hidden">
              <Column
                background="brand-medium"
                radius="full"
                fillHeight
                style={{ width: `${total ? (p.issues / total) * 100 : 0}%` }}
              />
            </Column>
          </Column>
        ))}
      </Column>
    </Column>
  );
}
