import { Button, Column, Row, Text } from "@once-ui-system/core";
import { site } from "../../resources/once-ui.config";

export function SiteFooter() {
  return (
    <Row as="footer" fillWidth horizontal="center" paddingX="16" paddingY="24" borderTop>
      <Column maxWidth="l" gap="12">
        <Row fillWidth horizontal="between" vertical="center" wrap gap="12">
          <Text variant="body-default-s" onBackground="neutral-weak">
            {site.name}. {site.tagline}
          </Text>
          <Row gap="4" vertical="center">
            <Button href="/blog" variant="tertiary" size="s" label="Blog" />
            <Button href="/privacy" variant="tertiary" size="s" label="Privacy" />
            <Button href="/terms" variant="tertiary" size="s" label="Terms" />
          </Row>
        </Row>
      </Column>
    </Row>
  );
}
