"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { useScrollableTabStop } from "../internal/scrollableTabStop";
import { Column } from "./Column";
import { Flex } from "./Flex";
import { IconButton } from "./IconButton";
import { Media } from "./Media";
import { Row } from "./Row";
import styles from "./Swiper.module.scss";

interface SwiperItem {
  slide: string | React.ReactNode;
  alt?: string;
}

interface SwiperProps extends React.ComponentProps<typeof Flex> {
  items: SwiperItem[];
  controls?: boolean | "contained";
  priority?: boolean;
  /**
   * Drop the intrinsic aspect ratio and let the slides stretch to whatever box
   * they are in. Named `stretch` rather than `fill` because `fill` is a layout
   * prop on every Flex-derived component, and shadowing it here meant `fill`
   * did not do the one thing its name promised.
   */
  stretch?: boolean;
  aspectRatio?: string;
  /** Passed to `Media`: a `sizes` string, or a number as shorthand for a max width in px. */
  sizes?: string | number;
  unoptimized?: boolean;
  indicator?: boolean;
}

const Swiper = forwardRef<HTMLDivElement, SwiperProps>(
  (
    {
      items = [],
      stretch = false,
      controls = true,
      priority = false,
      indicator = true,
      aspectRatio = "16 / 9",
      sizes,
      unoptimized = false,
      ...rest
    },
    ref,
  ) => {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    // The track scrolls sideways; a keyboard reaches it to scroll with arrows.
    const scrollTabStopRef = useScrollableTabStop(scrollContainerRef);
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
        const newIndex = Math.round(scrollLeft / slideWidth);

        if (newIndex >= 0 && newIndex < items.length) {
          setActiveIndex(newIndex);
        }
      };

      // Use Intersection Observer for more accurate detection
      const observerOptions = {
        root: container,
        threshold: 0.5,
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          // isIntersecting is also true for a neighbour that only touches the
          // edge, so only a slide that is at least half in view counts.
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const index = slideRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        });
      }, observerOptions);

      slideRefs.current.forEach((slide) => {
        if (slide) observer.observe(slide);
      });

      container.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        observer.disconnect();
        container.removeEventListener("scroll", handleScroll);
      };
    }, [items.length]);

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

    // Previous and Next leave at the ends. When the one that has focus goes,
    // focus moves to the other instead of falling back to the page.
    const prevButtonRef = useRef<HTMLButtonElement>(null);
    const nextButtonRef = useRef<HTMLButtonElement>(null);
    const refocusNav = useRef<"prev" | "next" | null>(null);

    useEffect(() => {
      const target = refocusNav.current;
      if (!target) return;
      const gone = target === "prev" ? activeIndex === 0 : activeIndex === items.length - 1;
      if (!gone) return;
      refocusNav.current = null;
      const active = document.activeElement;
      if (active && active !== document.body) return;
      (target === "prev" ? nextButtonRef : prevButtonRef).current?.focus();
    }, [activeIndex, items.length]);

    const handlePrevClick = () => {
      if (activeIndex > 0) {
        if (activeIndex === 1) refocusNav.current = "prev";
        scrollToIndex(activeIndex - 1);
      }
    };

    const handleNextClick = () => {
      if (activeIndex < items.length - 1) {
        if (activeIndex === items.length - 2) refocusNav.current = "next";
        scrollToIndex(activeIndex + 1);
      }
    };

    const handleDotClick = (index: number) => {
      scrollToIndex(index);
    };

    // Drag-to-scroll handlers
    const handleMouseDown = (e: React.MouseEvent) => {
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
        const nearestIndex = Math.round(currentScroll / slideWidth);
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
        fillHeight={stretch}
        aspectRatio={undefined}
        style={{ isolation: "isolate" }}
        {...rest}
      >
        <Flex
          fillWidth
          fillHeight={stretch}
          aspectRatio={aspectRatio === "original" ? undefined : aspectRatio}
          className={styles.carouselContainer}
        >
          {/* Container wrapper with radius and border */}
          <Flex
            fillWidth
            fillHeight={stretch}
            radius={rest.radius || "l"}
            border={rest.border || "neutral-alpha-weak"}
            overflow="hidden"
            position="relative"
          >
            {/* Scroll Container */}
            <Row
              ref={scrollTabStopRef}
              fillWidth
              fillHeight={stretch}
              className={`${styles.scrollContainer} focus-ring`}
              onMouseDown={handleMouseDown}
              overflowX="auto"
              style={{
                scrollSnapType: scrollSnapType,
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
                cursor: isDragging ? "grabbing" : "grab",
                userSelect: "none",
              }}
            >
              {items.map((item, index) => (
                <Flex
                  key={index}
                  ref={(el) => {
                    slideRefs.current[index] = el;
                  }}
                  fillWidth
                  fillHeight={stretch}
                  className={styles.slide}
                  style={{
                    scrollSnapAlign: "start",
                    scrollSnapStop: "always",
                    flexShrink: 0,
                  }}
                >
                  {typeof item.slide === "string" ? (
                    <Media
                      stretch={stretch}
                      sizes={sizes}
                      unoptimized={unoptimized}
                      priority={priority && index === 0}
                      aspectRatio={
                        stretch ? undefined : aspectRatio === "auto" ? undefined : aspectRatio
                      }
                      src={item.slide as string}
                      alt={item.alt || ""}
                      onDragStart={(e) => e.preventDefault()}
                      style={{
                        userSelect: "none",
                      }}
                    />
                  ) : (
                    <Flex
                      fill
                      aspectRatio={
                        stretch ? undefined : aspectRatio === "auto" ? undefined : aspectRatio
                      }
                      onDragStart={(e) => e.preventDefault()}
                      style={{
                        userSelect: "none",
                      }}
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
                    <Flex
                      position="absolute"
                      left="16"
                      zIndex={1}
                      className={styles.navButton}
                      style={{ top: "50%", transform: "translateY(-50%)" }}
                    >
                      <Flex radius="m" background="surface">
                        <IconButton
                          ref={prevButtonRef}
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
                    <Flex
                      position="absolute"
                      right="16"
                      zIndex={1}
                      className={styles.navButton}
                      style={{ top: "50%", transform: "translateY(-50%)" }}
                    >
                      <Flex radius="m" background="surface">
                        <IconButton
                          ref={nextButtonRef}
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
            fillWidth
            horizontal="center"
            paddingX="16"
            // 8px less than before on each side: the 24px buttons hold the dots
            // where the 8px dots sat.
            paddingTop={controls === "contained" ? undefined : "4"}
            position={controls === "contained" ? "absolute" : "relative"}
            bottom={controls === "contained" ? "8" : undefined}
            style={{
              transform: controls === "contained" ? "translateY(-100%)" : undefined,
            }}
          >
            {items.map((_, index) => (
              // The dot is 8px; the button around it is 24px, the smallest
              // target WCAG 2.2 allows (axe: target-size).
              <Flex
                key={index}
                width="24"
                height="24"
                center
                radius="full"
                cursor="interactive"
                className="focus-ring"
                onClick={() => handleDotClick(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={activeIndex === index ? "true" : undefined}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleDotClick(index);
                  }
                }}
              >
                <Flex
                  radius="full"
                  width="8"
                  height="8"
                  style={{
                    background:
                      activeIndex === index
                        ? "var(--neutral-on-background-strong)"
                        : "var(--neutral-alpha-medium)",
                    transition: "background 0.3s ease, transform 0.3s ease",
                    transform: activeIndex === index ? "scale(1.2)" : "scale(1)",
                  }}
                />
              </Flex>
            ))}
          </Row>
        )}
      </Column>
    );
  },
);

Swiper.displayName = "Swiper";

export { Swiper };
