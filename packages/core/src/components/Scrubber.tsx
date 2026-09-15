"use client";

import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Column, Flex, Row, Text } from ".";
import type { ColorScheme, SpacingToken } from "../types";

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
  /** Colour scheme for the block. Defaults to the track's, then `brand`. */
  scheme?: ColorScheme;
  /** Blocks out of moving and trimming without dimming the label. */
  locked?: boolean;
}

interface ScrubberTrack {
  id: string;
  blocks: ScrubberBlock[];
  height?: SpacingToken;
  scheme?: ColorScheme;
  /** Allow the block body to be dragged along the track. */
  movable?: boolean;
  /** Allow the block edges to be dragged to trim it. */
  resizable?: boolean;
  /** Clicking empty space on the track. Receives the time under the pointer. */
  onAdd?: (time: number) => void;
}

type DragTarget =
  | { kind: "seek" }
  | { kind: "block"; trackId: string; blockId: string; mode: "move" | "start" | "end" };

interface DragState {
  target: DragTarget;
  pointerStartX: number;
  blockStart: number;
  blockEnd: number;
}

// `onChange` and `onSelect` are both DOM handlers on the inherited
// HTMLAttributes — `onSelect` fires on text selection. Same collision the rest
// of 2.0 resolves the same way: omit the inherited declaration and declare our
// own, since neither native event is meaningful on a timeline.
interface ScrubberProps extends Omit<React.ComponentProps<typeof Flex>, "onChange" | "onSelect"> {
  /** Total length of the timeline. */
  duration: number;
  /** Playhead position. */
  value: number;
  /** Seek — fired by clicking or dragging anywhere on the tracks. */
  onChange: (time: number) => void;
  /**
   * Zero or more stacked tracks sharing one playhead. With none, the Scrubber
   * is a plain seek bar; with several it is an editor timeline.
   */
  tracks?: ScrubberTrack[];
  /** Currently selected block id. Controlled — pair with `onSelect`. */
  selected?: string | null;
  onSelect?: (blockId: string | null) => void;
  /**
   * A block was moved or trimmed. Absolute times, already clamped to
   * `[0, duration]`; clamp further (against neighbours, a minimum length)
   * in the handler and the block follows whatever you render back.
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
  ariaLabel?: string;
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

const Scrubber = forwardRef<HTMLDivElement, ScrubberProps>(
  (
    {
      duration,
      value,
      onChange,
      tracks = [],
      selected = null,
      onSelect,
      onBlockChange,
      onGestureStart,
      onBlockContextMenu,
      showTime = true,
      formatTime = defaultFormatTime,
      step,
      ariaLabel = "Seek",
      ...flex
    },
    ref,
  ) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<DragState | null>(null);
    const [dragging, setDragging] = useState(false);

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

    // Pointer events rather than mouse events: they cover mouse, pen and touch
    // in one path, which is the difference between a timeline that works on a
    // tablet and one that does not.
    useEffect(() => {
      if (!dragging) return;

      const onMove = (event: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag) return;

        if (drag.target.kind === "seek") {
          onChange(timeAt(event.clientX));
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
        const next =
          mode === "move"
            ? { start: drag.blockStart + delta, end: drag.blockEnd + delta }
            : mode === "start"
              ? { start: drag.blockStart + delta, end: drag.blockEnd }
              : { start: drag.blockStart, end: drag.blockEnd + delta };
        onBlockChange?.(trackId, blockId, { start: clamp(next.start), end: clamp(next.end) });
      };

      const onUp = () => {
        dragRef.current = null;
        setDragging(false);
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dragging, duration, onChange, onBlockChange, timeAt]);

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
      setDragging(true);
    };

    const keyStep = step ?? duration / 100;

    return (
      <Column ref={ref} fillWidth gap="8" {...flex}>
        <Column
          ref={trackRef}
          fillWidth
          gap="4"
          // Operable without a pointer: the playhead is the value, the track is
          // the range. Blocks stay pointer-driven, which is what they are.
          role="slider"
          tabIndex={0}
          aria-label={ariaLabel}
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={value}
          aria-valuetext={formatTime(value)}
          onKeyDown={(event: React.KeyboardEvent) => {
            if (event.key === "ArrowLeft") onChange(clamp(value - keyStep));
            else if (event.key === "ArrowRight") onChange(clamp(value + keyStep));
            else if (event.key === "Home") onChange(0);
            else if (event.key === "End") onChange(duration);
            else return;
            event.preventDefault();
          }}
          style={{ touchAction: "none" }}
        >
          {tracks.length === 0 && (
            <Row
              fillWidth
              height="8"
              radius="full"
              background="neutral-alpha-medium"
              cursor="pointer"
              overflow="hidden"
              onPointerDown={(event: React.PointerEvent) => {
                onChange(timeAt(event.clientX));
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
                if (track.onAdd) {
                  track.onAdd(timeAt(event.clientX));
                  return;
                }
                onSelect?.(null);
                onChange(timeAt(event.clientX));
                begin(event, { kind: "seek" });
              }}
            >
              {track.blocks.map((block) => {
                const isSelected = block.id === selected;
                const scheme = block.scheme ?? track.scheme ?? "brand";
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
                    // Selection has to read at a glance on a dense track, so it
                    // moves both the fill and the border a full step rather
                    // than nudging one of them.
                    background={isSelected ? `${scheme}-medium` : `${scheme}-alpha-weak`}
                    border={isSelected ? `${scheme}-strong` : `${scheme}-alpha-medium`}
                    cursor={movable ? "grab" : "pointer"}
                    transition="micro-medium"
                    style={{
                      left: `${pct(block.start)}%`,
                      // A zero-length block would otherwise be unclickable.
                      width: `${Math.max(0.5, pct(block.end - block.start))}%`,
                      userSelect: "none",
                    }}
                    onPointerDown={(event: React.PointerEvent) => {
                      if (event.button !== 0) return;
                      onSelect?.(block.id);
                      if (movable) {
                        begin(event, { kind: "block", trackId: track.id, blockId: block.id, mode: "move" }, block);
                      } else {
                        event.stopPropagation();
                        onChange(timeAt(event.clientX));
                        begin(event, { kind: "seek" });
                      }
                    }}
                    onContextMenu={(event: React.MouseEvent) =>
                      onBlockContextMenu?.(event, track.id, block.id)
                    }
                  >
                    {block.label && (
                      <Text
                        variant="label-default-xs"
                        onBackground={`${scheme}-medium`}
                        truncate
                        style={{ userSelect: "none" }}
                      >
                        {block.label}
                      </Text>
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
                          background={isSelected ? `${scheme}-alpha-strong` : "transparent"}
                          transition="micro-medium"
                          onPointerDown={(event: React.PointerEvent) => {
                            onSelect?.(block.id);
                            begin(event, { kind: "block", trackId: track.id, blockId: block.id, mode: "start" }, block);
                          }}
                        />
                        <Row
                          position="absolute"
                          top="0"
                          bottom="0"
                          right="0"
                          width="8"
                          cursor="ew-resize"
                          background={isSelected ? `${scheme}-alpha-strong` : "transparent"}
                          transition="micro-medium"
                          onPointerDown={(event: React.PointerEvent) => {
                            onSelect?.(block.id);
                            begin(event, { kind: "block", trackId: track.id, blockId: block.id, mode: "end" }, block);
                          }}
                        />
                      </>
                    )}
                  </Row>
                );
              })}
            </Row>
          ))}

          {tracks.length > 0 && (
            <Row
              position="absolute"
              top="0"
              bottom="0"
              solid="accent-strong"
              pointerEvents="none"
              zIndex={1}
              style={{ left: `${pct(value)}%`, width: "2px" }}
            />
          )}
        </Column>

        {showTime && (
          <Row fillWidth horizontal="between" textVariant="label-default-s" onBackground="neutral-weak">
            <Text family="code">{formatTime(value)}</Text>
            <Text family="code">{formatTime(duration)}</Text>
          </Row>
        )}
      </Column>
    );
  },
);

Scrubber.displayName = "Scrubber";

export { Scrubber };
export type { ScrubberProps, ScrubberBlock, ScrubberTrack };
