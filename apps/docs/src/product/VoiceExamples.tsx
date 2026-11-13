"use client";

import {
  Button,
  Column,
  Input,
  Mascot,
  type MascotMood,
  type MascotState,
  readSeedWords,
  Row,
  SegmentedControl,
  Tag,
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
      <Column gap="12" horizontal="center" fillWidth maxWidth="32rem">
        <SegmentedControl
          aria-label="Voice state"
          buttons={STATES}
          value={state}
          onValueChange={(value) => setState(value as VoiceState)}
        />
        <Button size="s" variant="secondary" onClick={toggleMic}>
          {stream ? "Stop microphone" : "Try with your microphone"}
        </Button>
        {error && (
          <Text textVariant="body-default-xs" onBackground="danger-weak">
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
        <Mascot size="xl" state={state} mood={mood} roundness={1} eyes="round" color="accent" />
        <Mascot size="xl" state={state} mood={mood} aspect={1.25} eyes="wide" color="neutral" />
      </Row>
      <Column gap="12" horizontal="center" fillWidth maxWidth="36rem">
        <SegmentedControl
          aria-label="Mascot state"
          buttons={MASCOT_STATES}
          value={state}
          onValueChange={(value) => setState(value as MascotState)}
        />
        <SegmentedControl
          aria-label="Mascot mood"
          buttons={MASCOT_MOODS}
          value={mood}
          onValueChange={(value) => setMood(value as MascotMood)}
        />
      </Column>
    </Column>
  );
}

const CUBE_STATES: { label: string; value: MascotState }[] = [
  { label: "Idle", value: "idle" },
  { label: "Thinking", value: "thinking" },
  { label: "Speaking", value: "speaking" },
  { label: "Sleeping", value: "sleeping" },
];

// Set it thinking: the blob firms into a d20 and tumbles. Back to idle, it lands face on, holds a
// beat and softens into the blob with its face.
export function MascotD20Example() {
  const [state, setState] = useState<MascotState>("thinking");

  return (
    <Column fillWidth gap="24" horizontal="center" paddingY="24">
      <Row gap="24" vertical="center" wrap horizontal="center">
        <Mascot working="d20" size="xl" state={state} mood="happy" />
        <Mascot working="d20" size="xl" state={state} mood="happy" color="accent" eyes="pill" />
        <Mascot working="d20" size="xl" state={state} mood="happy" surface="matte" face="flat" />
      </Row>
      <Column gap="12" horizontal="center" fillWidth maxWidth="36rem">
        <SegmentedControl
          aria-label="D20 mascot state"
          buttons={CUBE_STATES}
          value={state}
          onValueChange={(value) => setState(value as MascotState)}
        />
      </Column>
    </Column>
  );
}

// Set it thinking: the blob becomes the cube and turns its layers. Back to idle, it solves the
// cube, shows the logo and softens into the blob with its face.
export function MascotCubeExample() {
  const [state, setState] = useState<MascotState>("thinking");
  const [mood, setMood] = useState<MascotMood>("happy");

  return (
    <Column fillWidth gap="24" horizontal="center" paddingY="24">
      <Row gap="24" vertical="center" wrap horizontal="center">
        <Mascot working="cube" size="xl" state={state} mood={mood} />
        <Mascot
          working="cube"
          size="xl"
          state={state}
          mood={mood}
          sides="tints"
          face="flat"
          eyes="tile"
        />
        <Mascot
          working="cube"
          size="xl"
          state={state}
          mood={mood}
          sides="mono"
          surface="flat"
          eyes="pill"
          color="accent"
        />
      </Row>
      <Column gap="12" horizontal="center" fillWidth maxWidth="36rem">
        <SegmentedControl
          aria-label="Cube mascot state"
          buttons={CUBE_STATES}
          value={state}
          onValueChange={(value) => setState(value as MascotState)}
        />
        <SegmentedControl
          aria-label="Cube mascot mood"
          buttons={MASCOT_MOODS}
          value={mood}
          onValueChange={(value) => setMood(value as MascotMood)}
        />
      </Column>
    </Column>
  );
}

const SEED_IDEAS = ["happy-red-fox", "sleepyPandaDJ", "royal-ink-cat", "curious-mint-robot", "party-frog", "astro-owl"];

/** Type a seed and see the mascot it makes, with the words it understood. */
export function MascotSeedExample() {
  const [seed, setSeed] = useState("happy-red-fox");
  const reading = readSeedWords(seed);

  return (
    <Column fillWidth gap="20" horizontal="center" paddingY="24">
      <Mascot size="xl" seed={seed || " "} />
      <Column gap="12" fillWidth maxWidth="28rem">
        <Input
          id="mascot-seed"
          label="Seed"
          value={seed}
          onChange={(event) => setSeed(event.target.value)}
          description="A name, a username, or words: colours, animals, moods and objects."
        />
        <Row gap="8" wrap>
          {reading.matched.map((word) => (
            <Tag key={`m-${word}`} label={word} tone="brand" />
          ))}
          {reading.unmatched.map((word) => (
            <Tag key={`u-${word}`} label={word} tone="neutral" />
          ))}
        </Row>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          Highlighted words set part of the look; the rest feed the hash, so the same seed is always the
          same mascot.
        </Text>
        <Row gap="8" wrap>
          {SEED_IDEAS.map((idea) => (
            <Button key={idea} size="s" variant="tertiary" label={idea} onClick={() => setSeed(idea)} />
          ))}
        </Row>
      </Column>
    </Column>
  );
}
