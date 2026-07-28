import { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";
import {
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
} from "./types";

export interface ResponsiveProps extends HTMLAttributes<HTMLDivElement> {
  top?: SpacingToken;
  right?: SpacingToken;
  bottom?: SpacingToken;
  left?: SpacingToken;
  hide?: boolean;
  position?: CSSProperties["position"];
  overflow?: CSSProperties["overflow"];
  overflowX?: CSSProperties["overflowX"];
  overflowY?: CSSProperties["overflowY"];
  aspectRatio?: CSSProperties["aspectRatio"];
  style?: CSSProperties;
}

export interface ResponsiveFlexProps extends ResponsiveProps {
  horizontal?: FlexProps["horizontal"];
  vertical?: FlexProps["vertical"];
  center?: boolean;
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
}

export interface ResponsiveGridProps extends ResponsiveProps {
  columns?: GridSize;
  rows?: GridSize;
}

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: GridSize;
  rows?: GridSize;
  l?: GridBreakpointProps;
  m?: GridBreakpointProps;
  s?: GridBreakpointProps;
}

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  horizontal?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch";
  vertical?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch";
  center?: boolean;
  wrap?: boolean;
  flex?: FlexValue;
  xl?: FlexBreakpointProps;
  l?: FlexBreakpointProps;
  m?: FlexBreakpointProps;
  s?: FlexBreakpointProps;
  xs?: FlexBreakpointProps;
}

export interface TextProps<T extends ElementType = "span"> extends HTMLAttributes<T> {
  as?: T;
  variant?: TextVariant;
  wrap?: CSSProperties["textWrap"];
  size?: TextSize;
  weight?: TextWeight;
  family?: TextType;
  truncate?: boolean;
}

export interface SizeProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | SpacingToken | CSSUnit;
  height?: number | SpacingToken | CSSUnit;
  maxWidth?: number | SpacingToken | CSSUnit;
  minWidth?: number | SpacingToken | CSSUnit;
  minHeight?: number | SpacingToken | CSSUnit;
  maxHeight?: number | SpacingToken | CSSUnit;
  fit?: boolean;
  fitWidth?: boolean;
  fitHeight?: boolean;
  fill?: boolean;
  fillWidth?: boolean;
  fillHeight?: boolean;
  aspectRatio?: CSSProperties["aspectRatio"];
}

export interface SpacingProps extends HTMLAttributes<HTMLDivElement> {
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
}

export interface StyleProps extends HTMLAttributes<HTMLDivElement> {
  textVariant?: TextVariant;
  textSize?: TextSize;
  textType?: TextType;
  textWeight?: TextWeight;
  background?: Colors | "surface" | "overlay" | "page" | "transparent";
  solid?: Colors;
  borderTop?: Colors | "surface" | "transparent" | boolean;
  borderRight?: Colors | "surface" | "transparent" | boolean;
  borderBottom?: Colors | "surface" | "transparent" | boolean;
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
  cursor?: CSSProperties["cursor"] | "interactive" | ReactNode;
}

export interface DisplayProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
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
  dark?: boolean;
  light?: boolean;
}

export interface CommonProps extends Omit<HTMLAttributes<HTMLDivElement>, "style"> {
  onBackground?: Colors;
  onSolid?: Colors;
  align?: CSSProperties["textAlign"];
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
}

// ============================================================================
// Generic Breakpoint Type System
// ============================================================================
// BreakpointProps<Source, Keys> picks specific keys from a source interface
// and makes them optional. This ensures each component's breakpoint type
// only includes props that component actually supports.
//
// Usage:
//   type FlexBreakpointProps = BreakpointProps<AllFlexProps, 'direction' | 'padding' | ...>;
//   type GridBreakpointProps = BreakpointProps<AllGridProps, 'columns' | 'padding' | ...>;
//   type TextBreakpointProps = BreakpointProps<AllTextProps, 'textVariant' | 'align' | ...>;
// ============================================================================

