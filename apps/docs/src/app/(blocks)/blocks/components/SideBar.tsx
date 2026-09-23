"use client";

import { Column, Row, Text, ToggleButton } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import React from "react";
import { hasRecentExample } from "@/app/utils/recency";
import useScrollPosition from "@/app/utils/useScrollPosition";

import { blocks } from "@/resources";
import type { BlockItem, BlockSection } from "@/types";

type SidebarItem = BlockItem;

type SidebarSection = BlockSection;

const SideBar = React.memo(() => {
  const pathname = usePathname();
  const scrollRef = useScrollPosition();

  const renderItems = (section: SidebarSection) => {
    // Normalize to [key, item] tuples
    const entries: Array<[string, SidebarItem]> = Array.isArray(section.items)
      ? section.items.map((item, index) => [String(index), item])
      : Object.entries(section.items);

    // Sort: items with a recent example first
    entries.sort((a, b) => {
      const aNew = hasRecentExample(a[1].examples) ? 1 : 0;
      const bNew = hasRecentExample(b[1].examples) ? 1 : 0;
      return bNew - aNew;
    });

    return entries.map(([key, item]) => renderItem(item, section, key));
  };

  const renderItem = (item: SidebarItem, _section: SidebarSection, key: string) => {
    return (
      <ToggleButton
        type="button"
        style={{ position: "relative" }}
        fillWidth
        horizontal="start"
        size="m"
        disabled={item.tag === "soon"}
        key={key}
        selected={pathname === item.href}
        href={item.href}
      >
        <Row position="static" vertical="center" padding="4" gap="16" textVariant="label-default-s">
          {hasRecentExample(item.examples) ? (
            <Row
              solid="brand-strong"
              radius="full"
              minWidth="4"
              aspectRatio="1"
              data-solid="color"
            />
          ) : (
            <Row minWidth="4" />
          )}
          {item.label}
          <Row vertical="center" gap="8" position="absolute" right="4">
            {item.examples?.length && (
              <Row
                style={{ transform: "scale(0.85)" }}
                border="neutral-alpha-medium"
                radius="s"
                paddingY="1"
                paddingX="8"
                width="24"
                horizontal="center"
                textVariant="body-default-xs"
              >
                {item.examples?.length}
              </Row>
            )}
          </Row>
        </Row>
      </ToggleButton>
    );
  };

  return (
    <Column overflowY="auto" ref={scrollRef} as="nav" paddingX="8" fillWidth gap="24" zIndex={3}>
      {Object.entries(blocks).map(([sectionKey, section]) => (
        <Column key={sectionKey} gap="2">
          <Row paddingX="8" paddingY="8" vertical="center">
            <Text as="span" variant="body-default-xs" onBackground="neutral-weak">
              {section.title}
            </Text>
          </Row>
          {renderItems(section)}
        </Column>
      ))}
    </Column>
  );
});

SideBar.displayName = "SideBar";

export { SideBar };
