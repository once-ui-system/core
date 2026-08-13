import type { CSSProperties } from "react";
import type { FlexBreakpointProps, GridBreakpointProps, TextBreakpointProps } from "../interfaces";
import type {
  Colors,
  CSSUnit,
  FlexValue,
  GridSize,
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
  display?: "flex" | "grid";
  columns?: GridSize;
  rows?: GridSize;
  gridColumns?: GridSize;
  gridRows?: GridSize;
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
  flexXl?: FlexBreakpointProps | GridBreakpointProps;
  gridXl?: GridBreakpointProps;
  xl?: FlexBreakpointProps | GridBreakpointProps | TextBreakpointProps;
  flexL?: FlexBreakpointProps | GridBreakpointProps;
  gridL?: GridBreakpointProps;
  l?: FlexBreakpointProps | GridBreakpointProps | TextBreakpointProps;
  flexM?: FlexBreakpointProps | GridBreakpointProps;
  gridM?: GridBreakpointProps;
  m?: FlexBreakpointProps | GridBreakpointProps | TextBreakpointProps;
  flexS?: FlexBreakpointProps | GridBreakpointProps;
  gridS?: GridBreakpointProps;
  s?: FlexBreakpointProps | GridBreakpointProps | TextBreakpointProps;
  flexXs?: FlexBreakpointProps | GridBreakpointProps;
  gridXs?: GridBreakpointProps;
  xs?: FlexBreakpointProps | GridBreakpointProps | TextBreakpointProps;
  variant?: TextVariant;
  textVariant?: TextVariant;
  textWrap?: CSSProperties["textWrap"];
  textSize?: TextSize;
  size?: TextSize;
  textWeight?: TextWeight;
  weight?: TextWeight;
  textAlign?: CSSProperties["textAlign"];
  align?: CSSProperties["textAlign"];
  textType?: TextType;
  family?: TextType;
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
    if (type === "text") {
      return `${scheme}-on-background-${weight} text-${scheme}-on-background-${weight}`;
    }
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
  const weightClass = weight ? `font-${weight}` : "";
  const sizeClass = size ? `font-${size}` : "";

  return [fontClass, weightClass, sizeClass].filter(Boolean);
};

