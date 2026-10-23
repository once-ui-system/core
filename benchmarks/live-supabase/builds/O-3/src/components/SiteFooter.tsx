import { Button, Row, Text } from "@once-ui-system/core";
import { brand } from "@/resources/once-ui.config";

export function SiteFooter() {
  return (
    <Row as="footer" fillWidth horizontal="center" paddingX="24" paddingY="32" borderTop>
      <Row maxWidth="l" fillWidth vertical="center" gap="8" s={{ direction: "column" }}>
        <Text variant="body-default-s" onBackground="neutral-weak">
          © 2026 {brand.name}
        </Text>
        <Row flex={1} s={{ hide: true }} />
        <Row gap="8">
          <Button href="/blog" variant="tertiary" size="s" label="Blog" />
          <Button href="/privacy" variant="tertiary" size="s" label="Privacy" />
          <Button href="/terms" variant="tertiary" size="s" label="Terms" />
        </Row>
      </Row>
    </Row>
  );
}
