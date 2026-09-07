import React from "react";

/** One node of an SVG tree: the shape react-icons emits, which the generator copies. */
export interface IconNode {
  tag: string;
  attr: Record<string, string | number | undefined>;
  child: IconNode[];
}

/**
 * What Once UI needs of an icon: a component that renders an SVG.
 *
 * Deliberately structural and vendor-neutral. Core used to type this as
 * react-icons' `IconType`, which put a specific library in the public API of
 * every consumer that registered an icon of their own — even though `Icon`
 * renders the component with no props at all and never needed more than this.
 * Any icon component satisfies it: react-icons, lucide, heroicons, or a
 * hand-written SVG.
 */
export type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const toElements = (nodes: IconNode[]): React.ReactNode =>
  nodes.map((node, i) =>
    React.createElement(node.tag, { key: i, ...node.attr }, toElements(node.child)),
  );

/**
 * Build a component from icon data, matching what react-icons rendered before
 * these were inlined: `currentColor` throughout, `1em` square so the icon
 * scales with font-size, and the icon's own attributes winning over the
 * defaults.
 */
export const createIcon = (data: IconNode): IconComponent => {
  const Icon: IconComponent = (props) =>
    React.createElement(
      "svg",
      {
        stroke: "currentColor",
        fill: "currentColor",
        strokeWidth: "0",
        ...data.attr,
        height: "1em",
        width: "1em",
        xmlns: "http://www.w3.org/2000/svg",
        ...props,
      },
      toElements(data.child),
    );
  return Icon;
};
