import { createContext, type ReactNode, useContext } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Column, Row } from "./Flex";
import { InteractiveDetails } from "./InteractiveDetails";
import { Text } from "./Text";
import { touchSlop } from "./touch";
import { useControllable, useControlledValue } from "./useControllable";

/** What a RadioGroup tells the RadioButtons inside it, as on the web. */
const RadioGroupContext = createContext<{
  value: string | undefined;
  disabled: boolean;
  select: (value: string) => void;
} | null>(null);

export interface RadioButtonProps {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Inside a RadioGroup, the group checks the button whose `value` it holds. */
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
  value,
  onToggle,
  label,
  description,
  disabled: disabledProp = false,
  ariaLabel = "Radio button",
  style,
}: RadioButtonProps) {
  const theme = useTheme();
  // A RadioGroup around this button owns its checked state; outside one, or
  // with no `value` to match, the button's own props stand.
  const group = useContext(RadioGroupContext);
  const inGroup = group !== null && value !== undefined;
  const disabled = disabledProp || (inGroup && group.disabled);
  const [on, toggle] = useControllable(
    inGroup ? group.value === value : checked,
    defaultChecked,
    (next) => {
      if (inGroup) group.select(value);
      onToggle?.(next);
    },
  );
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
  /**
   * RadioButtons with a `value`, in any layout, for radios `options` cannot
   * describe. They render after the options.
   */
  children?: ReactNode;
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
  children,
  style,
}: RadioGroupProps) {
  const [selected, select] = useControlledValue<string | undefined>(value, defaultValue, (v) => {
    if (v !== undefined) onChange?.(v);
  });
  const List = orientation === "horizontal" ? Row : Column;
  return (
    <RadioGroupContext.Provider value={{ value: selected, disabled, select }}>
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
              disabled={o.disabled}
            />
          ))}
          {children}
        </List>
      </Column>
    </RadioGroupContext.Provider>
  );
}
