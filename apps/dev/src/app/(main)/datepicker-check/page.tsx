"use client";

import { useState } from "react";
import { Column, DateInput, DatePicker, Row, Text } from "@once-ui-system/core";

/**
 * DatePicker check page — permanent regression fixture.
 *
 * Anchors the month/year selector behaviour inside the picker:
 *
 * 1. Opening the month selector must keep it open. It used to close itself
 *    a frame or two later, because the calendar grid is swapped for an
 *    ArrowNavigation-less copy while a selector is open and the remount
 *    moved focus out of the selector's wrapper, which DropdownWrapper's
 *    focusout handler reads as "focus left the panel".
 * 2. Only one of the two selectors may be open at a time.
 * 3. Closing a selector must not jump focus onto a calendar day; focus
 *    belongs on the trigger that was just used.
 *
 * Both a standalone picker and one nested in a DateInput dropdown, since
 * the nested case adds an outer DropdownWrapper whose own focusout
 * handler sees the same events.
 */
export default function DatePickerCheck() {
  const [standalone, setStandalone] = useState<Date | undefined>(new Date(2025, 8, 23));
  const [nested, setNested] = useState<Date | undefined>(new Date(2025, 8, 23));

  return (
    <Row fillWidth gap="24" padding="24" data-testid="root">
      <Column gap="12" data-testid="case-standalone">
        <Text variant="label-strong-s">Standalone DatePicker</Text>
        <Column
          border="neutral-alpha-medium"
          radius="l"
          padding="16"
          width={24}
          data-testid="standalone"
        >
          <DatePicker value={standalone} onChange={setStandalone} />
        </Column>
      </Column>

      <Column gap="12" width={20} data-testid="case-nested">
        <Text variant="label-strong-s">DateInput (picker in a dropdown)</Text>
        <DateInput
          id="datepicker-check-input"
          label="Date"
          value={nested}
          onChange={setNested}
          data-testid="nested-input"
        />
      </Column>
    </Row>
  );
}
