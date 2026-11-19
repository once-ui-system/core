"use client";

import {
  AccountSettings,
  createDemoAccountAdapter,
  createDemoOrganizationAdapter,
  OrganizationSettings,
  SecuritySettings,
  SettingsLayout,
  settingsLabelsHu,
} from "@once-ui-system/blocks";
import { useMemo } from "react";

/**
 * The settings blocks on the in-memory demo adapters: every row works, and
 * writes last until the page reloads. The two-step code is 123456.
 */
export function SettingsBlocksExample({ hungarian = false }: { hungarian?: boolean }) {
  const account = useMemo(() => createDemoAccountAdapter(), []);
  const organization = useMemo(() => createDemoOrganizationAdapter(), []);
  const labels = hungarian ? settingsLabelsHu : undefined;
  const sections = labels?.sections;
  return (
    <SettingsLayout
      labels={labels}
      sections={[
        {
          value: "profile",
          label: sections?.profile ?? "Profile",
          icon: "person",
          content: <AccountSettings adapter={account} fields={{ username: true }} />,
        },
        {
          value: "security",
          label: sections?.security ?? "Sign-in & security",
          icon: "security",
          content: <SecuritySettings adapter={account} />,
        },
        {
          value: "organization",
          label: sections?.organization ?? "Organization",
          icon: "organization",
          content: <OrganizationSettings adapter={organization} />,
        },
      ]}
    />
  );
}
