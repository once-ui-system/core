"use client";

import { forwardRef } from "react";
import { CursorFollower, type CursorFollowerProps } from "../internal/CursorFollower";
import { HoverCover } from "../internal/HoverCover";
import type { Placement } from "../types";
import { Animation, type AnimationProps } from "./Animation";

interface HoverCardProps extends Omit<AnimationProps, "triggerType" | "portal" | "placement"> {
  /**
   * Where the card appears. A side (`"top"`, the default, `"bottom-start"`…)
   * floats it beside the trigger in a portal. `"cursor"` follows the pointer
   * while it is over the trigger (2.x `CursorCard`). `"cover"` draws it over
   * the trigger itself, filling its box (2.x `Hover`).
   */
  placement?: Placement | "cursor" | "cover";
  /**
   * With `placement="cursor"`: which side of the pointer the card sits on.
   * Defaults to `"bottom-left"`, below and to the left of the pointer.
   */
  cursorPlacement?: CursorFollowerProps["placement"];
  /** With `placement="cover"`: milliseconds before the card hides after the pointer or focus leaves. */
  hideDelay?: number;
  /** With `placement="cover"`: the card takes pointer events (links and buttons in it work). */
  interactive?: boolean;
  /** With `placement="cover"`: never show the card. */
  disabled?: boolean;
}

/** Animation-only props, which the cursor and cover cards do not take. */
const ANIMATION_ONLY = [
  "fade",
  "scale",
  "blur",
  "slideUp",
  "slideDown",
  "slideLeft",
  "slideRight",
  "zoomIn",
  "zoomOut",
  "active",
  "duration",
  "easing",
  "transformOrigin",
  "childrenPosition",
  "reverse",
  "offsetDistance",
] as const;

/**
 * Rich, interactive content revealed on hover or focus of a `trigger`: a
 * profile preview, a link card. For a sentence of plain text, use `Tooltip`.
 */
const HoverCard = forwardRef<HTMLDivElement, HoverCardProps>(
  (
    { children, placement = "top", cursorPlacement, hideDelay, interactive, disabled, ...props },
    ref,
  ) => {
    if (placement === "cover" || placement === "cursor") {
      const { trigger, delay, touch, ...flex } = props;
      for (const key of ANIMATION_ONLY) delete (flex as Record<string, unknown>)[key];
      if (placement === "cover") {
        return (
          <HoverCover
            ref={ref}
            trigger={trigger}
            overlay={children}
            delay={delay}
            hideDelay={hideDelay}
            interactive={interactive}
            disabled={disabled}
            touch={touch}
            {...flex}
          />
        );
      }
      return (
        <CursorFollower
          ref={ref}
          trigger={trigger}
          overlay={children}
          placement={cursorPlacement}
          {...flex}
        />
      );
    }
    return (
      <Animation
        ref={ref}
        fade={0}
        slideUp="0.5rem"
        scale={0.9}
        duration={200}
        triggerType="hover"
        placement={placement}
        portal
        {...props}
      >
        {children}
      </Animation>
    );
  },
);

HoverCard.displayName = "HoverCard";

export type { HoverCardProps };
export { HoverCard };
