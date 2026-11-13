import { Column, Heading, Text } from "@once-ui-system/core";
import { product } from "@/lib/data";

export default function ReportsPage() {
  return (
    <Column gap="16" fillWidth>
      <Heading as="h1" variant="display-strong-xs">
        Reports
      </Heading>
      <Column background="surface" border radius="l" padding="24" gap="8">
        <Heading as="h2" variant="heading-strong-m">
          No reports scheduled
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {product.name} will email a weekly summary of issues opened and closed once you schedule
          your first report.
        </Text>
      </Column>
    </Column>
  );
}
