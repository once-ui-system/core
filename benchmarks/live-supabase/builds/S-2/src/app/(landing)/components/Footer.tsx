import { brand } from "@/resources";
import { Column, Row, SmartLink, Text } from "@once-ui-system/core";

export function Footer() {
  return (
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
        wrap
        s={{ paddingX: "16" }}
      >
        <Column gap="4">
          <Text variant="label-strong-s">{brand.name}</Text>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {brand.tagline}
          </Text>
        </Column>
        <Row as="nav" gap="24" textVariant="label-default-s">
          <SmartLink href="/blog">Blog</SmartLink>
          <SmartLink href="/privacy">Privacy</SmartLink>
          <SmartLink href="/terms">Terms</SmartLink>
        </Row>
        <Text variant="label-default-s" onBackground="neutral-weak">
          © {new Date().getFullYear()} {brand.name}
        </Text>
      </Row>
    </Row>
  );
}
