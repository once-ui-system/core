"use client";
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { mergeLabels } from "../internal/labels";
import { Column } from "./Column";
import { Dropdown } from "./Dropdown";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { Input, InputProps } from "./Input";
import { Slider } from "./Slider";

/** The field's own controls. Omitted fields keep the English default. */
interface ColorInputLabels {
  /** The clear button's name and tooltip. Defaults to `"Remove"`. */
  remove?: string;
  /** The opacity button's name and tooltip, with `supportAlpha`. Defaults to `"Adjust opacity"`. */
  adjustOpacity?: string;
  /** The opacity slider's label, with `supportAlpha`. Defaults to `"Opacity"`. */
  opacity?: string;
}

const DEFAULT_LABELS: Required<ColorInputLabels> = {
  remove: "Remove",
  adjustOpacity: "Adjust opacity",
  opacity: "Opacity",
};

interface ColorInputProps extends Omit<InputProps, "value" | "defaultValue" | "onValueChange"> {
  /** The colour, controlled: a hex, or an `rgba()` with `supportAlpha`. Leave
   *  it out to let the field keep its own, starting from `defaultValue`. */
  value?: string;
  /** The starting colour of an uncontrolled ColorInput (no `value`). */
  defaultValue?: string;
  /** Receives the new colour after a pick, an opacity change or a clear (`""`). */
  onValueChange?: (value: string) => void;
  supportAlpha?: boolean;
  /** The clear and opacity controls' text, for a translated interface. */
  labels?: ColorInputLabels;
}
const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex) return "";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
};
const rgbaToHex = (rgba: string): { hex: string; alpha: number } => {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return { hex: "", alpha: 100 };
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  const a = match[4] ? parseFloat(match[4]) * 100 : 100;
  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  return { hex, alpha: Math.round(a) };
};
/** The hex colour and the opacity (0–100) a `value` holds. */
const parseValue = (value: string | undefined): { hex: string; alpha: number } =>
  !value
    ? { hex: "", alpha: 100 }
    : value.startsWith("rgba")
      ? rgbaToHex(value)
      : { hex: value, alpha: 100 };
