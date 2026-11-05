"use client";

import classNames from "clsx";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Flex } from "../../components/Flex.js";
import { tokenLength } from "../../utils/layoutClasses.js";
import { createAudioMeter } from "./audioLevel.js";
import { clamp } from "./cube/math.js";
import type { RGB } from "./cube/renderer.js";
import { type CubeInput, CubeMotion } from "./cube/state.js";
import { type CubeEyes, type CubeLook, type CubeSide, CubeView, faceUnits } from "./cube/view.js";
import { baseMood, EyeGlyph, effectsFor, eyeGlyph, KawaiiLayer } from "./kawaii.js";
import {
  type MascotLook,
  type MascotProps,
  type MascotState,
  mascotLook,
  useMascotPoke,
} from "./Mascot.js";
import styles from "./Mascot.module.scss";

const SIZE = { s: 32, m: 48, l: 96, xl: 160 } as const;
const SCHEMES = new Set(["brand", "accent", "neutral"]);

/** The look the cube mascot starts from: the approved 3D character, before a seed or props. */
export const CUBE_LOOK: Required<Omit<MascotLook, "bodyPath" | "eyeColor">> = {
  color: "brand",
  roundness: 0.75,
  aspect: 1.12,
  surface: "glossy",
  eyes: "round",
  eyeSize: 1,
  eyeSpacing: 1,
  eyeHeight: 0,
  mouth: "smile",
  brows: true,
  cheeks: false,
  personality: "default",
  face: "3d",
  sides: "classic",
};

const CLASSIC: Record<Exclude<CubeSide, "front">, RGB> = {
  top: [0.957, 0.957, 0.949],
  right: [0.91, 0.2, 0.235],
  bottom: [1, 0.831, 0.231],
  back: [0.184, 0.42, 1],
  left: [1, 0.541, 0.122],
};

const LABEL: Record<MascotState, string> = {
  idle: "Assistant",
  listening: "Assistant, listening",
  thinking: "Assistant, thinking",
  speaking: "Assistant, speaking",
  sleeping: "Assistant, asleep",
};

const mixRGB = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

let probe: CanvasRenderingContext2D | null | undefined;

/** Any CSS color, or a scheme read from the element's tokens, as 0–1 RGB. */
export function resolveColor(node: Element, value: string, fallback: RGB = [0.45, 0.5, 0.95]): RGB {
  let css = value;
  if (SCHEMES.has(value)) {
    css = getComputedStyle(node).getPropertyValue(`--function-${value}-500`).trim();
    if (!css) return fallback;
  }
  if (probe === undefined) {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      probe = canvas.getContext("2d", { willReadFrequently: true });
    } catch {
      probe = null;
    }
  }
  if (!probe) return fallback;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = css;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

/** The six sides from a preset or a color per side; the front follows the body color unless set. */
export function cubeSides(
  sides: MascotLook["sides"],
  color: RGB,
  resolve: (css: string) => RGB,
): Record<CubeSide, RGB> {
  const white: RGB = [1, 1, 1];
  const black: RGB = [0, 0, 0];
  if (sides === "mono") {
    return { front: color, top: color, right: color, bottom: color, back: color, left: color };
  }
  if (sides === "tints") {
    return {
      front: color,
      top: mixRGB(color, white, 0.8),
      right: mixRGB(color, black, 0.25),
      bottom: mixRGB(color, black, 0.55),
      back: mixRGB(color, white, 0.3),
      left: mixRGB(color, white, 0.5),
    };
  }
  const out: Record<CubeSide, RGB> = { front: color, ...CLASSIC };
  if (typeof sides === "object") {
    for (const [side, css] of Object.entries(sides)) {
      if (css) out[side as CubeSide] = resolve(css);
    }
  }
  return out;
}

/**
 * The 3D mascot behind `working="cube"`: a soft blob at rest that becomes the 2 × 2 Once UI cube
 * while it thinks, solves it, shows the logo and softens back with its face. It draws with a small
 * built-in WebGL renderer and hands back to the flat mascot where WebGL is missing.
 */
