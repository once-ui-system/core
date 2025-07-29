"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useRef,
  KeyboardEventHandler,
} from "react";
import classNames from "classnames";
import { Column, DropdownWrapper, Flex, Icon, Option, Chip, OptionProps } from ".";
import styles from "./MultiSelect.module.scss";

type SelectOptionType = Omit<OptionProps, "selected">;

interface MultiSelectProps extends React.ComponentProps<typeof Flex> {
  className?: string;
  style?: React.CSSProperties;
  options: SelectOptionType[];
  values: string[];
  onValuesChange: (value: string[]) => void;
}

const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ className, style, options, onValuesChange, values, ...rest }, ref) => {
    const [highlightedOption, setHighlightedOption] = useState("");
    const [selectedValues, setSelectedValues] = useState(values);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const flagsArray = Array(options.length).fill(false);
    const [selectedFlags, setSelectedFlags] = useState<boolean[]>(flagsArray);

    const [filteredOptions, setFilteredOptions] =
      useState<SelectOptionType[]>(options);

    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      let filtered = options.filter((option) =>
        String(option.label).toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
      setHighlightedOption(filtered.length > 0 ? filtered[0].value : "");
    }, [inputValue, options, selectedValues, selectedFlags]);

    const handleSelect = (value: string) => {
      const optionIndex = options.findIndex((option) => option.label === value);
      const isSelected = selectedValues.includes(value);
      if (!isSelected) {
        setSelectedValues((prev) => [...prev, value]);
        setSelectedFlags((prev) => {
          const updated = [...prev];
          updated[optionIndex] = true;
          return updated;
        });
      } else {
        setSelectedValues((prev) => prev.filter((v) => v !== value));
        setSelectedFlags((prev) => {
          const updated = [...prev];
          updated[optionIndex] = false;
          return updated;
        });
      }
      setInputValue("");
      inputRef.current?.focus();
      setIsDropdownOpen(true);
    };

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (e.key === "Backspace" && inputValue.length === 0) {
        e.preventDefault();

        let optionIndex = options.findIndex(
          (option) => option.label === selectedValues[selectedValues.length - 1]
        );
        if (optionIndex === -1) return;
        setSelectedFlags((prev) => {
          let updated = [...prev];
          updated[optionIndex] = false;
          return updated;
        });

        setSelectedValues((prev) => {
          const updated = [...prev];
          if (prev.length > 0) updated.pop();
          return updated;
        });
      }
    };

    const removeValue = (i: number) => {
      const removedValue = selectedValues[i];
      const removedValues = selectedValues.filter((_, index) => index !== i);
      setSelectedValues(removedValues);
      const optionIndex = options.findIndex(
        (option) => option.label === removedValue
      );
      setSelectedFlags((prev) => {
        const updated = [...prev];
        if (optionIndex !== -1) updated[optionIndex] = false;
        return updated;
      });
      inputRef.current?.focus();
    };
    useEffect(() => {
      onValuesChange(selectedValues);
    }, [selectedValues, onValuesChange, selectedFlags]);
    return (
      <>
        <DropdownWrapper
          fillWidth
          isOpen={isDropdownOpen}
          onOpenChange={setIsDropdownOpen}
          placement="bottom"
          onSelect={handleSelect}
          selectedOption={highlightedOption}
          closeAfterClick={false}
         
          trigger={
            <Flex
              direction="row"
              wrap
              paddingY="4"
              style={{
                ...style,
              }}
              gap="4"
              ref={ref}
              {...rest}
              className={classNames(styles.multiSelectContainer, className)}
              onClick={() => inputRef.current?.focus()}
            >
              {selectedValues.map((value, index) => (
                <Chip
                  key={value}
                  label={value}
                  onRemove={() => removeValue(index)}
                  radius="xs"
                  aria-label={`Remove tag ${value}`}
                />
              ))}
              <Flex center gap="4" direction="row">
                <Icon name="search" size="s" />
                <input
                  onKeyDown={handleKeyDown}
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder={selectedValues.length === 0 ? "Select" : ""}
                  className={classNames(styles.multiSelectInput)}
                />
              </Flex>
            </Flex>
          }
          dropdown={
            <Column fillWidth padding="4" gap="4">
              {filteredOptions.length === 0 ? (
                <Option label="No results found" value="No results found" />
              ) : (
                filteredOptions.map((option, _) => {
                  const optionIndex = options.findIndex(
                    (o) => o.label === option.label
                  );
                  return (
                    <Option
                      key={optionIndex}
                      label={option.label}
                      value={String(option.value)}
                      selected={selectedFlags[optionIndex]}
                      onClick={() => handleSelect(String(option.label))}
                      hasSuffix={
                        selectedFlags[optionIndex] ? (
                          <Icon name="check" size="xs" />
                        ) : undefined
                      }
                    />
                  );
                })
              )}
            </Column>
          }
        />
      </>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
export { MultiSelect };
