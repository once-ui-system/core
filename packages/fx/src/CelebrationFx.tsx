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

type CelebrationType = "confetti" | "fireworks";

interface CelebrationFxProps
  extends Omit<React.ComponentProps<typeof Flex>, "onChange" | "defaultValue"> {
  type?: CelebrationType;
  /** A multiplier on the designed pace (`1`), or `"slow"`/`"medium"`/`"fast"` (0.5, 1, 2). */
  speed?: Speed;
  /**
   * Colours to draw with: tokens (`brand-solid-medium`, `accent-weak`), custom
   * properties (`--my-color`) or CSS colours. Read again when the theme changes.
   */
  colors?: string[];
  /** How much to draw: pieces per cannon for confetti, sparks per shell for fireworks. 0 to 200. */
  intensity?: number;
  /**
   * Milliseconds the celebration runs once it starts; then `active` turns off
   * and what is in the air settles. `0` or `Infinity` runs until `active` is
   * set to false.
   */
  duration?: number;
  /**
   * What starts the celebration by itself: `mount` (on load), `hover` (while
   * the pointer is over it; a tap on touch screens) or `click` (a burst where
   * clicked). Setting `active` starts and stops it from outside, whatever the
   * trigger.
   */
  trigger?: "mount" | "hover" | "click";
  /** Whether it is celebrating. Controlled; pair with `onActiveChange`. */
  active?: boolean;
  /** The first value of `active` when uncontrolled. Defaults to `trigger === "mount"`. */
  defaultActive?: boolean;
  /** Called when the celebration starts (hover) or ends (`duration`, pointer leaving). */
  onActiveChange?: (active: boolean) => void;
  reducedMotion?: boolean | "auto";
  children?: React.ReactNode;
}

const DEFAULT_COLORS = [
  "brand-solid-medium",
  "accent-solid-medium",
  "brand-on-background-medium",
  "accent-on-background-medium",
];

const DEFAULT_FIREWORK_COLORS = [
  "brand-solid-strong",
  "accent-solid-strong",
  "brand-solid-medium",
  "accent-solid-medium",
];

const SHAPES = 3; // ribbon, square, circle
const MAX_CONFETTI = 700;
const GRAVITY = 520; // px/s²
const AIR = 3.2; // confetti drag, 1/s; terminal fall ≈ GRAVITY / AIR

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vrot: number;
  flip: number;
  vflip: number;
  sway: number;
  vsway: number;
  color: number;
  shape: number;
}

interface Rocket {
  x: number;
  y: number;
  vy: number;
  color: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  color: number;
  size: number;
}

interface Flash {
  x: number;
  y: number;
  age: number;
  color: number;
}

interface Run {
  scene: Scene;
  handle: StageHandle;
  motion: boolean;
  /** Shows or clears the still frame (reduced motion), optionally a burst at a point. */
  showStill: (on: boolean, x?: number, y?: number) => void;
}

interface Scene {
  /** Starts a celebration: cannons for confetti, a first volley for fireworks. */
  start: () => void;
  /** A burst at a point, in CSS pixels from the top left. */
  burst: (x: number, y: number) => void;
  step: (dt: number, emitting: boolean) => void;
  draw: (colors: string[]) => void;
  /** Whether anything is still on screen. */
  alive: () => boolean;
  /** Lays out a still, fully formed frame (reduced motion). */
  still: (x?: number, y?: number) => void;
  clear: () => void;
}

