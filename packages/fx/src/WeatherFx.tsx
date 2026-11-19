"use client";

import { Flex, type Speed, useReducedMotion } from "@once-ui-system/core";
import type React from "react";
import { useEffect, useRef } from "react";
import {
  canvasColor,
  clampCount,
  createStage,
  isDarkBackground,
  pick,
  rand,
  type Stage,
  type StageHandle,
  watchTheme,
} from "./internal/canvasStage.js";
import { cannotHover } from "./internal/pointer.js";
import { prefersReducedMotionNow } from "./internal/reducedMotion.js";
import { speedFactor } from "./internal/speed.js";
import { useControllableState } from "./internal/useControllableState.js";

type WeatherType = "rain" | "snow" | "leaves" | "lightning";

interface WeatherFxProps
  extends Omit<React.ComponentProps<typeof Flex>, "onChange" | "defaultValue"> {
  type?: WeatherType;
  /** A multiplier on the designed pace (`1`), or `"slow"`/`"medium"`/`"fast"` (0.5, 1, 2). */
  speed?: Speed;
  /**
   * Colours to draw with: tokens (`brand-solid-medium`, `accent-weak`), custom
   * properties (`--my-color`) or CSS colours. Leaves blend each colour into the
   * next. Read again when the theme changes.
   */
  colors?: string[];
  /**
   * How much weather: drops, flakes or leaves on screen (0 to 400). For
   * lightning, how often it strikes: 10 is about every 1.5 s, 50 and up as
   * often as is safe (never more than twice a second).
   */
  intensity?: number;
  /** Degrees the weather leans from straight down; positive drifts right. */
  angle?: number;
  /** Milliseconds the weather runs once it starts; then `active` turns off. Unset runs until `active` is false. */
  duration?: number;
  /**
   * What starts the weather by itself: `mount` (on load), `hover` (while the
   * pointer is over it; a tap toggles it on touch screens) or `click` (each
   * click toggles it). Setting `active` drives it from outside, whatever the trigger.
   */
  trigger?: "mount" | "hover" | "click";
  /** Whether the weather is running. Controlled; pair with `onActiveChange`. */
  active?: boolean;
  /** The first value of `active` when uncontrolled. Defaults to `trigger === "mount"`. */
  defaultActive?: boolean;
  /** Called when the weather starts or stops by hover, click or `duration`. */
  onActiveChange?: (active: boolean) => void;
  reducedMotion?: boolean | "auto";
  children?: React.ReactNode;
}

const DEFAULT_COLORS = ["brand-solid-medium"];
const DEFAULT_LEAF_COLORS = ["brand-solid-medium", "accent-solid-medium"];

/** Lightning never flashes more often than this many seconds (WCAG 2.3.1: under three flashes a second). */
const LIGHTNING_MIN_INTERVAL = 0.5;

interface Particle {
  x: number;
  y: number;
  /** Depth, 0 far to 1 near: size, speed and opacity follow it. */
  z: number;
  speed: number;
  phase: number;
  vphase: number;
  sway: number;
  rot: number;
  vrot: number;
  flip: number;
  vflip: number;
  color: number;
}

interface Segment {
  x: number;
  y: number;
}

interface Branch {
  startIndex: number;
  segments: Segment[];
  thickness: number;
  children: Branch[];
}

interface Bolt {
  segments: Segment[];
  branches: Branch[];
  color: number;
  opacity: number;
  thickness: number;
  life: number;
  age: number;
  reveal: number;
}

interface Scene {
  /** Fills the sky: `scatter` lays particles over the whole area, otherwise they enter from above. */
  start: (scatter: boolean) => void;
  step: (dt: number, emitting: boolean) => void;
  draw: (colors: string[], sprites: SpriteCache) => void;
  alive: () => boolean;
  clear: () => void;
}

/** Soft sprites drawn once per colour, so a frame is drawImage calls rather than gradients. */
interface SpriteCache {
  get: (
    key: string,
    draw: (ctx: CanvasRenderingContext2D, size: number) => void,
  ) => CanvasImageSource | null;
}

function spriteCache(): SpriteCache {
  const cache = new Map<string, HTMLCanvasElement | null>();
  return {
    get(key, draw) {
      if (cache.has(key)) return cache.get(key) ?? null;
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        cache.set(key, null);
        return null;
      }
      draw(ctx, 64);
      cache.set(key, canvas);
      return canvas;
    },
  };
}

