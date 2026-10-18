import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { ColorScheme, CondensedTShirtSizes } from "../types";
import { Row } from "./Flex";
import { type IconSlot, renderIcon } from "./Icon";
import { Text } from "./Text";

export interface TagProps {
  scheme?: Exclude<ColorScheme, "accent"> | "accent";
  size?: CondensedTShirtSizes;
  label?: string;
  /** Icon names as in core, or any elements. */
  prefixIcon?: IconSlot;
  suffixIcon?: IconSlot;
  children?: ReactNode;
  style?: ViewStyle;
}

const PADDING = {
  s: { x: "8", y: "1" },
  m: { x: "8", y: "2" },
  l: { x: "12", y: "4" },
} as const;

/** Core's `Tag`: a small label on a weak tint of its scheme. */
export function Tag({
  scheme = "neutral",
  size = "m",
  label,
  prefixIcon,
  suffixIcon,
  children,
  style,
}: TagProps) {
  const color = useTheme().onBackground(`${scheme}-medium`);
  return (
    <Row
      gap="4"
      vertical="center"
      radius="s"
      background={`${scheme}-weak`}
      border={`${scheme}-alpha-medium`}
      paddingX={PADDING[size].x}
      paddingY={PADDING[size].y}
      style={[{ alignSelf: "flex-start" }, style ?? {}]}
    >
      {renderIcon(prefixIcon, "xs", color)}
      <Text variant="label-default-s" onBackground={`${scheme}-medium`} numberOfLines={1}>
        {label || children}
      </Text>
      {renderIcon(suffixIcon, "xs", color)}
    </Row>
  );
}
