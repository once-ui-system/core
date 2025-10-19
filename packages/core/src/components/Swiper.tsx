"use client";

import { Flex, Media, Column, Row, IconButton } from ".";
import { useEffect, useState, useRef, useCallback } from "react";
import styles from "./Swiper.module.scss";

interface SwiperItem {
  slide: string | React.ReactNode;
  alt?: string;
}

interface SwiperProps extends React.ComponentProps<typeof Flex> {
  items: SwiperItem[];
  controls?: boolean | "contained";
  priority?: boolean;
  fill?: boolean;
  aspectRatio?: string;
  sizes?: string;
  indicator?: boolean;
}

const Swiper: React.FC<SwiperProps> = ({
  items = [],
  fill = false,
  controls = true,
  priority = false,
  indicator = true,
  aspectRatio = "16 / 9",
  sizes,
  ...rest
}) => {
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
      const newIndex = Math.round(scrollLeft / slideWidth);
      
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < items.length) {
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
        if (entry.isIntersecting) {
          const index = slideRefs.current.indexOf(entry.target as HTMLDivElement);
          if (index !== -1 && index !== activeIndex) {
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

  const handlePrevClick = () => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    }
  };

  const handleNextClick = () => {
    if (activeIndex < items.length - 1) {
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
        behavior: 'smooth'
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
    <Column fillWidth fillHeight={fill} aspectRatio={undefined} style={{ isolation: "isolate" }} {...rest}>
      <Flex
        fillWidth
        fillHeight={fill}
        aspectRatio={aspectRatio === "original" ? undefined : aspectRatio}
        className={styles.carouselContainer}
      >
        {/* Container wrapper with radius and border */}
        <Flex
          fillWidth
          fillHeight={fill}
          radius={rest.radius || "l"}
          border={rest.border || "neutral-alpha-weak"}
          overflow="hidden"
        >
          {/* Scroll Container */}
          <Row
            ref={scrollContainerRef}
            fillWidth
            fillHeight={fill}
            className={styles.scrollContainer}
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
              fillHeight={fill}
              className={styles.slide}
              style={{
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                flexShrink: 0,
              }}
            >
              {typeof item.slide === "string" ? (
                <Media
                  fill={fill}
                  sizes={sizes}
                  priority={priority && index === 0}
                  aspectRatio={fill ? undefined : aspectRatio === "auto" ? undefined : aspectRatio}
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
                  aspectRatio={fill ? undefined : aspectRatio === "auto" ? undefined : aspectRatio}
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
        </Flex>

        {/* Navigation Controls */}
        {controls && items.length > 1 && (
          <>
            {/* Previous Button */}
            {activeIndex > 0 && (
              <Flex
                position="absolute"
                left="16"
                zIndex={1}
                className={styles.navButton}
                style={{ top: "50%", transform: "translateY(-50%)" }}
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
            )}

            {/* Next Button */}
            {activeIndex < items.length - 1 && (
              <Flex
                position="absolute"
                right="16"
                zIndex={1}
                className={styles.navButton}
                style={{ top: "50%", transform: "translateY(-50%)" }}
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
            )}
          </>
        )}
      </Flex>

      {/* Dot Indicators */}
      {indicator && items.length > 1 && (
        <Row
          gap="8" fillWidth horizontal="center" paddingX="16"
          paddingTop={controls === "contained" ? undefined : "12"}
          position={controls === "contained" ? "absolute" : "relative"}
          bottom={controls === "contained" ? "16" : undefined}
          style={{
            transform: controls === "contained" ? "translateY(-100%)" : undefined,
          }}>
          {items.map((_, index) => (
            <Flex
              key={index}
              radius="full"
              cursor="interactive"
              onClick={() => handleDotClick(index)}
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
};

Swiper.displayName = "Swiper";
export { Swiper };
