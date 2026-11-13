import { Avatar, Column, Icon, Row, SmartLink, Text, VisuallyHidden } from "@once-ui-system/core";
import { clinic, user } from "@/lib/data";
import { PatientSearch } from "./PatientSearch";

export function DeskShell({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth flex={1} background="page">
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        background="surface"
        borderBottom
        paddingX="16"
        paddingY="12"
        gap="16"
        vertical="center"
        wrap
        position="sticky"
        top="0"
        zIndex={5}
      >
        <SmartLink href="/">
          <Row gap="12" vertical="center" fit>
            <Row
              center
              width="40"
              height="40"
              radius="m"
              solid="brand-strong"
              onSolid="brand-strong"
            >
              <Icon name="paw" size="m" onSolid="brand-strong" />
            </Row>
            <Column gap="0">
              <Text variant="heading-strong-m">{clinic}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak" s={{ hide: true }}>
                Hillside Veterinary Clinic
              </Text>
            </Column>
          </Row>
        </SmartLink>
        <Row flex={1} minWidth="240px" maxWidth="l" role="search">
          <PatientSearch />
        </Row>
        <Row gap="12" vertical="center" fit marginLeft="auto">
          <Column gap="0" horizontal="end" s={{ hide: true }}>
            <Text variant="label-strong-s">{user.name}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {user.role}
            </Text>
          </Column>
          <Avatar value="RL" size="m" />
        </Row>
      </Row>
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24" s={{ paddingY: "16" }}>
        <Column fillWidth maxWidth="xl" gap="24">
          {children}
        </Column>
      </Column>
    </Column>
  );
}
