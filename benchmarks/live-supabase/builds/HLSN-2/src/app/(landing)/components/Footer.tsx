import { Column, Row, SmartLink, Text } from "@once-ui-system/core";
import { schema } from "@/resources";

/** Blog, Privacy and Terms, and the copyright line. */
export const Footer: React.FC = () => (
  <Column as="footer" fillWidth horizontal="center" borderTop="neutral-alpha-weak" marginTop="xl">
    <Row fillWidth maxWidth="l" paddingX="l" s={{ paddingX: "16" }} paddingY="24" gap="24" wrap vertical="center" horizontal="between">
      <Text variant="body-default-s" onBackground="neutral-weak">
        © {new Date().getFullYear()} {schema.name}
      </Text>
      <Row gap="20" wrap>
        <SmartLink href="/blog">
          <Text variant="label-default-s">Blog</Text>
        </SmartLink>
        <SmartLink href="/privacy">
          <Text variant="label-default-s">Privacy</Text>
        </SmartLink>
        <SmartLink href="/terms">
          <Text variant="label-default-s">Terms</Text>
        </SmartLink>
      </Row>
    </Row>
  </Column>
);
