import type { ReactNode } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { type ControlChromeProps, controlChrome, InteractiveDetails } from "./InteractiveDetails";
import { touchSlop } from "./touch";
import { useControllable } from "./useControllable";

export interface CheckboxProps extends ControlChromeProps {
  /** Ticked or not, controlled. Leave it out to let the checkbox keep its own state. */
  checked?: boolean;
  /** The starting state of an uncontrolled checkbox (no `checked`). */
  defaultChecked?: boolean;
  indeterminate?: boolean;
  /** Called with the state the checkbox moves to, as core 3.0's (2.x's `onToggle`). */
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  /** The name when there is no text `label`, as core's `aria-label`. */
  "aria-label"?: string;
  style?: ViewStyle;
}

// SharedInteractiveStyles.module.scss: the box per size, in static spacing steps.
const BOX = { s: "16", m: "20", l: "24" } as const;

/** Core's `Checkbox`: a 20pt box, brand-filled with a check (or a dash when indeterminate). */
export function Checkbox({
  checked,
  defaultChecked = false,
  indeterminate = false,
  onCheckedChange,
  label,
  description,
  disabled = false,
  "aria-label": ariaLabel = "Checkbox",
  size,
  error,
  errorMessage,
  style,
}: CheckboxProps) {
  const theme = useTheme();
  const chrome = controlChrome({ size, error, errorMessage });
  const [on, toggle] = useControllable(checked, defaultChecked, onCheckedChange);
  const filled = on || indeterminate;
  const box = theme.space(BOX[chrome.size]);
  const mark = theme.color("brand-on-solid-strong");

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={typeof label === "string" ? label : ariaLabel}
      aria-checked={indeterminate ? "mixed" : on}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={toggle}
      hitSlop={touchSlop(theme, box, label || description ? Number.POSITIVE_INFINITY : box)}
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
            filled
              ? "solid-border-color-brand"
              : chrome.invalid
                ? "danger-border-medium"
                : "solid-border-color-neutral",
          ),
          backgroundColor: theme.color(filled ? "brand-solid-medium" : "surface-background"),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {indeterminate ? (
          <View style={{ width: box * 0.6, height: theme.space("2"), backgroundColor: mark }} />
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
      <InteractiveDetails
        label={label}
        description={description}
        errorMessage={chrome.showsError ? errorMessage : undefined}
        disabled={disabled}
        size={chrome.size}
      />
    </Pressable>
  );
}
