"use client";

import classNames from "clsx";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SpacingToken, Tone } from "../types.js";
import { Column } from "./Column.js";
import type { Flex } from "./Flex.js";
import { Row } from "./Row.js";
import styles from "./Scrubber.module.scss";
import { Text } from "./Text.js";

/**
 * A block on a track, positioned by time rather than by layout. Times are in
 * the same unit as the Scrubber's `duration` — milliseconds by convention,
 * though nothing here cares as long as they agree.
 */
interface ScrubberBlock {
  id: string;
  start: number;
  end: number;
  label?: React.ReactNode;
  /** The block's palette. Defaults to the track's, then `brand`. 2.x called this `scheme`. */
  tone?: Tone;
  /** Blocks out of moving and trimming without dimming the label. */
  locked?: boolean;
  /**
   * `gap` draws a range that is NOT in the output (a cut, a removed pause):
   * hatched, dashed, neutral. Pair it with a `label` that says why.
   */
  variant?: "solid" | "gap";
  /** A small pill in the block's corner: a speed ("4×"), a scale, a count. */
  badge?: React.ReactNode;
  /**
   * Drawn behind the label, filling the block: a `ScrubberFilmstrip`, a
   * `ScrubberWaveform`, or anything of your own.
   */
  content?: React.ReactNode;
  /**
   * Sweeps a shimmer across the block once. Set it on blocks that just
   * changed under the user (an AI rewrite, an undo) so the eye finds them.
   * The sweep replays whenever the value changes from false to true.
   */
  highlight?: boolean;
  /** Read out with the block and shown as its tooltip — the reason for a cut, say. */
  description?: string;
}

interface ScrubberTrack {
  id: string;
  blocks: ScrubberBlock[];
  height?: SpacingToken;
  /** The palette of the track's blocks. 2.x called this `scheme`. */
  tone?: Tone;
  /** Allow the block body to be dragged along the track. */
  movable?: boolean;
  /** Allow the block edges to be dragged to trim it. */
  resizable?: boolean;
  /** Clicking empty space on the track. Receives the time under the pointer. */
  onAdd?: (time: number) => void;
  /**
   * The track's name ("Video", "Voice-over"), in a header column to the left
   * of the tracks. Give one track a label and every track gets a header.
   */
  label?: React.ReactNode;
}

/** A point in time worth seeing: a click, a keyframe, a chapter. */
interface ScrubberMarker {
  id: string;
  time: number;
  /** Shown as the marker's tooltip and read out with it. */
  label?: string;
  tone?: Tone;
}

/** A span of the timeline, `start <= end`. */
interface ScrubberRange {
  start: number;
  end: number;
}

type DragTarget =
  | { kind: "seek" }
  | { kind: "range"; anchor: number }
  | { kind: "block"; trackId: string; blockId: string; mode: "move" | "start" | "end" };

interface DragState {
  target: DragTarget;
  pointerStartX: number;
  blockStart: number;
  blockEnd: number;
}

