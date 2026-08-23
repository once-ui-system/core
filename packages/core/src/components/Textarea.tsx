"use client";

import { cva } from "class-variance-authority";
import type { ChangeEvent, FocusEvent, ReactNode, TextareaHTMLAttributes } from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { generateClasses } from "../classes/generator";
import { cn } from "../classes/utils";
import { useDebounce } from "../hooks/useDebounce";
import type { RadiusSize, TShirtSizes } from "../types";
import { Column } from "./Column";
import { Row } from "./Row";
import { Text } from "./Text";

export const textareaVariants = cva(
  "relative flex items-stretch w-full overflow-hidden transition-colors duration-micro-medium [backdrop-filter:var(--backdrop-filter)]",
  {
    variants: {
      variant: {
        default: "border border-solid bg-neutral-alpha-weak border-neutral-alpha-weak",
        ghost: "border border-solid bg-transparent border-transparent",
      },
      height: {
        xs: "min-h-40",
        s: "min-h-48",
        m: "min-h-56",
        l: "min-h-64",
        xl: "min-h-72",
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

const textareaLabelFloatingMap: Record<TShirtSizes, string> = {
  xs: "top-[3px] scale-[0.6]",
  s: "top-[3px] scale-75",
  m: "top-[6px] scale-75",
  l: "top-4 scale-75",
  xl: "top-4 scale-75",
};

const fontSizeMap: Record<TShirtSizes, string> = {
  xs: "font-s",
  s: "font-s",
  m: "font-m",
  l: "font-l",
  xl: "font-xl",
};

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label?: string;
  placeholder?: string;
  lines?: number | "auto";
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
  hasPrefix?: ReactNode;
  hasSuffix?: ReactNode;
  variant?: "default" | "ghost";
  characterCount?: boolean;
  resize?: "horizontal" | "vertical" | "both" | "none";
  validate?: (value: ReactNode) => ReactNode | null;
  disabled?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      label,
      placeholder,
      lines = 3,
      height = "m",
      error = false,
      errorMessage,
      description,
      radius,
      className,
      hasPrefix,
      hasSuffix,
      variant = "default",
      characterCount,
      resize = "vertical",
      validate,
      disabled = false,
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
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const debouncedValue = useDebounce(props.value, 1000);

    const adjustHeight = useCallback(() => {
      if (textareaRef.current) {
        const scrollY = window.scrollY;
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        window.scrollTo({ top: scrollY });
      }
    }, []);

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      if (lines === "auto") {
        adjustHeight();
      }
      if (onChange) onChange(event);
    };

    const handleFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(event);
    };

    const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
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

    useEffect(() => {
      setIsFilled(!!props.value);
    }, [props.value]);

    useEffect(() => {
      if (lines === "auto" && props.value !== undefined) {
        adjustHeight();
      }
    }, [props.value, lines, adjustHeight]);

    const displayError = validationError || errorMessage;
    const isError = Boolean(
      (error || (displayError && debouncedValue !== "")) && (props.value !== "" || error),
    );

    const hasResizeHandle = lines !== "auto" && resize !== "none";

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
      textareaVariants({
        variant,
        height,
        focused: isFocused || isFilled,
        error: isError,
      }),
      generateClasses(resolvedRadius),
      hasResizeHandle && [
        "after:pointer-events-none after:content-[''] after:absolute after:right-0 after:bottom-0 after:w-32 after:h-32 after:border after:border-solid after:border-neutral-border-strong after:translate-x-1/2 after:translate-y-1/2 after:rotate-45 after:bg-neutral-alpha-weak [&::-webkit-resizer]:hidden rounded-br-s",
        isError && "after:border-danger-border-medium after:bg-danger-alpha-weak",
      ],
    );

    const isFloating = isFocused || isFilled;

    const labelClasses = cn(
      "absolute left-16 transition-all duration-300 pointer-events-none origin-left",
      isFloating ? textareaLabelFloatingMap[height] : "top-[18px] scale-100",
      isError ? "text-danger-on-background-weak" : "text-neutral-on-background-medium",
    );

    const textareaClasses = cn(
      "w-full h-full border-none bg-transparent outline-none rounded-s text-neutral-on-background-strong disabled:text-neutral-on-background-weak disabled:cursor-not-allowed placeholder:text-neutral-on-background-weak [transition:padding_0.3s]",
      "font-body font-default",
      fontSizeMap[height],
      isError && "text-danger-on-background-medium",
      placeholder && !children ? "py-12" : "pt-16",
      "px-12",
      "scrollbar-minimal",
    );

    return (
      <Column
        gap="8"
        fillWidth
        fitHeight
        className={cn(className, isError && "text-danger-on-background-medium")}
      >
        <Row
          minHeight={placeholder ? "48" : "56"}
          transition="micro-medium"
          overflow="hidden"
          vertical="stretch"
          className={rowClasses}
        >
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
            <textarea
              {...props}
              ref={(node) => {
                if (typeof ref === "function") {
                  ref(node);
                } else if (ref) {
                  ref.current = node;
                }
                textareaRef.current = node;
              }}
              id={id}
              rows={typeof lines === "number" ? lines : 1}
              placeholder={placeholder}
              disabled={disabled}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={textareaClasses}
              aria-describedby={displayError ? `${id}-error` : undefined}
              aria-invalid={!!displayError}
              style={{
                ...style,
                resize: lines === "auto" ? "none" : resize,
              }}
              onChange={handleChange}
            />
            {!placeholder && (
              <Text as="label" variant="label-default-m" htmlFor={id} className={labelClasses}>
                {label}
              </Text>
            )}
            {children}
            {characterCount && props.maxLength && (
              <Row
                fillWidth
                paddingLeft="12"
                paddingY="4"
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
          </Column>
          {hasSuffix && (
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
            {displayError}
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

Textarea.displayName = "Textarea";

export { Textarea };
