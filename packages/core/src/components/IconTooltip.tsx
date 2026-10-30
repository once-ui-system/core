"use client";

import type { ReactNode } from "react";
import { HoverCard } from "./HoverCard.js";
import { Tooltip } from "./Tooltip.js";

/**
 * The hover card an `Icon` with a `tooltip` opens. It lives apart so the
 * popover machinery (Animation, floating-ui) loads only for icons that have a
 * tooltip, not with every component that renders an icon.
 */
const IconTooltip = ({
  trigger,
  tooltip,
  placement,
}: {
  trigger: ReactNode;
  tooltip: ReactNode;
  placement: "top" | "bottom" | "left" | "right";
}) => (
  <HoverCard trigger={trigger} placement={placement} offsetDistance="4">
    <Tooltip label={tooltip} />
  </HoverCard>
);

export default IconTooltip;
