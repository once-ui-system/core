"use client";

import {
  Button,
  Column,
  Grid,
  HeaderMenu,
  Icon,
  iconLibrary,
  Logo,
  Nav,
  NavItem,
  Row,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  Text,
} from "@once-ui-system/core";

const links = ["Product", "Pricing", "Docs", "Blog", "Changelog"];

export default function NavKitProof() {
  return (
    <Column fillWidth background="page" style={{ minHeight: "100vh" }}>
      <Row
        as="header"
        position="sticky"
        top="0"
        zIndex={9}
        fillWidth
        paddingX="16"
        paddingY="12"
        gap="8"
        vertical="center"
        background="page"
        borderBottom="neutral-alpha-weak"
      >
        <Logo href="#" wordmark={false} icon="/favicon.ico" size="s" />
        <Text variant="heading-strong-s">Fjell</Text>
        <Row fillWidth m={{ hide: true }} horizontal="center" gap="16">
          {links.map((l) => (
            <Text key={l} variant="label-default-s" onBackground="neutral-weak">{l}</Text>
          ))}
        </Row>
        <Row fillWidth hide m={{ hide: false }} />
        <Button size="s" label="Sign up" href="#signup" />
        <HeaderMenu footer={<Button fillWidth label="Sign up" href="#signup" />}>
          {links.map((l) => (
            <NavItem key={l} label={l} href={`#${l.toLowerCase()}`} />
          ))}
        </HeaderMenu>
      </Row>
      <SidebarProvider persist={false}>
        <Row fillWidth flex={1}>
          <Sidebar>
            <SidebarHeader>
              <Row paddingX="12" paddingY="8" vertical="center" gap="8">
                <Text variant="label-strong-m">Fjell workspace</Text>
              </Row>
            </SidebarHeader>
            <SidebarContent>
              <Nav>
                <NavItem icon="home" label="Overview" href="#" selected />
                <NavItem icon="people" label="Clients" href="#" />
                <NavItem icon="briefcase" label="Projects" href="#" />
                <NavItem icon="document" label="Contracts" href="#" />
                <NavItem icon="banknotes" label="Finances" href="#" />
                <NavItem icon="settings" label="Settings" href="#" />
              </Nav>
            </SidebarContent>
          </Sidebar>
          <Column fillWidth padding="24" gap="16">
            <Row gap="8" vertical="center">
              <SidebarTrigger />
              <Text variant="heading-strong-m">Built-in icons ({Object.keys(iconLibrary).length})</Text>
            </Row>
            <Grid columns="12" s={{ columns: "6" }} gap="16">
              {Object.keys(iconLibrary).slice(0, 72).map((name) => (
                <Column key={name} horizontal="center" gap="4">
                  <Icon name={name as never} size="m" onBackground="neutral-strong" />
                </Column>
              ))}
            </Grid>
          </Column>
        </Row>
      </SidebarProvider>
    </Column>
  );
}
