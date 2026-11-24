"use client";
import type React from "react";
import { useEffect, useId, useRef, useState } from "react";
import type { TShirtSizes } from "../types.js";
import { Button } from "./Button.js";
import { Row } from "./Row.js";
import { Text } from "./Text.js";

/** What a native colour field holds: `#rrggbb`. */
const isHex = (color: string | undefined): color is string =>
  !!color && /^#[0-9a-f]{6}$/i.test(color);

/** The swatch before a colour is picked: every hue, so it reads as "pick one". */
const EMPTY_SWATCH =
  "conic-gradient(#f43f5e, #f59e0b, #84cc16, #06b6d4, #6366f1, #d946ef, #f43f5e)";

interface ColorButtonProps {
  /** The colour, controlled, as `#rrggbb`. Leave it out to let the button keep its own, from `defaultValue`. */
  value?: string;
  /** The starting colour of an uncontrolled ColorButton (no `value`). */
  defaultValue?: string;
  /**
   * The text before a colour is picked, and the button's accessible name
   * (with the colour after it once there is one), such as `"Own colour"`.
   */
  label: string;
  /**
   * Receives each colour while the picker is open, as the person drags. Use
   * it for a live preview; save in `onValueCommit`.
   */
  onValueChange?: (value: string) => void;
  /**
   * Receives the colour once, when the picker closes on a new one. Where a
   * pick is saved, sent or undoable, listen here rather than on every drag.
   */
  onValueCommit?: (value: string) => void;
  /** Defaults to `s`, a trigger that sits under a row of swatches. */
  size?: TShirtSizes;
  /** Defaults to `secondary`. */
  variant?: "primary" | "secondary" | "tertiary";
  disabled?: boolean;
  /** Show the hex once a colour is picked (the default), or keep the label. */
  showValue?: boolean;
  id?: string;
  /** The id of text that describes the colour, such as a contrast note under the button. */
  "aria-describedby"?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A compact colour trigger: a button with a swatch and the hex that opens the
 * browser's colour picker. For a custom colour beside a row of preset
 * swatches, where ColorInput's full field would be too heavy.
 */
const ColorButton = ({
  value,
  defaultValue,
  label,
  onValueChange,
  onValueCommit,
  size = "s",
  variant = "secondary",
  disabled,
  showValue = true,
  id,
  "aria-describedby": describedBy,
  className,
  style,
}: ColorButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const fallbackId = useId();
  const [own, setOwn] = useState(defaultValue);
  // The colour while the picker is open: shown, but not yet committed.
  const [draft, setDraft] = useState<string | undefined>(undefined);
  const committed = value !== undefined ? value : own;
  const shown = draft ?? committed;
  const picked = isHex(shown);

  // React's onChange is the native "input" event, which fires on every drag.
  // The native "change" event fires once, when the picker closes on a new
  // colour, and is what a commit listens to.
  const commitRef = useRef<(next: string) => void>(() => {});
  commitRef.current = (next: string) => {
    setDraft(undefined);
    if (value === undefined) setOwn(next);
    onValueCommit?.(next);
  };
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const commit = () => commitRef.current(input.value);
    input.addEventListener("change", commit);
    return () => input.removeEventListener("change", commit);
  }, []);

  const open = () => {
    const input = inputRef.current;
    if (!input || disabled) return;
    // showPicker() opens it next to the field; older browsers only answer a click.
    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
        return;
      }
    } catch {
      // Not allowed here (a cross-origin frame): fall back to the click.
    }
    input.click();
  };

  return (
    <Row fitWidth className={className} style={style}>
      <Button
        id={id ?? fallbackId}
        size={size}
        variant={variant}
        weight="default"
        disabled={disabled}
        onClick={open}
        aria-describedby={describedBy}
        aria-label={picked ? `${label}: ${shown.toUpperCase()}` : label}
      >
        <Row gap="8" vertical="center">
          <Row
            aria-hidden="true"
            width="16"
            height="16"
            radius="xs"
            border="neutral-alpha-medium"
            style={{ background: picked ? shown : EMPTY_SWATCH }}
          />
          <Text
            textVariant="label-default-s"
            onBackground={picked ? "neutral-strong" : "neutral-medium"}
          >
            {picked && showValue ? shown.toUpperCase() : label}
          </Text>
        </Row>
      </Button>
      {/* The native field: out of the Tab order and hidden from assistive
        technology (the button is the control), but laid over the button so
        the browser opens its picker there. */}
      <input
        ref={inputRef}
        type="color"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        value={picked ? shown.toLowerCase() : "#888888"}
        onChange={(e) => {
          setDraft(e.target.value);
          onValueChange?.(e.target.value);
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          pointerEvents: "none",
          border: 0,
          padding: 0,
        }}
      />
    </Row>
  );
};
ColorButton.displayName = "ColorButton";

export type { ColorButtonProps };
export { ColorButton };
