import { Button, Row, Text } from "@once-ui-system/core";
import { brand } from "@/resources/once-ui.config";

export function SiteFooter() {
  return (
    <Row as="footer" fillWidth wrap gap="16" vertical="center" horizontal="between" paddingX="24" paddingY="24" borderTop>
      <Text variant="body-default-s" onBackground="neutral-weak">
        © {new Date().getFullYear()} {brand.name}
      </Text>
      <Row gap="8" wrap>
        <Button variant="tertiary" href="/blog" label="Blog" size="s" />
        <Button variant="tertiary" href="/privacy" label="Privacy" size="s" />
        <Button variant="tertiary" href="/terms" label="Terms" size="s" />
      </Row>
    </Row>
  );
}
