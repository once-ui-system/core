"use client";

import { Column, IconButton, Row, Text } from "@once-ui-system/core";
import {
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./BlockFilmstrip.module.scss";

export interface FilmstripItem {
  id: string;
  title: string;
  /** The block's preview, as the page renders it. */
  render: () => ReactNode;
}

/** How far (px) the pointer has to travel before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 8;

/**
 * A strip of live, scaled-down previews, one per block on the page, used to
 * pick a block. When there are more blocks than fit, the strip scrolls
 * sideways: by wheel or touch as usual, and by dragging it with the mouse.
 *
 * The previews mount once the browser is idle so they never hold up the block
 * the reader came for; until then each frame shows its title only.
 */
export function BlockFilmstrip({
  items,
  activeId,
  onSelect,
}: {
  items: FilmstripItem[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const [ready, setReady] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [edges, setEdges] = useState({ start: false, end: false });
  const stripRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false });

  // The previews are second copies of blocks the page also renders in full, and
  // they come first in the document. Blocks hard-code ids (`id="email"`), so a
  // label in the real block would point at the hidden copy's field. Strip ids
  // and label targets from the previews as they mount.
  useEffect(() => {
    const strip = stripRef.current;
    if (!ready || !strip) return;
    const scrub = () => {
      for (const element of strip.querySelectorAll("[data-filmstrip-canvas] [id]")) {
        element.removeAttribute("id");
      }
      for (const label of strip.querySelectorAll("[data-filmstrip-canvas] label[for]")) {
        label.removeAttribute("for");
      }
    };
    scrub();
    const observer = new MutationObserver(scrub);
    observer.observe(strip, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["id", "for"],
    });
    return () => observer.disconnect();
  }, [ready]);

  useEffect(() => {
    const show = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(show, { timeout: 1500 });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = setTimeout(show, 300);
    return () => clearTimeout(handle);
  }, []);

  // Arrows, drag-to-scroll and its cursor only exist when the frames do not
  // fit; each arrow shows only while there is more strip on its side.
  const measure = () => {
    const strip = stripRef.current;
    if (!strip) return;
    const max = strip.scrollWidth - strip.clientWidth;
    setOverflowing(max > 1);
    setEdges({ start: strip.scrollLeft > 1, end: strip.scrollLeft < max - 1 });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: measure only reads the strip's ref
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(strip);
    return () => observer.disconnect();
  }, []);

  /** Scrolls the strip by most of its visible width, in the given direction. */
  const page = (direction: -1 | 1) => {
    const strip = stripRef.current;
    if (!strip) return;
    strip.scrollBy({ left: direction * strip.clientWidth * 0.8, behavior: "smooth" });
  };

  // Keep the selected block's frame in view when the selection changes from
  // elsewhere (previous/next buttons, a link to #id), without moving the page.
  useEffect(() => {
    const strip = stripRef.current;
    const item = strip?.querySelector<HTMLElement>(`[data-filmstrip-id="${CSS.escape(activeId)}"]`);
    if (!strip || !item) return;
    const left =
      item.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft;
    const right = left + item.offsetWidth;
    if (left < strip.scrollLeft || right > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({ left: Math.max(0, left - 24), behavior: "smooth" });
    }
  }, [activeId]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    // Every press starts clean, so an earlier drag can never swallow this click.
    drag.current = { down: false, startX: 0, startScroll: 0, moved: false };
    if (!overflowing || event.pointerType !== "mouse" || event.button !== 0) return;
    const strip = stripRef.current;
    if (!strip) return;
    drag.current = {
      down: true,
      startX: event.clientX,
      startScroll: strip.scrollLeft,
      moved: false,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const strip = stripRef.current;
    if (!state.down || !strip) return;
    const distance = event.clientX - state.startX;
    if (!state.moved && Math.abs(distance) < DRAG_THRESHOLD) return;
    if (!state.moved) {
      state.moved = true;
      setDragging(true);
      // Capture only once it is a drag, so a plain click still lands on its frame.
      strip.setPointerCapture(event.pointerId);
    }
    strip.scrollLeft = state.startScroll - distance;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const strip = stripRef.current;
    if (strip?.hasPointerCapture(event.pointerId)) strip.releasePointerCapture(event.pointerId);
    drag.current.down = false;
    setDragging(false);
  };

  // The click that ends a drag is not a selection.
  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!drag.current.moved) return;
    drag.current.moved = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const stripClass = [
    styles.strip,
    overflowing ? styles.draggable : "",
    dragging ? styles.dragging : "",
  ].join(" ");

  return (
    <Row fillWidth>
      {edges.start && (
        <Column position="absolute" top="0" left="0" fillHeight vertical="center" zIndex={2}>
          <IconButton
            icon="chevronLeft"
            variant="secondary"
            size="l"
            rounded
            tooltip="Previous blocks"
            aria-label="Scroll to previous blocks"
            onClick={() => page(-1)}
          />
        </Column>
      )}
      {edges.end && (
        <Column position="absolute" top="0" right="0" fillHeight vertical="center" zIndex={2}>
          <IconButton
            icon="chevronRight"
            variant="secondary"
            size="l"
            rounded
            tooltip="More blocks"
            aria-label="Scroll to more blocks"
            onClick={() => page(1)}
          />
        </Column>
      )}
      <Row
        ref={stripRef}
        fillWidth
        gap="16"
        paddingY="4"
        className={stripClass}
        role="list"
        aria-label="Blocks on this page"
        onScroll={measure}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(event) => event.preventDefault()}
      >
        {items.map((item) => {
          const selected = item.id === activeId;
          return (
            <Column
              key={item.id}
              data-filmstrip-id={item.id}
              role="listitem"
              className={styles.item}
              width={12}
              padding="4"
              gap="4"
              radius="l"
              border={selected ? "brand-alpha-strong" : "neutral-alpha-medium"}
              background={selected ? "neutral-alpha-weak" : "overlay"}
            >
              <Column
                fillWidth
                aspectRatio="16 / 10"
                radius="m"
                overflow="hidden"
                background="page"
                border
              >
                {ready && (
                  <Column
                    className={styles.canvas}
                    data-filmstrip-canvas
                    position="absolute"
                    top="0"
                    left="0"
                    pointerEvents="none"
                    aria-hidden="true"
                    inert
                  >
                    {item.render()}
                  </Column>
                )}
              </Column>
              <Row fillWidth paddingX="4" paddingBottom="2">
                <Text variant={selected ? "label-strong-s" : "label-default-s"} truncate>
                  {item.title}
                </Text>
              </Row>
              <button
                type="button"
                className={styles.hit}
                onClick={() => onSelect(item.id)}
                aria-pressed={selected}
                aria-label={`Show ${item.title}`}
              />
            </Column>
          );
        })}
      </Row>
    </Row>
  );
}
