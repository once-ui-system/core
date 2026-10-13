"use client";

import React, { forwardRef, useCallback, useEffect, useId, useRef, useState } from "react";
import { DateRange, DateRangePicker } from "./DateRangePicker";
import { DropdownComboboxContext } from "./DropdownTriggerContext";
import { DropdownWrapper } from "./DropdownWrapper";
import { Flex } from "./Flex";
import { Input } from "./Input";
import { Row } from "./Row";

interface DateRangeInputProps
  extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value" | "label"> {
  id: string;
  startLabel: string;
  endLabel: string;
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  minHeight?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface LocalizedDateRange {
  startDate: string | null;
  endDate: string | null;
}

const formatDateRange = (range: DateRange): LocalizedDateRange => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return {
    startDate: range.startDate?.toLocaleDateString("en-US", options) || null,
    endDate: range.endDate?.toLocaleDateString("en-US", options) || null,
  };
};

/**
 * Two fields, start and end, each a combobox that opens the same range picker
 * dialog: see DateInput. They used to sit inside DropdownWrapper's two
 * `role="button"` wrappers (axe "nested-interactive"), and the picker inside
 * a listbox with no options.
 */
const DateRangeInput = forwardRef<HTMLDivElement, DateRangeInputProps>(
  (
    {
      id,
      startLabel = "Start",
      endLabel = "End",
      value,
      onChange,
      error,
      minHeight,
      className,
      style,
      onClick,
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(
      value ? formatDateRange(value) : { startDate: "", endDate: "" },
    );
    const dialogId = `${useId()}-dialog`;
    /** The field that opened the picker, which gets focus back when it closes. */
    const openerRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      if (value) {
        setInputValue(formatDateRange(value));
      }
    }, [value]);

    const handleDateChange = useCallback(
      (range: DateRange) => {
        setInputValue(formatDateRange(range));
        onChange?.(range);
        if (range.endDate != undefined) {
          setIsOpen(false);
        }
      },
      [onChange],
    );

    /** Opens on a click, Enter, Space or ArrowDown, not on focus: see DateInput. */
    const open = (field: HTMLInputElement) => {
      openerRef.current = field;
      setIsOpen(true);
    };

    const handleFieldKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (!isOpen && ["Enter", " ", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        open(event.currentTarget);
      } else if (isOpen && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen(false);
      }
    };

    const handleFieldClick = (event: React.MouseEvent<HTMLInputElement>) => {
      onClick?.(event);
      open(event.currentTarget);
    };

    /** Escape inside the picker closes it and hands focus back to the field that opened it. */
    const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      // A month or year list inside the picker closed itself.
      if (event.defaultPrevented) return;
      event.preventDefault();
      setIsOpen(false);
      openerRef.current?.focus({ preventScroll: true });
    };

    const field = {
      className: "cursor-interactive",
      style: {
        textOverflow: "ellipsis",
      },
      id,
      error,
      readOnly: true,
      onClick: handleFieldClick,
      onKeyDown: handleFieldKeyDown,
      role: "combobox",
      "aria-haspopup": "dialog",
      "aria-expanded": isOpen,
      "aria-controls": isOpen ? dialogId : undefined,
    } as const;

    const trigger = (
      <Row fillWidth horizontal="center" gap="-1">
        <Input
          {...field}
          corners={"left"}
          placeholder={startLabel}
          // The placeholder is all that shows of the label, and only while
          // the field is empty.
          aria-label={startLabel}
          value={inputValue.startDate ?? ""}
          {...rest}
        />
        <Input
          {...field}
          corners={"right"}
          placeholder={endLabel}
          aria-label={endLabel}
          value={inputValue.endDate ?? ""}
          {...rest}
        />
      </Row>
    );

    const dropdown = (
      <Flex
        padding="20"
        center={true}
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-label={rest["aria-label"] || `${startLabel} – ${endLabel}`}
        onKeyDown={handleDialogKeyDown}
      >
        <DateRangePicker value={value} onChange={handleDateChange} autoFocus />
      </Flex>
    );

    return (
      <DropdownComboboxContext.Provider value={true}>
        <DropdownWrapper
          ref={ref}
          fillWidth={false}
          trigger={trigger}
          minHeight={minHeight}
          dropdown={dropdown}
          open={isOpen}
          closeAfterClick={false}
          disableTriggerClick={true}
          className={className}
          style={{ ...style }}
          onOpenChange={setIsOpen}
          handleArrowNavigation={false}
        />
      </DropdownComboboxContext.Provider>
    );
  },
);

DateRangeInput.displayName = "DateRangeInput";

export { DateRangeInput };
