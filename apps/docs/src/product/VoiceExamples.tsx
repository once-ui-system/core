"use client";

import {
  Button,
  Column,
  Row,
  SegmentedControl,
  Text,
  type VoiceState,
  VoiceVisualizer,
} from "@once-ui-system/core";
import { useEffect, useState } from "react";

const STATES: { label: string; value: VoiceState }[] = [
  { label: "Idle", value: "idle" },
  { label: "Listening", value: "listening" },
  { label: "Thinking", value: "thinking" },
  { label: "Speaking", value: "speaking" },
];

// Switch states by hand, or hand it your microphone to see the live response.
export function VoiceStatesExample() {
  const [state, setState] = useState<VoiceState>("listening");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>();

  useEffect(
    () => () => {
      for (const track of stream?.getTracks() ?? []) track.stop();
    },
    [stream],
  );

  const toggleMic = async () => {
    if (stream) {
      setStream(null);
      return;
    }
    try {
      setStream(await navigator.mediaDevices.getUserMedia({ audio: true }));
      setState("listening");
      setError(undefined);
    } catch {
      setError("The microphone is blocked in this browser.");
    }
  };

  return (
    <Column fillWidth gap="32" horizontal="center" paddingY="24">
      <Row gap="48" vertical="center" wrap horizontal="center">
        <VoiceVisualizer size="l" state={state} source={stream} />
        <VoiceVisualizer size="l" variant="bars" state={state} source={stream} />
      </Row>
      <Column gap="12" horizontal="center" fillWidth maxWidth={32}>
        <SegmentedControl
          aria-label="Voice state"
          buttons={STATES}
          value={state}
          onChange={(value) => setState(value as VoiceState)}
        />
        <Button size="s" variant="secondary" onClick={toggleMic}>
          {stream ? "Stop microphone" : "Try with your microphone"}
        </Button>
        {error && (
          <Text variant="body-default-xs" onBackground="danger-weak">
            {error}
          </Text>
        )}
      </Column>
    </Column>
  );
}
