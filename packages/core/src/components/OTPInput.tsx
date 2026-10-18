"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { Column } from "./Column.js";
import { Flex } from "./Flex.js";
import { Input } from "./Input.js";
import styles from "./OTPInput.module.scss";
import { Text } from "./Text.js";

interface OTPInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  length?: number;
  /** The code typed so far, controlled. Leave it out to let the field keep
   *  its own, starting from `defaultValue`. */
  value?: string;
  /** The starting code of an uncontrolled OTPInput (no `value`). */
  defaultValue?: string;
  /** Receives the code after every digit typed or erased. */
  onValueChange?: (code: string) => void;
  /** Receives the code once every digit is filled. */
  onComplete?: (code: string) => void;
  error?: boolean;
  errorMessage?: React.ReactNode;
  disabled?: boolean;
  autoFocus?: boolean;
}

/** One entry per field: the code's digit at that place, or "". */
const digitsOf = (code: string | undefined, length: number) =>
  Array.from({ length }, (_, index) => code?.[index] ?? "");

const OTPInput = ({
  ref,
  length = 4,
  value,
  defaultValue,
  onValueChange,
  onComplete,
  error = false,
  errorMessage,
  disabled = false,
  autoFocus = false,
  className,
  ...props
}: OTPInputProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const [values, setDigits] = useState<string[]>(() => digitsOf(value ?? defaultValue, length));

  /**
   * Follow `value` after mount, when it reads as another code than the
   * digits do: the echo of the user's own keystroke leaves them alone, so a
   * digit typed after an empty one keeps its place.
   */
  const [followed, setFollowed] = useState(value);
  if (value !== followed) {
    setFollowed(value);
    if (value !== undefined && value !== values.join("")) {
      setDigits(digitsOf(value, length));
    }
  }

  const setValues = (next: string[]) => {
    setDigits(next);
    onValueChange?.(next.join(""));
  };
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  // The fields' ids were `otp-0`…`otp-N`, the same in every OTPInput on a
  // page, so a label or script that found a field by id got the first one.
  const idPrefix = useId();
  // The message is rendered here, once for every field, so each field is
  // described by it; Input marks them invalid from `error`.
  const errorId = `${idPrefix}otp-error`;
  const showsErrorMessage = error && Boolean(errorMessage);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;

    if (value === "" || /^[0-9]$/.test(value)) {
      const newValues = [...values];
      newValues[index] = value;
      setValues(newValues);

      if (value && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }

      if (newValues.every((val) => val !== "") && onComplete) {
        onComplete(newValues.join(""));
      }
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === "Backspace") {
      event.preventDefault();
      if (values[index]) {
        const newValues = [...values];
        newValues[index] = "";
        setValues(newValues);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        const newValues = [...values];
        newValues[index - 1] = "";
        setValues(newValues);
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleContainerClick = () => {
    if (disabled) return;

    if (values.every((val) => val !== "")) return;

    const firstEmptyIndex = values.findIndex((val) => val === "");
    if (firstEmptyIndex >= 0) {
      inputsRef.current[firstEmptyIndex]?.focus();
    }
  };

  return (
    // The caller's div props and className are the root's. They used to be
    // spread onto every digit field after its own handlers, so an
    // `onChange`, `onKeyDown` or `id` there broke entry or repeated ids.
    <Column gap="8" ref={ref} className={className} {...props}>
      <Flex gap="8" center onClick={handleContainerClick}>
        {Array.from({ length }, (_, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            id={`${idPrefix}otp-${index}`}
            type="text"
            placeholder=" "
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            error={error}
            aria-describedby={showsErrorMessage ? errorId : undefined}
            value={values[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            aria-label={`OTP digit ${index + 1} of ${length}`}
            className={styles.inputs}
          />
        ))}
      </Flex>
      {showsErrorMessage && (
        <Flex paddingX="8" id={errorId}>
          <Text textVariant="body-default-s" onBackground="danger-weak">
            {errorMessage}
          </Text>
        </Flex>
      )}
    </Column>
  );
};

OTPInput.displayName = "OTPInput";

export type { OTPInputProps };
export { OTPInput };
