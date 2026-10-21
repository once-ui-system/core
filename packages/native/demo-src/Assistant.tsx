import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import {
  Card,
  Column,
  Heading,
  LogoSpinner,
  Mascot,
  type MascotMood,
  type MascotState,
  Row,
  Scroller,
  SegmentedControl,
  Text,
  useTheme,
  WorkingIndicator,
} from "../src";

const STATES: MascotState[] = ["idle", "listening", "thinking", "speaking", "sleeping"];
const MOODS: MascotMood[] = [
  "neutral",
  "happy",
  "surprised",
  "sad",
  "skeptical",
  "wink",
  "focused",
  "determined",
];

/** The assistant pieces: the mascot in every state and mood, seeded looks, the loaders. */
export function Assistant() {
  const theme = useTheme();
  const [state, setState] = useState<MascotState>("idle");
  const [level, setLevel] = useState(0);

  // A stand-in voice so speaking moves with a level, as it would with audio.
  useEffect(() => {
    if (state !== "speaking") return;
    const id = setInterval(() => setLevel(Math.random()), 90);
    return () => clearInterval(id);
  }, [state]);

  return (
    <ScrollView style={{ backgroundColor: theme.color("page-background") }}>
      <Column padding="20" gap="20">
        <Heading textVariant="heading-strong-l">Assistant</Heading>
        <Card padding="20" gap="16" center>
          <Mascot
            size="xl"
            state={state}
            level={state === "speaking" ? level : undefined}
            mouth="smile"
          />
          <Scroller fillWidth>
            <SegmentedControl
              buttons={STATES.map((value) => ({ value, label: value }))}
              value={state}
              onValueChange={(value) => setState(value as MascotState)}
              compact
              fillWidth={false}
            />
          </Scroller>
          <WorkingIndicator showElapsed detail="tap to stop" />
        </Card>

        <Text textVariant="label-strong-m">Moods</Text>
        <Row wrap gap="12">
          {MOODS.map((mood) => (
            <Column key={mood} center gap="4" width="72">
              <Mascot size="m" mood={mood} brows mouth="smile" />
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                {mood}
              </Text>
            </Column>
          ))}
        </Row>

        <Text textVariant="label-strong-m">Seeds</Text>
        <Row wrap gap="12">
          {["acme", "lumen", "tavilio", "aveiro", "chirio", "frametic"].map((seed) => (
            <Column key={seed} center gap="4" width="72">
              <Mascot size="m" seed={seed} />
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                {seed}
              </Text>
            </Column>
          ))}
        </Row>

        <Text textVariant="label-strong-m">Loaders</Text>
        <Row gap="16" vertical="center">
          <LogoSpinner size="xl" />
          <LogoSpinner size="xl" variant="wave" tone="accent" />
          <LogoSpinner size="l" tone="neutral" />
          <WorkingIndicator size="l" />
        </Row>
      </Column>
    </ScrollView>
  );
}