// Union of all prop interfaces available to Flex-derived components
type AllFlexProps = FlexProps & StyleProps & SpacingProps & SizeProps & CommonProps & DisplayProps;

// Union of all prop interfaces available to Grid-derived components
type AllGridProps = GridProps & StyleProps & SpacingProps & SizeProps & CommonProps & DisplayProps;

// Union of all prop interfaces available to Text-derived components
type AllTextProps = TextProps & CommonProps & SpacingProps & DisplayProps;

// Generic breakpoint type: picks Keys from Source and makes them optional
export type BreakpointProps<Source, Keys extends keyof Source> = {
  [K in Keys]?: Source[K];
};

// ============================================================================
// Flex Breakpoint Props
// Supports: layout, spacing, sizing, colors, typography, effects, position
// ============================================================================
export type FlexBreakpointProps = BreakpointProps<AllFlexProps,
  // Layout
  | 'direction' | 'horizontal' | 'vertical' | 'center' | 'wrap' | 'flex'
  // Spacing
  | 'padding' | 'paddingLeft' | 'paddingRight' | 'paddingTop' | 'paddingBottom'
  | 'paddingX' | 'paddingY' | 'margin' | 'marginLeft' | 'marginRight'
  | 'marginTop' | 'marginBottom' | 'marginX' | 'marginY' | 'gap'
  // Position offsets
  | 'top' | 'right' | 'bottom' | 'left'
  // Sizing
  | 'width' | 'height' | 'maxWidth' | 'minWidth' | 'minHeight' | 'maxHeight'
  | 'fit' | 'fitWidth' | 'fitHeight' | 'fill' | 'fillWidth' | 'fillHeight'
  | 'aspectRatio'
  // Colors
  | 'background' | 'solid' | 'border' | 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft'
  | 'borderX' | 'borderY' | 'borderStyle' | 'borderWidth' | 'radius' | 'shadow'
  | 'onBackground' | 'onSolid'
  // Typography
  | 'align' | 'textVariant' | 'textSize' | 'textWeight' | 'textType'
  // Effects / state
  | 'opacity' | 'zIndex' | 'pointerEvents' | 'transition' | 'scrollbar'
  | 'dark' | 'light'
  // Display / position
  | 'position' | 'hide' | 'overflow' | 'overflowX' | 'overflowY'
  // Escape hatch
  | 'style'
>;

// ============================================================================
// Grid Breakpoint Props
// Supports: grid-specific, spacing, sizing, colors, typography, effects, position
// Does NOT support: direction, horizontal, vertical, center, wrap, flex
// ============================================================================
export type GridBreakpointProps = BreakpointProps<AllGridProps,
  // Grid-specific
  | 'columns' | 'rows'
  // Spacing
  | 'padding' | 'paddingLeft' | 'paddingRight' | 'paddingTop' | 'paddingBottom'
  | 'paddingX' | 'paddingY' | 'margin' | 'marginLeft' | 'marginRight'
  | 'marginTop' | 'marginBottom' | 'marginX' | 'marginY' | 'gap'
  // Position offsets
  | 'top' | 'right' | 'bottom' | 'left'
  // Sizing
  | 'width' | 'height' | 'maxWidth' | 'minWidth' | 'minHeight' | 'maxHeight'
  | 'fit' | 'fitWidth' | 'fitHeight' | 'fill' | 'fillWidth' | 'fillHeight'
  | 'aspectRatio'
  // Colors
  | 'background' | 'solid' | 'border' | 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft'
  | 'borderX' | 'borderY' | 'borderStyle' | 'borderWidth' | 'radius' | 'shadow'
  | 'onBackground' | 'onSolid'
  // Typography
  | 'align' | 'textVariant' | 'textSize' | 'textWeight' | 'textType'
  // Effects / state
  | 'opacity' | 'zIndex' | 'pointerEvents' | 'transition' | 'scrollbar'
  | 'dark' | 'light'
  // Display / position
  | 'position' | 'hide' | 'overflow' | 'overflowX' | 'overflowY'
  // Escape hatch
  | 'style'
