import type { ReactNode } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Column, Row } from "./Flex";
import {
  CONTROL_TEXT,
  type ControlChromeProps,
  controlChrome,
  InteractiveDetails,
} from "./InteractiveDetails";
import { Text } from "./Text";
import { touchSlop } from "./touch";
import { useControllable, useControlledValue } from "./useControllable";

export interface RadioButtonProps extends ControlChromeProps {
  /** Chosen or not, controlled. Leave it out to let the radio keep its own state. */
  checked?: boolean;
  /** The starting state of an uncontrolled radio (no `checked`). */
  defaultChecked?: boolean;
  value?: string;
  /**
   * Called with the state the radio moves to, as core 3.0's (2.x's
   * `onToggle`): `true` when it becomes the chosen one. As with a native
   * radio, picking it again does nothing.
   */
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  /** The name when there is no text `label`, as core's `aria-label`. */
  "aria-label"?: string;
  style?: ViewStyle;
}

// SharedInteractiveStyles.module.scss: the circle per size, in static spacing steps.
const CIRCLE = { s: "16", m: "20", l: "24" } as const;

/** Core's `RadioButton`: a 20pt circle, brand-filled with a dot when checked. */
export function RadioButton({
  checked,
  defaultChecked = false,
  onCheckedChange,
  label,
  description,
  disabled = false,
  "aria-label": ariaLabel = "Radio button",
  size: sizeProp,
  error,
  errorMessage,
  style,
}: RadioButtonProps) {
  const theme = useTheme();
  const chrome = controlChrome({ size: sizeProp, error, errorMessage });
  const [on, toggle] = useControllable(checked, defaultChecked, onCheckedChange);
  const size = theme.space(CIRCLE[chrome.size]);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={typeof label === "string" ? label : ariaLabel}
      aria-checked={on}
      aria-disabled={disabled}
      disabled={disabled}
      // A radio only turns on; the group turns the others off.
      onPress={() => !on && toggle()}
      hitSlop={touchSlop(theme, size, label || description ? Number.POSITIVE_INFINITY : size)}
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
          width: size,
          height: size,
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: theme.color(
            on
              ? "solid-border-color-brand"
              : chrome.invalid
                ? "danger-border-medium"
                : "solid-border-color-neutral",
          ),
          backgroundColor: theme.color(on ? "brand-solid-medium" : "surface-background"),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {on && (
          <View
            style={{
              width: size * 0.4,
              height: size * 0.4,
              borderRadius: 9999,
              backgroundColor: theme.color("brand-on-solid-strong"),
            }}
          />
        )}
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

export interface RadioGroupOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps extends ControlChromeProps {
  /** One RadioButton per option, in order. */
  options?: RadioGroupOption[];
  /** The selected option's `value`, controlled. Pair with `onValueChange`. */
  value?: string;
  /** The option selected first when the group keeps its own state. Without it, none is. */
  defaultValue?: string;
  /**
   * Called with the newly selected `value`, as core 3.0's (2.x's `onChange`).
   * Not called for the option already selected.
   */
  onValueChange?: (value: string) => void;
  /** Names the group when it has no visible `label`, as core's `aria-label`. */
  "aria-label"?: string;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  style?: ViewStyle;
}

/** Core's `RadioGroup`: one choice out of `options`, with an optional group label. */
export function RadioGroup({
  options = [],
  value,
  defaultValue,
  onValueChange,
  "aria-label": ariaLabel,
  label,
  description,
  disabled = false,
  orientation = "vertical",
  size,
  error,
  errorMessage,
  style,
}: RadioGroupProps) {
  const chrome = controlChrome({ size, error, errorMessage });
  const text = CONTROL_TEXT[chrome.size];
  const [selected, select] = useControlledValue<string | undefined>(value, defaultValue, (v) => {
    if (v !== undefined) onValueChange?.(v);
  });
  const List = orientation === "horizontal" ? Row : Column;
  return (
    <Column
      gap="12"
      accessibilityRole="radiogroup"
      accessibilityLabel={typeof label === "string" ? label : ariaLabel}
      style={style}
    >
      {(label || description) && (
        <Column gap="4">
          {label && <Text textVariant={text.label}>{label}</Text>}
          {description && (
            <Text textVariant={text.body} onBackground="neutral-weak">
              {description}
            </Text>
          )}
        </Column>
      )}
      <List gap="16" wrap={orientation === "horizontal"}>
        {options.map((o) => (
          <RadioButton
            key={o.value}
            value={o.value}
            label={o.label}
            description={o.description}
            disabled={disabled || o.disabled}
            size={chrome.size}
            error={chrome.invalid}
            checked={selected === o.value}
            onCheckedChange={() => {
              if (selected !== o.value) select(o.value);
            }}
          />
        ))}
      </List>
      {chrome.showsError && (
        <Text textVariant={text.body} onBackground="danger-weak" accessibilityLiveRegion="polite">
          {errorMessage}
        </Text>
      )}
    </Column>
  );
}
