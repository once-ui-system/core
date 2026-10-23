import { Button, Column, Row, Text } from "@once-ui-system/core";
import { brand } from "../resources/config";

export function SiteHeader() {
  return (
    <Row as="header" fillWidth horizontal="center" paddingX="16" paddingY="12" borderBottom>
      <Row fillWidth maxWidth="l" vertical="center" gap="16" horizontal="between">
        <Button href="/" variant="tertiary" weight="strong" label={brand.name} />
        <Row as="nav" gap="8" vertical="center" aria-label="Main">
          <Button href="/blog" variant="tertiary" label="Blog" />
          <Button href="/auth" variant="secondary" label="Sign in" />
        </Row>
      </Row>
    </Row>
  );
}

export function SiteFooter() {
  return (
    <Row as="footer" fillWidth horizontal="center" paddingX="16" paddingY="24" borderTop>
      <Row fillWidth maxWidth="l" gap="16" wrap horizontal="between" vertical="center">
        <Text variant="body-default-s" onBackground="neutral-weak">
          © 2026 {brand.name}
        </Text>
        <Row as="nav" gap="8" aria-label="Footer">
          <Button href="/blog" variant="tertiary" size="s" label="Blog" />
          <Button href="/privacy" variant="tertiary" size="s" label="Privacy" />
          <Button href="/terms" variant="tertiary" size="s" label="Terms" />
        </Row>
      </Row>
    </Row>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth flex={1}>
      <SiteHeader />
      <Column as="main" fillWidth flex={1} horizontal="center" paddingX="16" paddingY="48">
        {children}
      </Column>
      <SiteFooter />
    </Column>
  );
}
