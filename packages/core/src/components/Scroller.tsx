"use client";

import classNames from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { mergeLabels } from "../internal/labels.js";
import { Marquee } from "../internal/Marquee.js";
import { prefersReducedMotionNow } from "../internal/reducedMotion.js";
import { ScrollTrack, type ScrollTrackControlPlacement } from "../internal/ScrollTrack.js";
import type { RadiusSize, Speed } from "../types.js";
import type { Column } from "./Column.js";
import { BaseColor, Fade } from "./Fade.js";
import { Flex } from "./Flex.js";
import { IconButton } from "./IconButton.js";
import styles from "./Scroller.module.scss";

/** The scroll buttons' accessible names. Omitted fields keep the English default. */
interface ScrollerLabels {
  /** Defaults to `"Scroll Previous"`. */
  previous?: string;
  /** Defaults to `"Scroll Next"`. */
  next?: string;
}

const DEFAULT_LABELS: Required<ScrollerLabels> = {
  previous: "Scroll Previous",
  next: "Scroll Next",
};

/** Scroller `auto`: the children loop across on their own (2.x AutoScroll). */
interface ScrollerAuto {
  /**
   * A multiplier on the 20-second loop (`2` is twice as fast), or
   * `"slow"`/`"medium"`/`"fast"` (0.5, 1, 2). Defaults to `"medium"`.
   */
  speed?: Speed;
  /** What hovering does: slow the loop (the default), pause it, or nothing. */
  hover?: "slow" | "pause" | "none";
  /** Run the other way. */
  reverse?: boolean;
  /** Space after each copy of the children: a number is on the token scale, a string a CSS length. */
  gap?: number | string;
}

/**
 * Track mode (2.x ScrollContainer): set any of these and the children become
 * a run of tiles moved by a transform, with controls, drag, optional
 * wrap-around, markers and proximity scaling, instead of a scroll box.
 */
interface ScrollerTrackProps {
  /** Where the previous/next controls sit, above or below the track. */
  controlPlacement?: ScrollTrackControlPlacement;
  /** Wrap around: past the last item the track continues into the first. */
  infinite?: boolean;
  /** Markers for how many items there are and which is in front; `true` puts them opposite the controls. */
  markers?: boolean | "top" | "bottom";
  /** Drag the track with a pointer (mouse, pen or finger). On by default in track mode. */
  draggable?: boolean;
  /** Items moved per control press. */
  step?: number;
  /** Clip the track at its edges instead of letting tiles paint past them. */
  clip?: boolean;
  /** Scale tiles by their distance from the one in front; a number is the shrink per step (`0.08`). */
  proximity?: boolean | number;
  /** The item to bring to the front, by index. A command, not a lock: pair it with `onActiveChange`. */
  active?: number;
  /** Called with the index of the item that came to the front, however it got there. */
  onActiveChange?: (index: number) => void;
  /** Props for the box each item sits in: its size, aspect ratio, padding. */
  tile?: React.ComponentProps<typeof Column>;
}

interface ScrollerProps
  extends Omit<React.ComponentProps<typeof Flex>, "draggable">,
    ScrollerTrackProps {
  children?: React.ReactNode;
  direction?: "row" | "column";
  fadeColor?: BaseColor;
  onItemClick?: (index: number) => void;
  radius?: RadiusSize;
  /** The scroll buttons' accessible names, for a translated interface. */
  labels?: ScrollerLabels;
  /**
   * Loop the children across on their own, a marquee with no controls (2.x
   * AutoScroll). `true` uses the defaults; an object sets `speed`, `hover`,
   * `reverse` and `gap`.
   */
  auto?: boolean | ScrollerAuto;
}

const TRACK_PROPS = [
  "controlPlacement",
  "infinite",
  "markers",
  "draggable",
  "step",
  "clip",
  "proximity",
  "active",
  "onActiveChange",
  "tile",
] as const;

