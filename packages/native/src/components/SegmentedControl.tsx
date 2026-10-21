import type { ReactNode } from "react";
import { Pressable, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Row } from "./Flex";
import { type IconSlot, renderIcon } from "./Icon";
import { Text } from "./Text";
import { touchSlop } from "./touch";
import { useControlledValue } from "./useControllable";

export interface SegmentedControlButton {
  value: string;
  label?: ReactNode;
  prefixIcon?: IconSlot;
  suffixIcon?: IconSlot;
  disabled?: boolean;
}

/** Core 3.0's name for one segment's props. */
export type ButtonOption = SegmentedControlButton;

export interface SegmentedControlProps {
  buttons: SegmentedControlButton[];
  /** The selected button's `value`, controlled. Leave it out to let the control keep its own. */
  value?: string;
  /** The button selected first when uncontrolled. Without it, the first one. */
  defaultValue?: string;
  /**
   * Called with the picked button's `value` on every pick, as core 3.0's
   * (2.x's `onChange`). There is no click event to pass on a touch screen.
   */
  onValueChange?: (value: string) => void;
  /** Disables every button. */
  disabled?: boolean;
  fillWidth?: boolean;
  /** Outlined buttons without the frame around them, as in core. */
  compact?: boolean;
  style?: ViewStyle;
}

/** Core's `SegmentedControl`: a row of toggle buttons where one is selected. */
export function SegmentedControl({
  buttons,
  onValueChange,
  value,
  defaultValue,
  disabled = false,
  fillWidth = true,
  compact = false,
  style,
}: SegmentedControlProps) {
  const theme = useTheme();
  const [selected, select] = useControlledValue<string>(
    value,
    defaultValue ?? buttons[0]?.value ?? "",
    onValueChange,
  );
  const height = theme.space("32");

  return (
    <Row
      accessibilityRole="tablist"
      gap="2"
      padding={compact ? undefined : "2"}
      radius="l"
      border={compact ? undefined : "neutral-alpha-weak"}
      style={[fillWidth ? { alignSelf: "stretch" } : { alignSelf: "flex-start" }, style ?? {}]}
    >
      {buttons.map((b) => {
        const on = b.value === selected;
        const off = disabled || b.disabled;
        const color = theme.color(
          off ? "neutral-on-background-weak" : "neutral-on-background-strong",
        );
        return (
          <Pressable
            key={b.value}
            accessibilityRole="tab"
            aria-selected={on}
            aria-disabled={off}
            disabled={off}
            onPress={() => select(b.value)}
            hitSlop={touchSlop(theme, height, Number.POSITIVE_INFINITY)}
            style={({ pressed }) => ({
              flex: fillWidth ? 1 : undefined,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.space("8"),
              height,
              paddingHorizontal: theme.space("12"),
              borderRadius: theme.radius("m"),
              borderWidth: 1,
              borderColor:
                on || pressed || compact ? theme.color("neutral-alpha-weak") : "transparent",
              backgroundColor: on
                ? theme.color("neutral-alpha-medium")
                : pressed
                  ? theme.color("neutral-alpha-weak")
                  : "transparent",
            })}
          >
            {renderIcon(b.prefixIcon, "s", color)}
            {b.label !== undefined && (
              <Text textVariant="label-strong-s" style={{ color }} numberOfLines={1}>
                {b.label}
              </Text>
            )}
            {renderIcon(b.suffixIcon, "s", color)}
          </Pressable>
        );
      })}
    </Row>
  );
}
