import type { ReactNode } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Column, Row } from "./Flex";
import { InteractiveDetails } from "./InteractiveDetails";
import { Text } from "./Text";
import { touchSlop } from "./touch";
import { useControllable, useControlledValue } from "./useControllable";

export interface RadioButtonProps {
  checked?: boolean;
  defaultChecked?: boolean;
  value?: string;
  onToggle?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  style?: ViewStyle;
}

/** Core's `RadioButton`: a 20pt circle, brand-filled with a dot when checked. */
export function RadioButton({
  checked,
  defaultChecked = false,
  onToggle,
  label,
  description,
  disabled = false,
  ariaLabel = "Radio button",
  style,
}: RadioButtonProps) {
  const theme = useTheme();
  const [on, toggle] = useControllable(checked, defaultChecked, onToggle);
  const size = theme.space("20");
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
          borderColor: theme.color(on ? "solid-border-color-brand" : "solid-border-color-neutral"),
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
      <InteractiveDetails label={label} description={description} disabled={disabled} />
    </Pressable>
  );
}

export interface RadioGroupOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options?: RadioGroupOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
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
  onChange,
  label,
  description,
  disabled = false,
  orientation = "vertical",
  style,
}: RadioGroupProps) {
  const [selected, select] = useControlledValue<string | undefined>(value, defaultValue, (v) => {
    if (v !== undefined) onChange?.(v);
  });
  const List = orientation === "horizontal" ? Row : Column;
  return (
    <Column gap="12" accessibilityRole="radiogroup" style={style}>
      {(label || description) && (
        <Column gap="4">
          {label && <Text variant="label-default-m">{label}</Text>}
          {description && (
            <Text variant="body-default-s" onBackground="neutral-weak">
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
            checked={selected === o.value}
            onToggle={() => select(o.value)}
          />
        ))}
      </List>
    </Column>
  );
}
