import type { ReactNode } from "react";
import { Pressable, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Row } from "./Flex";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

export interface BadgeProps {
  title?: string;
  icon?: IconName;
  /** A chevron after the title, for a badge that leads somewhere. */
  arrow?: boolean;
  children?: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

/** Core's `Badge`: a pill that announces something, often leading to it. */
export function Badge({ title, icon, arrow = false, children, onPress, style }: BadgeProps) {
  const theme = useTheme();
  const color = theme.onBackground("neutral-strong");
  const pill = (pressed: boolean) => (
    <Row
      gap="8"
      vertical="center"
      radius="full"
      paddingX="20"
      paddingY="12"
      background={pressed ? "neutral-medium" : "neutral-weak"}
      border="brand-alpha-medium"
      style={{ alignSelf: "flex-start" }}
    >
      {icon && <Icon name={icon} size="s" onBackground="brand-medium" />}
      {title && (
        <Text variant="label-default-s" style={{ color }}>
          {title}
        </Text>
      )}
      {children}
      {arrow && <Icon name="chevronRight" size="xs" color={color} />}
    </Row>
  );
  if (!onPress) return <Row style={style}>{pill(false)}</Row>;
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={[{ alignSelf: "flex-start" }, style]}
    >
      {({ pressed }) => pill(pressed)}
    </Pressable>
  );
}
