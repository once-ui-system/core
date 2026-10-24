import { Button, Row } from "@once-ui-system/core";
import { brand } from "@/resources/once-ui.config";

export function SiteHeader() {
  return (
    <Row as="header" fillWidth vertical="center" horizontal="between" paddingX="24" paddingY="16" borderBottom>
      <Button variant="tertiary" href="/" label={brand.name} size="m" />
      <Row gap="8" vertical="center">
        <Button variant="tertiary" href="/blog" label="Blog" size="s" />
        <Button variant="secondary" href="/auth" label="Sign in" size="s" />
      </Row>
    </Row>
  );
}
