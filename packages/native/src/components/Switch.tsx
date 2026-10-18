import type { ReactNode } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { InteractiveDetails } from "./InteractiveDetails";
import { Spinner } from "./Spinner";
import { touchSlop } from "./touch";
import { useControllable } from "./useControllable";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onToggle?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  /** Puts the switch after the label. */
  reverse?: boolean;
  ariaLabel?: string;
  style?: ViewStyle;
}

/** Core's `Switch`: a 40×24 track with a sliding knob, and an optional label. */
export function Switch({
  checked,
  defaultChecked = false,
  onToggle,
  label,
  description,
  loading = false,
  disabled = false,
  reverse = false,
  ariaLabel = "Toggle switch",
  style,
}: SwitchProps) {
  const theme = useTheme();
  const [on, toggle] = useControllable(checked, defaultChecked, onToggle);
  const width = theme.space("40");
  const height = theme.space("24");
  const knob = theme.space("16");
  const inset = (height - knob) / 2;

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={typeof label === "string" ? label : ariaLabel}
      aria-checked={on}
      aria-disabled={disabled}
      aria-busy={loading}
      disabled={disabled || loading}
      onPress={toggle}
      hitSlop={touchSlop(theme, height, label || description ? Number.POSITIVE_INFINITY : width)}
      style={[
        {
          flexDirection: reverse ? "row-reverse" : "row",
          alignItems: "center",
          gap: theme.space("16"),
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          <View
            style={{
              width,
              height,
              borderRadius: theme.px("radius-l-nest-4"),
              backgroundColor: theme.color(
                on
                  ? `brand-solid-${pressed ? "strong" : "medium"}`
                  : `neutral-solid-${pressed ? "strong" : "medium"}`,
              ),
              borderColor: theme.color(
                on ? "solid-border-color-brand" : "solid-border-color-neutral",
              ),
              borderWidth: theme.px("solid-border-width"),
              justifyContent: "center",
            }}
          >
            <View
              style={{
                position: "absolute",
                left: on ? width - knob - inset : inset,
                width: pressed ? knob * 1.2 : knob,
                height: knob,
                borderRadius: theme.radius("l"),
                backgroundColor: theme.color(
                  on ? "brand-on-solid-strong" : "neutral-on-solid-strong",
                ),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {loading && <Spinner size="xs" />}
            </View>
          </View>
          <InteractiveDetails label={label} description={description} disabled={disabled} />
        </>
      )}
    </Pressable>
  );
}
