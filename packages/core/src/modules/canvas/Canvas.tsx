"use client";

import classNames from "clsx";
import {
  type CSSProperties,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "../../components/Button.js";
import { IconButton } from "../../components/IconButton.js";
import { Row } from "../../components/Row.js";
import { useControllableState } from "../../internal/useControllableState.js";
import styles from "./Canvas.module.css";
import {
  type CanvasApi,
  CanvasApiContext,
  CanvasViewContext,
  useCanvas,
  useCanvasApi,
} from "./CanvasContext.js";
import {
  type CanvasPoint,
  type CanvasRect,
  type CanvasView,
  clamp,
  fitView,
  rectFromPoints,
  worldToScreen as toScreen,
  screenToWorld as toWorld,
  zoomAt,
} from "./geometry.js";

export interface CanvasLabels {
  /** The canvas region's name for assistive tech. */
  canvas: string;
  zoomIn: string;
  zoomOut: string;
  /** The zoom readout's button, which goes back to 100%. */
  resetZoom: string;
  fit: string;
}

const DEFAULT_LABELS: CanvasLabels = {
  canvas: "Canvas",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  resetZoom: "Zoom to 100%",
  fit: "Zoom to fit",
};

export interface CanvasSelectionBoxInfo {
  phase: "start" | "move" | "end";
  /** Shift or ⌘/Ctrl was held: add to the selection rather than replace it. */
  additive: boolean;
}

export interface CanvasProps {
  /** World content: `CanvasItem`s, and anything else drawn in world units. */
  children?: ReactNode;
  /** The camera, controlled. `{ x, y, zoom }`: a world point p is drawn at p × zoom + (x, y). */
  view?: CanvasView;
  defaultView?: CanvasView;
  onViewChange?: (view: CanvasView) => void;
  /** Default 0.05 (5%). */
  minZoom?: number;
  /** Default 8 (800%). */
  maxZoom?: number;
  /**
   * What the wheel does. `pan` (the default, like design tools): scrolling and
   * a trackpad's two fingers move the view, and ⌘/Ctrl + wheel or a pinch
   * zooms. `zoom` (like maps): the wheel zooms towards the pointer.
   */
  wheel?: "pan" | "zoom";
  /**
   * Dragging anywhere moves the view: the hand tool. Without it, a drag on
   * empty canvas draws a selection box when `onSelectionBox` is given, and
   * otherwise moves the view. Holding Space, or the middle button, always pans.
   */
  panOnDrag?: boolean;
  /** Default `dots`. */
  grid?: "dots" | "lines" | "none";
  /** World units between grid dots or lines at 100%. Default 16. */
  gridSize?: number;
  /** The zoom controls in the bottom-right corner. Default true. */
  controls?: boolean;
  /** Extra controls placed before the zoom controls, in the same bar. */
  controlsStart?: ReactNode;
  /**
   * The box the fit button and the opening view frame: usually the bounds of
   * everything on the canvas (`rectsBounds`). Until someone moves the view
   * themselves, the canvas keeps it framed as the canvas resizes.
   */
  fit?: CanvasRect | null;
  /** Changing this frames `fit` again, as a different document should. */
  fitKey?: string | number;
  /** Space around `fit`, in px. Default 64. */
  fitPadding?: number;
  /** Most the opening view and the fit button zoom in. Default 1. */
  fitMaxZoom?: number;
  /**
   * Turns on the selection box: dragging empty canvas draws it, and this hears
   * its world box as it changes, then `null` once it's done.
   */
  onSelectionBox?: (rect: CanvasRect | null, info: CanvasSelectionBoxInfo) => void;
  /**
   * A press on empty canvas (anything outside a `CanvasItem`). Return true to
   * take the gesture, as a drawing tool does, and the canvas won't pan or
   * draw a selection box from it.
   */
  onBackgroundPointerDown?: (
    event: ReactPointerEvent<HTMLDivElement>,
    point: CanvasPoint,
    // biome-ignore lint/suspicious/noConfusingVoidType: a handler that returns nothing declines the gesture
  ) => boolean | void;
  /** A press and release on empty canvas that didn't move: usually, clear the selection. */
  onBackgroundClick?: (event: ReactPointerEvent<HTMLDivElement>, point: CanvasPoint) => void;
  /** Screen-space content over the canvas, such as toolbars. Positioned by you. */
  overlay?: ReactNode;
  /**
   * Keyboard shortcuts while the pointer is over the canvas or focus is in it:
   * Space to pan, ⌘/Ctrl + and − to zoom, Shift+0 for 100%, Shift+1 to fit.
   * Default true.
   */
  shortcuts?: boolean;
  labels?: Partial<CanvasLabels>;
  /** Default `100%`. The canvas needs a height from its parent or from here. */
  height?: CSSProperties["height"];
  className?: string;
  style?: CSSProperties;
  ref?: Ref<CanvasApi>;
}

const DEFAULT_VIEW: CanvasView = { x: 0, y: 0, zoom: 1 };
const DRAG_THRESHOLD = 3;

const isTyping = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  if (!el?.tagName) return false;
  return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
};

