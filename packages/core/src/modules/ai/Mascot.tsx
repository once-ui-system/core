"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef, useCallback, useEffect, useId, useRef } from "react";
import { Flex } from "../../components/Flex";
import { type AudioLevelSource, createAudioMeter } from "./audioLevel";
import styles from "./Mascot.module.scss";

export type MascotState = "idle" | "listening" | "thinking" | "speaking" | "sleeping";
export type MascotMood = "neutral" | "happy" | "surprised" | "sad";

export interface MascotProps extends Omit<React.ComponentProps<typeof Flex>, "children"> {
  /** What the assistant is doing. Each state has its own pose and motion. */
  state?: MascotState;
  /** The expression on top of the state. */
  mood?: MascotMood;
  /** A scheme (`brand`, `accent`, `neutral`) or any CSS color. Every shade is derived from it. */
  color?: "brand" | "accent" | "neutral" | (string & {});
  /** From 0, a rounded square, through a squircle, to 1, a circle. */
  roundness?: number;
  /** Width over height of the body: below 1 is tall, above 1 is wide. */
  aspect?: number;
  /** Tall `pill`s, `round` dots or `wide` slits. */
  eyes?: "pill" | "round" | "wide";
  /** `pointer` follows the cursor, `{ x, y }` from -1 to 1 looks that way, `center` looks ahead. */
  lookAt?: "pointer" | "center" | { x: number; y: number };
  /** Loudness from 0 to 1 that makes the body pulse while speaking. Takes precedence over `source`. */
  level?: number;
  /** The reply's `<audio>` element, a stream or an `AnalyserNode`, to pulse with. */
  source?: AudioLevelSource | null;
  size?: "s" | "m" | "l" | "xl" | number;
  /** What screen readers hear. Defaults to "Assistant" and the state. */
  ariaLabel?: string;
}

const SIZE = { s: 32, m: 48, l: 96, xl: 160 } as const;
const SCHEMES = new Set(["brand", "accent", "neutral"]);

const STATE_LABEL: Record<MascotState, string> = {
  idle: "Assistant",
  listening: "Assistant, listening",
  thinking: "Assistant, thinking",
  speaking: "Assistant, speaking",
  sleeping: "Assistant, asleep",
};

