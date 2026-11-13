import { Column, Heading, Text } from "@once-ui-system/core";
import { GuestsView } from "@/components/GuestsView";
import { event } from "@/lib/data";

export default function Page() {
  return (
    <Column fillWidth horizontal="center" paddingX="16" paddingY="24">
      <Column fillWidth maxWidth="xl" gap="16">
        <Column gap="4">
          <Heading as="h1" textVariant="display-strong-xs">
            Guest list
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {event.name}. Search, filter and hand the meal counts to the caterer.
          </Text>
        </Column>
        <GuestsView />
      </Column>
    </Column>
  );
}
