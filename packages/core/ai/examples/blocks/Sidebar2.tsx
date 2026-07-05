"use client";

import { Column, Text, ToggleButton } from "@once-ui-system/core";

/** Productivity sidebar — minimal stub for Productivity1 reference */
export const Sidebar2: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => (
  <Column fillHeight maxWidth={18} background="surface" borderRight="neutral-alpha-weak" padding="8" gap="4" {...flex}>
    <Text variant="label-default-s" onBackground="neutral-weak" padding="12">
      Workspace
    </Text>
    {["Inbox", "Today", "Upcoming", "Projects"].map((label) => (
      <ToggleButton key={label} fillWidth horizontal="start">
        {label}
      </ToggleButton>
    ))}
  </Column>
);