// `onChange` and `onSelect` are both DOM handlers on the inherited
// HTMLAttributes — `onSelect` fires on text selection. Neither native event is
// meaningful on a timeline, so both are omitted; the timeline's own states
// follow the 3.0 rule (`onValueChange`, `onSelectedChange`).
interface ScrubberProps extends Omit<React.ComponentProps<typeof Flex>, "onChange" | "onSelect"> {
  /** Total length of the timeline. */
  duration: number;
  /** Playhead position. */
  value: number;
  /** Seek — fired by clicking or dragging anywhere on the tracks. */
  onValueChange: (time: number) => void;
  /**
   * Zero or more stacked tracks sharing one playhead. With none, the Scrubber
   * is a plain seek bar; with several it is an editor timeline.
   */
  tracks?: ScrubberTrack[];
  /** Currently selected block id. Controlled — pair with `onSelectedChange`. */
  selected?: string | null;
  /** Called with the block id picked, or `null` when the selection clears. */
  onSelectedChange?: (blockId: string | null) => void;
  /**
   * A block was moved or trimmed. Absolute times, already clamped to
   * `[0, duration]` and snapped when `snap` is on; clamp further (against
   * neighbours, a minimum length) in the handler and the block follows
   * whatever you render back.
   */
  onBlockChange?: (trackId: string, blockId: string, next: { start: number; end: number }) => void;
  /** A drag gesture began — the moment to snapshot for undo. */
  onGestureStart?: () => void;
  /** Right-click on a block, for a caller-owned context menu. */
  onBlockContextMenu?: (event: React.MouseEvent, trackId: string, blockId: string) => void;
  /** Show the elapsed and total time below the tracks. */
  showTime?: boolean;
  /** Defaults to `m:ss`, treating the values as milliseconds. */
  formatTime?: (time: number) => string;
  /** Keyboard step for the playhead. Defaults to 1/100th of `duration`. */
  step?: number;
  /**
   * A time ruler above the tracks: ticks at a round interval for the
   * duration (1 s, 5 s, 30 s, 1 min…), labelled with `formatTime`. Pressing
   * it seeks. Assumes milliseconds, like `formatTime`'s default.
   */
  ruler?: boolean;
  /** The width of the track header column, when tracks have labels. Default "8rem". */
  labelWidth?: string;
  /** Points drawn on the ruler (or the top track) and snapped to. */
  markers?: ScrubberMarker[];
  /**
   * Dragged block edges stick to other edges, markers and the playhead when
   * they come within this many pixels. `true` is 8. A guide line shows the
   * time it stuck to.
   */
  snap?: boolean | number;
  /**
   * Horizontal magnification, 1 (whole timeline fits) and up. Ctrl or Cmd
   * with the wheel, or a pinch, zooms around the pointer; the timeline then
   * scrolls sideways and keeps the playhead in view while it plays.
   */
  zoom?: number;
  defaultZoom?: number;
  onZoomChange?: (zoom: number) => void;
  /** The most `zoom` may reach. Default 40. */
  maxZoom?: number;
  /**
   * A selected span. Shift-drag on the ruler or an empty track draws one;
   * a plain click clears it. Controlled — pair with `onRangeChange`.
   */
  range?: ScrubberRange | null;
  onRangeChange?: (range: ScrubberRange | null) => void;
  /**
   * What to show above the pointer while it hovers the tracks — a frame of
   * the video at that time, usually. The time is shown under it either way.
   */
  renderPreview?: (time: number) => React.ReactNode;
}

/** Round tick intervals, in milliseconds. */
const TICKS = [
  100, 250, 500, 1_000, 2_000, 5_000, 10_000, 15_000, 30_000, 60_000, 120_000, 300_000, 600_000,
  900_000, 1_800_000, 3_600_000,
];

/** The smallest round interval that puts at most `max` ticks on the ruler. */
export function rulerInterval(duration: number, max = 10): number {
  if (duration <= 0) return 0;
  return TICKS.find((tick) => duration / tick <= max) ?? Math.ceil(duration / max);
}

/**
 * The nearest candidate within `threshold` of `time`, or `time` itself.
 * `guide` is the candidate it stuck to, for drawing the snap line.
 */
export function snapTime(
  time: number,
  candidates: number[],
  threshold: number,
): { time: number; guide: number | null } {
  let best: number | null = null;
  for (const candidate of candidates) {
    const distance = Math.abs(candidate - time);
    if (distance <= threshold && (best === null || distance < Math.abs(best - time))) {
      best = candidate;
    }
  }
  return best === null ? { time, guide: null } : { time: best, guide: best };
}

/**
 * Where to scroll so the time under the pointer stays under it after a zoom.
 * `pointerX` is measured from the scroller's left edge, in pixels.
 */
export function scrollForZoom(
  scrollLeft: number,
  pointerX: number,
  fromZoom: number,
  toZoom: number,
): number {
  if (fromZoom <= 0) return 0;
  return Math.max(0, ((scrollLeft + pointerX) / fromZoom) * toZoom - pointerX);
}

