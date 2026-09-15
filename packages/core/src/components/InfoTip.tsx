"use client";

import React from "react";
import { Column, HoverCard, Icon, Text } from ".";

interface InfoTipProps extends Omit<React.ComponentProps<typeof Column>, "children"> {
  /** The explanation. A sentence or two — anything longer wants a doc link. */
  children?: React.ReactNode;
  /** Icon size, matched to whatever text it sits beside. */
  size?: React.ComponentProps<typeof Icon>["size"];
}

/**
 * The "what is this?" affordance: a small info icon that reveals a sentence of
 * context on hover. Lets a setting carry an explanation without spending a line
 * of the panel on a description that is only needed once.
 */
const InfoTip: React.FC<InfoTipProps> = ({ children, size = "xs", ...flex }) => (
  <HoverCard trigger={<Icon name="info" size={size} onBackground="neutral-weak" />}>
    <Column
      maxWidth={18}
      paddingY="8"
      paddingX="12"
      background="page"
      radius="m"
      border="neutral-alpha-weak"
      {...flex}
    >
      <Text variant="label-default-s" onBackground="neutral-medium">
        {children}
      </Text>
    </Column>
  </HoverCard>
);

InfoTip.displayName = "InfoTip";

export { InfoTip };
export type { InfoTipProps };
