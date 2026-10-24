import { Column, Row, Button, Text } from "@once-ui-system/core";
import { schema } from "@/resources";

/** The landing footer: Blog, Privacy and Terms. */
export function SiteFooter() {
  return (
    <Column as="footer" fillWidth horizontal="center" borderTop paddingX="16" paddingY="24">
      <Row fillWidth maxWidth="l" horizontal="between" vertical="center" gap="16" wrap>
        <Text variant="body-default-s" onBackground="neutral-weak">
          © {new Date().getFullYear()} {schema.name}
        </Text>
        <Row gap="16" vertical="center">
          <Button variant="tertiary" size="s" label="Blog" href="/blog" />
          <Button variant="tertiary" size="s" label="Privacy" href="/privacy" />
          <Button variant="tertiary" size="s" label="Terms" href="/terms" />
        </Row>
      </Row>
    </Column>
  );
}
