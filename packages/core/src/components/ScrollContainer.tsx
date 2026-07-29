"use client";

import React, { useRef, useState, useEffect, useCallback, forwardRef } from "react";
import { Column, Row, IconButton } from ".";

export interface ScrollContainerProps extends React.ComponentProps<typeof Row> {
  items: React.ReactNode[];
  controlPlacement?: "top-start" | "top-center" | "top-end" | "top-between" | "bottom-start" | "bottom-center" | "bottom-end" | "bottom-between";
}

const getHorizontalAlignment = (placement: ScrollContainerProps["controlPlacement"]) => {
  if (placement === "top-start" || placement === "bottom-start") return "start";
  if (placement === "top-end" || placement === "bottom-end") return "end";
  if (placement === "top-center" || placement === "bottom-center") return "center";
  if (placement === "top-between" || placement === "bottom-between") return "between";
  return "start";
};

const ScrollContainer = forwardRef<HTMLDivElement, ScrollContainerProps>(({ items, controlPlacement = "top-start", ...flex }, ref) => {
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

    const gap = parseFloat(getComputedStyle(element).gap) || 0;
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
    <Column fillWidth gap="8" direction={isTopPlacement ? "column" : "column-reverse"}>
      <Row fillWidth gap="8" paddingX="24" horizontal={horizontalAlignment}>
        <IconButton
          icon="chevronLeft"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          style={{ border: "none" }}
        />
        <IconButton
          icon="chevronRight"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          style={{ border: "none" }}
        />
      </Row>
      <Row
        ref={scrollRef}
        gap="8"
        overflowX="auto"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
        }}
      >
        {items.map((item, index) => (
          <Column
            key={index}
            maxWidth={48}
            minWidth={28}
            border
            radius="xl"
            overflow="hidden"
            gap="8"
            aspectRatio="3/4"
            style={{
              scrollSnapAlign: "start",
              flexShrink: 0,
            }}
            {...flex}
          >
            {item}
          </Column>
        ))}
      </Row>
    </Column>
  );
})

ScrollContainer.displayName = "ScrollContainer";
export { ScrollContainer };