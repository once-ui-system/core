import type { ReactNode } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { type ControlChromeProps, controlChrome, InteractiveDetails } from "./InteractiveDetails";
import { Spinner } from "./Spinner";
import { touchSlop } from "./touch";
import { useControllable } from "./useControllable";

export interface SwitchProps extends ControlChromeProps {
  /** On or off, controlled. Leave it out to let the switch keep its own state. */
  checked?: boolean;
  /** The starting state of an uncontrolled switch (no `checked`). */
  defaultChecked?: boolean;
  /** Called with the state the switch moves to, as core 3.0's (2.x's `onToggle`). */
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  /** Puts the switch after the label. */
  reverse?: boolean;
  /** The name when there is no text `label`, as core's `aria-label` (2.x's `ariaLabel`). */
  "aria-label"?: string;
  style?: ViewStyle;
}

// Switch.module.scss: track width and height and the knob, per size.
const TRACK = {
  s: { width: "32", height: "20", knob: "12" },
  m: { width: "40", height: "24", knob: "16" },
  l: { width: "48", height: "1.75rem", knob: "20" },
} as const;

/** Core's `Switch`: a 40×24 track with a sliding knob, and an optional label. */
export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  label,
  description,
  loading = false,
  disabled = false,
  reverse = false,
  "aria-label": ariaLabel = "Toggle switch",
  size,
  error,
  errorMessage,
  style,
}: SwitchProps) {
  const theme = useTheme();
  const chrome = controlChrome({ size: size ?? theme.controlSize, error, errorMessage });
  const [on, toggle] = useControllable(checked, defaultChecked, onCheckedChange);
  const track = TRACK[chrome.size];
  const width = theme.space(track.width);
  const height = theme.space(track.height);
  const knob = theme.space(track.knob);
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
                chrome.invalid
                  ? "danger-border-medium"
                  : on
                    ? "solid-border-color-brand"
                    : "solid-border-color-neutral",
              ),
              // Themes whose solid border is 0 still show the danger border.
              borderWidth: chrome.invalid
                ? Math.max(1, theme.px("solid-border-width"))
                : theme.px("solid-border-width"),
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
          <InteractiveDetails
            label={label}
            description={description}
            errorMessage={chrome.showsError ? errorMessage : undefined}
            disabled={disabled}
            size={chrome.size}
          />
        </>
      )}
    </Pressable>
  );
}
