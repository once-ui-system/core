"use client";

import classNames from "clsx";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { mergeLabels } from "../internal/labels";
import { RadiusSize } from "../types";
import { BaseColor, Fade } from "./Fade";
import { Flex } from "./Flex";
import { IconButton } from "./IconButton";
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

interface ScrollerProps extends React.ComponentProps<typeof Flex> {
  children?: React.ReactNode;
  direction?: "row" | "column";
  fadeColor?: BaseColor;
  onItemClick?: (index: number) => void;
  radius?: RadiusSize;
  /** The scroll buttons' accessible names, for a translated interface. */
  labels?: ScrollerLabels;
}

interface ScrollableChildProps {
  onClick?: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const Scroller = forwardRef<HTMLDivElement, ScrollerProps>(
  (
    {
      children,
      direction = "row",
      fadeColor = "transparent",
      radius,
      className,
      style,
      onItemClick,
      labels,
      ...rest
    },
    ref,
  ) => {
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
        return () => scroller.removeEventListener("scroll", updateScrollButtonsVisibility);
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
          behavior: "smooth",
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
          behavior: "smooth",
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
            if (e.key === "Enter" || e.key === " ") {
              childOnClick?.(e as any);
              onItemClick?.(index);
            }
          },
        });
      }
      return child;
    });

    return (
      <Flex fillWidth className={classNames(styles.container, className)} style={style} {...rest}>
        {showPrevButton && (
          <Fade
            base={fadeColor}
            position="absolute"
            padding="4"
            horizontal={direction === "column" ? "center" : undefined}
            vertical={direction === "column" ? "start" : "center"}
            to={direction === "row" ? "right" : "bottom"}
            width={direction === "row" ? 4 : undefined}
            height={direction === "column" ? 4 : undefined}
            fillHeight={direction === "row"}
            fillWidth={direction === "column"}
            left={direction === "row" ? "0" : undefined}
            top={direction === "column" ? "0" : undefined}
            zIndex={1}
          >
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
            />
          </Fade>
        )}
        <Flex
          fillWidth
          zIndex={0}
          radius={radius}
          direction={direction}
          className={classNames(styles.scroller, styles[direction])}
          ref={scrollerRef}
        >
          {wrappedChildren}
        </Flex>
        {showNextButton && (
          <Fade
            base={fadeColor}
            padding="4"
            position="absolute"
            horizontal={direction === "column" ? "center" : "end"}
            vertical={direction === "column" ? "end" : "center"}
            to={direction === "row" ? "left" : "top"}
            width={direction === "row" ? 4 : undefined}
            height={direction === "column" ? 4 : undefined}
            fillHeight={direction === "row"}
            fillWidth={direction === "column"}
            right={direction === "row" ? "0" : undefined}
            bottom={direction === "column" ? "0" : undefined}
            zIndex={1}
          >
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
            />
          </Fade>
        )}
      </Flex>
    );
  },
);

Scroller.displayName = "Scroller";

export type { ScrollerLabels, ScrollerProps };
export { Scroller };
