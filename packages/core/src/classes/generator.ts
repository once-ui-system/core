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

export interface GenerateClassesProps {
  padding?: SpacingToken | number;
  paddingLeft?: SpacingToken | number;
  paddingRight?: SpacingToken | number;
  paddingTop?: SpacingToken | number;
  paddingBottom?: SpacingToken | number;
  paddingX?: SpacingToken | number;
  paddingY?: SpacingToken | number;
  margin?: SpacingToken | number;
  marginLeft?: SpacingToken | number;
  marginRight?: SpacingToken | number;
  marginTop?: SpacingToken | number;
  marginBottom?: SpacingToken | number;
  marginX?: SpacingToken | number;
  marginY?: SpacingToken | number;
  gap?: SpacingToken | number | "-1";
  top?: SpacingToken | number | CSSUnit;
  right?: SpacingToken | number | CSSUnit;
  bottom?: SpacingToken | number | CSSUnit;
  left?: SpacingToken | number | CSSUnit;
  translateX?: SpacingToken | number | CSSUnit;
  translateY?: SpacingToken | number | CSSUnit;
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  flexHorizontal?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch";
  horizontal?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch";
  flexVertical?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch";
  vertical?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch";
  flexCenter?: boolean;
  center?: boolean;
  flexWrap?: boolean;
  wrap?: boolean;
  flex?: FlexValue;
  flexXl?: FlexBreakpointProps;
  xl?: FlexBreakpointProps;
  flexL?: FlexBreakpointProps;
  l?: FlexBreakpointProps;
  flexM?: FlexBreakpointProps;
  m?: FlexBreakpointProps;
  flexS?: FlexBreakpointProps;
  s?: FlexBreakpointProps;
  flexXs?: FlexBreakpointProps;
  xs?: FlexBreakpointProps;
  textVariant?: TextVariant;
  textWrap?: CSSProperties["textWrap"];
  textSize?: TextSize;
  textWeight?: TextWeight;
  textAlign?: CSSProperties["textAlign"];
  align?: CSSProperties["textAlign"];
  textType?: TextType;
  textFamily?: CSSProperties["fontFamily"];
  textTruncate?: boolean;
  truncate?: boolean;
  width?: number | SpacingToken | CSSUnit;
  height?: number | SpacingToken | CSSUnit;
  maxWidth?: number | SpacingToken | CSSUnit;
  maxHeight?: number | SpacingToken | CSSUnit;
  minWidth?: number | SpacingToken | CSSUnit;
  minHeight?: number | SpacingToken | CSSUnit;
  fit?: boolean;
  fitWidth?: boolean;
  fitHeight?: boolean;
  fill?: boolean;
  fillWidth?: boolean;
  fillHeight?: boolean;
  aspectRatio?: CSSProperties["aspectRatio"];
  background?: Colors | "surface" | "overlay" | "page" | "transparent";
  solid?: Colors;
  onBackground?: Colors;
  onSolid?: Colors;
  borderTop?: Colors | "surface" | "transparent" | boolean;
  borderBottom?: Colors | "surface" | "transparent" | boolean;
  borderRight?: Colors | "surface" | "transparent" | boolean;
  borderLeft?: Colors | "surface" | "transparent" | boolean;
  borderX?: Colors | "surface" | "transparent" | boolean;
  borderY?: Colors | "surface" | "transparent" | boolean;
  border?: Colors | "surface" | "transparent" | boolean;
  borderStyle?: "solid" | "dashed";
  borderWidth?: 1 | 2 | 4 | 8 | "1" | "2" | "4" | "8";
  topRadius?: RadiusSize;
  rightRadius?: RadiusSize;
  bottomRadius?: RadiusSize;
  leftRadius?: RadiusSize;
  topLeftRadius?: RadiusSize;
  topRightRadius?: RadiusSize;
  bottomLeftRadius?: RadiusSize;
  bottomRightRadius?: RadiusSize;
  radius?: RadiusSize | `${RadiusSize}-${RadiusNest}`;
  shadow?: ShadowSize;
  inline?: boolean;
  hide?: boolean;
  pointerEvents?: "none" | "all" | "auto";
  position?: CSSProperties["position"];
  overflow?: CSSProperties["overflow"];
  overflowX?: CSSProperties["overflowX"];
  overflowY?: CSSProperties["overflowY"];
  scrollbar?: "default" | "minimal";
  transition?:
    | "micro-short"
    | "micro-medium"
    | "micro-long"
    | "macro-short"
    | "macro-medium"
    | "macro-long";
  opacity?: Opacity;
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
    | "10";
  cursor?: CSSProperties["cursor"] | "interactive";
  dark?: boolean;
  light?: boolean;
  className?: string;
}

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

