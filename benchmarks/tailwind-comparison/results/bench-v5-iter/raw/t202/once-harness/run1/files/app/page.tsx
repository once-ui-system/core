import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { PlanBoard } from "@/components/PlanBoard";
import { event } from "@/lib/data";

export default function Page() {
  return (
    <Column fillWidth horizontal="center" paddingX="16" paddingY="24">
      <Column fillWidth maxWidth="xl" gap="16">
        <Row horizontal="between" vertical="end" wrap gap="8">
          <Column gap="4">
            <Heading as="h1" textVariant="display-strong-xs">
              Seating plan
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {event.name}, {event.venue}
            </Text>
          </Column>
        </Row>
        <PlanBoard />
      </Column>
    </Column>
  );
}
