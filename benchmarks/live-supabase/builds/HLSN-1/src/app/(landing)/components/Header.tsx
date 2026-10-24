import { Button, Row, SmartLink, Text } from "@once-ui-system/core";
import { schema } from "@/resources";

export function Header() {
  return (
    <Row as="header" fillWidth horizontal="center" paddingX="16" paddingY="12" background="page" borderBottom>
      <Row fillWidth maxWidth="l" horizontal="between" vertical="center" gap="16">
        <SmartLink href="/" unstyled>
          <Text variant="heading-strong-m" onBackground="neutral-strong">
            {schema.name}
          </Text>
        </SmartLink>
        <Row vertical="center" gap="16">
          <SmartLink href="/blog" unstyled>
            <Text variant="label-default-m" onBackground="neutral-weak">
              Blog
            </Text>
          </SmartLink>
          <Button size="s" variant="secondary" label="Sign in" href="/auth" />
        </Row>
      </Row>
    </Row>
  );
}