const formatTranslate = (
  prefix: "translate-x" | "translate-y",
  val?: number | SpacingToken | CSSUnit,
): string | undefined => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === "number") return `${prefix}-[${val}rem]`;
  if (typeof val === "string") {
    if (
      val.endsWith("%") ||
      val.endsWith("vh") ||
      val.endsWith("dvh") ||
      val.endsWith("vw") ||
      val.endsWith("px") ||
      val.endsWith("rem") ||
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

export function generateClasses(props: GenerateClassesProps): string;
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
): string;
export function generateClasses(...args: unknown[]): string {
  let p: GenerateClassesProps;
  const a = args as any[];

  if (a.length === 1 && typeof a[0] === "object" && a[0] !== null) {
    p = a[0] as GenerateClassesProps;
  } else {
    p = {
      padding: a[0],
      paddingLeft: a[1],
      paddingRight: a[2],
      paddingTop: a[3],
      paddingBottom: a[4],
      paddingX: a[5],
      paddingY: a[6],
      margin: a[7],
      marginLeft: a[8],
      marginRight: a[9],
      marginTop: a[10],
      marginBottom: a[11],
      marginX: a[12],
      marginY: a[13],
      gap: a[14],
      top: a[15],
      right: a[16],
      bottom: a[17],
      left: a[18],
      translateX: a[19],
      translateY: a[20],
      flexDirection: a[21],
      flexHorizontal: a[22],
      flexVertical: a[23],
      flexCenter: a[24],
      flexWrap: a[25],
      flex: a[26],
      flexXl: a[27],
      flexL: a[28],
      flexM: a[29],
      flexS: a[30],
      flexXs: a[31],
      textVariant: a[32],
      textWrap: a[33],
      textSize: a[34],
      textWeight: a[35],
      textAlign: a[36],
      textType: a[37],
      textFamily: a[38],
      textTruncate: a[39],
      width: a[40],
      height: a[41],
      maxWidth: a[42],
      maxHeight: a[43],
      fit: a[44],
      fitWidth: a[45],
      fitHeight: a[46],
      fill: a[47],
      fillWidth: a[48],
      fillHeight: a[49],
      aspectRatio: a[50],
      background: a[51],
      solid: a[52],
      borderTop: a[53],
      borderBottom: a[54],
      borderRight: a[55],
      borderLeft: a[56],
      borderX: a[57],
      borderY: a[58],
      border: a[59],
      borderStyle: a[60],
      borderWidth: a[61],
      topRadius: a[62],
      rightRadius: a[63],
      bottomRadius: a[64],
      leftRadius: a[65],
      topLeftRadius: a[66],
      topRightRadius: a[67],
      bottomLeftRadius: a[68],
      bottomRightRadius: a[69],
      radius: a[70],
      shadow: a[71],
      inline: a[72],
      hide: a[73],
      pointerEvents: a[74],
      position: a[75],
      overflow: a[76],
      overflowX: a[77],
      overflowY: a[78],
      scrollbar: a[79],
      transition: a[80],
      opacity: a[81],
      zIndex: a[82],
      dark: a[83],
      light: a[84],
    };
  }

  const direction = p.direction ?? p.flexDirection;
  const horizontal = p.horizontal ?? p.flexHorizontal;
  const vertical = p.vertical ?? p.flexVertical;
  const center = p.center ?? p.flexCenter;
  const wrap = p.wrap ?? p.flexWrap;
  const xl = p.xl ?? p.flexXl;
  const l = p.l ?? p.flexL;
  const m = p.m ?? p.flexM;
  const s = p.s ?? p.flexS;
  const xs = p.xs ?? p.flexXs;
  const align = p.align ?? p.textAlign;
  const truncate = p.truncate ?? p.textTruncate;

  const [hAlign, vAlign] = getFlexAlignment(direction, horizontal, vertical);

  const hasAnyBorder =
    Boolean(p.border) ||
    Boolean(p.borderTop) ||
    Boolean(p.borderBottom) ||
    Boolean(p.borderLeft) ||
    Boolean(p.borderRight) ||
    Boolean(p.borderX) ||
    Boolean(p.borderY);

  let onColorClass: string | undefined;
  if (p.onBackground) {
    onColorClass = getColorClass("text", p.onBackground);
  } else if (p.onSolid) {
    const parts = p.onSolid.split("-");
    if (parts.length === 2) {
      onColorClass = `text-${parts[0]}-on-solid-${parts[1]}`;
    }
  }

  return cn(
    // Display & Position
    p.inline ? "inline-flex" : "flex",
    p.position && `${p.position}`,
    p.hide && "hidden",

    // Direction
    direction === "row" && "flex-row",
    direction === "column" && "flex-col",
    direction === "row-reverse" && "flex-row-reverse",
    direction === "column-reverse" && "flex-col-reverse",

    // Alignment
    center && "justify-center items-center",
    !center && hAlign,
    !center && vAlign,
    wrap && "flex-wrap",
    p.flex !== undefined && `flex-${p.flex}`,

    // Spacing
    formatSpacing("p", p.padding),
    formatSpacing("pl", p.paddingLeft),
    formatSpacing("pr", p.paddingRight),
    formatSpacing("pt", p.paddingTop),
    formatSpacing("pb", p.paddingBottom),
    formatSpacing("px", p.paddingX),
    formatSpacing("py", p.paddingY),
    formatSpacing("m", p.margin),
    formatSpacing("ml", p.marginLeft),
    formatSpacing("mr", p.marginRight),
    formatSpacing("mt", p.marginTop),
    formatSpacing("mb", p.marginBottom),
    formatSpacing("mx", p.marginX),
    formatSpacing("my", p.marginY),
    p.gap === "-1" ? "gap-[-1px]" : formatSpacing("gap", p.gap),

    // Positioning Offsets
    formatDimension("top", p.top),
    p.position === "sticky" && p.top === undefined && "top-0",
    formatDimension("right", p.right),
    formatDimension("bottom", p.bottom),
    formatDimension("left", p.left),
    p.translateX !== undefined && formatTranslate("translate-x", p.translateX),
    p.translateY !== undefined && formatTranslate("translate-y", p.translateY),

    // Sizing
    formatDimension("w", p.width),
    formatDimension("h", p.height),
    formatDimension("max-w", p.maxWidth),
    formatDimension("max-h", p.maxHeight),
    formatDimension("min-w", p.minWidth),
    formatDimension("min-h", p.minHeight),
    p.fit && "w-fit h-fit",
    p.fitWidth && "w-fit",
    p.fitHeight && "h-fit",
    p.fill && "w-full h-full min-w-0 min-h-0",
    p.fillWidth && "w-full min-w-0",
    p.fillHeight && "h-full min-h-0",
    p.aspectRatio && `aspect-[${p.aspectRatio}]`,

    // Colors & Surface
    getColorClass("bg", p.background),
    getSolidClasses(p.solid),
    onColorClass,

    // Borders
    hasAnyBorder && "border-solid",
    p.border &&
      (p.border === true
        ? "border border-neutral-border-medium"
        : `border ${getColorClass("border", p.border)}`),
    p.borderTop &&
      (p.borderTop === true
        ? "border-t border-neutral-border-medium"
        : `border-t ${getColorClass("border", p.borderTop)}`),
    p.borderBottom &&
      (p.borderBottom === true
        ? "border-b border-neutral-border-medium"
        : `border-b ${getColorClass("border", p.borderBottom)}`),
    p.borderLeft &&
      (p.borderLeft === true
        ? "border-l border-neutral-border-medium"
        : `border-l ${getColorClass("border", p.borderLeft)}`),
    p.borderRight &&
      (p.borderRight === true
        ? "border-r border-neutral-border-medium"
        : `border-r ${getColorClass("border", p.borderRight)}`),
    p.borderX &&
      (p.borderX === true
        ? "border-x border-neutral-border-medium"
        : `border-x ${getColorClass("border", p.borderX)}`),
    p.borderY &&
      (p.borderY === true
        ? "border-y border-neutral-border-medium"
        : `border-y ${getColorClass("border", p.borderY)}`),
    p.borderStyle && `border-${p.borderStyle}`,
    p.borderWidth && `border-[${p.borderWidth}px]`,

    // Radii
    formatRadius("rounded", p.radius),
    formatRadius("rounded-t", p.topRadius),
    formatRadius("rounded-r", p.rightRadius),
    formatRadius("rounded-b", p.bottomRadius),
    formatRadius("rounded-l", p.leftRadius),
    formatRadius("rounded-tl", p.topLeftRadius),
    formatRadius("rounded-tr", p.topRightRadius),
    formatRadius("rounded-bl", p.bottomLeftRadius),
    formatRadius("rounded-br", p.bottomRightRadius),

    // Typography
    ...getVariantClasses(p.textVariant),
    p.textSize && `text-${p.textSize}`,
    getTextWeightClass(p.textWeight),
    align && `text-${align}`,
    p.textWrap && `text-${p.textWrap}`,
    p.textType && `font-${p.textType}`,
    p.textFamily && `font-[${p.textFamily}]`,
    truncate && "truncate",

    // Effects & Layout
    p.shadow && `shadow-${p.shadow}`,
    p.transition && `transition-${p.transition}`,
    p.opacity !== undefined && `opacity-${p.opacity}`,
    p.pointerEvents && `pointer-events-${p.pointerEvents}`,
    p.overflow && `overflow-${p.overflow}`,
    p.overflowX && `overflow-x-${p.overflowX}`,
    p.overflowY && `overflow-y-${p.overflowY}`,
    p.scrollbar && `scrollbar-${p.scrollbar}`,
    p.zIndex !== undefined && `z-index-${p.zIndex}`,
    p.cursor && `cursor-${p.cursor}`,
    p.dark && "dark-flex",
    p.light && "light-flex",

    // Responsive Breakpoint Props
    ...getBreakpointClasses("xl", xl),
    ...getBreakpointClasses("l", l),
    ...getBreakpointClasses("m", m),
    ...getBreakpointClasses("s", s),
    ...getBreakpointClasses("xs", xs),

    p.className,
  );
}