export function MascotCube({ props, fallback }: { props: MascotProps; fallback: React.ReactNode }) {
  const {
    ref: forwardedRef,
    working: _working,
    state = "idle",
    mood = "neutral",
    seed,
    color,
    roundness,
    aspect,
    bodyPath: _bodyPath,
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
    sides,
    face,
    accessory: _accessory,
    lookAt = "pointer",
    level,
    source,
    size = "l",
    "aria-label": ariaLabel,
    poke = true,
    onPointerDown,
    effects,
    className,
    style,
    ...flex
  } = props;
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
      sides,
      face,
    }).filter(([, value]) => value !== undefined),
  );
  const look = {
    ...CUBE_LOOK,
    ...(seed !== undefined ? mascotLook(seed) : {}),
    ...passed,
  } as typeof CUBE_LOOK;
  const root = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);
  const length =
    typeof size === "number"
      ? tokenLength(size)
      : size in SIZE
        ? tokenLength(SIZE[size as keyof typeof SIZE])
        : size;

  // Everything the frame loop reads lives in refs, so a prop change never restarts it.
  const input = useRef<CubeInput>({
    state,
    mood: baseMood(mood),
    lookX: 0,
    lookY: 0,
    level: 0,
    reduced: false,
    personality: look.personality,
  });
  const prod = useMascotPoke(poke, onPointerDown);
  const shownMood = prod.poked ? "surprised" : mood;
  const fx = effectsFor(shownMood, effects);
  const glyph = eyeGlyph(fx);
  input.current.state = state;
  input.current.mood = baseMood(shownMood);
  input.current.pokes = prod.pokes;
  input.current.hideEyes = Boolean(glyph);
  input.current.laugh = glyph === "laugh";
  const overlay = useRef<SVGGElement | null>(null);
  const units = faceUnits({
    eyeSize: look.eyeSize,
    eyeSpacing: look.eyeSpacing,
    eyeHeight: look.eyeHeight,
    aspect: look.aspect,
  });
  input.current.personality = look.personality;
  const cubeLook = useRef<CubeLook | null>(null);
  const lookKey = JSON.stringify([look, eyeColor]);
  const latest = useRef({ look, eyeColor });
  latest.current = { look, eyeColor };

  // Resolve colors against the element, again whenever the theme changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `lookKey` is the trigger; the look is read from `latest`
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const apply = () => {
      const { look, eyeColor } = latest.current;
      const color = resolveColor(node, String(look.color));
      const eyes: CubeEyes = typeof look.eyes === "object" ? "round" : (look.eyes as CubeEyes);
      cubeLook.current = {
        color,
        sides: cubeSides(look.sides, color, (css) => resolveColor(node, css)),
        eyeColor: eyeColor
          ? resolveColor(node, eyeColor)
          : mixRGB([0.05, 0.055, 0.07], color, 0.12),
        roundness: look.roundness,
        aspect: look.aspect,
        eyes,
        eyeSize: look.eyeSize,
        eyeSpacing: look.eyeSpacing,
        eyeHeight: look.eyeHeight,
        brows: look.brows,
        mouth: look.mouth !== "none",
        cheeks: look.cheeks,
        face: look.face,
        surface: look.surface === "flat" ? "solid" : look.surface === "matte" ? "matte" : "glossy",
      };
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [lookKey]);

  // Where it looks: ahead, a fixed direction, or toward the pointer.
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    input.current.lookX = typeof lookAt === "object" ? clamp(lookAt.x, -1, 1) : 0;
    input.current.lookY = typeof lookAt === "object" ? clamp(lookAt.y, -1, 1) : 0;
    if (lookAt !== "pointer") return;
    const onMove = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      const reach = Math.max(box.width * 3, 240);
      input.current.lookX = clamp((event.clientX - (box.left + box.width / 2)) / reach, -1, 1);
      input.current.lookY = clamp((event.clientY - (box.top + box.height / 2)) / reach, -1, 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [lookAt]);

  // Speaking: a level from props, or a source read every frame.
  useEffect(() => {
    if (level !== undefined) {
      input.current.level = clamp(level, 0, 1);
      return;
    }
    input.current.level = 0;
    if (!source) return;
    const meter = createAudioMeter(source);
    if (!meter) return;
    let frame = 0;
    const tick = () => {
      input.current.level = meter.level();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      meter.disconnect();
    };
  }, [level, source]);

  // The frame loop: runs only while the mascot is on screen and the page is visible.
  useEffect(() => {
    const element = canvas.current;
    const node = root.current;
    if (!element || !node) return;
    let view: CubeView;
    try {
      view = new CubeView(element);
    } catch {
      setFailed(true);
      return;
    }
    const motion = new CubeMotion();
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last = performance.now();
    let onScreen = true;
    const tick = (now: number) => {
      frame = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const look = cubeLook.current;
      if (look) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.round(element.clientWidth * dpr));
        const height = Math.max(1, Math.round(element.clientHeight * dpr));
        if (element.width !== width || element.height !== height) {
          element.width = width;
          element.height = height;
        }
        input.current.reduced = Boolean(reduced?.matches);
        motion.update(dt, input.current);
        view.render(motion, look, input.current, width, height);
        // Kawaii glyphs ride on the face, over the canvas.
        const layer = overlay.current;
        if (layer) {
          const face = view.face;
          if (face) {
            const [[lx, ly], [rx, ry]] = face.eyes;
            layer.setAttribute(
              "transform",
              `translate(${(lx + rx) / 2} ${(ly + ry) / 2}) scale(${face.unit})`,
            );
          }
          layer.style.opacity = face ? String(face.opacity) : "0";
        }
      }
      schedule();
    };
    const schedule = () => {
      if (!frame && onScreen && !document.hidden) {
        frame = requestAnimationFrame(tick);
      }
    };
    const restart = () => {
      last = performance.now();
      schedule();
    };
    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            restart();
          });
    io?.observe(node);
    const lost = (event: Event) => {
      event.preventDefault();
      setFailed(true);
    };
    element.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", restart);
    restart();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      io?.disconnect();
      element.removeEventListener("webglcontextlost", lost);
      document.removeEventListener("visibilitychange", restart);
      view.dispose();
    };
  }, []);

  if (failed) return fallback;

  return (
    <Flex
      ref={(node: HTMLDivElement | null) => {
        root.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      center
      role="img"
      aria-label={ariaLabel ?? LABEL[state]}
      data-state={state}
      data-mood={baseMood(mood)}
      data-working="cube"
      className={classNames(styles.mascot, className)}
      style={
        {
          width: length,
          height: length,
          // The kawaii glyphs over the canvas color from these, as on the flat mascot.
          "--mascot-color": ["brand", "accent", "neutral"].includes(String(look.color))
            ? `var(--function-${look.color}-500)`
            : look.color,
          ...(eyeColor ? { "--mascot-eye": eyeColor } : {}),
          ...style,
        } as React.CSSProperties
      }
      {...flex}
      onPointerDown={prod.onPointerDown}
    >
      <canvas ref={canvas} className={styles.canvas} />
      {fx.size > 0 && (
        <svg
          className={styles.canvas}
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          overflow="visible"
          aria-hidden="true"
          focusable="false"
        >
          <g ref={overlay} style={{ opacity: 0 }}>
            {glyph &&
              ([-1, 1] as const).map((side) => (
                <g
                  key={side}
                  transform={`translate(${side * units.half} 0)`}
                  className={styles.kawaii}
                >
                  <EyeGlyph kind={glyph} side={side} />
                </g>
              ))}
            <KawaiiLayer
              effects={fx}
              at={{
                eyes: [
                  [-units.half, 0],
                  [units.half, 0],
                ],
                unit: 1,
                top: -units.top,
                halfWidth: units.halfWidth,
              }}
            />
          </g>
        </svg>
      )}
    </Flex>
  );
}
