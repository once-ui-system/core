"use client";

import { SpacingToken } from "@/types";
import { Flex, RevealFx, Scroller, Media, Column, Row, IconButton, Fade } from ".";
import { useEffect, useState, useRef, TouchEvent } from "react";
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
  indicator?: "line" | "thumbnail";
  aspectRatio?: string;
  sizes?: string;
  revealedByDefault?: boolean;
  thumbnail?: ThumbnailItem;
}

const Carousel: React.FC<CarouselProps> = ({
  items = [],
  controls = true,
  indicator = "line",
  aspectRatio = "16 / 9",
  sizes,
  revealedByDefault = false,
  thumbnail = { scaling: 1, height: "80", sizes: "120px" },
  ...rest
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(revealedByDefault);
  const [initialTransition, setInitialTransition] = useState(revealedByDefault);
  const nextImageRef = useRef<HTMLImageElement | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const preloadNextImage = (nextIndex: number) => {
    if (nextIndex >= 0 && nextIndex < items.length) {
      const item = items[nextIndex];
      if (typeof item.slide === 'string') {
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
    if (items.length > 1 && activeIndex < items.length - 1) {
      const nextIndex = activeIndex + 1;
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
        }, 300);
      }, 800);
    }
  };

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

  if (items.length === 0) {
    return null;
  }

  return (
    <Column fillWidth gap="12" {...rest} aspectRatio={undefined}>
      <RevealFx
        fillWidth
        trigger={isTransitioning}
        translateY="16"
        aspectRatio={aspectRatio}
        speed="fast"
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
        {typeof items[activeIndex]?.slide === 'string' ? (
          <Media
            sizes={sizes}
            priority
            radius="l"
            border="neutral-alpha-weak"
            overflow="hidden"
            alt={items[activeIndex]?.alt || ''}
            aspectRatio={aspectRatio}
            src={items[activeIndex]?.slide as string}
            style={{
              ...(items.length > 1 && {
              }),
            }}
          />
        ) : (
          <Flex 
            radius="l"
            overflow="hidden"
            border="neutral-alpha-weak"
            aspectRatio={aspectRatio}
            style={{
              ...(items.length > 1 && {
              }),
            }}
          >
            {items[activeIndex]?.slide}
          </Flex>
        )}
        <Row className={styles.controls} position="absolute" top="0" left="0" radius="l" overflow="hidden" fill horizontal="space-between">
          {activeIndex > 0 ? (
            <Row className={styles.left} cursor="interactive" maxWidth={12} fill vertical="center" onClick={handlePrevClick}>
              {controls && (
                <>
                  <Fade hide="m" transition="micro-medium" className={styles.fade} position="absolute" left="0" top="0" to="right" fillHeight maxWidth={6}/>
                  <Flex hide="m" transition="micro-medium" className={styles.button} marginLeft="m" radius="l" overflow="hidden" background="surface">
                    <IconButton tabIndex={0} onClick={handlePrevClick} variant="secondary" icon="chevronLeft" />
                  </Flex>
                </>
              )}
            </Row>
          ) : (
            <Flex maxWidth={12}/>
          )}
          {activeIndex < items.length - 1 ? (
            <Row className={styles.right} cursor="interactive" maxWidth={12} fill vertical="center" horizontal="end" onClick={handleNextClick}>
              {controls && (
                <>
                  <Fade hide="m" transition="micro-medium" className={styles.fade} position="absolute" right="0" top="0" to="left" fillHeight maxWidth={6}/>
                  <Flex hide="m" transition="micro-medium" className={styles.button} marginRight="m" radius="l" overflow="hidden" background="surface">
                    <IconButton tabIndex={0} onClick={handleNextClick} variant="secondary" icon="chevronRight" />
                  </Flex>
                </>
              )}
            </Row>
          ) : (
            <Flex maxWidth={12}/>
          )}
        </Row>
      </RevealFx>
      {items.length > 1 && (
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
                    border: activeIndex === index ? "2px solid var(--brand-solid-strong)" : "2px solid var(--static-transparent)",
                  }}
                  radius="m-8"
                  padding="4"
                  cursor="interactive"
                  minHeight={thumbnail.height}
                  maxHeight={thumbnail.height}
                >
                  {typeof item.slide === 'string' ? (
                    <Media
                      alt={item.alt || ''}
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
