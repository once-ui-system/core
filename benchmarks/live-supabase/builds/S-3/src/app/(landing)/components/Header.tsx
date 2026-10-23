import { brand } from "@/resources";
import { Button, Row, SmartLink, Text } from "@once-ui-system/core";

export const Header: React.FC = () => (
  <Row fillWidth horizontal="center" paddingTop="8" paddingX="m" position="sticky" top="0" zIndex={2}>
    <Row
      as="header"
      fillWidth
      border="neutral-alpha-medium"
      maxWidth="l"
      radius="xl"
      paddingLeft="20"
      paddingRight="12"
      paddingY="12"
      vertical="center"
      horizontal="between"
      background="page"
    >
      <SmartLink href="/" unstyled>
        <Text variant="heading-strong-m">{brand.name}</Text>
      </SmartLink>
      <Row gap="8" vertical="center">
        <Button size="s" variant="tertiary" label="Blog" href="/blog" />
        <Button size="s" variant="secondary" label="Sign in" href="/auth" />
      </Row>
    </Row>
  </Row>
);
