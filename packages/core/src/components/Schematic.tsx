"use client";

import classNames from "clsx";
import type React from "react";
import { useMemo } from "react";
import { mergeLabels } from "../internal/labels.js";
import styles from "./Schematic.module.scss";
import { VisuallyHidden } from "./VisuallyHidden.js";

/** The parts a schematic draws, each a plain, recognisable symbol. */
export type SchematicKind =
  | "vessel"
  | "tank"
  | "pump"
  | "valve"
  | "exchanger"
  | "turbine"
  | "sensor"
  | "box";

/**
 * How a part or a line stands. Each reads without colour: `warning` has a
 * dashed outline, `alarm` a heavy one, `off` is hollow and struck
 * through, and both write their state under the part.
 */
export type SchematicState = "normal" | "warning" | "alarm" | "off";

export interface SchematicNode {
  id: string;
  kind: SchematicKind;
  /** The part's centre, in the schematic's own units (its `viewBox`). */
  x: number;
  y: number;
  /** Written under the part. */
  label: string;
  /** A reading written under the label: `"312 °C"`. */
  value?: string;
  state?: SchematicState;
  /** A pump turns while running. Defaults to `true`; `state: "off"` stops it too. */
  running?: boolean;
  /** A valve is drawn filled while open, hollow while closed, and says which. Defaults to `true`. */
  open?: boolean;
  /** A `box`, `tank` or `vessel`'s size, overriding the symbol's own. */
  width?: number;
  height?: number;
  /** A short tag inside a `sensor`'s bubble (`"TT"`), or over any other part. */
  tag?: string;
}

export interface SchematicLink {
  id?: string;
  from: string;
  to: string;
  /** Corners the line passes through between the two parts. */
  via?: readonly [number, number][];
  /**
   * What runs along it: 0 (or left out) is still, a positive number flows
   * from `from` to `to`, a negative one back. Its size is the speed, 1 being
   * one dash length a second. Arrows show the direction even when motion is
   * reduced.
   */
  flow?: number;
  state?: SchematicState;
  /** Written beside the line's longest run: `"Feedwater"`. */
  label?: string;
}

export interface SchematicLabels {
  state: Record<SchematicState, string>;
  open: string;
  closed: string;
  stopped: string;
  /** The screen reader's line for a flow: `"Reactor to Steam generator"`. */
  flow: (from: string, to: string, link: SchematicLink) => string;
  flowsHeading: string;
}

const defaultLabels: SchematicLabels = {
  state: { normal: "Normal", warning: "Warning", alarm: "Alarm", off: "Off" },
  open: "Open",
  closed: "Closed",
  stopped: "Stopped",
  flow: (from, to, link) =>
    `${link.label ? `${link.label}: ` : ""}${from} to ${to}${
      link.flow ? "" : ", no flow"
    }${link.state && link.state !== "normal" ? `, ${link.state}` : ""}`,
  flowsHeading: "Flows",
};

interface SchematicProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  nodes: readonly SchematicNode[];
  links?: readonly SchematicLink[];
  /** The drawing's own units. Left out, the parts' extent with room for their labels. */
  viewBox?: [number, number, number, number];
  /** The selected part, drawn with a ring. */
  selected?: string;
  /** Makes every part a button: called with its id when pressed. */
  onNodeSelect?: (id: string) => void;
  /**
   * The narrowest the drawing gets before it scrolls sideways instead, so its
   * text stays readable on a phone. Defaults to 560 (px); 0 always shrinks.
   */
  minWidth?: number;
  /** The drawing's name for screen readers: `"Primary loop"`. */
  "aria-label": string;
  labels?: Partial<SchematicLabels>;
  ref?: React.Ref<HTMLDivElement>;
}

const SIZE: Record<SchematicKind, [number, number]> = {
  vessel: [64, 104],
  tank: [80, 64],
  pump: [40, 40],
  valve: [32, 22],
  exchanger: [48, 48],
  turbine: [72, 56],
  sensor: [28, 28],
  box: [96, 56],
};

const sizeOf = (n: SchematicNode): [number, number] => [
  n.width ?? SIZE[n.kind][0],
  n.height ?? SIZE[n.kind][1],
];

