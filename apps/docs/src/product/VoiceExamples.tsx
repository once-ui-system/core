"use client";

import {
  Button,
  Column,
  Mascot,
  type MascotMood,
  type MascotState,
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

const MASCOT_STATES: { label: string; value: MascotState }[] = [
  { label: "Idle", value: "idle" },
  { label: "Listening", value: "listening" },
  { label: "Thinking", value: "thinking" },
  { label: "Speaking", value: "speaking" },
  { label: "Sleeping", value: "sleeping" },
];

const MASCOT_MOODS: { label: string; value: MascotMood }[] = [
  { label: "Neutral", value: "neutral" },
  { label: "Happy", value: "happy" },
  { label: "Surprised", value: "surprised" },
  { label: "Sad", value: "sad" },
];

// Move the pointer around: the eyes follow it.
export function MascotStatesExample() {
  const [state, setState] = useState<MascotState>("idle");
  const [mood, setMood] = useState<MascotMood>("neutral");

  return (
    <Column fillWidth gap="24" horizontal="center" paddingY="24">
      <Row gap="40" vertical="center" wrap horizontal="center">
        <Mascot size="xl" state={state} mood={mood} />
        <Mascot size="xl" state={state} mood={mood} shape="orb" eyes="pill" />
        <Mascot
          size="xl"
          state={state}
          mood={mood}
          shape="squircle"
          eyes="visor"
          accessory="antenna"
        />
      </Row>
      <Column gap="12" horizontal="center" fillWidth maxWidth={36}>
        <SegmentedControl
          aria-label="Mascot state"
          buttons={MASCOT_STATES}
          value={state}
          onChange={(value) => setState(value as MascotState)}
        />
        <SegmentedControl
          aria-label="Mascot mood"
          buttons={MASCOT_MOODS}
          value={mood}
          onChange={(value) => setMood(value as MascotMood)}
        />
      </Column>
    </Column>
  );
}
