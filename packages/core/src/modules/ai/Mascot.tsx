"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef, useCallback, useEffect, useId, useRef } from "react";
import { Flex } from "../../components/Flex";
import { type AudioLevelSource, createAudioMeter } from "./audioLevel";
import styles from "./Mascot.module.scss";

export type MascotState = "idle" | "listening" | "thinking" | "speaking" | "sleeping";
export type MascotMood = "neutral" | "happy" | "surprised" | "sad";

export interface MascotPalette {
  body?: string;
  /** The shaded side of the body. */
  bodyDeep?: string;
  /** Pupils, mouth and closed eyes. */
  ink?: string;
  /** The whites of round eyes. */
  sclera?: string;
  cheek?: string;
  /** Visor eyes, the antenna bulb and thought bubbles. */
  glow?: string;
  halo?: string;
}

const PALETTE_VARS: Record<keyof MascotPalette, string> = {
  body: "--mascot-body",
  bodyDeep: "--mascot-body-deep",
  ink: "--mascot-ink",
  sclera: "--mascot-sclera",
  cheek: "--mascot-cheek",
  glow: "--mascot-glow",
  halo: "--mascot-halo",
};

export interface MascotProps extends Omit<React.ComponentProps<typeof Flex>, "children"> {
  /** What the assistant is doing. Each state has its own pose and motion. */
  state?: MascotState;
  /** The expression on top of the state. */
  mood?: MascotMood;
  /** `mark`: the Once UI tiles with a face. `orb` and `squircle` for a softer character. */
  shape?: "mark" | "orb" | "squircle";
  /** `round` eyes with pupils, solid `pill`s, a robot `visor`, or small `dot`s. */
  eyes?: "round" | "pill" | "visor" | "dot";
  /** Something on top of the head. */
  accessory?: "none" | "antenna" | "halo";
  /** Blush under the eyes. */
  cheeks?: boolean;
  /** The body takes this scheme's hue. */
  color?: "brand" | "accent" | "neutral";
  /** Any CSS colors for single parts, over `color`. Each is also a `--mascot-*` variable. */
  palette?: MascotPalette;
  /** `pointer` follows the cursor, `{ x, y }` from -1 to 1 looks that way, `center` looks ahead. */
  lookAt?: "pointer" | "center" | { x: number; y: number };
  /** Loudness from 0 to 1 that opens the mouth while speaking. Takes precedence over `source`. */
  level?: number;
  /** The reply's `<audio>` element, a stream or an `AnalyserNode`, for lip sync. */
  source?: AudioLevelSource | null;
  size?: "s" | "m" | "l" | "xl" | number;
  /** What screen readers hear. Defaults to "Assistant" and the state. */
  ariaLabel?: string;
}

const SIZE = { s: 32, m: 48, l: 96, xl: 160 } as const;

const STATE_LABEL: Record<MascotState, string> = {
  idle: "Assistant",
  listening: "Assistant, listening",
  thinking: "Assistant, thinking",
  speaking: "Assistant, speaking",
  sleeping: "Assistant, asleep",
};

/* The Once UI mark's tiles in a 200 box: left, top, right, bottom. */
const MARK_TILES = [
  "M81.6393 341.413C55.4536 315.228 55.4536 272.772 81.6393 246.587L156.146 172.08L264.52 280.453C272.002 287.935 272.002 300.065 264.52 307.547L156.146 415.92L81.6393 341.413Z",
  "M173.08 155.146L247.587 80.6393C273.772 54.4536 316.228 54.4536 342.413 80.6393L416.92 155.146L308.547 263.52C301.065 271.002 288.935 271.002 281.453 263.52L173.08 155.146Z",
  "M325.48 307.547C317.998 300.065 317.998 287.935 325.48 280.453L433.854 172.08L508.361 246.587C534.546 272.772 534.546 315.228 508.361 341.413L433.854 415.92L325.48 307.547Z",
  "M173.08 432.854L281.453 324.48C288.935 316.998 301.065 316.998 308.547 324.48L416.92 432.854L342.413 507.361C316.228 533.546 273.772 533.546 247.587 507.361L173.08 432.854Z",
];

/** Where the face sits on each body: eye centers apart from the middle, eye height, mouth height. */
const FACE = {
  mark: { eyeX: 37, eyeY: 100, mouthY: 138, top: 18 },
  orb: { eyeX: 25, eyeY: 98, mouthY: 130, top: 26 },
  squircle: { eyeX: 27, eyeY: 96, mouthY: 130, top: 26 },
} as const;

