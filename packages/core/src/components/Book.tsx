"use client";

import type React from "react";
import { forwardRef } from "react";
import { Column, ElementType, Flex, Media, Row } from ".";
import styles from "./Book.module.scss";

interface BookProps extends Omit<React.ComponentProps<typeof Flex>, "children"> {
  /** Cover artwork. Omit to render a blank cover you can fill with children. */
  src?: string;
  alt?: string;
  sizes?: string;
  /** Renders the book as a link. */
  href?: string;
  /** Overlaid on the cover, above the artwork — a title block, a badge. */
  children?: React.ReactNode;
}

/**
 * A book: a cover, a spine shadow and a visible page block, tilting on hover.
 *
 * The 3D is real rather than a drawn illusion — the wrapper carries the
 * perspective, the cover and page block share a `preserve-3d` context, and the
 * pages are hinged onto the cover's right edge with a `rotateY(90deg)`. That is
 * what makes the turn read correctly from every angle instead of only head-on.
 *
 * Motion is hover-gated and disabled under `prefers-reduced-motion`. On touch
 * the cover stays square-on: there is no hover to return from, and a
 * permanently rotated cover reads as a rendering fault rather than a style.
 */
const Book = forwardRef<HTMLDivElement, BookProps>(
  ({ src, alt, sizes, href, children, ...flex }, ref) => {
    const content = (
      <Row fill className={styles.wrapper}>
        <Row fill className={styles.book}>
          <Row
            fill
            className={styles.cover}
            borderY="neutral-medium"
            borderLeft="neutral-medium"
            background="page"
            leftRadius="xs"
            rightRadius="s"
            overflow="hidden"
          >
            {src && (
              <Media
                src={src}
                alt={alt || "Book cover"}
                sizes={sizes || "(max-width: 768px) 100vw, 480px"}
                fill
              />
            )}
            {children && (
              <Column fill position="absolute" zIndex={1} data-theme="dark">
                {children}
              </Column>
            )}
            {/* Spine shadow, blurred so it reads as depth rather than a rule. */}
            <Row
              className={styles.spine}
              zIndex={2}
              position="absolute"
              left="0"
              top="0"
              fillHeight
              width="8"
              background="overlay"
            />
          </Row>
          <Row
            className={styles.pages}
            data-theme="dark"
            rightRadius="s"
            borderY="neutral-medium"
            borderRight="neutral-medium"
            overflow="hidden"
            position="absolute"
            right="0"
            top="8"
            bottom="8"
            width="24"
            background="page"
            paddingY="8"
            paddingRight="12"
          >
            <Row fill rightRadius="xs" className={styles.pageEdge} />
          </Row>
        </Row>
      </Row>
    );

    return (
      <Row ref={ref} fillWidth aspectRatio="3/4" {...flex}>
        {href ? (
          <ElementType
            href={href}
            style={{ isolation: "isolate", height: "100%", width: "100%", textDecoration: "none" }}
          >
            {content}
          </ElementType>
        ) : (
          content
        )}
      </Row>
    );
  },
);

Book.displayName = "Book";

export { Book };
export type { BookProps };
