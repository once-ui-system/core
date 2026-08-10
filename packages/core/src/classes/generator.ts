import type { CSSProperties } from "react";
import type { FlexBreakpointProps } from "../interfaces";
import type {
  Colors,
  CSSUnit,
  FlexValue,
  Opacity,
  RadiusNest,
  RadiusSize,
  ShadowSize,
  SpacingToken,
  TextSize,
  TextType,
  TextVariant,
  TextWeight,
} from "../types";
import { cn } from "./utils";

const formatSpacing = (prefix: string, val?: SpacingToken | number): string | undefined => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === "number") return `${prefix}-[${val}px]`;
  return `${prefix}-${val}`;
};

const formatDimension = (
  prefix: string,
  val?: number | SpacingToken | CSSUnit,
): string | undefined => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === "number") return `${prefix}-[${val}px]`;
  if (typeof val === "string") {
    if (
      val.endsWith("%") ||
      val.endsWith("vh") ||
      val.endsWith("dvh") ||
      val.endsWith("vw") ||
      val.startsWith("calc(")
    ) {
      return `${prefix}-[${val}]`;
    }
    return `${prefix}-${val}`;
  }
  return undefined;
};

const getColorClass = (
  type: "bg" | "border" | "text",
  val?: Colors | "surface" | "overlay" | "page" | "transparent" | boolean | string,
): string | undefined => {
  if (!val) return undefined;
  if (val === true) {
    return type === "border" ? "border-neutral-border-medium" : undefined;
  }
  if (val === "transparent") return `${type}-transparent`;
  if (val === "surface") return type === "border" ? "border-surface-border" : `${type}-surface`;
  if (val === "page") return `${type}-page`;
  if (val === "overlay") return "bg-[var(--backdrop)]";

  const parts = val.split("-");
  if (parts.includes("alpha")) {
    const [scheme, , weight] = parts;
    return `${type}-${scheme}-alpha-${weight}`;
  }
  if (parts.length === 2) {
    const [scheme, weight] = parts;
    const cat = type === "bg" ? "background" : type === "border" ? "border" : "on-background";
    return `${type}-${scheme}-${cat}-${weight}`;
  }
  return `${type}-${val}`;
};

const getSolidClasses = (val?: Colors): string | undefined => {
  if (!val) return undefined;
  const parts = val.split("-");
  if (parts.includes("alpha")) {
    const [scheme, , weight] = parts;
    return `bg-${scheme}-alpha-${weight}`;
  }
  if (parts.length === 2) {
    const [scheme, weight] = parts;
    return `bg-${scheme}-solid-${weight} text-${scheme}-on-solid-${weight}`;
  }
  return `bg-${val}`;
};

const formatRadius = (
  prefix: string,
  val?: RadiusSize | `${RadiusSize}-${RadiusNest}` | string,
): string | undefined => {
  if (!val) return undefined;
  if (val === "full") return `${prefix}-full`;
  if (val === "none") return `${prefix}-none`;
  return `${prefix}-${val}`;
};

const getVariantClasses = (variant?: TextVariant): string[] => {
  if (!variant) return [];
  const parts = variant.split("-");
  const size = parts.pop();
  const weight = parts.pop();
  const fontType = parts.join("-");

  const fontClass = fontType ? `font-${fontType}` : "";
  const weightClass =
    weight === "strong" ? "font-bold" : weight === "medium" ? "font-medium" : "font-normal";
  const sizeClass = size ? `text-${size}` : "";

  return [fontClass, weightClass, sizeClass].filter(Boolean);
};

const getTextWeightClass = (weight?: TextWeight): string | undefined => {
  if (!weight) return undefined;
  switch (weight) {
    case "strong":
      return "font-bold";
    case "medium":
      return "font-medium";
    case "normal":
    case "default":
      return "font-normal";
    default:
      return `font-${weight}`;
  }
};

const getFlexAlignment = (
  dir: "row" | "column" | "row-reverse" | "column-reverse" | undefined,
  horizontal?: string,
  vertical?: string,
) => {
  const isRow = !dir || dir === "row" || dir === "row-reverse";

  const justifyMap: Record<string, string> = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    even: "justify-evenly",
    stretch: "justify-stretch",
  };

  const itemsMap: Record<string, string> = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    between: "items-baseline",
    around: "items-center",
    even: "items-center",
  };

  const hClass = horizontal ? (isRow ? justifyMap[horizontal] : itemsMap[horizontal]) : undefined;
  const vClass = vertical ? (isRow ? itemsMap[vertical] : justifyMap[vertical]) : undefined;

  return [hClass, vClass];
};

