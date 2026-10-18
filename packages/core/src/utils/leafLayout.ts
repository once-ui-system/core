import type { CSSProperties } from "react";
import type { LeafProps } from "../interfaces.js";
import { isCSSUnit, offsetValue, spacingClass, withTokenLengths } from "./layoutClasses.js";
import { numericSpacingStyle } from "./spacingStyle.js";

const SIDES = ["top", "right", "bottom", "left"] as const;

/**
 * `LeafProps` as classes and inline style, for a leaf whose root is not a
 * `Flex` (Button, Text, Logo…): the classes `Flex` writes for the same props,
 * so a margin or an offset reads the same on either, and `position` inline.
 * `fillWidth` is left to each component, which already sizes its own root.
 */
export function leafLayout(props: Omit<LeafProps, "className" | "style" | "fillWidth">): {
  classes: (string | false | undefined)[];
  style: CSSProperties;
} {
  const { margin, marginTop, marginRight, marginBottom, marginLeft, marginX, marginY } = props;
  const { flex, position } = props;
  const offsets: Partial<Record<(typeof SIDES)[number], string>> = {};
  const offsetClasses: (string | false)[] = [];
  for (const side of SIDES) {
    const value = props[side];
    if (typeof value === "string" && !isCSSUnit(value)) offsetClasses.push(`${side}-${value}`);
    else {
      const inline = offsetValue(value);
      if (inline !== undefined) offsets[side] = inline;
    }
  }
  return {
    classes: [
      spacingClass("m", margin),
      spacingClass("mt", marginTop),
      spacingClass("mr", marginRight),
      spacingClass("mb", marginBottom),
      spacingClass("ml", marginLeft),
      spacingClass("mx", marginX),
      spacingClass("my", marginY),
      flex !== undefined && `flex-${flex}`,
      ...offsetClasses,
    ],
    style: withTokenLengths({
      ...numericSpacingStyle({
        margin,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        marginX,
        marginY,
      }),
      // Inline, not a class: a leaf's own stylesheet (Button's `position:
      // relative`) would tie with the utility class and could win.
      position,
      ...(position === "sticky" && props.top === undefined ? { top: 0 } : {}),
      ...offsets,
    }),
  };
}

/**
 * Split `LeafProps` (without `className`, `style` and `fillWidth`, which a
 * component reads itself) off the rest of a leaf's props.
 */
export function takeLeafProps<P extends LeafProps>(
  props: P,
): [Omit<LeafProps, "className" | "style" | "fillWidth">, OmitEach<P, LeafLayoutKey>] {
  const {
    margin,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    marginX,
    marginY,
    flex,
    position,
    top,
    right,
    bottom,
    left,
    ...rest
  } = props;
  return [
    {
      margin,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      marginX,
      marginY,
      flex,
      position,
      top,
      right,
      bottom,
      left,
    },
    rest as OmitEach<P, LeafLayoutKey>,
  ];
}

/** `Omit` on each member of a union, so a button-or-anchor props type stays one. */
type OmitEach<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type LeafLayoutKey =
  | "margin"
  | "marginTop"
  | "marginRight"
  | "marginBottom"
  | "marginLeft"
  | "marginX"
  | "marginY"
  | "flex"
  | "position"
  | "top"
  | "right"
  | "bottom"
  | "left";