/** `m:ss` — enough for a clip, and it grows its own hours field if needed. */
function defaultFormatTime(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const seconds = total % 60;
  const minutes = Math.floor(total / 60) % 60;
  const hours = Math.floor(total / 3600);
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  return `${hours > 0 ? `${hours}:` : ""}${mm}:${String(seconds).padStart(2, "0")}`;
}

const SNAP_PX = 8;

const Scrubber = ({
  ref,
  duration,
  value,
  onValueChange,
  tracks = [],
  selected = null,
  onSelectedChange,
  onBlockChange,
  onGestureStart,
  onBlockContextMenu,
  showTime = true,
  formatTime = defaultFormatTime,
  step,
  ruler = false,
  labelWidth = "8rem",
  markers = [],
  snap = false,
  zoom: zoomProp,
  defaultZoom = 1,
  onZoomChange,
  maxZoom = 40,
  range = null,
  onRangeChange,
  renderPreview,
  "aria-label": ariaLabel = "Seek",
  ...flex
}: ScrubberProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState<DragTarget | null>(null);
  const [guide, setGuide] = useState<number | null>(null);
  const [hover, setHover] = useState<{ time: number; x: number } | null>(null);

  const [innerZoom, setInnerZoom] = useState(defaultZoom);
  const zoom = Math.min(maxZoom, Math.max(1, zoomProp ?? innerZoom));
  const setZoom = useCallback(
    (next: number) => {
      const clamped = Math.min(maxZoom, Math.max(1, next));
      if (zoomProp === undefined) setInnerZoom(clamped);
      onZoomChange?.(clamped);
    },
    [maxZoom, zoomProp, onZoomChange],
  );

  const pct = (time: number) => (duration > 0 ? (time / duration) * 100 : 0);
  const clamp = (time: number) => Math.min(duration, Math.max(0, time));

  const timeAt = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el || duration <= 0) return 0;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return 0;
      return Math.min(duration, Math.max(0, ((clientX - rect.left) / rect.width) * duration));
    },
    [duration],
  );

  // Everything a dragged edge may stick to, except the block being dragged.
  const snapCandidates = (exceptId: string) => {
    const times = [0, duration, value, ...markers.map((marker) => marker.time)];
    for (const track of tracks) {
      for (const block of track.blocks) {
        if (block.id === exceptId) continue;
        times.push(block.start, block.end);
      }
    }
    return times;
  };
  const snapPx = snap === true ? SNAP_PX : typeof snap === "number" ? snap : 0;

  // Pointer events rather than mouse events: they cover mouse, pen and touch
  // in one path, which is the difference between a timeline that works on a
  // tablet and one that does not.
  // biome-ignore lint/correctness/useExhaustiveDependencies: clamp and snapCandidates read the latest props each render; the listeners rebind when the gesture or its inputs change
  useEffect(() => {
    if (!dragging) return;

    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      if (drag.target.kind === "seek") {
        onValueChange(timeAt(event.clientX));
        return;
      }
      if (drag.target.kind === "range") {
        const time = timeAt(event.clientX);
        const { anchor } = drag.target;
        onRangeChange?.({ start: Math.min(anchor, time), end: Math.max(anchor, time) });
        return;
      }

      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      // Measured from where the gesture started rather than accumulated per
      // move, so a clamped handler cannot make the block drift away from the
      // pointer over a long drag.
      const delta = ((event.clientX - drag.pointerStartX) / rect.width) * duration;
      const { trackId, blockId, mode } = drag.target;
      let next =
        mode === "move"
          ? { start: drag.blockStart + delta, end: drag.blockEnd + delta }
          : mode === "start"
            ? { start: drag.blockStart + delta, end: drag.blockEnd }
            : { start: drag.blockStart, end: drag.blockEnd + delta };

      let stuck: number | null = null;
      if (snapPx > 0) {
        const threshold = (snapPx / rect.width) * duration;
        const candidates = snapCandidates(blockId);
        if (mode === "start" || mode === "end") {
          const edge = mode === "start" ? next.start : next.end;
          const snapped = snapTime(edge, candidates, threshold);
          stuck = snapped.guide;
          next =
            mode === "start" ? { ...next, start: snapped.time } : { ...next, end: snapped.time };
        } else {
          // A moved block sticks by whichever edge is closer to something.
          const byStart = snapTime(next.start, candidates, threshold);
          const byEnd = snapTime(next.end, candidates, threshold);
          const startGap = byStart.guide === null ? Infinity : Math.abs(byStart.time - next.start);
          const endGap = byEnd.guide === null ? Infinity : Math.abs(byEnd.time - next.end);
          const length = next.end - next.start;
          if (startGap <= endGap && byStart.guide !== null) {
            next = { start: byStart.time, end: byStart.time + length };
            stuck = byStart.guide;
          } else if (byEnd.guide !== null) {
            next = { start: byEnd.time - length, end: byEnd.time };
            stuck = byEnd.guide;
          }
        }
      }
      setGuide(stuck);
      onBlockChange?.(trackId, blockId, { start: clamp(next.start), end: clamp(next.end) });
    };

    const onUp = () => {
      dragRef.current = null;
      setDragging(null);
      setGuide(null);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    const previousSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      document.body.style.userSelect = previousSelect;
    };
  }, [dragging, duration, onValueChange, onBlockChange, onRangeChange, timeAt, snapPx]);

  // Ctrl/Cmd + wheel (and trackpad pinch, which browsers report the same
  // way) zooms around the pointer. Bound by hand because React's wheel
  // listener is passive and cannot stop the page from zooming instead.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const rect = scroller.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const next = Math.min(maxZoom, Math.max(1, zoom * Math.exp(-event.deltaY * 0.01)));
      if (next === zoom) return;
      const scrollLeft = scrollForZoom(scroller.scrollLeft, pointerX, zoom, next);
      setZoom(next);
      // After the wider content has laid out.
      requestAnimationFrame(() => {
        scroller.scrollLeft = scrollLeft;
      });
    };
    scroller.addEventListener("wheel", onWheel, { passive: false });
    return () => scroller.removeEventListener("wheel", onWheel);
  }, [zoom, maxZoom, setZoom]);

  // While playing (or stepping) past the visible edge, page the view along so
  // the playhead never runs off. Not during a drag: the user is steering.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pct is pure arithmetic on duration
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || zoom <= 1 || dragging) return;
    const width = scroller.clientWidth;
    const x = (pct(value) / 100) * scroller.scrollWidth;
    if (x < scroller.scrollLeft || x > scroller.scrollLeft + width - 16) {
      scroller.scrollLeft = Math.max(0, x - width * 0.2);
    }
  }, [value, zoom, dragging]);

  const begin = (event: React.PointerEvent, target: DragTarget, block?: ScrubberBlock) => {
    if (event.button !== 0) return;
    if (target.kind === "block") {
      event.stopPropagation();
      onGestureStart?.();
    }
    dragRef.current = {
      target,
      pointerStartX: event.clientX,
      blockStart: block?.start ?? 0,
      blockEnd: block?.end ?? 0,
    };
    setDragging(target);
  };

  /** A press on the ruler or an empty track: seek, or draw a range with Shift. */
  const pressBackground = (event: React.PointerEvent) => {
    const time = timeAt(event.clientX);
    if (event.shiftKey && onRangeChange) {
      onRangeChange({ start: time, end: time });
      begin(event, { kind: "range", anchor: time });
      return;
    }
    if (range && onRangeChange) onRangeChange(null);
    onValueChange(time);
    begin(event, { kind: "seek" });
  };

  const keyStep = step ?? duration / 100;
  const interval = ruler ? rulerInterval(duration, Math.round(10 * zoom)) : 0;
  const ticks =
    interval > 0
      ? Array.from({ length: Math.floor(duration / interval) + 1 }, (_, index) => index * interval)
      : [];
  const labelled = tracks.some((track) => track.label !== undefined);
  const rulerHeight = "32";
  const draggedBlockId = dragging?.kind === "block" ? dragging.blockId : null;

  const timeline = (
    <Column
      ref={trackRef}
      gap="4"
      // Operable without a pointer: the playhead is the value, the track is
      // the range. Blocks stay pointer-driven, which is what they are.
      role="slider"
      tabIndex={0}
      // The slider is what gets named, not the outer column the rest of
      // the props land on.
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={value}
      aria-valuetext={formatTime(value)}
      onKeyDown={(event: React.KeyboardEvent) => {
        // Up and Down step too, as on any slider; they used to scroll the page.
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          onValueChange(clamp(value - keyStep));
        } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          onValueChange(clamp(value + keyStep));
        } else if (event.key === "Home") onValueChange(0);
        else if (event.key === "End") onValueChange(duration);
        else if ((event.key === "=" || event.key === "+") && tracks.length > 0) setZoom(zoom * 1.5);
        else if (event.key === "-" && tracks.length > 0) setZoom(zoom / 1.5);
        else return;
        event.preventDefault();
      }}
      onPointerMove={(event: React.PointerEvent) => {
        if (tracks.length === 0 || dragging || event.pointerType === "touch") return;
        const outer = scrollerRef.current?.getBoundingClientRect();
        setHover({ time: timeAt(event.clientX), x: event.clientX - (outer?.left ?? 0) });
      }}
      onPointerLeave={() => setHover(null)}
      style={{ touchAction: "none", width: `${zoom * 100}%`, minWidth: "100%" }}
    >
      {ruler && (
        <Row
          fillWidth
          height={rulerHeight}
          cursor="pointer"
          borderBottom
          onPointerDown={(event: React.PointerEvent) => {
            if (event.button !== 0) return;
            pressBackground(event);
          }}
        >
          {ticks.map((tick, index) => (
            <Row
              key={tick}
              position="absolute"
              bottom="0"
              pointerEvents="none"
              vertical="end"
              style={{
                left: `${pct(tick)}%`,
                // The first label starts at the edge, the last ends at it,
                // the rest centre on their tick.
                transform:
                  index === 0
                    ? undefined
                    : tick >= duration
                      ? "translateX(-100%)"
                      : "translateX(-50%)",
              }}
            >
              <Text
                family="code"
                textVariant="label-default-xs"
                onBackground="neutral-weak"
                marginBottom="8"
                style={{ userSelect: "none", whiteSpace: "nowrap" }}
              >
                {formatTime(tick)}
              </Text>
            </Row>
          ))}
          {/* Minor ticks between the labelled ones, the way a ruler reads. */}
          {ticks.flatMap((tick) =>
            [0, 1, 2, 3, 4]
              .map((minor) => tick + (minor * interval) / 5)
              .filter((time) => time <= duration)
              .map((time, minor) => (
                <Row
                  key={`t${time}`}
                  position="absolute"
                  bottom="0"
                  pointerEvents="none"
                  aria-hidden
                  style={{
                    left: `${pct(time)}%`,
                    width: "1px",
                    height: minor === 0 ? "6px" : "3px",
                    background: "var(--neutral-alpha-strong)",
                  }}
                />
              )),
          )}
          {markers.map((marker) => (
            <Row
              key={marker.id}
              position="absolute"
              bottom="0"
              width="8"
              height="8"
              radius="full"
              solid={`${marker.tone ?? "neutral"}-strong`}
              role="img"
              aria-label={marker.label ?? formatTime(marker.time)}
              title={marker.label}
              style={{ left: `${pct(marker.time)}%`, transform: "translate(-50%, 50%)" }}
            />
          ))}
        </Row>
      )}
      {tracks.length === 0 && (
        <Row
          fillWidth
          height="8"
          radius="full"
          background="neutral-alpha-medium"
          cursor="pointer"
          overflow="hidden"
          onPointerDown={(event: React.PointerEvent) => {
            onValueChange(timeAt(event.clientX));
            begin(event, { kind: "seek" });
          }}
        >
          <Row
            fillHeight
            solid="brand-strong"
            pointerEvents="none"
            style={{ width: `${pct(value)}%` }}
          />
        </Row>
      )}

      {tracks.map((track) => (
        <Row
          key={track.id}
          fillWidth
          height={track.height ?? "40"}
          radius="s"
          cursor={track.onAdd ? "copy" : "pointer"}
          onPointerDown={(event: React.PointerEvent) => {
            // Only the track's own background — a block sits on top and
            // handles its own gestures.
            if (event.target !== event.currentTarget || event.button !== 0) return;
            if (track.onAdd && !event.shiftKey) {
              track.onAdd(timeAt(event.clientX));
              return;
            }
            onSelectedChange?.(null);
            pressBackground(event);
          }}
        >
          {track.blocks.map((block) => {
            const isSelected = block.id === selected;
            const isGap = block.variant === "gap";
            const tone = isGap ? "neutral" : (block.tone ?? track.tone ?? "brand");
            const movable = track.movable && !block.locked;
            const resizable = track.resizable && !block.locked;
            return (
              <Row
                key={block.id}
                position="absolute"
                top="0"
                bottom="0"
                center
                gap="8"
                overflow="hidden"
                radius="s"
                className={classNames(styles.block, {
                  [styles.gap]: isGap,
                  [styles.highlight]: block.highlight,
                  [styles.dragging]: block.id === draggedBlockId,
                })}
                // Selection has to read at a glance on a dense track, so it
                // moves both the fill and the border a full step rather
                // than nudging one of them.
                background={
                  isGap ? undefined : isSelected ? `${tone}-medium` : `${tone}-alpha-weak`
                }
                border={isGap ? undefined : isSelected ? `${tone}-strong` : `${tone}-alpha-medium`}
                cursor={movable ? "grab" : "pointer"}
                title={block.description}
                aria-label={
                  block.description ?? (typeof block.label === "string" ? block.label : undefined)
                }
                style={{
                  left: `${pct(block.start)}%`,
                  // A zero-length block would otherwise be unclickable.
                  width: `${Math.max(0.5 / zoom, pct(block.end - block.start))}%`,
                  userSelect: "none",
                  boxShadow: isSelected ? `0 0 0 3px var(--${tone}-alpha-weak)` : undefined,
                  borderColor: isGap && isSelected ? "var(--neutral-solid-strong)" : undefined,
                }}
                onPointerDown={(event: React.PointerEvent) => {
                  if (event.button !== 0) return;
                  onSelectedChange?.(block.id);
                  if (movable) {
                    begin(
                      event,
                      { kind: "block", trackId: track.id, blockId: block.id, mode: "move" },
                      block,
                    );
                  } else {
                    event.stopPropagation();
                    onValueChange(timeAt(event.clientX));
                    begin(event, { kind: "seek" });
                  }
                }}
                onContextMenu={(event: React.MouseEvent) =>
                  onBlockContextMenu?.(event, track.id, block.id)
                }
              >
                {block.content && (
                  <Row
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    pointerEvents="none"
                    overflow="hidden"
                  >
                    {block.content}
                  </Row>
                )}
                {block.label && (
                  <Text
                    textVariant="label-default-xs"
                    onBackground={`${tone}-medium`}
                    truncate
                    style={{
                      userSelect: "none",
                      position: "relative",
                      padding: "0 var(--static-space-8)",
                      borderRadius: "var(--radius-xs)",
                      // Over a filmstrip a bare label gets lost.
                      background: block.content ? "var(--page-background)" : undefined,
                    }}
                  >
                    {block.label}
                  </Text>
                )}
                {block.badge && (
                  <Row
                    position="absolute"
                    top="4"
                    right="4"
                    paddingX="4"
                    radius="xs"
                    solid={isGap ? "neutral-strong" : `${tone}-strong`}
                    pointerEvents="none"
                  >
                    <Text
                      textVariant="label-strong-xs"
                      onSolid={isGap ? "neutral-strong" : `${tone}-strong`}
                    >
                      {block.badge}
                    </Text>
                  </Row>
                )}
                {resizable && (
                  <>
                    <Row
                      position="absolute"
                      top="0"
                      bottom="0"
                      left="0"
                      width="8"
                      cursor="ew-resize"
                      background={isSelected ? `${tone}-alpha-strong` : "transparent"}
                      transition="micro-medium"
                      onPointerDown={(event: React.PointerEvent) => {
                        onSelectedChange?.(block.id);
                        begin(
                          event,
                          {
                            kind: "block",
                            trackId: track.id,
                            blockId: block.id,
                            mode: "start",
                          },
                          block,
                        );
                      }}
                    />
                    <Row
                      position="absolute"
                      top="0"
                      bottom="0"
                      right="0"
                      width="8"
                      cursor="ew-resize"
                      background={isSelected ? `${tone}-alpha-strong` : "transparent"}
                      transition="micro-medium"
                      onPointerDown={(event: React.PointerEvent) => {
                        onSelectedChange?.(block.id);
                        begin(
                          event,
                          { kind: "block", trackId: track.id, blockId: block.id, mode: "end" },
                          block,
                        );
                      }}
                    />
                  </>
                )}
              </Row>
            );
          })}
        </Row>
      ))}

      {range && range.end > range.start && (
        <Row
          position="absolute"
          top="0"
          bottom="0"
          background="brand-alpha-weak"
          pointerEvents="none"
          data-testid="scrubber-range"
          style={{
            left: `${pct(range.start)}%`,
            width: `${pct(range.end - range.start)}%`,
            borderLeft: "1px solid var(--brand-alpha-strong)",
            borderRight: "1px solid var(--brand-alpha-strong)",
          }}
        />
      )}

      {guide !== null && (
        <Row
          position="absolute"
          top="0"
          bottom="0"
          pointerEvents="none"
          zIndex={1}
          data-testid="scrubber-snap-guide"
          style={{
            left: `${pct(guide)}%`,
            width: "1px",
            background: "var(--brand-solid-strong)",
            opacity: 0.8,
          }}
        />
      )}

      {hover && tracks.length > 0 && (
        <Row
          position="absolute"
          top="0"
          bottom="0"
          pointerEvents="none"
          style={{
            left: `${pct(hover.time)}%`,
            width: "1px",
            background: "var(--neutral-alpha-strong)",
          }}
        />
      )}

      {tracks.length > 0 && (
        <Row
          position="absolute"
          top="0"
          bottom="0"
          solid="accent-strong"
          pointerEvents="none"
          zIndex={2}
          className={styles.playhead}
          style={{ left: `${pct(value)}%`, width: "2px", transform: "translateX(-1px)" }}
        >
          {ruler && (
            <Row
              position="absolute"
              top="0"
              width="12"
              height="12"
              solid="accent-strong"
              className={styles.handle}
              style={{ left: "-5px" }}
            />
          )}
        </Row>
      )}
    </Column>
  );

  const scroller = (
    <Row
      ref={scrollerRef}
      fillWidth
      minWidth={0}
      className={styles.scroller}
      style={{ overflowX: zoom > 1 ? "auto" : "hidden", overflowY: "hidden" }}
    >
      {timeline}
    </Row>
  );

  return (
    <Column ref={ref} fillWidth gap="8" {...flex}>
      <Row fillWidth gap="8" style={{ position: "relative" }}>
        {labelled && (
          <Column gap="4" style={{ width: labelWidth, flexShrink: 0 }}>
            {ruler && <Row height={rulerHeight} borderBottom aria-hidden />}
            {tracks.map((track) => (
              <Row
                key={track.id}
                height={track.height ?? "40"}
                vertical="center"
                gap="8"
                paddingX="8"
                radius="s"
                background="neutral-alpha-weak"
                minWidth={0}
              >
                <Row
                  width="8"
                  height="8"
                  radius="xs"
                  background={`${track.tone ?? "brand"}-alpha-strong`}
                  border={`${track.tone ?? "brand"}-strong`}
                  aria-hidden
                  style={{ flexShrink: 0 }}
                />
                <Text textVariant="label-default-s" onBackground="neutral-medium" truncate>
                  {track.label}
                </Text>
              </Row>
            ))}
          </Column>
        )}
        <Column flex={1} minWidth={0} style={{ position: "relative" }}>
          {hover && (
            <Column
              position="absolute"
              bottom="0"
              zIndex={3}
              pointerEvents="none"
              gap="4"
              horizontal="center"
              data-testid="scrubber-preview"
              style={{
                left: `${hover.x}px`,
                transform: "translate(-50%, calc(-1 * var(--static-space-8)))",
                bottom: "100%",
              }}
            >
              {renderPreview && (
                <Column
                  radius="m"
                  overflow="hidden"
                  border="neutral-alpha-medium"
                  background="surface"
                  shadow="l"
                >
                  {renderPreview(hover.time)}
                </Column>
              )}
              <Row
                paddingX="8"
                paddingY="2"
                radius="xs"
                background="surface"
                border="neutral-alpha-medium"
              >
                <Text family="code" textVariant="label-default-xs" onBackground="neutral-strong">
                  {formatTime(hover.time)}
                </Text>
              </Row>
            </Column>
          )}
          {scroller}
        </Column>
      </Row>

      {showTime && (
        <Row
          fillWidth
          horizontal="between"
          textVariant="label-default-s"
          onBackground="neutral-weak"
        >
          <Text family="code">{formatTime(value)}</Text>
          <Text family="code">{formatTime(duration)}</Text>
        </Row>
      )}
    </Column>
  );
};