>;

// ============================================================================
// Text Breakpoint Props
// Supports: typography, spacing, display effects, position
// Does NOT support: layout (direction, horizontal, etc.), sizing, colors, border
// ============================================================================
export type TextBreakpointProps = BreakpointProps<AllTextProps,
  // Typography
  | 'variant' | 'size' | 'weight' | 'family' | 'align' | 'wrap'
  // Spacing
  | 'padding' | 'paddingLeft' | 'paddingRight' | 'paddingTop' | 'paddingBottom'
  | 'paddingX' | 'paddingY' | 'margin' | 'marginLeft' | 'marginRight'
  | 'marginTop' | 'marginBottom' | 'marginX' | 'marginY' | 'gap'
  // Position offsets
  | 'top' | 'right' | 'bottom' | 'left'
  // Effects / state
  | 'opacity' | 'zIndex' | 'pointerEvents' | 'transition' | 'scrollbar'
  | 'dark' | 'light'
  // Display / position
  | 'position' | 'hide' | 'overflow' | 'overflowX' | 'overflowY'
  // Escape hatch
  | 'style'
>;

// ============================================================================
// Button Breakpoint Props
// Supports: spacing, colors, typography, border/radius, effects
// Does NOT support: layout, sizing, overflow
// ============================================================================
export type ButtonBreakpointProps = BreakpointProps<SpacingProps & StyleProps & CommonProps & DisplayProps,
  // Spacing
  | 'padding' | 'paddingLeft' | 'paddingRight' | 'paddingTop' | 'paddingBottom'
  | 'paddingX' | 'paddingY' | 'margin' | 'marginLeft' | 'marginRight'
  | 'marginTop' | 'marginBottom' | 'marginX' | 'marginY' | 'gap'
  // Colors
  | 'background' | 'solid' | 'border' | 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft'
  | 'borderX' | 'borderY' | 'borderStyle' | 'borderWidth' | 'radius' | 'shadow'
  | 'onBackground' | 'onSolid'
  // Typography
  | 'align' | 'textVariant' | 'textSize' | 'textWeight' | 'textType'
  // Effects / state
  | 'opacity' | 'zIndex' | 'pointerEvents' | 'transition' | 'scrollbar'
  | 'dark' | 'light'
  // Escape hatch
  | 'style'
>;

// ============================================================================
// Input Breakpoint Props
// Supports: spacing, colors, border, typography, effects
// Does NOT support: layout, sizing, overflow
// ============================================================================
export type InputBreakpointProps = BreakpointProps<SpacingProps & StyleProps & CommonProps & DisplayProps,
  // Spacing
  | 'padding' | 'paddingLeft' | 'paddingRight' | 'paddingTop' | 'paddingBottom'
  | 'paddingX' | 'paddingY' | 'margin' | 'marginLeft' | 'marginRight'
  | 'marginTop' | 'marginBottom' | 'marginX' | 'marginY' | 'gap'
  // Colors
  | 'background' | 'solid' | 'border' | 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft'
  | 'borderX' | 'borderY' | 'borderStyle' | 'borderWidth' | 'radius' | 'shadow'
  | 'onBackground' | 'onSolid'
  // Typography
  | 'align' | 'textVariant' | 'textSize' | 'textWeight' | 'textType'
  // Effects / state
  | 'opacity' | 'zIndex' | 'pointerEvents' | 'transition' | 'scrollbar'
  | 'dark' | 'light'
  // Escape hatch
  | 'style'
>;

// ============================================================================
// Backward-compatible interfaces (deprecated, use types above)
// These are kept for existing code that references them by name.
// ============================================================================
export interface BaseBreakpointProps {
  position?: CSSProperties["position"];
  hide?: boolean;
}
