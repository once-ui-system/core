import { forwardRef, type ReactNode, useState } from "react";
import { TextInput, type TextInputProps, type TextStyle, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { TShirtSizes } from "../types";
import { Column, Row } from "./Flex";
import { IconButton } from "./IconButton";
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
  /** Shows how many characters are left; needs `maxLength`. */
  characterCount?: boolean;
  /**
   * Receives the field's text on every change, as core 3.0's `onValueChange`
   * (React Native's own `onChangeText` still works). The field is controlled
   * only when `value` is set.
   */
  onValueChange?: (value: string) => void;
  /**
   * Core's input `type`, mapped to the keyboard: `"password"` hides the text
   * (with a show/hide button, see `reveal`), `"email"`, `"tel"`, `"url"`,
   * `"number"` and `"search"` pick the matching keyboard.
   */
  type?: InputType;
  /**
   * With `type="password"`, an eye button after the field shows and hides
   * the text (2.x's PasswordInput). On by default; `reveal={false}` leaves a
   * plain password field, as in core 3.0.
   */
  reveal?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export type InputType = "text" | "password" | "email" | "tel" | "url" | "number" | "search";

const INPUT_MODE = {
  email: "email",
  tel: "tel",
  url: "url",
  number: "decimal",
  search: "search",
} as const;

// Input.module.scss field heights, in static spacing steps.
const HEIGHTS = { xs: "40", s: "48", m: "56", l: "64", xl: "72" } as const;

/** Core's `Input`: a bordered field with a floating label, error and description lines. */
export const Input: RefComponent<InputProps, TextInputRef> = forwardRef<TextInputRef, InputProps>(
  function Input(
    {
      label,
      size = "m",
      error = false,
      errorMessage,
      description,
      prefix,
      suffix,
      variant = "default",
      loading = false,
      disabled = false,
      characterCount,
      onValueChange,
      type = "text",
      reveal = true,
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
    const [focused, setFocused] = useState(false);
    const [shown, setShown] = useState(false);
    const password = type === "password";
    const keyboard =
      type in INPUT_MODE ? { inputMode: INPUT_MODE[type as keyof typeof INPUT_MODE] } : {};
    const plain =
      password || type === "email" || type === "url"
        ? { autoCapitalize: "none" as const, autoCorrect: false }
        : {};
    // Tracked when uncontrolled too, so a typed value keeps the label floating after blur.
    const [typed, setTyped] = useState(rest.defaultValue ?? "");
    const value = rest.value ?? typed;
    const floating = focused || value !== "" || !!rest.placeholder;
    const ghost = variant === "ghost";
    const left = rest.maxLength !== undefined ? rest.maxLength - String(value).length : 0;
    const body = theme.text("body-default-m");

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
                textVariant={floating ? "label-default-s" : "label-default-m"}
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
                onValueChange?.(text);
              }}
              {...keyboard}
              {...plain}
              secureTextEntry={password && !shown}
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
                textVariant="label-default-s"
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
          {password && reveal && (
            <Row paddingRight="12">
              <IconButton
                icon={shown ? "eyeOff" : "eye"}
                variant="ghost"
                size="s"
                aria-label={shown ? "Hide password" : "Show password"}
                disabled={disabled}
                onPress={() => setShown((v) => !v)}
              />
            </Row>
          )}
        </Row>
        {error && errorMessage && (
          <Text
            paddingX="16"
            textVariant="body-default-s"
            onBackground="danger-weak"
            accessibilityLiveRegion="polite"
          >
            {errorMessage}
          </Text>
        )}
        {description && (
          <Text paddingX="16" textVariant="body-default-s" onBackground="neutral-weak">
            {description}
          </Text>
        )}
      </Column>
    );
  },
);

export interface TextareaProps extends Omit<InputProps, "type" | "reveal"> {
  /**
   * How tall the field is: a number of lines, or `"auto"` to start at one
   * line and grow with the text, as core 3.0's `lines`. Defaults to 3 here.
   */
  lines?: number | "auto";
}

/** Core's `Textarea`: an `Input` that takes several lines. */
export const Textarea: RefComponent<TextareaProps, TextInputRef> = forwardRef<
  TextInputRef,
  TextareaProps
>(function Textarea({ lines = 3, inputStyle, ...props }, ref) {
  const theme = useTheme();
  const lineHeight = Number(theme.text("body-default-m").lineHeight);
  return (
    <Input
      ref={ref}
      multiline
      textAlignVertical="top"
      inputStyle={{
        minHeight: lineHeight * (lines === "auto" ? 1 : lines),
        lineHeight,
        ...inputStyle,
      }}
      {...props}
    />
  );
});