const getTextWeightClass = (weight?: TextWeight): string | undefined => {
  if (!weight) return undefined;
  return `font-${weight}`;
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

const formatGridSize = (prefix: "grid-cols" | "grid-rows", val?: GridSize): string | undefined => {
  if (val === undefined || val === null) return undefined;
  return `${prefix}-${val}`;
};

const getBreakpointClasses = (
  prefix: string,
  bp?: FlexBreakpointProps | GridBreakpointProps | TextBreakpointProps,
  isGrid = false,
): string[] => {
  if (!bp) return [];
  const b = bp as Record<string, any>;
  const classes: (string | undefined)[] = [];

  if (b.hide === true) classes.push("hidden");
  if (b.hide === false) classes.push(isGrid ? "grid" : "flex");
  if (b.position) classes.push(`${b.position}`);

  // Grid-specific
  if (b.columns !== undefined) {
    classes.push(formatGridSize("grid-cols", b.columns));
  }
  if (b.rows !== undefined) {
    classes.push(formatGridSize("grid-rows", b.rows));
  }

  // Flex-specific
  if (b.direction) {
    if (b.direction === "row") classes.push("flex-row");
    if (b.direction === "column") classes.push("flex-col");
    if (b.direction === "row-reverse") classes.push("flex-row-reverse");
    if (b.direction === "column-reverse") classes.push("flex-col-reverse");
  }

  if (b.center) classes.push("justify-center", "items-center");
  if (b.wrap !== undefined) {
    if (typeof b.wrap === "boolean") {
      classes.push(b.wrap ? "flex-wrap" : "flex-nowrap");
    } else if (typeof b.wrap === "string") {
      classes.push(`text-${b.wrap}`);
    }
  }
  if (b.textWrap) classes.push(`text-${b.textWrap}`);
  if (b.flex !== undefined) classes.push(`flex-${b.flex}`);

  if (b.horizontal || b.vertical || b.direction) {
    const [hAlign, vAlign] = getFlexAlignment(b.direction, b.horizontal, b.vertical);
    if (hAlign) classes.push(hAlign);
    if (vAlign) classes.push(vAlign);
  }

  if (b.padding !== undefined) classes.push(formatSpacing("p", b.padding));
  if (b.paddingLeft !== undefined) classes.push(formatSpacing("pl", b.paddingLeft));
  if (b.paddingRight !== undefined) classes.push(formatSpacing("pr", b.paddingRight));
  if (b.paddingTop !== undefined) classes.push(formatSpacing("pt", b.paddingTop));
  if (b.paddingBottom !== undefined) classes.push(formatSpacing("pb", b.paddingBottom));
  if (b.paddingX !== undefined) classes.push(formatSpacing("px", b.paddingX));
  if (b.paddingY !== undefined) classes.push(formatSpacing("py", b.paddingY));

  if (b.margin !== undefined) classes.push(formatSpacing("m", b.margin));
  if (b.marginLeft !== undefined) classes.push(formatSpacing("ml", b.marginLeft));
  if (b.marginRight !== undefined) classes.push(formatSpacing("mr", b.marginRight));
  if (b.marginTop !== undefined) classes.push(formatSpacing("mt", b.marginTop));
  if (b.marginBottom !== undefined) classes.push(formatSpacing("mb", b.marginBottom));
  if (b.marginX !== undefined) classes.push(formatSpacing("mx", b.marginX));
  if (b.marginY !== undefined) classes.push(formatSpacing("my", b.marginY));

  if (b.gap !== undefined) {
    if (b.gap === "-1") {
      classes.push("gap-[-1px]");
    } else {
      classes.push(formatSpacing("gap", b.gap));
    }
  }

  if (b.top !== undefined) classes.push(formatDimension("top", b.top));
  if (b.right !== undefined) classes.push(formatDimension("right", b.right));
  if (b.bottom !== undefined) classes.push(formatDimension("bottom", b.bottom));
  if (b.left !== undefined) classes.push(formatDimension("left", b.left));

  if (b.width !== undefined) classes.push(formatDimension("w", b.width));
  if (b.height !== undefined) classes.push(formatDimension("h", b.height));
  if (b.maxWidth !== undefined) classes.push(formatDimension("max-w", b.maxWidth));
  if (b.maxHeight !== undefined) classes.push(formatDimension("max-h", b.maxHeight));

  if (b.fit) classes.push("w-fit", "h-fit");
  if (b.fitWidth) classes.push("w-fit");
  if (b.fitHeight) classes.push("h-fit");
  if (b.fill) classes.push("w-full", "h-full", "min-w-0", "min-h-0");
  if (b.fillWidth) classes.push("w-full", "min-w-0");
  if (b.fillHeight) classes.push("h-full", "min-h-0");

  if (b.background) classes.push(getColorClass("bg", b.background));
  if (b.solid) classes.push(getSolidClasses(b.solid));
  if (b.border) classes.push(getColorClass("border", b.border));
  if (b.radius) classes.push(formatRadius("rounded", b.radius));
  if (b.shadow) classes.push(`shadow-${b.shadow}`);
  if (b.opacity !== undefined) classes.push(`opacity-${b.opacity}`);
  if (b.overflow) classes.push(`overflow-${b.overflow}`);
  if (b.pointerEvents) classes.push(`pointer-events-${b.pointerEvents}`);

  // Typography props in breakpoints
  if (b.align) classes.push(`text-${b.align}`);
  if (b.textAlign) classes.push(`text-${b.textAlign}`);
  if (b.truncate || b.textTruncate) classes.push("truncate");
  if (b.variant) classes.push(...getVariantClasses(b.variant));
  if (b.textVariant) classes.push(...getVariantClasses(b.textVariant));
  if (b.size) classes.push(`font-${b.size}`);
  if (b.textSize) classes.push(`font-${b.textSize}`);
  if (b.weight) classes.push(getTextWeightClass(b.weight));
  if (b.textWeight) classes.push(getTextWeightClass(b.textWeight));
  if (b.family) classes.push(`font-family-${b.family}`);
  if (b.textType) classes.push(`font-${b.textType}`);
  if (b.onBackground) classes.push(getColorClass("text", b.onBackground));
  if (b.onSolid) classes.push(getSolidClasses(b.onSolid));

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

  const columns = p.columns ?? p.gridColumns;
  const rows = p.rows ?? p.gridRows;
  const direction = p.direction ?? p.flexDirection;
  const horizontal = p.horizontal ?? p.flexHorizontal;
  const vertical = p.vertical ?? p.flexVertical;
  const center = p.center ?? p.flexCenter;
  const wrap = p.wrap ?? p.flexWrap;
  const xl = p.xl ?? p.flexXl ?? p.gridXl;
  const l = p.l ?? p.flexL ?? p.gridL;
  const m = p.m ?? p.flexM ?? p.gridM;
  const s = p.s ?? p.flexS ?? p.gridS;
  const xs = p.xs ?? p.flexXs ?? p.gridXs;
  const align = p.align ?? p.textAlign;
  const truncate = p.truncate ?? p.textTruncate;

  const isGrid = p.display === "grid" || columns !== undefined || rows !== undefined;
  const isFlex =
    !isGrid &&
    (p.display === "flex" ||
      (p.display === undefined &&
        (direction !== undefined ||
          horizontal !== undefined ||
          vertical !== undefined ||
          center !== undefined ||
          (typeof wrap === "boolean" && wrap) ||
          p.flex !== undefined ||
          p.gap !== undefined ||
          a.length > 1)));

  let displayClass: string | undefined;
  if (isGrid) {
    displayClass = p.inline ? "inline-grid" : "grid";
  } else if (isFlex) {
    displayClass = p.inline ? "inline-flex" : "flex";
  } else if (p.display) {
    displayClass = p.inline ? `inline-${p.display}` : p.display;
  }

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
      onColorClass = `${parts[0]}-on-solid-${parts[1]} text-${parts[0]}-on-solid-${parts[1]}`;
    }
  }

  return cn(
    // Display & Position
    displayClass,
    p.position && `${p.position}`,
    p.hide && "hidden",

    // Grid columns & rows
    isGrid && formatGridSize("grid-cols", columns),
    isGrid && formatGridSize("grid-rows", rows),

    // Direction (flex only)
    !isGrid && direction === "row" && "flex-row",
    !isGrid && direction === "column" && "flex-col",
    !isGrid && direction === "row-reverse" && "flex-row-reverse",
    !isGrid && direction === "column-reverse" && "flex-col-reverse",

    // Alignment (flex only)
    !isGrid && center && "justify-center items-center",
    !isGrid && !center && hAlign,
    !isGrid && !center && vAlign,
    !isGrid && wrap && "flex-wrap",
    !isGrid && p.flex !== undefined && `flex-${p.flex}`,

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
    ...getVariantClasses(p.variant ?? p.textVariant),
    (p.size || p.textSize) && `font-${p.size ?? p.textSize}`,
    getTextWeightClass(p.weight ?? p.textWeight),
    align && `text-${align}`,
    p.textWrap && `text-${p.textWrap}`,
    (p.family || p.textType) && `font-family-${p.family ?? p.textType}`,
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
    p.dark && (isGrid ? "dark-grid" : "dark-flex"),
    p.light && (isGrid ? "light-grid" : "light-flex"),

    // Responsive Breakpoint Props
    ...getBreakpointClasses("xl", xl, isGrid),
    ...getBreakpointClasses("l", l, isGrid),
    ...getBreakpointClasses("m", m, isGrid),
    ...getBreakpointClasses("s", s, isGrid),
    ...getBreakpointClasses("xs", xs, isGrid),

    p.className,
  );
}
