"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { prefersReducedMotionNow } from "../internal/reducedMotion";
import { SpacingToken } from "../types";
import styles from "./Carousel.module.scss";
import { Column } from "./Column";
import { Flex } from "./Flex";
import { IconButton } from "./IconButton";
import { Media } from "./Media";
import { RevealFx } from "./RevealFx";
import { Row } from "./Row";
import { Scroller } from "./Scroller";

interface CarouselItem {
  slide: string | React.ReactNode;
  alt?: string;
}

interface ThumbnailItem {
  scaling?: number;
  height?: SpacingToken | number;
  /** Passed to `Media`: a `sizes` string, or a number as shorthand for a max width in px. */
  sizes?: string | number;
}

interface CarouselProps extends React.ComponentProps<typeof Flex> {
  items: CarouselItem[];
  controls?: boolean;
  priority?: boolean;
  /**
   * Drop the intrinsic aspect ratio and let the slides stretch to whatever box
   * they are in. Named `stretch` rather than `fill` because `fill` is a layout
   * prop on every Flex-derived component, and shadowing it here meant `fill`
   * did not do the one thing its name promised.
   */
  stretch?: boolean;
  indicator?: "line" | "thumbnail" | false;
  translateY?: SpacingToken | number;
  aspectRatio?: string;
  /** Passed to `Media`: a `sizes` string, or a number as shorthand for a max width in px. */
  sizes?: string | number;
  unoptimized?: boolean;
  revealedByDefault?: boolean;
  thumbnail?: ThumbnailItem;
  /**
   * Autoplay. `auto` starts it, every `interval` ms (3000 by default), with a
   * pause button (`controls`, on unless `false`). It holds while the pointer
   * is over the carousel, stops when keyboard focus comes into it, and does
   * not start for a visitor who asks for reduced motion; the button then
   * reads Play.
   * `pauseLabel` and `playLabel` name the button ("Pause slideshow", "Play
   * slideshow" by default).
   */
  play?: {
    auto?: boolean;
    interval?: number;
    controls?: boolean;
    progress?: boolean;
    pauseLabel?: string;
    playLabel?: string;
  };
}

