import { Column, Row, SmartLink, Text, VisuallyHidden, Icon } from "@once-ui-system/core";

export function TeamShell({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        horizontal="center"
        borderBottom
        background="surface"
        paddingX="24"
        paddingY="12"
      >
        <Row fillWidth maxWidth="l" vertical="center" horizontal="between" gap="16">
          <SmartLink href="/" aria-label="Lumen, team home">
            <Row gap="8" vertical="center">
              <Icon name="sparkle" onBackground="brand-strong" />
              <Text variant="heading-strong-m">Lumen</Text>
            </Row>
          </SmartLink>
          <Row as="nav" aria-label="Workspace" gap="16" vertical="center">
            <Text variant="label-default-s" onBackground="neutral-weak" s={{ hide: true }}>
              Acme Labs
            </Text>
            <Row gap="4" vertical="center">
              <Icon name="people" size="s" onBackground="neutral-strong" />
              <Text variant="label-strong-s">Team</Text>
            </Row>
          </Row>
        </Row>
      </Row>
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="24" paddingY="40" flex={1}>
        {children}
      </Column>
    </Column>
  );
}
