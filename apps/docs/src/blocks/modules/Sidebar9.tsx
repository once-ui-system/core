"use client";

import type { IconName } from "@once-ui-system/core";
import {
  Avatar,
  Column,
  Icon,
  IconButton,
  Line,
  Row,
  Text,
  ToggleButton,
} from "@once-ui-system/core";
import { useState } from "react";

interface NavItem {
  key: string;
  label: string;
  icon: IconName;
  section: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { key: "home", label: "Home", icon: "home", section: "Main" },
  { key: "projects", label: "Projects", icon: "grid", section: "Main", badge: "12" },
  { key: "inbox", label: "Inbox", icon: "email", section: "Main", badge: "3" },
  { key: "analytics", label: "Analytics", icon: "analytics", section: "Insights" },
  { key: "reports", label: "Reports", icon: "pages", section: "Insights" },
  { key: "team", label: "Team", icon: "people", section: "Workspace" },
  { key: "billing", label: "Billing", icon: "payment", section: "Workspace" },
  { key: "settings", label: "Settings", icon: "settings", section: "Workspace" },
];

const railIcons: IconName[] = ["home", "grid", "analytics", "people", "settings"];

export const Sidebar9: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  const [active, setActive] = useState("projects");
  const [activeRail, setActiveRail] = useState(1);

  const sections = Array.from(new Set(navItems.map((item) => item.section)));

  return (
    <Row
      fillHeight
      maxWidth={22}
      background="surface"
      border
      radius="l"
      overflow="hidden"
      {...flex}
    >
      <Column
        fillHeight
        width={6}
        minWidth={6}
        paddingY="12"
        gap="8"
        center
        borderRight="neutral-alpha-weak"
        background="neutral-alpha-weak"
      >
        <Avatar size="xs" src="/images/creators/lorant.jpg" marginBottom="8" />
        {railIcons.map((icon, index) => (
          <IconButton
            key={icon}
            icon={icon}
            size="l"
            variant={activeRail === index ? "primary" : "ghost"}
            tooltip={navItems.find((item) => item.icon === icon)?.label ?? icon}
            tooltipPosition="right"
            onClick={() => setActiveRail(index)}
          />
        ))}
        <Column fill vertical="end" paddingBottom="8">
          <IconButton
            icon="plus"
            size="l"
            variant="secondary"
            tooltip="Create"
            tooltipPosition="right"
          />
        </Column>
      </Column>

      <Column fillHeight fill gap="16" padding="16" overflowY="auto">
        <Column gap="4">
          <Text variant="label-strong-s">Nova Studio</Text>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            Pro workspace
          </Text>
        </Column>

        {sections.map((section) => (
          <Column key={section} fillWidth gap="2">
            <Text
              variant="body-default-xs"
              onBackground="neutral-weak"
              marginBottom="4"
              marginLeft="4"
            >
              {section}
            </Text>
            {navItems
              .filter((item) => item.section === section)
              .map((item) => (
                <ToggleButton
                  key={item.key}
                  fillWidth
                  horizontal="start"
                  selected={active === item.key}
                  onClick={() => setActive(item.key)}
                >
                  <Row fillWidth horizontal="between" vertical="center">
                    <Row gap="12" vertical="center" textVariant="label-default-s">
                      <Icon name={item.icon} size="xs" onBackground="neutral-weak" />
                      {item.label}
                    </Row>
                    {item.badge && (
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {item.badge}
                      </Text>
                    )}
                  </Row>
                </ToggleButton>
              ))}
          </Column>
        ))}

        <Column fill />
        <Line background="neutral-alpha-weak" />
        <Row fillWidth vertical="center" gap="12">
          <Avatar size="s" src="/images/creators/lorant.jpg" />
          <Column fillWidth gap="2">
            <Text variant="label-default-s" truncate>
              Lorant One
            </Text>
            <Text variant="body-default-xs" onBackground="neutral-weak" truncate>
              lorant@novastudio.app
            </Text>
          </Column>
          <IconButton variant="ghost" size="s" icon="chevronDown" tooltip="Account menu" />
        </Row>
      </Column>
    </Row>
  );
};
