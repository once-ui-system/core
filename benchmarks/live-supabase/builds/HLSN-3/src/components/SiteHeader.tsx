import { Button, Row, SmartLink, Text } from "@once-ui-system/core";
import { schema } from "@/resources";

/** The landing header: the name, the Blog link and Sign in. */
export function SiteHeader() {
  return (
    <Row
      as="header"
      fillWidth
      horizontal="center"
      position="sticky"
      top="0"
      zIndex={2}
      background="page"
      borderBottom
      paddingX="16"
      paddingY="12"
    >
      <Row fillWidth maxWidth="l" vertical="center" horizontal="between" gap="16">
        <SmartLink href="/" unstyled>
          <Text variant="heading-strong-m" onBackground="neutral-strong">
            {schema.name}
          </Text>
        </SmartLink>
        <Row gap="8" vertical="center">
          <Button variant="tertiary" size="s" label="Blog" href="/blog" />
          <Button variant="secondary" size="s" label="Sign in" href="/auth" />
        </Row>
      </Row>
    </Row>
  );
}