type Gesture =
  | { kind: "pan"; pointerId: number; x: number; y: number; moved: boolean; background: boolean }
  | {
      kind: "box";
      pointerId: number;
      start: CanvasPoint;
      sx: number;
      sy: number;
      moved: boolean;
      additive: boolean;
    }
  | null;

/**
 * An infinite canvas: a camera over a world plane that pans and zooms, with a
 * grid, zoom controls and a selection box.
 *
 * It's controlled the way the rest of Once UI is: the app owns the document,
 * puts it on the plane with `CanvasItem`, and draws handles, guides and
 * anchors in screen space with `TransformHandles`, `SnapGuides` and
 * `CanvasAnchor`. Moving the camera re-renders only those, never the items.
 */
export function Canvas({
  children,
  view: viewProp,
  defaultView,
  onViewChange,
  minZoom = 0.05,
  maxZoom = 8,
  wheel = "pan",
  panOnDrag = false,
  grid = "dots",
  gridSize = 16,
  controls = true,
  controlsStart,
  fit,
  fitKey,
  fitPadding = 64,
  fitMaxZoom = 1,
  onSelectionBox,
  onBackgroundPointerDown,
  onBackgroundClick,
  overlay,
  shortcuts = true,
  labels: labelsProp,
  height = "100%",
  className,
  style,
  ref,
}: CanvasProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const frame = useRef<HTMLDivElement>(null);
  const [overlayEl, setOverlayEl] = useState<HTMLDivElement | null>(null);
  const [view, setViewState] = useControllableState<CanvasView>({
    value: viewProp,
    defaultValue: defaultView ?? DEFAULT_VIEW,
    onChange: onViewChange,
  });
  const viewRef = useRef(view);
  viewRef.current = view;
  const size = useRef({ width: 0, height: 0 });
  // Whether anyone has moved the view yet. Until they have, the canvas keeps
  // `fit` framed as it resizes, which is what lets the opening view settle on
  // a layout that hasn't finished measuring.
  const touched = useRef(viewProp !== undefined || defaultView !== undefined);
  const gesture = useRef<Gesture>(null);
  const pointers = useRef(new Map<number, CanvasPoint>());
  const pinch = useRef<{ distance: number; mid: CanvasPoint } | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [panning, setPanning] = useState(false);
  const [box, setBox] = useState<CanvasRect | null>(null);
  const hovered = useRef(false);

  const limit = useCallback(
    (v: CanvasView): CanvasView => ({ ...v, zoom: clamp(v.zoom, minZoom, maxZoom) }),
    [minZoom, maxZoom],
  );

  const setView = useCallback(
    (next: CanvasView | ((prev: CanvasView) => CanvasView)) => {
      touched.current = true;
      setViewState((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        // Keep the screen point under the zoom where it was when the zoom clamps.
        if (resolved.zoom > maxZoom || resolved.zoom < minZoom) {
          const zoom = clamp(resolved.zoom, minZoom, maxZoom);
          const cx = size.current.width / 2;
          const cy = size.current.height / 2;
          const world = toWorld({ x: cx, y: cy }, resolved);
          return { zoom, x: cx - world.x * zoom, y: cy - world.y * zoom };
        }
        return resolved;
      });
    },
    [setViewState, minZoom, maxZoom],
  );

  const fitRef = useRef(fit);
  fitRef.current = fit;

  const api = useMemo<CanvasApi>(() => {
    const center = () => ({ x: size.current.width / 2, y: size.current.height / 2 });
    const fitTo: CanvasApi["fitTo"] = (rect, options) => {
      const target = rect ?? fitRef.current;
      if (!target || size.current.width === 0) return;
      const next = fitView(target, size.current, {
        padding: options?.padding ?? fitPadding,
        minZoom,
        maxZoom: options?.maxZoom ?? fitMaxZoom,
      });
      setViewState(limit(next));
    };
    return {
      getView: () => viewRef.current,
      setView,
      getSize: () => size.current,
      screenToWorld: (p) => toWorld(p, viewRef.current),
      worldToScreen: (p) => toScreen(p, viewRef.current),
      clientToWorld: (clientX, clientY) => {
        const r = frame.current?.getBoundingClientRect();
        return toWorld(
          { x: clientX - (r?.left ?? 0), y: clientY - (r?.top ?? 0) },
          viewRef.current,
        );
      },
      zoomBy: (factor, at) =>
        setView((v) => limit(zoomAt(v, clamp(v.zoom * factor, minZoom, maxZoom), at ?? center()))),
      zoomTo: (zoom, at) =>
        setView((v) => zoomAt(v, clamp(zoom, minZoom, maxZoom), at ?? center())),
      fitTo: (rect, options) => {
        touched.current = true;
        fitTo(rect, options);
      },
      overlay: overlayEl,
    };
  }, [setView, setViewState, limit, minZoom, maxZoom, fitPadding, fitMaxZoom, overlayEl]);

  useImperativeHandle(ref, () => api, [api]);

  // The opening view, and again whenever the document changes.
  const autoFit = useCallback(() => {
    const target = fitRef.current;
    if (!target || size.current.width === 0) return;
    setViewState(
      limit(fitView(target, size.current, { padding: fitPadding, minZoom, maxZoom: fitMaxZoom })),
    );
  }, [setViewState, limit, fitPadding, minZoom, fitMaxZoom]);
  const autoFitRef = useRef(autoFit);
  autoFitRef.current = autoFit;

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      size.current = { width: r.width, height: r.height };
      if (!touched.current) autoFitRef.current();
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fitKeyRef = useRef(fitKey);
  useEffect(() => {
    if (fitKeyRef.current === fitKey) return;
    fitKeyRef.current = fitKey;
    autoFitRef.current();
  }, [fitKey]);

  // Native and non-passive: React's wheel listener can't preventDefault, and
  // the page would scroll (or the browser zoom) underneath.
  const wheelRef = useRef(wheel);
  wheelRef.current = wheel;
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const at = { x: e.clientX - r.left, y: e.clientY - r.top };
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? r.height : 1;
      const dx = e.deltaX * unit;
      const dy = e.deltaY * unit;
      const zooming = e.ctrlKey || e.metaKey || wheelRef.current === "zoom";
      if (zooming) {
        // A pinch arrives as ctrl + small deltas; a mouse wheel as large ones.
        const speed = e.ctrlKey && Math.abs(dy) < 50 ? 0.01 : 0.002;
        setView((v) => zoomAt(v, clamp(v.zoom * Math.exp(-dy * speed), minZoom, maxZoom), at));
      } else if (e.shiftKey && dx === 0) {
        setView((v) => ({ ...v, x: v.x - dy }));
      } else {
        setView((v) => ({ ...v, x: v.x - dx, y: v.y - dy }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setView, minZoom, maxZoom]);

  // Shortcuts listen on the window, so Space pans as soon as the pointer is
  // over the canvas, the way it does in every design tool, and act only while
  // the pointer is over it or focus is inside it.
  useEffect(() => {
    if (!shortcuts) return;
    const active = () =>
      hovered.current || (!!frame.current && frame.current.contains(document.activeElement));
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target) || !active()) return;
      const mod = e.metaKey || e.ctrlKey;
      if (e.code === "Space" && !mod) {
        e.preventDefault();
        setSpaceHeld(true);
        return;
      }
      if (mod && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        api.zoomBy(1.25);
      } else if (mod && e.key === "-") {
        e.preventDefault();
        api.zoomBy(1 / 1.25);
      } else if (e.shiftKey && !mod && e.code === "Digit0") {
        e.preventDefault();
        api.zoomTo(1);
      } else if (e.shiftKey && !mod && e.code === "Digit1") {
        e.preventDefault();
        api.fitTo();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceHeld(false);
    };
    const onBlur = () => setSpaceHeld(false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [shortcuts, api]);

  const local = (e: { clientX: number; clientY: number }) => {
    const r = frame.current?.getBoundingClientRect();
    return { x: e.clientX - (r?.left ?? 0), y: e.clientY - (r?.top ?? 0) };
  };

  const isBackground = (target: EventTarget | null) => {
    const el = target as HTMLElement | null;
    if (!el || !frame.current) return false;
    if (el.closest?.("[data-canvas-item], [data-canvas-ui]")) return false;
    return frame.current.contains(el);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.set(e.pointerId, local(e));
    if (pointers.current.size === 2) {
      // A second finger turns whatever the first started into a pinch.
      if (gesture.current?.kind === "box")
        onSelectionBox?.(null, { phase: "end", additive: false });
      gesture.current = null;
      setBox(null);
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      };
      return;
    }
    const background = isBackground(e.target);
    const panGesture = spaceHeld || e.button === 1 || panOnDrag;
    if (!panGesture) {
      if (e.button !== 0 || !background) return;
      const point = api.clientToWorld(e.clientX, e.clientY);
      if (onBackgroundPointerDown?.(e, point) === true) return;
      if (onSelectionBox) {
        const p = local(e);
        gesture.current = {
          kind: "box",
          pointerId: e.pointerId,
          start: point,
          sx: p.x,
          sy: p.y,
          moved: false,
          additive: e.shiftKey || e.metaKey || e.ctrlKey,
        };
        e.currentTarget.setPointerCapture?.(e.pointerId);
        return;
      }
    }
    if (e.button === 1) e.preventDefault();
    gesture.current = {
      kind: "pan",
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      moved: false,
      background,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setPanning(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, local(e));
    if (pinch.current && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const prev = pinch.current;
      pinch.current = { distance, mid };
      setView((v) => {
        const zoomed = zoomAt(
          v,
          clamp(v.zoom * (distance / (prev.distance || distance)), minZoom, maxZoom),
          mid,
        );
        return { ...zoomed, x: zoomed.x + mid.x - prev.mid.x, y: zoomed.y + mid.y - prev.mid.y };
      });
      return;
    }
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId) return;
    if (g.kind === "pan") {
      const dx = e.clientX - g.x;
      const dy = e.clientY - g.y;
      if (!g.moved && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
      g.moved = true;
      g.x = e.clientX;
      g.y = e.clientY;
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
      return;
    }
    const p = local(e);
    if (!g.moved && Math.abs(p.x - g.sx) + Math.abs(p.y - g.sy) < DRAG_THRESHOLD) return;
    const phase = g.moved ? "move" : "start";
    g.moved = true;
    const rect = rectFromPoints(g.start, api.clientToWorld(e.clientX, e.clientY));
    setBox(rect);
    onSelectionBox?.(rect, { phase, additive: g.additive });
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId) return;
    gesture.current = null;
    setPanning(false);
    if (g.kind === "box" && g.moved) {
      setBox(null);
      onSelectionBox?.(null, { phase: "end", additive: g.additive });
      return;
    }
    // A press that went nowhere on empty canvas is a click there.
    const clicked = g.kind === "box" || (g.background && !spaceHeld && e.button !== 1);
    if (!g.moved && clicked && e.type === "pointerup") {
      onBackgroundClick?.(e, api.clientToWorld(e.clientX, e.clientY));
    }
  };

  // The grid steps up by fives as the view zooms out, so dots never crowd
  // closer than 8px.
  let step = gridSize * view.zoom;
  while (step > 0 && step < 8) step *= 5;
  const cursor = panning ? "grabbing" : spaceHeld || panOnDrag ? "grab" : undefined;

  const vars = {
    "--canvas-zoom": view.zoom,
    "--canvas-grid-size": `${step}px`,
    "--canvas-grid-x": `${view.x}px`,
    "--canvas-grid-y": `${view.y}px`,
    height,
    cursor,
    ...style,
  } as CSSProperties;

  return (
    <CanvasApiContext.Provider value={api}>
      <CanvasViewContext.Provider value={view}>
        <div
          ref={frame}
          role="application"
          className={classNames(styles.canvas, className)}
          style={vars}
          aria-label={labels.canvas}
          aria-roledescription="canvas"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: role="application" is interactive; focus is how keyboard users reach the zoom shortcuts
          tabIndex={0}
          data-panning={panning || undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerEnter={() => {
            hovered.current = true;
          }}
          onPointerLeave={() => {
            hovered.current = false;
          }}
          onAuxClick={(e) => e.button === 1 && e.preventDefault()}
        >
          {grid !== "none" && (
            <div
              className={classNames(styles.grid, grid === "dots" ? styles.dots : styles.lines)}
            />
          )}
          <div
            className={styles.world}
            style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}
          >
            {children}
          </div>
          <div ref={setOverlayEl} className={styles.overlay}>
            {box && <SelectionBoxRect rect={box} view={view} />}
          </div>
          {overlay}
          {controls && (
            <Row
              className={styles.controls}
              data-canvas-ui=""
              gap="2"
              padding="4"
              radius="m"
              background="surface"
              border="neutral-alpha-medium"
              shadow="s"
              vertical="center"
            >
              {controlsStart}
              <IconButton
                icon="minus"
                size="s"
                variant="ghost"
                tooltip={labels.zoomOut}
                onClick={() => api.zoomBy(1 / 1.25)}
              />
              <Button
                size="s"
                variant="ghost"
                className={styles.zoomLabel}
                aria-label={labels.resetZoom}
                onClick={() => api.zoomTo(1)}
              >
                {Math.round(view.zoom * 100)}%
              </Button>
              <IconButton
                icon="plus"
                size="s"
                variant="ghost"
                tooltip={labels.zoomIn}
                onClick={() => api.zoomBy(1.25)}
              />
              {fit && (
                <IconButton
                  icon="maximize"
                  size="s"
                  variant="ghost"
                  tooltip={labels.fit}
                  onClick={() => api.fitTo()}
                />
              )}
            </Row>
          )}
        </div>
      </CanvasViewContext.Provider>
    </CanvasApiContext.Provider>
  );
}

