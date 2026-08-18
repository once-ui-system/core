"use client";

import type { ChangeEvent } from "react";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "../classes/utils";
import { Column } from "./Column";
import { Flex } from "./Flex";
import { IconButton } from "./IconButton";
import { Input, type InputProps } from "./Input";

export interface NumberInputProps extends Omit<InputProps, "type" | "value" | "onChange"> {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  padStart?: number;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, min, max, step = 1, padStart, className, ...props }, ref) => {
    const [localValue, setLocalValue] = useState<string>(
      padStart && value !== undefined
        ? value.toString().padStart(padStart, "0")
        : (value?.toString() ?? ""),
    );

    useEffect(() => {
      if (value !== undefined) {
        setLocalValue(padStart ? value.toString().padStart(padStart, "0") : value.toString());
      }
    }, [value, padStart]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      const numValue = parseFloat(newValue);
      if (!Number.isNaN(numValue) && onChange) {
        onChange(numValue);
      }
    };

    const updateValue = (newValue: number) => {
      const formattedValue = padStart
        ? newValue.toString().padStart(padStart, "0")
        : newValue.toString();
      setLocalValue(formattedValue);
      onChange?.(newValue);
    };

    const increment = () => {
      const currentValue = parseFloat(localValue) || 0;
      const newValue = currentValue + step;
      if (max === undefined || newValue <= max) {
        updateValue(newValue);
      }
    };

    const decrement = () => {
      const currentValue = parseFloat(localValue) || 0;
      const newValue = currentValue - step;
      if (min === undefined || newValue >= min) {
        updateValue(newValue);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="number"
        value={localValue}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        hasSuffix={
          <>
            <Flex position="static" minWidth={1.25} />
            <Column
              position="absolute"
              right="0"
              top="0"
              borderLeft="neutral-medium"
              fillHeight
              background="neutral-alpha-weak"
            >
              <Flex
                fillHeight
                position="static"
                borderBottom="neutral-medium"
                transition="micro-medium"
                vertical="center"
                paddingX="4"
                className="hover:bg-neutral-alpha-medium"
              >
                <IconButton
                  icon="chevronUp"
                  variant="ghost"
                  size="s"
                  onClick={increment}
                  aria-label="Increment value"
                />
              </Flex>
              <Flex
                fillHeight
                position="static"
                vertical="center"
                transition="micro-medium"
                paddingX="4"
                className="hover:bg-neutral-alpha-medium"
              >
                <IconButton
                  icon="chevronDown"
                  variant="ghost"
                  size="s"
                  onClick={decrement}
                  aria-label="Decrement value"
                />
              </Flex>
            </Column>
          </>
        }
        className={cn(
          "[&_input[type=number]]:[appearance:textfield] [&_input[type=number]::-webkit-inner-spin-button]:m-0 [&_input[type=number]::-webkit-inner-spin-button]:[appearance:none] [&_input[type=number]::-webkit-outer-spin-button]:m-0 [&_input[type=number]::-webkit-outer-spin-button]:[appearance:none]",
          className,
        )}
      />
    );
  },
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
