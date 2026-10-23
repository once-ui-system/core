import { brand } from "@/resources";
import { Column, Row, SmartLink, Text } from "@once-ui-system/core";

export const Footer = () => (
  <Row fillWidth horizontal="center" borderTop="neutral-alpha-medium" marginTop="xl">
    <Row
      as="footer"
      fillWidth
      maxWidth="l"
      paddingX="l"
      paddingY="24"
      gap="16"
      horizontal="between"
      vertical="center"
      s={{ direction: "column", horizontal: "start", paddingX: "16" }}
    >
      <Text variant="label-default-s" onBackground="neutral-medium">
        © {new Date().getFullYear()} {brand.name}
      </Text>
      <Row gap="24" textVariant="label-default-m">
        <SmartLink href="/blog">Blog</SmartLink>
        <SmartLink href="/privacy">Privacy</SmartLink>
        <SmartLink href="/terms">Terms</SmartLink>
      </Row>
    </Row>
  </Row>
);
