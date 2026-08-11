"use client";

import {
  type CSSProperties,
  forwardRef,
  isValidElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../classes/utils";
import { Column } from "./Column";
import type { FlexComponentProps } from "./Flex";
import { IconButton } from "./IconButton";
import { Row } from "./Row";

export interface ScrollContainerProps extends FlexComponentProps {
  items: ReactNode[];
  controlPlacement?:
    | "top-start"
    | "top-center"
    | "top-end"
    | "top-between"
    | "bottom-start"
    | "bottom-center"
    | "bottom-end"
    | "bottom-between";
  className?: string;
  style?: CSSProperties;
}

const getHorizontalAlignment = (placement: ScrollContainerProps["controlPlacement"]) => {
  if (placement === "top-start" || placement === "bottom-start") return "start";
  if (placement === "top-end" || placement === "bottom-end") return "end";
  if (placement === "top-center" || placement === "bottom-center") return "center";
  if (placement === "top-between" || placement === "bottom-between") return "between";
  return "start";
};

const ScrollContainer = forwardRef<HTMLDivElement, ScrollContainerProps>(
  ({ items = [], controlPlacement = "top-start", className, style, ...flex }, ref) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollPosition = useCallback(() => {
      const element = scrollRef.current;
      if (!element) return;

      const { scrollLeft, scrollWidth, clientWidth } = element;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }, []);

    useEffect(() => {
      const element = scrollRef.current;
      if (!element) return;

      checkScrollPosition();

      element.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);

      return () => {
        element.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }, [checkScrollPosition]);

    const scroll = (direction: "left" | "right") => {
      const element = scrollRef.current;
      if (!element) return;

      const firstChild = element.firstElementChild as HTMLElement;
      if (!firstChild) return;

      const gap = Number.parseFloat(getComputedStyle(element).gap) || 0;
      const tileWidth = firstChild.offsetWidth + gap;
      const targetScroll = element.scrollLeft + (direction === "right" ? tileWidth : -tileWidth);

      element.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    };

    const isTopPlacement = controlPlacement.startsWith("top");
    const horizontalAlignment = getHorizontalAlignment(controlPlacement);

    return (
      <Column
        ref={ref}
        fillWidth
        gap="8"
        direction={isTopPlacement ? "column" : "column-reverse"}
        className={cn("w-full", className)}
        style={style}
      >
        <Row fillWidth gap="8" paddingX="24" horizontal={horizontalAlignment}>
          <IconButton
            icon="chevronLeft"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="border-none"
            style={{ border: "none" }}
          />
          <IconButton
            icon="chevronRight"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="border-none"
            style={{ border: "none" }}
          />
        </Row>
        <Row
          ref={scrollRef}
          gap="8"
          overflowX="auto"
          className="snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, index) => {
            const itemKey =
              isValidElement(item) && item.key != null ? item.key : `scroll-item-${index}`;

            return (
              <Column
                key={itemKey}
                maxWidth={48}
                minWidth={28}
                border
                radius="xl"
                overflow="hidden"
                gap="8"
                aspectRatio="3/4"
                className="snap-start shrink-0"
                {...flex}
              >
                {item}
              </Column>
            );
          })}
        </Row>
      </Column>
    );
  },
);

ScrollContainer.displayName = "ScrollContainer";

export { ScrollContainer };
