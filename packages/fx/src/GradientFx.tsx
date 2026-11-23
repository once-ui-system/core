"use client";

import { Flex, type Speed, useReducedMotion } from "@once-ui-system/core";
import classNames from "clsx";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./GradientFx.module.scss";
import { canvasColor, watchTheme } from "./internal/canvasStage.js";
import { cssColor } from "./internal/cssColor.js";
import { prefersReducedMotionNow } from "./internal/reducedMotion.js";
import { createShaderStage, rgbOf, supportsWebGL } from "./internal/shaderStage.js";
import { speedFactor } from "./internal/speed.js";

export interface GradientFxProps extends React.ComponentProps<typeof Flex> {
  /**
   * The colour ramp, from shadow to highlight (2 to 6 stops): tokens
   * (`brand-solid-strong`, `accent-weak`), custom properties (`--my-color`) or
   * CSS colours. The first is the field's ground. Read again when the theme changes.
   */
  colors?: string[];
  /** A multiplier on the designed drift (`1`), or `"slow"`/`"medium"`/`"fast"` (0.5, 1, 2). */
  speed?: Speed;
  /** Film grain, 0 (clean) to 1 (heavy). */
  grain?: number;
  /** How soft the bands are, 0 (crisp ribbons) to 1 (a haze). */
  blur?: number;
  /** Degrees the bands run along; 0 is left to right, positive turns them clockwise. */
  angle?: number;
  /** Picks the field: the same seed draws the same field, on every visit. */
  seed?: number;
  reducedMotion?: boolean | "auto";
  children?: React.ReactNode;
}

const DEFAULT_COLORS = [
  "page-background",
  "brand-background-strong",
  "brand-solid-strong",
  "accent-solid-medium",
  "accent-solid-weak",
];

const MAX_STOPS = 6;

const clamp01 = (value: number, fallback: number) =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;

