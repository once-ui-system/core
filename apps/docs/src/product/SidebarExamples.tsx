"use client";

import {
  Avatar,
  Column,
  Line,
  Nav,
  NavItem,
  Row,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  Text,
  useSidebar,
  WorkspaceSwitcher,
} from "@once-ui-system/core";
import { useState } from "react";

const PAGES = ["Home", "Sites", "Newsletters", "Shop", "Inbox", "Analytics", "Team"];

const WORKSPACES = [
  { value: "fjell", label: "Fjell", description: "Pro workspace" },
  { value: "halden", label: "Halden & Co", description: "Team workspace" },
  { value: "ember", label: "Ember", description: "Free workspace" },
];

/**
 * The top of the sidebar, the way the Once UI apps lay it out: the workspace
 * switcher with the fold button beside it. Folded to a rail without hover,
 * the button sits under the workspace's mark so the rail can open again.
 */
function Head({ expandOnHover }: { expandOnHover: boolean }) {
  const { collapsed } = useSidebar();
  const [workspace, setWorkspace] = useState("fjell");
  const switcher = (
    <WorkspaceSwitcher
      items={WORKSPACES}
      value={workspace}
      onValueChange={setWorkspace}
      labels={{ title: "Workspaces" }}
    />
  );
  if (collapsed && !expandOnHover) {
    return (
      <Column fillWidth horizontal="center" gap="4">
        {switcher}
        <SidebarTrigger icon="sidebar" />
      </Column>
    );
  }
  return (
    <Row fillWidth gap="4" vertical="center">
      <Column flex={1} minWidth={0}>
        {switcher}
      </Column>
      <SidebarTrigger icon="sidebar" />
    </Row>
  );
}

function Frame({
  collapsible = "rail",
  expandOnHover = false,
}: {
  collapsible?: "rail" | "offcanvas";
  expandOnHover?: boolean;
}) {
  const [page, setPage] = useState("Home");
  const item = (label: string, icon: React.ComponentProps<typeof NavItem>["icon"]) => (
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
      <Row
        fillWidth
        height={496}
        border="neutral-alpha-weak"
        radius="l"
        overflow="hidden"
        padding="8"
        gap="8"
      >
        <Sidebar aria-label="Workspace" collapsible={collapsible} expandOnHover={expandOnHover}>
          <SidebarHeader>
            <Head expandOnHover={expandOnHover} />
          </SidebarHeader>
          <SidebarContent>
            {/* Flat groups split by lines: home, what the workspace makes, what works across it. */}
            <Nav density="compact" aria-label="Product">
              {item("Home", "home")}
              <Line marginY="4" background="neutral-alpha-weak" />
              {item("Sites", "globe")}
              {item("Newsletters", "mail")}
              {item("Shop", "shoppingBag")}
              <Line marginY="4" background="neutral-alpha-weak" />
              {item("Inbox", "inbox")}
              {item("Analytics", "trend")}
              {item("Team", "people")}
            </Nav>
          </SidebarContent>
          <SidebarFooter>
            <Nav density="compact" aria-label="Account">
              <NavItem icon="help" label="Help" />
              <NavItem icon="bell" label="Notifications" />
              <NavItem label="Ada Lindqvist" prefix={<Avatar size="xs" value="A" />} />
            </Nav>
          </SidebarFooter>
        </Sidebar>
        {collapsible === "offcanvas" ? <OffcanvasOpen /> : null}
        <Column
          flex={1}
          minWidth={0}
          background="surface"
          border="neutral-alpha-weak"
          radius="l"
          padding="24"
          gap="8"
        >
          <Text textVariant="heading-strong-m">{page}</Text>
          <Text onBackground="neutral-weak">
            Fold it with the button beside the workspace, or drag its edge past the minimum.
            Double-click the edge to reset it.
          </Text>
        </Column>
      </Row>
    </SidebarProvider>
  );
}

/** Folded off canvas, the sidebar is gone: its button waits at the page's edge. */
function OffcanvasOpen() {
  const { collapsed } = useSidebar();
  return collapsed ? <SidebarTrigger icon="sidebar" /> : null;
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
