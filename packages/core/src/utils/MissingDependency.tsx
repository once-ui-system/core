"use client";

import React from "react";
import { Column } from "../components/Column";
import { Icon } from "../components/Icon";
import { Text } from "../components/Text";

export interface MissingDependencyProps {
  component: string;
  packageName: string;
}

export const MissingDependency: React.FC<MissingDependencyProps> = ({
  component,
  packageName,
}) => (
  <Column
    fillWidth
    minHeight="160"
    center
    gap="12"
    padding="24"
    radius="l"
    border="neutral-medium"
    background="neutral-alpha-weak"
  >
    <Icon name="warning" size="l" onBackground="warning-medium" />
    <Column center gap="4">
      <Text variant="body-strong-s" onBackground="neutral-strong">
        {`<${component} />`} requires {`"${packageName}"`}
      </Text>
      <Text variant="body-default-xs" onBackground="neutral-weak">
        Install it with: <Text as="code" variant="code-default-xs">{`npm install ${packageName}`}</Text>
      </Text>
    </Column>
  </Column>
);

MissingDependency.displayName = "MissingDependency";