const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      items = [],
      stretch = false,
      controls = true,
      priority = false,
      indicator = "line",
      translateY,
      aspectRatio = "original",
      sizes,
      unoptimized = false,
      revealedByDefault = false,
      thumbnail = { scaling: 1, height: "80", sizes: "120px" },
      play = { auto: false, interval: 3000, controls: true },
      ...flex
    },
    ref,
  ) => {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [hoverIndex, setHoverIndex] = useState<number | undefined>(0);
    const [isTransitioning, setIsTransitioning] = useState(revealedByDefault);
    const [initialTransition, setInitialTransition] = useState(revealedByDefault);
    const [isPlaying, setIsPlaying] = useState<boolean>(play.auto || false);
    const [progressPercent, setProgressPercent] = useState<number>(0);
    // The pointer over the carousel holds autoplay until it leaves, without
    // changing what the button says: someone reading a slide, or about to
    // press its controls, does not have it move away (WCAG 2.2.2). Keyboard
    // focus coming in stops it, as the WAI-ARIA carousel does, and the button
    // then offers Play.
    const [hovered, setHovered] = useState(false);
    const pressedRef = useRef(false);
    // Each field of `play` falls back on its own. `play={{ auto: true }}`
    // used to have no pause button and an interval of 0.
    const interval = play.interval ?? 3000;
    const playControls = play.controls !== false;
    const running = isPlaying && !hovered;

    // Initialize auto-play state when props change. A visitor who asks for
    // reduced motion gets the carousel paused, and can still press Play.
    useEffect(() => {
      setIsPlaying(Boolean(play.auto) && !prefersReducedMotionNow());
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

      if (running && play.progress && items.length > 1) {
        // Reset progress when slide changes
        setProgressPercent(0);

        // Update progress every 50ms
        const updateFrequency = 50; // ms
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
    }, [running, activeIndex, interval, play.progress, items.length]);

    // Handle auto-play functionality
    useEffect(() => {
      // Clear any existing interval first
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = undefined;
      }

      // Start auto-play if enabled
      if (running && items.length > 1) {
        autoPlayIntervalRef.current = setInterval(() => {
          // Simply call the next function which already has looping logic
          handleNextWithLoop();
        }, interval);
      }

      // Cleanup function
      return () => {
        if (autoPlayIntervalRef.current) {
          clearInterval(autoPlayIntervalRef.current);
          autoPlayIntervalRef.current = undefined;
        }
      };
    }, [running, items.length, interval, handleNextWithLoop]);

    // Handle initial transition
    useEffect(() => {
      if (!revealedByDefault && !initialTransition) {
        setIsTransitioning(true);
        setInitialTransition(true);
      }
      return () => {
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }
      };
    }, [revealedByDefault, initialTransition]);

    // Toggle play/pause function
    const togglePlayPause = () => {
      // Pressing Play under the pointer means play now, not on leaving.
      if (!isPlaying) setHovered(false);
      setIsPlaying((prev) => !prev);
    };

    if (items.length === 0) {
      return null;
    }

    const slideProps = {
      role: "group",
      "aria-roledescription": "slide",
      "aria-label": `${activeIndex + 1} of ${items.length}`,
    } as const;
    const named = flex["aria-label"] !== undefined || flex["aria-labelledby"] !== undefined;

    return (
      <Column
        ref={ref}
        fillWidth
        fillHeight={stretch}
        gap="8"
        // A carousel, as the WAI-ARIA pattern names it: a group whose slides
        // say which of how many they are. Name it with `aria-label`.
        role="group"
        aria-roledescription="carousel"
        aria-label={named ? undefined : "Carousel"}
        {...flex}
        aspectRatio={undefined}
        // The ref was never attached, and this replaced the caller's `style`.
        style={{ isolation: "isolate", ...flex.style }}
        onMouseEnter={(event: React.MouseEvent<HTMLDivElement>) => {
          flex.onMouseEnter?.(event);
          setHovered(true);
        }}
        onMouseLeave={(event: React.MouseEvent<HTMLDivElement>) => {
          flex.onMouseLeave?.(event);
          pressedRef.current = false;
          setHovered(false);
        }}
        onPointerDown={(event: React.PointerEvent<HTMLDivElement>) => {
          flex.onPointerDown?.(event);
          pressedRef.current = true;
        }}
        onFocus={(event: React.FocusEvent<HTMLDivElement>) => {
          flex.onFocus?.(event);
          const pressed = pressedRef.current;
          pressedRef.current = false;
          const entering = !event.currentTarget.contains(event.relatedTarget as Node | null);
          if (entering && !pressed) setIsPlaying(false);
        }}
      >
        {items.length > 1 && playControls && play.auto && (
          <Flex position="absolute" top="16" right="16" zIndex={1}>
            <Flex radius="m" background="surface">
              <IconButton
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                variant="secondary"
                icon={isPlaying ? "pause" : "play"}
                aria-label={
                  isPlaying
                    ? (play.pauseLabel ?? "Pause slideshow")
                    : (play.playLabel ?? "Play slideshow")
                }
              />
            </Flex>
          </Flex>
        )}
        <RevealFx
          fillWidth
          fillHeight={stretch}
          radius={flex.radius || "l"}
          revealed={isTransitioning}
          translateY={translateY}
          aspectRatio={aspectRatio === "original" ? undefined : aspectRatio}
          speed={300}
          // A new slide is announced when someone changes it, not every few
          // seconds while it plays on its own.
          aria-live={running ? "off" : "polite"}
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
              // A new image for each slide, so the live region announces it.
              key={activeIndex}
              {...slideProps}
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
              {...slideProps}
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
                maxWidth={12}
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
              <Flex maxWidth={12} />
            )}
            {activeIndex < items.length - 1 ? (
              <Row
                className={styles.right}
                cursor="interactive"
                maxWidth={12}
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
              <Flex maxWidth={12} />
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
        </RevealFx>
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
  },
);

Carousel.displayName = "Carousel";

export { Carousel };
