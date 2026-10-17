import type { ReactNode } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { InteractiveDetails } from "./InteractiveDetails";
import { useControllable } from "./useControllable";

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onToggle?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  style?: ViewStyle;
}

/** Core's `Checkbox`: a 20pt box, brand-filled with a check (or a dash when indeterminate). */
export function Checkbox({
  checked,
  defaultChecked = false,
  indeterminate = false,
  onToggle,
  label,
  description,
  disabled = false,
  ariaLabel = "Checkbox",
  style,
}: CheckboxProps) {
  const theme = useTheme();
  const [on, toggle] = useControllable(checked, defaultChecked, onToggle);
  const filled = on || indeterminate;
  const box = theme.space("20");
  const mark = theme.color("brand-on-solid-strong");

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={typeof label === "string" ? label : ariaLabel}
      aria-checked={indeterminate ? "mixed" : on}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={toggle}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: theme.space("16"),
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <View
        style={{
          width: box,
          height: box,
          borderRadius: Math.min(theme.space("4"), theme.radius("xs")),
          borderWidth: 1,
          borderColor: theme.color(
            filled ? "solid-border-color-brand" : "solid-border-color-neutral",
          ),
          backgroundColor: theme.color(filled ? "brand-solid-medium" : "surface-background"),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {indeterminate ? (
          <View
            style={{ width: theme.space("12"), height: theme.space("2"), backgroundColor: mark }}
          />
        ) : on ? (
          // A check drawn as two borders of a rotated box, so the preview needs no icon set.
          <View
            style={{
              width: box * 0.3,
              height: box * 0.55,
              marginTop: -box * 0.1,
              borderRightWidth: 2,
              borderBottomWidth: 2,
              borderColor: mark,
              transform: [{ rotate: "45deg" }],
            }}
          />
        ) : null}
      </View>
      <InteractiveDetails label={label} description={description} disabled={disabled} />
    </Pressable>
  );
}
