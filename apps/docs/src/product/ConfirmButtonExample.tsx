"use client";

import { ConfirmButton, Row, Text } from "@once-ui-system/core";
import { useState } from "react";

/** ConfirmButton's two modes, with what each last did. */
export function ConfirmButtonExample() {
  const [last, setLast] = useState("Nothing yet");
  return (
    <Row gap="12" horizontal="center" vertical="center" wrap>
      <ConfirmButton
        label="Manual trip"
        labels={{ confirm: "Press again to trip" }}
        onConfirm={() => setLast("Tripped")}
      />
      <ConfirmButton mode="hold" label="Hold to silence" onConfirm={() => setLast("Silenced")} />
      <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
        {last}
      </Text>
    </Row>
  );
}
