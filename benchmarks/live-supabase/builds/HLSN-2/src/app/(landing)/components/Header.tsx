import { Button, Logo, Row, SmartLink, Text } from "@once-ui-system/core";
import { schema } from "@/resources";

/** The top bar: the mark and name on the left, Blog and Sign in on the right. */
export const Header: React.FC = () => (
  <Row
    as="header"
    fillWidth
    horizontal="center"
    position="sticky"
    top="0"
    zIndex={2}
    background="page"
    borderBottom="neutral-alpha-weak"
  >
    <Row fillWidth maxWidth="l" paddingX="l" s={{ paddingX: "16" }} paddingY="12" vertical="center" horizontal="between">
      <Row vertical="center" gap="8">
        <Logo href="/" icon={schema.logo} size="s" />
        <Text variant="heading-strong-s" onBackground="neutral-strong">
          {schema.name}
        </Text>
      </Row>
      <Row vertical="center" gap="20">
        <SmartLink href="/blog">
          <Text variant="label-default-m">Blog</Text>
        </SmartLink>
        <Button size="s" label="Sign in" href="/auth" />
      </Row>
    </Row>
  </Row>
);
