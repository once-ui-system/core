"use client";

import type { IconName } from "@once-ui-system/core";
import {
  Button,
  Column,
  Icon,
  IconButton,
  Logo,
  Mascot,
  Nav,
  NavItem,
  NavSection,
  ProgressBar,
  Row,
  StyleScope,
  Tag,
  Text,
  ToggleButton,
} from "@once-ui-system/core";
import { PromptComposer } from "./PromptComposer";

/**
 * Reference rebuild: an assistant-first home (workspace switcher, Home /
 * Activity with what needs you, tools in the nav, a centred composer with
 * suggested prompts, a getting-started pill and the trial footer).
 * Core components and props only; the look is the StyleScope.
 */

const tools: { label: string; icon: IconName; tone: "danger" | "info" | "success" | "accent" }[] = [
  { label: "Campaigns", icon: "megaphone", tone: "danger" },
  { label: "Creatives", icon: "image", tone: "info" },
  { label: "Briefs", icon: "document", tone: "success" },
  { label: "Workflows", icon: "layers", tone: "accent" },
];

const prompts: { label: string; icon: IconName }[] = [
  { label: "Summarize this week's performance", icon: "trendUp" },
  { label: "Draft a creative brief", icon: "edit" },
  { label: "Plan next month's budget", icon: "banknotes" },
];

function ToolIcon({ icon, tone }: { icon: IconName; tone: (typeof tools)[number]["tone"] }) {
  return (
    <Row width="20" height="20" radius="s" center background={`${tone}-medium`}>
      <Icon name={icon} size="xs" onSolid={`${tone}-strong`} />
    </Row>
  );
}

export default function AssistantReference() {
  return (
    <StyleScope
      style={{ width: "100%" }}
      config={{
        theme: "dark",
        neutral: "gray",
        brand: "custom",
        brandSeed: "#C4F03A",
        accent: "violet",
        solid: "contrast",
        border: "playful",
        pageBackground: "#141414",
        surfaceBackground: "#1c1c1c",
      }}
    >
      <Row
        marginX="auto"
        maxWidth="90rem"
        height="54rem"
        background="page"
        border
        radius="xl"
        overflow="hidden"
        shadow="l"
      >
        {/* Sidebar */}
        <Column width="18rem" fillHeight borderRight background="surface">
          <Column fill paddingX="12" paddingY="16" gap="20">
            <Row paddingX="4" vertical="center" gap="8">
              <Logo text="Ember Studio" monogram="E" size="s" tone="brand" />
              <Icon name="chevronUpDown" size="xs" onBackground="neutral-weak" />
              <Row flex={1} />
              <IconButton
                icon="search"
                variant="ghost"
                size="s"
                tooltip="Search"
                onClick={() => {}}
              />
              <IconButton
                icon="sidebar"
                variant="ghost"
                size="s"
                tooltip="Hide sidebar"
                onClick={() => {}}
              />
            </Row>

            <Row gap="4" vertical="center">
              <ToggleButton prefixIcon="home" label="Home" selected size="s" />
              <ToggleButton
                prefixIcon="sparkle"
                size="s"
                label={
                  <Row gap="8" vertical="center">
                    Activity
                    <Tag size="s" variant="solid" tone="danger" label="3" />
                  </Row>
                }
              />
            </Row>

            <Nav variant="subtle" density="compact" rail={false} gap="2">
              <NavItem icon="plus" label="New session" onClick={() => {}} />
              <NavItem icon="barChart" label="Analytics" href="#" />
              <NavItem icon="list" label="Plan" href="#" />
              <NavItem
                icon="chat"
                label={
                  <Row fillWidth horizontal="between" vertical="center">
                    On Slack
                    <Icon name="arrowUpRight" size="xs" onBackground="neutral-weak" />
                  </Row>
                }
                href="#"
              />
            </Nav>

            <Nav variant="subtle" density="compact" rail={false}>
              <NavSection label="Tools">
                {tools.map((t) => (
                  <NavItem
                    key={t.label}
                    prefix={<ToolIcon icon={t.icon} tone={t.tone} />}
                    label={t.label}
                    href="#"
                  />
                ))}
              </NavSection>
            </Nav>

            <Nav variant="subtle" density="compact" rail={false}>
              <NavSection label="Chats">
                <Row paddingX="12" paddingY="8">
                  <Text textVariant="label-default-s" onBackground="neutral-weak">
                    No chats yet
                  </Text>
                </Row>
              </NavSection>
            </Nav>

            <Column flex={1} />

            <Row
              background="page"
              border
              radius="l"
              paddingX="12"
              paddingY="12"
              gap="12"
              vertical="center"
              shadow="s"
            >
              <Column fillWidth gap="8">
                <Row horizontal="between" vertical="center">
                  <Text textVariant="label-strong-s">Getting started</Text>
                  <Text textVariant="label-default-s" onBackground="neutral-weak">
                    1 of 5
                  </Text>
                </Row>
                <ProgressBar value={20} showLabel={false} size="s" />
              </Column>
            </Row>
          </Column>
          <Row borderTop paddingX="16" paddingY="12" vertical="center" horizontal="between">
            <Row gap="8" vertical="center">
              <Icon name="rocket" size="s" onBackground="neutral-medium" />
              <Text textVariant="label-default-s">14 days left</Text>
            </Row>
            <Button size="s" label="Upgrade" />
          </Row>
        </Column>

        {/* Main */}
        <Column fill>
          <Row paddingX="24" paddingY="16" horizontal="end">
            <Row
              border
              radius="full"
              paddingLeft="12"
              paddingRight="4"
              paddingY="4"
              gap="8"
              vertical="center"
              background="surface"
            >
              <Icon name="light" size="xs" onBackground="neutral-medium" />
              <Text textVariant="label-default-s">Free plan</Text>
              <Button variant="tertiary" size="s" label="Upgrade" />
            </Row>
          </Row>

          <Column fill center paddingX="40" paddingBottom="80">
            <Column maxWidth="40rem" gap="24">
              <Row gap="16" center>
                <Mascot
                  size={44}
                  color="brand"
                  face="flat"
                  state="idle"
                  aria-label="Ember assistant"
                />
                <Text as="h1" textVariant="display-strong-xs">
                  How can I help you today?
                </Text>
              </Row>
              <PromptComposer suggestions={prompts} usage={38} />
            </Column>
          </Column>
        </Column>
      </Row>
    </StyleScope>
  );
}
