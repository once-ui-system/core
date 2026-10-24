import { Column, Row, SmartLink, Text } from "@once-ui-system/core";
import { schema } from "@/resources";

export function Footer() {
  return (
    <Row as="footer" fillWidth horizontal="center" paddingX="16" paddingY="24" borderTop>
      <Row fillWidth maxWidth="l" horizontal="between" vertical="center" gap="16" wrap>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {schema.name}
        </Text>
        <Column gap="16" horizontal="end">
          <Row gap="16" wrap>
            <SmartLink href="/blog" unstyled>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Blog
              </Text>
            </SmartLink>
            <SmartLink href="/privacy" unstyled>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Privacy
              </Text>
            </SmartLink>
            <SmartLink href="/terms" unstyled>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Terms
              </Text>
            </SmartLink>
          </Row>
        </Column>
      </Row>
    </Row>
  );
}
