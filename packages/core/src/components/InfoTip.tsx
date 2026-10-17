"use client";

import React, { useId } from "react";
import { Column } from "./Column";
import { HoverCard } from "./HoverCard";
import { Icon } from "./Icon";
import { Text } from "./Text";

interface InfoTipProps extends Omit<React.ComponentProps<typeof Column>, "children"> {
  /** The explanation. A sentence or two — anything longer wants a doc link. */
  children?: React.ReactNode;
  /** Icon size, matched to whatever text it sits beside. */
  size?: React.ComponentProps<typeof Icon>["size"];
}

/**
 * The "what is this?" affordance: a small info icon that reveals a sentence of
 * context on hover or focus. Lets a setting carry an explanation without
 * spending a line of the panel on a description that is only needed once.
 *
 * `aria-label` names the icon (default "More information"); the explanation
 * is announced as its description.
 */
const InfoTip: React.FC<InfoTipProps> = ({
  children,
  size = "xs",
  "aria-label": ariaLabel = "More information",
  ...flex
}) => {
  const tipId = useId();

  return (
    <HoverCard
      trigger={
        // A tab stop with a name, so the tip is reachable without a pointer:
        // HoverCard opens on focus as well as hover, and while it is open the
        // tip describes the icon.
        <Icon
          name="info"
          size={size}
          onBackground="neutral-weak"
          decorative={false}
          role="button"
          tabIndex={0}
          aria-label={ariaLabel}
          aria-describedby={tipId}
          radius="full"
          className="focus-ring"
        />
      }
    >
      <Column
        id={tipId}
        role="tooltip"
        maxWidth="18rem"
        paddingY="8"
        paddingX="12"
        background="page"
        radius="m"
        border
        {...flex}
      >
        <Text variant="label-default-s" onBackground="neutral-medium">
          {children}
        </Text>
      </Column>
    </HoverCard>
  );
};

InfoTip.displayName = "InfoTip";

export type { InfoTipProps };
export { InfoTip };
