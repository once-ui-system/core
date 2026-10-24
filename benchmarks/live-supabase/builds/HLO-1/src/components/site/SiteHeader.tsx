import { Button, Row } from "@once-ui-system/core";
import { site } from "../../resources/once-ui.config";

export function SiteHeader() {
  return (
    <Row as="header" fillWidth center paddingX="16" height="56" borderBottom>
      <Row maxWidth="l" vertical="center" horizontal="between">
        <Button href="/" variant="tertiary" size="m" label={site.name} />
        <Row gap="4" vertical="center">
          <Button href="/blog" variant="tertiary" size="m" label="Blog" />
          <Button href="/auth" variant="secondary" size="m" label="Sign in" />
        </Row>
      </Row>
    </Row>
  );
}
