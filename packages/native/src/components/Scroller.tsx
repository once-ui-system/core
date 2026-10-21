import { type ComponentRef, forwardRef, type ReactNode, useState } from "react";
import { RefreshControl, ScrollView, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { type FlexProps, flexStyle, wrapText } from "./Flex";
import type { RefComponent, Writable } from "./refs";

export type ScrollerRef = ComponentRef<typeof ScrollView>;

export interface ScrollerProps extends Omit<FlexProps, "overflow"> {
  children?: ReactNode;
  /** The scroll axis, as core's `Scroller`: `"row"` by default, `"column"` for a screen. */
  direction?: "row" | "column";
  /**
   * Pull to refresh, on a `"column"` scroller. When it returns a promise the
   * spinner shows until it settles; pass `refreshing` to drive it yourself.
   */
  onRefresh?: () => unknown;
  refreshing?: boolean;
  /** Shows the scroll bar. Off by default, as core hides it. */
  showScrollbar?: boolean;
}

// These size and place the scroll view itself; every other Flex prop styles the content.
const OUTER: (keyof ViewStyle)[] = [
  "flex",
  "flexGrow",
  "flexShrink",
  "alignSelf",
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "minHeight",
  "maxHeight",
  "margin",
  "marginHorizontal",
  "marginVertical",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "backgroundColor",
  "borderColor",
  "borderWidth",
  "borderStyle",
  "borderRadius",
  "overflow",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "zIndex",
  "opacity",
  "boxShadow",
  "shadowColor",
  "shadowOffset",
  "shadowOpacity",
  "shadowRadius",
  "elevation",
  "aspectRatio",
];

/**
 * Core's `Scroller` as a `ScrollView`: Flex props lay out the content (`gap`,
 * `padding`, `safeArea` for the home indicator), size props size the view.
 * A `"column"` scroller takes `onRefresh` for pull to refresh, tinted from
 * the theme.
 */
export const Scroller: RefComponent<ScrollerProps, ScrollerRef> = forwardRef<
  ScrollerRef,
  ScrollerProps
>(function Scroller(
  {
    direction = "row",
    onRefresh,
    refreshing: refreshingProp,
    showScrollbar = false,
    children,
    ...props
  },
  ref,
) {
  const theme = useTheme();
  const [pending, setPending] = useState(false);
  const { style, rest, userStyle, hidden } = flexStyle(theme, { direction, ...props });
  if (hidden) return null;

  const outer: Writable<ViewStyle> = {};
  const content: Writable<ViewStyle> = {};
  for (const [key, value] of Object.entries(style)) {
    if (OUTER.includes(key as keyof ViewStyle)) (outer as Record<string, unknown>)[key] = value;
    else (content as Record<string, unknown>)[key] = value;
  }
  // A full-height column fills the view, so `vertical="center"` and empty states can center.
  if (direction === "column") content.flexGrow = 1;

  const horizontal = direction === "row";
  const refresh = () => {
    const result = onRefresh?.();
    if (refreshingProp === undefined && result instanceof Promise) {
      setPending(true);
      result.finally(() => setPending(false));
    }
  };

  return (
    <ScrollView
      ref={ref}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={horizontal && showScrollbar}
      showsVerticalScrollIndicator={!horizontal && showScrollbar}
      refreshControl={
        onRefresh && !horizontal ? (
          <RefreshControl
            refreshing={refreshingProp ?? pending}
            onRefresh={refresh}
            tintColor={theme.color("neutral-on-background-weak")}
            colors={[theme.color("brand-solid-strong")]}
            progressBackgroundColor={theme.color("surface-background")}
          />
        ) : undefined
      }
      {...rest}
      style={[outer, userStyle]}
      contentContainerStyle={content}
    >
      {wrapText(children)}
    </ScrollView>
  );
});
