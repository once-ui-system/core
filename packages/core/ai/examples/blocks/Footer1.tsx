import { Row, IconButton, Text } from "@once-ui-system/core";

export const Footer1: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  const currentYear = new Date().getFullYear();

  return (
    <Row as="footer" fillWidth padding="8" horizontal="center" s={{direction: "column"}} {...flex}>
      <Row
        maxWidth="m"
        paddingY="8"
        paddingX="16"
        gap="16"
        horizontal="between"
        vertical="center"
      >
        <Text variant="body-default-s" onBackground="neutral-strong">
          <Text onBackground="neutral-weak">© {currentYear} /</Text>
          <Text paddingX="4">Once UI</Text>
          <Text onBackground="neutral-weak">/ All rights reserved</Text>
        </Text>
        <Row gap="16">
          <IconButton size="s" variant="ghost" href="#" icon="github" tooltip="GitHub" />
          <IconButton size="s" variant="ghost" href="#" icon="linkedin" tooltip="LinkedIn" />
          <IconButton size="s" variant="ghost" href="#" icon="threads" tooltip="Threads" />
        </Row>
      </Row>
      <Row hide height="80" s={{hide: false}}/>
    </Row>
  );
};
