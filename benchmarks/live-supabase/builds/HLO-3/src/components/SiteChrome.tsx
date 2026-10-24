import { Button, Column, Row, Text } from "@once-ui-system/core";
import { brand } from "../resources/once-ui.config";

export function SiteHeader() {
  return (
    <Row as="header" fillWidth horizontal="between" vertical="center" paddingX="24" paddingY="16" borderBottom>
      <Button href="/" variant="tertiary" label={brand.name} weight="strong" />
      <Row gap="8" vertical="center">
        <Button href="/blog" variant="tertiary" label="Blog" />
        <Button href="/auth" variant="secondary" size="s" label="Sign in" />
      </Row>
    </Row>
  );
}

export function SiteFooter() {
  return (
    <Row as="footer" fillWidth horizontal="between" vertical="center" wrap gap="16" paddingX="24" paddingY="24" borderTop>
      <Text variant="body-default-s" onBackground="neutral-weak">
        © {new Date().getFullYear()} {brand.name}. {brand.tagline}
      </Text>
      <Row gap="16">
        <Button href="/blog" variant="link" label="Blog" size="s" />
        <Button href="/privacy" variant="link" label="Privacy" size="s" />
        <Button href="/terms" variant="link" label="Terms" size="s" />
      </Row>
    </Row>
  );
}
