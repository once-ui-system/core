"use client";

import { Column, Input, Kbd, Row, Text, useHotkeys } from "@once-ui-system/core";
import { useState } from "react";

export function UseHotkeysExample() {
  const [count, setCount] = useState(0);
  const [last, setLast] = useState("nothing yet");

  useHotkeys("c", () => setCount((value) => value + 1));
  useHotkeys(["j", "down"], (_event, hotkey) => setLast(hotkey));
  useHotkeys("g i", () => setLast("g i"));

  return (
    <Column gap="16" maxWidth="24rem">
      <Row gap="8" vertical="center" textVariant="body-default-s">
        <Text>Press</Text>
        <Kbd>C</Kbd>
        <Text>to count: {count}</Text>
      </Row>
      <Row gap="8" vertical="center" textVariant="body-default-s">
        <Text>Press</Text>
        <Kbd>J</Kbd>
        <Text>,</Text>
        <Kbd>↓</Kbd>
        <Text>or</Text>
        <Kbd>G</Kbd>
        <Text>then</Text>
        <Kbd>I</Kbd>
        <Text>. Last: {last}</Text>
      </Row>
      <Input id="hotkeys-typing" label="Type a c here: it does not count" />
    </Column>
  );
}
