import { Button, Row, Text } from "@once-ui-system/core";
import { brand } from "@/resources/once-ui.config";

export function SiteHeader() {
  return (
    <Row as="header" fillWidth horizontal="center" paddingX="24" paddingY="16">
      <Row maxWidth="l" fillWidth vertical="center" gap="16">
        <Button href="/" variant="tertiary" size="m" weight="strong">
          <Text variant="heading-strong-m">{brand.name}</Text>
        </Button>
        <Row flex={1} />
        <Button href="/blog" variant="tertiary" label="Blog" />
        <Button href="/auth" variant="secondary" label="Sign in" />
      </Row>
    </Row>
  );
}
