"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "../internal/Reveal.js";
import { SnapCarousel } from "../internal/SnapCarousel.js";
import { CSSUnit, SpacingToken } from "../types.js";
import styles from "./Carousel.module.scss";
import { Column } from "./Column.js";
import { Flex } from "./Flex.js";
import { IconButton } from "./IconButton.js";
import { Media } from "./Media.js";
import { Row } from "./Row.js";
import { Scroller } from "./Scroller.js";

interface CarouselItem {
  slide: string | React.ReactNode;
  alt?: string;
}

interface ThumbnailItem {
  scaling?: number;
  height?: SpacingToken | number | CSSUnit;
  /** Passed to `Media`: a `sizes` string, or a number as shorthand for a max width in px. */
  sizes?: string | number;
}

interface CarouselProps extends React.ComponentProps<typeof Flex> {
  items: CarouselItem[];
  /**
   * How slides change. `"fade"` (the default) cross-fades one slide into the
   * next, with line or thumbnail indicators and autoplay. `"snap"` is a
   * touch-first track the slides scroll along with native snapping, drag and
   * dots (2.x `Swiper`); its `aspectRatio` defaults to `"16 / 9"`, and
   * `translateY`, `defaultRevealed`, `thumbnail` and `play` do not apply.
   */
  mode?: "fade" | "snap";
  /** Show the previous/next arrows. `"contained"` (snap mode) draws the dots over the slides. */
  controls?: boolean | "contained";
  priority?: boolean;
  /**
   * Drop the intrinsic aspect ratio and let the slides stretch to whatever box
   * they are in. Named `stretch` rather than `fill` because `fill` is a layout
   * prop on every Flex-derived component, and shadowing it here meant `fill`
   * did not do the one thing its name promised.
   */
  stretch?: boolean;
  indicator?: "line" | "thumbnail" | false;
  translateY?: SpacingToken | number | CSSUnit;
  aspectRatio?: string;
  /** Passed to `Media`: a `sizes` string, or a number as shorthand for a max width in px. */
  sizes?: string | number;
  unoptimized?: boolean;
  defaultRevealed?: boolean;
  thumbnail?: ThumbnailItem;
  play?: {
    auto?: boolean;
    interval?: number;
    controls?: boolean;
    progress?: boolean;
  };
}

