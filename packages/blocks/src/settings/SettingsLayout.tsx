"use client";

import { Column, Heading, Tab, TabList, TabPanel, Tabs } from "@once-ui-system/core";
import type { ReactNode } from "react";
import { type SettingsLabelsInput, SettingsLabelsProvider, useSettingsLabels } from "./shared.js";
import type { SettingsSection } from "./types.js";

export interface SettingsLayoutProps {
  sections: SettingsSection[];
  /** The page heading above the tabs. Leave out when the page has its own. */
  title?: ReactNode;
  /** The section open first, uncontrolled. */
  defaultValue?: string;
  /** The open section, controlled, such as one read from the URL. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Labels for every settings block inside. */
  labels?: SettingsLabelsInput;
}

/**
 * The settings page: a vertical list of sections beside the open one, the
 * list above it on a phone. Every block inside reads `labels` from here, so a
 * Hungarian app passes `settingsLabelsHu` once.
 */
export function SettingsLayout({ labels, ...props }: SettingsLayoutProps) {
  return (
    <SettingsLabelsProvider labels={labels}>
      <SettingsTabs {...props} />
    </SettingsLabelsProvider>
  );
}

function SettingsTabs({
  sections,
  title,
  defaultValue,
  value,
  onValueChange,
}: Omit<SettingsLayoutProps, "labels">) {
  const labels = useSettingsLabels();
  const first = sections[0]?.value;
  const controlled =
    value !== undefined
      ? { value, onValueChange }
      : { defaultValue: defaultValue ?? first, onValueChange };

  return (
    <Column fillWidth gap="32">
      {title && (
        <Heading as="h1" textVariant="display-strong-xs">
          {title}
        </Heading>
      )}
      <Tabs {...controlled} orientation="vertical" gap="40" s={{ direction: "column", gap: "24" }}>
        <TabList
          aria-label={labels.common.nav}
          minWidth={192}
          flex={0}
          s={{ direction: "row", minWidth: 0 }}
        >
          {sections.map((section) => (
            <Tab key={section.value} value={section.value} prefixIcon={section.icon}>
              {section.label}
            </Tab>
          ))}
        </TabList>
        {sections.map((section) => (
          <TabPanel key={section.value} value={section.value} keepMounted fillWidth minWidth={0}>
            {section.content}
          </TabPanel>
        ))}
      </Tabs>
    </Column>
  );
}
