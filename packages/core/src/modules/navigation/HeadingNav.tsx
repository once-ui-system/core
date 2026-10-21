"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Column } from "../../components/Column.js";
import { Flex } from "../../components/Flex.js";
import { Icon } from "../../components/Icon.js";
import { Row } from "../../components/Row.js";
import { SmartLink } from "../../components/SmartLink.js";
import { Text } from "../../components/Text.js";
import { useHeadingLinks } from "../../hooks/useHeadingLinks.js";

/**
 * The indicator's offset: `calc(n * var(--static-space-32))` in a custom
 * property that `top` reads. jsdom (30) throws from `getComputedStyle` on a
 * length whose inline value is math holding a `var()`, which every role
 * query of an app's tests would hit; a custom property is never resolved
 * there (see `withTokenLengths`).
 */
const INDICATOR_TOP = "--ou-heading-nav-top";
const indicatorTop = (index: number) => `calc(${index} * var(--static-space-32))`;

export interface HeadingNavProps extends React.ComponentProps<typeof Flex> {
  header?: boolean;
}

const HeadingNav = ({ ref, className, style, header = true, ...rest }: HeadingNavProps) => {
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const headings = useHeadingLinks();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const pendingUpdateRef = useRef<string | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef<boolean>(false);

  const updateActiveHeadingInternal = useCallback(
    (id: string) => {
      const index = headings.findIndex((h) => h.id === id);
      if (index !== -1) {
        setActiveHeadingId(id);
        setActiveIndex(index);

        if (indicatorRef.current) {
          indicatorRef.current.style.setProperty(INDICATOR_TOP, indicatorTop(index));
        }

        lastUpdateTimeRef.current = Date.now();
        isUpdatingRef.current = false;
      }
    },
    [headings],
  );

  useEffect(() => {
    if (headings.length === 0) return;

    setActiveHeadingId(headings[0]?.id || null);

    const headingElements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter(Boolean) as HTMLElement[];

    const headingPositions = new Map<string, number>();

    const calculateHeadingPositions = () => {
      headingElements.forEach((el) => {
        if (el) {
          headingPositions.set(el.id, el.getBoundingClientRect().top + window.scrollY - 150);
        }
      });
    };

    calculateHeadingPositions();

    const debouncedUpdateActiveHeading = (id: string) => {
      const now = Date.now();

      if (isUpdatingRef.current) {
        pendingUpdateRef.current = id;
        return;
      }

      if (now - lastUpdateTimeRef.current < 200) {
        pendingUpdateRef.current = id;

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
          if (pendingUpdateRef.current) {
            isUpdatingRef.current = true;
            updateActiveHeadingInternal(pendingUpdateRef.current);
            pendingUpdateRef.current = null;
          }
        }, 200);

        return;
      }

      isUpdatingRef.current = true;
      updateActiveHeadingInternal(id);
    };

    const findActiveHeading = () => {
      const scrollPosition = window.scrollY;

      let activeId = headings[0]?.id;
      let closestPosition = -Infinity;

      headingPositions.forEach((position, id) => {
        if (position <= scrollPosition && position > closestPosition) {
          closestPosition = position;
          activeId = id;
        }
      });

      if (activeId) {
        debouncedUpdateActiveHeading(activeId);
      }
    };

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          findActiveHeading();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (Date.now() - lastUpdateTimeRef.current > 400) {
          const enteringEntries = entries.filter((entry) => entry.isIntersecting);

          if (enteringEntries.length > 0) {
            enteringEntries.sort((a, b) => {
              const aRect = a.boundingClientRect;
              const bRect = b.boundingClientRect;
              return aRect.top - bRect.top;
            });

            debouncedUpdateActiveHeading(enteringEntries[0].target.id);
          }
        }
      },
      {
        rootMargin: "-150px 0px -30% 0px",
        threshold: [0, 0.1, 0.5, 1],
      },
    );

    headingElements.forEach((element) => {
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    window.addEventListener("resize", calculateHeadingPositions);

    findActiveHeading();

    return () => {
      if (observerRef.current) {
        headingElements.forEach((element) => {
          if (element) observerRef.current?.unobserve(element);
        });
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", calculateHeadingPositions);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [headings, updateActiveHeadingInternal]);

  const handleHeadingClick = (id: string, index: number) => {
    setActiveHeadingId(id);
    setActiveIndex(index);

    if (indicatorRef.current) {
      indicatorRef.current.style.setProperty(INDICATOR_TOP, indicatorTop(index));
    }

    lastUpdateTimeRef.current = Date.now();
  };

  return (
    <Column
      gap="16"
      position="sticky"
      fitHeight
      className={className}
      style={style}
      ref={ref}
      {...rest}
    >
      {headings.length > 0 && (
        <>
          {header && (
            <Row
              gap="12"
              paddingLeft="2"
              vertical="center"
              onBackground="neutral-weak"
              textVariant="label-default-s"
            >
              <Icon name="document" size="xs" />
              On this page
            </Row>
          )}
          <Row paddingLeft="8" gap="12">
            <Row width="2" background="neutral-alpha-medium" radius="full" overflow="hidden">
              <Row
                ref={indicatorRef}
                height="32"
                paddingY="4"
                fillWidth
                position="absolute"
                style={
                  {
                    [INDICATOR_TOP]: indicatorTop(activeIndex),
                    top: `var(${INDICATOR_TOP})`,
                    transition: "top 0.3s ease",
                  } as React.CSSProperties
                }
              >
                <Row fillWidth solid="brand-strong" radius="full" />
              </Row>
            </Row>
            <Column fillWidth>
              {headings.map((heading, index) => {
                const indent = heading.level - 2;
                const isActive = heading.id === activeHeadingId;

                return (
                  <Flex key={heading.id} fillWidth height="32" paddingX="4">
                    <SmartLink
                      fillWidth
                      href={"#" + heading.id}
                      // The current section was told by colour and weight alone.
                      aria-current={isActive ? "location" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        const target = document.getElementById(heading.id);
                        if (target) {
                          const targetPosition =
                            target.getBoundingClientRect().top + window.scrollY - 150;
                          window.scrollTo({
                            top: targetPosition,
                            behavior: "smooth",
                          });

                          handleHeadingClick(heading.id, index);
                        }
                      }}
                      style={{
                        // Math with a var() in a length breaks jsdom's
                        // getComputedStyle; it lives in a custom property.
                        ["--ou-heading-nav-indent" as string]: `calc(${indent} * var(--static-space-8))`,
                        paddingLeft: "var(--ou-heading-nav-indent)",
                        color: isActive
                          ? "var(--neutral-on-background-strong)"
                          : "var(--neutral-on-background-weak)",
                        transition: "color 0.2s ease",
                      }}
                    >
                      <Text
                        textVariant={isActive ? "body-strong-s" : "body-default-s"}
                        truncate
                        style={{
                          transition: "font-weight 0.2s ease",
                        }}
                      >
                        {heading.text}
                      </Text>
                    </SmartLink>
                  </Flex>
                );
              })}
            </Column>
          </Row>
        </>
      )}
    </Column>
  );
};

HeadingNav.displayName = "HeadingNav";

export { HeadingNav };