const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(
  (
    {
      label,
      id,
      value,
      defaultValue,
      onValueChange,
      onChange,
      supportAlpha = false,
      labels,
      ...props
    },
    ref,
  ) => {
    const text = mergeLabels(DEFAULT_LABELS, labels);
    const colorInputRef = useRef<HTMLInputElement>(null);
    // The input needs its own ref to open the picker from the swatch; this
    // hands the same element to the caller's ref.
    useImperativeHandle(ref, () => colorInputRef.current as HTMLInputElement);
    const [isAlphaDropdownOpen, setIsAlphaDropdownOpen] = useState(false);
    // Uncontrolled, these are the colour itself, from `defaultValue`.
    const [hexValue, setHexValue] = useState(() => parseValue(value ?? defaultValue).hex);
    const [alpha, setAlpha] = useState(() => parseValue(value ?? defaultValue).alpha);

    /**
     * Follow `value` after mount. It used to seed the state once and never
     * again, so a colour changed from outside (a reset, a value loaded later,
     * an undo) left the field showing the old one, as NumberInput did.
     * Only a CHANGE of the prop is followed, so the echo of the user's own
     * pick sets what the field already shows, and a parent that never passes
     * the pick back keeps it. Adjusted during render rather than in an
     * effect, so the field never paints the stale colour first.
     */
    const [followed, setFollowed] = useState(value);
    if (value !== followed) {
      setFollowed(value);
      const next = parseValue(value);
      setHexValue(next.hex);
      setAlpha(next.alpha);
    }
    const handleHexClick = () => {
      if (colorInputRef.current) {
        colorInputRef.current.click();
      }
    };
    const handleColorChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHex = e.target.value;
        setHexValue(newHex);
        // The native event first, so a form library's `register()` hears it.
        onChange?.(e);
        if (supportAlpha) {
          const rgbaValue = hexToRgba(newHex, alpha);
          onValueChange?.(rgbaValue);
        } else {
          onValueChange?.(newHex);
        }
      },
      [alpha, supportAlpha, onChange, onValueChange],
    );
    const handleAlphaChange = useCallback(
      (newAlpha: number) => {
        setAlpha(newAlpha);
        if (hexValue) {
          const rgbaValue = hexToRgba(hexValue, newAlpha);
          onValueChange?.(rgbaValue);
        }
      },
      [hexValue, onValueChange],
    );
    const handleReset = () => {
      setHexValue("");
      setAlpha(100);
      onValueChange?.("");
    };
    return (
      <Input
        style={{ cursor: "pointer" }}
        id={id}
        ref={colorInputRef}
        label={label}
        type="color"
        value={hexValue}
        {...props}
        prefix={
          <Flex>
            {" "}
            <Flex
              width={hexValue ? "0" : "20"}
              opacity={hexValue ? 0 : 100}
              transition="micro-medium"
              style={{ transform: hexValue ? "scale(0)" : "scale(1)" }}
            >
              {" "}
              <Icon
                marginLeft="4"
                padding="2"
                size="xs"
                name="eyeDropper"
                onBackground="neutral-medium"
              />{" "}
            </Flex>{" "}
            <Flex
              border="neutral-strong"
              className={`prefix ${hexValue ? "" : "hidden"}`}
              onClick={handleHexClick}
              height="20"
              marginLeft="4"
              width={hexValue ? "20" : "0"}
              cursor="interactive"
              radius="xs"
              opacity={hexValue ? 100 : 0}
              transition="micro-medium"
              style={{
                backgroundColor: supportAlpha ? hexToRgba(hexValue, alpha) : hexValue,
                transform: hexValue ? "scale(1)" : "scale(0)",
              }}
            />{" "}
          </Flex>
        }
        suffix={
          <Flex
            className={`suffix ${hexValue ? "" : "hidden"}`}
            position="absolute"
            cursor="interactive"
            left="48"
            style={{ width: "calc(100% - var(--static-space-48))" }}
          >
            {" "}
            <Flex
              onClick={handleHexClick}
              fillWidth
              opacity={hexValue ? 100 : 0}
              transition="micro-medium"
            >
              {" "}
              {hexValue
                ? supportAlpha && alpha < 100
                  ? `${hexValue} ${alpha}%`
                  : hexValue
                : ""}{" "}
            </Flex>{" "}
            {hexValue && (
              <Flex
                position="absolute"
                right="12"
                gap="4"
                style={{ transform: "translateY(-50%)" }}
              >
                {" "}
                {supportAlpha && (
                  <Dropdown
                    open={isAlphaDropdownOpen}
                    onOpenChange={setIsAlphaDropdownOpen}
                    placement="top-end"
                    trigger={
                      <IconButton
                        variant="secondary"
                        tooltip={text.adjustOpacity}
                        tooltipPosition="left"
                        icon="opacity"
                      />
                    }
                  >
                    <Column padding="16" gap="12" fillWidth minWidth="12rem">
                      {" "}
                      <Slider
                        value={alpha}
                        onValueChange={handleAlphaChange}
                        min={0}
                        max={100}
                        step={1}
                        label={text.opacity}
                        showValue
                      />{" "}
                    </Column>
                  </Dropdown>
                )}{" "}
                <IconButton
                  onClick={handleReset}
                  variant="secondary"
                  tooltip={text.remove}
                  tooltipPosition={supportAlpha ? "bottom" : "left"}
                  icon="close"
                />{" "}
              </Flex>
            )}{" "}
          </Flex>
        }
        onChange={handleColorChange}
      />
    );
  },
);
ColorInput.displayName = "ColorInput";

export type { ColorInputLabels, ColorInputProps };
export { ColorInput };
