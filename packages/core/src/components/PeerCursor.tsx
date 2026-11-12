"use client";

import classNames from "clsx";
import type React from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { LeafPropsOf } from "../interfaces.js";
import { type Schemes, schemes } from "../types.js";
import styles from "./PeerCursor.module.scss";
import { Text } from "./Text.js";

/** The fixed palette hues a peer cursor takes. */
export type PeerCursorScheme = Schemes;

/** One collaborator's pointer, as `PeerCursors` takes them. */
export interface PeerCursorData {
  /** Stable id of the person or session; also picks the default colour. */
  id: string;
  /** The name on the label. */
  name: string;
  /** Pointer position, in the units `PeerCursors` reads (a fraction of the box by default). */
  x: number;
  y: number;
  /** The cursor's hue. Left out, `peerColor(id)` picks one, the same on every screen. */
  scheme?: PeerCursorScheme;
  /** A short live message in a bubble under the pointer (cursor chat). */
  message?: string;
  /** A picture beside the name. */
  avatar?: string;
  /** Not moving for a while: the label folds away and only the pointer stays. */
  idle?: boolean;
}

/**
 * The same hue for the same id on every screen, so a collaborator keeps their
 * colour wherever they show up. A small string hash over `schemes`.
 */
export function peerColor(id: string): PeerCursorScheme {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (Math.imul(hash, 31) + id.charCodeAt(i)) | 0;
  return schemes[Math.abs(hash) % schemes.length] as PeerCursorScheme;
}

// Hues light enough that white text on them is hard to read take dark text.
const LIGHT_SCHEMES = new Set<PeerCursorScheme>([
  "yellow",
  "moss",
  "aqua",
  "cyan",
  "green",
  "emerald",
  "orange",
]);

interface PeerCursorProps extends Omit<PeerCursorData, "id" | "x" | "y">, LeafPropsOf<"div"> {
  id?: string;
  /** Position in px from the top left of the nearest positioned ancestor. */
  x: number;
  y: number;
  /**
   * Glide to each new position instead of jumping. Positions from the network
   * arrive a few times a second; the glide fills the frames between them.
   * Off under reduced motion. Default `true`.
   */
  smooth?: boolean;
}

// Time constant of the glide, in ms: about 1/(rate of updates) keeps it
// close behind without visible steps at 20-30 updates a second.
const GLIDE_MS = 60;
// Farther than this in one update (a jump across the screen, a re-join) moves at once.
const TELEPORT_PX = 1200;

/**
 * A collaborator's pointer: an arrow in their colour with their name on a
 * label, gliding to each position it is given. It draws only; it knows
 * nothing about where positions come from. Place it in a positioned box
 * (`PeerCursors` does) with `x` and `y` in px. It never takes the pointer.
 *
 * It moves by writing `transform` each frame, without a React render, so a
 * room full of cursors costs no re-renders between network updates.
 */
