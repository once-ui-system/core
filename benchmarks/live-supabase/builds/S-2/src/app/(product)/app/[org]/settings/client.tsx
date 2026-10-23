"use client";

import { Column, Heading } from "@once-ui-system/core";
import { Organization } from "./components/Organization";
import { Plan } from "./components/Plan";

export default function SettingsClient() {
  return (
    <Column fillWidth horizontal="center">
      <Column maxWidth="l" gap="m" fillWidth>
        <Heading variant="display-strong-s" paddingX="16">
          Settings
        </Heading>
        <Column fillWidth gap="16" paddingX="16">
          <Organization />
          <Plan />
        </Column>
      </Column>
    </Column>
  );
}
