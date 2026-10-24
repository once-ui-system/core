"use client";

import { Row } from "@once-ui-system/core";
import { useEffect, useRef } from "react";

/**
 * Prism Glow: soft streaks of light, the kind a prism throws across a dark
 * room, drifting slowly behind your content. Each streak is a long blurred
 * smear that runs through a colour gradient along its length, with the warm
 * and cool ends pulled slightly apart across its width the way a prism splits
 * light. Streaks fade in somewhere new, drift a little along their axis and
 * fade out again, so the layout never repeats and the centre stays clear for
 * a sign-in card or a headline.
 *
 * WebGL 2, no dependencies, one fullscreen pass over a handful of soft
 * shapes. The glow is all blur, so it renders at a fraction of the screen's
 * resolution and the browser scales it up: it costs very little GPU time.
 * Colours take any CSS value, theme tokens included, and follow theme
 * changes: on a dark ground the streaks add light, on a light ground they
 * tint it like coloured glass. The pointer gives the streaks a gentle
 * parallax. The render scale adapts to hold the frame rate, reduced motion
 * shows a still frame, and the loop sleeps while paused, offscreen or in a
 * hidden tab.
 */

export interface PrismGlowProps
  extends Omit<React.ComponentProps<typeof Row>, "children" | "background"> {
  /** Animate the streaks. When false the current frame stays on screen. */
  playing?: boolean;
  /** How many streaks are on screen at once, 1 to 16. */
  count?: number;
  /**
   * Two to five colour stops each streak runs through, end to end. Any CSS
   * colour or custom property, so theme tokens work. Defaults to a prism
   * spectrum: deep blue, azure, a cyan core, pale gold, orange.
   */
  colors?: string[];
  /** Drift speed multiplier. */
  speed?: number;
  /** Direction the streaks run in, in degrees (0 is horizontal, 90 vertical). */
  angle?: number;
  /** How far each streak's direction strays from `angle`, in degrees either way. */
  spread?: number;
  /** Softness, 0 (crisp, narrow streaks) to 1 (wide, hazy glow). */
  blur?: number;
  /** Brightness multiplier. */
  intensity?: number;
  /** How strongly streaks keep away from the middle, 0 (anywhere) to 1 (edges only). */
  clearance?: number;
  /** Ground colour behind the streaks. Defaults to the page background. */
  background?: string;
  /**
   * `"dark"` adds light to the ground, `"light"` tints it like coloured glass,
   * `"auto"` picks from the brightness of `background`.
   */
  tone?: "auto" | "dark" | "light";
  /** The pointer gives the streaks a gentle parallax. */
  interactive?: boolean;
}

const DEFAULT_COLORS = ["#2330ff", "#1a7dff", "#18eeff", "#f4f3a6", "#ff6d1a"];
const MAX_STREAKS = 16;
const MAX_STOPS = 5;

interface SceneProps {
  playing: boolean;
  count: number;
  colors: string[];
  speed: number;
  angle: number;
  spread: number;
  blur: number;
  intensity: number;
  clearance: number;
  background: string;
  tone: "auto" | "dark" | "light";
  interactive: boolean;
}

interface Scene {
  set(next: Partial<SceneProps>): void;
  dispose(): void;
}

const vert = `#version 300 es
  in vec2 aPos;
  void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const frag = `#version 300 es
  precision highp float;
  uniform vec2 uRes;
  uniform float uTime;
  uniform vec3 uBg;
  uniform float uTone;           // 0 adds light, 1 tints like glass
  uniform int uCount;
  uniform vec4 uA[${MAX_STREAKS}];  // centre x, y, direction cos, sin
  uniform vec4 uB[${MAX_STREAKS}];  // half length (signed: flips the gradient), half width, strength, hue shift
  uniform int uStops;
  uniform vec3 uStop[${MAX_STOPS}];
  out vec4 outColor;

  vec3 gradient(float t) {
    float x = clamp(t, 0.0, 1.0) * float(uStops - 1);
    int i = min(int(x), uStops - 2);
    return mix(uStop[i], uStop[i + 1], smoothstep(0.0, 1.0, x - float(i)));
  }

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 frag = gl_FragCoord.xy;
    vec2 p = (frag - 0.5 * uRes) / uRes.y * 2.0;

    // Light added (dark ground) and light absorbed (light ground), per channel.
    vec3 glow = vec3(0.0);
    vec3 ink = vec3(0.0);
    for (int i = 0; i < ${MAX_STREAKS}; i++) {
      if (i >= uCount) break;
      vec4 a = uA[i];
      vec4 b = uB[i];
      if (b.z <= 0.0) continue;
      vec2 d = p - a.xy;
      float u = dot(d, a.zw) / b.x;
      float v = dot(d, vec2(-a.w, a.z)) / b.y;
      // A long soft body that tapers towards the ends.
      float r2 = u * u + v * v * (1.0 + 0.15 * u * u);
      if (r2 > 9.0) continue;
      float e = exp(-r2) * b.z;
      // The gradient runs along the streak and leans across it: the prism split.
      float t = 0.5 + 0.45 * u + 0.18 * v + b.w;
      vec3 c = gradient(t);
      glow += c * e;
      ink += (1.0 - c) * e;
    }

    // Dark: screen the light onto the ground, so overlaps bloom towards white.
    vec3 lit = 1.0 - (1.0 - uBg) * exp(-glow * 2.2);
    // Light: each streak filters the ground like a sheet of tinted glass.
    vec3 tinted = uBg * exp(-ink * 0.9);
    vec3 col = mix(lit, tinted, uTone);

    // Dither, so the long soft falloffs never band.
    col += (hash(frag + fract(uTime)) - 0.5) / 255.0;
    outColor = vec4(col, 1.0);
  }
