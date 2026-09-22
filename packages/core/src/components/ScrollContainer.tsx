"use client";

import type React from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Column, Flex, IconButton, Row } from ".";
import styles from "./ScrollContainer.module.scss";

export type ScrollContainerControlPlacement =
  | "top-start"
  | "top-center"
  | "top-end"
  | "top-between"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end"
  | "bottom-between";

export interface ScrollContainerProps extends React.ComponentProps<typeof Row> {
  items: React.ReactNode[];
  controlPlacement?: ScrollContainerControlPlacement;
  /**
   * Wrap around: past the last item the track continues into the first, in the
   * same direction, with no rewind.
   */
  infinite?: boolean;
  /**
   * Markers showing how many items there are and which one is in front.
   * `true` puts them opposite the controls, or name the side yourself.
   */
  markers?: boolean | "top" | "bottom";
  /** Drag the track with a pointer — mouse, pen or finger. */
  draggable?: boolean;
  /** Items moved per control press. */
  step?: number;
  /** Clip the track at its edges instead of letting tiles paint past them. */
  clip?: boolean;
  /**
   * Scale tiles by how far they are from the one in front, so the run has a
   * focus that follows the track as it moves. `true` uses a gentle default;
   * a number is how much smaller each whole step away is, as a fraction —
   * `0.08` makes the neighbour 92%.
   */
  proximity?: boolean | number;
}

const getHorizontalAlignment = (placement: ScrollContainerControlPlacement) => {
  if (placement.endsWith("-end")) return "end";
  if (placement.endsWith("-center")) return "center";
  if (placement.endsWith("-between")) return "between";
  return "start";
};

/** Past this many pixels a pointer is dragging the track, not clicking a tile. */
const DRAG_THRESHOLD = 6;
/** Past this fraction of a tile, let go and the track advances rather than settling back. */
const COMMIT_RATIO = 0.2;
/** Past this speed the same is true however short the drag was. */
const FLICK_VELOCITY = 0.5;
/** How far a track can be pulled past its own end before it stops following. */
const RUBBER_BAND = 0.35;
/** How much smaller each whole step from the front is, when `proximity` is on. */
const PROXIMITY_FALLOFF = 0.08;
/** Tiles stop shrinking here, so a long run does not trail off into nothing. */
const PROXIMITY_FLOOR = 0.72;

/**
 * A horizontal run of items with controls, drag, optional wrap-around,
 * optional proximity scaling and optional markers.
 *
 * This moves a track with a transform rather than scrolling a box, which is
 * the decision the rest of the component follows from. The previous version
 * was an `overflow-x: auto` row, and a scroll box cannot do any of the three
 * things asked of a carousel: its contents are clipped at its own edge by
 * definition, so no tile can peek past it; its scroll range has two hard ends,
 * so there is nowhere for a wrap-around to go; and the browser owns the
 * easing, so a drag can only set `scrollLeft` and hope. A transform has none
 * of those limits — the track is laid out once and moved, tiles paint wherever
 * they land, the offset is free to run past either end, and the motion is a
 * CSS transition this component controls.
 *
 * What it gives up is the browser's own scrolling: a trackpad's horizontal
 * gesture no longer moves the track, and that is why `draggable` is on by
 * default and the controls are never hidden. Both are real affordances rather
 * than the invisible one a scroll box relies on.
 *
 * Tiles are unstyled. The wrapper each item sits in used to arrive with
 * `aspectRatio="3/4"`, `border`, `radius="xl"` and a width range already set,
 * so anything that was not a tall bordered portrait card had to override four
 * properties before it could begin — and any prop passed to override them
 * landed on every tile, since that is where the rest props go. The wrapper now
 * contributes only what a track item cannot do without, which is refusing to
 * shrink. Sizing stays with the caller, through those same rest props.
 */