export const PeerCursor = ({
  ref,
  id,
  name,
  x,
  y,
  scheme,
  message,
  avatar,
  idle = false,
  smooth = true,
  className,
  style,
  ...rest
}: PeerCursorProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x, y });
  const current = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef(0);
  const last = useRef(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const paint = useCallback((px: number, py: number) => {
    const node = nodeRef.current;
    if (!node) return;
    node.style.transform = `translate3d(${px}px, ${py}px, 0) scale(var(--peer-cursor-scale, 1))`;
  }, []);

  const step = useCallback(
    (now: number) => {
      frame.current = 0;
      const pos = current.current;
      if (!pos) return;
      const dt = last.current ? Math.min(now - last.current, 100) : 16;
      last.current = now;
      const k = 1 - Math.exp(-dt / GLIDE_MS);
      pos.x += (target.current.x - pos.x) * k;
      pos.y += (target.current.y - pos.y) * k;
      const done =
        Math.abs(target.current.x - pos.x) < 0.25 && Math.abs(target.current.y - pos.y) < 0.25;
      if (done) {
        pos.x = target.current.x;
        pos.y = target.current.y;
        last.current = 0;
      }
      paint(pos.x, pos.y);
      if (!done) frame.current = requestAnimationFrame(step);
    },
    [paint],
  );

  // Before paint, so the first frame is already in place.
  useLayoutEffect(() => {
    target.current = { x, y };
    const pos = current.current;
    const far = pos && Math.hypot(x - pos.x, y - pos.y) > TELEPORT_PX;
    if (!pos || !smooth || reduced || far) {
      current.current = { x, y };
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
      last.current = 0;
      paint(x, y);
      return;
    }
    if (!frame.current) frame.current = requestAnimationFrame(step);
  }, [x, y, smooth, reduced, paint, step]);

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const hue = scheme ?? peerColor(id ?? name);

  return (
    <div
      {...rest}
      ref={(node) => {
        nodeRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={classNames(styles.cursor, LIGHT_SCHEMES.has(hue) && styles.light, className)}
      data-idle={idle && !message ? "" : undefined}
      style={
        {
          "--peer-cursor-color": `var(--scheme-${hue}-600)`,
          ...style,
        } as React.CSSProperties
      }
    >
      <svg className={styles.arrow} width="18" height="20" viewBox="0 0 18 20" aria-hidden="true">
        <path
          d="M1.5 1.6 16 8.9c.7.4.6 1.4-.2 1.6l-5.9 1.6c-.3.1-.6.3-.7.6l-2.6 5.6c-.3.7-1.4.7-1.6-.1L1 2.3c-.1-.5.3-.9.5-.7Z"
          fill="var(--peer-cursor-color)"
          stroke="var(--static-white)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <div className={classNames(styles.label, message && styles.bubble)}>
        <span className={styles.name}>
          {avatar && (
            // biome-ignore lint/performance/noImgElement: a 16px avatar from any host, decorative
            <img className={styles.avatar} src={avatar} alt="" />
          )}
          <Text textVariant="label-default-s">{name}</Text>
        </span>
        {message && (
          <Text as="div" className={styles.message} textVariant="body-default-s">
            {message}
          </Text>
        )}
      </div>
    </div>
  );
};

PeerCursor.displayName = "PeerCursor";

interface PeerCursorsProps extends LeafPropsOf<"div"> {
  /** Everyone else's pointer. Leave yourself out. */
  peers: PeerCursorData[];
  /**
   * What `x` and `y` mean. `"fraction"` (default): 0 to 1 across this box,
   * so people on different screen sizes point at the same spot of a
   * fluid layout. `"px"`: px from its top left, for a fixed-size surface such
   * as a canvas's world layer.
   */
  units?: "fraction" | "px";
  /**
   * Maps a peer's position to px in this box after `units`, e.g. a canvas
   * camera's world-to-screen. Inside a world layer that pans and zooms, leave
   * it out and pass `scale` instead.
   */
  project?: (x: number, y: number) => { x: number; y: number };
  /**
   * Scale applied to each cursor, about its tip. Inside a zoomed layer pass
   * `1 / zoom` so cursors keep their size. Also read from the CSS variable
   * `--peer-cursor-scale`, which a parent can set instead.
   */
  scale?: number;
  /** Glide between positions. Default `true`. */
  smooth?: boolean;
}

/**
 * A layer that draws collaborators' pointers over its positioned parent: it
 * fills it (`position: absolute; inset: 0`) and never takes the pointer. Feed
 * it `peers` from any realtime source; `usePeerPointer` reports your own
 * pointer in the same units.
 */
export const PeerCursors = ({
  ref,
  peers,
  units = "fraction",
  project,
  scale,
  smooth = true,
  className,
  style,
  ...rest
}: PeerCursorsProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node || units !== "fraction") return;
    const measure = () => setSize({ width: node.clientWidth, height: node.clientHeight });
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [units]);

  return (
    <div
      {...rest}
      ref={(node) => {
        nodeRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={classNames(styles.layer, className)}
      aria-hidden="true"
      style={
        {
          ...(scale !== undefined ? { "--peer-cursor-scale": scale } : null),
          ...style,
        } as React.CSSProperties
      }
    >
      {(units === "px" || size.width > 0) &&
        peers.map((peer) => {
          let px = units === "fraction" ? peer.x * size.width : peer.x;
          let py = units === "fraction" ? peer.y * size.height : peer.y;
          if (project) ({ x: px, y: py } = project(px, py));
          return (
            <PeerCursor
              key={peer.id}
              id={peer.id}
              name={peer.name}
              x={px}
              y={py}
              scheme={peer.scheme}
              message={peer.message}
              avatar={peer.avatar}
              idle={peer.idle}
              smooth={smooth}
            />
          );
        })}
    </div>
  );
};

PeerCursors.displayName = "PeerCursors";

interface UsePeerPointerOptions {
  /** Least time between reports, in ms. Default 40 (25 a second). */
  interval?: number;
  /** Units to report in, matching `PeerCursors`. Default `"fraction"`. */
  units?: "fraction" | "px";
  /** Maps px in the element to your own coordinates (a canvas's screen-to-world); wins over `units`. */
  unproject?: (x: number, y: number) => { x: number; y: number };
  /** Stop reporting. */
  disabled?: boolean;
}

/**
 * Reports your pointer over `ref`'s element, throttled, ready to send to
 * others: `{ x, y }` in `units`, or `null` when it leaves. Touch is left out:
 * a finger has no hover position. The last move before a pause is always sent.
 */
export function usePeerPointer(
  ref: React.RefObject<HTMLElement | null>,
  onMove: (position: { x: number; y: number } | null) => void,
  { interval = 40, units = "fraction", unproject, disabled = false }: UsePeerPointerOptions = {},
) {
  const callback = useRef(onMove);
  const mapper = useRef(unproject);
  callback.current = onMove;
  mapper.current = unproject;

  useEffect(() => {
    const element = ref.current;
    if (!element || disabled) return;

    let lastSent = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending: { x: number; y: number } | null = null;

    const send = () => {
      timer = undefined;
      lastSent = performance.now();
      callback.current(pending);
    };

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = element.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      if (mapper.current) ({ x, y } = mapper.current(x, y));
      else if (units === "fraction") {
        x = rect.width ? x / rect.width : 0;
        y = rect.height ? y / rect.height : 0;
      }
      pending = { x, y };
      const wait = interval - (performance.now() - lastSent);
      if (wait <= 0) {
        if (timer) clearTimeout(timer);
        send();
      } else if (!timer) {
        timer = setTimeout(send, wait);
      }
    };

    const handleLeave = () => {
      if (timer) clearTimeout(timer);
      timer = undefined;
      pending = null;
      lastSent = performance.now();
      callback.current(null);
    };

    element.addEventListener("pointermove", handleMove);
    element.addEventListener("pointerleave", handleLeave);
    window.addEventListener("blur", handleLeave);
    return () => {
      if (timer) clearTimeout(timer);
      element.removeEventListener("pointermove", handleMove);
      element.removeEventListener("pointerleave", handleLeave);
      window.removeEventListener("blur", handleLeave);
    };
  }, [ref, interval, units, disabled]);
}

export default PeerCursor;