/** A small seeded random, so the server and the browser draw the same blobs. */
const seeded = (seed: number, i: number) => {
  const x = Math.sin((seed + 1) * 12.9898 + i * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// 2D simplex noise: Ian McEwan and Stefan Gustavson, Ashima Arts (MIT).
const FRAGMENT = `precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_offset;
uniform vec2 u_dir;
uniform float u_soft;
uniform float u_grain;
uniform float u_frame;
uniform vec3 u_colors[${MAX_STOPS}];
uniform float u_count;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 ramp(float t) {
  float x = clamp(t, 0.0, 1.0) * (u_count - 1.0);
  vec3 color = u_colors[0];
  for (int i = 1; i < ${MAX_STOPS}; i++) {
    if (float(i) < u_count) {
      color = mix(color, u_colors[i], smoothstep(0.0, 1.0, clamp(x - float(i - 1), 0.0, 1.0)));
    }
  }
  return color;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  // Turn the plane so the bands run along u_dir, then stretch along them:
  // a few broad ribbons, not a marble.
  vec2 q = vec2(dot(p, u_dir), dot(p, vec2(-u_dir.y, u_dir.x)));
  q *= vec2(0.32, 1.0) * mix(1.9, 1.05, u_soft);

  float t = u_time * 0.035;
  vec2 o = u_offset;
  // A gentle domain warp, so the ribbons bend and flow through each other.
  vec2 w = vec2(
    snoise(q * 0.6 + o + vec2(t, -t * 0.5)),
    snoise(q * 0.6 + o.yx + vec2(4.1, 7.3) - vec2(t * 0.7, t))
  );
  vec2 r = q + w * 0.45 + vec2(-t * 0.6, t * 0.25);
  // Softness takes the finer octaves away.
  float n = snoise(r + o) * 0.72
    + snoise(r * 2.1 + o + 3.1) * 0.24 * (1.0 - u_soft * 0.75)
    + snoise(r * 4.3 + o + 7.7) * 0.10 * (1.0 - u_soft);
  // A slow light across the field, so one side rests in shadow.
  float light = dot(p, vec2(u_dir.y, -u_dir.x)) * 0.5 + dot(p, u_dir) * 0.2;
  float v = 0.48 + n * 0.55 + light;
  v = smoothstep(0.0, 1.0, v);

  vec3 color = ramp(v);

  // Film grain, a fresh pattern each frame; and a hair of dither against banding.
  float g = hash12(gl_FragCoord.xy + u_frame * vec2(37.0, 17.0)) - 0.5;
  float lum = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color += g * u_grain * (0.10 + 0.22 * (1.0 - abs(lum - 0.45)));
  color += (hash12(gl_FragCoord.yx + 3.7) - 0.5) / 255.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

/**
 * An animated grain gradient: soft colour bands that drift slowly through
 * each other, under fine film grain. A WebGL shader draws it; the server and
 * any browser without WebGL get the CSS look (blurred blobs and SVG grain),
 * which the shader fades in over. Off screen it sleeps, and under reduced
 * motion it holds one still frame.
 *
 * Put it behind content as a background: children sit on top.
 */
const GradientFx = ({
  ref: forwardedRef,
  colors: colorsProp,
  speed: speedProp,
  grain: grainProp = 0.35,
  blur: blurProp = 0.6,
  angle = -30,
  seed = 0,
  reducedMotion = "auto",
  children,
  className,
  style,
  ...rest
}: GradientFxProps) => {
  const colors = (colorsProp?.length ? colorsProp : DEFAULT_COLORS).slice(0, MAX_STOPS);
  if (colors.length === 1) colors.unshift("page-background");
  const colorsKey = colors.join("|");
  const speed = speedFactor(speedProp);
  const grain = clamp01(grainProp, 0.35);
  const blur = clamp01(blurProp, 0.6);
  const { shouldAnimate } = useReducedMotion(reducedMotion);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    if (forwardedRef) {
      if ("current" in forwardedRef) {
        forwardedRef.current = containerRef.current;
      } else if (typeof forwardedRef === "function") {
        forwardedRef(containerRef.current);
      }
    }
  }, [forwardedRef]);

  const motion =
    reducedMotion === false
      ? true
      : reducedMotion === true
        ? false
        : shouldAnimate && !prefersReducedMotionNow();

  // One shader per look; a new palette, softness or seed sets it up again.
  // biome-ignore lint/correctness/useExhaustiveDependencies: colorsKey stands for colors
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    if (!supportsWebGL()) {
      setWebgl(false);
      return;
    }

    const readPalette = () => {
      const flat = new Float32Array(MAX_STOPS * 3);
      colors.forEach((c, i) => {
        const rgb = rgbOf(canvasColor(container, c)) ?? [0, 0, 0];
        flat.set(rgb, i * 3);
      });
      return flat;
    };
    let palette = readPalette();
    let frameCount = 0;
    const radians = (angle * Math.PI) / 180;
    const dir: [number, number] = [Math.cos(radians), -Math.sin(radians)];
    const offset: [number, number] = [seeded(seed, 1) * 40 - 20, seeded(seed, 2) * 40 - 20];

    const handle = createShaderStage(canvas, container, {
      fragment: FRAGMENT,
      startTime: seeded(seed, 3) * 60,
      onReady: () => setReady(true),
      onLost: () => {
        setReady(false);
        setWebgl(false);
      },
      frame: (stage, time) => {
        const { gl, uniform } = stage;
        frameCount = (frameCount + 1) % 997;
        gl.uniform2f(uniform("u_res"), stage.width, stage.height);
        gl.uniform1f(uniform("u_time"), time);
        gl.uniform2f(uniform("u_offset"), offset[0], offset[1]);
        gl.uniform2f(uniform("u_dir"), dir[0], dir[1]);
        gl.uniform1f(uniform("u_soft"), blur);
        gl.uniform1f(uniform("u_grain"), grain);
        gl.uniform1f(uniform("u_frame"), motion ? frameCount : 0);
        gl.uniform3fv(uniform("u_colors"), palette);
        gl.uniform1f(uniform("u_count"), colors.length);
      },
    });
    if (!handle) {
      setWebgl(false);
      return;
    }
    setWebgl(true);
    handle.setRate(speed);
    if (motion) handle.play();
    else handle.paint();

    const unwatch = watchTheme(() => {
      palette = readPalette();
      if (!motion) handle.paint();
    });

    return () => {
      unwatch();
      handle.stop();
      setReady(false);
    };
  }, [colorsKey, speed, grain, blur, angle, seed, motion]);

  // The CSS look: one blob per colour after the ground, placed by the seed.
  const blobs = colors.slice(1).map((color, i) => {
    // Rounded, so the server's markup and the browser's agree to the digit.
    const r = (k: number) => Math.round(seeded(seed, 10 + i * 7 + k) * 1000) / 1000;
    const fix = (n: number) => Math.round(n * 100) / 100;
    return {
      key: `${i}-${color}`,
      style: {
        "--gradient-fx-color": cssColor(color),
        "--gradient-fx-angle": `${fix(angle + (r(0) - 0.5) * 30)}deg`,
        "--gradient-fx-dx": `${fix((r(1) - 0.5) * 30)}%`,
        "--gradient-fx-dy": `${fix((r(2) - 0.5) * 20)}%`,
        "--gradient-fx-duration": `${fix((14 + r(3) * 10) / speed)}s`,
        "--gradient-fx-delay": `${fix(-r(4) * 20)}s`,
        left: `${fix(10 + r(5) * 45 + i * 6)}%`,
        top: `${fix(15 + r(6) * 40 + i * 5)}%`,
      } as React.CSSProperties,
    };
  });

  const showCanvas = webgl && ready;

  return (
    <Flex
      ref={containerRef}
      fill
      overflow="hidden"
      className={classNames(styles.field, className)}
      style={
        {
          "--gradient-fx-base": cssColor(colors[0]),
          "--gradient-fx-blur": `${2 + blur * 6}rem`,
          "--gradient-fx-grain": String(Math.round(grain * 80) / 100),
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <div
        className={classNames(styles.layer, styles.base)}
        aria-hidden="true"
        data-still={motion && !showCanvas ? undefined : "true"}
        data-hidden={showCanvas ? "true" : undefined}
      >
        <div className={styles.blobs}>
          {blobs.map((blob) => (
            <div key={blob.key} className={styles.blob} style={blob.style} />
          ))}
        </div>
        {grain > 0 && <div className={styles.grain} />}
      </div>
      {webgl && (
        <div className={styles.layer} aria-hidden="true">
          {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: a canvas without tabIndex is not focusable; this one is decoration */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={styles.canvas}
            data-ready={ready ? "true" : "false"}
          />
        </div>
      )}
      {children}
    </Flex>
  );
};

GradientFx.displayName = "GradientFx";

export { GradientFx };
