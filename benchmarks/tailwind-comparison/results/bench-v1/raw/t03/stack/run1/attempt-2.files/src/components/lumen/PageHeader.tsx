import { Column, Heading, Row, Text } from "@once-ui-system/core";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <Row fillWidth gap="16" vertical="center" horizontal="between" wrap>
      <Column gap="4" flex={1} minWidth={16}>
        <Heading as="h1" variant="display-strong-xs">
          {title}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {description}
        </Text>
      </Column>
      {actions}
    </Row>
  );
}