`;

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

// Deterministic per-streak, per-life randomness.
function rand(i: number, k: number, salt: number) {
  const s = Math.sin(i * 127.1 + k * 311.7 + salt * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

function createPrismGlow(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  initial: SceneProps,
): Scene | null {
  const context = canvas.getContext("webgl2", { antialias: false, alpha: false, depth: false });
  if (!context) return null;
  const gl = context;

  function compile(type: number, src: string) {
    const s = gl.createShader(type) as WebGLShader;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "");
    return s;
  }
  const prog = gl.createProgram() as WebGLProgram;
  try {
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.bindAttribLocation(prog, 0, "aPos");
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  } catch {
    return null;
  }

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const U = {
    res: gl.getUniformLocation(prog, "uRes"),
    time: gl.getUniformLocation(prog, "uTime"),
    bg: gl.getUniformLocation(prog, "uBg"),
    tone: gl.getUniformLocation(prog, "uTone"),
    count: gl.getUniformLocation(prog, "uCount"),
    a: gl.getUniformLocation(prog, "uA"),
    b: gl.getUniformLocation(prog, "uB"),
    stops: gl.getUniformLocation(prog, "uStops"),
    stop: gl.getUniformLocation(prog, "uStop"),
  };

  // Resolve any CSS colour (tokens, oklch, hex) to RGB by computing it with
  // the host's styles and painting it into a 1px canvas.
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const probeCtx = probe.getContext("2d", { willReadFrequently: true });
  const swatch = document.createElement("span");
  swatch.style.display = "none";
  host.appendChild(swatch);
  function resolve(css: string): [number, number, number] {
    swatch.style.color = "";
    swatch.style.color = css;
    const computed = getComputedStyle(swatch).color;
    if (!probeCtx) return [0, 0, 0];
    probeCtx.clearRect(0, 0, 1, 1);
    probeCtx.fillStyle = "#000";
    probeCtx.fillStyle = computed;
    probeCtx.fillRect(0, 0, 1, 1);
    const [r, g, b] = probeCtx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  }

  const props = { ...initial };
  const stopData = new Float32Array(MAX_STOPS * 3);
  let stopCount = 2;
  let ground: [number, number, number] = [0, 0, 0];
  let groundTone = 0;
  function readColors() {
    const list = (props.colors.length ? props.colors : DEFAULT_COLORS).slice(0, MAX_STOPS);
    if (list.length === 1) list.push(list[0]);
    stopCount = list.length;
    for (let i = 0; i < list.length; i++) stopData.set(resolve(list[i]), i * 3);
    ground = resolve(props.background || "var(--page-background, #000)");
    const lum = 0.2126 * ground[0] + 0.7152 * ground[1] + 0.0722 * ground[2];
    groundTone = Math.min(1, Math.max(0, (lum - 0.35) / 0.3));
    dirty = true;
  }
  const toneValue = () => (props.tone === "dark" ? 0 : props.tone === "light" ? 1 : groundTone);

  // Device pixels per CSS pixel. The glow has no edges, so half the screen's
  // density already looks the same, and a struggling device can drop to a
  // fifth before the scaled-up blur shows it.
  const SCALE = 0.5;
  const MIN_PX = 0.2;
  const START_PIXELS = 5e5;
  let maxPx = 1;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  let time = 40; // start with every streak somewhere into its life
  let px = 0;
  let dirty = true;
  let visible = true;
  let disposed = false;
  let raf = 0;
  let last = 0;

  // Each streak lives for a while: it fades in at a random spot, drifts along
  // its own axis and fades out, then comes back somewhere else.
  const aData = new Float32Array(MAX_STREAKS * 4);
  const bData = new Float32Array(MAX_STREAKS * 4);
  function layout() {
    const aspect = canvas.width / Math.max(1, canvas.height);
    const n = Math.max(1, Math.min(MAX_STREAKS, Math.round(props.count)));
    const blur = Math.min(1, Math.max(0, props.blur));
    const clear = Math.min(1, Math.max(0, props.clearance));
    const base = (props.angle * Math.PI) / 180;
    const spread = (props.spread * Math.PI) / 180;
    // Fewer streaks are drawn a little larger, so a sparse field still glows.
    // Sizes are in frame heights, so a tall, narrow frame shrinks them to fit.
    const size = (1.15 - 0.25 * Math.min(1, n / 12)) * Math.min(1, 0.35 + 0.65 * aspect);
    aData.fill(0);
    bData.fill(0);
    for (let i = 0; i < n; i++) {
      const life = 15 + 9 * rand(i, 0, 1);
      const phase = time / life + rand(i, 0, 2);
      const k = Math.floor(phase);
      const f = phase - k;
      // Streaks share the frame out by direction from the middle, so they
      // surround the content instead of piling up on one side; `clearance`
      // keeps them out of an ellipse around it.
      const slot = (Math.PI * 2 * (i + 0.2 + 0.6 * rand(i, k, 3))) / n + rand(0, 0, 13) * 6.283;
      const reach = clear * 0.8 + (1.3 - clear * 0.8) * Math.sqrt(rand(i, k, 4));
      const x = Math.cos(slot) * reach * (aspect + 0.1);
      const y = Math.sin(slot) * reach * 1.1;
      const theta = base + (rand(i, k, 5) * 2 - 1) * spread + (f - 0.5) * 0.12;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const drift = (f - 0.5) * (0.35 + 0.3 * rand(i, k, 6));
      const depth = 0.4 + 0.6 * rand(i, 0, 7);
      const fade = smoothstep(0, 0.3, f) * smoothstep(1, 0.7, f);
      aData[i * 4] = x + c * drift - ptr.x * 0.06 * depth;
      aData[i * 4 + 1] = y + s * drift - ptr.y * 0.06 * depth;
      aData[i * 4 + 2] = c;
      aData[i * 4 + 3] = s;
      const len = (0.24 + 0.14 * rand(i, k, 8)) * size * (1 + 0.15 * blur);
      const width = (0.065 + 0.035 * rand(i, k, 9)) * size * (0.55 + 0.9 * blur);
      bData[i * 4] = rand(i, k, 10) < 0.5 ? len : -len;
      bData[i * 4 + 1] = width;
      // Wider streaks spread the same light thinner.
      bData[i * 4 + 2] =
        fade * (0.7 + 0.5 * rand(i, k, 11)) * props.intensity * (1.15 - 0.3 * blur);
      bData[i * 4 + 3] = (rand(i, k, 12) - 0.5) * 0.16;
    }
    return n;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    maxPx = dpr * SCALE;
    const area = host.clientWidth * host.clientHeight;
    if (!px && area > 0) px = Math.sqrt(START_PIXELS / area);
    if (px) px = Math.min(maxPx, Math.max(MIN_PX, px));
    const w = Math.max(1, Math.round(host.clientWidth * (px || maxPx)));
    const h = Math.max(1, Math.round(host.clientHeight * (px || maxPx)));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    dirty = true;
  }

  // Resolution governor: frame times are averaged over half a second, so a
  // slow device sheds pixels within a moment and a fast one climbs back slowly.
  let spent = 0;
  let counted = 0;
  let calm = 0;
  function govern(ms: number) {
    spent += Math.min(ms, 500);
    counted++;
    if (spent < 500 || counted < 3) return;
    const avg = spent / counted;
    spent = 0;
    counted = 0;
    let next = px;
    if (avg > 21) {
      // Pixel cost scales with area, so step by the square root of the overrun.
      next = Math.max(MIN_PX, px * Math.max(0.6, Math.sqrt(16.7 / avg)));
      calm = 0;
    } else if (avg < 18.5 && ++calm >= 3) {
      next = Math.min(maxPx, px * 1.12);
      calm = 0;
    }
    if (next !== px) {
      px = next;
      resize();
    }
  }

  function draw() {
    const n = layout();
    gl.viewport(0, 0, canvas.width, canvas.height);
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL call, not a React hook
    gl.useProgram(prog);
    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1f(U.time, time);
    gl.uniform3fv(U.bg, ground);
    gl.uniform1f(U.tone, toneValue());
    gl.uniform1i(U.count, n);
    gl.uniform4fv(U.a, aData);
    gl.uniform4fv(U.b, bData);
    gl.uniform1i(U.stops, stopCount);
    gl.uniform3fv(U.stop, stopData);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  const animating = () => props.playing && !reduce.matches;

  // The GPU's progress on the last two frames. A new one is drawn only once
  // the one before last is done: a frame in flight keeps the GPU busy, more
  // only add input lag. When the governor is about to judge, the last one
  // must land too, as a resize would otherwise wait for it.
  let fence: WebGLSync | null = null;
  let newer: WebGLSync | null = null;

  function frame(now: number) {
    raf = 0;
    const judging = last > 0 && counted >= 2 && spent + now - last >= 500;
    const sync = judging ? newer : fence;
    // A frame that only fills the GPU's second slot is drawn at once, so its
    // interval is no measure of the frame rate.
    const refill = !judging && !fence && newer !== null;
    if (sync && gl.getSyncParameter(sync, gl.SYNC_STATUS) === gl.UNSIGNALED) {
      raf = requestAnimationFrame(frame);
      return;
    }
    if (fence) gl.deleteSync(fence);
    fence = null;
    if (judging && newer) {
      gl.deleteSync(newer);
      newer = null;
    }
    const elapsed = last ? now - last : 0;
    const dt = Math.min(0.05, elapsed / 1000);
    last = now;
    if (animating()) {
      time += dt * props.speed;
      dirty = true;
      // The last frame's cost sizes this one, so a resize is drawn at once.
      if (elapsed > 0 && !refill) govern(elapsed);
    }
    const ease = 1 - Math.exp(-dt * 3);
    const easing = Math.abs(ptr.tx - ptr.x) + Math.abs(ptr.ty - ptr.y) > 1e-3;
    if (easing) {
      ptr.x += (ptr.tx - ptr.x) * ease;
      ptr.y += (ptr.ty - ptr.y) * ease;
      dirty = true;
    }
    if (dirty) {
      draw();
      fence = newer;
      newer = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      dirty = false;
    }
    if ((animating() || easing) && visible && !document.hidden) raf = requestAnimationFrame(frame);
    else {
      // Pauses and hidden tabs must not count as slow frames.
      last = 0;
      spent = 0;
      counted = 0;
    }
  }

  function wake() {
    if (disposed || raf || !visible || document.hidden) return;
    raf = requestAnimationFrame(frame);
  }

  // Pointer offset from the middle, -1..1 on each axis.
  const onMove = (e: PointerEvent) => {
    if (!props.interactive || reduce.matches) return;
    const r = host.getBoundingClientRect();
    ptr.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ptr.ty = (0.5 - (e.clientY - r.top) / r.height) * 2;
    wake();
  };
  const onLeave = () => {
    ptr.tx = 0;
    ptr.ty = 0;
    wake();
  };
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerleave", onLeave);

  // Scheme switches change the tokens underneath us.
  const themeObserver = new MutationObserver(() => {
    readColors();
    wake();
  });
  themeObserver.observe(document.documentElement, { attributes: true });
  const ro = new ResizeObserver(() => {
    resize();
    wake();
  });
  ro.observe(host);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    wake();
  });
  io.observe(host);
  document.addEventListener("visibilitychange", wake);
  reduce.addEventListener("change", wake);

  readColors();
  resize();
  wake();

  return {
    set(next) {
      Object.assign(props, next);
      if (next.colors !== undefined || next.background !== undefined) readColors();
      if (!props.interactive) {
        ptr.tx = 0;
        ptr.ty = 0;
      }
      dirty = true;
      wake();
    },
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      themeObserver.disconnect();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", wake);
      reduce.removeEventListener("change", wake);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      swatch.remove();
      for (const f of [fence, newer]) if (f) gl.deleteSync(f);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}

export function PrismGlow({
  playing = true,
  count = 9,
  colors = DEFAULT_COLORS,
  speed = 1,
  angle = 20,
  spread = 35,
  blur = 0.6,
  intensity = 1,
  clearance = 0.4,
  background = "var(--page-background)",
  tone = "auto",
  interactive = true,
  ...flex
}: PrismGlowProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  // The scene is built once with the first props; later changes go through set().
  const initial = useRef<SceneProps>({
    playing,
    count,
    colors,
    speed,
    angle,
    spread,
    blur,
    intensity,
    clearance,
    background,
    tone,
    interactive,
  });
  const colorKey = colors.join("|");

  useEffect(() => {
    if (!hostRef.current || !canvasRef.current) return;
    const scene = createPrismGlow(canvasRef.current, hostRef.current, initial.current);
    sceneRef.current = scene;
    return () => {
      scene?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.set({
      playing,
      count,
      speed,
      angle,
      spread,
      blur,
      intensity,
      clearance,
      tone,
      interactive,
    });
  }, [playing, count, speed, angle, spread, blur, intensity, clearance, tone, interactive]);

  useEffect(() => {
    sceneRef.current?.set({ colors: colorKey.split("|"), background });
  }, [colorKey, background]);

  return (
    <Row ref={hostRef} aria-hidden="true" fill overflow="hidden" style={{ background }} {...flex}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%" }}
      />
    </Row>
  );
}
