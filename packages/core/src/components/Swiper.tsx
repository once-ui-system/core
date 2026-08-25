"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../classes/utils";
import { Column } from "./Column";
import { Fade } from "./Fade";
import { Flex, type FlexComponentProps } from "./Flex";
import { IconButton } from "./IconButton";
import { Media } from "./Media";
import { Row } from "./Row";

export const swiperVariants = cva("isolate");

export const swiperContainerVariants = cva("group/swiper");

export const swiperScrollContainerVariants = cva(
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none [-webkit-overflow-scrolling:touch]",
);

export const swiperSlideVariants = cva("shrink-0 select-none snap-start [scroll-snap-stop:always]");

export const swiperNavButtonVariants = cva(
  "opacity-0 pointer-events-none transition-opacity duration-300 [@media(hover:none)]:hidden group-hover/swiper:opacity-100 group-hover/swiper:pointer-events-auto group-focus-within/swiper:opacity-100 group-focus-within/swiper:pointer-events-auto",
);

export const swiperDotVariants = cva("transition-[background-color,transform] duration-300", {
  variants: {
    active: {
      true: "bg-neutral-on-background-strong scale-[1.2]",
      false: "bg-neutral-alpha-medium scale-100",
    },
  },
  defaultVariants: {
    active: false,
  },
});

export interface SwiperItem {
  slide: string | ReactNode;
  alt?: string;
}

export interface SwiperProps extends Omit<FlexComponentProps, "children"> {
  items: SwiperItem[];
  controls?: boolean | "contained";
  priority?: boolean;
  fill?: boolean;
  aspectRatio?: string;
  sizes?: string;
  unoptimized?: boolean;
  indicator?: boolean;
  className?: string;
  style?: CSSProperties;
}

