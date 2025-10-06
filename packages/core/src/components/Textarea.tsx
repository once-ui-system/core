"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  TextareaHTMLAttributes,
  useCallback,
  ReactNode,
} from "react";
import classNames from "classnames";
import { Column, Row, Text } from ".";
import styles from "./Input.module.scss";
import { useDebounce } from "../hooks/useDebounce";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label?: string;
  placeholder?: string;
  lines?: number | "auto";
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
  hasPrefix?: ReactNode;
  hasSuffix?: ReactNode;
  characterCount?: boolean;
  resize?: "horizontal" | "vertical" | "both" | "none";
  validate?: (value: ReactNode) => ReactNode | null;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      label,
      placeholder,
      lines = 3,
      error = false,
      errorMessage,
      description,
      radius,
      className,
      hasPrefix,
      hasSuffix,
      characterCount,
      resize = "vertical",
      validate,
      children,
      onFocus,
      onBlur,
      onChange,
      style,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isFilled, setIsFilled] = useState(!!props.value);
    const [validationError, setValidationError] = useState<ReactNode | null>(null);
    const [height, setHeight] = useState<number | undefined>(undefined);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const debouncedValue = useDebounce(props.value, 1000);

    const adjustHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scroll height
      }
    };

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (lines === "auto") {
        adjustHeight();
      }
      if (onChange) onChange(event);
    };

    const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      setIsFilled(!!event.target.value);
      if (onBlur) onBlur(event);
    };

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

    useEffect(() => {
      if (lines === "auto") {
        adjustHeight();
      }
    }, [props.value, lines]);

    const displayError = validationError || errorMessage;

    const textareaClassNames = classNames(
      styles.input,
      styles.textarea,
      "font-body",
      "font-default",
      "font-m",
      {
        [styles.filled]: isFilled,
        [styles.focused]: isFocused,
        [styles.withPrefix]: hasPrefix,
        [styles.withSuffix]: hasSuffix,
        [styles.placeholder]: placeholder,
        [styles.hasChildren]: children,
      },
    );

    return (
      <Column
        gap="8"
        fillWidth
        fitHeight
        className={classNames(className, {
          [styles.error]: displayError && debouncedValue !== "",
        })}
      >
        <Row
          minHeight={placeholder ? "48" : "56"}
          transition="micro-medium"
          border="neutral-medium"
          background="neutral-alpha-weak"
          overflow="hidden"
          vertical="stretch"
          className={classNames(
            styles.base,
            lines !== "auto" && resize !== "none" && styles.textareaBase,
            radius === "none" ? "radius-none" : radius ? `radius-l-${radius}` : "radius-l",
          )}
        >
          {hasPrefix && (
            <Row paddingLeft="12" className={styles.prefix}>
              {hasPrefix}
            </Row>
          )}
          <Column fillWidth>
            <textarea
              {...props}
              ref={(node) => {
                if (typeof ref === "function") {
                  ref(node);
                } else if (ref) {
                  ref.current = node;
                }
                // @ts-ignore
                textareaRef.current = node;
              }}
              id={id}
              rows={typeof lines === "number" ? lines : 1}
              placeholder={placeholder}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={textareaClassNames}
              aria-describedby={displayError ? `${id}-error` : undefined}
              aria-invalid={!!displayError}
              style={{
                ...style,
                resize: lines === "auto" ? "none" : resize,
                height: height ? `${height}rem` : "auto",
              }}
              onChange={handleChange}
            />
            {!placeholder && (
              <Text
                as="label"
                variant="label-default-m"
                htmlFor={id}
                className={classNames(styles.label, styles.textareaLabel, {
                  [styles.floating]: isFocused || isFilled,
                })}
              >
                {label}
              </Text>
            )}
            {children}
            {characterCount && props.maxLength && (
            <Row fillWidth paddingLeft="16" paddingY="8" className={styles.suffix}>
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
          </Column>
          {hasSuffix && (
            <Row paddingRight="12" className={styles.suffix}>
              {hasSuffix}
            </Row>
          )}
        </Row>
        {displayError && errorMessage !== false && (
          <Row paddingX="16" id={`${id}-error`} textVariant="body-default-s" onBackground="danger-weak">
            {displayError}
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

Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaProps };
