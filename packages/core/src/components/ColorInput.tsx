"use client";

import React, { useRef, forwardRef, useState, useCallback } from "react";
import { Flex, Input, InputProps, IconButton, Icon, DropdownWrapper, Slider, Column } from ".";

interface ColorInputProps extends Omit<InputProps, "onChange" | "value"> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  supportAlpha?: boolean;
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

const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(
  ({ label, id, value, onChange, supportAlpha = false, ...props }, ref) => {
    const colorInputRef = useRef<HTMLInputElement>(null);
    const [isAlphaDropdownOpen, setIsAlphaDropdownOpen] = useState(false);
    
    const isRgba = value.startsWith("rgba");
    const { hex: currentHex, alpha: currentAlpha } = isRgba ? rgbaToHex(value) : { hex: value, alpha: 100 };
    const [hexValue, setHexValue] = useState(currentHex);
    const [alpha, setAlpha] = useState(currentAlpha);

    const handleHexClick = () => {
      if (colorInputRef.current) {
        colorInputRef.current.click();
      }
    };

    const handleColorChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHex = e.target.value;
        setHexValue(newHex);
        if (supportAlpha) {
          const rgbaValue = hexToRgba(newHex, alpha);
          onChange({
            target: { value: rgbaValue },
          } as React.ChangeEvent<HTMLInputElement>);
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
          onChange({
            target: { value: rgbaValue },
          } as React.ChangeEvent<HTMLInputElement>);
        }
      },
      [hexValue, onChange],
    );

    const handleReset = () => {
      setHexValue("");
      setAlpha(100);
      onChange({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
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
        hasPrefix={
          <Flex>
            <Flex
              width={hexValue ? "0" : "20"}
              opacity={hexValue ? 0 : 100}
              transition="micro-medium"
              style={{
                transform: hexValue ? "scale(0)" : "scale(1)",
              }}
            >
              <Icon marginLeft="4" padding="2" size="xs" name="eyeDropper" onBackground="neutral-medium" />
            </Flex>
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
            />
          </Flex>
        }
        hasSuffix={
          <Flex
            className={`suffix ${hexValue ? "" : "hidden"}`}
            position="absolute"
            cursor="interactive"
            left="48"
            style={{
              width: "calc(100% - var(--static-space-48))",
            }}
          >
            <Flex
              onClick={handleHexClick}
              fillWidth
              opacity={hexValue ? 100 : 0}
              transition="micro-medium"
            >
              {supportAlpha ? `rgba(${hexValue ? hexToRgba(hexValue, alpha).match(/\d+/g)?.join(", ") : ""})` : hexValue}
            </Flex>
            {hexValue && (
              <Flex
                position="absolute"
                right="12"
                gap="4"
                style={{
                  transform: "translateY(-50%)",
                }}>
                {supportAlpha && (
                  <DropdownWrapper
                    isOpen={isAlphaDropdownOpen}
                    onOpenChange={setIsAlphaDropdownOpen}
                    placement="top-end"
                    trigger={
                      <IconButton
                        variant="secondary"
                        tooltip="Adjust opacity"
                        tooltipPosition="left"
                        icon="opacity"
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
                  tooltip="Remove"
                  tooltipPosition={supportAlpha ? "bottom" : "left"}
                  icon="close"
                />
              </Flex>
            )}
          </Flex>
        }
        onChange={handleColorChange}
      />
    );
  },
);

ColorInput.displayName = "ColorInput";

export { ColorInput };
export type { ColorInputProps };
