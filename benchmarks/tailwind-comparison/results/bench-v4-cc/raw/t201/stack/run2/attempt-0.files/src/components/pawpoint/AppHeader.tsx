import Link from "next/link";
import { Avatar, Column, Icon, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { USER } from "@/lib/data";

export function SkipLink() {
  return (
    <VisuallyHidden as="a" href="#main" focusable>
      Skip to main content
    </VisuallyHidden>
  );
}

export function AppHeader() {
  return (
    <Row
      as="header"
      fillWidth
      background="surface"
      borderBottom
      paddingX="16"
      paddingY="12"
      horizontal="between"
      vertical="center"
      gap="16"
      position="sticky"
      top="0"
      zIndex={10}
    >
      <Link href="/" aria-label="Pawpoint, today's schedule" style={{ textDecoration: "none", color: "inherit" }}>
        <Row gap="12" vertical="center">
          <Row center width="40" height="40" radius="m" background="brand-medium" border="brand-medium">
            <Icon name="paw" size="m" onBackground="brand-strong" />
          </Row>
          <Column>
            <Text variant="heading-strong-l">Pawpoint</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak" s={{ hide: true }}>
              Hillside Veterinary Clinic
            </Text>
          </Column>
        </Row>
      </Link>
      <Row gap="12" vertical="center">
        <Column horizontal="end" gap="2" s={{ hide: true }}>
          <Text variant="label-strong-s">{USER.name}</Text>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {USER.role}
          </Text>
        </Column>
        <Avatar value="RL" size="m" aria-label={`${USER.name}, ${USER.role}`} />
      </Row>
    </Row>
  );
}
