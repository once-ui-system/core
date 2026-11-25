"use client";

import { StylePanel, StylePanelSite, type StylePanelValue } from "@once-ui-system/blocks";
import { Column, Heading, Row, SegmentedControl, Text } from "@once-ui-system/core";
import { useState } from "react";

const PAIRS = [
  {
    value: "poster",
    label: "Poster",
    heading: "Impact, sans-serif",
    description: "Bebas · Work Sans",
  },
  { value: "classic", label: "Classic", heading: "Georgia, serif", description: "Playfair · Lora" },
  {
    value: "modern",
    label: "Modern",
    heading: "system-ui, sans-serif",
    description: "Space Grotesk · Inter",
  },
  {
    value: "warm",
    label: "Warm",
    heading: "'Times New Roman', serif",
    description: "Fraunces · DM Sans",
  },
];

/** StylePanelSite (3.2) next to the default StylePanel, both controlled, in a 400px column. */
export default function StylePanelSiteProof() {
  const [value, setValue] = useState<StylePanelValue>({
    theme: "dark",
    brand: "emerald",
    accent: "orange",
    neutral: "gray",
    border: "playful",
    solid: "color",
    solidStyle: "plastic",
    surface: "filled",
    scaling: "100",
  });
  const [pair, setPair] = useState("modern");
  const [width, setWidth] = useState("l");
  return (
    <Row fillWidth padding="40" gap="40" horizontal="center" vertical="start" wrap>
      <Column
        style={{ width: "25rem" }}
        gap="16"
        padding="24"
        border="neutral-alpha-medium"
        radius="l"
        background="surface"
      >
        <Heading as="h2" variant="heading-strong-s">
          StylePanelSite
        </Heading>
        <StylePanelSite
          value={value}
          onValueChange={setValue}
          customColors
          labels={{ groups: { color: { title: "Colour" } }, tiles: { sample: "Book" } }}
          look={
            <Text variant="body-default-s" onBackground="neutral-weak">
              The host's own templates go here.
            </Text>
          }
          fonts={{
            pairs: PAIRS,
            value: pair,
            onValueChange: setPair,
            more: <Text>Per-role pickers</Text>,
          }}
          defaultFineTuneOpen
          fineTune={
            <SegmentedControl
              fillWidth
              value={width}
              onValueChange={setWidth}
              buttons={["m", "l", "xl"].map((w) => ({ value: w, label: w.toUpperCase() }))}
            />
          }
        />
      </Column>
      <Column style={{ width: "25rem" }} gap="16">
        <Heading as="h2" variant="heading-strong-s">
          StylePanel tiles + wrap
        </Heading>
        <StylePanel value={value} onValueChange={setValue} tiles swatches="wrap" stacked />
      </Column>
    </Row>
  );
}