function SelectionBoxRect({ rect, view }: { rect: CanvasRect; view: CanvasView }) {
  const p = toScreen(rect, view);
  return (
    <div
      className={styles.selectionBox}
      style={{
        transform: `translate(${p.x}px, ${p.y}px)`,
        width: rect.width * view.zoom,
        height: rect.height * view.zoom,
      }}
    />
  );
}

export interface SelectionBoxProps {
  /** The box in world units; nothing is drawn while it's null. */
  rect: CanvasRect | null;
}

/**
 * The drag-to-select box, drawn in screen space. `Canvas` draws its own while
 * `onSelectionBox` is set; use this for a box your own gesture drives.
 */
export function SelectionBox({ rect }: SelectionBoxProps) {
  const { view, overlay } = useCanvas();
  if (!rect || !overlay) return null;
  return createPortal(<SelectionBoxRect rect={rect} view={view} />, overlay);
}

export interface CanvasOverlayProps {
  children?: ReactNode;
}

/** Puts its children in the canvas's screen-space layer, over the world. */
export function CanvasOverlay({ children }: CanvasOverlayProps) {
  const { overlay } = useCanvasApi();
  if (!overlay) return null;
  return createPortal(children, overlay);
}

export interface CanvasAnchorProps {
  /** The world point the anchor follows. */
  x: number;
  y: number;
  /**
   * Which part of the children sits on the point. Default `top-left`: the
   * children's top-left corner, as a cursor's tip or a comment pin's tail.
   */
  align?: "top-left" | "center" | "top" | "bottom" | "left" | "right";
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const ALIGN: Record<NonNullable<CanvasAnchorProps["align"]>, string> = {
  "top-left": "0, 0",
  center: "-50%, -50%",
  top: "-50%, 0",
  bottom: "-50%, -100%",
  left: "0, -50%",
  right: "-100%, -50%",
};

/**
 * Screen-space content pinned to a world point: it follows the point as the
 * view pans and zooms but keeps its own size, as a cursor, a comment or a
 * label should.
 */
export function CanvasAnchor({
  x,
  y,
  align = "top-left",
  children,
  className,
  style,
}: CanvasAnchorProps) {
  const { view, overlay } = useCanvas();
  if (!overlay) return null;
  const p = toScreen({ x, y }, view);
  return createPortal(
    <div
      className={classNames(styles.anchor, className)}
      data-canvas-ui=""
      style={{ transform: `translate(${p.x}px, ${p.y}px) translate(${ALIGN[align]})`, ...style }}
    >
      {children}
    </div>,
    overlay,
  );
}