function fallScene(
  stage: Stage,
  type: "rain" | "snow" | "leaves",
  count: number,
  colorCount: number,
  angle: number,
): Scene {
  let particles: Particle[] = [];
  const rad = (Math.max(-60, Math.min(60, angle)) * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = Math.cos(rad);
  // Wider than the box on the upwind side, so slanted weather reaches every corner.
  const reachX = () => Math.tan(Math.abs(rad)) * stage.height;

  const speedFor = (z: number) =>
    type === "rain" ? rand(650, 800) + z * 600 : type === "snow" ? 22 + z * 60 : 40 + z * 55;

  const spawn = (y: number): Particle => {
    const z = Math.random() ** 1.4; // more far than near
    const reach = reachX();
    return {
      x: rand(-(dx > 0 ? reach : 0) - 20, stage.width + (dx < 0 ? reach : 0) + 20),
      y,
      z,
      speed: speedFor(z),
      phase: rand(0, Math.PI * 2),
      vphase: type === "snow" ? rand(0.5, 1.3) : rand(0.4, 1),
      sway: type === "snow" ? 8 + z * 22 : 20 + z * 40,
      rot: rand(0, Math.PI * 2),
      vrot: rand(-1.6, 1.6),
      flip: rand(0, Math.PI * 2),
      vflip: rand(-3, 3),
      color: pick(colorCount),
    };
  };

  const top = () => -40;

  const start = (scatter: boolean) => {
    const { height } = stage;
    const missing = count - particles.length;
    for (let i = 0; i < missing; i++) {
      particles.push(spawn(scatter ? rand(-40, height) : rand(-height, 0) - 20));
    }
  };

  const step = (dt: number, emitting: boolean) => {
    const { width, height } = stage;
    const reach = reachX() + 80;
    let n = 0;
    for (const p of particles) {
      p.x += p.speed * dx * dt;
      p.y += p.speed * dy * dt;
      p.phase += p.vphase * dt;
      p.rot += p.vrot * dt;
      p.flip += p.vflip * dt;
      const gone = p.y > height + 40 || p.x < -reach || p.x > width + reach;
      if (!gone) {
        particles[n++] = p;
      } else if (emitting) {
        const fresh = spawn(top());
        particles[n++] = fresh;
      }
    }
    particles.length = n;
  };

  const draw = (colors: string[], sprites: SpriteCache) => {
    const { ctx, dpr } = stage;
    const color = (i: number) => colors[i] ?? colors[0];

    if (type === "rain") {
      ctx.lineCap = "round";
      for (const p of particles) {
        const length = 10 + p.z * 22;
        const alpha = 0.28 + p.z * 0.55;
        ctx.strokeStyle = color(p.color);
        ctx.lineWidth = 0.6 + p.z * 1.1;
        // A head and a fainter tail read as motion without a gradient per drop.
        ctx.globalAlpha = alpha * 0.35;
        ctx.beginPath();
        ctx.moveTo(p.x - dx * length, p.y - dy * length);
        ctx.lineTo(p.x - dx * length * 0.45, p.y - dy * length * 0.45);
        ctx.stroke();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(p.x - dx * length * 0.45, p.y - dy * length * 0.45);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      return;
    }

    if (type === "snow") {
      for (const p of particles) {
        const c = color(p.color);
        const sprite = sprites.get(`flake:${c}`, (s, size) => {
          const r = size / 2;
          const g = s.createRadialGradient(r, r, 0, r, r, r);
          g.addColorStop(0, c);
          g.addColorStop(0.45, c);
          g.addColorStop(1, "transparent");
          s.fillStyle = g;
          s.fillRect(0, 0, size, size);
        });
        // Near flakes are larger and softer, far ones small and faint.
        const radius = 1.8 + p.z * 5.2;
        const x = p.x + Math.sin(p.phase) * p.sway;
        ctx.globalAlpha = 0.35 + p.z * 0.6;
        if (sprite) {
          ctx.drawImage(sprite, x - radius, p.y - radius, radius * 2, radius * 2);
        } else {
          ctx.fillStyle = c;
          ctx.beginPath();
          ctx.arc(x, p.y, radius * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      return;
    }

    // Leaves
    for (const p of particles) {
      const c1 = color(p.color);
      const c2 = color(Math.min(p.color + 1, colors.length - 1));
      const sprite = sprites.get(`leaf:${c1}:${c2}`, (s, size) => {
        const w = size * 0.32;
        const h = size * 0.48;
        s.translate(size / 2, size / 2);
        const g = s.createLinearGradient(-w, -h, w, h);
        g.addColorStop(0, c1);
        g.addColorStop(1, c2);
        s.fillStyle = g;
        s.beginPath();
        s.moveTo(0, -h);
        s.bezierCurveTo(w * 1.3, -h * 0.45, w * 0.9, h * 0.55, 0, h);
        s.bezierCurveTo(-w * 0.9, h * 0.55, -w * 1.3, -h * 0.45, 0, -h);
        s.fill();
        // Midrib and stem.
        s.strokeStyle = "rgba(0, 0, 0, 0.22)";
        s.lineWidth = 1.5;
        s.beginPath();
        s.moveTo(0, -h * 0.85);
        s.lineTo(0, h * 1.15);
        s.stroke();
      });
      const size = 14 + p.z * 16;
      const flip = Math.cos(p.flip);
      const sx = flip >= 0 ? Math.max(0.15, flip) : Math.min(-0.15, flip);
      const cos = Math.cos(p.rot);
      const sin = Math.sin(p.rot);
      const x = p.x + Math.sin(p.phase) * p.sway;
      ctx.setTransform(dpr * cos * sx, dpr * sin * sx, -dpr * sin, dpr * cos, dpr * x, dpr * p.y);
      ctx.globalAlpha = (0.6 + p.z * 0.35) * (0.6 + 0.4 * Math.abs(flip));
      if (sprite) {
        ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
      } else {
        ctx.fillStyle = c1;
        ctx.fillRect(-size / 4, -size / 2, size / 2, size);
      }
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  return {
    start,
    step,
    draw,
    alive: () => particles.length > 0,
    clear: () => {
      particles = [];
    },
  };
}

function lightningScene(stage: Stage, intensity: number, colorCount: number): Scene {
  let bolts: Bolt[] = [];
  let wait = 0;
  let lastCount = 1;
  const interval = () =>
    Math.max(LIGHTNING_MIN_INTERVAL, (15 / Math.max(1, intensity)) * rand(0.75, 1.3));

  const branch = (
    x: number,
    y: number,
    base: number,
    level: number,
    heading: number,
    thickness: number,
  ): { segments: Segment[]; children: Branch[] } => {
    const segments: Segment[] = [];
    const children: Branch[] = [];
    const length = 3 + pick(4);
    let a = heading;
    for (let i = 0; i < length; i++) {
      const step = base * 0.7 ** level * rand(0.6, 1.2);
      a += rand(-0.4, 0.4);
      x += Math.cos(a) * step;
      y += Math.sin(a) * step;
      segments.push({ x, y });
      if (level < 3 && i > 0 && Math.random() < 0.35 - level * 0.1) {
        const child = branch(x, y, base, level + 1, a + rand(-Math.PI / 2, Math.PI / 2), thickness);
        children.push({ startIndex: i, ...child, thickness: thickness * 0.6 ** (level + 1) });
      }
    }
    return { segments, children };
  };

  const bolt = (startX: number): Bolt => {
    const segments: Segment[] = [{ x: startX, y: 0 }];
    const branches: Branch[] = [];
    const base = rand(12, 27);
    const thickness = rand(2.2, 3.4);
    let x = startX;
    let y = 0;
    let a = Math.PI / 2;
    while (y < stage.height) {
      const step = base * rand(0.5, 1.3);
      a = Math.min((3 * Math.PI) / 4, Math.max(Math.PI / 4, a + rand(-0.3, 0.3)));
      x += Math.cos(a) * step;
      y += Math.sin(a) * step;
      segments.push({ x, y });
      if (segments.length > 2 && Math.random() < 0.35) {
        const child = branch(x, y, base, 1, a + rand(-Math.PI / 3, Math.PI / 3), thickness);
        branches.push({ startIndex: segments.length - 1, ...child, thickness: thickness * 0.6 });
      }
    }
    return {
      segments,
      branches,
      color: pick(colorCount),
      opacity: rand(0.8, 1),
      thickness,
      life: rand(0.4, 0.6),
      age: 0,
      reveal: rand(0.08, 0.12),
    };
  };

  const strike = () => {
    // One strike is one flash, however many bolts it holds; a multi-bolt
    // strike is followed by a single one for variety.
    let count = 1;
    if (lastCount === 1) {
      if (intensity > 60 && Math.random() < 0.6) count = 2 + pick(3);
      else if (intensity > 30 && Math.random() < 0.5) count = 2 + pick(2);
      else if (intensity > 15 && Math.random() < 0.3) count = 2;
    }
    lastCount = count;
    for (let i = 0; i < count; i++) {
      const b = bolt(rand(0.08, 0.92) * stage.width);
      b.age = -i * 0.025;
      bolts.push(b);
    }
  };

  const path = (
    ctx: CanvasRenderingContext2D,
    points: Segment[],
    from: Segment | null,
    n: number,
  ) => {
    ctx.beginPath();
    if (from) ctx.moveTo(from.x, from.y);
    for (let i = 0; i < n; i++) {
      const p = points[i];
      if (i === 0 && !from) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
  };

  const draw = (colors: string[]) => {
    const { ctx, width, height } = stage;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = stage.dark ? "lighter" : "source-over";
    for (const b of bolts) {
      if (b.age < 0) continue;
      const progress = Math.min(1, b.age / b.reveal);
      const t = b.age / b.life;
      let alpha = b.opacity;
      if (b.age < b.reveal) alpha *= progress;
      else if (t > 0.3) alpha *= 1 - (t - 0.3) / 0.7;
      const shown = Math.ceil(b.segments.length * progress);
      const color = colors[b.color] ?? colors[0];

      // The sky lights up faintly with the strike (a dark sky only: on a
      // light page a tint would read as the page dimming).
      if (stage.dark) {
        ctx.globalAlpha = alpha * 0.06;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
      }

      const strokeAll = (widthScale: number, a: number, style: string) => {
        ctx.strokeStyle = style;
        ctx.globalAlpha = alpha * a;
        ctx.lineWidth = b.thickness * widthScale;
        path(ctx, b.segments, null, shown);
        ctx.stroke();
        const walk = (branches: Branch[], parent: Segment[], parentShown: number) => {
          for (const br of branches) {
            if (br.startIndex >= parentShown) continue;
            const n = Math.ceil(
              br.segments.length * Math.min(1, (parentShown - br.startIndex) / 3),
            );
            ctx.lineWidth = br.thickness * widthScale;
            path(ctx, br.segments, parent[br.startIndex], n);
            ctx.stroke();
            walk(br.children, br.segments, n);
          }
        };
        walk(b.branches, b.segments, shown);
      };
      // Glow, body, then a bright core: three strokes instead of a shadow blur.
      if (stage.dark) {
        strokeAll(5, 0.12, color);
        strokeAll(1.6, 0.55, color);
        strokeAll(0.5, 0.9, "rgba(255, 255, 255, 0.9)");
      } else {
        strokeAll(3, 0.08, color);
        strokeAll(1.1, 0.95, color);
      }
    }
    ctx.globalCompositeOperation = "source-over";
  };

  return {
    start: () => {
      wait = Math.min(0.4, interval());
    },
    step: (dt, emitting) => {
      if (emitting && dt > 0) {
        wait -= dt;
        if (wait <= 0) {
          strike();
          wait = interval();
        }
      }
      bolts = bolts.filter((b) => {
        b.age += dt;
        return b.age <= b.life;
      });
    },
    draw: (colors) => draw(colors),
    alive: () => bolts.length > 0,
    clear: () => {
      bolts = [];
    },
  };
}

interface Run {
  scene: Scene;
  handle: StageHandle;
  motion: boolean;
  showStill: (on: boolean) => void;
}

const WeatherFx = ({
  ref: forwardedRef,
  type = "rain",
  speed: speedProp,
  colors: colorsProp,
  intensity = 50,
  angle = 0,
  duration,
  trigger = "mount",
  active: activeProp,
  defaultActive,
  onActiveChange,
  reducedMotion = "auto",
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: WeatherFxProps) => {
  const speed = speedFactor(speedProp);
  const colors = colorsProp ?? (type === "leaves" ? DEFAULT_LEAF_COLORS : DEFAULT_COLORS);
  const colorsKey = colors.join("|");
  const count = clampCount(intensity, 400);
  const { shouldAnimate } = useReducedMotion(reducedMotion);
  const [active, setActive] = useControllableState({
    value: activeProp,
    defaultValue: defaultActive ?? trigger === "mount",
    onChange: onActiveChange,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const startedRef = useRef(false);
  const runRef = useRef<Run | null>(null);

  useEffect(() => {
    if (forwardedRef) {
      if ("current" in forwardedRef) {
        forwardedRef.current = containerRef.current;
      } else if (typeof forwardedRef === "function") {
        forwardedRef(containerRef.current);
      }
    }
  }, [forwardedRef]);

  // One scene per look: a new type, palette, pace, amount or angle starts afresh.
  // biome-ignore lint/correctness/useExhaustiveDependencies: colorsKey stands for colors
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const motion =
      reducedMotion === false
        ? true
        : reducedMotion === true
          ? false
          : shouldAnimate && !prefersReducedMotionNow();

    let palette = colors.map((c) => canvasColor(container, c));
    let sprites = spriteCache();
    let scene: Scene | undefined;
    let stillOn = false;

    const handle = createStage(canvas, container, {
      frame: (_stage, dt) => {
        if (!scene) return false;
        if (!motion) {
          if (stillOn) scene.draw(palette, sprites);
          return false;
        }
        scene.step(dt * speed, activeRef.current);
        scene.draw(palette, sprites);
        return activeRef.current || scene.alive();
      },
      resize: () => {
        if (!motion && stillOn && scene) {
          scene.clear();
          scene.start(true);
        }
      },
    });
    if (!handle) return;
    handle.stage.dark = isDarkBackground(container);

    scene =
      type === "lightning"
        ? lightningScene(handle.stage, count, palette.length)
        : fallScene(handle.stage, type, count, palette.length, angle);

    const run: Run = {
      scene,
      handle,
      motion,
      showStill: (on) => {
        // Lightning has no still frame: a held bolt reads as a glitch.
        stillOn = on && type !== "lightning";
        scene?.clear();
        if (stillOn) scene?.start(true);
        handle.paint();
      },
    };
    runRef.current = run;

    if (activeRef.current) {
      startedRef.current = true;
      if (motion) {
        scene.start(true);
        handle.wake();
      } else {
        run.showStill(true);
      }
    } else {
      startedRef.current = false;
    }

    const unwatch = watchTheme(() => {
      palette = colors.map((c) => canvasColor(container, c));
      handle.stage.dark = isDarkBackground(container);
      sprites = spriteCache();
      if (!motion) handle.paint();
    });

    return () => {
      unwatch();
      handle.stop();
      if (runRef.current === run) runRef.current = null;
    };
  }, [type, colorsKey, speed, count, angle, reducedMotion, shouldAnimate]);

  // `active` turning on lets the weather in from above; turning off lets it fall away.
  useEffect(() => {
    const run = runRef.current;
    if (!run) return;
    if (active && !startedRef.current) {
      startedRef.current = true;
      if (run.motion) {
        run.scene.start(false);
        run.handle.wake();
      } else {
        run.showStill(true);
      }
    } else if (!active && startedRef.current) {
      startedRef.current = false;
      if (!run.motion) run.showStill(false);
    }
  }, [active]);

  useEffect(() => {
    if (!active || duration === undefined || !(duration > 0) || !Number.isFinite(duration)) return;
    const timer = setTimeout(() => setActive(false), duration);
    return () => clearTimeout(timer);
  }, [active, duration, setActive]);

  const hoverIsTap = trigger === "hover" && cannotHover();

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    onMouseEnter?.(event);
    if (trigger === "hover" && !hoverIsTap) setActive(true);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    onMouseLeave?.(event);
    if (trigger === "hover" && !hoverIsTap) setActive(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (trigger === "click" || hoverIsTap) setActive((on) => !on);
  };

  return (
    <Flex
      ref={containerRef}
      fill
      overflow="hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      {...rest}
    >
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: a canvas without tabIndex is not focusable; this one is decoration */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
      {children}
    </Flex>
  );
};

WeatherFx.displayName = "WeatherFx";

export { WeatherFx };
