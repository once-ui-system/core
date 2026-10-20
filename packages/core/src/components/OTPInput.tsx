"use client";

import type React from "react";
import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { mergeLabels } from "../internal/labels";
import { Column } from "./Column";
import { Flex } from "./Flex";
import { Input } from "./Input";
import styles from "./OTPInput.module.scss";
import { Text } from "./Text";

/** The group's and the fields' accessible names. Omitted fields keep the English default. */
interface OTPInputLabels {
  /** Names the group of fields, unless `aria-label` or `aria-labelledby` is given. Defaults to `"One-time code"`. */
  group?: string;
  /** Names each field. Defaults to `` (position, length) => `OTP digit ${position} of ${length}` ``. */
  digit?: (position: number, length: number) => string;
}

const DEFAULT_LABELS: Required<OTPInputLabels> = {
  group: "One-time code",
  digit: (position, length) => `OTP digit ${position} of ${length}`,
};

interface OTPInputProps extends React.HTMLAttributes<HTMLDivElement> {
  length?: number;
  onComplete?: (code: string) => void;
  error?: boolean;
  errorMessage?: React.ReactNode;
  disabled?: boolean;
  autoFocus?: boolean;
  /** The group's and the fields' names, for a translated interface. */
  labels?: OTPInputLabels;
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
      labels,
      className,
      ...props
    },
    ref,
  ) => {
    const [stored, setValues] = useState<string[]>(() => Array(length).fill(""));
    // Sized to `length` on every render: a `length` changed after mount left
    // the new fields without a value (React's controlled-to-uncontrolled
    // warning) and the code could never complete.
    const values = Array.from({ length }, (_, index) => stored[index] ?? "");
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    // The fields' ids were `otp-0`…`otp-N`, the same in every OTPInput on a
    // page, so a label or script that found a field by id got the first one.
    const idPrefix = useId();
    // The message is rendered here, once for every field, so each field is
    // described by it; Input marks them invalid from `error`.
    const errorId = `${idPrefix}otp-error`;
    const showsErrorMessage = error && Boolean(errorMessage);
    const names = mergeLabels(DEFAULT_LABELS, labels);
    // The fields read as one labelled group, the code, rather than as loose
    // fields; a caller's own name for it wins.
    const groupName =
      props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined
        ? {}
        : { "aria-label": names.group };

    useEffect(() => {
      if (autoFocus && inputsRef.current[0]) {
        inputsRef.current[0].focus();
      }
    }, [autoFocus]);

    const handleChange = (index: number, value: string) => {
      if (disabled) return;

      // A whole code arriving at once, as the browser's one-time-code autofill
      // sets it, fills every field rather than being refused.
      if (value.length > 1 && /^\d+$/.test(value)) {
        fill(index, value);
        return;
      }

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

    /**
     * A pasted code fills the fields. Each field holds one character, so a
     * paste used to keep only its first digit. A code as long as the fields
     * fills them all, whichever field it is pasted into; a shorter run of
     * digits fills from the field it is pasted into.
     */
    const handlePaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      const digits = event.clipboardData.getData("text").replace(/\D/g, "");
      event.preventDefault();
      if (!digits) return;
      fill(index, digits);
    };

    /** Spreads a run of digits over the fields: see `handlePaste`. */
    const fill = (index: number, digits: string) => {
      const start = digits.length >= length ? 0 : index;
      const newValues = [...values];
      for (let i = 0; i < digits.length && start + i < length; i++) {
        newValues[start + i] = digits[i];
      }
      setValues(newValues);

      const last = Math.min(start + digits.length, length) - 1;
      inputsRef.current[last < length - 1 ? last + 1 : last]?.focus();

      if (newValues.every((val) => val !== "") && onComplete) {
        onComplete(newValues.join(""));
      }
    };

    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      const input = event.currentTarget;
      if (
        /^[0-9]$/.test(event.key) &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        values[index] !== "" &&
        input.selectionStart === input.selectionEnd
      ) {
        // A filled field is at its one-character limit, so a digit typed into
        // it was dropped. It replaces the digit instead.
        event.preventDefault();
        handleChange(index, event.key);
      } else if (event.key === "Backspace") {
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
      // The div props (`className`, `id`, `onChange`…) belong to the wrapper. On
      // each digit they overrode the field's own handlers and duplicated ids;
      // a caller's `onChange` or `onKeyDown` still sees every digit's event as
      // it bubbles up, after the field has handled it.
      <Column gap="8" ref={ref} className={className} role="group" {...groupName} {...props}>
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
              // The browser offers a code from a text message for the first field;
              // `handleChange` spreads it over the rest.
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              disabled={disabled}
              error={error}
              aria-describedby={showsErrorMessage ? errorId : undefined}
              value={values[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePaste(index, e)}
              aria-label={names.digit(index + 1, length)}
              className={styles.inputs}
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

export type { OTPInputLabels, OTPInputProps };
export { OTPInput };
