import { BrandMark } from "@/components/BrandMark";
import { Button, Row } from "@once-ui-system/core";

export function Header() {
  return (
    <Row fillWidth horizontal="center" paddingTop="8" paddingX="16" position="sticky" top="0" zIndex={2}>
      <Row
        as="header"
        fillWidth
        border
        maxWidth="l"
        radius="xl"
        paddingLeft="20"
        paddingRight="12"
        paddingY="12"
        vertical="center"
        horizontal="between"
        background="page"
        gap="8"
      >
        <BrandMark />
        <Row as="nav" gap="8" vertical="center">
          <Button size="s" variant="tertiary" label="Blog" href="/blog" />
          <Button size="s" label="Sign in" href="/auth" />
        </Row>
      </Row>
    </Row>
  );
}
