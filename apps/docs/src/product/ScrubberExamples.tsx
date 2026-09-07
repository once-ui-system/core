"use client";

import { Column, Row, Scrubber, Text, type ScrubberBlock } from "@once-ui-system/core";
import { useState } from "react";

export function ScrubberSeekExample() {
  const [time, setTime] = useState(38000);
  return <Scrubber duration={125000} value={time} onChange={setTime} />;
}

export function ScrubberTracksExample() {
  const [time, setTime] = useState(12000);
  const [selected, setSelected] = useState<string | null>("z1");
  const [zooms, setZooms] = useState<ScrubberBlock[]>([
    { id: "z1", start: 4000, end: 11000, label: "Zoom" },
    { id: "z2", start: 20000, end: 26000, label: "Zoom" },
  ]);
  const scenes: ScrubberBlock[] = [
    { id: "s1", start: 0, end: 15000, label: "Intro", scheme: "accent" },
    { id: "s2", start: 15000, end: 40000, label: "Walkthrough", scheme: "accent" },
  ];

  return (
    <Column fillWidth gap="12">
      <Scrubber
        duration={40000}
        value={time}
        onChange={setTime}
        selected={selected}
        onSelect={setSelected}
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
        <Text variant="label-default-xs" onBackground="neutral-weak">
          {selected ? `Selected: ${selected}` : "Nothing selected"}
        </Text>
      </Row>
    </Column>
  );
}
