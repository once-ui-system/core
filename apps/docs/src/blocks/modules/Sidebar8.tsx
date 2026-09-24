"use client";

import type { IconName } from "@once-ui-system/core";
import {
  Avatar,
  Column,
  Icon,
  IconButton,
  Input,
  Line,
  Row,
  Text,
  ToggleButton,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";

interface NavItem {
  key: string;
  label: string;
  icon: IconName;
  section: string;
}

const navItems: NavItem[] = [
  { key: "overview", label: "Overview", icon: "grid", section: "Workspace" },
  { key: "tasks", label: "Tasks", icon: "check", section: "Workspace" },
  { key: "calendar", label: "Calendar", icon: "calendar", section: "Workspace" },
  { key: "messages", label: "Messages", icon: "conversation", section: "Workspace" },
  { key: "documents", label: "Documents", icon: "pages", section: "Files" },
  { key: "media", label: "Media library", icon: "image", section: "Files" },
  { key: "billing", label: "Billing", icon: "payment", section: "Account" },
  { key: "settings", label: "Settings", icon: "settings", section: "Account" },
];

const defaultFavorites = ["overview", "documents"];

export const Sidebar8: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(defaultFavorites);
  const [active, setActive] = useState("overview");

  const toggleFavorite = (key: string) => {
    setFavorites((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return navItems;
    return navItems.filter((item) => item.label.toLowerCase().includes(normalized));
  }, [query]);

  const favoriteItems = filteredItems.filter((item) => favorites.includes(item.key));
  const sections = Array.from(new Set(filteredItems.map((item) => item.section)));

  const renderItem = (item: NavItem) => (
    <Row key={item.key} fillWidth vertical="center">
      <ToggleButton
        fillWidth
        horizontal="start"
        selected={active === item.key}
        onClick={() => setActive(item.key)}
      >
        <Row gap="12" vertical="center" textVariant="label-default-s">
          <Icon name={item.icon} size="xs" onBackground="neutral-weak" />
          {item.label}
        </Row>
      </ToggleButton>
      <Row position="absolute" right="4">
        <IconButton
          variant="ghost"
          size="s"
          icon={favorites.includes(item.key) ? "starFill" : "star"}
          tooltip={favorites.includes(item.key) ? "Unpin" : "Pin"}
          onClick={() => toggleFavorite(item.key)}
        />
      </Row>
    </Row>
  );

  return (
    <Column fillHeight maxWidth={18} background="surface" border radius="l" {...flex}>
      <Row fillWidth paddingX="16" paddingY="16" vertical="center" gap="12">
        <Avatar size="s" src="/images/creators/lorant.jpg" />
        <Column fillWidth gap="2">
          <Text variant="label-strong-s" truncate>
            Nova Studio
          </Text>
          <Text variant="body-default-xs" onBackground="neutral-weak" truncate>
            Free workspace
          </Text>
        </Column>
      </Row>
      <Row fillWidth paddingX="16" paddingBottom="12">
        <Input
          id="sidebar-search"
          placeholder="Search"
          size="s"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          prefix={<Icon name="search" size="xs" onBackground="neutral-weak" />}
        />
      </Row>
      <Column fill gap="20" paddingX="12" paddingBottom="16" overflowY="auto">
        {favoriteItems.length > 0 && (
          <Column fillWidth gap="2">
            <Text
              variant="body-default-xs"
              onBackground="neutral-weak"
              marginBottom="4"
              marginLeft="12"
            >
              Favorites
            </Text>
            {favoriteItems.map(renderItem)}
          </Column>
        )}

        {sections.map((section) => (
          <Column key={section} fillWidth gap="2">
            <Text
              variant="body-default-xs"
              onBackground="neutral-weak"
              marginBottom="4"
              marginLeft="12"
            >
              {section}
            </Text>
            {filteredItems.filter((item) => item.section === section).map(renderItem)}
          </Column>
        ))}

        {filteredItems.length === 0 && (
          <Column fillWidth center gap="8" paddingY="32">
            <Icon name="search" onBackground="neutral-weak" />
            <Text variant="body-default-s" onBackground="neutral-weak">
              No results for &ldquo;{query}&rdquo;
            </Text>
          </Column>
        )}
      </Column>
      <Line background="neutral-alpha-weak" />
      <Row fillWidth paddingX="16" paddingY="16" vertical="center" horizontal="between">
        <Row gap="8" vertical="center" textVariant="label-default-s" onBackground="neutral-weak">
          <Icon name="bolt" size="xs" />
          8/10 projects used
        </Row>
        <IconButton variant="secondary" size="s" icon="plus" tooltip="Upgrade" />
      </Row>
    </Column>
  );
};
