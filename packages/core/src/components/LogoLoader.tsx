"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import styles from "./LogoLoader.module.scss";

/** The colors the logo takes: the brand or accent hue, the strongest neutral text, or the surrounding text color. */
export type LogoLoaderColor = "brand" | "accent" | "neutral" | "inherit";

export interface LogoLoaderProps extends Omit<React.ComponentProps<"div">, "children" | "color"> {
  /** The logo as SVG markup, such as an imported `.svg?raw` file or a string. Wins over `src`. */
  svg?: string;
  /** URL of the logo's SVG file, fetched on the client. Use `svg` to skip the request. */
  src?: string;
  /** Height of the logo, in px or any CSS length; the width follows the SVG's viewBox. */
  height?: number | string;
  /** `neutral` by default, the strongest text color. */
  color?: LogoLoaderColor;
  /**
   * Show the filled logo without the intro. Set it after the first play so a
   * remount, or a load that runs long, never restarts the strokes.
   */
  settled?: boolean;
  /**
   * The order the strokes draw in. `reading`, the default, goes left to right
   * by where each outline starts; `document` keeps the file's order, for a logo
   * whose file already lists its shapes in the order they should land.
   */
  order?: "reading" | "document";
  /** Fires once the strokes have drawn and the fill is in. Not called when `settled`. */
  onComplete?: () => void;
  ariaLabel?: string;
}

const COLOR: Record<Exclude<LogoLoaderColor, "inherit">, string> = {
  brand: "var(--brand-color-strong)",
  accent: "var(--function-accent-500)",
  neutral: "var(--neutral-on-background-strong)",
};

/** The shapes an SVG logo is drawn from. Groups, defs and masks are not read. */
const SHAPES = ["path", "circle", "ellipse", "rect", "polygon", "polyline", "line"] as const;
type ShapeTag = (typeof SHAPES)[number];

/** The geometry attributes kept from each shape, and the React prop each one becomes. */
const GEOMETRY: Record<string, string> = {
  d: "d",
  cx: "cx",
  cy: "cy",
  r: "r",
  rx: "rx",
  ry: "ry",
  x: "x",
  y: "y",
  width: "width",
  height: "height",
  points: "points",
  x1: "x1",
  y1: "y1",
  x2: "x2",
  y2: "y2",
  transform: "transform",
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
};

type Shape = {
  tag: ShapeTag;
  props: Record<string, string>;
  /** The logo draws this shape as a line, not a fill (`fill="none"`). */
  outline: boolean;
  strokeWidth?: string;
};

type ParsedLogo = { viewBox: string; width: number; height: number; shapes: Shape[] };

const readAttributes = (source: string) => {
  const attributes: Record<string, string> = {};
  for (const match of source.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    attributes[match[1]] = match[2] ?? match[3];
  }
  return attributes;
};

/**
 * Reads an SVG logo into plain shapes. Only geometry is kept and turned into
 * React props, so nothing from the markup (scripts, handlers, styles) reaches
 * the page.
 */
const parseLogo = (markup: string): ParsedLogo | null => {
  const root = markup.match(/<svg\b([^>]*)>/i);
  if (!root) return null;
  const rootAttributes = readAttributes(root[1]);
  const box = rootAttributes.viewBox
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  const width = box?.[2] ?? Number.parseFloat(rootAttributes.width ?? "");
  const height = box?.[3] ?? Number.parseFloat(rootAttributes.height ?? "");
  if (!width || !height) return null;

  const body = markup.replace(
    /<(defs|clipPath|mask|pattern|symbol|style|script)\b[\s\S]*?<\/\1>/gi,
    "",
  );
  const shapes: Shape[] = [];
  for (const match of body.matchAll(new RegExp(`<(${SHAPES.join("|")})\\b([^>]*?)\\/?>`, "gi"))) {
    const attributes = readAttributes(match[2]);
    const props: Record<string, string> = {};
    for (const [name, prop] of Object.entries(GEOMETRY)) {
      if (attributes[name] !== undefined) props[prop] = attributes[name];
    }
    const tag = match[1].toLowerCase() as ShapeTag;
    shapes.push({
      tag,
      props,
      outline: attributes.fill === "none" || tag === "line" || tag === "polyline",
      strokeWidth: attributes["stroke-width"],
    });
  }
  if (shapes.length === 0) return null;

  return { viewBox: box ? box.join(" ") : `0 0 ${width} ${height}`, width, height, shapes };
};

/**
 * One stroke per outline: a compound path splits into its subpaths, so each
 * letter (and each counter inside one) draws on its own. Only absolute `M`
 * starts a new stroke; a relative `m` after `z` depends on the subpath before it.
 */
const strokesOf = (shape: Shape): Shape[] => {
  if (shape.tag !== "path" || !shape.props.d) return [shape];
  return shape.props.d
    .split(/(?<=[Zz])\s*(?=M)/)
    .filter((d) => d.trim())
    .map((d) => ({ ...shape, props: { ...shape.props, d } }));
};

