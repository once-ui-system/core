"use client";

import { Button, Column, Grid, Heading, Row, StyleScope, Text } from "@once-ui-system/core";
import { GradientFx } from "@once-ui-system/fx";

// Sample palettes for the proof page: artwork, so raw colours are fine here.
const AURORA = ["#0c0f14", "#123540", "#2a8f9a", "#5fd6c4", "#eef6e8"];
const EMBER = ["#120a0a", "#4a1410", "#c2401f", "#f39a4a", "#fde7c8"];
const DUSK = ["#0b0a1a", "#2b1d5c", "#7a3fd1", "#e46fb4", "#ffe3f0"];

const variants = [
  { label: "Theme colours (default)", props: {} },
  { label: "Ember, crisp bands", props: { colors: EMBER, blur: 0.2, angle: 20, seed: 4 } },
  { label: "Dusk, haze, heavy grain", props: { colors: DUSK, blur: 1, grain: 0.9, seed: 9 } },
  { label: "Aurora, no grain, fast", props: { colors: AURORA, grain: 0, speed: "fast" as const } },
];

export default function GradientFxProof() {
  return (
    <Column fillWidth background="page" style={{ minHeight: "100vh" }}>
      {/* The aurora is dark in both themes, so its words are set for a dark ground. */}
      <StyleScope config={{ theme: "dark" }} fillWidth>
        <GradientFx colors={AURORA} angle={-28} seed={2} style={{ minHeight: "100vh" }}>
          <Column fillWidth padding="64" gap="32" s={{ padding: "24" }} vertical="center">
            <Row fillWidth horizontal="between" vertical="center">
              <Text textVariant="label-strong-l" onBackground="neutral-strong">
                Fjell
              </Text>
              <Button variant="secondary" size="s">
                Menu
              </Button>
            </Row>
            <Column gap="20" maxWidth="s" paddingTop="160" s={{ paddingTop: "64" }}>
              <Heading textVariant="display-strong-l" onBackground="neutral-strong">
                Own your identity. Everywhere.
              </Heading>
              <Text textVariant="body-default-xl" onBackground="neutral-medium">
                GradientFx draws this field: soft bands drifting through each other under film
                grain, from any palette.
              </Text>
            </Column>
          </Column>
        </GradientFx>
      </StyleScope>
      <Grid columns="2" m={{ columns: "1" }} gap="16" padding="16" fillWidth>
        {variants.map((v) => (
          <GradientFx key={v.label} radius="l" style={{ height: 320 }} {...v.props}>
            <Column fill padding="24" vertical="end">
              <Text textVariant="label-strong-m" onBackground="neutral-strong">
                {v.label}
              </Text>
            </Column>
          </GradientFx>
        ))}
      </Grid>
    </Column>
  );
}