const EYE = {
  pill: { w: 22, h: 40 },
  round: { w: 28, h: 28 },
  wide: { w: 36, h: 18 },
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** A superellipse around (100, 104): exponent 2 is a circle, higher is squarer. */
function bodyPath(roundness: number, aspect: number) {
  const n = 2 + (1 - clamp(roundness, 0, 1)) * 4;
  const scale = clamp(aspect, 0.6, 1.6);
  const a = scale >= 1 ? 82 : 82 * scale;
  const b = scale >= 1 ? 78 / scale : 78;
  const points: string[] = [];
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = 100 + a * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = 104 + b * Math.sign(s) * Math.abs(s) ** (2 / n);
    points.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return { d: `M${points.join("L")}Z`, top: 104 - b, bottom: 104 + b };
}

function Eye({
  side,
  kind,
  closed,
}: {
  side: -1 | 1;
  kind: NonNullable<MascotProps["eyes"]>;
  closed?: "happy" | "sleep";
}) {
  const x = 100 + side * 29;
  const y = 96;
  const { w, h } = EYE[kind];
  return (
    <g className={classNames(styles.eye, side < 0 ? styles.left : styles.right)}>
      <g className={styles.lid}>
        {closed ? (
          <path
            d={
              closed === "happy"
                ? `M${x - 13} ${y + 6} Q${x} ${y - 14} ${x + 13} ${y + 6}`
                : `M${x - 13} ${y} Q${x} ${y + 11} ${x + 13} ${y}`
            }
            className={styles.arc}
          />
        ) : (
          <>
            <rect
              x={x - w / 2}
              y={y - h / 2}
              width={w}
              height={h}
              rx={Math.min(w, h) / 2}
              className={styles.ink}
            />
            <ellipse
              cx={x - w * 0.16}
              cy={y - h * 0.24}
              rx={w * 0.17}
              ry={Math.min(w, h) * 0.17}
              className={styles.glint}
            />
          </>
        )}
      </g>
    </g>
  );
}

/**
 * An animated companion for an assistant: one soft, single-color shape with a
 * pair of eyes. It idles, listens, thinks, speaks and sleeps, with a mood on
 * top. The eyes slide over the body as if it were round when it looks around,
 * and the body pulses with the reply's audio.
 *
 * `color`, `roundness`, `aspect` and `eyes` make it yours. With reduced motion
 * it holds still and keeps its expressions.
 */
const Mascot = forwardRef<HTMLDivElement, MascotProps>(
  (
    {
      state = "idle",
      mood = "neutral",
      color = "brand",
      roundness = 0.7,
      aspect = 1,
      eyes = "pill",
      lookAt = "pointer",
      level,
      source,
      size = "l",
      ariaLabel,
      className,
      style,
      ...flex
    },
    forwardedRef,
  ) => {
    const root = useRef<HTMLDivElement | null>(null);
    const ref = useCallback(
      (node: HTMLDivElement | null) => {
        root.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );
    const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const px = typeof size === "number" ? size : SIZE[size];
    const live = level !== undefined || Boolean(source);
    const body = bodyPath(roundness, aspect);
    const closed = state === "sleeping" ? "sleep" : mood === "happy" ? "happy" : undefined;

    // Where the eyes look: a fixed direction, ahead, or toward the pointer.
    const lookX = typeof lookAt === "object" ? lookAt.x : 0;
    const lookY = typeof lookAt === "object" ? lookAt.y : 0;
    useEffect(() => {
      const node = root.current;
      if (!node) return;
      node.style.setProperty("--mascot-look-x", String(clamp(lookX, -1, 1)));
      node.style.setProperty("--mascot-look-y", String(clamp(lookY, -1, 1)));
      if (lookAt !== "pointer") return;
      let frame = 0;
      let pending: PointerEvent | undefined;
      const apply = () => {
        frame = 0;
        if (!pending) return;
        const box = node.getBoundingClientRect();
        const dx = pending.clientX - (box.left + box.width / 2);
        const dy = pending.clientY - (box.top + box.height / 2);
        // Full deflection a few body-widths away, so it doesn't twitch up close.
        const reach = Math.max(box.width * 3, 240);
        node.style.setProperty("--mascot-look-x", clamp(dx / reach, -1, 1).toFixed(3));
        node.style.setProperty("--mascot-look-y", clamp(dy / reach, -1, 1).toFixed(3));
      };
      const onMove = (event: PointerEvent) => {
        pending = event;
        if (!frame) frame = requestAnimationFrame(apply);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => {
        window.removeEventListener("pointermove", onMove);
        if (frame) cancelAnimationFrame(frame);
      };
    }, [lookAt, lookX, lookY]);

    // Speaking pulse: a level from props, or a source read every frame.
    useEffect(() => {
      const node = root.current;
      if (!node) return;
      if (level !== undefined) {
        node.style.setProperty("--mascot-level", String(clamp(level, 0, 1)));
        return;
      }
      node.style.removeProperty("--mascot-level");
      if (!source) return;
      const meter = createAudioMeter(source);
      if (!meter) return;
      let frame = 0;
      const tick = () => {
        node.style.setProperty("--mascot-level", meter.level().toFixed(3));
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => {
        cancelAnimationFrame(frame);
        meter.disconnect();
      };
    }, [level, source]);

    return (
      <Flex
        ref={ref}
        center
        role="img"
        aria-label={ariaLabel ?? STATE_LABEL[state]}
        data-state={state}
        data-mood={mood}
        data-live={live || undefined}
        className={classNames(styles.mascot, className)}
        style={
          {
            width: px,
            height: px,
            "--mascot-color": SCHEMES.has(color) ? `var(--function-${color}-500)` : color,
            ...style,
          } as React.CSSProperties
        }
        {...flex}
      >
        <svg viewBox="0 0 200 200" className={styles.svg} aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id={`${id}-light`} cx="34%" cy="26%" r="62%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${id}-shade`} cx="44%" cy="38%" r="70%">
              <stop offset="55%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.42" />
            </radialGradient>
            <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="72%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0.22" />
            </linearGradient>
            <clipPath id={`${id}-clip`}>
              <path d={body.d} />
            </clipPath>
          </defs>
          <ellipse cx={100} cy={196} rx={56} ry={5} className={styles.shadow} />
          <g className={styles.float}>
            <g className={styles.body} style={{ transformOrigin: `100px ${body.bottom}px` }}>
              <path d={body.d} className={styles.fill} />
              <g clipPath={`url(#${id}-clip)`}>
                <path d={body.d} fill={`url(#${id}-shade)`} />
                <path d={body.d} fill={`url(#${id}-rim)`} />
                <g className={styles.sheen}>
                  <path d={body.d} fill={`url(#${id}-light)`} />
                  <ellipse cx={70} cy={body.top + 26} rx={20} ry={11} className={styles.spec} />
                </g>
              </g>
              <g className={styles.face}>
                <Eye side={-1} kind={eyes} closed={closed} />
                <Eye side={1} kind={eyes} closed={closed} />
              </g>
            </g>
          </g>
          {state === "sleeping" && (
            <g className={styles.zzz}>
              <text x={156} y={44}>
                z
              </text>
              <text x={172} y={26}>
                z
              </text>
            </g>
          )}
        </svg>
      </Flex>
    );
  },
);

Mascot.displayName = "Mascot";

export { Mascot };
