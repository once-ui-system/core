"use client";

import { Column, Row, Text } from "@once-ui-system/core";
import { Scrubber, type ScrubberBlock, ScrubberWaveform } from "@once-ui-system/core/media";
import { useState } from "react";

export function ScrubberSeekExample() {
  const [time, setTime] = useState(38000);
  return <Scrubber duration={125000} value={time} onValueChange={setTime} />;
}

export function ScrubberTracksExample() {
  const [time, setTime] = useState(12000);
  const [selected, setSelected] = useState<string | null>("z1");
  const [zooms, setZooms] = useState<ScrubberBlock[]>([
    { id: "z1", start: 4000, end: 11000, label: "Zoom" },
    { id: "z2", start: 20000, end: 26000, label: "Zoom" },
  ]);
  const scenes: ScrubberBlock[] = [
    { id: "s1", start: 0, end: 15000, label: "Intro", tone: "accent" },
    { id: "s2", start: 15000, end: 40000, label: "Walkthrough", tone: "accent" },
  ];

  return (
    <Column fillWidth gap="12">
      <Scrubber
        duration={40000}
        value={time}
        onValueChange={setTime}
        selected={selected}
        onSelectedChange={setSelected}
        onBlockChange={(_trackId, blockId, next) =>
          setZooms((current) =>
            current.map((block) =>
              // Refuse a zoom shorter than a second rather than letting the
              // edges cross over each other.
              block.id === blockId && next.end - next.start > 1000
                ? { ...block, ...next }
                : block,
            ),
          )
        }
        tracks={[
          { id: "zooms", height: "32", movable: true, resizable: true, blocks: zooms },
          { id: "scenes", height: "48", blocks: scenes },
        ]}
      />
      <Row fillWidth horizontal="center">
        <Text textVariant="label-default-xs" onBackground="neutral-weak">
          {selected ? `Selected: ${selected}` : "Nothing selected"}
        </Text>
      </Row>
    </Column>
  );
}

/** A believable waveform: a few phrases with pauses between them. */
const PEAKS = Array.from({ length: 160 }, (_, index) => {
  const phrase = Math.sin(index / 9) * 0.5 + 0.5;
  const grain = Math.abs(Math.sin(index * 12.9898) * 43758.5453) % 1;
  return index % 40 > 32 ? 0.05 : 0.2 + phrase * 0.55 + grain * 0.25;
});

export function ScrubberEditorExample() {
  const [time, setTime] = useState(9400);
  const [selected, setSelected] = useState<string | null>("card");
  const [range, setRange] = useState<{ start: number; end: number } | null>(null);
  const [scenes, setScenes] = useState<ScrubberBlock[]>([
    { id: "cart", start: 0, end: 5000, label: "Cart" },
    {
      id: "idle",
      start: 5000,
      end: 8000,
      label: "idle 3 s",
      variant: "gap",
      description: "Cut: nothing moved on screen for 3 s",
    },
    { id: "card", start: 8000, end: 14000, label: "Card field", highlight: true },
    { id: "load", start: 14000, end: 17000, label: "Loading", badge: "4×" },
    { id: "pay", start: 17000, end: 24000, label: "Pay" },
  ]);
  const zooms: ScrubberBlock[] = [
    { id: "z1", start: 800, end: 4200, label: "1.8×" },
    { id: "z2", start: 8600, end: 13200, label: "2.2×" },
    { id: "z3", start: 18000, end: 22500, label: "1.6×" },
  ];

  return (
    <Scrubber
      duration={24000}
      value={time}
      onValueChange={setTime}
      selected={selected}
      onSelectedChange={setSelected}
      ruler
      snap
      range={range}
      onRangeChange={setRange}
      markers={[
        { id: "c1", time: 2600, label: "Click: Checkout" },
        { id: "c2", time: 9100, label: "Click: Card number" },
        { id: "c3", time: 19800, label: "Click: Pay" },
      ]}
      renderPreview={(at) => (
        <Column width={8} height={4.5} center background="neutral-alpha-weak">
          <Text family="code" textVariant="label-default-xs" onBackground="neutral-weak">
            frame {Math.round(at / 16.7)}
          </Text>
        </Column>
      )}
      onBlockChange={(_trackId, blockId, next) =>
        setScenes((current) =>
          current.map((block) =>
            block.id === blockId && next.end - next.start > 500
              ? { ...block, ...next, highlight: false }
              : block,
          ),
        )
      }
      tracks={[
        {
          id: "take",
          label: "Take",
          tone: "neutral",
          height: "48",
          resizable: true,
          blocks: scenes,
        },
        { id: "zoom", label: "Zoom", tone: "brand", height: "32", blocks: zooms },
        {
          id: "audio",
          label: "Audio",
          tone: "info",
          height: "32",
          blocks: [
            {
              id: "music",
              start: 0,
              end: 24000,
              content: <ScrubberWaveform peaks={PEAKS} tone="info" />,
            },
          ],
        },
      ]}
    />
  );
}
