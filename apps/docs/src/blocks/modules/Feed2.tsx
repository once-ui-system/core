"use client";

import { Column, Icon, IconButton, MasonryGrid, Media, Row, Text } from "@once-ui-system/core";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MediaPost2 } from "./MediaPost2";
import { Sidebar3 } from "./Sidebar3";

const images = [
  { src: "/images/backgrounds/2.jpg", likes: 11, comments: 1, aspectRatio: "4/3" },
  { src: "/images/backgrounds/1.jpg", likes: 23, comments: 3, aspectRatio: "3/4" },
  { src: "/images/backgrounds/3.jpg", likes: 4, comments: 2, aspectRatio: "16/9" },
  { src: "/images/backgrounds/4.jpg", likes: 2, comments: 1, aspectRatio: "3/4" },
  { src: "/images/backgrounds/5.jpg", likes: 12, comments: 3, aspectRatio: "4/3" },
  { src: "/images/backgrounds/6.jpg", likes: 12, comments: 4, aspectRatio: "16/9" },
  { src: "/images/backgrounds/7.jpg", likes: 1, comments: 0, aspectRatio: "1/1" },
  { src: "/images/backgrounds/8.jpg", likes: 7, comments: 4, aspectRatio: "3/4" },
  { src: "/images/backgrounds/9.jpg", likes: 62, comments: 7, aspectRatio: "16/9" },
  { src: "/images/backgrounds/10.jpg", likes: 12, comments: 5, aspectRatio: "3/4" },
  { src: "/images/backgrounds/11.jpg", likes: 5, comments: 1, aspectRatio: "4/3" },
  { src: "/images/backgrounds/12.jpg", likes: 12, comments: 2, aspectRatio: "3/4" },
  { src: "/images/backgrounds/13.jpg", likes: 17, comments: 3, aspectRatio: "3/4" },
  { src: "/images/backgrounds/14.jpg", likes: 31, comments: 9, aspectRatio: "4/3" },
  { src: "/images/backgrounds/15.jpg", likes: 4, comments: 1, aspectRatio: "1/1" },
  { src: "/images/backgrounds/16.jpg", likes: 0, comments: 0, aspectRatio: "16/9" },
];

export const Feed2 = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [active, setActive] = useState<string | null>(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    const { style } = document.body;
    const originalOverflow = style.overflow;
    if (active) {
      style.overflow = "hidden";
    } else {
      style.overflow = originalOverflow || "";
    }
    return () => {
      style.overflow = originalOverflow;
    };
  }, [active]);

  // Close on Escape
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  return (
    <Row fillWidth padding="16" gap="24">
      <Row
        s={{ hide: true }}
        position="sticky"
        fitHeight
        zIndex={1}
        style={{ top: "50%", transform: "translateY(-50%)" }}
      >
        <Sidebar3 />
      </Row>
      <MasonryGrid columns={4} l={{ columns: 3 }} m={{ columns: 2 }} s={{ columns: 1 }}>
        {images.map((image, index) => (
          <Row
            key={index}
            fillWidth
            radius="l"
            overflow="hidden"
            aspectRatio={image.aspectRatio}
            cursor="interactive"
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setActive(image.src)}
          >
            <Media
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
              src={image.src}
              stretch
            />
            <Row
              fill
              center
              position="absolute"
              top="0"
              left="0"
              gap="24"
              style={{
                opacity: hovered === index ? 1 : 0,
                background: "var(--static-black-medium)",
              }}
              transition="micro-medium"
            >
              <Row gap="12" vertical="center">
                <Icon onSolid="neutral-strong" name="heart" />
                <Text onSolid="neutral-strong" variant="label-default-s">
                  {image.likes}
                </Text>
              </Row>
              <Row gap="12" vertical="center">
                <Icon onSolid="neutral-strong" name="chat" />
                <Text onSolid="neutral-strong" variant="label-default-s">
                  {image.comments}
                </Text>
              </Row>
            </Row>
          </Row>
        ))}
        {typeof window !== "undefined" &&
          createPortal(
            <Row
              fill
              center
              position="fixed"
              top="0"
              left="0"
              background="surface"
              zIndex={10}
              style={{ opacity: active ? 1 : 0, pointerEvents: active ? "auto" : "none" }}
              transition="micro-medium"
            >
              <Column
                fill
                onClick={(e) => e.stopPropagation()}
                horizontal="center"
                gap="64"
                padding="l"
              >
                <IconButton
                  icon="close"
                  onClick={() => setActive(null)}
                  size="l"
                  variant="secondary"
                  data-border="rounded"
                  tooltip="Esc"
                  tooltipPosition="bottom"
                />
                {active && (
                  <MediaPost2
                    fill
                    media={active}
                    content="Captured this breathtaking sunset from Musinsa Terrace in Seoul. Perfect end to the day."
                    user={{
                      name: "Lorant One",
                      avatar: "/images/creators/lorant.jpg",
                    }}
                  />
                )}
              </Column>
            </Row>,
            document.body,
          )}
      </MasonryGrid>
    </Row>
  );
};
