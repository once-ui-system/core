"use client";

import { Column, IconButton, type IconName } from "@once-ui-system/core";

export interface RailTab {
  id: string;
  icon: IconName;
  label: string;
}

/**
 * The editor's navigation: one icon per panel in a pill, the way out in its
 * own pill at the foot. Every icon has a tooltip, since there is no room for
 * words.
 */
export function EditorRail({
  tabs,
  value,
  onValueChange,
  exitHref,
  exitLabel,
}: {
  tabs: RailTab[];
  value: string;
  onValueChange: (id: string) => void;
  exitHref?: string;
  exitLabel: string;
}) {
  return (
    <Column fillHeight paddingX="8" paddingY="12" vertical="between" fitWidth>
      <Column
        role="tablist"
        aria-orientation="vertical"
        fitHeight
        padding="4"
        gap="4"
        background="neutral-alpha-weak"
        radius="l"
      >
        {tabs.map((tab) => (
          <IconButton
            key={tab.id}
            role="tab"
            aria-selected={tab.id === value}
            icon={tab.icon}
            variant={tab.id === value ? "primary" : "tertiary"}
            tooltip={tab.label}
            tooltipPosition="right"
            onClick={() => onValueChange(tab.id)}
          />
        ))}
      </Column>
      {exitHref && (
        <Column fitHeight padding="4" background="neutral-alpha-weak" radius="l">
          <IconButton
            icon="chevronLeft"
            variant="tertiary"
            href={exitHref}
            tooltip={exitLabel}
            tooltipPosition="right"
          />
        </Column>
      )}
    </Column>
  );
}
