import { Children, forwardRef } from "react";
import { View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { type FlexProps, flexStyle } from "./Flex";
import type { RefComponent, ViewRef } from "./refs";
import { Text } from "./Text";

export type BannerProps = FlexProps;

/**
 * Core's `Banner`: a full-width strip on the brand's solid colour, for a
 * notice above a screen. Text in it is `label-default-s`, centred, on-solid.
 */
export const Banner: RefComponent<BannerProps, ViewRef> = forwardRef<ViewRef, BannerProps>(
  function Banner({ children, ...props }, ref) {
    const theme = useTheme();
    const { style, rest, userStyle, hidden } = flexStyle(theme, {
      fillWidth: true,
      paddingX: "16",
      paddingY: "8",
      center: true,
      gap: "12",
      wrap: true,
      ...props,
    });
    if (hidden) return null;
    return (
      <View
        ref={ref}
        {...rest}
        style={[
          // Core's `solid="brand-medium"`, unless a `background` replaces it.
          props.background ? undefined : { backgroundColor: theme.color("brand-solid-medium") },
          style,
          userStyle,
        ]}
      >
        {Children.map(children, (child) =>
          typeof child === "string" || typeof child === "number" ? (
            <Text variant="label-default-s" onSolid="brand-strong" align="center">
              {child}
            </Text>
          ) : (
            child
          ),
        )}
      </View>
    );
  },
);
