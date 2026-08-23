"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, FocusEvent, InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { generateClasses } from "../classes/generator";
import { cn } from "../classes/utils";
import { useDebounce } from "../hooks/useDebounce";
import type { RadiusSize, TShirtSizes } from "../types";
import { Column } from "./Column";
import { Row } from "./Row";
import { Spinner } from "./Spinner";
import { Text } from "./Text";

export const inputVariants = cva(
  "relative flex items-stretch w-full overflow-hidden transition-colors duration-micro-medium [backdrop-filter:var(--backdrop-filter)]",
  {
    variants: {
      variant: {
        default: "border border-solid bg-neutral-alpha-weak border-neutral-alpha-weak",
        ghost: "border border-solid bg-transparent border-transparent",
      },
      height: {
        xs: "min-h-40 h-40",
        s: "min-h-48 h-48",
        m: "min-h-56 h-56",
        l: "min-h-64 h-64",
        xl: "min-h-72 h-72",
      },
      focused: {
        true: "border-neutral-border-medium",
        false: "",
      },
      error: {
        true: "bg-danger-background-medium border-danger-border-medium",
        false: "",
      },
    },
    compoundVariants: [
      {
        error: true,
        variant: "ghost",
        className: "bg-danger-background-medium border-danger-border-medium",
      },
    ],
    defaultVariants: {
      variant: "default",
      height: "m",
      focused: false,
      error: false,
    },
  },
);

const labelFloatingMap: Record<TShirtSizes, string> = {
  xs: "top-[3px] scale-[0.6]",
  s: "top-[3px] scale-75",
  m: "top-[6px] scale-75",
  l: "top-[6px] scale-75",
  xl: "top-[10px] scale-75",
};

const fontSizeMap: Record<TShirtSizes, string> = {
  xs: "font-s",
  s: "font-s",
  m: "font-m",
  l: "font-l",
  xl: "font-xl",
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
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
  style?: CSSProperties;
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

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(event);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
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
        const result = validate(debouncedValue);
        if (result) {
          setValidationError(result);
        } else {
          setValidationError(errorMessage || null);
        }
      } else {
        setValidationError(null);
      }
    }, [debouncedValue, validate, errorMessage]);

    useEffect(() => {
      validateInput();
    }, [validateInput]);

    const displayError = validationError || errorMessage;
    const isError = Boolean(
      (error || (displayError && debouncedValue !== "")) && (props.value !== "" || error),
    );

    const radiusSize: RadiusSize = "l";
    const resolvedRadius = {
      radius: !radius ? radiusSize : radius === "none" ? ("none" as const) : undefined,
      topRadius: radius === "top" ? radiusSize : undefined,
      rightRadius: radius === "right" ? radiusSize : undefined,
      bottomRadius: radius === "bottom" ? radiusSize : undefined,
      leftRadius: radius === "left" ? radiusSize : undefined,
      topLeftRadius: radius === "top-left" ? radiusSize : undefined,
      topRightRadius: radius === "top-right" ? radiusSize : undefined,
      bottomRightRadius: radius === "bottom-right" ? radiusSize : undefined,
      bottomLeftRadius: radius === "bottom-left" ? radiusSize : undefined,
    };

    const rowClasses = cn(
      inputVariants({
        variant,
        height,
        focused: isFocused || isFilled,
        error: isError,
      }),
      generateClasses(resolvedRadius),
    );

    const isFloating = isFocused || isFilled || Boolean(placeholder);

    const labelClasses = cn(
      "absolute left-16 transition-all duration-300 pointer-events-none origin-left",
      isFloating ? labelFloatingMap[height] : "top-1/2 -translate-y-1/2 scale-100",
      isError ? "text-danger-on-background-weak" : "text-neutral-on-background-medium",
    );

    const inputClasses = cn(
      "w-full h-full border-none bg-transparent outline-none rounded-s text-neutral-on-background-strong disabled:text-neutral-on-background-weak disabled:cursor-not-allowed placeholder:text-neutral-on-background-weak [transition:padding_0.3s]",
      "autofill:bg-transparent autofill:[-webkit-text-fill-color:var(--neutral-on-background-strong)] autofill:[-webkit-box-shadow:0_0_0_32px_var(--neutral-background-medium)_inset]",
      "font-body font-default",
      fontSizeMap[height],
      cursor === "interactive" && "cursor-interactive",
      isError && "text-danger-on-background-medium",
      placeholder && !children && !label ? "pt-0" : "pt-16",
      "px-12",
    );

    return (
      <Column
        gap="8"
        style={style}
        fillWidth
        fitHeight
        className={cn(className, isError && "text-danger-on-background-medium")}
      >
        <Row transition="micro-medium" overflow="hidden" vertical="stretch" className={rowClasses}>
          {hasPrefix && (
            <Row
              paddingLeft="12"
              vertical="center"
              position="static"
              className={cn(isError && "text-danger-on-background-medium")}
            >
              {hasPrefix}
            </Row>
          )}
          <Column fillWidth padding="4" position="relative">
            <input
              {...props}
              ref={ref}
              id={id}
              placeholder={placeholder}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={inputClasses}
              aria-describedby={displayError ? `${id}-error` : undefined}
              aria-invalid={!!displayError}
            />
            {label && (
              <Text as="label" variant="label-default-m" htmlFor={id} className={labelClasses}>
                {label}
              </Text>
            )}
            {children}
          </Column>
          {characterCount && props.maxLength && (
            <Row
              paddingRight="12"
              vertical="center"
              position="static"
              className={cn(isError && "text-danger-on-background-medium")}
            >
              <Text
                variant="label-default-s"
                onBackground={
                  props.maxLength - String(props.value || "").length <= 5
                    ? "danger-weak"
                    : props.maxLength - String(props.value || "").length <= 10
                      ? "warning-weak"
                      : "neutral-weak"
                }
              >
                {props.maxLength - String(props.value || "").length}
              </Text>
            </Row>
          )}
          {loading && (
            <Row paddingRight="12" vertical="center" position="static">
              <Spinner size="s" />
            </Row>
          )}
          {hasSuffix && !loading && (
            <Row
              paddingRight="12"
              vertical="center"
              position="static"
              className={cn(isError && "text-danger-on-background-medium")}
            >
              {hasSuffix}
            </Row>
          )}
        </Row>
        {displayError && errorMessage !== false && (
          <Row
            paddingX="16"
            id={`${id}-error`}
            textVariant="body-default-s"
            onBackground="danger-weak"
          >
            {validationError || errorMessage}
          </Row>
        )}
        {description && (
          <Row
            paddingX="16"
            id={`${id}-description`}
            textVariant="body-default-s"
            onBackground="neutral-weak"
          >
            {description}
          </Row>
        )}
      </Column>
    );
  },
);

Input.displayName = "Input";

export { Input };