const getBreakpointClasses = (prefix: string, bp?: FlexBreakpointProps): string[] => {
  if (!bp) return [];
  const classes: (string | undefined)[] = [];

  if (bp.hide === true) classes.push("hidden");
  if (bp.hide === false) classes.push("flex");
  if (bp.position) classes.push(`${bp.position}`);

  if (bp.direction) {
    if (bp.direction === "row") classes.push("flex-row");
    if (bp.direction === "column") classes.push("flex-col");
    if (bp.direction === "row-reverse") classes.push("flex-row-reverse");
    if (bp.direction === "column-reverse") classes.push("flex-col-reverse");
  }

  if (bp.center) classes.push("justify-center", "items-center");
  if (bp.wrap !== undefined) classes.push(bp.wrap ? "flex-wrap" : "flex-nowrap");
  if (bp.flex !== undefined) classes.push(`flex-${bp.flex}`);

  const [hAlign, vAlign] = getFlexAlignment(bp.direction, bp.horizontal, bp.vertical);
  if (hAlign) classes.push(hAlign);
  if (vAlign) classes.push(vAlign);

  if (bp.padding !== undefined) classes.push(formatSpacing("p", bp.padding));
  if (bp.paddingLeft !== undefined) classes.push(formatSpacing("pl", bp.paddingLeft));
  if (bp.paddingRight !== undefined) classes.push(formatSpacing("pr", bp.paddingRight));
  if (bp.paddingTop !== undefined) classes.push(formatSpacing("pt", bp.paddingTop));
  if (bp.paddingBottom !== undefined) classes.push(formatSpacing("pb", bp.paddingBottom));
  if (bp.paddingX !== undefined) classes.push(formatSpacing("px", bp.paddingX));
  if (bp.paddingY !== undefined) classes.push(formatSpacing("py", bp.paddingY));

  if (bp.margin !== undefined) classes.push(formatSpacing("m", bp.margin));
  if (bp.marginLeft !== undefined) classes.push(formatSpacing("ml", bp.marginLeft));
  if (bp.marginRight !== undefined) classes.push(formatSpacing("mr", bp.marginRight));
  if (bp.marginTop !== undefined) classes.push(formatSpacing("mt", bp.marginTop));
  if (bp.marginBottom !== undefined) classes.push(formatSpacing("mb", bp.marginBottom));
  if (bp.marginX !== undefined) classes.push(formatSpacing("mx", bp.marginX));
  if (bp.marginY !== undefined) classes.push(formatSpacing("my", bp.marginY));

  if (bp.gap !== undefined) {
    if (bp.gap === "-1") {
      classes.push("gap-[-1px]");
    } else {
      classes.push(formatSpacing("gap", bp.gap));
    }
  }

  if (bp.top !== undefined) classes.push(formatDimension("top", bp.top));
  if (bp.right !== undefined) classes.push(formatDimension("right", bp.right));
  if (bp.bottom !== undefined) classes.push(formatDimension("bottom", bp.bottom));
  if (bp.left !== undefined) classes.push(formatDimension("left", bp.left));

  if (bp.width !== undefined) classes.push(formatDimension("w", bp.width));
  if (bp.height !== undefined) classes.push(formatDimension("h", bp.height));
  if (bp.maxWidth !== undefined) classes.push(formatDimension("max-w", bp.maxWidth));
  if (bp.maxHeight !== undefined) classes.push(formatDimension("max-h", bp.maxHeight));

  if (bp.fit) classes.push("w-fit", "h-fit");
  if (bp.fitWidth) classes.push("w-fit");
  if (bp.fitHeight) classes.push("h-fit");
  if (bp.fill) classes.push("w-full", "h-full", "min-w-0", "min-h-0");
  if (bp.fillWidth) classes.push("w-full", "min-w-0");
  if (bp.fillHeight) classes.push("h-full", "min-h-0");

  if (bp.background) classes.push(getColorClass("bg", bp.background));
  if (bp.solid) classes.push(getSolidClasses(bp.solid));
  if (bp.border) classes.push(getColorClass("border", bp.border));
  if (bp.radius) classes.push(formatRadius("rounded", bp.radius));
  if (bp.shadow) classes.push(`shadow-${bp.shadow}`);
  if (bp.opacity !== undefined) classes.push(`opacity-${bp.opacity}`);
  if (bp.overflow) classes.push(`overflow-${bp.overflow}`);
  if (bp.pointerEvents) classes.push(`pointer-events-${bp.pointerEvents}`);

  return classes.filter(Boolean).map((cls) => `${prefix}:${cls}`);
};

