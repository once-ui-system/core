"use client";

import { Column, Text } from "@once-ui-system/core";

type AgentGenerationProps = {
  text: string;
  active?: boolean;
};

export function AgentGeneration({ text, active = false }: AgentGenerationProps) {
  if (!text && !active) return null;

  return (
    <Column
      maxWidth={48}
      maxHeight={12}
      overflowY="auto"
      background="neutral-alpha-weak"
      radius="m"
      paddingX="12"
      paddingY="8"
      border="neutral-alpha-weak"
    >
      <Text variant="body-default-s" onBackground="neutral-strong">
        {text}
        {active ? (
          <Text as="span" onBackground="brand-medium">
            ▍
          </Text>
        ) : null}
      </Text>
    </Column>
  );
}