interface ScrollableChildProps {
  onClick?: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const ScrollBox = ({
  ref,
  children,
  direction = "row",
  fadeColor = "transparent",
  radius,
  className,
  style,
  onItemClick,
  labels,
  ...rest
}: Omit<ScrollerProps, "auto" | keyof ScrollerTrackProps>) => {
  const names = mergeLabels(DEFAULT_LABELS, labels);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [showPrevButton, setShowPrevButton] = useState<boolean>(false);
  const [showNextButton, setShowNextButton] = useState<boolean>(false);

  // Function to check and update scroll buttons visibility
  const updateScrollButtonsVisibility = () => {
    const scroller = scrollerRef.current;
    if (scroller) {
      const scrollPosition = direction === "row" ? scroller.scrollLeft : scroller.scrollTop;
      const maxScrollPosition =
        direction === "row"
          ? scroller.scrollWidth - scroller.clientWidth
          : scroller.scrollHeight - scroller.clientHeight;

      // Check if content is scrollable
      const isScrollable =
        direction === "row"
          ? scroller.scrollWidth > scroller.clientWidth
          : scroller.scrollHeight > scroller.clientHeight;

      setShowPrevButton(isScrollable && scrollPosition > 0);
      setShowNextButton(isScrollable && scrollPosition < maxScrollPosition - 1);
    }
  };

  // Handle scroll events
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) {
      // Initial check
      updateScrollButtonsVisibility();

      // Add scroll event listener
      scroller.addEventListener("scroll", updateScrollButtonsVisibility);
      // A strip that grows or shrinks (a resized window, a sidebar opening)
      // may start or stop overflowing without a scroll event.
      const resize =
        typeof ResizeObserver === "undefined"
          ? undefined
          : new ResizeObserver(() => updateScrollButtonsVisibility());
      resize?.observe(scroller);
      return () => {
        scroller.removeEventListener("scroll", updateScrollButtonsVisibility);
        resize?.disconnect();
      };
    }
  }, [direction]);

  // Re-check when children change
  useEffect(() => {
    // Use setTimeout to ensure DOM has updated
    const timer = setTimeout(() => {
      updateScrollButtonsVisibility();
    }, 100);

    return () => clearTimeout(timer);
  }, [children]);

  const handleScrollNext = () => {
    const scroller = scrollerRef.current;
    if (scroller) {
      const scrollAmount =
        direction === "row" ? scroller.clientWidth / 2 : scroller.clientHeight / 2;
      scroller.scrollBy({
        [direction === "row" ? "left" : "top"]: scrollAmount,
        behavior: prefersReducedMotionNow() ? "auto" : "smooth",
      });
    }
  };

  const handleScrollPrev = () => {
    const scroller = scrollerRef.current;
    if (scroller) {
      const scrollAmount =
        direction === "row" ? scroller.clientWidth / 2 : scroller.clientHeight / 2;
      scroller.scrollBy({
        [direction === "row" ? "left" : "top"]: -scrollAmount,
        behavior: prefersReducedMotionNow() ? "auto" : "smooth",
      });
    }
  };

  const wrappedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement<ScrollableChildProps>(child)) {
      const { onClick: childOnClick, onKeyDown: childOnKeyDown, ...otherProps } = child.props;

      return React.cloneElement(child, {
        ...otherProps,
        onClick: (e: React.MouseEvent) => {
          childOnClick?.(e);
          onItemClick?.(index);
        },
        onKeyDown: (e: React.KeyboardEvent) => {
          childOnKeyDown?.(e);
          // A native button (or a link, for Enter) already turns the key into
          // a click, which runs the onClick above: running it here as well
          // reported the item twice.
          const element = e.currentTarget as HTMLElement;
          const clicksNatively =
            element.tagName === "BUTTON" || (element.tagName === "A" && e.key === "Enter");
          if (!clicksNatively && (e.key === "Enter" || e.key === " ")) {
            childOnClick?.(e as any);
            onItemClick?.(index);
          }
        },
      });
    }
    return child;
  });

  // With no fade colour (the default) the strip's own edges fade out under
  // the buttons, a mask on the scroll box that reads on any background and
  // costs no blur. A colour paints a Fade over the edge instead, for a strip
  // that should melt into a known surface.
  const edgeMask = fadeColor === "transparent";
  const row = direction === "row";

  // A function, not a component: a component declared in here would be a
  // new type every render and remount the button, dropping its focus.
  const edge = (side: "start" | "end", children: React.ReactNode) => {
    const start = side === "start";
    const place = {
      position: "absolute" as const,
      padding: "4" as const,
      zIndex: 1 as const,
      horizontal: row ? (start ? undefined : ("end" as const)) : ("center" as const),
      vertical: row ? ("center" as const) : start ? ("start" as const) : ("end" as const),
      fillHeight: row,
      fillWidth: !row,
      left: row && start ? ("0" as const) : undefined,
      right: row && !start ? ("0" as const) : undefined,
      top: !row && start ? ("0" as const) : undefined,
      bottom: !row && !start ? ("0" as const) : undefined,
    };
    if (edgeMask) {
      return (
        <Flex {...place} fillWidth={false} fitWidth={row} pointerEvents="none">
          <Flex pointerEvents="auto">{children}</Flex>
        </Flex>
      );
    }
    // Rounded like the strip, so its corners do not show past a rounded box.
    const corner = radius
      ? row
        ? { [start ? "leftRadius" : "rightRadius"]: radius }
        : { [start ? "topRadius" : "bottomRadius"]: radius }
      : {};
    return (
      <Fade
        {...place}
        {...corner}
        base={fadeColor}
        to={row ? (start ? "right" : "left") : start ? "bottom" : "top"}
        width={row ? "4rem" : undefined}
        height={row ? undefined : "4rem"}
      >
        {children}
      </Fade>
    );
  };

  return (
    <Flex
      ref={ref}
      fillWidth
      className={classNames(styles.container, className)}
      style={style}
      {...rest}
    >
      {showPrevButton &&
        edge(
          "start",
          <IconButton
            icon={direction === "row" ? "chevronLeft" : "chevronUp"}
            onClick={handleScrollPrev}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleScrollPrev();
              }
            }}
            size="s"
            variant="secondary"
            aria-label={names.previous}
          />,
        )}
      <Flex
        fillWidth
        zIndex={0}
        radius={radius}
        direction={direction}
        className={classNames(styles.scroller, styles[direction], {
          [styles.fadeStart]: edgeMask && showPrevButton,
          [styles.fadeEnd]: edgeMask && showNextButton,
        })}
        ref={scrollerRef}
      >
        {wrappedChildren}
      </Flex>
      {showNextButton &&
        edge(
          "end",
          <IconButton
            icon={direction === "row" ? "chevronRight" : "chevronDown"}
            onClick={handleScrollNext}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleScrollNext();
              }
            }}
            size="s"
            variant="secondary"
            aria-label={names.next}
          />,
        )}
    </Flex>
  );
};