/** Where an outline starts across the logo, for drawing in reading order. */
const startX = ({ tag, props }: Shape) => {
  const number = (value: string | undefined) => Number.parseFloat(value ?? "") || 0;
  switch (tag) {
    case "circle":
      return number(props.cx) - number(props.r);
    case "ellipse":
      return number(props.cx) - number(props.rx);
    case "rect":
      return number(props.x);
    case "line":
      return Math.min(number(props.x1), number(props.x2));
    default:
      return number((props.d ?? props.points ?? "").match(/-?[\d.]+/)?.[0]);
  }
};

/* The intro: strokes draw one after another, then fade as the fill comes in. */
const DRAW_S = 0.36;
const STAGGER_S = 0.066;
/** The stroke phase stays under about two seconds however many outlines a logo has. */
const STAGGER_BUDGET_S = 1.4;
const GAP_BEFORE_FILL_S = 0.1;
const FILL_S = 0.42;

const timeline = (strokeCount: number) => {
  const stagger = Math.min(STAGGER_S, STAGGER_BUDGET_S / Math.max(strokeCount, 1));
  const strokesEnd = (strokeCount - 1) * stagger + DRAW_S;
  const fillDelay = strokesEnd + GAP_BEFORE_FILL_S;
  return { stagger, fillDelay, totalMs: Math.ceil((fillDelay + FILL_S) * 1000) };
};

const useLogoMarkup = (svg: string | undefined, src: string | undefined) => {
  const [fetched, setFetched] = useState<{ src: string; markup: string } | null>(null);

  useEffect(() => {
    if (svg || !src) return;
    const controller = new AbortController();
    fetch(src, { signal: controller.signal })
      .then((response) => (response.ok ? response.text() : ""))
      .then((markup) => setFetched({ src, markup }))
      .catch(() => {});
    return () => controller.abort();
  }, [svg, src]);

  if (svg) return svg;
  return fetched && fetched.src === src ? fetched.markup : undefined;
};

/**
 * A loading state drawn from a product's own logo: each letter or shape of the
 * wordmark or symbol is traced in turn, then the logo fills in and holds. Use
 * it for a page or app splash; `LogoSpinner` is the looping Once UI mark, and
 * `Spinner` stays the neutral one for buttons and fields.
 *
 * Pass the SVG as markup (`svg`) or a URL (`src`). The logo is drawn in one
 * color (`color`), so a dark-mode and a light-mode file are the same here.
 * With reduced motion the strokes are skipped and the logo fades in.
 */
const LogoLoader = forwardRef<HTMLDivElement, LogoLoaderProps>(
  (
    {
      svg,
      src,
      height = 120,
      color = "neutral",
      settled = false,
      order = "reading",
      onComplete,
      ariaLabel = "Loading",
      "aria-label": nativeAriaLabel,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const markup = useLogoMarkup(svg, src);
    const logo = useMemo(() => (markup ? parseLogo(markup) : null), [markup]);
    const strokes = useMemo(() => {
      const all = logo?.shapes.flatMap(strokesOf) ?? [];
      return order === "reading" ? all.sort((a, b) => startX(a) - startX(b)) : all;
    }, [logo, order]);
    const { stagger, fillDelay, totalMs } = timeline(strokes.length);

    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    useEffect(() => {
      if (settled || !logo) return;
      const id = window.setTimeout(() => onCompleteRef.current?.(), totalMs);
      return () => window.clearTimeout(id);
    }, [settled, logo, totalMs]);

    const ratio = logo ? `${logo.width} / ${logo.height}` : undefined;
    const strokeWidth = logo ? logo.height * 0.008 : 0;

    return (
      <div
        ref={ref}
        role="status"
        aria-label={nativeAriaLabel ?? ariaLabel}
        className={classNames(styles.root, !settled && styles.playing, className)}
        style={
          {
            height: typeof height === "number" ? `${height}px` : height,
            aspectRatio: ratio,
            ...(color !== "inherit" && { color: COLOR[color] }),
            "--logo-loader-draw": `${DRAW_S}s`,
            "--logo-loader-fill-delay": `${fillDelay}s`,
            "--logo-loader-fill": `${FILL_S}s`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {logo && (
          <svg className={styles.logo} viewBox={logo.viewBox} aria-hidden="true" focusable="false">
            {logo.shapes.map(({ tag, props, outline, strokeWidth: width }, index) => {
              const Tag = tag as "path";
              return (
                <Tag
                  // The shapes come from a fixed markup string and never reorder.
                  // biome-ignore lint/suspicious/noArrayIndexKey: no other stable key
                  key={`fill-${index}`}
                  {...props}
                  className={styles.fill}
                  fill={outline ? "none" : "currentColor"}
                  stroke={outline ? "currentColor" : undefined}
                  strokeWidth={outline ? (width ?? strokeWidth) : undefined}
                />
              );
            })}
            {!settled &&
              strokes.map(({ tag, props }, index) => {
                const Tag = tag as "path";
                return (
                  <Tag
                    // biome-ignore lint/suspicious/noArrayIndexKey: no other stable key
                    key={`stroke-${index}`}
                    {...props}
                    className={styles.stroke}
                    pathLength={100}
                    strokeWidth={strokeWidth}
                    style={{ "--logo-loader-delay": `${index * stagger}s` } as React.CSSProperties}
                  />
                );
              })}
          </svg>
        )}
      </div>
    );
  },
);

LogoLoader.displayName = "LogoLoader";

export { LogoLoader };