const ScrollContainer = forwardRef<HTMLDivElement, ScrollContainerProps>(
  (
    {
      items,
      controlPlacement = "top-start",
      infinite = false,
      markers = false,
      draggable = true,
      step = 1,
      clip = false,
      proximity = false,
      ...tile
    },
    ref,
  ) => {
    const count = items.length;
    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const [index, setIndex] = useState(0);
    const [tileStep, setTileStep] = useState(0);
    const [perView, setPerView] = useState(1);
    const [dragPx, setDragPx] = useState(0);
    const [animated, setAnimated] = useState(true);
    const [dragging, setDragging] = useState(false);

    /**
     * The last index that still fills the viewport.
     *
     * Without wrap-around there is no reason to advance into empty space once
     * the final tile is already in view, so the end of the run is the last
     * whole screenful rather than the last item.
     */
    const maxIndex = infinite ? Number.POSITIVE_INFINITY : Math.max(0, count - perView);

    /**
     * Wrap-around is three copies of the run with the real one in the middle.
     *
     * Moving off either side of the middle copy lands on a real tile of the
     * neighbouring copy, so the motion is continuous and in the direction of
     * travel. `onTransitionEnd` then puts the index back in range with the
     * transition switched off, which shifts the track by exactly one copy —
     * the same tiles under the same pixels, so nothing moves on screen.
     */
    const rendered = useMemo(
      () => (infinite && count > 0 ? [...items, ...items, ...items] : items),
      [infinite, items, count],
    );
    const origin = infinite ? count : 0;

    const measure = useCallback(() => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      const first = track?.firstElementChild as HTMLElement | null;
      if (!viewport || !track || !first) return;

      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      const width = first.offsetWidth + gap;
      setTileStep(width);
      setPerView(width > 0 ? Math.max(1, Math.round(viewport.clientWidth / width)) : 1);
    }, []);

    useEffect(() => {
      measure();
      const viewport = viewportRef.current;
      if (!viewport || typeof ResizeObserver === "undefined") {
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
      }
      // Watches the track's own box too: a tile sized in percentages changes
      // with the viewport, but one sized by its content changes when the
      // content does, and only the track hears about that.
      const observer = new ResizeObserver(measure);
      observer.observe(viewport);
      if (trackRef.current) observer.observe(trackRef.current);
      return () => observer.disconnect();
    }, [measure]);

    // A shorter list can leave the index past the end of it.
    useEffect(() => {
      setIndex((current) => Math.min(current, infinite ? current : Math.max(0, count - 1)));
    }, [count, infinite]);

    const go = useCallback(
      (delta: number) => {
        setAnimated(true);
        setIndex((current) => {
          const next = current + delta;
          return infinite ? next : Math.max(0, Math.min(maxIndex, next));
        });
      },
      [infinite, maxIndex],
    );

    const goTo = useCallback(
      (target: number) => {
        setAnimated(true);
        setIndex((current) => {
          if (!infinite) return Math.max(0, Math.min(maxIndex, target));
          // Take whichever way round is shorter, so a marker near the end of
          // the run does not walk the whole track to reach a neighbour.
          const here = ((current % count) + count) % count;
          const forward = (((target - here) % count) + count) % count;
          return current + (forward <= count - forward ? forward : forward - count);
        });
      },
      [count, infinite, maxIndex],
    );

    /**
     * Put the index back inside the real copy once the motion has finished.
     *
     * Switching the transition off for one frame is what makes the jump
     * invisible: the index changes by a whole copy and the transform changes
     * by exactly one copy's width, so the pixels are identical.
     */
    const handleTransitionEnd = useCallback(
      (event: React.TransitionEvent<HTMLDivElement>) => {
        // `transitionend` bubbles, so a tile animating its own background would
        // otherwise be read as the track arriving.
        if (event.target !== trackRef.current || event.propertyName !== "transform") return;
        if (!infinite || count === 0) return;
        if (index >= 0 && index < count) return;
        setAnimated(false);
        setIndex(((index % count) + count) % count);
      },
      [count, index, infinite],
    );

    /**
     * Put the transition back one frame after the wrap-around jump — but not
     * while a drag is in progress.
     *
     * Without the `dragging` guard this fires for any `animated === false`,
     * and a drag is the other thing that sets it false. One frame in, the
     * transition came back on, and every `dragPx` update after that was eased
     * over `--transition-duration-macro-long` instead of applied: the track
     * crawled toward the pointer at 0.6s a step and never caught up. Measured
     * before the guard — a 164px drag moved the track 46px, in increments of
     * 40, 1, 2, 3. It only looked right on release because the commit works
     * from the raw pointer delta, not from where the track had got to.
     */
    useEffect(() => {
      if (animated || dragging) return;
      const frame = requestAnimationFrame(() => setAnimated(true));
      return () => cancelAnimationFrame(frame);
    }, [animated, dragging]);

    const drag = useRef({
      active: false,
      axis: null as null | "x" | "y",
      startX: 0,
      startY: 0,
      lastX: 0,
      lastT: 0,
      velocity: 0,
      moved: false,
    });

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggable || tileStep === 0 || event.button !== 0) return;
      drag.current = {
        active: true,
        axis: null,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastT: event.timeStamp,
        velocity: 0,
        moved: false,
      };
    };

    const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      const state = drag.current;
      if (!state.active) return;

      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;

      /**
       * Which axis this gesture belongs to is decided once, on the first
       * movement past the threshold, and never revisited.
       *
       * A carousel that takes every gesture takes vertical ones too, and on a
       * phone that means the page stops scrolling wherever a carousel happens
       * to be. Deciding once rather than per-event also stops a diagonal drag
       * from flickering between the two.
       */
      if (state.axis === null) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
        state.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (state.axis === "y") {
          state.active = false;
          return;
        }
        event.currentTarget.setPointerCapture(event.pointerId);
        setAnimated(false);
        setDragging(true);
      }

      const elapsed = event.timeStamp - state.lastT;
      if (elapsed > 0) state.velocity = (event.clientX - state.lastX) / elapsed;
      state.lastX = event.clientX;
      state.lastT = event.timeStamp;
      state.moved = true;

      // Past either end there is nothing to show, so the track follows at a
      // fraction of the pointer and springs back on release.
      let offset = dx;
      if (!infinite) {
        const over = index - dx / tileStep;
        if (over < 0) offset = dx * RUBBER_BAND;
        else if (over > maxIndex) offset = dx * RUBBER_BAND;
      }
      setDragPx(offset);
    };

    const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
      const state = drag.current;
      if (!state.active || state.axis !== "x") {
        drag.current.active = false;
        setDragging(false);
        return;
      }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      const dx = event.clientX - state.startX;
      const travelled = -dx / tileStep;
      const flicked = Math.abs(state.velocity) > FLICK_VELOCITY;
      const committed = Math.abs(travelled) > COMMIT_RATIO || flicked;
      // A flick is a direction, not a distance: it moves one tile whichever
      // way it was thrown, even if the pointer barely left where it started.
      const delta = committed
        ? Math.abs(travelled) < 1
          ? Math.sign(travelled) || -Math.sign(state.velocity)
          : Math.round(travelled)
        : 0;

      state.active = false;
      setDragging(false);
      setDragPx(0);
      go(delta);
    };

    /**
     * A drag that ends on a tile must not also open it.
     *
     * The pointer goes down and up on the same anchor, so the browser fires a
     * click regardless of how far it travelled in between. This swallows that
     * one click during the capture phase, before it reaches the tile.
     */
    const onClickCapture = (event: React.MouseEvent) => {
      if (!drag.current.moved) return;
      drag.current.moved = false;
      event.preventDefault();
      event.stopPropagation();
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-step);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        go(step);
      }
    };

    const active = count > 0 ? ((index % count) + count) % count : 0;
    const canGoBack = infinite || index > 0;
    const canGoForward = infinite || index < maxIndex;

    const isTopPlacement = controlPlacement.startsWith("top");
    const markerSide = markers === true ? (isTopPlacement ? "bottom" : "top") : markers;

    const controls = (
      <Row fillWidth gap="8" horizontal={getHorizontalAlignment(controlPlacement)}>
        <IconButton
          icon="chevronLeft"
          aria-label="Previous"
          onClick={() => go(-step)}
          disabled={!canGoBack}
          style={{ border: "none" }}
        />
        <IconButton
          icon="chevronRight"
          aria-label="Next"
          onClick={() => go(step)}
          disabled={!canGoForward}
          style={{ border: "none" }}
        />
      </Row>
    );

    const markerRow = markerSide ? (
      <Row fillWidth gap="8" horizontal="center" vertical="center" paddingY="4">
        {items.map((_, i) => (
          <button
            // The list is positional and its entries are arbitrary nodes, so
            // there is no id here to key on.
            // biome-ignore lint/suspicious/noArrayIndexKey: no stable id exists
            key={i}
            type="button"
            className={styles.marker}
            data-active={i === active ? "true" : undefined}
            aria-label={`Go to item ${i + 1} of ${count}`}
            aria-current={i === active ? "true" : undefined}
            onClick={() => goTo(i)}
          />
        ))}
      </Row>
    ) : null;

    /**
     * Where the track really is, between two indices, while it is being moved.
     *
     * The settled `index` is a whole number and would step the scaling from
     * one tile to the next, which is the opposite of what this is for: the
     * point is that a tile grows as you drag it towards the front rather than
     * snapping when it arrives. `dragPx` is the live offset, so dividing it by
     * the tile pitch gives the fraction of a step the track has travelled, and
     * the sign is negative because dragging right shows earlier items.
     */
    const falloff =
      proximity === true ? PROXIMITY_FALLOFF : typeof proximity === "number" ? proximity : 0;
    const scaling = falloff > 0 && tileStep > 0;
    const front = index - (tileStep > 0 ? dragPx / tileStep : 0);

    const offset = -(index + origin) * tileStep + dragPx;

    return (
      <Column ref={ref} fillWidth gap="8" aria-roledescription="carousel">
        {/*
          Laid out in the order it is read, rather than as a column reversed
          when the controls sit underneath. Reversing the column reverses
          everything in it, so `markers="top"` in a `bottom-*` placement came
          out underneath the controls — the markers' own side is not the
          controls' side to decide.
        */}
        {markerSide === "top" && markerRow}
        {isTopPlacement && controls}

        <Flex
          ref={viewportRef}
          fillWidth
          className={clip ? styles.viewportClipped : styles.viewport}
          data-dragging={dragging ? "true" : undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          onKeyDown={onKeyDown}
          // The track is the thing you move, so it is the thing that takes
          // focus and answers the arrow keys.
          tabIndex={0}
          role="group"
          aria-label="Items"
        >
          <Row
            ref={trackRef}
            gap="8"
            className={styles.track}
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform: `translate3d(${offset}px, 0, 0)`,
              // Spread rather than `transition: animated ? undefined : "none"`.
              // The style object is passed through before it reaches the DOM
              // and an `undefined` value survives that trip as the string
              // "undefined", which is not a valid transition and overrides the
              // one on the class — so the track moved instantly, no
              // `transitionend` ever fired, and the wrap-around never
              // normalised. An absent key cannot be stringified.
              ...(animated ? {} : { transition: "none" }),
            }}
          >
            {rendered.map((item, i) => {
              const scale = scaling
                ? Math.max(PROXIMITY_FLOOR, 1 - falloff * Math.abs(i - origin - front))
                : 1;
              return (
                <Column
                  // Same as above, and with wrap-around the same item appears in
                  // three copies, so its own identity would not be unique either.
                  // biome-ignore lint/suspicious/noArrayIndexKey: no stable id exists
                  key={i}
                  className={styles.tile}
                  // The one sizing default that stays. A tile with no width of
                  // its own sizes to its content, which is fine for a card of
                  // text and collapses to nothing for anything that fills its
                  // parent — so the out-of-the-box carousel would depend on what
                  // was put in it. `minWidth` is a floor, not a shape: content
                  // wider than this still sets the tile's width.
                  minWidth={20}
                  // Only the middle copy is the real run; the other two are
                  // scenery and must not be read out or tabbed into.
                  aria-hidden={infinite && (i < origin || i >= origin + count) ? "true" : undefined}
                  {...tile}
                  style={{
                    ...tile.style,
                    // Only when asked. Off, a tile carries no transform at all,
                    // so it never becomes a containing block for whatever the
                    // caller positioned inside it.
                    ...(scaling
                      ? {
                          transform: `scale(${scale})`,
                          // Follows the pointer during a drag and eases with the
                          // track afterwards, the same rule the track itself
                          // uses — and for the same reason, spread rather than
                          // set to `undefined`.
                          ...(animated ? {} : { transition: "none" }),
                        }
                      : {}),
                  }}
                >
                  {item}
                </Column>
              );
            })}
          </Row>
        </Flex>

        {!isTopPlacement && controls}
        {markerSide === "bottom" && markerRow}
      </Column>
    );
  },
);

ScrollContainer.displayName = "ScrollContainer";

export { ScrollContainer };
