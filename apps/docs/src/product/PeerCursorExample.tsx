"use client";

import {
  Column,
  type PeerCursorData,
  PeerCursors,
  Text,
  usePeerPointer,
} from "@once-ui-system/core";
import { useEffect, useRef, useState } from "react";

// Made-up collaborators drifting on slow loops, updated 20 times a second
// the way positions arrive from a realtime channel. The cursors glide between.
const BOTS = [
  { id: "mira", name: "Mira Holt", speed: 0.7, phase: 0, message: undefined },
  { id: "teo", name: "Teo Varga", speed: 0.5, phase: 2, message: "This heading could be bigger" },
  { id: "ines", name: "Ines Ferro", speed: 0.9, phase: 4, message: undefined },
];

function botPeers(t: number): PeerCursorData[] {
  return BOTS.map((bot) => {
    const a = t * bot.speed + bot.phase;
    return {
      id: bot.id,
      name: bot.name,
      x: 0.5 + 0.32 * Math.sin(a) * Math.cos(a * 0.37),
      y: 0.5 + 0.3 * Math.sin(a * 1.3 + 1),
      message: bot.message && Math.sin(t * 0.4) > 0.3 ? bot.message : undefined,
      idle: bot.id === "ines" && Math.sin(t * 0.3) > 0.6,
    };
  });
}

export function PeerCursorExample() {
  const ref = useRef<HTMLDivElement>(null);
  const [peers, setPeers] = useState<PeerCursorData[]>(() => botPeers(0));
  const [echo, setEcho] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const start = performance.now();
    const timer = setInterval(() => setPeers(botPeers((performance.now() - start) / 1000)), 50);
    return () => clearInterval(timer);
  }, []);

  // Your own pointer as a collaborator would see it: sent at 25 a second,
  // drawn a little lower so both show.
  usePeerPointer(ref, setEcho);

  return (
    <Column
      ref={ref}
      fillWidth
      height={320}
      radius="l"
      border="neutral-alpha-weak"
      background="surface"
      center
      style={{ position: "relative", overflow: "hidden" }}
    >
      <Text textVariant="body-default-s" onBackground="neutral-weak">
        Move your pointer here
      </Text>
      <PeerCursors
        peers={[
          ...peers,
          ...(echo
            ? [
                {
                  id: "you",
                  name: "You, as others see you",
                  x: echo.x,
                  y: echo.y + 0.06,
                  scheme: "blue" as const,
                },
              ]
            : []),
        ]}
      />
    </Column>
  );
}
