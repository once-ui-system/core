import { forwardRef, type ReactNode, useContext, useState } from "react";
import { TextInput, type TextInputProps, type TextStyle, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { TShirtSizes } from "../types";
import { Column, Row } from "./Flex";
import { FormCellContext, useFormFieldDefaults } from "./FormContext";
import type { RefComponent, TextInputRef } from "./refs";
import { Spinner } from "./Spinner";
import { Text } from "./Text";

export interface InputProps extends Omit<TextInputProps, "style" | "editable"> {
  /** Floats above the value once the field is focused or filled. */
  label?: string;
  size?: TShirtSizes;
  error?: boolean;
  errorMessage?: ReactNode;
  description?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  variant?: "default" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  /**
   * Squares off the field's corners, as core's `corners`: `"top"` keeps the
   * top two round, `"none"` squares all four. A stacked `Form` sets these
   * for you.
   */
  corners?:
    | "none"
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "top-left"
    | "top-right"
    | "bottom-right"
    | "bottom-left";
  /** How many columns to take inside a `Form`; `Form` reads it. */
  span?: number;
  /** Shows how many characters are left; needs `maxLength`. */
  characterCount?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

const ALL = { tl: true, tr: true, bl: true, br: true };
const CORNERS = {
  none: { tl: false, tr: false, bl: false, br: false },
  top: { ...ALL, bl: false, br: false },
  bottom: { ...ALL, tl: false, tr: false },
  left: { ...ALL, tr: false, br: false },
  right: { ...ALL, tl: false, bl: false },
  "top-left": { tl: true, tr: false, bl: false, br: false },
  "top-right": { tl: false, tr: true, bl: false, br: false },
  "bottom-left": { tl: false, tr: false, bl: true, br: false },
  "bottom-right": { tl: false, tr: false, bl: false, br: true },
} as const;

// Input.module.scss field heights, in static spacing steps.
const HEIGHTS = { xs: "40", s: "48", m: "56", l: "64", xl: "72" } as const;

/** Core's `Input`: a bordered field with a floating label, error and description lines. */
export const Input: RefComponent<InputProps, TextInputRef> = forwardRef<TextInputRef, InputProps>(
  function Input(
    {
      label,
      size: ownSize,
      error = false,
      errorMessage,
      description,
      prefix,
      suffix,
      variant = "default",
      loading = false,
      disabled: ownDisabled,
      corners,
      span: _span,
      characterCount,
      style,
      inputStyle,
      onFocus,
      onBlur,
      multiline,
      onChangeText,
      ...rest
    },
    ref,
  ) {
    const theme = useTheme();
    const form = useFormFieldDefaults();
    const cell = useContext(FormCellContext);
    const size = ownSize ?? form.size ?? "m";
    const disabled = ownDisabled ?? form.disabled ?? false;
    const [focused, setFocused] = useState(false);
    // Tracked when uncontrolled too, so a typed value keeps the label floating after blur.
    const [typed, setTyped] = useState(rest.defaultValue ?? "");
    const value = rest.value ?? typed;
    const floating = focused || value !== "" || !!rest.placeholder;
    const ghost = variant === "ghost";
    const left = rest.maxLength !== undefined ? rest.maxLength - String(value).length : 0;
    const body = theme.text("body-default-m");
    const round = theme.radius("l");
    const keep = corners ? CORNERS[corners] : cell;
    const radii = keep
      ? {
          borderTopLeftRadius: keep.tl ? round : 0,
          borderTopRightRadius: keep.tr ? round : 0,
          borderBottomLeftRadius: keep.bl ? round : 0,
          borderBottomRightRadius: keep.br ? round : 0,
        }
      : {};

    return (
      <Column gap="8" fillWidth style={style}>
        <Row
          vertical={multiline ? "start" : "center"}
          radius="l"
          border={ghost ? "transparent" : error ? "danger-medium" : "neutral-medium"}
          background={ghost ? "transparent" : error ? "danger-medium" : "neutral-alpha-weak"}
          style={{
            minHeight: theme.space(HEIGHTS[size]),
            opacity: disabled ? 0.5 : 1,
            ...radii,
            // A focused field in a stacked group paints its border over its neighbours'.
            ...(focused && cell ? { zIndex: 1 } : {}),
            ...(focused && !ghost ? { borderColor: theme.color("neutral-border-strong") } : {}),
          }}
        >
          {prefix && <Row paddingLeft="12">{prefix}</Row>}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              paddingHorizontal: theme.space("16"),
              paddingVertical: floating || !label ? theme.space("8") : 0,
            }}
          >
            {label && (
              <Text
                variant={floating ? "label-default-s" : "label-default-m"}
                onBackground={error ? "danger-weak" : "neutral-medium"}
              >
                {label}
              </Text>
            )}
            <TextInput
              ref={ref}
              accessibilityLabel={label}
              aria-disabled={disabled}
              editable={!disabled}
              multiline={multiline}
              placeholderTextColor={theme.color("neutral-on-background-weak")}
              onFocus={(e) => {
                setFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                onBlur?.(e);
              }}
              onChangeText={(text) => {
                setTyped(text);
                onChangeText?.(text);
              }}
              {...rest}
              style={[
                {
                  fontSize: body.fontSize,
                  fontFamily: body.fontFamily,
                  color: theme.color("neutral-on-background-strong"),
                  padding: 0,
                  // Until it floats, the label sits where the value goes; the
                  // empty control covers the field so a tap still focuses it.
                  ...(label && !floating
                    ? {
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: theme.space("16"),
                        right: theme.space("16"),
                        opacity: 0,
                      }
                    : {}),
                },
                inputStyle,
              ]}
            />
          </View>
          {characterCount && rest.maxLength !== undefined && (
            <Row paddingRight="12">
              <Text
                variant="label-default-s"
                onBackground={
                  left <= 5 ? "danger-weak" : left <= 10 ? "warning-weak" : "neutral-weak"
                }
              >
                {left}
              </Text>
            </Row>
          )}
          {loading && (
            <Row paddingRight="12">
              <Spinner size="s" />
            </Row>
          )}
          {suffix && !loading && <Row paddingRight="12">{suffix}</Row>}
        </Row>
        {error && errorMessage && (
          <Text
            paddingX="16"
            variant="body-default-s"
            onBackground="danger-weak"
            accessibilityLiveRegion="polite"
          >
            {errorMessage}
          </Text>
        )}
        {description && (
          <Text paddingX="16" variant="body-default-s" onBackground="neutral-weak">
            {description}
          </Text>
        )}
      </Column>
    );
  },
);

export interface TextareaProps extends InputProps {
  /**
   * How tall the field is, as on the web. `"auto"` (the default) grows with
   * the content; a number fixes that many lines and scrolls past them.
   */
  lines?: number | "auto";
}

/** Core's `Textarea`: an `Input` that takes several lines. */
export const Textarea: RefComponent<TextareaProps, TextInputRef> = forwardRef<
  TextInputRef,
  TextareaProps
>(function Textarea({ lines = "auto", inputStyle, ...props }, ref) {
  const theme = useTheme();
  const lineHeight = Number(theme.text("body-default-m").lineHeight);
  return (
    <Input
      ref={ref}
      multiline
      textAlignVertical="top"
      scrollEnabled={lines !== "auto"}
      inputStyle={{
        ...(lines === "auto" ? { minHeight: lineHeight } : { height: lineHeight * lines }),
        lineHeight,
        ...inputStyle,
      }}
      {...props}
    />
  );
});
