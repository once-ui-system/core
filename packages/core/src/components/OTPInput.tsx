"use client";

import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../classes/utils";
import { Column } from "./Column";
import { Flex } from "./Flex";
import { Input } from "./Input";
import { Text } from "./Text";

export interface OTPInputProps extends HTMLAttributes<HTMLDivElement> {
  length?: number;
  onComplete?: (code: string) => void;
  error?: boolean;
  errorMessage?: ReactNode;
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

    useEffect(() => {
      setValues(Array(length).fill(""));
    }, [length]);

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

    const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
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

      const firstEmptyIndex = values.indexOf("");
      if (firstEmptyIndex >= 0) {
        inputsRef.current[firstEmptyIndex]?.focus();
      }
    };

    return (
      <Column gap="8" ref={ref} className={className} {...props}>
        <Flex gap="8" center onClick={handleContainerClick}>
          {Array.from({ length }, (_, index) => (
            <Input
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length OTP digit slots
              key={`otp-input-${index}`}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              id={`otp-${index}`}
              type="text"
              placeholder=" "
              inputMode="numeric"
              maxLength={1}
              error={error}
              disabled={disabled}
              value={values[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              aria-label={`OTP digit ${index + 1} of ${length}`}
              className={cn(
                "w-48 min-w-48 max-w-48 [&_input]:text-center [&_input]:text-heading-xl transition-all duration-200 focus-within:scale-105",
              )}
            />
          ))}
        </Flex>
        {error && errorMessage && (
          <Flex paddingX="8">
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

export { OTPInput };
