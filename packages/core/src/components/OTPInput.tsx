"use client";

import React, { forwardRef, useEffect, useId, useRef, useState } from "react";
import { Column } from "./Column";
import { Flex } from "./Flex";
import { Input } from "./Input";
import styles from "./OTPInput.module.scss";
import { Text } from "./Text";

interface OTPInputProps extends React.HTMLAttributes<HTMLDivElement> {
  length?: number;
  onComplete?: (code: string) => void;
  error?: boolean;
  errorMessage?: React.ReactNode;
  disabled?: boolean;
  autoFocus?: boolean;
}

const OTPInput = forwardRef<HTMLDivElement, OTPInputProps>(
  (
    {
      length = 4,
      onComplete,
      error = false,
      errorMessage,
      disabled = false,
      autoFocus = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [values, setValues] = useState<string[]>(Array(length).fill(""));
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
      <Column gap="8" ref={ref}>
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
              {...props}
            />
          ))}
        </Flex>
        {showsErrorMessage && (
          <Flex paddingX="8" id={errorId}>
            <Text variant="body-default-s" onBackground="danger-weak">
              {errorMessage}
            </Text>
          </Flex>
        )}
      </Column>
    );
  },
);

OTPInput.displayName = "OTPInput";

export type { OTPInputProps };
export { OTPInput };
