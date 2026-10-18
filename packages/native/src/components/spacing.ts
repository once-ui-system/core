import type { ViewStyle } from "react-native";
import type { OnceTheme } from "../theme/theme";
import type { SpacingToken } from "../types";
import type { Writable } from "./refs";

/** Core's `SpacingProps`, without the web-only offsets. Numbers are rem, as on the web. */
export interface SpacingProps {
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
  gap?: SpacingToken | number;
}

const SPACING_KEYS = [
  "padding",
  "paddingLeft",
  "paddingRight",
  "paddingTop",
  "paddingBottom",
  "paddingX",
  "paddingY",
  "margin",
  "marginLeft",
  "marginRight",
  "marginTop",
  "marginBottom",
  "marginX",
  "marginY",
  "gap",
] as const;

/** Splits the spacing props off a component's props. */
export function splitSpacing<T extends SpacingProps>(
  props: T,
): [SpacingProps, Omit<T, keyof SpacingProps>] {
  const spacing: SpacingProps = {};
  const rest = { ...props };
  for (const key of SPACING_KEYS) {
    if (key in rest) {
      spacing[key] = rest[key] as never;
      delete rest[key];
    }
  }
  return [spacing, rest];
}

/** Spacing props as a style; shared by every component that takes them. */
export function spacingStyle(theme: OnceTheme, p: SpacingProps): ViewStyle {
  const s = (v: SpacingToken | number | undefined) =>
    v === undefined ? undefined : theme.space(v);
  const style: Writable<ViewStyle> = {
    padding: s(p.padding),
    paddingHorizontal: s(p.paddingX),
    paddingVertical: s(p.paddingY),
    paddingLeft: s(p.paddingLeft),
    paddingRight: s(p.paddingRight),
    paddingTop: s(p.paddingTop),
    paddingBottom: s(p.paddingBottom),
    margin: s(p.margin),
    marginHorizontal: s(p.marginX),
    marginVertical: s(p.marginY),
    marginLeft: s(p.marginLeft),
    marginRight: s(p.marginRight),
    marginTop: s(p.marginTop),
    marginBottom: s(p.marginBottom),
    gap: s(p.gap),
  };
  for (const key of Object.keys(style) as (keyof typeof style)[]) {
    if (style[key] === undefined) delete style[key];
  }
  return style;
}