export function generateClasses(
  padding?: SpacingToken | number,
  paddingLeft?: SpacingToken | number,
  paddingRight?: SpacingToken | number,
  paddingTop?: SpacingToken | number,
  paddingBottom?: SpacingToken | number,
  paddingX?: SpacingToken | number,
  paddingY?: SpacingToken | number,
  margin?: SpacingToken | number,
  marginLeft?: SpacingToken | number,
  marginRight?: SpacingToken | number,
  marginTop?: SpacingToken | number,
  marginBottom?: SpacingToken | number,
  marginX?: SpacingToken | number,
  marginY?: SpacingToken | number,
  gap?: SpacingToken | number | "-1",
  top?: SpacingToken | number | CSSUnit,
  right?: SpacingToken | number | CSSUnit,
  bottom?: SpacingToken | number | CSSUnit,
  left?: SpacingToken | number | CSSUnit,
  translateX?: SpacingToken | number | CSSUnit,
  translateY?: SpacingToken | number | CSSUnit,
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse",
  flexHorizontal?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch",
  flexVertical?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch",
  flexCenter?: boolean,
  flexWrap?: boolean,
  flex?: FlexValue,
  flexXl?: FlexBreakpointProps,
  flexL?: FlexBreakpointProps,
  flexM?: FlexBreakpointProps,
  flexS?: FlexBreakpointProps,
  flexXs?: FlexBreakpointProps,
  textVariant?: TextVariant,
  textWrap?: CSSProperties["textWrap"],
  textSize?: TextSize,
  textWeight?: TextWeight,
  textAlign?: CSSProperties["textAlign"],
  textType?: TextType,
  textFamily?: CSSProperties["fontFamily"],
  textTruncate?: boolean,
  width?: number | SpacingToken | CSSUnit,
  height?: number | SpacingToken | CSSUnit,
  maxWidth?: number | SpacingToken | CSSUnit,
  maxHeight?: number | SpacingToken | CSSUnit,
  fit?: boolean,
  fitWidth?: boolean,
  fitHeight?: boolean,
  fill?: boolean,
  fillWidth?: boolean,
  fillHeight?: boolean,
  aspectRatio?: CSSProperties["aspectRatio"],
  background?: Colors | "surface" | "overlay" | "page" | "transparent",
  solid?: Colors,
  borderTop?: Colors | "surface" | "transparent" | boolean,
  borderBottom?: Colors | "surface" | "transparent" | boolean,
  borderRight?: Colors | "surface" | "transparent" | boolean,
  borderLeft?: Colors | "surface" | "transparent" | boolean,
  borderX?: Colors | "surface" | "transparent" | boolean,
  borderY?: Colors | "surface" | "transparent" | boolean,
  border?: Colors | "surface" | "transparent" | boolean,
  borderStyle?: "solid" | "dashed",
  borderWidth?: 1 | 2 | 4 | 8 | "1" | "2" | "4" | "8",
  topRadius?: RadiusSize,
  rightRadius?: RadiusSize,
  bottomRadius?: RadiusSize,
  leftRadius?: RadiusSize,
  topLeftRadius?: RadiusSize,
  topRightRadius?: RadiusSize,
  bottomLeftRadius?: RadiusSize,
  bottomRightRadius?: RadiusSize,
  radius?: RadiusSize | `${RadiusSize}-${RadiusNest}`,
  shadow?: ShadowSize,
  inline?: boolean,
  hide?: boolean,
  pointerEvents?: "none" | "all" | "auto",
  position?: CSSProperties["position"],
  overflow?: CSSProperties["overflow"],
  overflowX?: CSSProperties["overflowX"],
  overflowY?: CSSProperties["overflowY"],
  scrollbar?: "default" | "minimal",
  transition?:
    | "micro-short"
    | "micro-medium"
    | "micro-long"
    | "macro-short"
    | "macro-medium"
    | "macro-long",
  opacity?: Opacity,
  zIndex?:
    | -1
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | "-1"
    | "0"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10",
  dark?: boolean,
  light?: boolean,
): string {
  const [hAlign, vAlign] = getFlexAlignment(flexDirection, flexHorizontal, flexVertical);

  const hasAnyBorder =
    Boolean(border) ||
    Boolean(borderTop) ||
    Boolean(borderBottom) ||
    Boolean(borderLeft) ||
    Boolean(borderRight) ||
    Boolean(borderX) ||
    Boolean(borderY);

  return cn(
    // Display & Position
    inline ? "inline-flex" : "flex",
    position && `${position}`,
    hide && "hidden",

    // Direction
    flexDirection === "row" && "flex-row",
    flexDirection === "column" && "flex-col",
    flexDirection === "row-reverse" && "flex-row-reverse",
    flexDirection === "column-reverse" && "flex-col-reverse",

    // Alignment
    flexCenter && "justify-center items-center",
    !flexCenter && hAlign,
    !flexCenter && vAlign,
    flexWrap && "flex-wrap",
    flex !== undefined && `flex-${flex}`,

    // Spacing
    formatSpacing("p", padding),
    formatSpacing("pl", paddingLeft),
    formatSpacing("pr", paddingRight),
    formatSpacing("pt", paddingTop),
    formatSpacing("pb", paddingBottom),
    formatSpacing("px", paddingX),
    formatSpacing("py", paddingY),
    formatSpacing("m", margin),
    formatSpacing("ml", marginLeft),
    formatSpacing("mr", marginRight),
    formatSpacing("mt", marginTop),
    formatSpacing("mb", marginBottom),
    formatSpacing("mx", marginX),
    formatSpacing("my", marginY),
    gap === "-1" ? "gap-[-1px]" : formatSpacing("gap", gap),

    // Positioning Offsets
    formatDimension("top", top),
    position === "sticky" && top === undefined && "top-0",
    formatDimension("right", right),
    formatDimension("bottom", bottom),
    formatDimension("left", left),
    translateX !== undefined && formatDimension("translate-x", translateX),
    translateY !== undefined && formatDimension("translate-y", translateY),

    // Sizing
    formatDimension("w", width),
    formatDimension("h", height),
    formatDimension("max-w", maxWidth),
    formatDimension("max-h", maxHeight),
    fit && "w-fit h-fit",
    fitWidth && "w-fit",
    fitHeight && "h-fit",
    fill && "w-full h-full min-w-0 min-h-0",
    fillWidth && "w-full min-w-0",
    fillHeight && "h-full min-h-0",
    aspectRatio && `aspect-[${aspectRatio}]`,

    // Colors & Surface
    getColorClass("bg", background),
    getSolidClasses(solid),

    // Borders
    hasAnyBorder && "border-solid",
    border &&
      (border === true
        ? "border border-neutral-border-medium"
        : `border ${getColorClass("border", border)}`),
    borderTop &&
      (borderTop === true
        ? "border-t border-neutral-border-medium"
        : `border-t ${getColorClass("border", borderTop)}`),
    borderBottom &&
      (borderBottom === true
        ? "border-b border-neutral-border-medium"
        : `border-b ${getColorClass("border", borderBottom)}`),
    borderLeft &&
      (borderLeft === true
        ? "border-l border-neutral-border-medium"
        : `border-l ${getColorClass("border", borderLeft)}`),
    borderRight &&
      (borderRight === true
        ? "border-r border-neutral-border-medium"
        : `border-r ${getColorClass("border", borderRight)}`),
    borderX &&
      (borderX === true
        ? "border-x border-neutral-border-medium"
        : `border-x ${getColorClass("border", borderX)}`),
    borderY &&
      (borderY === true
        ? "border-y border-neutral-border-medium"
        : `border-y ${getColorClass("border", borderY)}`),
    borderStyle && `border-${borderStyle}`,
    borderWidth && `border-[${borderWidth}px]`,

    // Radii
    formatRadius("rounded", radius),
    formatRadius("rounded-t", topRadius),
    formatRadius("rounded-r", rightRadius),
    formatRadius("rounded-b", bottomRadius),
    formatRadius("rounded-l", leftRadius),
    formatRadius("rounded-tl", topLeftRadius),
    formatRadius("rounded-tr", topRightRadius),
    formatRadius("rounded-bl", bottomLeftRadius),
    formatRadius("rounded-br", bottomRightRadius),

    // Typography
    ...getVariantClasses(textVariant),
    textSize && `text-${textSize}`,
    getTextWeightClass(textWeight),
    textAlign && `text-${textAlign}`,
    textWrap && `text-${textWrap}`,
    textType && `font-${textType}`,
    textFamily && `font-[${textFamily}]`,
    textTruncate && "truncate",

    // Effects & Layout
    shadow && `shadow-${shadow}`,
    transition && `transition-all duration-${transition}`,
    opacity !== undefined && `opacity-${opacity}`,
    pointerEvents && `pointer-events-${pointerEvents}`,
    overflow && `overflow-${overflow}`,
    overflowX && `overflow-x-${overflowX}`,
    overflowY && `overflow-y-${overflowY}`,
    scrollbar && `scrollbar-${scrollbar}`,
    zIndex !== undefined &&
      (typeof zIndex === "number" && zIndex < 0 ? `z-[${zIndex}]` : `z-${zIndex}`),
    dark && "dark:flex",
    light && "light:flex",

    // Responsive Breakpoint Props
    ...getBreakpointClasses("xl", flexXl),
    ...getBreakpointClasses("l", flexL),
    ...getBreakpointClasses("m", flexM),
    ...getBreakpointClasses("s", flexS),
    ...getBreakpointClasses("xs", flexXs),
  );
}
