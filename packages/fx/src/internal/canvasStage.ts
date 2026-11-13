import { cssColor } from "./cssColor.js";

/**
 * The frame loop CelebrationFx and WeatherFx share: a 2D canvas sized to its
 * container at the device's pixel ratio (capped at 2), redrawn with the time
 * since the last frame in seconds, so motion runs at the same pace on a 60 Hz
 * and a 120 Hz screen.
 *
 * The loop sleeps when there is nothing to draw (`frame` returns false), while
 * the container is off screen, and after `stop()`. `wake()` starts it again;
 * call it from events and effects, never from inside `frame`.
 */
export interface Stage {
  readonly ctx: CanvasRenderingContext2D;
  /** CSS pixels. */
  width: number;
  height: number;
  /** Device pixels per CSS pixel, 1 to 2. */
  dpr: number;
  /** Whether the page behind is dark: glows add light there and stay flat on a light page. */
  dark: boolean;
}

export interface StageOptions {
  /** Draws one frame; `dt` is in seconds, at most 1/20 s. Returns whether to keep running. */
  frame: (stage: Stage, dt: number) => boolean;
  /** Runs after the canvas changes size, before the next frame. */
  resize?: (stage: Stage) => void;
}

export interface StageHandle {
  readonly stage: Stage;
  wake: () => void;
  /** Draws one frame now without starting the loop (the still frame under reduced motion). */
  paint: () => void;
  stop: () => void;
}

const MAX_DT = 1 / 20;

export function createStage(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  { frame, resize }: StageOptions,
): StageHandle | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const stage: Stage = { ctx, width: 0, height: 0, dpr: 1, dark: true };
  let raf: number | undefined;
  let last: number | undefined;
  let visible = true;
  let stopped = false;

  const measure = () => {
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    if (rect.width === stage.width && rect.height === stage.height && dpr === stage.dpr) return;
    stage.width = rect.width;
    stage.height = rect.height;
    stage.dpr = dpr;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    resize?.(stage);
  };

  const tick = (now: number) => {
    raf = undefined;
    if (stopped || !visible) return;
    const dt = last === undefined ? 1 / 60 : Math.min(MAX_DT, Math.max(0, (now - last) / 1000));
    last = now;
    ctx.setTransform(stage.dpr, 0, 0, stage.dpr, 0, 0);
    ctx.clearRect(0, 0, stage.width, stage.height);
    const keep = frame(stage, dt);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    // Asleep, the canvas keeps what this frame drew: nothing once everything
    // has settled, the still frame under reduced motion.
    if (keep) raf = requestAnimationFrame(tick);
    else last = undefined;
  };

  const wake = () => {
    if (stopped || !visible || raf !== undefined) return;
    last = undefined;
    raf = requestAnimationFrame(tick);
  };

  const paint = () => {
    if (stopped) return;
    ctx.setTransform(stage.dpr, 0, 0, stage.dpr, 0, 0);
    ctx.clearRect(0, 0, stage.width, stage.height);
    frame(stage, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  };

  measure();

  // A new size clears the canvas; with the loop asleep (a still frame), draw it again.
  const remeasure = () => {
    const before = canvas.width * 10000 + canvas.height;
    measure();
    if (raf === undefined && !stopped && canvas.width * 10000 + canvas.height !== before) paint();
  };

  let resizeObserver: ResizeObserver | undefined;
  const onWindowResize = () => remeasure();
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => remeasure());
    resizeObserver.observe(container);
  } else {
    window.addEventListener("resize", onWindowResize);
  }

  // Off screen, the loop sleeps. Until the observer says otherwise the effect
  // counts as visible, so a browser (or test) that never reports still draws.
  let intersection: IntersectionObserver | undefined;
  if (typeof IntersectionObserver !== "undefined") {
    intersection = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) return;
      visible = entry.isIntersecting;
      if (visible) wake();
      else if (raf !== undefined) {
        cancelAnimationFrame(raf);
        raf = undefined;
      }
    });
    intersection.observe(container);
  }

  const stop = () => {
    stopped = true;
    if (raf !== undefined) cancelAnimationFrame(raf);
    raf = undefined;
    resizeObserver?.disconnect();
    intersection?.disconnect();
    window.removeEventListener("resize", onWindowResize);
  };

  return { stage, wake, paint, stop };
}

/**
 * A colour prop as a value the canvas can paint. Read through the same
 * resolver as every other colour prop (`brand-weak`, `--x`, `#fff`, `oklch(…)`
 * all work), then a `var(--token)` is looked up on `element`, because a canvas
 * cannot paint `var()`.
 */
export function canvasColor(element: Element, value: string): string {
  const css = cssColor(value);
  const token = /^var\((--[\w-]+)\)$/.exec(css);
  if (!token) return css;
  const resolved = getComputedStyle(element).getPropertyValue(token[1]).trim();
  return resolved || "currentColor";
}

/**
 * Whether the page around `element` is dark, read from `--page-background`
 * through a 1×1 canvas (any CSS colour syntax works). Unknown reads as dark.
 */
export function isDarkBackground(element: Element): boolean {
  const color = canvasColor(element, "page-background");
  if (color === "currentColor") return true;
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  const ctx = probe.getContext("2d", { willReadFrequently: true });
  if (!ctx || typeof ctx.getImageData !== "function") return true;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1)?.data;
  if (!data || data[3] === 0) return true;
  const luminance = (0.2126 * data[0] + 0.7152 * data[1] + 0.0722 * data[2]) / 255;
  return luminance < 0.5;
}

/**
 * Calls `onChange` when the theme around the effect may have changed: a
 * `data-*`, `class` or `style` change on the root element, or the system
 * colour scheme. The effects read their colours again so a theme switch
 * repaints them.
 */
export function watchTheme(onChange: () => void): () => void {
  const root = document.documentElement;
  const observer =
    typeof MutationObserver !== "undefined" ? new MutationObserver(() => onChange()) : undefined;
  observer?.observe(root, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
  const scheme = window.matchMedia?.("(prefers-color-scheme: dark)");
  scheme?.addEventListener?.("change", onChange);
  return () => {
    observer?.disconnect();
    scheme?.removeEventListener?.("change", onChange);
  };
}

/** A random number in [min, max). */
export const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** A random whole number in [0, length). */
export const pick = (length: number) => Math.floor(Math.random() * length);

/**
 * `intensity` as a whole number in [0, max]; NaN and negatives are 0.
 */
export const clampCount = (value: number, max: number) =>
  Number.isFinite(value) ? Math.round(Math.min(max, Math.max(0, value))) : 0;