function Eye({ kind, x, y }: { kind: NonNullable<MascotProps["eyes"]>; x: number; y: number }) {
  if (kind === "round") {
    return (
      <g className={styles.eye} style={{ transformOrigin: `${x}px ${y}px` }}>
        <ellipse cx={x} cy={y} rx={13} ry={15} className={styles.sclera} />
        <g className={styles.pupil}>
          <circle cx={x} cy={y + 1} r={7} className={styles.ink} />
          <circle cx={x + 2.5} cy={y - 2} r={2.2} className={styles.shine} />
        </g>
      </g>
    );
  }
  if (kind === "pill") {
    return (
      <g className={styles.eye} style={{ transformOrigin: `${x}px ${y}px` }}>
        <g className={styles.pupil}>
          <rect x={x - 6} y={y - 13} width={12} height={26} rx={6} className={styles.ink} />
          <circle cx={x + 1.5} cy={y - 6} r={2.2} className={styles.shine} />
        </g>
      </g>
    );
  }
  return (
    <g className={styles.eye} style={{ transformOrigin: `${x}px ${y}px` }}>
      <g className={styles.pupil}>
        <circle
          cx={x}
          cy={y}
          r={kind === "visor" ? 6.5 : 6}
          className={kind === "visor" ? styles.glow : styles.ink}
        />
      </g>
    </g>
  );
}

function Mouth({ state, mood, y }: { state: MascotState; mood: MascotMood; y: number }) {
  if (state === "speaking") {
    // Scaled on Y by the level (or the stand-in talk animation).
    return (
      <g className={styles.talk} style={{ transformOrigin: `100px ${y}px` }}>
        <ellipse cx={100} cy={y} rx={10} ry={8} className={styles.ink} />
        <ellipse cx={100} cy={y + 4} rx={5.5} ry={3} className={styles.tongue} />
      </g>
    );
  }
  if (state === "sleeping") {
    return <ellipse cx={100} cy={y} rx={4} ry={3} className={styles.ink} />;
  }
  if (state === "thinking") {
    // A slanted "hmm".
    return <path d={`M92 ${y + 2} L108 ${y - 2}`} className={styles.line} />;
  }
  switch (mood) {
    case "happy":
      return (
        <path
          d={`M86 ${y - 3} Q100 ${y - 3} 114 ${y - 3} Q112 ${y + 13} 100 ${y + 13} Q88 ${y + 13} 86 ${y - 3}Z`}
          className={styles.ink}
        />
      );
    case "surprised":
      return <ellipse cx={100} cy={y + 1} rx={6} ry={7.5} className={styles.ink} />;
    case "sad":
      return <path d={`M89 ${y + 5} Q100 ${y - 4} 111 ${y + 5}`} className={styles.line} />;
    default:
      return <path d={`M89 ${y - 2} Q100 ${y + 8} 111 ${y - 2}`} className={styles.line} />;
  }
}

/**
 * An animated companion for an assistant: a character with a face that idles,
 * listens, thinks, speaks and sleeps, with a mood on top. Its eyes can follow
 * the pointer, and its mouth opens with the reply's audio.
 *
 * Shape, eyes, accessory and cheeks are props; colors come from the scheme,
 * and `palette` (or the `--mascot-*` variables, from CSS) recolors any part. With reduced motion
 * it holds still, keeps its expressions, and does not blink or bob.
 */
