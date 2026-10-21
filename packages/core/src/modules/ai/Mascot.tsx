"use client";

import classNames from "clsx";
import type React from "react";
import { useCallback, useEffect, useId, useRef } from "react";
import { Flex } from "../../components/Flex.js";
import type { LeafPropsOf } from "../../interfaces.js";
import type { CSSUnit } from "../../types.js";
import { tokenLength } from "../../utils/layoutClasses.js";
import { type AudioLevelSource, createAudioMeter } from "./audioLevel.js";
import styles from "./Mascot.module.scss";

export type MascotState = "idle" | "listening" | "thinking" | "speaking" | "sleeping";
export type MascotMood =
  | "neutral"
  | "happy"
  | "surprised"
  | "sad"
  | "skeptical"
  | "wink"
  | "focused"
  | "determined";

/** Everything that makes one character look different from another. */
export interface MascotLook {
  /** A scheme (`brand`, `accent`, `neutral`) or any CSS color. Every shade is derived from it. */
  color?: "brand" | "accent" | "neutral" | (string & {});
  /** From 0, a rounded square, through a squircle, to 1, a circle. */
  roundness?: number;
  /** Width over height of the body: below 1 is tall, above 1 is wide. */
  aspect?: number;
  /** Your own outline instead: an SVG path in a 200 × 200 box. */
  bodyPath?: string;
  /** How the body takes light. */
  surface?: "glossy" | "matte" | "flat" | "glass";
  /**
   * `tile`, the Once UI mark's tile, turns like the logo loader while thinking.
   * Or `pill`, `round`, `wide`, `dot`, or your own SVG path drawn around 0,0 in a 40 × 40 box.
   */
  eyes?: "tile" | "pill" | "round" | "wide" | "dot" | { path: string };
  /** Scale of the eyes, 1 by default. */
  eyeSize?: number;
  /** Distance between the eyes, 1 by default. */
  eyeSpacing?: number;
  /** Moves the eyes up (below 0) or down (above 0), from -1 to 1. */
  eyeHeight?: number;
  /** The eyes' color. Defaults to a near-black tinted by the body. */
  eyeColor?: string;
  /** A mouth that follows the mood and moves while speaking. */
  mouth?: "none" | "smile" | "dot" | "line";
  /** Brows that follow the mood. */
  brows?: boolean;
  cheeks?: boolean;
  /** How it moves: `calm` is slow and small, `bouncy` is quick and springy. */
  personality?: "calm" | "default" | "bouncy";
}

export interface MascotProps extends MascotLook, Omit<LeafPropsOf<"div">, "children" | "color"> {
  /** What the assistant is doing. Each state has its own pose and motion. */
  state?: MascotState;
  /** The expression on top of the state. */
  mood?: MascotMood;
  /** A string or number that picks a whole look; props you pass win over it. See `mascotLook`. */
  seed?: string | number;
  /** SVG drawn with the body in its 200 × 200 box (a hat, an antenna), moving with it. */
  accessory?: React.ReactNode;
  /** `pointer` follows the cursor, `{ x, y }` from -1 to 1 looks that way, `center` looks ahead. */
  lookAt?: "pointer" | "center" | { x: number; y: number };
  /** Loudness from 0 to 1 that drives the body (and mouth) while speaking. Takes precedence over `source`. */
  level?: number;
  /** The reply's `<audio>` element, a stream or an `AnalyserNode`, to move with. */
  source?: AudioLevelSource | null;
  /** A t-shirt size, a number on the token scale (`48` is 3rem), or a CSS length. */
  size?: "s" | "m" | "l" | "xl" | number | CSSUnit;
  /** What screen readers hear. Defaults to "Assistant" and the state. */
  "aria-label"?: string;
}

const SIZE = { s: 32, m: 48, l: 96, xl: 160 } as const;
const SCHEMES = new Set(["brand", "accent", "neutral"]);

