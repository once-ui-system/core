import { type ReactNode, useState } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { TShirtSizes } from "../types";
import { Dialog } from "./Dialog";
import { Column, Row } from "./Flex";
import { Icon } from "./Icon";
import { Input } from "./Input";
import { Text } from "./Text";

export interface OptionProps {
  value: string;
  label?: ReactNode;
  description?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  danger?: boolean;
  onPress?: (value: string) => void;
  /** Core's name for `onPress`; both work. */
  onClick?: (value: string) => void;
}

/** Core's `Option`: one row of a list to pick from. */
export function Option({
  value,
  label,
  description,
  prefix,
  suffix,
  selected,
  disabled,
  danger,
  onPress,
  onClick,
}: OptionProps) {
  const theme = useTheme();
  const handler = onPress ?? onClick;
  return (
    <Pressable
      accessibilityRole="menuitem"
      aria-selected={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={() => handler?.(value)}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: theme.space("12"),
        minHeight: theme.px("touch-target") || 44,
        paddingHorizontal: theme.space("12"),
        paddingVertical: theme.space("8"),
        borderRadius: theme.radius("m"),
        opacity: disabled ? 0.5 : 1,
        backgroundColor: selected
          ? theme.color("neutral-alpha-weak")
          : pressed
            ? theme.color("neutral-alpha-weak")
            : "transparent",
      })}
    >
      {prefix}
      <Column flex={1} gap="2">
        <Text
          variant="label-default-m"
          onBackground={danger ? "danger-medium" : "neutral-strong"}
          truncate
        >
          {label ?? value}
        </Text>
        {description && (
          <Text variant="body-default-xs" onBackground="neutral-weak" truncate>
            {description}
          </Text>
        )}
      </Column>
      {suffix}
      {selected && <Icon name="check" size="s" onBackground="neutral-strong" />}
    </Pressable>
  );
}

export interface SelectProps {
  options: Omit<OptionProps, "selected" | "onPress" | "onClick">[];
  value?: string | string[];
  onSelect?: (value: string | string[]) => void;
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  emptyState?: ReactNode;
  size?: TShirtSizes;
  error?: boolean;
  errorMessage?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  /** The search field's words, as in core. */
  labels?: { search?: string };
  style?: ViewStyle;
}

/** Core's `Select`: an `Input`-styled field that opens its options in a bottom sheet. */
export function Select({
  options,
  value,
  onSelect,
  label,
  placeholder,
  multiple = false,
  searchable = false,
  emptyState = "No results",
  size,
  error,
  errorMessage,
  description,
  disabled,
  labels,
  style,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const chosen = Array.isArray(value) ? value : value ? [value] : [];
  const shown = chosen
    .map((v) => options.find((o) => o.value === v))
    .map((o) => (typeof o?.label === "string" ? o.label : o?.value))
    .filter(Boolean)
    .join(", ");
  const visible = searchable
    ? options.filter((o) =>
        `${typeof o.label === "string" ? o.label : ""} ${o.value}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : options;

  const pick = (v: string) => {
    if (multiple) {
      onSelect?.(chosen.includes(v) ? chosen.filter((c) => c !== v) : [...chosen, v]);
    } else {
      onSelect?.(v);
      setOpen(false);
    }
  };

  return (
    <View style={style}>
      <Pressable
        accessibilityRole="combobox"
        accessibilityLabel={label}
        aria-expanded={open}
        aria-disabled={disabled}
        disabled={disabled}
        onPress={() => setOpen(true)}
      >
        <View pointerEvents="none">
          <Input
            label={label}
            placeholder={placeholder}
            value={shown}
            size={size}
            error={error}
            errorMessage={errorMessage}
            description={description}
            disabled={disabled}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            suffix={<Icon name="chevronDown" size="s" onBackground="neutral-medium" />}
          />
        </View>
      </Pressable>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setQuery("");
        }}
        title={label}
      >
        <Column gap="4">
          {searchable && (
            <Row paddingBottom="8">
              <Input
                label={labels?.search ?? "Search"}
                value={query}
                onChangeText={setQuery}
                size="s"
                prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
              />
            </Row>
          )}
          {visible.length === 0 ? (
            <Text variant="body-default-s" onBackground="neutral-weak" paddingX="12" paddingY="8">
              {emptyState}
            </Text>
          ) : (
            visible.map((o) => (
              <Option key={o.value} {...o} selected={chosen.includes(o.value)} onPress={pick} />
            ))
          )}
        </Column>
      </Dialog>
    </View>
  );
}