function confettiScene(stage: Stage, count: number, colorCount: number): Scene {
  let pieces: Piece[] = [];
  let rainDebt = 0;

  const piece = (x: number, y: number, vx: number, vy: number): Piece => {
    const shape = pick(SHAPES);
    const size = rand(6, 11);
    return {
      x,
      y,
      vx,
      vy,
      w: shape === 0 ? size * 0.45 : size,
      h: shape === 0 ? size * 1.5 : size,
      rot: rand(0, Math.PI * 2),
      vrot: rand(-5, 5),
      flip: rand(0, Math.PI * 2),
      vflip: rand(5, 11) * (Math.random() < 0.5 ? -1 : 1),
      sway: rand(0, Math.PI * 2),
      vsway: rand(2, 4),
      color: pick(colorCount),
      shape,
    };
  };

  const add = (p: Piece) => {
    if (pieces.length < MAX_CONFETTI) pieces.push(p);
  };

  // Launch speed that carries a piece most of the way up through the drag.
  const reach = () => AIR * Math.min(stage.height, 900) * rand(0.6, 1.1);

  const start = () => {
    const { width, height } = stage;
    for (let i = 0; i < count; i++) {
      for (const side of [0, 1]) {
        // Up and inwards from each bottom corner.
        const angle = -rand(Math.PI * 0.22, Math.PI * 0.45);
        const v = reach();
        const vx = Math.cos(angle) * v * (side === 0 ? 1 : -1);
        const vy = Math.sin(angle) * v;
        add(piece(side === 0 ? rand(-8, 8) : width + rand(-8, 8), height + rand(0, 12), vx, vy));
      }
    }
  };

  const burst = (x: number, y: number) => {
    const n = Math.max(12, Math.round(count * 0.8));
    for (let i = 0; i < n; i++) {
      const angle = rand(0, Math.PI * 2);
      const v = rand(0.25, 0.6) * reach();
      add(piece(x, y, Math.cos(angle) * v, Math.sin(angle) * v - v * 0.6));
    }
  };

  const step = (dt: number, emitting: boolean) => {
    const { width, height } = stage;
    if (emitting && dt > 0) {
      // A light fall from above keeps the air full while the celebration runs.
      rainDebt += dt * count * 0.5;
      while (rainDebt >= 1) {
        rainDebt -= 1;
        add(piece(rand(0, width), rand(-24, -8), rand(-30, 30), rand(30, 90)));
      }
    }
    const drag = Math.exp(-AIR * dt);
    let alive = 0;
    for (const p of pieces) {
      p.vy += GRAVITY * dt;
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      p.flip += p.vflip * dt;
      p.sway += p.vsway * dt;
      if (p.y < height + 24) pieces[alive++] = p;
    }
    pieces.length = alive;
  };

  const draw = (colors: string[]) => {
    const { ctx, dpr } = stage;
    for (const p of pieces) {
      const cosFlip = Math.cos(p.flip);
      // Paper turning over: thin when edge-on, darker on its back.
      const sy = cosFlip >= 0 ? Math.max(0.12, cosFlip) : Math.min(-0.12, cosFlip);
      const cos = Math.cos(p.rot);
      const sin = Math.sin(p.rot);
      const x = p.x + Math.sin(p.sway) * 4 * Math.min(1, Math.abs(p.vy) / 60 + 0.2);
      ctx.setTransform(dpr * cos, dpr * sin, -dpr * sin * sy, dpr * cos * sy, dpr * x, dpr * p.y);
      ctx.globalAlpha = 0.55 + 0.45 * Math.abs(cosFlip);
      ctx.fillStyle = colors[p.color] ?? colors[0];
      if (p.shape === 2) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const still = (x?: number, y?: number) => {
    const { width, height } = stage;
    const n = x === undefined ? count * 2 : Math.max(12, Math.round(count * 0.8));
    pieces = [];
    for (let i = 0; i < n; i++) {
      const p =
        x === undefined || y === undefined
          ? piece(rand(0, width), rand(0, height), 0, 0)
          : piece(x + rand(-1, 1) * 70, y + rand(-1, 1) * 50, 0, 0);
      add(p);
    }
  };

  return {
    start,
    burst,
    step,
    draw,
    still,
    alive: () => pieces.length > 0,
    clear: () => {
      pieces = [];
    },
  };
}

function fireworksScene(stage: Stage, count: number, colorCount: number): Scene {
  let rockets: Rocket[] = [];
  let sparks: Spark[] = [];
  let flashes: Flash[] = [];
  let nextLaunch = 0;
  const sparkCount = 24 + Math.round(count * 0.6);
  const ROCKET_G = 420;
  const SPARK_G = 150;
  const SPARK_DRAG = 1.9;

  const launch = (delay = 0) => {
    const { width, height } = stage;
    const target = height * rand(0.18, 0.45);
    const y = height + 4 + delay * 600;
    rockets.push({
      x: width * rand(0.18, 0.82),
      y,
      vy: -Math.sqrt(2 * ROCKET_G * Math.max(40, y - target)),
      color: pick(colorCount),
    });
  };

  const explode = (x: number, y: number, color: number, age = 0) => {
    const size = Math.max(110, Math.min(380, Math.min(stage.width, stage.height) * 0.85));
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + rand(-0.08, 0.08);
      const v = size * rand(0.7, 1) * (Math.random() < 0.15 ? 0.55 : 1);
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        age,
        life: rand(0.9, 1.5),
        color: Math.random() < 0.2 ? pick(colorCount) : color,
        size: rand(1.6, 2.6),
      });
    }
    flashes.push({ x, y, age, color });
  };

  const stepSparks = (dt: number) => {
    const drag = Math.exp(-SPARK_DRAG * dt);
    let n = 0;
    for (const s of sparks) {
      s.age += dt;
      s.vx *= drag;
      s.vy = s.vy * drag + SPARK_G * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.age < s.life) sparks[n++] = s;
    }
    sparks.length = n;
  };

  const step = (dt: number, emitting: boolean) => {
    if (emitting && dt > 0) {
      nextLaunch -= dt;
      if (nextLaunch <= 0) {
        launch();
        nextLaunch = rand(0.45, 0.95);
      }
    }
    let r = 0;
    for (const rocket of rockets) {
      rocket.vy += ROCKET_G * dt;
      rocket.y += rocket.vy * dt;
      if (rocket.vy >= -40) explode(rocket.x, rocket.y, rocket.color);
      else rockets[r++] = rocket;
    }
    rockets.length = r;
    stepSparks(dt);
    flashes = flashes.filter((f) => {
      f.age += dt;
      return f.age < 0.18;
    });
  };

  const draw = (colors: string[]) => {
    const { ctx } = stage;
    const color = (i: number) => colors[i] ?? colors[0];
    // Light adds up on a dark page; on a light page it would wash out.
    ctx.globalCompositeOperation = stage.dark ? "lighter" : "source-over";
    ctx.lineCap = "round";

    for (const f of flashes) {
      const t = f.age / 0.18;
      const radius = 18 + t * 46;
      const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, radius);
      glow.addColorStop(0, color(f.color));
      glow.addColorStop(1, "transparent");
      ctx.globalAlpha = 0.45 * (1 - t);
      ctx.fillStyle = glow;
      ctx.fillRect(f.x - radius, f.y - radius, radius * 2, radius * 2);
    }

    for (const rocket of rockets) {
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = color(rocket.color);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rocket.x, rocket.y);
      ctx.lineTo(rocket.x, rocket.y - rocket.vy * 0.06);
      ctx.stroke();
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(rocket.x, rocket.y - rocket.vy * 0.06);
      ctx.lineTo(rocket.x, rocket.y - rocket.vy * 0.16);
      ctx.stroke();
    }

    for (const s of sparks) {
      const t = s.age / s.life;
      let alpha = (1 - t) ** 1.3;
      // Crackle as the shell burns out.
      if (t > 0.7) alpha *= 0.4 + 0.6 * Math.random();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color(s.color);
      ctx.lineWidth = s.size;
      ctx.beginPath();
      ctx.moveTo(s.x - s.vx * 0.07, s.y - s.vy * 0.07);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      // A white-hot head while the shell is young.
      if (stage.dark && t < 0.35) {
        ctx.globalAlpha = (1 - t / 0.35) * 0.8;
        ctx.fillStyle = "#fff";
        ctx.fillRect(s.x - s.size * 0.5, s.y - s.size * 0.5, s.size, s.size);
      }
    }
    ctx.globalCompositeOperation = "source-over";
  };

  const still = (x?: number, y?: number) => {
    rockets = [];
    sparks = [];
    flashes = [];
    const { width, height } = stage;
    const shells =
      x === undefined || y === undefined
        ? [
            [width * 0.3, height * 0.35],
            [width * 0.7, height * 0.3],
          ]
        : [[x, y]];
    for (const [sx, sy] of shells) {
      explode(sx, sy, pick(colorCount));
    }
    // Lay the sparks out where they are a third of the way through, with no motion after.
    for (let i = 0; i < 20; i++) stepSparks(0.02);
    flashes = [];
  };

  return {
    start: () => {
      launch();
      launch(0.25);
      nextLaunch = rand(0.6, 0.9);
    },
    burst: (x, y) => explode(x, y, pick(colorCount)),
    step,
    draw,
    still,
    alive: () => rockets.length + sparks.length + flashes.length > 0,
    clear: () => {
      rockets = [];
      sparks = [];
      flashes = [];
    },
  };
}