function PartSymbol({ node }: { node: SchematicNode }) {
  const [w, h] = sizeOf(node);
  const { x, y } = node;
  const left = x - w / 2;
  const top = y - h / 2;
  switch (node.kind) {
    case "vessel":
      return <rect x={left} y={top} width={w} height={h} rx={Math.min(w, h) / 2} />;
    case "tank":
      return <rect x={left} y={top} width={w} height={h} rx={6} />;
    case "box":
      return <rect x={left} y={top} width={w} height={h} rx={4} />;
    case "pump": {
      const r = w / 2;
      return (
        <>
          <circle cx={x} cy={y} r={r} />
          <g className={styles.impeller} style={{ transformOrigin: `${x}px ${y}px` }}>
            <path
              d={`M${x - r * 0.55} ${y - r * 0.5} L${x + r * 0.65} ${y} L${x - r * 0.55} ${y + r * 0.5} Z`}
              className={styles.inner}
            />
          </g>
        </>
      );
    }
    case "valve":
      return (
        <path
          d={`M${left} ${top} L${x + w / 2} ${y + h / 2} L${x + w / 2} ${top} L${left} ${y + h / 2} Z`}
          className={node.open === false ? styles.hollow : undefined}
        />
      );
    case "exchanger": {
      const r = w / 2;
      return (
        <>
          <circle cx={x} cy={y} r={r} />
          <path
            d={`M${x - r} ${y} L${x - r / 2} ${y - r / 2} L${x} ${y + r / 2} L${x + r / 2} ${y - r / 2} L${x + r} ${y}`}
            className={styles.line}
          />
        </>
      );
    }
    case "turbine":
      return (
        <path
          d={`M${left} ${y - h / 4} L${x + w / 2} ${top} L${x + w / 2} ${y + h / 2} L${left} ${y + h / 4} Z`}
        />
      );
    case "sensor":
      return <circle cx={x} cy={y} r={w / 2} />;
  }
}

/** The point halfway along a polyline's longest run, and that run's angle. */
function longestRun(points: [number, number][]) {
  let best = { at: points[0], angle: 0, length: -1 };
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i];
    const length = Math.hypot(bx - ax, by - ay);
    if (length > best.length) {
      best = {
        at: [(ax + bx) / 2, (ay + by) / 2],
        angle: (Math.atan2(by - ay, bx - ax) * 180) / Math.PI,
        length,
      };
    }
  }
  return best;
}

/**
 * A process schematic: parts (vessels, pumps, valves, exchangers, turbines,
 * sensors) joined by lines that show what flows where. Dashes run along a line
 * in the direction of its flow, at its speed, and arrows say the direction
 * even with motion reduced. A part's state is drawn in its outline and
 * written under it, so the drawing reads without colour.
 *
 * The parts and lines are data, so a plant, a network or a pipeline is a
 * list, not a drawing. A screen reader hears each part, its reading and
 * state, and then the flows. With `onNodeSelect` every part is a button.
 */
