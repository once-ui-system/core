import { type ReactNode, useRef, useState } from "react";
import type { ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Column, Row } from "./Flex";
import { Input } from "./Input";
import type { TextInputRef } from "./refs";
import { Text } from "./Text";

export interface OTPInputProps {
  length?: number;
  /** Called with the code once every field holds a digit. */
  onComplete?: (code: string) => void;
  error?: boolean;
  errorMessage?: ReactNode;
  disabled?: boolean;
  autoFocus?: boolean;
  style?: ViewStyle;
}

/**
 * Core's `OTPInput`: one field per digit of a one-time code. A digit moves on
 * to the next field, backspace on an empty field goes back, and a code pasted
 * or filled in from an SMS spreads across the fields from the one it lands in.
 */
export function OTPInput({
  length = 4,
  onComplete,
  error = false,
  errorMessage,
  disabled = false,
  autoFocus = false,
  style,
}: OTPInputProps) {
  const theme = useTheme();
  const [values, setValues] = useState<string[]>(() => Array(length).fill(""));
  const inputs = useRef<(TextInputRef | null)[]>([]);
  const heading = theme.text("heading-default-xl");

  const handleChange = (index: number, text: string) => {
    if (disabled) return;
    let digits = text.replace(/\D/g, "");
    // A digit typed into a full field arrives beside the old one: keep the new one.
    if (digits.length === 2 && values[index]) digits = digits.replace(values[index], "");
    const next = [...values];
    if (digits === "") {
      next[index] = "";
    } else {
      for (let i = 0; i < digits.length && index + i < length; i++) next[index + i] = digits[i];
    }
    setValues(next);
    if (digits) inputs.current[Math.min(length - 1, index + digits.length)]?.focus();
    if (digits && next.every((value) => value !== "")) {
      inputs.current[index + digits.length - 1]?.blur();
      onComplete?.(next.join(""));
    }
  };

  const handleBackspace = (index: number) => {
    if (disabled || values[index] || index === 0) return;
    const next = [...values];
    next[index - 1] = "";
    setValues(next);
    inputs.current[index - 1]?.focus();
  };

  return (
    <Column gap="8" style={style}>
      <Row gap="8" center>
        {values.map((value, index) => (
          <Input
            // biome-ignore lint/suspicious/noArrayIndexKey: one field per position
            key={index}
            ref={(el) => {
              inputs.current[index] = el;
            }}
            placeholder=" "
            keyboardType="number-pad"
            // iOS offers the code from Messages above the keyboard; Android from SMS.
            textContentType={index === 0 ? "oneTimeCode" : "none"}
            autoComplete={index === 0 ? "sms-otp" : "off"}
            autoFocus={autoFocus && index === 0}
            selectTextOnFocus
            disabled={disabled}
            error={error}
            value={value}
            onChangeText={(text) => handleChange(index, text)}
            onKeyPress={(event) => {
              if (event.nativeEvent.key === "Backspace") handleBackspace(index);
            }}
            accessibilityLabel={`OTP digit ${index + 1} of ${length}`}
            // Core's 48, plus room for the field's side padding around a heading-size digit.
            style={{ width: theme.space("56") }}
            inputStyle={{
              textAlign: "center",
              fontSize: heading.fontSize,
              lineHeight: heading.lineHeight,
            }}
          />
        ))}
      </Row>
      {error && errorMessage && (
        <Text
          paddingX="8"
          variant="body-default-s"
          onBackground="danger-weak"
          accessibilityLiveRegion="polite"
        >
          {errorMessage}
        </Text>
      )}
    </Column>
  );
}
