import { type ReactNode, useEffect, useId, useRef } from "react";
import { View } from "react-native";
import Svg, {
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { mixColors, toHex } from "../theme/colorScheme";
import { useTheme } from "../theme/ThemeProvider";
import { type FlexProps, flexStyle } from "./Flex";
import {
  clonePose,
  easePose,
  type MascotMood,
  type MascotState,
  motionAt,
  type Pose,
  targetPose,
} from "./mascot/pose";
import { useFrameTime, useReduceMotion } from "./motion";

export type { MascotMood, MascotState } from "./mascot/pose";

/** Everything that makes one character look different from another. */
export interface MascotLook {
  /** A scheme (`brand`, `accent`, `neutral`) or any color: hex, `rgb()` or `oklch()`. */
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

export interface MascotProps extends MascotLook, Omit<FlexProps, "children"> {
  /** What the assistant is doing. Each state has its own pose and motion. */
  state?: MascotState;
  /** The expression on top of the state. */
  mood?: MascotMood;
  /** A string or number that picks a whole look; props you pass win over it. See `mascotLook`. */
  seed?: string | number;
  /** react-native-svg elements drawn with the body in its 200 × 200 box (a hat, an antenna), moving with it. */
  accessory?: ReactNode;
  /**
   * `{ x, y }` from -1 to 1 looks that way; `center` looks ahead. There is no
   * pointer on a phone, so `pointer`, core's default, looks ahead too.
   */
  lookAt?: "pointer" | "center" | { x: number; y: number };
  /** Loudness from 0 to 1 that drives the body (and mouth) while speaking. */
  level?: number;
  size?: "s" | "m" | "l" | "xl" | number;
  /** What screen readers hear. Defaults to "Assistant" and the state. */
  ariaLabel?: string;
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

/** How much of each layer shows, per surface (Mascot.module.scss). */
const SURFACE = {
  glossy: { light: 1, shade: 1, rim: 1, spec: 0.32 },
  matte: { light: 0.45, shade: 1, rim: 0, spec: 0 },
  flat: { light: 0, shade: 0, rim: 0, spec: 0 },
  glass: { light: 1, shade: 0.5, rim: 1, spec: 0.6 },
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const n = (value: number) => Number(value.toFixed(2));

/** A superellipse around (100, 104): exponent 2 is a circle, higher is squarer. */
export function bodyShape(roundness: number, aspect: number) {
  const exponent = 2 + (1 - clamp(roundness, 0, 1)) * 4;
  const scale = clamp(aspect, 0.6, 1.6);
  const a = scale >= 1 ? 82 : 82 * scale;
  const b = scale >= 1 ? 78 / scale : 78;
  const points: string[] = [];
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = 100 + a * Math.sign(c) * Math.abs(c) ** (2 / exponent);
    const y = 104 + b * Math.sign(s) * Math.abs(s) ** (2 / exponent);
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
 * The same seed gives the same character as core's `mascotLook`, on the web
 * and on the phone.
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

function EyeShape({
  kind,
  w,
  h,
  ink,
}: {
  kind: NonNullable<MascotLook["eyes"]>;
  w: number;
  h: number;
  ink: string;
}) {
  if (kind === "tile") {
    // The stroke rounds the tile's corners so it reads soft at eye size.
    return (
      <Path
        d={TILE}
        transform={`scale(${n(w / 244)}) translate(-295 -165)`}
        fill={ink}
        stroke={ink}
        strokeWidth={34}
        strokeLinejoin="round"
      />
    );
  }
  if (typeof kind === "object") return <Path d={kind.path} fill={ink} />;
  return (
    <>
      <Rect x={-w / 2} y={-h / 2} width={w} height={h} rx={Math.min(w, h) / 2} fill={ink} />
      <Ellipse
        cx={-w * 0.16}
        cy={-h * 0.24}
        rx={w * 0.17}
        ry={Math.min(w, h) * 0.17}
        fill="#fff"
        opacity={0.85}
      />
    </>
  );
}

function Eye({
  id,
  side,
  x,
  y,
  eyes,
  eyeSize,
  ink,
  pose,
  gx,
  gy,
  blink,
  turn,
}: {
  id: string;
  side: -1 | 1;
  x: number;
  y: number;
  eyes: NonNullable<MascotLook["eyes"]>;
  eyeSize: number;
  ink: string;
  pose: Pose["eyes"][number];
  gx: number;
  gy: number;
  blink: number;
  turn: number;
}) {
  const box = typeof eyes === "object" ? EYE_BOX.custom : EYE_BOX[eyes];
  const w = box.w * eyeSize;
  const h = box.h * eyeSize;
  const name = side < 0 ? "l" : "r";
  const lidTravel = h + 8;
  // The eye nearer the edge narrows as if it were turning away on a round surface.
  const away = Math.max(0, side < 0 ? -gx : gx);
  const toward = Math.max(0, side < 0 ? gx : -gx);
  const shiftX = side < 0 ? away * 4 : away * -4;
  const scaleX = 1 - 0.45 * away + 0.1 * toward;
  const scaleY = 1 - 0.2 * Math.abs(gy);
  const tile = eyes === "tile";
  // Lids are the edges of two clip rectangles: the top one comes down, the bottom one comes up.
  return (
    <G
      transform={`translate(${n(x + shiftX)} ${y}) scale(${n(scaleX)} ${n(scaleY)}) translate(${-x} ${-y})`}
    >
      <Defs>
        <ClipPath id={`${id}-top-${name}`}>
          <Rect
            x={x - w}
            y={y - h / 2 - 4}
            width={w * 2}
            height={h * 3}
            transform={`translate(0 ${n(pose.lt * lidTravel)}) rotate(${n(pose.tilt)} ${x} ${y})`}
          />
        </ClipPath>
        <ClipPath id={`${id}-bottom-${name}`}>
          <Rect
            x={x - w}
            y={y + h / 2 + 4 - h * 3}
            width={w * 2}
            height={h * 3}
            transform={`translate(0 ${n(-pose.lb * lidTravel)})`}
          />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${id}-top-${name})`}>
        <G clipPath={`url(#${id}-bottom-${name})`}>
          <G
            transform={`translate(${x} ${y}) scale(${n(pose.sx)} ${n(pose.sy * blink)}) rotate(${tile ? n(pose.tile + turn) : 0})`}
          >
            <EyeShape kind={eyes} w={w} h={h} ink={ink} />
          </G>
        </G>
      </G>
    </G>
  );
}

function Mouth({
  kind,
  mood,
  state,
  talk,
  ink,
}: {
  kind: MascotLook["mouth"];
  mood: MascotMood;
  state: MascotState;
  talk: number;
  ink: string;
}) {
  if (kind === "none") return null;
  if (state === "speaking") {
    return (
      <G transform={`scale(1 ${n(talk)})`}>
        <Ellipse cx={0} cy={0} rx={kind === "dot" ? 6 : 10} ry={7} fill={ink} />
      </G>
    );
  }
  if (state === "sleeping" || kind === "dot") {
    const r = mood === "surprised" ? 6 : state === "sleeping" ? 3 : 4;
    return <Ellipse cx={0} cy={0} rx={r} ry={r * 1.15} fill={ink} />;
  }
  if (mood === "surprised") return <Ellipse cx={0} cy={1} rx={6} ry={7.5} fill={ink} />;
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
    <Path
      d={`M-11 ${-tilt - curve / 3} Q0 ${curve} 11 ${tilt - curve / 3}`}
      fill="none"
      stroke={ink}
      strokeWidth={6}
      strokeLinecap="round"
    />
  );
}

/**
 * Core's `Mascot`: an animated companion for an assistant, one soft,
 * single-color shape with eyes. It idles, listens, thinks, speaks and sleeps,
 * with a mood on top, and by default its eyes are the Once UI mark's tiles,
 * which turn like the logo loader while it thinks.
 *
 * Every part of the look is a prop (`MascotLook`), or comes from a `seed`,
 * and a seed gives the same character as on the web. With reduce motion on it
 * holds still and keeps its expressions.
 */
export function Mascot({
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
  size = "l",
  ariaLabel,
  ...flex
}: MascotProps) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const time = useFrameTime(!reduceMotion);
  const id = `m${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { style, rest, userStyle, hidden } = flexStyle(theme, { center: true, ...flex });

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
  const tileEyes = look.eyes === "tile";
  const speakingLevel =
    state === "speaking" && level !== undefined ? clamp(level, 0, 1) : undefined;
  const lookX = typeof lookAt === "object" ? clamp(lookAt.x, -1, 1) : 0;
  const lookY = typeof lookAt === "object" ? clamp(lookAt.y, -1, 1) : 0;

  // The pose eases toward its target each frame, as core's transitions do.
  const target = targetPose({ state, mood, tileEyes, lookX, lookY, level: speakingLevel });
  const pose = useRef<Pose | null>(null);
  const last = useRef(time);
  if (!pose.current || reduceMotion) pose.current = clonePose(target);
  else {
    const dt = Math.max(0, time - last.current);
    easePose(pose.current, target, 1 - Math.exp(-dt / 0.09));
  }
  last.current = time;

  // A quick squash whenever the expression changes, never on the first render.
  const key = `${state}-${mood}`;
  const change = useRef({ key, at: undefined as number | undefined });
  if (change.current.key !== key) change.current = { key, at: time };
  const sincePop = change.current.at === undefined ? undefined : time - change.current.at;

  const motion = motionAt(
    { state, mood, tileEyes, personality: look.personality, level: speakingLevel, sincePop },
    reduceMotion ? 0 : time,
  );

  useEffect(() => {
    if (reduceMotion) change.current.at = undefined;
  }, [reduceMotion]);

  if (hidden) return null;

  const px = typeof size === "number" ? size : SIZE[size];
  const scheme = String(look.color);
  const body = SCHEMES.has(scheme) ? theme.color(`function-${scheme}-500`) : toHex(scheme);
  const ink = eyeColor ? toHex(eyeColor) : mixColors(body, "#0c0b12", 0.12);
  const glass = look.surface === "glass";
  const layers = SURFACE[look.surface];

  const shape = bodyShape(look.roundness, look.aspect);
  const outline = bodyPath ? { d: bodyPath, top: 26, bottom: 182, halfWidth: 82 } : shape;
  const spread = Math.min(29 * look.eyeSpacing, outline.halfWidth - 22);
  const eyeY = 96 + clamp(look.eyeHeight, -1, 1) * 30;
  const now = pose.current;
  const bodySx = now.body.sx * motion.body.sx;
  const bodySy = now.body.sy * motion.body.sy;
  const bodyRotate = now.body.rotate + motion.body.rotate;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={ariaLabel ?? STATE_LABEL[state]}
      {...rest}
      style={[style, { width: px, height: px, flexShrink: 0 }, userStyle]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 200 200" style={{ overflow: "visible" }}>
        <Defs>
          <RadialGradient id={`${id}-light`} cx="34%" cy="26%" r="62%">
            <Stop offset="0%" stopColor="#fff" stopOpacity={0.5} />
            <Stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={`${id}-shade`} cx="44%" cy="38%" r="70%">
            <Stop offset="55%" stopColor="#000" stopOpacity={0} />
            <Stop offset="100%" stopColor="#000" stopOpacity={0.42} />
          </RadialGradient>
          <LinearGradient id={`${id}-rim`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="72%" stopColor="#fff" stopOpacity={0} />
            <Stop offset="100%" stopColor="#fff" stopOpacity={0.22} />
          </LinearGradient>
          <ClipPath id={`${id}-clip`}>
            <Path d={outline.d} />
          </ClipPath>
        </Defs>
        <Ellipse
          cx={100}
          cy={196}
          rx={56}
          ry={5}
          fill={mixColors(body, "#000000", 0.35)}
          opacity={0.22}
          transform={`translate(100 196) scale(${n(motion.shadow)} 1) translate(-100 -196)`}
        />
        <G
          transform={`translate(100 ${n(104 + motion.float.y)}) scale(${n(motion.float.sx)} ${n(motion.float.sy)}) translate(-100 -104)`}
        >
          <G
            transform={`translate(100 ${n(outline.bottom)}) rotate(${n(bodyRotate)}) scale(${n(bodySx)} ${n(bodySy)}) translate(-100 ${n(-outline.bottom)})`}
          >
            <Path d={outline.d} fill={glass ? mixColors(body, "transparent", 0.45) : body} />
            <G clipPath={`url(#${id}-clip)`}>
              <Path d={outline.d} fill={`url(#${id}-shade)`} opacity={layers.shade} />
              <Path d={outline.d} fill={`url(#${id}-rim)`} opacity={layers.rim} />
              <G transform={`translate(${n(lookX * -9)} ${n(lookY * -7)})`}>
                <Path d={outline.d} fill={`url(#${id}-light)`} opacity={layers.light} />
                <Ellipse
                  cx={70}
                  cy={outline.top + 26}
                  rx={20}
                  ry={11}
                  fill="#fff"
                  opacity={layers.spec}
                />
              </G>
            </G>
            {glass && (
              <Path
                d={outline.d}
                fill="none"
                stroke={mixColors(body, "#ffffff", 0.4)}
                strokeOpacity={0.6}
                strokeWidth={2}
              />
            )}
            {accessory ? <G>{accessory}</G> : null}
            <G
              transform={`translate(${n(now.gx * 24 + motion.flick.x)} ${n(now.gy * 16 + motion.flick.y)})`}
            >
              {look.brows &&
                ([-1, 1] as const).map((side) => {
                  const brow = now.brows[side < 0 ? 0 : 1];
                  const cx = 100 + side * spread;
                  const cy = eyeY - 26 * look.eyeSize;
                  return (
                    <Path
                      key={side}
                      d={`M${n(cx - 9)} ${n(cy)} L${n(cx + 9)} ${n(cy)}`}
                      transform={`translate(0 ${n(brow.dy)}) rotate(${n(brow.rotate)} ${n(cx)} ${n(cy)})`}
                      fill="none"
                      stroke={ink}
                      strokeWidth={6}
                      strokeLinecap="round"
                    />
                  );
                })}
              {([-1, 1] as const).map((side) => {
                const i = side < 0 ? 0 : 1;
                return (
                  <Eye
                    key={side}
                    id={id}
                    side={side}
                    x={100 + side * spread}
                    y={eyeY}
                    eyes={look.eyes}
                    eyeSize={look.eyeSize}
                    ink={ink}
                    pose={now.eyes[i]}
                    gx={now.gx}
                    gy={now.gy}
                    blink={motion.blink[i]}
                    turn={motion.turn[i]}
                  />
                );
              })}
              {look.cheeks &&
                ([-1, 1] as const).map((side) => (
                  <Ellipse
                    key={side}
                    cx={100 + side * (spread + 8)}
                    cy={eyeY + 22 * look.eyeSize}
                    rx={9}
                    ry={5}
                    fill={mixColors("#ff6b8a", body, 0.55)}
                    opacity={0.5}
                  />
                ))}
              <G transform={`translate(100 ${n(eyeY + 34 * Math.max(0.8, look.eyeSize))})`}>
                <Mouth kind={look.mouth} mood={mood} state={state} talk={motion.talk} ink={ink} />
              </G>
            </G>
          </G>
        </G>
        {state === "sleeping" &&
          motion.z.map((z, i) => (
            <SvgText
              // biome-ignore lint/suspicious/noArrayIndexKey: the two fixed z's
              key={i}
              x={(i === 0 ? 156 : 172) + z.x}
              y={(i === 0 ? 44 : 26) + z.y - 6}
              fontSize={i === 0 ? 18 : 14}
              fontWeight="600"
              fill={theme.color("neutral-on-background-weak")}
              opacity={reduceMotion ? 1 : z.opacity}
            >
              z
            </SvgText>
          ))}
      </Svg>
    </View>
  );
}
