"use client";

import {
  Children,
  type CSSProperties,
  cloneElement,
  forwardRef,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../classes/utils";
import type { RadiusSize } from "../types";
import { type BaseColor, Fade } from "./Fade";
import { Flex, type FlexComponentProps } from "./Flex";
import { IconButton } from "./IconButton";

export interface ScrollerProps extends FlexComponentProps {
  children?: ReactNode;
  direction?: "row" | "column";
  fadeColor?: BaseColor;
  onItemClick?: (index: number) => void;
  radius?: RadiusSize;
  className?: string;
  style?: CSSProperties;
}

interface ScrollableChildProps {
  onClick?: (e: MouseEvent) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
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
      ...rest
    },
    ref,
  ) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [showPrevButton, setShowPrevButton] = useState<boolean>(false);
    const [showNextButton, setShowNextButton] = useState<boolean>(false);

    // Function to check and update scroll buttons visibility
    const updateScrollButtonsVisibility = useCallback(() => {
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
    }, [direction]);

    // Handle scroll events
    useEffect(() => {
      const scroller = scrollerRef.current;
      if (scroller) {
        // Initial check
        updateScrollButtonsVisibility();

        // Add scroll event listener
        scroller.addEventListener("scroll", updateScrollButtonsVisibility);
        window.addEventListener("resize", updateScrollButtonsVisibility);
        return () => {
          scroller.removeEventListener("scroll", updateScrollButtonsVisibility);
          window.removeEventListener("resize", updateScrollButtonsVisibility);
        };
      }
    }, [updateScrollButtonsVisibility]);

    // Re-check when children change
    // biome-ignore lint/correctness/useExhaustiveDependencies: recalculate scroll button visibility when children change
    useEffect(() => {
      // Use setTimeout to ensure DOM has updated
      const timer = setTimeout(() => {
        updateScrollButtonsVisibility();
      }, 100);

      return () => clearTimeout(timer);
    }, [children, updateScrollButtonsVisibility]);

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

    const wrappedChildren = Children.map(children, (child, index) => {
      if (isValidElement<ScrollableChildProps>(child)) {
        const { onClick: childOnClick, onKeyDown: childOnKeyDown, ...otherProps } = child.props;

        return cloneElement(child, {
          ...otherProps,
          onClick: (e: MouseEvent) => {
            childOnClick?.(e);
            onItemClick?.(index);
          },
          onKeyDown: (e: KeyboardEvent) => {
            childOnKeyDown?.(e);
            if (e.key === "Enter" || e.key === " ") {
              childOnClick?.(e as unknown as MouseEvent);
              onItemClick?.(index);
            }
          },
        });
      }
      return child;
    });

    return (
      <Flex ref={ref} fillWidth className={cn("isolate", className)} style={style} {...rest}>
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
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleScrollPrev();
                }
              }}
              size="s"
              variant="secondary"
              aria-label="Scroll Previous"
            />
          </Fade>
        )}
        <Flex
          fillWidth
          zIndex={0}
          radius={radius}
          direction={direction}
          className={cn(
            "isolate [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            direction === "row" ? "overflow-x-auto" : "overflow-y-auto",
          )}
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
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleScrollNext();
                }
              }}
              size="s"
              variant="secondary"
              aria-label="Scroll Next"
            />
          </Fade>
        )}
      </Flex>
    );
  },
);

Scroller.displayName = "Scroller";

export { Scroller };