const Mascot = forwardRef<HTMLDivElement, MascotProps>(
  (
    {
      state = "idle",
      mood = "neutral",
      shape = "mark",
      eyes = "round",
      accessory = "none",
      cheeks = true,
      color = "brand",
      palette,
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
    const face = FACE[shape];
    const px = typeof size === "number" ? size : SIZE[size];
    const live = level !== undefined || Boolean(source);

    // Where the eyes look: a fixed direction, ahead, or toward the pointer.
    const lookX = typeof lookAt === "object" ? lookAt.x : 0;
    const lookY = typeof lookAt === "object" ? lookAt.y : 0;
    useEffect(() => {
      const node = root.current;
      if (!node) return;
      node.style.setProperty("--mascot-look-x", String(Math.max(-1, Math.min(1, lookX))));
      node.style.setProperty("--mascot-look-y", String(Math.max(-1, Math.min(1, lookY))));
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
        node.style.setProperty("--mascot-look-x", Math.max(-1, Math.min(1, dx / reach)).toFixed(3));
        node.style.setProperty("--mascot-look-y", Math.max(-1, Math.min(1, dy / reach)).toFixed(3));
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

    // Lip sync: a level from props, or a source read every frame.
    useEffect(() => {
      const node = root.current;
      if (!node) return;
      if (level !== undefined) {
        node.style.setProperty("--mascot-level", String(Math.max(0, Math.min(1, level))));
        return;
      }
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

    const fill = `url(#${id}-body)`;

    return (
      <Flex
        ref={ref}
        center
        role="img"
        aria-label={ariaLabel ?? STATE_LABEL[state]}
        data-state={state}
        data-mood={mood}
        data-shape={shape}
        data-live={live || undefined}
        className={classNames(styles.mascot, className)}
        style={
          {
            width: px,
            height: px,
            "--mascot-hue": `var(--function-${color}-500)`,
            "--mascot-hue-deep": `var(--function-${color}-400)`,
            ...Object.fromEntries(
              Object.entries(palette ?? {}).map(([part, value]) => [
                PALETTE_VARS[part as keyof MascotPalette],
                value,
              ]),
            ),
            ...style,
          } as React.CSSProperties
        }
        {...flex}
      >
        <svg viewBox="0 0 200 200" className={styles.svg} aria-hidden="true" focusable="false">
          <defs>
            <radialGradient
              id={`${id}-body`}
              cx="38%"
              cy="30%"
              r="80%"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" className={styles.stopLight} />
              <stop offset="55%" className={styles.stopMid} />
              <stop offset="100%" className={styles.stopDeep} />
            </radialGradient>
          </defs>
          <ellipse cx={100} cy={192} rx={52} ry={6} className={styles.shadow} />
          <g className={styles.float}>
            <g className={styles.body}>
              {accessory === "antenna" && (
                <g className={styles.antenna}>
                  <path d={`M100 ${face.top + 4} L100 ${face.top - 12}`} className={styles.stalk} />
                  <circle cx={100} cy={face.top - 15} r={6} className={styles.bulb} />
                </g>
              )}
              {shape === "mark" ? (
                <g transform="translate(6 6) scale(0.32)" fill={fill}>
                  {MARK_TILES.map((d) => (
                    <path key={d} d={d} className={styles.tile} />
                  ))}
                </g>
              ) : shape === "orb" ? (
                <circle cx={100} cy={104} r={78} fill={fill} />
              ) : (
                <rect x={24} y={30} width={152} height={146} rx={62} fill={fill} />
              )}
              {accessory === "halo" && (
                <ellipse cx={100} cy={face.top - 8} rx={34} ry={8} className={styles.halo} />
              )}
              <g className={styles.face}>
                {eyes === "visor" && (
                  <rect
                    x={100 - face.eyeX - 20}
                    y={face.eyeY - 15}
                    width={(face.eyeX + 20) * 2}
                    height={30}
                    rx={15}
                    className={styles.visor}
                  />
                )}
                <g className={styles.eyes}>
                  {state === "sleeping" ? (
                    [-1, 1].map((side) => (
                      <path
                        key={side}
                        d={`M${100 + side * face.eyeX - 9} ${face.eyeY} Q${100 + side * face.eyeX} ${face.eyeY + 7} ${100 + side * face.eyeX + 9} ${face.eyeY}`}
                        className={styles.line}
                      />
                    ))
                  ) : (
                    <>
                      <Eye kind={eyes} x={100 - face.eyeX} y={face.eyeY} />
                      <Eye kind={eyes} x={100 + face.eyeX} y={face.eyeY} />
                    </>
                  )}
                </g>
                {cheeks && (
                  <>
                    <ellipse
                      cx={100 - face.eyeX - 6}
                      cy={face.eyeY + 20}
                      rx={8}
                      ry={4.5}
                      className={styles.cheek}
                    />
                    <ellipse
                      cx={100 + face.eyeX + 6}
                      cy={face.eyeY + 20}
                      rx={8}
                      ry={4.5}
                      className={styles.cheek}
                    />
                  </>
                )}
                <Mouth state={state} mood={mood} y={face.mouthY} />
              </g>
            </g>
          </g>
          {state === "thinking" && (
            <g className={styles.thought}>
              <circle cx={160} cy={40} r={6} />
              <circle cx={176} cy={26} r={8} />
              <circle cx={190} cy={8} r={6} />
            </g>
          )}
          {state === "sleeping" && (
            <g className={styles.zzz}>
              <text x={150} y={46}>
                z
              </text>
              <text x={166} y={28}>
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
