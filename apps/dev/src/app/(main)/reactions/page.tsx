"use client";

import {
  Column,
  Heading,
  Reaction,
  type ReactionOption,
  Reactions,
  Row,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

const feed: ReactionOption[] = [
  { value: "❤️", label: "Love" },
  { value: "👍", label: "Like" },
  { value: "😂", label: "Haha" },
  { value: "😮", label: "Wow" },
  { value: "😢", label: "Sad" },
  { value: "🔥", label: "Fire" },
];

const noto = (code: string) => `https://fonts.gstatic.com/s/e/notoemoji/latest/${code}/512.webp`;

const custom: ReactionOption[] = [
  { value: "party", label: "Party", src: noto("1f389"), motion: "none" },
  { value: "rocket", label: "Ship it", src: noto("1f680"), motion: "none" },
  { value: "heart-eyes", label: "Heart eyes", src: noto("1f60d"), motion: "none" },
  { value: "orbit", label: "Orbit", emoji: "🪐", motion: "spin" },
];

export default function ReactionsPage() {
  const [mine, setMine] = useState<string | null>("❤️");
  const [counts, setCounts] = useState<Record<string, number>>({ "❤️": 12, "👍": 4, "😂": 2 });
  const [log, setLog] = useState("");

  return (
    <Column
      fillWidth
      padding="xl"
      gap="40"
      maxWidth="m"
      horizontal="center"
      style={{ margin: "0 auto" }}
    >
      <Column gap="12" fillWidth data-testid="feed">
        <Heading variant="heading-strong-m">Feed post, one reaction each, controlled</Heading>
        <Reactions
          options={feed}
          counts={counts}
          value={mine}
          onValueChange={(next, change) => {
            setLog(`${change.option.value} ${change.selected ? "added" : "removed"}`);
            setMine(next as string | null);
            setCounts((all) => {
              const out = { ...all };
              if (mine) out[mine] = Math.max(0, (out[mine] ?? 0) - 1);
              if (next) out[next as string] = (out[next as string] ?? 0) + 1;
              return out;
            });
          }}
        />
        <Text variant="body-default-xs" onBackground="neutral-weak" data-testid="log">
          {log || "No change yet"}
        </Text>
      </Column>

      <Column gap="12" fillWidth data-testid="chat">
        <Heading variant="heading-strong-m">Chat, several each, uncontrolled, float</Heading>
        <Reactions
          options={feed}
          counts={{ "👍": 3, "🔥": 1 }}
          defaultValue={["👍"]}
          multiple
          effect="float"
          size="s"
        />
      </Column>

      <Column gap="12" fillWidth data-testid="custom">
        <Heading variant="heading-strong-m">
          Custom: animated images and an emoji with its own motion
        </Heading>
        <Reactions options={custom} counts={{ party: 5, rocket: 2, orbit: 1 }} size="l" />
      </Column>

      <Column gap="12" fillWidth data-testid="glyphs">
        <Heading variant="heading-strong-m">Gestures</Heading>
        <Row gap="24" wrap>
          {["❤️", "👍", "😂", "😮", "😢", "🔥", "🎉", "👋", "🦄"].map((emoji) => (
            <Column key={emoji} gap="4" horizontal="center">
              <Reaction value={emoji} size="xl" trigger="loop" />
            </Column>
          ))}
        </Row>
      </Column>
    </Column>
  );
}
