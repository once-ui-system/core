import Link from "next/link";
import { Avatar, Column, Icon, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { USER } from "@/lib/data";
import { PatientSearch } from "./PatientSearch";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth minHeight="100vh">
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Column as="header" fillWidth background="surface" borderBottom horizontal="center">
        <Row fillWidth maxWidth="xl" paddingX="16" paddingY="12" gap="16" vertical="center" horizontal="between">
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            <Row gap="12" vertical="center">
              <Row background="brand-alpha-medium" radius="m" center width={40} height={40}>
                <Icon name="paw" size="m" onBackground="brand-strong" />
              </Row>
              <Column>
                <Text textVariant="heading-strong-m">Pawpoint</Text>
                <Text textVariant="label-default-xs" onBackground="neutral-weak" s={{ hide: true }}>
                  Hillside Veterinary Clinic
                </Text>
              </Column>
            </Row>
          </Link>
          <Row gap="12" vertical="center">
            <Column horizontal="end" s={{ hide: true }}>
              <Text textVariant="label-strong-s">{USER.name}</Text>
              <Text textVariant="label-default-xs" onBackground="neutral-weak">
                {USER.role}
              </Text>
            </Column>
            <Avatar value="RL" size="m" aria-label={`${USER.name}, ${USER.role}`} />
          </Row>
        </Row>
      </Column>
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24" flex={1}>
        <Column fillWidth maxWidth="xl" gap="24">
          <PatientSearch />
          {children}
        </Column>
      </Column>
    </Column>
  );
}
