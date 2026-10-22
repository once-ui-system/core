"use client";

import { useState } from "react";
import { Button, Column, DateInput, DatePicker, DropdownWrapper, Row, Text } from "@once-ui-system/core";

/**
 * Time picker check page — permanent regression fixture.
 *
 * Clicking the hour or minute stepper chevrons in a DatePicker's time panel
 * must change the time and keep the panel open, in a DateInput and in a
 * DropdownWrapper opened from a button (the scheduling pattern apps use).
 */
export default function TimePickerCheck() {
  const [inInput, setInInput] = useState<Date | undefined>(new Date(2026, 9, 23, 18, 1));
  const [inDropdown, setInDropdown] = useState<Date | undefined>(new Date(2026, 9, 23, 18, 1));

  return (
    <Row fillWidth gap="24" padding="24" data-testid="root">
      <Column gap="12" width={20} data-testid="case-input">
        <Text variant="label-strong-s">DateInput with time</Text>
        <DateInput id="timepicker-check-input" label="When" timePicker value={inInput} onChange={setInInput} />
      </Column>
      <Column gap="12" data-testid="case-dropdown">
        <Text variant="label-strong-s">DropdownWrapper with a button trigger</Text>
        <DropdownWrapper
          trigger={
            <Button variant="secondary" size="s" prefixIcon="calendar" data-testid="dropdown-trigger">
              {inDropdown?.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
            </Button>
          }
          dropdown={<DatePicker timePicker value={inDropdown} onChange={setInDropdown} />}
        />
      </Column>
    </Row>
  );
}