const CelebrationFx = ({
  ref: forwardedRef,
  type = "confetti",
  speed: speedProp,
  colors: colorsProp,
  intensity = 50,
  duration = 3000,
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
}: CelebrationFxProps) => {
  const speed = speedFactor(speedProp);
  const colors = colorsProp ?? (type === "fireworks" ? DEFAULT_FIREWORK_COLORS : DEFAULT_COLORS);
  const count = clampCount(intensity, 200);
  const colorsKey = colors.join("|");
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

  // One scene per look: a new type, palette, pace or amount starts afresh.
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
    let scene: Scene | undefined;
    let stillOn = false;

    const handle = createStage(canvas, container, {
      frame: (_stage, dt) => {
        if (!scene) return false;
        if (!motion) {
          if (stillOn) scene.draw(palette);
          return false;
        }
        scene.step(dt * speed, activeRef.current);
        scene.draw(palette);
        return activeRef.current || scene.alive();
      },
    });
    if (!handle) return;
    handle.stage.dark = isDarkBackground(container);

    scene =
      type === "fireworks"
        ? fireworksScene(handle.stage, count, palette.length)
        : confettiScene(handle.stage, count, palette.length);
    const run: Run = {
      scene,
      handle,
      motion,
      showStill: (on: boolean, x?: number, y?: number) => {
        stillOn = on;
        if (on) scene?.still(x, y);
        else scene?.clear();
        handle.paint();
      },
    };
    runRef.current = run;

    if (activeRef.current) {
      startedRef.current = true;
      if (motion) {
        scene.start();
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
      if (!motion) handle.paint();
    });

    return () => {
      unwatch();
      handle.stop();
      if (runRef.current === run) runRef.current = null;
    };
  }, [type, colorsKey, speed, count, reducedMotion, shouldAnimate]);

  // `active` turning on starts a celebration; turning off lets it settle.
  useEffect(() => {
    const run = runRef.current;
    if (!run) return;
    if (active && !startedRef.current) {
      startedRef.current = true;
      if (run.motion) {
        run.scene.start();
        run.handle.wake();
      } else {
        run.showStill(true);
      }
    } else if (!active && startedRef.current) {
      startedRef.current = false;
      if (!run.motion) run.showStill(false);
    }
  }, [active]);

  // `duration` ends it.
  useEffect(() => {
    if (!active || !(duration > 0) || !Number.isFinite(duration)) return;
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
    if (hoverIsTap) {
      setActive(true);
      return;
    }
    if (trigger !== "click" || !containerRef.current) return;
    const run = runRef.current;
    if (!run) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (run.motion) {
      run.scene.burst(x, y);
      run.handle.wake();
    } else {
      run.showStill(true, x, y);
      setTimeout(() => {
        if (runRef.current === run && !activeRef.current) run.showStill(false);
      }, 1200);
    }
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

CelebrationFx.displayName = "CelebrationFx";

export { CelebrationFx };
