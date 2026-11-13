"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { useAdapters } from "../contexts/AdapterProvider.js";
import { mergeLabels } from "../internal/labels.js";
import { prefersReducedMotionNow } from "../internal/reducedMotion.js";
import { useControllableState } from "../internal/useControllableState.js";
import { useOverlay } from "../internal/useOverlay.js";
import { Button } from "./Button.js";
import { Column } from "./Column.js";
import { FocusTrap } from "./FocusTrap.js";
import { IconButton } from "./IconButton.js";
import styles from "./PhotoViewer.module.scss";
import { Row } from "./Row.js";
import { ScrollLock } from "./ScrollLock.js";
import { Spinner } from "./Spinner.js";
import { Text } from "./Text.js";
import { VisuallyHidden } from "./VisuallyHidden.js";

/** One photo in a `PhotoViewer`. */
export interface PhotoViewerItem {
  src: string;
  alt: string;
  /** Shown above the counter. */
  title?: string;
  /** Shown after the counter ("3 / 12 · 2024"). */
  caption?: string;
  /** The photo's proportions, when known. Without them the viewer measures it as it loads. */
  width?: number;
  height?: number;
}

/** The viewer's own words. Omitted fields keep the English default. */
export interface PhotoViewerLabels {
  /** The dialog's accessible name. Defaults to `"Photo viewer"`. */
  dialog?: string;
  /** Defaults to `"Close photo viewer"`. */
  close?: string;
  /** Defaults to `"Previous photo"`. */
  previous?: string;
  /** Defaults to `"Next photo"`. */
  next?: string;
  /** Announced on every photo. Defaults to `(current, total) => "Photo 3 of 12"`. */
  counter?: (current: number, total: number) => string;
  /** Defaults to `"Couldn't load this photo"`. */
  error?: string;
  /** Defaults to `"Try again"`. */
  retry?: string;
}

export interface PhotoViewerProps {
  /** The photos, in order. */
  items: PhotoViewerItem[];
  /** The photo on screen, controlled. Leave it out to let the viewer keep its own. */
  index?: number;
  /** The first photo of an uncontrolled viewer. Defaults to 0. */
  defaultIndex?: number;
  /** Called with the photo the viewer moves to. */
  onIndexChange?: (index: number) => void;
  /**
   * Called once the closing animation has finished, with the photo it closed
   * on. Unmount the viewer here: it renders while it is mounted.
   */
  onClose: (index: number) => void;
  /**
   * The element photo `index` opens out of and closes back into, such as its
   * grid tile. Focus returns to it on close. Without it the viewer fades in
   * and out, and focus returns to whatever had it before.
   */
  getOrigin?: (index: number) => HTMLElement | null;
  /**
   * On close, scroll the page so the origin of the photo on screen is in view
   * and land on it (a gallery). Off by default: the page stays put and an
   * origin that is off screen gets a fade instead (photos in an article).
   */
  scrollToOrigin?: boolean;
  /**
   * Opt in to deep links: the open photo is kept in this search parameter
   * (`?photo=<file name>`), and Back closes the viewer. Read it on load with
   * `photoViewerIndexFromUrl(items, "photo")` to open on a shared photo.
   */
  deepLink?: string;
  /** Passed to the Image adapter: skip the framework's image optimization. */
  unoptimized?: boolean;
  /** The viewer's own words, for a translated interface. */
  labels?: PhotoViewerLabels;
}

const DEFAULT_LABELS: Required<PhotoViewerLabels> = {
  dialog: "Photo viewer",
  close: "Close photo viewer",
  previous: "Previous photo",
  next: "Next photo",
  counter: (current, total) => `Photo ${current} of ${total}`,
  error: "Couldn't load this photo",
  retry: "Try again",
};