const DEFAULT_LOOK: Required<Omit<MascotLook, "bodyPath" | "eyeColor">> = {
  color: "brand",
  roundness: 0.7,
  aspect: 1,
  surface: "glossy",
  eyes: "tile",
  eyeSize: 1,
  eyeSpacing: 1,
  eyeHeight: 0,
  mouth: "none",
  brows: false,
  cheeks: false,
  personality: "default",
};

const STATE_LABEL: Record<MascotState, string> = {
  idle: "Assistant",
  listening: "Assistant, listening",
  thinking: "Assistant, thinking",
  speaking: "Assistant, speaking",
  sleeping: "Assistant, asleep",
};

/* The top tile of the Once UI mark (590 box), centered on 0,0 below. */
const TILE =
  "M173.08 155.146L247.587 80.6393C273.772 54.4536 316.228 54.4536 342.413 80.6393L416.92 155.146L308.547 263.52C301.065 271.002 288.935 271.002 281.453 263.52L173.08 155.146Z";

/** Width and height of each eye, before `eyeSize`. */
const EYE_BOX = {
  tile: { w: 42, h: 36 },
  pill: { w: 22, h: 40 },
  round: { w: 28, h: 28 },
  wide: { w: 36, h: 18 },
  dot: { w: 16, h: 16 },
  custom: { w: 40, h: 40 },
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** A superellipse around (100, 104): exponent 2 is a circle, higher is squarer. */
function bodyShape(roundness: number, aspect: number) {
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
  return { d: `M${points.join("L")}Z`, top: 104 - b, bottom: 104 + b, halfWidth: a };
}

/* A small deterministic generator, so a seed always gives the same character. */
function random(seed: string | number) {
  let h = 2166136261;
  for (const char of String(seed)) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A whole look from a seed: a user id, a product name, any string or number.
 * The same seed always gives the same character.
 */
export function mascotLook(seed: string | number): MascotLook {
  const next = random(seed);
  const pick = <T,>(items: readonly T[]) => items[Math.floor(next() * items.length)];
  const range = (min: number, max: number) => Math.round((min + next() * (max - min)) * 100) / 100;
  return {
    color: `oklch(0.72 0.16 ${Math.round(next() * 360)})`,
    roundness: range(0.2, 1),
    aspect: range(0.8, 1.3),
    surface: pick(["glossy", "glossy", "matte", "flat", "glass"] as const),
    eyes: pick(["tile", "pill", "round", "wide", "dot"] as const),
    eyeSize: range(0.85, 1.25),
    eyeSpacing: range(0.8, 1.25),
    eyeHeight: range(-0.35, 0.3),
    mouth: pick(["none", "none", "smile", "dot", "line"] as const),
    brows: next() < 0.35,
    cheeks: next() < 0.4,
    personality: pick(["calm", "default", "default", "bouncy"] as const),
  };
}

function EyeShape({ kind, w, h }: { kind: MascotLook["eyes"]; w: number; h: number }) {
  if (kind === "tile") {
    return (
      <g className={styles.tile}>
        <path
          d={TILE}
          transform={`scale(${w / 244}) translate(-295 -165)`}
          className={classNames(styles.ink, styles.tileInk)}
        />
      </g>
    );
  }
  if (typeof kind === "object") {
    return <path d={kind.path} className={styles.ink} />;
  }
  return (
    <>
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={Math.min(w, h) / 2}
        className={styles.ink}
      />
      <ellipse
        cx={-w * 0.16}
        cy={-h * 0.24}
        rx={w * 0.17}
        ry={Math.min(w, h) * 0.17}
        className={styles.glint}
      />
    </>
  );
}

function Eye({
  id,
  side,
  x,
  y,
  look,
}: {
  id: string;
  side: -1 | 1;
  x: number;
  y: number;
  look: Required<Pick<MascotLook, "eyes" | "eyeSize">>;
}) {
  const box = typeof look.eyes === "object" ? EYE_BOX.custom : EYE_BOX[look.eyes];
  const w = box.w * look.eyeSize;
  const h = box.h * look.eyeSize;
  const name = side < 0 ? "l" : "r";
  // Lids are the edges of two clip rectangles: the top one comes down, the bottom one comes up.
  return (
    <g
      className={classNames(styles.eye, side < 0 ? styles.left : styles.right)}
      style={{ "--eye-h": `${h + 8}px` } as React.CSSProperties}
    >
      <defs>
        <clipPath id={`${id}-top-${name}`}>
          <rect
            x={x - w}
            y={y - h / 2 - 4}
            width={w * 2}
            height={h * 3}
            className={styles.lidTop}
            style={{ transformOrigin: `${x}px ${y}px` }}
          />
        </clipPath>
        <clipPath id={`${id}-bottom-${name}`}>
          <rect
            x={x - w}
            y={y + h / 2 + 4 - h * 3}
            width={w * 2}
            height={h * 3}
            className={styles.lidBottom}
            style={{ transformOrigin: `${x}px ${y}px` }}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-top-${name})`}>
        <g clipPath={`url(#${id}-bottom-${name})`}>
          <g transform={`translate(${x} ${y})`}>
            <g className={styles.lid}>
              <EyeShape kind={look.eyes} w={w} h={h} />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

function Mouth({
  kind,
  mood,
  state,
}: {
  kind: MascotLook["mouth"];
  mood: MascotMood;
  state: MascotState;
}) {
  if (kind === "none") return null;
  if (state === "speaking") {
    return (
      <g className={styles.talk}>
        <ellipse cx={0} cy={0} rx={kind === "dot" ? 6 : 10} ry={7} className={styles.ink} />
      </g>
    );
  }
  if (state === "sleeping" || kind === "dot") {
    const r = mood === "surprised" ? 6 : state === "sleeping" ? 3 : 4;
    return <ellipse cx={0} cy={0} rx={r} ry={r * 1.15} className={styles.ink} />;
  }
  if (mood === "surprised") return <ellipse cx={0} cy={1} rx={6} ry={7.5} className={styles.ink} />;
  const curve =
    mood === "happy" || mood === "wink"
      ? 9
      : mood === "sad"
        ? -6
        : mood === "skeptical" || mood === "determined" || state === "thinking"
          ? 0
          : kind === "line"
            ? 1
            : 5;
  const tilt = mood === "skeptical" || state === "thinking" ? 3 : 0;
  return (
    <path
      d={`M-11 ${-tilt - curve / 3} Q0 ${curve} 11 ${tilt - curve / 3}`}
      className={styles.line}
    />
  );
}

/**
 * An animated companion for an assistant: one soft, single-color shape with
 * eyes. It idles, listens, thinks, speaks and sleeps, with a mood on top, and
 * by default its eyes are the Once UI mark's tiles, which turn like the logo
 * loader while it thinks.
 *
 * Every part of the look is a prop (`MascotLook`), or comes from a `seed`, so
 * two products never have to share a character. With reduced motion it holds
 * still and keeps its expressions.
 */
const Mascot = ({
  ref: forwardedRef,
  state = "idle",
  mood = "neutral",
  seed,
  color,
  roundness,
  aspect,
  bodyPath,
  surface,
  eyes,
  eyeSize,
  eyeSpacing,
  eyeHeight,
  eyeColor,
  mouth,
  brows,
  cheeks,
  personality,
  accessory,
  lookAt = "pointer",
  level,
  source,
  size = "l",
  "aria-label": ariaLabel,
  className,
  style,
  ...flex
}: MascotProps) => {
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
  const length =
    typeof size === "number"
      ? tokenLength(size)
      : size in SIZE
        ? tokenLength(SIZE[size as keyof typeof SIZE])
        : size;
  const live = level !== undefined || Boolean(source);

  // Seeded look, then the props that were passed.
  const passed = Object.fromEntries(
    Object.entries({
      color,
      roundness,
      aspect,
      surface,
      eyes,
      eyeSize,
      eyeSpacing,
      eyeHeight,
      mouth,
      brows,
      cheeks,
      personality,
    }).filter(([, value]) => value !== undefined),
  );
  const look = {
    ...DEFAULT_LOOK,
    ...(seed !== undefined ? mascotLook(seed) : {}),
    ...passed,
  } as typeof DEFAULT_LOOK;

  const shape = bodyShape(look.roundness, look.aspect);
  const body = bodyPath ? { d: bodyPath, top: 26, bottom: 182, halfWidth: 82 } : shape;
  const spread = Math.min(29 * look.eyeSpacing, body.halfWidth - 22);
  const eyeY = 96 + clamp(look.eyeHeight, -1, 1) * 30;
  const tile = look.eyes === "tile";

  // A quick squash whenever the expression changes, never on the first render.
  const changes = useRef({ key: `${state}-${mood}`, count: 0 });
  if (changes.current.key !== `${state}-${mood}`) {
    changes.current = { key: `${state}-${mood}`, count: changes.current.count + 1 };
  }

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

  // Speaking: a level from props, or a source read every frame.
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

  const scheme = String(look.color);

  return (
    <Flex
      ref={ref}
      center
      role="img"
      aria-label={ariaLabel ?? STATE_LABEL[state]}
      data-state={state}
      data-mood={mood}
      data-surface={look.surface}
      data-personality={look.personality}
      data-eyes={tile ? "tile" : "shape"}
      data-live={live || undefined}
      className={classNames(styles.mascot, className)}
      style={
        {
          width: length,
          height: length,
          "--mascot-color": SCHEMES.has(scheme) ? `var(--function-${scheme}-500)` : scheme,
          ...(eyeColor ? { "--mascot-eye": eyeColor } : {}),
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
          <g
            key={changes.current.count}
            className={classNames(styles.body, changes.current.count > 0 && styles.pop)}
            style={{ transformOrigin: `100px ${body.bottom}px` }}
          >
            <path d={body.d} className={styles.fill} />
            <g clipPath={`url(#${id}-clip)`}>
              <path d={body.d} fill={`url(#${id}-shade)`} className={styles.shade} />
              <path d={body.d} fill={`url(#${id}-rim)`} className={styles.rim} />
              <g className={styles.sheen}>
                <path d={body.d} fill={`url(#${id}-light)`} className={styles.light} />
                <ellipse cx={70} cy={body.top + 26} rx={20} ry={11} className={styles.spec} />
              </g>
            </g>
            <path d={body.d} className={styles.edge} />
            {accessory && <g className={styles.accessory}>{accessory}</g>}
            <g className={styles.face}>
              <g className={styles.flick}>
                {look.brows &&
                  ([-1, 1] as const).map((side) => (
                    <path
                      key={side}
                      d={`M${100 + side * spread - 9} ${eyeY - 26 * look.eyeSize} L${100 + side * spread + 9} ${eyeY - 26 * look.eyeSize}`}
                      className={classNames(styles.brow, side < 0 ? styles.left : styles.right)}
                    />
                  ))}
                <Eye id={id} side={-1} x={100 - spread} y={eyeY} look={look} />
                <Eye id={id} side={1} x={100 + spread} y={eyeY} look={look} />
                {look.cheeks &&
                  ([-1, 1] as const).map((side) => (
                    <ellipse
                      key={side}
                      cx={100 + side * (spread + 8)}
                      cy={eyeY + 22 * look.eyeSize}
                      rx={9}
                      ry={5}
                      className={styles.cheek}
                    />
                  ))}
                <g
                  className={styles.mouth}
                  transform={`translate(100 ${eyeY + 34 * Math.max(0.8, look.eyeSize)})`}
                >
                  <Mouth kind={look.mouth} mood={mood} state={state} />
                </g>
              </g>
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
};

Mascot.displayName = "Mascot";

export { Mascot };
