"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  InputHTMLAttributes,
  useCallback,
  ReactNode,
} from "react";
import classNames from "classnames";
import { Column, Row, Text, Spinner } from ".";
import styles from "./Input.module.scss";
import { useDebounce } from "../hooks/useDebounce";
import { TShirtSizes } from "../types";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  placeholder?: string;
  height?: TShirtSizes;
  error?: boolean;
  errorMessage?: ReactNode;
  description?: ReactNode;
  radius?:
    | "none"
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "top-left"
    | "top-right"
    | "bottom-right"
    | "bottom-left";
  className?: string;
  style?: React.CSSProperties;
  hasPrefix?: ReactNode;
  hasSuffix?: ReactNode;
  variant?: "default" | "ghost";
  characterCount?: boolean;
  cursor?: undefined | "interactive";
  validate?: (value: ReactNode) => ReactNode | null;
  loading?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      placeholder,
      height = "m",
      error = false,
      errorMessage,
      description,
      radius,
      className,
      style,
      hasPrefix,
      hasSuffix,
      variant = "default",
      characterCount,
      loading = false,
      children,
      onFocus,
      onBlur,
      validate,
      cursor,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isFilled, setIsFilled] = useState(!!props.value);
    const [validationError, setValidationError] = useState<ReactNode | null>(null);
    const debouncedValue = useDebounce(props.value, 1000);

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (event.target.value) {
        setIsFilled(true);
      } else {
        setIsFilled(false);
      }
      if (onBlur) onBlur(event);
    };

    useEffect(() => {
      setIsFilled(!!props.value);
    }, [props.value]);

    const validateInput = useCallback(() => {
      if (!debouncedValue) {
        setValidationError(null);
        return;
      }

      if (validate) {
        const error = validate(debouncedValue);
        if (error) {
          setValidationError(error);
        } else {
          setValidationError(errorMessage || null);
        }
      } else {
        setValidationError(null);
      }
    }, [debouncedValue, validate, errorMessage]);

    useEffect(() => {
      validateInput();
    }, [debouncedValue, validateInput]);

    const displayError = validationError || errorMessage;

    const fontSizeMap = {
      xs: "font-s",
      s: "font-s",
      m: "font-m",
      l: "font-l",
      xl: "font-xl",
    };

    const inputClassNames = classNames(
      styles.input,
      "font-body",
      "font-default",
      fontSizeMap[height],
      cursor === "interactive" ? "cursor-interactive" : undefined,
      {
        [styles.filled]: isFilled,
        [styles.focused]: isFocused,
        [styles.withPrefix]: hasPrefix,
        [styles.withSuffix]: hasSuffix,
        [styles.placeholder]: placeholder,
        [styles.hasChildren]: children,
        [styles.error]: displayError && debouncedValue !== "",
      },
    );

    return (
      <Column
        gap="8"
        style={style}
        fillWidth
        fitHeight
        className={classNames(className, {
          [styles.error]: (error || (displayError && debouncedValue !== "")) && props.value !== "",
        })}
      >
        <Row
          transition="micro-medium"
          border={variant === "ghost" ? "transparent" : "neutral-medium"}
          background={variant === "ghost" ? "transparent" : "neutral-alpha-weak"}
          overflow="hidden"
          vertical="stretch"
          className={classNames(
            styles.base,
            height && styles[height],
            radius === "none" ? "radius-none" : radius ? `radius-l-${radius}` : "radius-l",
          )}
        >
          {hasPrefix && (
            <Row paddingLeft="12" className={styles.prefix} position="static">
              {hasPrefix}
            </Row>
          )}
          <Column fillWidth padding="4">
            <input
              {...props}
              ref={ref}
              id={id}
              placeholder={placeholder}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={inputClassNames}
              aria-describedby={displayError ? `${id}-error` : undefined}
              aria-invalid={!!displayError}
            />
            {label && (
              <Text
                as="label"
                variant="label-default-m"
                htmlFor={id}
                className={classNames(styles.label, styles.inputLabel, {
                  [styles.floating]: isFocused || isFilled || placeholder,
                })}
              >
                {label}
              </Text>
            )}
            {children}
          </Column>
          {characterCount && props.maxLength && (
            <Row paddingRight="12" className={styles.suffix} position="static">
              <Text
                variant="label-default-s"
                onBackground={
                  props.maxLength - String(props.value || '').length <= 5
                    ? "danger-weak"
                    : props.maxLength - String(props.value || '').length <= 10
                      ? "warning-weak"
                      : "neutral-weak"
                }
              >
                {props.maxLength - String(props.value || '').length}
              </Text>
            </Row>
          )}
          {loading && (
            <Row paddingRight="12" className={styles.suffix} position="static">
              <Spinner size="s" />
            </Row>
          )}
          {hasSuffix && !loading && (
            <Row paddingRight="12" className={styles.suffix} position="static">
              {hasSuffix}
            </Row>
          )}
        </Row>
        {displayError && errorMessage !== false && (
          <Row paddingX="16" id={`${id}-error`} textVariant="body-default-s" onBackground="danger-weak">
            {validationError || errorMessage}
          </Row>
        )}
        {description && (
          <Row paddingX="16" id={`${id}-description`} textVariant="body-default-s" onBackground="neutral-weak">
            {description}
          </Row>
        )}
      </Column>
    );
  },
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
