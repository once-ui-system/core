import { brand } from "@/resources";
import { Column, Row, SmartLink, Text } from "@once-ui-system/core";

export const Footer = () => (
  <Column as="footer" fillWidth horizontal="center" paddingTop="xl">
    <Row
      fillWidth
      maxWidth="l"
      paddingX="l"
      paddingY="24"
      gap="16"
      wrap
      vertical="center"
      horizontal="between"
      borderTop="neutral-alpha-medium"
      textVariant="label-default-s"
    >
      <Text onBackground="neutral-medium">
        © {new Date().getFullYear()} {brand.name}
      </Text>
      <Row as="nav" gap="24">
        <SmartLink href="/blog">Blog</SmartLink>
        <SmartLink href="/privacy">Privacy</SmartLink>
        <SmartLink href="/terms">Terms</SmartLink>
      </Row>
    </Row>
  </Column>
);
