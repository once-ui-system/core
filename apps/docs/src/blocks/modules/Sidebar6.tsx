"use client";

import {
  Accordion,
  Avatar,
  Background,
  Column,
  Icon,
  Line,
  Logo,
  Row,
  SmartLink,
  Text,
  ToggleButton,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { IconName } from "@/resources/icons";

export type LinkItem = { type: "link"; key: string; label: string; href: string; icon?: IconName };
export type AccordionItem = {
  type: "accordion";
  key: string;
  icon?: IconName;
  label: string;
  href?: string;
  items: Array<{ label: string; href: string }>;
};
export type SeparatorItem = { type: "separator"; key: string };
export type NavItem = LinkItem | AccordionItem | SeparatorItem;

export const nav: NavItem[] = [
  { type: "link", key: "home", label: "Home", href: "#", icon: "home" as const },
  { type: "link", key: "inbox", label: "Inbox", href: "#", icon: "send" as const },
  { type: "link", key: "calendar", label: "Calendar", href: "#", icon: "calendar" as const },
  { type: "separator", key: "sep-1" },
  {
    type: "accordion",
    key: "workspace",
    icon: "folder" as const,
    label: "Workspace",
    href: "#",
    items: [
      { label: "Getting Started", href: "#" },
      { label: "Team Wiki", href: "#" },
      { label: "Meeting Notes", href: "#" },
      { label: "Project Roadmap", href: "#" },
      { label: "Resources", href: "#" },
    ],
  },
  {
    type: "accordion",
    key: "projects",
    icon: "grid" as const,
    label: "Projects",
    items: [
      { label: "Active Projects", href: "#" },
      { label: "Archived", href: "#" },
    ],
  },
  { type: "separator", key: "sep-2" },
  {
    type: "accordion",
    key: "shared",
    icon: "person" as const,
    label: "Shared with me",
    items: [
      { label: "Team Docs", href: "#" },
      { label: "Client Files", href: "#" },
    ],
  },
  { type: "link", key: "templates", label: "Templates", href: "#", icon: "blocks" as const },
  { type: "link", key: "trash", label: "Trash", href: "#", icon: "trash" as const },
];

export function Sidebar6() {
  const pathname = usePathname();

  const initialOpen = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const item of nav) {
      if (item.type === "accordion") {
        const matchesSelf = !!(
          item.href &&
          (pathname === item.href || pathname.startsWith(`${item.href}/`))
        );
        const matchesChild = item.items.some(
          (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`),
        );
        map[item.key] = !!(matchesSelf || matchesChild);
      }
    }
    return map;
  }, [pathname]);

  const [openMap, setOpenMap] = useState<Record<string, boolean>>(initialOpen);
  useEffect(() => {
    setOpenMap((s) => ({ ...s, ...initialOpen }));
  }, [initialOpen]);
  const toggle = (key: string) => setOpenMap((s) => ({ ...s, [key]: !s[key] }));

  return (
    <Column maxWidth={16} fillHeight padding="2" gap="8" background="surface" radius="l" border>
      <Row paddingX="24" paddingY="16">
        <Logo dark wordmark="/trademarks/wordmark-dark.svg" />
        <Logo light wordmark="/trademarks/wordmark-light.svg" />
      </Row>
      <Column fill gap="4" paddingX="16" overflowY="auto">
        {nav.map((item) => {
          if (item.type === "separator") {
            return <Line key={item.key} background="neutral-alpha-weak" />;
          }
          if (item.type === "link") {
            return (
              <ToggleButton
                key={item.key}
                selected={pathname === item.href}
                href={item.href}
                fillWidth
                style={{ borderRadius: "var(--radius-m)" }}
                size="l"
                horizontal="start"
                prefixIcon={item.icon}
              >
                {item.label}
              </ToggleButton>
            );
          }
          const isOpen = !!openMap[item.key];
          return (
            <Row
              key={item.key}
              transition="micro-medium"
              background={isOpen ? "neutral-alpha-weak" : undefined}
              fillWidth
              radius="m"
            >
              <Accordion
                style={{
                  height: "var(--static-space-40)",
                  background: pathname === item.href ? "var(--neutral-alpha-weak)" : undefined,
                }}
                open={isOpen}
                onToggle={() => toggle(item.key)}
                paddingX="16"
                title={
                  item.href ? (
                    <SmartLink href={item.href} unstyled>
                      <Text variant="label-default-m" onBackground="neutral-strong">
                        <Row vertical="center" gap="12">
                          {item.icon && <Icon size="s" name={item.icon} />}
                          {item.label}
                        </Row>
                      </Text>
                    </SmartLink>
                  ) : (
                    <Row
                      cursor="interactive"
                      textVariant="label-default-m"
                      vertical="center"
                      gap="12"
                    >
                      {item.icon && <Icon size="s" name={item.icon} />}
                      {item.label}
                    </Row>
                  )
                }
              >
                <Row fillWidth gap="4" paddingLeft="8">
                  <Line vert background="neutral-alpha-medium" />
                  <Column fillWidth gap="4">
                    {item.items.map((sub, idx) => (
                      <ToggleButton
                        key={idx}
                        selected={pathname === sub.href}
                        href={sub.href}
                        horizontal="start"
                        fillWidth
                        style={{ borderRadius: "var(--radius-m)" }}
                      >
                        {sub.label}
                      </ToggleButton>
                    ))}
                  </Column>
                </Row>
              </Accordion>
            </Row>
          );
        })}
      </Column>
      <Row fillWidth padding="8">
        <Column fillWidth padding="8" gap="2" radius="l" overflow="hidden">
          <Background
            position="absolute"
            left="0"
            top="0"
            fill
            gradient={{
              display: true,
              width: 200,
              x: 50,
              y: 0,
              colorStart: "neutral-background-strong",
            }}
          />
          <ToggleButton
            href="#"
            size="l"
            horizontal="start"
            fillWidth
            style={{ minHeight: "var(--static-space-56)" }}
          >
            <Row fillWidth gap="12" vertical="center" style={{ left: "-0.5rem" }}>
              <Avatar src="/images/creators/lorant.jpg" />
              <Column fillWidth gap="2">
                <Text variant="label-default-m">Lorant</Text>
                <Row
                  textVariant="label-default-xs"
                  onBackground="neutral-weak"
                  vertical="center"
                  gap="4"
                >
                  <Icon name="bolt" size="xs" />
                  Pro
                </Row>
              </Column>
            </Row>
          </ToggleButton>
          <Row fillWidth>
            <ToggleButton
              selected={pathname === "/settings"}
              href="#"
              size="l"
              horizontal="start"
              fillWidth
              prefixIcon="settings"
              style={{ borderRadius: "var(--radius-m)" }}
            >
              Settings
            </ToggleButton>
          </Row>
        </Column>
      </Row>
    </Column>
  );
}
