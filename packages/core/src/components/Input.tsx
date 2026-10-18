"use client";

import classNames from "clsx";
import React, {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDebounce } from "../hooks/useDebounce.js";
import { TShirtSizes } from "../types.js";
import { Column } from "./Column.js";
import { useFieldSize } from "./FormContext.js";
import { IconButton } from "./IconButton.js";
import styles from "./Input.module.scss";
import { Row } from "./Row.js";
import { Spinner } from "./Spinner.js";
import { Text } from "./Text.js";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  id: string;
  label?: string;
  placeholder?: string;
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
  style?: React.CSSProperties;
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
  cursor?: undefined | "interactive";
  /** Receives the field's text on every change, after the native `onChange`.
   *  The field is controlled only when `value` is set. */
  onValueChange?: (value: string) => void;
  /** Checks the field's text, controlled or not, a second after it last changed. */
  validate?: (value: ReactNode) => ReactNode | null;
  loading?: boolean;
  /**
   * With `type="password"`, an eye button after the field shows and hides the
   * text (2.x's PasswordInput). On by default; `reveal={false}` leaves a plain
   * password field.
   */
  reveal?: boolean;
  /** How many columns to occupy inside a `Form` grid. `Form` reads this off
   *  the child and strips it; outside a `Form` it does nothing. */
  span?: number;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      placeholder,
      size,
      error = false,
      errorMessage,
      description,
      corners,
      className,
      style,
      prefix,
      suffix,
      variant = "default",
      focusRing = false,
      characterCount,
      loading = false,
      // Consumed by `Form`, never rendered. Destructured so it cannot reach
      // the DOM when an `Input` carrying it is used on its own.
      span,
      reveal = true,
      children,
      onFocus,
      onBlur,
      onChange,
      onValueChange,
      onAnimationStart,
      validate,
      cursor,
      ...props
    },
    ref,
  ) => {
    // A `Form` can set the size for every field in it; the field's own
    // prop still wins, and `"m"` is still the default on its own.
    const resolvedSize = useFieldSize(size);
    const [revealed, setRevealed] = useState(false);
    const revealable = props.type === "password" && reveal;
    const [isFocused, setIsFocused] = useState(false);
    // Seeded from `defaultValue` too: an uncontrolled field — how a settings
    // form normally renders saved data — has no `value`, so the label never
    // floated and sat on top of the text until the first focus and blur.
    const [isFilled, setIsFilled] = useState(!!props.value || !!props.defaultValue);
    const [validationError, setValidationError] = useState<ReactNode | null>(null);
    /**
     * The text the field holds. Controlled it is `value`; uncontrolled the
     * field keeps its own copy from `defaultValue` and each change, so
     * `validate` and the character count see what was typed. Both used to
     * read `value` alone, and an uncontrolled field never validated.
     */
    const controlled = props.value !== undefined;
    const [ownText, setOwnText] = useState(() =>
      props.defaultValue === undefined ? "" : String(props.defaultValue),
    );
    const text = controlled ? String(props.value) : ownText;
    const debouncedValue = useDebounce(text, 1000);
    // What the error styling compares against, as before: the debounced
    // `value` when controlled, nothing when not.
    const styledValue = controlled ? debouncedValue : undefined;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!controlled) setOwnText(event.target.value);
      onChange?.(event);
      onValueChange?.(event.target.value);
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(event);
    };

    /**
     * Autofill fires no focus, blur or change event, so nothing else here ever
     * learns the field stopped being empty — the label stayed sitting on top
     * of the filled text. The one thing the browser does emit is an animation
     * start, which Input.module.scss hangs off `:-webkit-autofill` for exactly
     * this. The name is matched loosely because CSS Modules hashes it, and
     * bundlers differ on whether they export keyframe names at all.
     */
    const handleAnimationStart = (event: React.AnimationEvent<HTMLInputElement>) => {
      // `styles.onAutoFill` is the exported hashed name; the substring check is
      // the fallback for bundlers that scope keyframes without exporting them.
      const name = event.animationName ?? "";
      if (name === styles.onAutoFill || name.includes("onAutoFill")) {
        setIsFilled(true);
      }
      if (onAnimationStart) onAnimationStart(event);
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
      // Only a controlled field's `value` is authoritative. Uncontrolled it is
      // `undefined` forever, and syncing to it clobbered the seed back to false.
      if (props.value === undefined) return;
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
    // Whether the message below the field renders, and so whether there is
    // anything to point `aria-describedby` at.
    const showsErrorMessage = Boolean(displayError) && errorMessage !== false;
    // The caller's own description comes first; it used to be overwritten.
    const describedBy =
      [props["aria-describedby"], showsErrorMessage ? `${id}-error` : undefined]
        .filter(Boolean)
        .join(" ") || undefined;

    const inputClassNames = classNames(
      styles.input,
      "font-body",
      "font-default",
      cursor === "interactive" ? "cursor-interactive" : undefined,
      {
        [styles.withPrefix]: prefix,
        [styles.withSuffix]: suffix || revealable,
        [styles.placeholder]: placeholder,
        [styles.hasChildren]: children,
        [styles.error]: displayError && styledValue !== "",
      },
    );

    return (
      <Column
        gap="8"
        style={style}
        fillWidth
        fitHeight
        className={classNames(className, {
          [styles.error]: (error || (displayError && styledValue !== "")) && props.value !== "",
        })}
      >
        <Row
          // The element that actually carries the border and the radius, two
          // levels below what a parent lays out. `Form` needs to reach it to
          // fuse a group's corners, and `> *` only reaches the Column above.
          data-surface="field"
          transition="micro-medium"
          border={variant === "ghost" ? "transparent" : "neutral-medium"}
          background={variant === "ghost" ? "transparent" : "neutral-alpha-weak"}
          overflow="hidden"
          vertical="stretch"
          className={classNames(
            styles.base,
            focusRing && styles.focusRing,
            styles[resolvedSize],
            corners === "none" ? "radius-none" : corners ? `radius-l-${corners}` : "radius-l",
          )}
        >
          {prefix && (
            <Row paddingLeft="12" className={styles.prefix} position="static">
              {prefix}
            </Row>
          )}
          <Column fillWidth padding="4">
            <input
              {...props}
              type={revealable && revealed ? "text" : props.type}
              ref={ref}
              id={id}
              placeholder={placeholder}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              onAnimationStart={handleAnimationStart}
              className={inputClassNames}
              aria-describedby={describedBy}
              // `error` alone marks the field invalid too: a field whose
              // message is rendered elsewhere (OTPInput's, a form's summary)
              // was drawn in the error state but announced as valid.
              aria-invalid={error || !!displayError}
            />
            {label && (
              <Text
                as="label"
                textVariant="label-default-m"
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
                textVariant="label-default-s"
                onBackground={
                  props.maxLength - text.length <= 5
                    ? "danger-weak"
                    : props.maxLength - text.length <= 10
                      ? "warning-weak"
                      : "neutral-weak"
                }
              >
                {props.maxLength - text.length}
              </Text>
            </Row>
          )}
          {loading && (
            <Row paddingRight="12" className={styles.suffix} position="static">
              <Spinner size="s" />
            </Row>
          )}
          {suffix && !loading && (
            <Row paddingRight="12" className={styles.suffix} position="static">
              {suffix}
            </Row>
          )}
          {revealable && (
            <Row paddingRight="12" className={styles.suffix} position="static">
              <IconButton
                onClick={() => setRevealed((shown) => !shown)}
                variant="ghost"
                icon={revealed ? "eyeOff" : "eye"}
                aria-label={revealed ? "Hide password" : "Show password"}
                size="s"
                type="button"
              />
            </Row>
          )}
        </Row>
        {showsErrorMessage && (
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

export type { InputProps };
export { Input };
