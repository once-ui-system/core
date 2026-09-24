"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  TextareaHTMLAttributes,
  useCallback,
  ReactNode,
} from "react";
import classNames from "clsx";
import { Column } from "./Column";
import { Row } from "./Row";
import { Text } from "./Text";
import styles from "./Input.module.scss";
import { useDebounce } from "../hooks/useDebounce";
import { TShirtSizes } from "../types";
import { useFieldSize } from "./FormContext";

interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "prefix"> {
  id: string;
  label?: string;
  placeholder?: string;
  /**
   * How tall the field is. `"auto"` (the default) grows with the content and
   * drops the resize handle; a number fixes that many rows and keeps it.
   */
  lines?: number | "auto";
  size?: TShirtSizes;
  error?: boolean;
  errorMessage?: ReactNode;
  description?: ReactNode;
  corners?:
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
  prefix?: ReactNode;
  suffix?: ReactNode;
  variant?: "default" | "ghost";
  /** Draw the standard focus ring around the field while it has focus. Off by
   *  default — the quiet, borderless native look is deliberate — but a form a
   *  keyboard user has to get through wants it on. Note this shows on a mouse
   *  click too: `:focus-visible` always matches a field that takes keyboard
   *  input, however it was focused. */
  focusRing?: boolean;
  characterCount?: boolean;
  resize?: "horizontal" | "vertical" | "both" | "none";
  validate?: (value: ReactNode) => ReactNode | null;
  disabled?: boolean;
  /** How many columns to occupy inside a `Form` grid. `Form` reads this off
   *  the child and strips it; outside a `Form` it does nothing. */
  span?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      label,
      placeholder,
      lines = "auto",
      size,
      error = false,
      errorMessage,
      description,
      corners,
      className,
      prefix,
      suffix,
      variant = "default",
      focusRing = false,
      characterCount,
      resize = "vertical",
      validate,
      disabled = false,
      // Consumed by `Form`, never rendered. See Input.tsx.
      span,
      children,
      onFocus,
      onBlur,
      onChange,
      onAnimationStart,
      style,
      ...props
    },
    ref,
  ) => {
    // A `Form` can set the size for every field in it; the field's own
    // prop still wins, and `"m"` is still the default on its own.
    const resolvedSize = useFieldSize(size);
    const [isFocused, setIsFocused] = useState(false);
    // Seeded from `defaultValue` too: an uncontrolled field — how a settings
    // form normally renders saved data — has no `value`, so the label never
    // floated and sat on top of the text until the first focus and blur.
    const [isFilled, setIsFilled] = useState(!!props.value || !!props.defaultValue);
    const [validationError, setValidationError] = useState<ReactNode | null>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const debouncedValue = useDebounce(props.value, 1000);

    const adjustHeight = () => {
      if (textareaRef.current) {
        const scrollY = window.scrollY;
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        window.scrollTo({ top: scrollY });
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

    /**
     * Autofill fires no focus, blur or change event — Chrome does fill a
     * street-address textarea — so the label would sit on top of the filled
     * text. An animation start is the one thing the browser does emit; see
     * Input.module.scss, which hangs it off `:-webkit-autofill`.
     */
    const handleAnimationStart = (event: React.AnimationEvent<HTMLTextAreaElement>) => {
      // `styles.onAutoFill` is the exported hashed name; the substring check is
      // the fallback for bundlers that scope keyframes without exporting them.
      const name = event.animationName ?? "";
      if (name === styles.onAutoFill || name.includes("onAutoFill")) {
        setIsFilled(true);
      }
      if (onAnimationStart) onAnimationStart(event);
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
      // Only a controlled field's `value` is authoritative. Uncontrolled it is
      // `undefined` forever, and syncing to it clobbered the seed back to false.
      if (props.value === undefined) return;
      setIsFilled(!!props.value);
    }, [props.value]);

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
      {
        [styles.withPrefix]: prefix,
        [styles.withSuffix]: suffix,
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
          // See Input.tsx: the surface `Form` fuses, two levels down.
          data-surface="field"
          // Height comes from the size token via `.base`, the same as an
          // input's. This used to be a hardcoded 48 or 56, which ignored
          // `size` entirely and left a placeholder-only textarea 8px shorter
          // than the input beside it.
          transition="micro-medium"
          border={variant === "ghost" ? "transparent" : "neutral-medium"}
          background={variant === "ghost" ? "transparent" : "neutral-alpha-weak"}
          overflow="hidden"
          vertical="stretch"
          className={classNames(
            styles.base,
            focusRing && styles.focusRing,
            styles[resolvedSize],
            lines !== "auto" && resize !== "none" && styles.resizeHandle,
            corners === "none" ? "radius-none" : corners ? `radius-l-${corners}` : "radius-l",
            lines !== "auto" && resize !== "none" && "radius-s-bottom-right",
          )}
        >
          {prefix && (
            <Row paddingLeft="12" className={styles.prefix}>
              {prefix}
            </Row>
          )}
          <Column fillWidth padding="4">
            <textarea
              {...props}
              ref={(node) => {
                if (typeof ref === "function") {
                  ref(node);
                } else if (ref) {
                  ref.current = node;
                }
                textareaRef.current = node as HTMLTextAreaElement | null;
              }}
              id={id}
              rows={typeof lines === "number" ? lines : 1}
              placeholder={placeholder}
              disabled={disabled}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onAnimationStart={handleAnimationStart}
              className={`${textareaClassNames} scrollbar-minimal`}
              aria-describedby={displayError ? `${id}-error` : undefined}
              aria-invalid={!!displayError}
              style={{
                ...style,
                resize: lines === "auto" ? "none" : resize,
              }}
              onChange={handleChange}
            />
            {label && (
              <Text
                as="label"
                variant="label-default-m"
                htmlFor={id}
                className={classNames(styles.label, styles.textareaLabel, {
                  // `|| placeholder` is the whole point of the pairing: a
                  // placeholder is visible immediately, so the label has to be
                  // out of its way from the first paint rather than waiting
                  // for focus. Identical to `Input`.
                  [styles.floating]: isFocused || isFilled || placeholder,
                })}
              >
                {label}
              </Text>
            )}
            {children}
            {characterCount && props.maxLength && (
              <Row fillWidth paddingLeft="12" paddingY="4" className={styles.suffix}>
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
          {suffix && (
            <Row paddingRight="12" className={styles.suffix}>
              {suffix}
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
