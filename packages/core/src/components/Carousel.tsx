"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, MouseEvent, ReactNode, TouchEvent } from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../classes/utils";
import type { SpacingToken } from "../types";
import { Column } from "./Column";
import { Fade } from "./Fade";
import { Flex, type FlexComponentProps } from "./Flex";
import { IconButton } from "./IconButton";
import { Media } from "./Media";
import { RevealFx } from "./RevealFx";
import { Row } from "./Row";
import { Scroller } from "./Scroller";

export const carouselVariants = cva("isolate");

export const carouselControlsVariants = cva("group/controls");

export const carouselFadeVariants = cva(
  "opacity-0 transition-opacity group-hover/controls:opacity-50 group-focus-within/controls:opacity-50",
);

export const carouselNavButtonVariants = cva(
  "opacity-0 transition-[opacity,transform] duration-micro-medium group-hover/controls:opacity-100 group-hover/controls:translate-x-0 group-focus-within/controls:opacity-100 group-focus-within/controls:translate-x-0",
  {
    variants: {
      direction: {
        left: "-translate-x-4",
        right: "translate-x-4",
      },
    },
    defaultVariants: {
      direction: "left",
    },
  },
);

export const carouselIndicatorVariants = cva("group/indicator");

export const carouselIndicatorLineVariants = cva("transition-colors duration-micro-short", {
  variants: {
    active: {
      true: "bg-neutral-on-background-strong",
      false:
        "bg-neutral-alpha-medium group-hover/indicator:bg-neutral-alpha-strong group-focus-within/indicator:bg-neutral-alpha-strong",
    },
  },
  defaultVariants: {
    active: false,
  },
});

export interface CarouselItem {
  slide: string | ReactNode;
  alt?: string;
}

export interface ThumbnailItem {
  scaling?: number;
  height?: SpacingToken | number;
  sizes?: string;
}

export interface CarouselProps extends Omit<FlexComponentProps, "children"> {
  items: CarouselItem[];
  controls?: boolean;
  priority?: boolean;
  fill?: boolean;
  indicator?: "line" | "thumbnail" | false;
  translateY?: SpacingToken | number;
  aspectRatio?: string;
  sizes?: string;
  unoptimized?: boolean;
  revealedByDefault?: boolean;
  thumbnail?: ThumbnailItem;
  play?: {
    auto?: boolean;
    interval?: number;
    controls?: boolean;
    progress?: boolean;
  };
  className?: string;
  style?: CSSProperties;
}

const defaultThumbnail: ThumbnailItem = { scaling: 1, height: "80", sizes: "120px" };
const defaultPlay: NonNullable<CarouselProps["play"]> = {
  auto: false,
  interval: 3000,
  controls: true,
  progress: false,
};