const Schematic = ({
  nodes = [],
  links = [],
  viewBox: viewBoxProp,
  selected,
  onNodeSelect,
  "aria-label": ariaLabel,
  labels: labelsProp,
  minWidth = 560,
  className,
  style,
  ref,
  ...rest
}: SchematicProps) => {
  const labels = useMemo(() => mergeLabels(defaultLabels, labelsProp), [labelsProp]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const viewBox = useMemo(() => {
    if (viewBoxProp) return viewBoxProp;
    if (nodes.length === 0) return [0, 0, 100, 100] as const;
    let x0 = Number.POSITIVE_INFINITY;
    let y0 = Number.POSITIVE_INFINITY;
    let x1 = Number.NEGATIVE_INFINITY;
    let y1 = Number.NEGATIVE_INFINITY;
    for (const n of nodes) {
      const [w, h] = sizeOf(n);
      x0 = Math.min(x0, n.x - Math.max(w / 2, 48));
      x1 = Math.max(x1, n.x + Math.max(w / 2, 48));
      y0 = Math.min(y0, n.y - h / 2 - 16);
      // Room for the label, the reading and the state under the part.
      y1 = Math.max(y1, n.y + h / 2 + 52);
    }
    for (const l of links) {
      for (const [x, y] of l.via ?? []) {
        x0 = Math.min(x0, x - 8);
        x1 = Math.max(x1, x + 8);
        y0 = Math.min(y0, y - 24);
        y1 = Math.max(y1, y + 8);
      }
    }
    return [x0, y0, x1 - x0, y1 - y0] as const;
  }, [viewBoxProp, nodes, links]);

  const nodeText = (n: SchematicNode) =>
    [
      n.label,
      n.value,
      n.kind === "valve" ? (n.open === false ? labels.closed : labels.open) : undefined,
      n.kind === "pump" && (n.running === false || n.state === "off") ? labels.stopped : undefined,
      n.state && n.state !== "normal" ? labels.state[n.state] : undefined,
    ]
      .filter(Boolean)
      .join(", ");

  return (
    <div
      ref={ref}
      // It scrolls sideways when narrower than `minWidth`: without a part to
      // tab to, the box itself takes focus so the arrow keys can scroll it.
      tabIndex={onNodeSelect ? undefined : 0}
      className={classNames(styles.schematic, className)}
      style={{ "--schematic-min-width": `${minWidth}px`, ...style } as React.CSSProperties}
      {...rest}
    >
      {/* biome-ignore lint/a11y/useSemanticElements: an SVG drawing cannot be a fieldset. */}
      <svg
        viewBox={viewBox.join(" ")}
        className={styles.svg}
        role="group"
        aria-label={ariaLabel}
        focusable="false"
      >
        {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: lines hold nothing focusable; the list below says them. */}
        <g aria-hidden="true">
          {links.map((link, i) => {
            const a = byId.get(link.from);
            const b = byId.get(link.to);
            if (!a || !b) return null;
            const points: [number, number][] = [[a.x, a.y], ...(link.via ?? []), [b.x, b.y]];
            const d = points.map(([x, y], k) => `${k ? "L" : "M"}${x} ${y}`).join(" ");
            const flow = link.flow ?? 0;
            const run = longestRun(points);
            const angle = run.angle + (flow < 0 ? 180 : 0);
            return (
              <g
                key={link.id ?? `${link.from}-${link.to}-${i}`}
                className={styles.link}
                data-state={link.state ?? "normal"}
                data-flowing={flow !== 0 || undefined}
              >
                <path d={d} className={styles.pipe} />
                {flow !== 0 && (
                  <path
                    d={d}
                    className={styles.flow}
                    style={
                      {
                        "--flow-duration": `${1 / Math.abs(flow)}s`,
                        animationDirection: flow < 0 ? "reverse" : "normal",
                      } as React.CSSProperties
                    }
                  />
                )}
                {flow !== 0 && (
                  <path
                    d="M-6 -5 L6 0 L-6 5 Z"
                    className={styles.arrow}
                    transform={`translate(${run.at[0]} ${run.at[1]}) rotate(${angle})`}
                  />
                )}
                {link.label && (
                  <text
                    x={run.at[0]}
                    y={run.at[1] - 10}
                    textAnchor="middle"
                    className={styles.linkLabel}
                  >
                    {link.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
        {nodes.map((n) => {
          const [, h] = sizeOf(n);
          const state = n.state ?? "normal";
          const stopped = n.kind === "pump" && (n.running === false || state === "off");
          const interactive = !!onNodeSelect;
          const select = () => onNodeSelect?.(n.id);
          const status =
            n.kind === "valve"
              ? n.open === false
                ? labels.closed
                : labels.open
              : stopped && state === "normal"
                ? labels.stopped
                : state !== "normal"
                  ? labels.state[state]
                  : undefined;
          return (
            // biome-ignore lint/a11y/noStaticElementInteractions: an SVG group takes the button role here.
            // biome-ignore lint/a11y/useAriaPropsSupportedByRole: the role is button whenever aria-pressed is set.
            <g
              key={n.id}
              className={classNames(styles.node, interactive && styles.interactive)}
              data-kind={n.kind}
              data-state={state}
              data-selected={selected === n.id || undefined}
              data-stopped={stopped || undefined}
              role={interactive ? "button" : "img"}
              aria-label={nodeText(n)}
              aria-pressed={interactive ? selected === n.id : undefined}
              tabIndex={interactive ? 0 : undefined}
              onClick={interactive ? select : undefined}
              onKeyDown={
                interactive
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        select();
                      }
                    }
                  : undefined
              }
            >
              <g className={styles.symbol}>
                <PartSymbol node={n} />
                {state === "off" && (
                  <line
                    x1={n.x - sizeOf(n)[0] / 2}
                    y1={n.y + h / 2}
                    x2={n.x + sizeOf(n)[0] / 2}
                    y2={n.y - h / 2}
                    className={styles.strike}
                  />
                )}
              </g>
              <g className={styles.text}>
                {n.tag && (
                  <text
                    x={n.x}
                    y={n.kind === "sensor" ? n.y + 4 : n.y - h / 2 - 6}
                    textAnchor="middle"
                    className={styles.tag}
                  >
                    {n.tag}
                  </text>
                )}
                <text x={n.x} y={n.y + h / 2 + 16} textAnchor="middle" className={styles.label}>
                  {n.label}
                </text>
                {n.value && (
                  <text x={n.x} y={n.y + h / 2 + 32} textAnchor="middle" className={styles.value}>
                    {n.value}
                  </text>
                )}
                {status && (
                  <text
                    x={n.x}
                    y={n.y + h / 2 + (n.value ? 47 : 31)}
                    textAnchor="middle"
                    className={styles.status}
                  >
                    {status.toUpperCase()}
                  </text>
                )}
              </g>
            </g>
          );
        })}
      </svg>
      {links.length > 0 && (
        <VisuallyHidden as="div">
          <p>{labels.flowsHeading}</p>
          <ul>
            {links.map((link, i) => {
              const a = byId.get(link.from);
              const b = byId.get(link.to);
              if (!a || !b) return null;
              const [from, to] = (link.flow ?? 0) < 0 ? [b, a] : [a, b];
              return (
                <li key={link.id ?? `${link.from}-${link.to}-${i}`}>
                  {labels.flow(from.label, to.label, link)}
                </li>
              );
            })}
          </ul>
        </VisuallyHidden>
      )}
    </div>
  );
};

Schematic.displayName = "Schematic";

export type { SchematicProps };
export { Schematic };
