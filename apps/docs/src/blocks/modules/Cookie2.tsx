import { Button, Column, IconButton, Row, Text } from "@once-ui-system/core";

export const Cookie2: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column
      padding="20"
      maxWidth={28}
      background="surface"
      border="neutral-medium"
      radius="l"
      gap="8"
      {...flex}
    >
      <Row fillWidth horizontal="between" vertical="center">
        <Text variant="heading-strong-xs">Cookie preferences</Text>
        <IconButton icon="close" size="m" variant="tertiary" tooltip="Close" />
      </Row>
      <Text variant="body-default-s" onBackground="neutral-weak" marginBottom="12" wrap="balance">
        This site uses tracking technologies. You may opt in or opt out of the use of these
        technologies.
      </Text>
      <Row gap="8">
        <Button size="s" variant="secondary">
          Deny
        </Button>
        <Button size="s">Accept all</Button>
      </Row>
    </Column>
  );
};