const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      items = [],
      fill = false,
      controls = true,
      priority = false,
      indicator = "line",
      translateY,
      aspectRatio = "original",
      sizes,
      unoptimized = false,
      revealedByDefault = false,
      thumbnail = defaultThumbnail,
      play = defaultPlay,
      className,
      style,
      ...flex
    },
    ref,
  ) => {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [isTransitioning, setIsTransitioning] = useState(revealedByDefault);
    const [initialTransition, setInitialTransition] = useState(revealedByDefault);
    const [isPlaying, setIsPlaying] = useState<boolean>(play?.auto || false);
    const [progressPercent, setProgressPercent] = useState<number>(0);

    const playInterval = play?.interval ?? 3000;
    const playProgress = play?.progress ?? false;
    const playControls = play?.controls ?? true;
    const playAuto = play?.auto ?? false;

    const thumbnailHeight = thumbnail?.height ?? "80";
    const thumbnailScaling = thumbnail?.scaling ?? 1;
    const thumbnailSizes = thumbnail?.sizes ?? "120px";

    // Initialize auto-play state when props change
    useEffect(() => {
      setIsPlaying(playAuto);
    }, [playAuto]);

    const nextImageRef = useRef<HTMLImageElement | null>(null);
    const transitionTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const autoPlayIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const touchStartXRef = useRef<number | null>(null);
    const touchEndXRef = useRef<number | null>(null);

    const preloadNextImage = useCallback(
      (nextIndex: number) => {
        if (nextIndex >= 0 && nextIndex < items.length) {
          const item = items[nextIndex];
          if (typeof item.slide === "string") {
            nextImageRef.current = new Image();
            nextImageRef.current.src = item.slide;
          }
        }
      },
      [items],
    );

    const handleControlClick = useCallback(
      (nextIndex: number) => {
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
      },
      [activeIndex, preloadNextImage],
    );

    const handlePrevClick = useCallback(() => {
      if (items.length > 1 && activeIndex > 0) {
        const prevIndex = activeIndex - 1;
        handleControlClick(prevIndex);
      }
    }, [activeIndex, handleControlClick, items.length]);

    const handleNextClick = useCallback(() => {
      if (items.length > 1) {
        // If at the last slide, loop back to the first one
        const nextIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
        handleControlClick(nextIndex);
      }
    }, [activeIndex, handleControlClick, items.length]);

    // Simple function to handle auto-play
    const handleNextWithLoop = useCallback(() => {
      const nextIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
      handleControlClick(nextIndex);
    }, [activeIndex, handleControlClick, items.length]);

    // Progress tracking for animation
    // biome-ignore lint/correctness/useExhaustiveDependencies: Reset progress timer when active slide changes
    useEffect(() => {
      let progressTimer: NodeJS.Timeout | undefined;

      if (isPlaying && playProgress && items.length > 1) {
        // Reset progress when slide changes
        setProgressPercent(0);

        // Update progress every 50ms
        const updateFrequency = 50; // ms
        const totalSteps = Math.floor(playInterval / updateFrequency);
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
    }, [isPlaying, activeIndex, playInterval, playProgress, items.length]);

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
        }, playInterval);
      }

      // Cleanup function
      return () => {
        if (autoPlayIntervalRef.current) {
          clearInterval(autoPlayIntervalRef.current);
          autoPlayIntervalRef.current = undefined;
        }
      };
    }, [isPlaying, items.length, playInterval, handleNextWithLoop]);

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
      setIsPlaying((prev) => !prev);
    };

    if (items.length === 0) {
      return null;
    }

    return (
      <Column
        ref={ref}
        fillWidth
        fillHeight={fill}
        gap="8"
        aspectRatio={undefined}
        className={cn(carouselVariants(), className)}
        style={style}
        {...flex}
      >
        {items.length > 1 && playControls && playAuto && (
          <Flex position="absolute" top="16" right="16" zIndex={1}>
            <Flex radius="m" background="surface">
              <IconButton
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                variant="secondary"
                icon={isPlaying ? "pause" : "play"}
              />
            </Flex>
          </Flex>
        )}
        <RevealFx
          fillWidth
          fillHeight={fill}
          radius={flex.radius || "l"}
          trigger={isTransitioning}
          translateY={translateY}
          aspectRatio={aspectRatio === "original" ? undefined : aspectRatio}
          speed={300}
          onTouchStart={(e: TouchEvent) => {
            touchStartXRef.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e: TouchEvent) => {
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
              fill={fill}
              sizes={sizes}
              unoptimized={unoptimized}
              priority={priority}
              radius={flex.radius || "l"}
              border={flex.border || "neutral-alpha-weak"}
              overflow="hidden"
              aspectRatio={fill ? undefined : aspectRatio === "auto" ? undefined : aspectRatio}
              src={items[activeIndex]?.slide as string}
              alt={items[activeIndex]?.alt || ""}
            />
          ) : (
            <Flex
              fill
              overflow="hidden"
              radius={flex.radius || "l"}
              border={flex.border || "neutral-alpha-weak"}
              aspectRatio={fill ? undefined : aspectRatio === "auto" ? undefined : aspectRatio}
            >
              {items[activeIndex]?.slide}
            </Flex>
          )}
          <Row
            fill
            className={carouselControlsVariants()}
            radius={flex.radius || "l"}
            position="absolute"
            top="0"
            left="0"
            overflow="hidden"
            horizontal="between"
          >
            {activeIndex > 0 ? (
              <Row
                cursor="interactive"
                maxWidth={12}
                fill
                vertical="center"
                onClick={handlePrevClick}
              >
                {controls && (
                  <>
                    <Fade
                      m={{ hide: true }}
                      transition="micro-medium"
                      className={carouselFadeVariants()}
                      position="absolute"
                      left="0"
                      base="transparent"
                      top="0"
                      to="right"
                      fillHeight
                      maxWidth={6}
                    />
                    <Flex
                      m={{ hide: true }}
                      transition="micro-medium"
                      className={carouselNavButtonVariants({ direction: "left" })}
                      marginLeft="m"
                      radius="l"
                      overflow="hidden"
                      background="surface"
                    >
                      <IconButton
                        tabIndex={0}
                        onClick={handlePrevClick}
                        variant="secondary"
                        icon="chevronLeft"
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
                cursor="interactive"
                maxWidth={12}
                fill
                vertical="center"
                horizontal="end"
                onClick={handleNextClick}
              >
                {controls && (
                  <>
                    <Fade
                      m={{ hide: true }}
                      transition="micro-medium"
                      className={carouselFadeVariants()}
                      position="absolute"
                      right="0"
                      top="0"
                      base="transparent"
                      to="left"
                      fillHeight
                      maxWidth={6}
                    />
                    <Flex
                      m={{ hide: true }}
                      transition="micro-medium"
                      className={carouselNavButtonVariants({ direction: "right" })}
                      marginRight="m"
                      radius="l"
                      overflow="hidden"
                      background="surface"
                    >
                      <IconButton
                        tabIndex={0}
                        onClick={handleNextClick}
                        variant="secondary"
                        icon="chevronRight"
                      />
                    </Flex>
                  </>
                )}
              </Row>
            ) : (
              <Flex maxWidth={12} />
            )}
          </Row>
          {playProgress && (
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
                    transition: "width 0.05s linear",
                  }}
                  fillHeight
                />
              </Row>
            </Row>
          )}
        </RevealFx>
        {items.length > 1 &&
          indicator !== false &&
          (indicator === "line" ? (
            <Flex gap="4" paddingX="s" fillWidth horizontal="center">
              {items.map((_, index) => (
                <Flex
                  // biome-ignore lint/suspicious/noArrayIndexKey: Carousel items may be anonymous or static
                  key={index}
                  className={carouselIndicatorVariants()}
                  onClick={() => handleControlClick(index)}
                  cursor={activeIndex === index ? undefined : "interactive"}
                  fillWidth
                  height="12"
                  vertical="center"
                >
                  <Flex
                    className={carouselIndicatorLineVariants({
                      active: activeIndex === index,
                    })}
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
                  // biome-ignore lint/suspicious/noArrayIndexKey: Carousel items may be anonymous or static
                  key={index}
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
                  minHeight={thumbnailHeight}
                  maxHeight={thumbnailHeight}
                >
                  {typeof item.slide === "string" ? (
                    <Media
                      alt={item.alt || ""}
                      aspectRatio={aspectRatio}
                      sizes={thumbnailSizes}
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
                      <Flex fill style={{ transform: `scale(${thumbnailScaling})` }}>
                        {item.slide}
                      </Flex>
                    </Flex>
                  )}
                </Flex>
              ))}
            </Scroller>
          ))}
      </Column>
    );
  },
);

Carousel.displayName = "Carousel";

export { Carousel };
