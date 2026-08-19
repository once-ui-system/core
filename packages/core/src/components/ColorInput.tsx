"use client";

import type { ChangeEvent } from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../classes/utils";
import { Column } from "./Column";
import { DropdownWrapper } from "./DropdownWrapper";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { Input, type InputProps } from "./Input";
import { Slider } from "./Slider";

export interface ColorInputProps extends Omit<InputProps, "onChange" | "value"> {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  supportAlpha?: boolean;
}

const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex) return "";
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6 && cleanHex.length !== 3) return hex;
  const normalizedHex =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((c) => c + c)
          .join("")
      : cleanHex;
  const r = parseInt(normalizedHex.slice(0, 2), 16);
  const g = parseInt(normalizedHex.slice(2, 4), 16);
  const b = parseInt(normalizedHex.slice(4, 6), 16);
  const a = Math.round((alpha / 100) * 100) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const rgbaToHex = (rgba: string): { hex: string; alpha: number } => {
  if (!rgba) return { hex: "", alpha: 100 };
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return { hex: "", alpha: 100 };
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  const a = match[4] !== undefined ? parseFloat(match[4]) * 100 : 100;
  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  return { hex, alpha: Math.round(a) };
};

const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(
  ({ label, id, value, onChange, supportAlpha = false, className, style, ...props }, ref) => {
    const colorInputRef = useRef<HTMLInputElement>(null);
    const [isAlphaDropdownOpen, setIsAlphaDropdownOpen] = useState(false);

    const isRgba = typeof value === "string" && value.startsWith("rgba");
    const { hex: currentHex, alpha: currentAlpha } = isRgba
      ? rgbaToHex(value)
      : { hex: value || "", alpha: 100 };

    const [hexValue, setHexValue] = useState(currentHex);
    const [alpha, setAlpha] = useState(currentAlpha);

    useEffect(() => {
      const isRgbaVal = typeof value === "string" && value.startsWith("rgba");
      const { hex: newHex, alpha: newAlpha } = isRgbaVal
        ? rgbaToHex(value)
        : { hex: value || "", alpha: 100 };
      setHexValue(newHex);
      setAlpha(newAlpha);
    }, [value]);

    const handleHexClick = () => {
      if (ref && typeof ref === "object" && ref.current) {
        ref.current.click();
      } else if (colorInputRef.current) {
        colorInputRef.current.click();
      }
    };

    const handleColorChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const newHex = e.target.value;
        setHexValue(newHex);
        if (supportAlpha) {
          const rgbaValue = hexToRgba(newHex, alpha);
          onChange({
            ...e,
            target: { ...e.target, value: rgbaValue },
            currentTarget: { ...e.currentTarget, value: rgbaValue },
          } as ChangeEvent<HTMLInputElement>);
        } else {
          onChange(e);
        }
      },
      [alpha, supportAlpha, onChange],
    );

    const handleAlphaChange = useCallback(
      (newAlpha: number) => {
        setAlpha(newAlpha);
        if (hexValue) {
          const rgbaValue = hexToRgba(hexValue, newAlpha);
          const target = { value: rgbaValue } as HTMLInputElement;
          onChange({
            target,
            currentTarget: target,
          } as ChangeEvent<HTMLInputElement>);
        }
      },
      [hexValue, onChange],
    );

    const handleReset = () => {
      setHexValue("");
      setAlpha(100);
      const target = { value: "" } as HTMLInputElement;
      onChange({
        target,
        currentTarget: target,
      } as ChangeEvent<HTMLInputElement>);
    };

    const displayColor = supportAlpha ? (hexValue ? hexToRgba(hexValue, alpha) : "") : hexValue;

    return (
      <Input
        id={id}
        ref={ref || colorInputRef}
        label={label}
        type="color"
        value={hexValue}
        onChange={handleColorChange}
        cursor="interactive"
        className={cn("cursor-pointer", className)}
        style={style}
        hasPrefix={
          <Flex vertical="center" className="relative items-center">
            <Flex
              vertical="center"
              horizontal="center"
              className={cn(
                "transition-all duration-micro-medium",
                hexValue ? "w-0 opacity-0 scale-0 overflow-hidden" : "w-20 opacity-100 scale-100",
              )}
            >
              <Icon
                marginLeft="4"
                padding="2"
                size="xs"
                name="eyeDropper"
                onBackground="neutral-medium"
              />
            </Flex>
            <Flex
              border="neutral-strong"
              cursor="interactive"
              radius="xs"
              onClick={handleHexClick}
              className={cn(
                "h-20 ml-4 rounded-xs border border-solid border-neutral-border-strong transition-all duration-micro-medium",
                hexValue
                  ? "w-20 opacity-100 scale-100"
                  : "w-0 opacity-0 scale-0 pointer-events-none hidden",
              )}
              style={{
                backgroundColor: displayColor || undefined,
              }}
            />
          </Flex>
        }
        hasSuffix={
          <Flex
            position="absolute"
            cursor="interactive"
            left="48"
            className={cn(
              "w-[calc(100%-var(--static-space-48))] select-none",
              !hexValue && "hidden",
            )}
          >
            <Flex
              onClick={handleHexClick}
              fillWidth
              className={cn(
                "transition-opacity duration-micro-medium text-neutral-on-background-strong font-body",
                hexValue ? "opacity-100" : "opacity-0",
              )}
            >
              {displayColor}
            </Flex>
            {hexValue && (
              <Flex
                position="absolute"
                right="12"
                gap="4"
                vertical="center"
                className="-translate-y-1/2 top-1/2"
              >
                {supportAlpha && (
                  <DropdownWrapper
                    isOpen={isAlphaDropdownOpen}
                    onOpenChange={setIsAlphaDropdownOpen}
                    placement="top-end"
                    trigger={
                      <IconButton
                        variant="secondary"
                        size="s"
                        tooltip="Adjust opacity"
                        tooltipPosition="left"
                        icon="opacity"
                        aria-label="Adjust opacity"
                      />
                    }
                    dropdown={
                      <Column padding="16" gap="12" fillWidth minWidth={12}>
                        <Slider
                          value={alpha}
                          onChange={handleAlphaChange}
                          min={0}
                          max={100}
                          step={1}
                          label="Opacity"
                          showValue
                        />
                      </Column>
                    }
                  />
                )}
                <IconButton
                  onClick={handleReset}
                  variant="secondary"
                  size="s"
                  tooltip="Remove"
                  tooltipPosition={supportAlpha ? "bottom" : "left"}
                  icon="close"
                  aria-label="Remove color"
                />
              </Flex>
            )}
          </Flex>
        }
        {...props}
      />
    );
  },
);

ColorInput.displayName = "ColorInput";

export { ColorInput };
