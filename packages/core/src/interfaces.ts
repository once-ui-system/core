import { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";
import {
  Colors,
  flex,
  gridSize,
  opacity,
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
  columns?: gridSize;
  rows?: gridSize;
}

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: gridSize;
  rows?: gridSize;
  l?: ResponsiveGridProps;
  m?: ResponsiveGridProps;
  s?: ResponsiveGridProps;
}

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  horizontal?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch";
  vertical?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch";
  center?: boolean;
  wrap?: boolean;
  flex?: flex;
  xl?: ResponsiveFlexProps;
  l?: ResponsiveFlexProps;
  m?: ResponsiveFlexProps;
  s?: ResponsiveFlexProps;
  xs?: ResponsiveFlexProps;
}

export interface TextProps<T extends ElementType = "span"> extends HTMLAttributes<T> {
  as?: T;
  variant?: TextVariant;
  wrap?: CSSProperties["textWrap"];
  size?: TextSize;
  weight?: TextWeight;
  truncate?: boolean;
}

export interface SizeProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | SpacingToken;
  height?: number | SpacingToken;
  maxWidth?: number | SpacingToken;
  minWidth?: number | SpacingToken;
  minHeight?: number | SpacingToken;
  maxHeight?: number | SpacingToken;
  fit?: boolean;
  fitWidth?: boolean;
  fitHeight?: boolean;
  fill?: boolean;
  fillWidth?: boolean;
  fillHeight?: boolean;
  aspectRatio?: CSSProperties["aspectRatio"];
}

export interface SpacingProps extends HTMLAttributes<HTMLDivElement> {
  padding?: SpacingToken;
  paddingLeft?: SpacingToken;
  paddingRight?: SpacingToken;
  paddingTop?: SpacingToken;
  paddingBottom?: SpacingToken;
  paddingX?: SpacingToken;
  paddingY?: SpacingToken;
  margin?: SpacingToken;
  marginLeft?: SpacingToken;
  marginRight?: SpacingToken;
  marginTop?: SpacingToken;
  marginBottom?: SpacingToken;
  marginX?: SpacingToken;
  marginY?: SpacingToken;
  gap?: SpacingToken | "-1";
  top?: SpacingToken;
  right?: SpacingToken;
  bottom?: SpacingToken;
  left?: SpacingToken;
}

export interface StyleProps extends HTMLAttributes<HTMLDivElement> {
  textVariant?: TextVariant;
  textSize?: TextSize;
  textType?: TextType;
  textWeight?: TextWeight;
  background?:
    | Colors
    | "surface"
    | "overlay"
    | "page"
    | "transparent";
  solid?: Colors;
  borderTop?:
    | Colors
    | "surface"
    | "transparent";
  borderRight?:
    | Colors
    | "surface"
    | "transparent";
  borderBottom?:
    | Colors
    | "surface"
    | "transparent";
  borderLeft?:
    | Colors
    | "surface"
    | "transparent";
  borderX?:
    | Colors
    | "surface"
    | "transparent";
  borderY?:
    | Colors
    | "surface"
    | "transparent";
  border?:
    | Colors
    | "surface"
    | "transparent";
  borderStyle?: "solid" | "dashed";
  borderWidth?: 1 | 2 | 4 | 6 | 8;
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
  opacity?: opacity;
  zIndex?: -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  dark?: boolean;
  light?: boolean;
}

export interface CommonProps extends HTMLAttributes<HTMLDivElement> {
  onBackground?: Colors;
  onSolid?: Colors;
  align?: CSSProperties["textAlign"];
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
}