Scrubber.displayName = "Scrubber";

interface ScrubberFilmstripProps {
  /** Frame image URLs, evenly spread over the block's time. */
  frames: string[];
}

/** Thumbnails across a block, for `ScrubberBlock.content`. */
const ScrubberFilmstrip = ({ frames = [] }: ScrubberFilmstripProps) => (
  <Row fill aria-hidden>
    {frames.map((src, index) => (
      // biome-ignore lint/performance/noImgElement: frames are blob or data URLs drawn at a few pixels; next/image would only add work
      <img
        // Frames repeat, so the index is the identity.
        // biome-ignore lint/suspicious/noArrayIndexKey: see above
        key={index}
        src={src}
        alt=""
        draggable={false}
        style={{
          flex: "1 1 0",
          minWidth: 0,
          height: "100%",
          objectFit: "cover",
          opacity: 0.85,
        }}
      />
    ))}
  </Row>
);
ScrubberFilmstrip.displayName = "ScrubberFilmstrip";

interface ScrubberWaveformProps {
  /** Loudness per slice, 0 to 1, evenly spread over the block's time. */
  peaks: number[];
  tone?: Tone;
}

/** A mirrored waveform across a block, for `ScrubberBlock.content`. */
const ScrubberWaveform = ({ peaks = [], tone = "brand" }: ScrubberWaveformProps) => {
  const count = Math.max(1, peaks.length);
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${count} 100`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {peaks.map((peak, index) => {
        const height = Math.max(2, Math.min(1, Math.max(0, peak)) * 84);
        return (
          <rect
            // biome-ignore lint/suspicious/noArrayIndexKey: slices are positional
            key={index}
            x={index + 0.15}
            y={50 - height / 2}
            width={0.7}
            height={height}
            rx={0.35}
            fill={`var(--${tone}-solid-medium)`}
          />
        );
      })}
    </svg>
  );
};
ScrubberWaveform.displayName = "ScrubberWaveform";

export type {
  ScrubberBlock,
  ScrubberFilmstripProps,
  ScrubberMarker,
  ScrubberProps,
  ScrubberRange,
  ScrubberTrack,
  ScrubberWaveformProps,
};
export { Scrubber, ScrubberFilmstrip, ScrubberWaveform };
