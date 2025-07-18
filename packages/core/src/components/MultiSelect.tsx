"use client";

import React, { useState, useEffect, forwardRef } from "react";
import classNames from "classnames";
import styles from "./Component.module.scss";
import { Badge, Column, DropdownWrapper, Flex, Input, Option, Tag } from ".";

type MultiSelectOptions = {
  label: string;
  value: string;
};

interface MultiSelectProps extends React.ComponentProps<typeof Flex> {
  className?: string;
  style?: React.CSSProperties;
  options: MultiSelectOptions[];
  values: string[];
  onValuesChange: (value: string[]) => void;
}

const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ className, style, options, onValuesChange, values, ...rest }, ref) => {
    const [selected, _] = useState("");
    const [internalValues, setInternalValues] = useState(values);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [inputOptions, setInputOptions] =
      useState<MultiSelectOptions[]>(options);

    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
      let removedFilterOptions = options.filter(
        (option) => !internalValues.includes(option.label)
      );

      console.log(removedFilterOptions);
      let filteredOptions = removedFilterOptions.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      );

      if (filteredOptions.length === 0) {
        setInputOptions([
          {
            label: "No results found",
            value: "No results found",
          },
        ]);
        return;
      }
      setInputOptions(filteredOptions);
    }, [inputValue, options]);

    const handleSelect = (value: string) => {
      if (internalValues.includes(value)) return;
      setIsDropdownOpen(false);
      setInputValue("");
      setInternalValues((prev) => [...prev, value]);
    };

    const removeValue = (i: number) => {
      const removedValues = internalValues.filter((_, index) => index !== i);
      setInternalValues(removedValues);
    };
    useEffect(() => {
      onValuesChange(internalValues);
    }, [internalValues, onValuesChange]);
    return (
      <>
        <DropdownWrapper
          fillWidth
          isOpen={isDropdownOpen}
          onOpenChange={setIsDropdownOpen}
          placement="bottom"
          onSelect={handleSelect}
          selectedOption={selected}
          trigger={
            <Flex direction="row" center fillWidth>
              {internalValues.map(
                (value, index) =>
                  value.length > 0 && (
                    <Tag
                      prefixIcon="close"
                      key={index}
                      onClick={() => removeValue(index)}
                      variant="neutral"
                    >
                      {value}
                    </Tag>
                  )
              )}
              <Input
                onFocus={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(true);
                }}
                className="fill-width"
                id="test-multi-select"
                label="multi-select"
                value={inputValue}
                cursor="interactive"
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setIsDropdownOpen(true);
                }}
              />
            </Flex>
          }
          dropdown={
            <Column fillWidth padding="4">
              {inputOptions.map((option, index) => (
                <Option
                  key={index}
                  label={option.label}
                  value={option.label}
                  selected={selected === option.value}
                  onClick={handleSelect}
                />
              ))}
            </Column>
          }
        />
      </>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
export { MultiSelect };
