"use client";

import { SpacingToken } from "@/types";
import { Flex, RevealFx, Scroller, Media, Column, Row, IconButton, Fade, ProgressBar } from ".";
import { useEffect, useState, useRef } from "react";
import styles from "./Carousel.module.scss";

interface CarouselItem {
  slide: string | React.ReactNode;
  alt?: string;
}

interface ThumbnailItem {
  scaling?: number;
  height?: SpacingToken | number;
  sizes?: string;
}

interface CarouselProps extends React.ComponentProps<typeof Flex> {
  items: CarouselItem[];
  controls?: boolean;
  priority?: boolean;
  fill?: boolean;
  indicator?: "line" | "thumbnail" | false;
  translateY?: SpacingToken | number;
  aspectRatio?: string;
  sizes?: string;
  revealedByDefault?: boolean;
  thumbnail?: ThumbnailItem;
  play?: {auto?: boolean, interval?: number, controls?: boolean, progress?: boolean};
}

const Carousel: React.FC<CarouselProps> = ({
  items = [],
  fill = false,
  controls = true,
  priority = false,
  indicator = "line",
  translateY,
  aspectRatio = "original",
  sizes,
  revealedByDefault = false,
  thumbnail = { scaling: 1, height: "80", sizes: "120px" },
  play = {auto: false, interval: 3000, controls: true},
  ...rest
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(revealedByDefault);
  const [initialTransition, setInitialTransition] = useState(revealedByDefault);
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
    setIsPlaying(prev => !prev);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Column fillWidth fillHeight={fill} gap="12" {...rest} aspectRatio={undefined} style={{isolation: "isolate"}}>
      {items.length > 1 && play.controls && play.auto && (
        <Flex
          position="absolute"
          top="16"
          right="16"
          zIndex={1}
        >
          <Flex
            radius="m"
            background="surface"
          >
            <IconButton
              onClick={(e: React.MouseEvent) => {
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
        trigger={isTransitioning}
        translateY={translateY}
        aspectRatio={aspectRatio === "original" ? undefined : aspectRatio}
        speed={300}
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
            fill={fill}
            sizes={sizes}
            priority={priority}
            radius={rest.radius || "l"}
            border={rest.border || "neutral-alpha-weak"}
            overflow="hidden"
            aspectRatio={fill ? undefined : aspectRatio === "auto" ? undefined : aspectRatio}
            src={items[activeIndex]?.slide as string}
            alt={items[activeIndex]?.alt || ""}
          />
        ) : (
          <Flex
            fill
            overflow="hidden"
            radius={rest.radius || "l"}
            border={rest.border || "neutral-alpha-weak"}
            aspectRatio={fill ? undefined : aspectRatio === "auto" ? undefined : aspectRatio}
          >
            {items[activeIndex]?.slide}
          </Flex>
        )}
        <Row
          fill
          className={styles.controls}
          radius={rest.radius || "l"}
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
                  <Fade
                    m={{ hide: true }}
                    transition="micro-medium"
                    className={styles.fade}
                    position="absolute"
                    left="0"
                    top="0"
                    to="right"
                    fillHeight
                    maxWidth={6}
                  />
                  <Flex
                    m={{ hide: true }}
                    transition="micro-medium"
                    className={styles.button}
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
                  <Fade
                    m={{ hide: true }}
                    transition="micro-medium"
                    className={styles.fade}
                    position="absolute"
                    right="0"
                    top="0"
                    to="left"
                    fillHeight
                    maxWidth={6}
                  />
                  <Flex
                    m={{ hide: true }}
                    transition="micro-medium"
                    className={styles.button}
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
              <Row radius="full" solid="brand-strong" style={{width: `${progressPercent}%`, transition: `width 0.05s linear`}} fillHeight />
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
                  radius="full"
                  key={index}
                  onClick={() => handleControlClick(index)}
                  style={{
                    background:
                      activeIndex === index
                        ? "var(--neutral-on-background-strong)"
                        : "var(--neutral-alpha-medium)",
                    transition: "background 0.3s ease",
                  }}
                  cursor="interactive"
                  fillWidth
                  height="2"
                />
              ))}
            </Flex>
          ) : (
            <Scroller gap="4" onItemClick={handleControlClick}>
              {items.map((item, index) => (
                <Flex
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
                  minHeight={thumbnail.height}
                  maxHeight={thumbnail.height}
                >
                  {typeof item.slide === "string" ? (
                    <Media
                      alt={item.alt || ""}
                      aspectRatio={aspectRatio}
                      sizes={thumbnail.sizes}
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

Carousel.displayName = "Carousel";
export { Carousel };