ScrollBox.displayName = "ScrollBox";

/**
 * A run of items wider (or taller) than its box. Three modes, one component:
 * - by default a scroll box with edge fades and previous/next buttons;
 * - `auto`: a marquee that loops the children on its own (2.x AutoScroll);
 * - track mode, when any of `infinite`, `markers`, `draggable`, `step`,
 *   `clip`, `proximity`, `active`, `onActiveChange`, `controlPlacement` or
 *   `tile` is set: a draggable carousel track (2.x ScrollContainer).
 */
const Scroller = ({ ref, auto, ...props }: ScrollerProps) => {
  if (auto) {
    const {
      children,
      direction: _direction,
      fadeColor: _fadeColor,
      onItemClick: _onItemClick,
      labels: _labels,
      ...flex
    } = props;
    for (const key of TRACK_PROPS) delete (flex as Record<string, unknown>)[key];
    const options = auto === true ? {} : auto;
    return (
      <Marquee
        ref={ref}
        speed={options.speed}
        hover={options.hover}
        reverse={options.reverse}
        scrollGap={options.gap}
        {...flex}
      >
        {children}
      </Marquee>
    );
  }
  if (TRACK_PROPS.some((key) => props[key] !== undefined)) {
    const {
      children,
      direction: _direction,
      fadeColor: _fadeColor,
      onItemClick: _onItemClick,
      labels: _labels,
      radius: _radius,
      ...track
    } = props;
    return <ScrollTrack ref={ref} items={React.Children.toArray(children)} {...track} />;
  }
  const box = { ...props };
  for (const key of TRACK_PROPS) delete (box as Record<string, unknown>)[key];
  return <ScrollBox ref={ref} {...box} />;
};

Scroller.displayName = "Scroller";

export type { ScrollerAuto, ScrollerLabels, ScrollerProps, ScrollerTrackProps };
export { Scroller };
