"use client";

import {
  Column,
  Nav,
  NavGroup,
  NavItem,
  NavSection,
  Row,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  Text,
  User,
} from "@once-ui-system/core";
import { useState } from "react";

const PAGES = ["Dashboard", "Analytics", "Reports", "Users", "Billing", "Roles"];

function Frame({
  collapsible = "rail",
  expandOnHover = false,
}: {
  collapsible?: "rail" | "offcanvas";
  expandOnHover?: boolean;
}) {
  const [page, setPage] = useState("Dashboard");
  const item = (label: string, icon?: React.ComponentProps<typeof NavItem>["icon"]) => (
    <NavItem
      key={label}
      icon={icon}
      label={label}
      selected={page === label}
      onClick={() => setPage(label)}
    />
  );
  return (
    // The docs page is not an app: no ⌘B, and no drawer below `s`.
    <SidebarProvider shortcut={false} mobileBelow={false}>
      <Column fillWidth height={28} border="neutral-alpha-weak" radius="l" overflow="hidden">
        <Row height="48" vertical="center" gap="8" paddingX="8">
          <SidebarTrigger />
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Fjell / {page}
          </Text>
        </Row>
        <Row flex={1} minHeight={0} paddingRight="8">
          <Sidebar aria-label="Workspace" collapsible={collapsible} expandOnHover={expandOnHover}>
            <SidebarHeader>
              <User name="Fjell" subline="Pro workspace" avatarProps={{ value: "F" }} />
            </SidebarHeader>
            <SidebarContent>
              <Nav density="compact" aria-label="Product">
                {item("Dashboard", "home")}
                {item("Analytics", "trend")}
                {item("Reports", "document")}
                <NavSection label="Workspace">
                  <NavGroup icon="people" label="Manage" defaultOpen>
                    {item("Users")}
                    {item("Billing")}
                    {item("Roles")}
                  </NavGroup>
                </NavSection>
              </Nav>
            </SidebarContent>
            <SidebarFooter>
              <Nav density="compact" aria-label="Account">
                <NavItem icon="settings" label="Settings" />
              </Nav>
            </SidebarFooter>
          </Sidebar>
          <Column
            flex={1}
            minWidth={0}
            background="surface"
            border="neutral-alpha-weak"
            topRadius="l"
            padding="24"
            gap="8"
          >
            <Text textVariant="heading-strong-m">{page}</Text>
            <Text onBackground="neutral-weak">
              Drag the sidebar's edge, past the minimum to fold it into a rail. Double-click the
              edge to reset it.
            </Text>
          </Column>
        </Row>
      </Column>
    </SidebarProvider>
  );
}

export function SidebarExample() {
  return <Frame />;
}

export function SidebarPeekExample() {
  return <Frame expandOnHover />;
}

export function SidebarOffcanvasExample() {
  return <Frame collapsible="offcanvas" />;
}

export { PAGES as SIDEBAR_EXAMPLE_PAGES };