const Swiper = forwardRef<HTMLDivElement, SwiperProps>(
  (
    {
      items = [],
      fill = false,
      controls = true,
      priority = false,
      indicator = true,
      aspectRatio = "16 / 9",
      sizes,
      unoptimized = false,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
    const isScrollingProgrammatically = useRef(false);
    const dragStartX = useRef(0);
    const scrollStartLeft = useRef(0);
    const [scrollSnapType, setScrollSnapType] = useState<string>("x mandatory");

    // Observe scroll position to update active index
    useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const handleScroll = () => {
        if (isScrollingProgrammatically.current) return;

        const scrollLeft = container.scrollLeft;
        const slideWidth = container.clientWidth;
        if (slideWidth === 0) return;
        const newIndex = Math.round(scrollLeft / slideWidth);

        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < items.length) {
          setActiveIndex(newIndex);
        }
      };

      // Use Intersection Observer for more accurate detection
      let observer: IntersectionObserver | undefined;
      if (typeof IntersectionObserver !== "undefined") {
        const observerOptions = {
          root: container,
          threshold: 0.5,
        };

        observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = slideRefs.current.indexOf(entry.target as HTMLDivElement);
              if (index !== -1 && index !== activeIndex) {
                setActiveIndex(index);
              }
            }
          });
        }, observerOptions);

        slideRefs.current.forEach((slide) => {
          if (slide) observer?.observe(slide);
        });
      }

      container.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        if (observer) observer.disconnect();
        container.removeEventListener("scroll", handleScroll);
      };
    }, [activeIndex, items.length]);

    const scrollToIndex = useCallback((index: number) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      isScrollingProgrammatically.current = true;
      const slideWidth = container.clientWidth;

      container.scrollTo({
        left: slideWidth * index,
        behavior: "smooth",
      });

      // Reset flag after scroll animation completes
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
        setActiveIndex(index);
      }, 500);
    }, []);

    const handlePrevClick = useCallback(() => {
      if (activeIndex > 0) {
        scrollToIndex(activeIndex - 1);
      }
    }, [activeIndex, scrollToIndex]);

    const handleNextClick = useCallback(() => {
      if (activeIndex < items.length - 1) {
        scrollToIndex(activeIndex + 1);
      }
    }, [activeIndex, items.length, scrollToIndex]);

    const handleDotClick = useCallback(
      (index: number) => {
        scrollToIndex(index);
      },
      [scrollToIndex],
    );

    // Drag-to-scroll handlers
    const handleMouseDown = (e: ReactMouseEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      setIsDragging(true);
      setScrollSnapType("none"); // Disable snap during drag
      dragStartX.current = e.pageX;
      scrollStartLeft.current = container.scrollLeft;
    };

    // Use native event listeners for global mouse tracking
    useEffect(() => {
      if (!isDragging) return;

      const container = scrollContainerRef.current;
      if (!container) return;

      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        const x = e.pageX;
        const walk = (dragStartX.current - x) * 1.5; // Drag sensitivity
        container.scrollLeft = scrollStartLeft.current + walk;
      };

      const handleMouseUp = () => {
        // Find the nearest slide and snap to it
        const slideWidth = container.clientWidth;
        const currentScroll = container.scrollLeft;
        const nearestIndex = Math.round(currentScroll / (slideWidth || 1));
        const targetScroll = nearestIndex * slideWidth;

        // Smooth scroll to nearest slide
        container.scrollTo({
          left: targetScroll,
          behavior: "smooth",
        });

        setActiveIndex(nearestIndex);
        setIsDragging(false);

        // Re-enable snap after a brief delay to let smooth scroll complete
        setTimeout(() => {
          setScrollSnapType("x mandatory");
        }, 300);
      };

      // Add global listeners to track mouse anywhere
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }, [isDragging]);

    if (items.length === 0) {
      return null;
    }

    return (
      <Column
        ref={ref}
        fillWidth
        fillHeight={fill}
        aspectRatio={undefined}
        className={cn(swiperVariants(), className)}
        style={style}
        {...rest}
      >
        <Flex
          fillWidth
          fillHeight={fill}
          aspectRatio={aspectRatio === "original" ? undefined : aspectRatio}
          className={swiperContainerVariants()}
        >
          {/* Container wrapper with radius and border */}
          <Flex
            fillWidth
            fillHeight={fill}
            radius={rest.radius || "l"}
            border={rest.border || "neutral-alpha-weak"}
            overflow="hidden"
            position="relative"
          >
            {/* Scroll Container */}
            <Row
              ref={scrollContainerRef}
              fillWidth
              fillHeight={fill}
              className={swiperScrollContainerVariants()}
              onMouseDown={handleMouseDown}
              overflowX="auto"
              cursor={isDragging ? "grabbing" : "grab"}
              style={{
                scrollSnapType: scrollSnapType,
              }}
            >
              {items.map((item, index) => (
                <Flex
                  // biome-ignore lint/suspicious/noArrayIndexKey: Swiper items may be anonymous or static
                  key={index}
                  ref={(el) => {
                    slideRefs.current[index] = el;
                  }}
                  fillWidth
                  fillHeight={fill}
                  className={swiperSlideVariants()}
                >
                  {typeof item.slide === "string" ? (
                    <Media
                      fill={fill}
                      sizes={sizes}
                      unoptimized={unoptimized}
                      priority={priority && index === 0}
                      aspectRatio={
                        fill ? undefined : aspectRatio === "auto" ? undefined : aspectRatio
                      }
                      src={item.slide}
                      alt={item.alt || ""}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  ) : (
                    <Flex
                      fill
                      aspectRatio={
                        fill ? undefined : aspectRatio === "auto" ? undefined : aspectRatio
                      }
                      onDragStart={(e) => e.preventDefault()}
                    >
                      {item.slide}
                    </Flex>
                  )}
                </Flex>
              ))}
            </Row>

            {/* Navigation Controls */}
            {controls && items.length > 1 && (
              <>
                {/* Previous Button */}
                {activeIndex > 0 && (
                  <>
                    <Fade
                      transition="micro-medium"
                      position="absolute"
                      left="0"
                      top="0"
                      base="transparent"
                      to="right"
                      fillHeight
                      maxWidth={6}
                      zIndex={1}
                    />
                    <Flex
                      position="absolute"
                      left="16"
                      top="50%"
                      translateY="-50%"
                      zIndex={1}
                      className={swiperNavButtonVariants()}
                    >
                      <Flex radius="l" background="surface" overflow="hidden">
                        <IconButton
                          onClick={handlePrevClick}
                          variant="secondary"
                          icon="chevronLeft"
                          aria-label="Previous slide"
                        />
                      </Flex>
                    </Flex>
                  </>
                )}

                {/* Next Button */}
                {activeIndex < items.length - 1 && (
                  <>
                    <Fade
                      transition="micro-medium"
                      position="absolute"
                      right="0"
                      top="0"
                      base="transparent"
                      to="left"
                      fillHeight
                      zIndex={1}
                      maxWidth={6}
                    />
                    <Flex
                      position="absolute"
                      right="16"
                      top="50%"
                      translateY="-50%"
                      zIndex={1}
                      className={swiperNavButtonVariants()}
                    >
                      <Flex radius="l" background="surface" overflow="hidden">
                        <IconButton
                          onClick={handleNextClick}
                          variant="secondary"
                          icon="chevronRight"
                          aria-label="Next slide"
                        />
                      </Flex>
                    </Flex>
                  </>
                )}
              </>
            )}
          </Flex>
        </Flex>

        {/* Dot Indicators */}
        {indicator && items.length > 1 && (
          <Row
            gap="8"
            fillWidth
            horizontal="center"
            paddingX="16"
            paddingTop={controls === "contained" ? undefined : "12"}
            position={controls === "contained" ? "absolute" : "relative"}
            bottom={controls === "contained" ? "16" : undefined}
            translateY={controls === "contained" ? "-100%" : undefined}
          >
            {items.map((_, index) => (
              <Flex
                // biome-ignore lint/suspicious/noArrayIndexKey: Swiper items may be anonymous or static
                key={index}
                radius="full"
                cursor="interactive"
                onClick={() => handleDotClick(index)}
                width="8"
                height="8"
                className={swiperDotVariants({ active: activeIndex === index })}
                aria-label={`Go to slide ${index + 1}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleDotClick(index);
                  }
                }}
              />
            ))}
          </Row>
        )}
      </Column>
    );
  },
);

Swiper.displayName = "Swiper";

export { Swiper };