/** The value a photo has in a deep link: its file name, which stays put as photos are added or reordered. */
export const photoViewerSlug = (src: string) =>
  (src.split(/[?#]/)[0].split("/").pop() ?? "").replace(/\.[^.]+$/, "");

/**
 * The photo a deep link points at: its index in `items`, or -1 when the
 * page's URL has no such parameter or names no photo in the list.
 */
export function photoViewerIndexFromUrl(items: PhotoViewerItem[], param = "photo"): number {
  if (typeof window === "undefined") return -1;
  const slug = new URL(window.location.href).searchParams.get(param);
  if (!slug) return -1;
  return items.findIndex((item) => photoViewerSlug(item.src) === slug);
}

const HISTORY_KEY = "__onceUIPhotoViewer";
const GAP = 24; // px between slides while swiping
const MAX_ZOOM = 4;
const DOUBLE_TAP_MS = 280;
const FALLBACK_RATIO = { width: 4, height: 3 };

type Rect = { left: number; top: number; width: number; height: number };
type Box = Rect & { vw: number; vh: number };
type Mode = "idle" | "pending" | "swipe" | "dismiss" | "pan" | "pinch";
type Tween = { cancel: () => void; finish: () => void };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeOutQuart = (t: number) => 1 - (1 - t) ** 4;
// Resistance past an edge: follows the finger at first, then stiffens.
const rubber = (d: number, size: number) =>
  (1 - 1 / ((Math.abs(d) * 0.55) / size + 1)) * size * Math.sign(d);
const rubberClamp = (v: number, [min, max]: [number, number], size: number) =>
  v < min ? min + rubber(v - min, size) : v > max ? max + rubber(v - max, size) : v;

// A small rAF tween. Every motion here writes transforms straight to the DOM, never through state.
function tween(
  duration: number,
  ease: (t: number) => number,
  update: (p: number) => void,
  done?: () => void,
): Tween {
  let raf = 0;
  let start = 0;
  let over = false;
  const end = () => {
    if (over) return;
    over = true;
    cancelAnimationFrame(raf);
    update(1);
    done?.();
  };
  if (duration <= 0) {
    end();
    return { cancel: () => {}, finish: () => {} };
  }
  const step = (now: number) => {
    if (!start) start = now;
    const t = (now - start) / duration;
    if (t >= 1) return end();
    update(ease(t));
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return {
    cancel: () => {
      over = true;
      cancelAnimationFrame(raf);
    },
    finish: end,
  };
}

function fitInto(width: number, height: number, box: Rect): Rect {
  const scale = Math.min(box.width / width, box.height / height);
  const w = width * scale;
  const h = height * scale;
  return {
    width: w,
    height: h,
    left: box.left + (box.width - w) / 2,
    top: box.top + (box.height - h) / 2,
  };
}

// Twice the on-screen width (capped at the viewport) leaves headroom for zooming in.
const sizesFor = (rect: Rect, box: Box) =>
  `${Math.max(1, Math.ceil(Math.min(box.vw, rect.width * 2)))}px`;

const radiusOf = (el: Element | null) =>
  el ? Number.parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0 : 0;
// The origin is either the rounded element itself or a wrapper around it.
const originRadius = (el: Element) => Math.max(radiusOf(el), radiusOf(el.firstElementChild));

// Show or hide an origin at once. Media has `transition: all`, which would otherwise animate
// `visibility` too: the tile would stay visible while the photo grows out of it, and still be
// hidden (so it could not take focus) right after the viewer closes onto it.
function setOriginHidden(el: HTMLElement | null, hidden: boolean) {
  if (!el) return;
  const transition = el.style.transition;
  el.style.transition = "none";
  el.style.visibility = hidden ? "hidden" : "";
  getComputedStyle(el).visibility; // Apply it now, before the transition comes back.
  el.style.transition = transition;
}

interface PhotoProps {
  item: PhotoViewerItem;
  sizes: string;
  current: boolean;
  unoptimized?: boolean;
  placeholder?: string;
  errorLabel: string;
  retryLabel: string;
  onDimensions: (width: number, height: number) => void;
}

// One photo: the origin's image (already cached) underneath, the sharp one fading in on top.
function Photo({
  item,
  sizes,
  current,
  unoptimized,
  placeholder,
  errorLabel,
  retryLabel,
  onDimensions,
}: PhotoProps) {
  const { Image } = useAdapters();
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [slow, setSlow] = useState(false);

  // A spinner only when loading is actually slow, so fast loads don't flash one.
  // biome-ignore lint/correctness/useExhaustiveDependencies: restarts the timer on every retry
  useEffect(() => {
    if (status !== "loading") return;
    setSlow(false);
    const timer = setTimeout(() => setSlow(true), 450);
    return () => clearTimeout(timer);
  }, [status, attempt]);

  if (status === "error") {
    return (
      <Column position="absolute" fill center gap="12" padding="16" pointerEvents="auto">
        <Text textVariant="body-default-s" onBackground="neutral-weak" align="center">
          {errorLabel}
        </Text>
        <Button
          size="s"
          variant="secondary"
          onClick={() => {
            setAttempt((n) => n + 1);
            setStatus("loading");
          }}
        >
          {retryLabel}
        </Button>
      </Column>
    );
  }

  return (
    <>
      {placeholder && status !== "loaded" && (
        // biome-ignore lint/performance/noImgElement: the origin's own, already-loaded file
        <img
          src={placeholder}
          alt=""
          aria-hidden
          className={styles.placeholder}
          draggable={false}
        />
      )}
      <Image
        key={attempt}
        src={item.src}
        alt={item.alt}
        fill
        sizes={sizes}
        unoptimized={unoptimized}
        // The open photo is often the page's main image (deep links); neighbours load right behind it.
        priority={current}
        loading="eager"
        draggable={false}
        className={styles.photo}
        data-loaded={status === "loaded"}
        onLoad={(e) => {
          setStatus("loaded");
          onDimensions(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight);
        }}
        onError={() => setStatus("error")}
      />
      {status === "loading" && slow && (
        <Row position="absolute" fill center pointerEvents="none">
          <Spinner size="s" />
        </Row>
      )}
    </>
  );
}

/**
 * A full-screen photo viewer for a set of photos: it opens out of the photo's
 * origin (a grid tile, an article image) and closes back into it. Swipe or use
 * the arrows to move between photos, with resistance at either end; swipe down
 * to close; pinch, double-tap or double-click to zoom and drag to pan. Escape
 * closes it and focus goes back to the origin. With `deepLink`, the open photo
 * is in the URL and Back closes it. Reduced motion swaps every animation for
 * a short fade.
 *
 * Render it while it is open and unmount it in `onClose`. The chrome is Once
 * UI; the gesture layers are plain elements, because their transforms are
 * written on every animation frame.
 */
export function PhotoViewer({
  items,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  onClose,
  getOrigin,
  scrollToOrigin = false,
  deepLink,
  unoptimized,
  labels,
}: PhotoViewerProps) {
  const text = mergeLabels(DEFAULT_LABELS, labels);
  const statusId = useId();
  const origin = useCallback((i: number) => getOrigin?.(i) ?? null, [getOrigin]);

  const [index, setIndexState] = useControllableState({
    value: indexProp,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  });
  const [box, setBox] = useState<Box | null>(null);
  const [measured, setMeasured] = useState<Record<string, { width: number; height: number }>>({});
  const [chromeHidden, setChromeHidden] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Everything the gesture code reads lives in refs, so the handlers are bound once.
  const indexRef = useRef(index);
  const startIndexRef = useRef(index);
  const boxRef = useRef<Box | null>(null);
  const fittedRef = useRef<Rect | null>(null);
  const phaseRef = useRef<"opening" | "open" | "closing">("opening");
  const reducedRef = useRef(false);
  const pushedRef = useRef(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const closeScrollRef = useRef<number | null>(null);
  const hiddenOriginRef = useRef<HTMLElement | null>(null);
  const frameRadiusRef = useRef(0);
  const tweens = useRef<{ track?: Tween; zoom?: Tween; frame?: Tween; open?: Tween }>({});
  // Direction of the slide currently animating (0 while the track only springs back).
  const navDirRef = useRef(0);
  const motion = useRef({
    trackX: 0,
    frame: { x: 0, y: 0, sx: 1, sy: 1, radius: null as number | null },
    zoom: { s: 1, x: 0, y: 0 },
    backdrop: 1,
  });
  // Read before any effect rewrites the URL: the parameter already there means a deep link.
  const openedFromUrl = useRef<boolean | null>(null);
  if (openedFromUrl.current === null) {
    openedFromUrl.current =
      typeof window !== "undefined" &&
      !!deepLink &&
      new URL(window.location.href).searchParams.has(deepLink);
  }

  const total = items.length;
  const item = items[index];

  const dimsOf = useCallback(
    (photo: PhotoViewerItem) =>
      photo.width && photo.height
        ? { width: photo.width, height: photo.height }
        : (measured[photo.src] ?? FALLBACK_RATIO),
    [measured],
  );
  const fitted = box && item ? fitInto(dimsOf(item).width, dimsOf(item).height, box) : null;
  fittedRef.current = fitted;
  boxRef.current = box;

  // Write the current motion state to the DOM.
  const paint = useCallback(() => {
    const { trackX, frame, zoom, backdrop } = motion.current;
    if (trackRef.current) trackRef.current.style.transform = `translate3d(${trackX}px,0,0)`;
    if (zoomRef.current)
      zoomRef.current.style.transform = `translate3d(${zoom.x}px,${zoom.y}px,0) scale(${zoom.s})`;
    if (frameRef.current) {
      const f = frameRef.current.style;
      f.transform = `translate3d(${frame.x}px,${frame.y}px,0) scale(${frame.sx},${frame.sy})`;
      // Radius is in screen pixels; divided by the scale so corners stay round while it stretches.
      f.borderRadius =
        frame.radius === null ? "" : `${frame.radius / frame.sx}px / ${frame.radius / frame.sy}px`;
    }
    if (backdropRef.current) backdropRef.current.style.opacity = String(backdrop);
    stageRef.current?.toggleAttribute("data-zoomed", zoom.s > 1.01);
  }, []);

  const frameRaf = useRef(0);
  const schedule = useCallback(() => {
    if (frameRaf.current) return;
    frameRaf.current = requestAnimationFrame(() => {
      frameRaf.current = 0;
      paint();
    });
  }, [paint]);

  // Hide the origin of the photo on screen, so it looks like the same picture lifted out.
  const hideOrigin = useCallback(
    (i: number | null) => {
      setOriginHidden(hiddenOriginRef.current, false);
      hiddenOriginRef.current = i === null ? null : origin(i);
      setOriginHidden(hiddenOriginRef.current, true);
    },
    [origin],
  );

  // Close: shrink back into the origin, scrolling it into view first when asked to.
  const close = useCallback(
    (fromHistory = false) => {
      if (phaseRef.current === "closing") return;
      tweens.current.open?.finish();
      tweens.current.track?.finish();
      tweens.current.zoom?.cancel();
      tweens.current.frame?.cancel();
      phaseRef.current = "closing";
      const stage = stageRef.current;
      if (stage) stage.dataset.phase = "closing";

      if (deepLink && !fromHistory) {
        if (pushedRef.current) {
          pushedRef.current = false;
          window.history.back();
        } else {
          // Arrived by deep link: keep the page's history entry, just drop the parameter.
          const url = new URL(window.location.href);
          url.searchParams.delete(deepLink);
          window.history.replaceState(window.history.state, "", url);
        }
      }

      const i = indexRef.current;
      const m = motion.current;
      const f = fittedRef.current;
      const target = origin(i);
      let to = target?.getBoundingClientRect();
      const offscreen = (r?: DOMRect) => !r || r.bottom < 0 || r.top > window.innerHeight;
      if (target && offscreen(to)) {
        if (scrollToOrigin) {
          target.scrollIntoView({ block: "center", behavior: "instant" });
          to = target.getBoundingClientRect();
        } else {
          to = undefined; // Leave the page where it is and fade out.
        }
      }
      closeScrollRef.current = window.scrollY;
      // Without scrolling, an off-screen origin can't usefully take focus: return it to the first.
      const focusOrigin = !to && !scrollToOrigin ? origin(startIndexRef.current) : target;
      returnFocusRef.current =
        focusOrigin?.closest<HTMLElement>("[tabindex], a, button") ?? focusOrigin ?? null;
      const finish = () => {
        hideOrigin(null);
        onClose(i);
      };

      const start = { ...m.frame, radius: m.frame.radius ?? frameRadiusRef.current };
      const zoom = { ...m.zoom };
      const backdrop = m.backdrop;

      if (target && to && to.width > 0 && f && !reducedRef.current) {
        hideOrigin(i);
        const targetRadius = originRadius(target);
        const end = {
          x: to.left + to.width / 2 - (f.left + f.width / 2),
          y: to.top + to.height / 2 - (f.top + f.height / 2),
          sx: to.width / f.width,
          sy: to.height / f.height,
        };
        tweens.current.frame = tween(
          340,
          easeOutQuart,
          (p) => {
            m.frame = {
              x: start.x + (end.x - start.x) * p,
              y: start.y + (end.y - start.y) * p,
              sx: start.sx + (end.sx - start.sx) * p,
              sy: start.sy + (end.sy - start.sy) * p,
              radius: start.radius + (targetRadius - start.radius) * p,
            };
            m.zoom = { s: zoom.s + (1 - zoom.s) * p, x: zoom.x * (1 - p), y: zoom.y * (1 - p) };
            m.backdrop = backdrop * (1 - p);
            paint();
          },
          finish,
        );
      } else {
        // No origin to land on (or reduced motion): fade out where it is.
        const reduced = reducedRef.current;
        tweens.current.frame = tween(
          reduced ? 140 : 220,
          easeOut,
          (p) => {
            const s = reduced ? 1 : 1 - 0.06 * p;
            m.frame = { ...start, sx: start.sx * s, sy: start.sy * s };
            m.backdrop = backdrop * (1 - p);
            if (frameRef.current) frameRef.current.style.opacity = String(1 - p);
            paint();
          },
          finish,
        );
      }
    },
    [deepLink, hideOrigin, onClose, origin, paint, scrollToOrigin],
  );

  // Inert page, Escape (innermost overlay only) and focus handed back on unmount: the overlay
  // core Dialog and Drawer share.
  const { mounted } = useOverlay({
    open: true,
    onClose: () => close(),
    overlayRef,
    returnFocusRef,
  });

  // Measure the area photos fit into (CSS owns the insets, including safe areas).
  // biome-ignore lint/correctness/useExhaustiveDependencies: the fit box exists once mounted
  useLayoutEffect(() => {
    const el = fitRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setBox({
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
        vw: window.innerWidth,
        vh: window.innerHeight,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [mounted]);

  // Resize or rotation while open: drop any zoom or half-finished drag.
  const lastBox = useRef<Box | null>(null);
  useLayoutEffect(() => {
    if (!box) return;
    if (lastBox.current && (lastBox.current.vw !== box.vw || lastBox.current.vh !== box.vh)) {
      tweens.current.track?.finish();
      tweens.current.zoom?.cancel();
      motion.current.zoom = { s: 1, x: 0, y: 0 };
      motion.current.trackX = 0;
      if (phaseRef.current === "open")
        motion.current.frame = { x: 0, y: 0, sx: 1, sy: 1, radius: null };
      paint();
    }
    lastBox.current = box;
  }, [box, paint]);

  // Open: grow out of the origin, or fade in when it isn't on screen.
  const opened = useRef(false);
  useLayoutEffect(() => {
    if (!box || !fittedRef.current || opened.current) return;
    opened.current = true;
    reducedRef.current = prefersReducedMotionNow();
    frameRadiusRef.current = radiusOf(frameRef.current);
    const stage = stageRef.current;
    if (!stage) return;
    const from = origin(indexRef.current);
    const rect = from?.getBoundingClientRect();
    const visible = rect && rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
    const f = fittedRef.current;
    const m = motion.current;
    stage.dataset.phase = "opening";

    const done = () => {
      phaseRef.current = "open";
      stage.dataset.phase = "open";
      m.frame = { x: 0, y: 0, sx: 1, sy: 1, radius: null };
      paint();
    };

    if (from && rect && visible && !reducedRef.current) {
      hideOrigin(indexRef.current);
      const fromRadius = originRadius(from);
      const start = {
        x: rect.left + rect.width / 2 - (f.left + f.width / 2),
        y: rect.top + rect.height / 2 - (f.top + f.height / 2),
        sx: rect.width / f.width,
        sy: rect.height / f.height,
      };
      const apply = (p: number) => {
        m.frame = {
          x: start.x * (1 - p),
          y: start.y * (1 - p),
          sx: start.sx + (1 - start.sx) * p,
          sy: start.sy + (1 - start.sy) * p,
          radius: fromRadius + (frameRadiusRef.current - fromRadius) * p,
        };
        m.backdrop = p;
        paint();
      };
      apply(0);
      tweens.current.open = tween(420, easeOutQuart, apply, done);
    } else {
      const reduced = reducedRef.current;
      const apply = (p: number) => {
        const s = reduced ? 1 : 0.94 + 0.06 * p;
        m.frame = { x: 0, y: 0, sx: s, sy: s, radius: null };
        m.backdrop = p;
        if (frameRef.current) frameRef.current.style.opacity = String(p);
        paint();
      };
      apply(0);
      tweens.current.open = tween(reduced ? 160 : 260, easeOut, apply, done);
    }
  }, [box, hideOrigin, origin, paint]);

  // Swap the current photo; the track already slid over, so this just re-centres it.
  const commit = useCallback(
    (next: number) => {
      indexRef.current = next;
      motion.current.trackX = 0;
      motion.current.zoom = { s: 1, x: 0, y: 0 };
      flushSync(() => setIndexState(next));
      paint();
    },
    [paint, setIndexState],
  );

  // A parent that moves `index` itself: follow it without a slide.
  useEffect(() => {
    if (index === indexRef.current || phaseRef.current === "closing") return;
    tweens.current.track?.cancel();
    tweens.current.track = undefined;
    navDirRef.current = 0;
    indexRef.current = index;
    motion.current.trackX = 0;
    motion.current.zoom = { s: 1, x: 0, y: 0 };
    paint();
  }, [index, paint]);

  const go = useCallback(
    (dir: 1 | -1, velocity = 0) => {
      if (phaseRef.current === "closing") return;
      tweens.current.open?.finish();
      // A second press mid-slide finishes the first one at once, so presses never queue or skip.
      tweens.current.track?.finish();
      const m = motion.current;
      const target = indexRef.current + dir;
      const vw = boxRef.current?.vw ?? window.innerWidth;
      if (target < 0 || target >= itemsRef.current.length) {
        // A nudge at either end, so the press visibly registered.
        if (reducedRef.current) return;
        const from = m.trackX;
        tweens.current.track = tween(
          280,
          (t) => t,
          (p) => {
            m.trackX = from * (1 - p) - dir * 28 * Math.sin(p * Math.PI);
            paint();
          },
          () => {
            tweens.current.track = undefined;
          },
        );
        return;
      }
      if (m.zoom.s > 1.01) {
        tweens.current.zoom?.cancel();
        m.zoom = { s: 1, x: 0, y: 0 };
      }
      const from = m.trackX;
      const end = -dir * (vw + GAP);
      const distance = Math.abs(end - from);
      const duration = reducedRef.current
        ? 0
        : clamp(distance / Math.max(Math.abs(velocity), 2.2), 150, 340);
      navDirRef.current = dir;
      tweens.current.track = tween(
        duration,
        easeOut,
        (p) => {
          m.trackX = from + (end - from) * p;
          paint();
        },
        () => {
          tweens.current.track = undefined;
          navDirRef.current = 0;
          commit(target);
        },
      );
    },
    [commit, paint],
  );

  // Deep link: a history entry (so Back closes the viewer) holding the open photo.
  useEffect(() => {
    if (!deepLink) return;
    // Scroll restoration is stored per history entry. Set it before pushing, so the page's own
    // entry doesn't scroll back to its old position on Back and undo the scroll to the origin.
    const restoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const state = window.history.state;
    if (state?.[HISTORY_KEY]) {
      pushedRef.current = true; // Strict Mode re-run or Forward: the entry already exists.
    } else if (openedFromUrl.current) {
      pushedRef.current = false; // Opened from a deep link.
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set(deepLink, photoViewerSlug(itemsRef.current[indexRef.current].src));
      window.history.pushState({ ...state, [HISTORY_KEY]: true }, "", url);
      pushedRef.current = true;
    }
    const onPop = () => {
      if (phaseRef.current === "closing") {
        // Keep the origin we're closing onto in view.
        if (closeScrollRef.current !== null)
          window.scrollTo({ top: closeScrollRef.current, behavior: "instant" });
        return;
      }
      pushedRef.current = false;
      close(true);
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.history.scrollRestoration = restoration;
    };
  }, [close, deepLink]);

  // Keep the URL in step and the origin under the photo hidden. Keyed on the index alone:
  // other re-renders must not touch the URL.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on photo changes only
  useEffect(() => {
    if (phaseRef.current === "closing") return;
    if (deepLink && itemsRef.current[index]) {
      const url = new URL(window.location.href);
      url.searchParams.set(deepLink, photoViewerSlug(itemsRef.current[index].src));
      if (url.href !== window.location.href)
        window.history.replaceState(window.history.state, "", url);
    }
    if (phaseRef.current === "open" && hiddenOriginRef.current) hideOrigin(index);
  }, [index]);

  // A disabled button drops focus to <body>; hand it to the other arrow instead.
  useEffect(() => {
    const active = document.activeElement;
    if (active === prevButtonRef.current && index === 0) nextButtonRef.current?.focus();
    if (active === nextButtonRef.current && index === total - 1) prevButtonRef.current?.focus();
  }, [index, total]);

  // Arrow keys. Escape is the overlay core's.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (phaseRef.current === "closing") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go]);

  // Pointer gestures: swipe, swipe down to close, double-tap and pinch zoom, pan while zoomed.
  // biome-ignore lint/correctness/useExhaustiveDependencies: binds once the stage is mounted
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const m = motion.current;
    const g = {
      mode: "idle" as Mode,
      type: "touch",
      pointers: new Map<number, { x: number; y: number }>(),
      startX: 0,
      startY: 0,
      trackBase: 0,
      zoomBase: { s: 1, x: 0, y: 0 },
      pinch: { dist: 1, s: 1, lx: 0, ly: 0 },
      samples: [] as { x: number; y: number; t: number }[],
      lastTap: { t: 0, x: 0, y: 0 },
      tapTimer: 0 as ReturnType<typeof setTimeout> | 0,
      wheelAcc: 0,
      wheelLocked: false,
      wheelTimer: 0 as ReturnType<typeof setTimeout> | 0,
    };
    // Both are set by the time any gesture can start (the stage only takes input once measured).
    const fitRect = () => fittedRef.current as Rect;
    const viewport = () => boxRef.current as Box;

    const center = () => {
      const f = fitRect();
      return { cx: f.left + f.width / 2, cy: f.top + f.height / 2 };
    };
    // Allowed pan range at scale s: once the photo is bigger than the screen, its edges can't
    // come inside it.
    const bounds = (s: number) => {
      const f = fitRect();
      const { cx, cy } = center();
      const { vw, vh } = viewport();
      const hw = (f.width * s) / 2;
      const hh = (f.height * s) / 2;
      return {
        x: (hw * 2 > vw ? [vw - cx - hw, hw - cx] : [0, 0]) as [number, number],
        y: (hh * 2 > vh ? [vh - cy - hh, hh - cy] : [0, 0]) as [number, number],
      };
    };
    const velocity = (now: number) => {
      const s = g.samples;
      if (s.length < 2) return { x: 0, y: 0 };
      const last = s[s.length - 1];
      if (now - last.t > 80) return { x: 0, y: 0 }; // The finger stopped before lifting.
      const first = s[0];
      const dt = Math.max(1, last.t - first.t);
      return { x: (last.x - first.x) / dt, y: (last.y - first.y) / dt };
    };

    const animateZoom = (target: { s: number; x: number; y: number }, duration = 300) => {
      tweens.current.zoom?.cancel();
      const from = { ...m.zoom };
      tweens.current.zoom = tween(reducedRef.current ? 0 : duration, easeOutQuart, (p) => {
        m.zoom = {
          s: from.s + (target.s - from.s) * p,
          x: from.x + (target.x - from.x) * p,
          y: from.y + (target.y - from.y) * p,
        };
        paint();
      });
    };
    // Zoom so the point (px, py) stays under the finger or cursor.
    const zoomAbout = (s: number, px: number, py: number, from = m.zoom) => {
      const { cx, cy } = center();
      const lx = (px - cx - from.x) / from.s;
      const ly = (py - cy - from.y) / from.s;
      return { s, x: px - cx - lx * s, y: py - cy - ly * s };
    };
    const settleZoom = (v = { x: 0, y: 0 }) => {
      let { s, x, y } = m.zoom;
      if (s <= 1.01) return animateZoom({ s: 1, x: 0, y: 0 });
      if (s > MAX_ZOOM) {
        const { cx, cy } = center();
        ({ s, x, y } = zoomAbout(MAX_ZOOM, cx + x, cy + y));
      }
      const b = bounds(s);
      animateZoom({ s, x: clamp(x + v.x * 220, ...b.x), y: clamp(y + v.y * 220, ...b.y) }, 420);
    };
    const toggleZoom = (px: number, py: number) => {
      if (m.zoom.s > 1.01) return animateZoom({ s: 1, x: 0, y: 0 });
      const f = fitRect();
      const { vw, vh } = viewport();
      // Fill the screen when that's a real step up (tall panoramas), otherwise a fixed 2.5x.
      const fill = Math.max(vw / f.width, vh / f.height);
      const s = fill > 1.4 ? Math.min(fill, MAX_ZOOM) : 2.5;
      const target = zoomAbout(s, px, py, { s: 1, x: 0, y: 0 });
      const b = bounds(s);
      animateZoom({ s, x: clamp(target.x, ...b.x), y: clamp(target.y, ...b.y) });
    };
    const isOnPhoto = (x: number, y: number) => {
      const r = zoomRef.current?.getBoundingClientRect();
      return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };

    const startPinch = () => {
      const [a, b] = [...g.pointers.values()];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const { cx, cy } = center();
      g.pinch = {
        dist: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
        s: m.zoom.s,
        lx: (mid.x - cx - m.zoom.x) / m.zoom.s,
        ly: (mid.y - cy - m.zoom.y) / m.zoom.s,
      };
      g.mode = "pinch";
    };

    const resetDrag = () => {
      stage.removeAttribute("data-dragging");
      // Spring whatever was mid-drag back into place.
      if (m.trackX !== 0 && !tweens.current.track) {
        const from = m.trackX;
        tweens.current.track = tween(
          260,
          easeOut,
          (p) => {
            m.trackX = from * (1 - p);
            paint();
          },
          () => {
            tweens.current.track = undefined;
          },
        );
      }
      if (m.frame.x || m.frame.y || m.frame.sx !== 1) {
        const from = { ...m.frame };
        const backdrop = m.backdrop;
        tweens.current.frame = tween(300, easeOutQuart, (p) => {
          const s = from.sx + (1 - from.sx) * p;
          m.frame = { x: from.x * (1 - p), y: from.y * (1 - p), sx: s, sy: s, radius: null };
          m.backdrop = backdrop + (1 - backdrop) * p;
          paint();
        });
      }
    };

    const onDown = (e: PointerEvent) => {
      if (phaseRef.current === "closing" || !boxRef.current || !fittedRef.current) return;
      if ((e.target as Element).closest("button, a")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      tweens.current.open?.finish();
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {
        // The pointer is already gone; its moves still reach the stage.
      }
      g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (g.pointers.size === 1) {
        g.type = e.pointerType;
        g.startX = e.clientX;
        g.startY = e.clientY;
        g.samples = [{ x: e.clientX, y: e.clientY, t: e.timeStamp }];
        g.zoomBase = { ...m.zoom };
        tweens.current.zoom?.cancel();
        tweens.current.frame?.cancel();
        if (tweens.current.track) {
          // Caught mid-slide: land the photo it was sliding to, then keep dragging from the same
          // spot on screen, so rapid flicks step one photo each.
          const dir = navDirRef.current;
          const x = m.trackX;
          tweens.current.track.cancel();
          tweens.current.track = undefined;
          if (dir) {
            navDirRef.current = 0;
            commit(indexRef.current + dir);
            m.trackX = x + dir * (viewport().vw + GAP);
            paint();
          }
          g.trackBase = m.trackX;
          g.mode = "swipe";
        } else {
          g.trackBase = 0;
          g.mode = "pending";
        }
      } else if (g.pointers.size === 2) {
        if (g.mode === "swipe" || g.mode === "dismiss") resetDrag();
        tweens.current.zoom?.cancel();
        startPinch();
      }
    };

    const onMove = (e: PointerEvent) => {
      const p = g.pointers.get(e.pointerId);
      if (!p) return;
      p.x = e.clientX;
      p.y = e.clientY;

      if (g.mode === "pinch") {
        const [a, b] = [...g.pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const { cx, cy } = center();
        const s = clamp((g.pinch.s * dist) / g.pinch.dist, 0.6, MAX_ZOOM * 1.5);
        m.zoom = { s, x: mid.x - cx - g.pinch.lx * s, y: mid.y - cy - g.pinch.ly * s };
        schedule();
        return;
      }
      if (g.pointers.size !== 1 || g.mode === "idle") return;

      const dx = e.clientX - g.startX;
      const dy = e.clientY - g.startY;
      g.samples.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
      while (g.samples.length > 2 && e.timeStamp - g.samples[0].t > 100) g.samples.shift();

      if (g.mode === "pending") {
        if (Math.hypot(dx, dy) < (g.type === "mouse" ? 4 : 8)) return;
        if (m.zoom.s > 1.01) g.mode = "pan";
        else if (Math.abs(dx) > Math.abs(dy)) g.mode = "swipe";
        else {
          g.mode = "dismiss";
          if (!hiddenOriginRef.current) hideOrigin(indexRef.current);
        }
        if (g.tapTimer) clearTimeout(g.tapTimer);
        stage.setAttribute("data-dragging", "");
      }

      const { vw, vh } = viewport();
      if (g.mode === "swipe") {
        const i = indexRef.current;
        // Only one neighbour is mounted each side, so never drag past it.
        let x = clamp(g.trackBase + dx, -(vw + GAP), vw + GAP);
        if ((x > 0 && i === 0) || (x < 0 && i === itemsRef.current.length - 1)) x = rubber(x, vw);
        m.trackX = x;
      } else if (g.mode === "dismiss") {
        const progress = Math.min(1, Math.abs(dy) / vh);
        const s = 1 - progress * 0.35;
        m.frame = { x: dx, y: dy, sx: s, sy: s, radius: frameRadiusRef.current + 12 * progress };
        m.backdrop = 1 - Math.min(1, Math.abs(dy) / (vh * 0.45));
      } else if (g.mode === "pan") {
        const b = bounds(m.zoom.s);
        m.zoom = {
          ...m.zoom,
          x: rubberClamp(g.zoomBase.x + dx, b.x, vw),
          y: rubberClamp(g.zoomBase.y + dy, b.y, vh),
        };
      }
      schedule();
    };

    const onTap = (e: PointerEvent) => {
      const now = e.timeStamp;
      const { clientX: x, clientY: y } = e;
      const last = g.lastTap;
      if (now - last.t < DOUBLE_TAP_MS && Math.hypot(x - last.x, y - last.y) < 32) {
        if (g.tapTimer) clearTimeout(g.tapTimer);
        g.lastTap = { t: 0, x: 0, y: 0 };
        toggleZoom(x, y);
        return;
      }
      g.lastTap = { t: now, x, y };
      if (g.type === "mouse") {
        // Desktop: a click beside the photo closes; clicks on it wait for a possible double-click.
        if (!isOnPhoto(x, y) && m.zoom.s <= 1.01) close();
        return;
      }
      // Touch: a single tap shows or hides the controls, like a native photo viewer.
      g.tapTimer = setTimeout(() => setChromeHidden((h) => !h), DOUBLE_TAP_MS);
    };

    const onUp = (e: PointerEvent) => {
      if (!g.pointers.has(e.pointerId)) return;
      g.pointers.delete(e.pointerId);
      const cancelled = e.type === "pointercancel";

      if (g.mode === "pinch") {
        if (g.pointers.size === 1) {
          // One finger lifted: carry on panning with the other.
          const [p] = [...g.pointers.values()];
          g.mode = "pan";
          g.startX = p.x;
          g.startY = p.y;
          g.zoomBase = { ...m.zoom };
          g.samples = [];
        } else if (g.pointers.size === 0) {
          g.mode = "idle";
          settleZoom();
        }
        return;
      }
      if (g.pointers.size > 0) return;

      const mode = g.mode;
      g.mode = "idle";
      stage.removeAttribute("data-dragging");
      const v = velocity(e.timeStamp);
      const { vw, vh } = viewport();

      if (mode === "pending") {
        if (!cancelled) onTap(e);
      } else if (mode === "swipe") {
        const x = m.trackX;
        const dx = e.clientX - g.startX;
        // A flick in the direction this gesture moved wins; otherwise how far the strip is out.
        let dir = 0;
        if (Math.abs(v.x) > 0.25 && Math.abs(dx) > 16 && Math.sign(v.x) === Math.sign(dx))
          dir = v.x < 0 ? 1 : -1;
        else if (Math.abs(x) > vw * 0.3) dir = x < 0 ? 1 : -1;
        const target = indexRef.current + dir;
        if (!cancelled && dir !== 0 && target >= 0 && target < itemsRef.current.length)
          go(dir as 1 | -1, v.x);
        else resetDrag();
      } else if (mode === "dismiss") {
        const dy = m.frame.y;
        const flick = Math.abs(v.y) > 0.45 && Math.sign(v.y) === Math.sign(dy);
        if (!cancelled && (Math.abs(dy) > vh * 0.16 || flick)) close();
        else resetDrag();
      } else if (mode === "pan") {
        settleZoom(cancelled ? undefined : v);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (phaseRef.current !== "open") return;
      if (e.ctrlKey) {
        // Trackpad pinch (and ctrl + wheel) zooms around the cursor.
        tweens.current.zoom?.cancel();
        const s = clamp(m.zoom.s * Math.exp(-e.deltaY * 0.01), 1, MAX_ZOOM);
        const next = s <= 1.001 ? { s: 1, x: 0, y: 0 } : zoomAbout(s, e.clientX, e.clientY);
        const b = bounds(next.s);
        m.zoom = { s: next.s, x: clamp(next.x, ...b.x), y: clamp(next.y, ...b.y) };
        schedule();
        return;
      }
      if (m.zoom.s > 1.01) {
        const b = bounds(m.zoom.s);
        m.zoom = {
          ...m.zoom,
          x: clamp(m.zoom.x - e.deltaX, ...b.x),
          y: clamp(m.zoom.y - e.deltaY, ...b.y),
        };
        schedule();
        return;
      }
      // Two-finger horizontal swipe on a trackpad: one photo per gesture, including its inertia.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        g.wheelAcc += e.deltaX;
        if (!g.wheelLocked && Math.abs(g.wheelAcc) > 60) {
          g.wheelLocked = true;
          go(g.wheelAcc > 0 ? 1 : -1);
        }
      }
      if (g.wheelTimer) clearTimeout(g.wheelTimer);
      g.wheelTimer = setTimeout(() => {
        g.wheelAcc = 0;
        g.wheelLocked = false;
      }, 180);
    };

    // Switching tabs or apps mid-gesture never delivers pointerup; put everything back.
    const onHidden = () => {
      if (document.visibilityState !== "hidden" || g.mode === "idle") return;
      g.pointers.clear();
      g.mode = "idle";
      resetDrag();
      settleZoom();
    };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    stage.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("wheel", onWheel);
      document.removeEventListener("visibilitychange", onHidden);
      if (g.tapTimer) clearTimeout(g.tapTimer);
      if (g.wheelTimer) clearTimeout(g.wheelTimer);
    };
  }, [mounted, close, commit, go, hideOrigin, paint, schedule]);

  // Repaint after React moves slides around (photo change, resize).
  // biome-ignore lint/correctness/useExhaustiveDependencies: index and box move the slides
  useLayoutEffect(() => {
    paint();
  }, [index, box, paint]);

  // Stop any running animation if the viewer unmounts mid-flight.
  useEffect(() => {
    const running = tweens.current;
    return () => {
      for (const t of Object.values(running)) t?.cancel();
      cancelAnimationFrame(frameRaf.current);
      setOriginHidden(hiddenOriginRef.current, false);
    };
  }, []);

  const onDimensions = useCallback((photo: PhotoViewerItem, width: number, height: number) => {
    if ((photo.width && photo.height) || !width || !height) return;
    setMeasured((prev) => (prev[photo.src] ? prev : { ...prev, [photo.src]: { width, height } }));
  }, []);

  if (!mounted) return null;

  const placeholderFor = (i: number) => origin(i)?.querySelector("img")?.currentSrc || undefined;
  const meta = [`${index + 1} / ${total}`, item?.caption].filter(Boolean).join(" · ");

  return createPortal(
    <div ref={overlayRef} className={styles.overlay}>
      <ScrollLock enabled allowScrollInElement={stageRef} />
      <FocusTrap active restoreFocus={false} containerRef={stageRef} className={styles.stage}>
        {/* Not <dialog>: its own top layer and focus handling would fight FocusTrap and the open animation. */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label={text.dialog}
          aria-describedby={statusId}
          className={styles.dialog}
          data-chrome={chromeHidden ? "hidden" : undefined}
        >
          <div ref={backdropRef} className={styles.backdrop} />
          <div ref={fitRef} className={styles.fit} aria-hidden />

          <div ref={trackRef} className={styles.track}>
            {box &&
              [-1, 0, 1].map((offset) => {
                const i = index + offset;
                const photo = items[i];
                if (!photo) return null;
                const dims = dimsOf(photo);
                const rect = fitInto(dims.width, dims.height, box);
                return (
                  <div
                    key={photo.src}
                    className={styles.slide}
                    style={{ transform: `translate3d(calc(${offset} * (100% + ${GAP}px)),0,0)` }}
                    aria-hidden={offset !== 0}
                  >
                    <div
                      ref={offset === 0 ? zoomRef : undefined}
                      className={styles.zoom}
                      style={{
                        left: rect.left,
                        top: rect.top,
                        width: rect.width,
                        height: rect.height,
                      }}
                    >
                      <div ref={offset === 0 ? frameRef : undefined} className={styles.frame}>
                        <Photo
                          item={photo}
                          sizes={sizesFor(rect, box)}
                          current={offset === 0}
                          unoptimized={unoptimized}
                          placeholder={placeholderFor(i)}
                          errorLabel={text.error}
                          retryLabel={text.retry}
                          onDimensions={(w, h) => onDimensions(photo, w, h)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <Row position="absolute" className={styles.top}>
            <Row background="page" border="neutral-alpha-weak" radius="m-4" shadow="l" padding="4">
              <IconButton
                icon="close"
                variant="tertiary"
                aria-label={text.close}
                onClick={() => close()}
              />
            </Row>
          </Row>

          <Row position="absolute" className={styles.bottom}>
            <Row
              background="page"
              border="neutral-alpha-weak"
              radius="m-4"
              shadow="l"
              padding="4"
              gap="4"
              vertical="center"
              style={{ maxWidth: "100%" }}
            >
              {total > 1 && (
                <IconButton
                  ref={prevButtonRef}
                  icon="chevronLeft"
                  variant="tertiary"
                  aria-label={text.previous}
                  disabled={index === 0}
                  onClick={() => go(-1)}
                />
              )}
              <Column paddingX="8" horizontal="center" align="center" className={styles.caption}>
                {item?.title && (
                  <Text textVariant="label-strong-s" onBackground="neutral-strong" truncate>
                    {item.title}
                  </Text>
                )}
                <Text
                  textVariant="label-default-xs"
                  onBackground="neutral-weak"
                  truncate
                  className={styles.meta}
                >
                  {meta}
                </Text>
              </Column>
              {total > 1 && (
                <IconButton
                  ref={nextButtonRef}
                  icon="chevronRight"
                  variant="tertiary"
                  aria-label={text.next}
                  disabled={index === total - 1}
                  onClick={() => go(1)}
                />
              )}
            </Row>
          </Row>

          <VisuallyHidden as="div" id={statusId} aria-live="polite">
            {item &&
              `${text.counter(index + 1, total)}${item.title ? `: ${item.title}` : ""}. ${item.alt}`}
          </VisuallyHidden>
        </div>
      </FocusTrap>
    </div>,
    document.body,
  );
}
