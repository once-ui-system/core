import { Column, Heading, Text } from "@once-ui-system/core";

export default function ReportsPage() {
  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Reports
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-l">
          Weekly summaries of issues opened and closed will appear here.
        </Text>
      </Column>
      <Column background="surface" border radius="l" padding="24" gap="8">
        <Heading as="h2" textVariant="heading-strong-l">
          No reports yet
        </Heading>
        <Text onBackground="neutral-weak">
          Your first weekly report arrives on Monday morning.
        </Text>
      </Column>
    </Column>
  );
}