const FadeCarousel = ({
  ref,
  items = [],
  stretch = false,
  controls = true,
  priority = false,
  indicator = "line",
  translateY,
  aspectRatio = "original",
  sizes,
  unoptimized = false,
  defaultRevealed = false,
  thumbnail = { scaling: 1, height: "80", sizes: "120px" },
  play = { auto: false, interval: 3000, controls: true },
  ...flex
}: CarouselProps) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [hoverIndex, setHoverIndex] = useState<number | undefined>(0);
  const [isTransitioning, setIsTransitioning] = useState(defaultRevealed);
  const [initialTransition, setInitialTransition] = useState(defaultRevealed);
  const [isPlaying, setIsPlaying] = useState<boolean>(play.auto || false);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Initialize auto-play state when props change
  useEffect(() => {
    setIsPlaying(play.auto || false);
  }, [play.auto]);
  const nextImageRef = useRef<HTMLImageElement | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const preloadNextImage = (nextIndex: number) => {
    if (nextIndex >= 0 && nextIndex < items.length) {
      const item = items[nextIndex];
      if (typeof item.slide === "string") {
        nextImageRef.current = new Image();
        nextImageRef.current.src = item.slide;
      }
    }
  };

  const handlePrevClick = () => {
    if (items.length > 1 && activeIndex > 0) {
      const prevIndex = activeIndex - 1;
      handleControlClick(prevIndex);
    }
  };

  const handleNextClick = () => {
    if (items.length > 1) {
      // If at the last slide, loop back to the first one
      const nextIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
      handleControlClick(nextIndex);
    }
  };

  const handleControlClick = (nextIndex: number) => {
    if (nextIndex !== activeIndex && !transitionTimeoutRef.current) {
      preloadNextImage(nextIndex);

      setIsTransitioning(false);

      transitionTimeoutRef.current = setTimeout(() => {
        setActiveIndex(nextIndex);

        setTimeout(() => {
          setIsTransitioning(true);
          transitionTimeoutRef.current = undefined;
        }, 50);
      }, 300);
    }
  };

  // Simple function to handle auto-play
  const handleNextWithLoop = () => {
    const nextIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
    handleControlClick(nextIndex);
  };

  // Progress tracking for animation
  useEffect(() => {
    let progressTimer: NodeJS.Timeout | undefined;

    if (isPlaying && play.progress && items.length > 1) {
      // Reset progress when slide changes
      setProgressPercent(0);

      // Update progress every 50ms
      const updateFrequency = 50; // ms
      const interval = play.interval || 3000; // Default to 3000ms if undefined
      const totalSteps = Math.floor(interval / updateFrequency);
      let currentStep = 0;

      progressTimer = setInterval(() => {
        currentStep++;
        const percent = Math.min((currentStep / totalSteps) * 100, 100);
        setProgressPercent(percent);
      }, updateFrequency);
    }

    return () => {
      if (progressTimer) {
        clearInterval(progressTimer);
      }
    };
  }, [isPlaying, activeIndex, play.interval, play.progress, items.length]);

  // Handle auto-play functionality
  useEffect(() => {
    // Clear any existing interval first
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = undefined;
    }

    // Start auto-play if enabled
    if (isPlaying && items.length > 1) {
      autoPlayIntervalRef.current = setInterval(() => {
        // Simply call the next function which already has looping logic
        handleNextWithLoop();
      }, play.interval);
    }

    // Cleanup function
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = undefined;
      }
    };
  }, [isPlaying, items.length, play.interval, handleNextWithLoop]);

  // Handle initial transition
  useEffect(() => {
    if (!defaultRevealed && !initialTransition) {
      setIsTransitioning(true);
      setInitialTransition(true);
    }
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [defaultRevealed, initialTransition]);

  // Toggle play/pause function
  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Column
      ref={ref}
      fillWidth
      fillHeight={stretch}
      gap="8"
      {...flex}
      aspectRatio={undefined}
      // The ref was never attached, and this replaced the caller's `style`.
      style={{ isolation: "isolate", ...flex.style }}
    >
      {items.length > 1 && play.controls && play.auto && (
        <Flex position="absolute" top="16" right="16" zIndex={1}>
          <Flex radius="m" background="surface">
            <IconButton
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              variant="secondary"
              icon={isPlaying ? "pause" : "play"}
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            />
          </Flex>
        </Flex>
      )}
      <Reveal
        fillWidth
        fillHeight={stretch}
        radius={flex.radius || "l"}
        revealed={isTransitioning}
        translateY={translateY}
        aspectRatio={aspectRatio === "original" ? undefined : aspectRatio}
        duration={300}
        onTouchStart={(e: React.TouchEvent) => {
          touchStartXRef.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e: React.TouchEvent) => {
          if (touchStartXRef.current === null) return;

          const touchEndX = e.changedTouches[0].clientX;
          touchEndXRef.current = touchEndX;

          const diffX = touchStartXRef.current - touchEndX;

          // Detect swipe (more than 50px movement is considered a swipe)
          if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
              handleNextClick();
            } else {
              handlePrevClick();
            }
          }

          touchStartXRef.current = null;
          touchEndXRef.current = null;
        }}
      >
        {typeof items[activeIndex]?.slide === "string" ? (
          <Media
            stretch={stretch}
            sizes={sizes}
            unoptimized={unoptimized}
            priority={priority}
            radius={flex.radius || "l"}
            border={flex.border || "neutral-alpha-weak"}
            overflow="hidden"
            aspectRatio={stretch ? undefined : aspectRatio === "auto" ? undefined : aspectRatio}
            src={items[activeIndex]?.slide as string}
            alt={items[activeIndex]?.alt || ""}
          />
        ) : (
          <Flex
            fill
            overflow="hidden"
            radius={flex.radius || "l"}
            border={flex.border || "neutral-alpha-weak"}
            aspectRatio={stretch ? undefined : aspectRatio === "auto" ? undefined : aspectRatio}
          >
            {items[activeIndex]?.slide}
          </Flex>
        )}
        <Row
          fill
          className={styles.controls}
          radius={flex.radius || "l"}
          position="absolute"
          top="0"
          left="0"
          overflow="hidden"
          horizontal="between"
        >
          {activeIndex > 0 ? (
            <Row
              className={styles.left}
              cursor="interactive"
              maxWidth="12rem"
              fill
              vertical="center"
              onClick={handlePrevClick}
            >
              {controls && (
                <>
                  <Flex
                    m={{ hide: true }}
                    transition="micro-medium"
                    className={styles.button}
                    marginLeft="m"
                    radius="m"
                    background="surface"
                  >
                    <IconButton
                      tabIndex={0}
                      onClick={handlePrevClick}
                      variant="secondary"
                      icon="chevronLeft"
                      aria-label="Previous slide"
                    />
                  </Flex>
                </>
              )}
            </Row>
          ) : (
            <Flex maxWidth="12rem" />
          )}
          {activeIndex < items.length - 1 ? (
            <Row
              className={styles.right}
              cursor="interactive"
              maxWidth="12rem"
              fill
              vertical="center"
              horizontal="end"
              onClick={handleNextClick}
            >
              {controls && (
                <>
                  <Flex
                    m={{ hide: true }}
                    transition="micro-medium"
                    className={styles.button}
                    marginRight="m"
                    radius="m"
                    background="surface"
                  >
                    <IconButton
                      tabIndex={0}
                      onClick={handleNextClick}
                      variant="secondary"
                      icon="chevronRight"
                      aria-label="Next slide"
                    />
                  </Flex>
                </>
              )}
            </Row>
          ) : (
            <Flex maxWidth="12rem" />
          )}
        </Row>
        {play.progress && (
          <Row
            fillWidth
            paddingBottom="12"
            paddingX="24"
            position="absolute"
            bottom="0"
            left="0"
            zIndex={1}
          >
            <Row radius="full" background="neutral-alpha-weak" height="2" fillWidth>
              <Row
                radius="full"
                solid="brand-strong"
                style={{
                  width: `${progressPercent}%`,
                  transition: `width 0.05s linear`,
                }}
                fillHeight
              />
            </Row>
          </Row>
        )}
      </Reveal>
      {items.length > 1 && indicator !== false && (
        <>
          {indicator === "line" ? (
            <Flex gap="4" paddingX="s" fillWidth horizontal="center">
              {items.map((_, index) => (
                <Flex
                  className={styles.indicator}
                  onClick={() => handleControlClick(index)}
                  // Click-only divs: a keyboard could not reach or press them,
                  // and nothing said which slide was showing.
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleControlClick(index);
                    }
                  }}
                  cursor={activeIndex === index ? undefined : "interactive"}
                  key={index}
                  fillWidth
                  height="12"
                  vertical="center"
                >
                  <Flex
                    className={activeIndex === index ? styles.active : styles.inactive}
                    radius="full"
                    transition="micro-short"
                    fillWidth
                    height="2"
                  />
                </Flex>
              ))}
            </Flex>
          ) : (
            <Scroller gap="4" marginTop="12" onItemClick={handleControlClick}>
              {items.map((item, index) => (
                <Flex
                  key={index}
                  // Scroller supplies the click and Enter/Space handling;
                  // the thumbnail has to be focusable and named for them.
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  style={{
                    border:
                      activeIndex === index
                        ? "2px solid var(--brand-solid-strong)"
                        : "2px solid var(--static-transparent)",
                  }}
                  radius="m-8"
                  padding="4"
                  aspectRatio={aspectRatio}
                  cursor="interactive"
                  minHeight={thumbnail.height}
                  maxHeight={thumbnail.height}
                >
                  {typeof item.slide === "string" ? (
                    <Media
                      alt={item.alt || ""}
                      aspectRatio={aspectRatio}
                      sizes={thumbnail.sizes}
                      unoptimized={unoptimized}
                      src={item.slide}
                      cursor="interactive"
                      radius="m"
                      transition="macro-medium"
                    />
                  ) : (
                    <Flex
                      aspectRatio={aspectRatio}
                      cursor="interactive"
                      radius="m"
                      transition="macro-medium"
                      overflow="hidden"
                      fill
                    >
                      <Flex fill style={{ transform: `scale(${thumbnail.scaling})` }}>
                        {item.slide}
                      </Flex>
                    </Flex>
                  )}
                </Flex>
              ))}
            </Scroller>
          )}
        </>
      )}
    </Column>
  );
};

FadeCarousel.displayName = "FadeCarousel";

/**
 * One slide at a time, from an `items` list of image URLs or nodes.
 * `mode="snap"` swaps the cross-fade for a swipeable, snapping track.
 */
const Carousel = ({ ref, mode = "fade", ...props }: CarouselProps) => {
  if (mode !== "snap") return <FadeCarousel ref={ref} {...props} />;
  const {
    indicator,
    translateY: _translateY,
    defaultRevealed: _defaultRevealed,
    thumbnail: _thumbnail,
    play: _play,
    ...snap
  } = props;
  return <SnapCarousel ref={ref} indicator={indicator !== false} {...snap} />;
};

Carousel.displayName = "Carousel";

export type { CarouselItem, CarouselProps };
export { Carousel };
