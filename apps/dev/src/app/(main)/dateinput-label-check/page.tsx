"use client";

import { Button, Column, DateInput, Input, Row, Text } from "@once-ui-system/core";
import { useState } from "react";

/**
 * DateInput label check page — regression fixture for the floating label.
 *
 * An empty DateInput's label rests in the field, like Input's, until the
 * field is focused or holds a date. Opening the picker and closing it again
 * without a pick (a click outside, Escape) leaves an empty field, so the
 * label rests again once focus has left the field.
 */
export default function DateInputLabelCheck() {
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <Column gap="24" padding="24" maxWidth="xs" data-testid="root">
      <Text textVariant="label-strong-s">Floating label</Text>
      <Input id="plain-input" label="Plain input" />
      <DateInput id="date-empty" label="Date" value={date} onValueChange={setDate} />
      <DateInput id="date-uncontrolled" label="Uncontrolled date" />
      <DateInput id="date-filled" label="Filled date" defaultValue={new Date(2026, 10, 10)} />
      <Row gap="8">
        <Button size="s" variant="secondary" onClick={() => setDate(undefined)} data-testid="clear">
          Clear
        </Button>
      </Row>
      <Text data-testid="outside" onBackground="neutral-weak">
        Outside area
      </Text>
    </Column>
  );
}
