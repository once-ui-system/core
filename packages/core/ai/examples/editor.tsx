"use client";

/**
 * Gold example: editor shell
 * Target: a toolbar, two panes that scroll on their own, and a timeline that
 * spans both — the shape of a video editor, a page builder or a diff view.
 *
 * `ai/layouts.md` §3 says why each piece sits where it does: overflow on the
 * panels and not the SplitView, labels for the tabs it collapses into, the
 * timeline as a sibling of the split, playback paused while scrubbing.
 */
import {
  Column,
  IconButton,
  Row,
  Scrubber,
  SplitView,
  Text,
  ToggleButton,
} from "@once-ui-system/core";
import { useState } from "react";

type Track = NonNullable<React.ComponentProps<typeof Scrubber>["tracks"]>[number];

const DURATION = 30;

const initialTracks: Track[] = [
  {
    id: "video",
    scheme: "brand",
    movable: true,
    resizable: true,
    blocks: [
      { id: "intro", start: 0, end: 6, label: "Intro" },
      { id: "demo", start: 6, end: 22, label: "Demo" },
      { id: "outro", start: 22, end: 30, label: "Outro" },
    ],
  },
  {
    id: "audio",
    scheme: "accent",
    blocks: [{ id: "music", start: 0, end: 30, label: "Music", locked: true }],
  },
];

export function EditorExample() {
  const [tracks, setTracks] = useState(initialTracks);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<string | null>("intro");

  const blocks = tracks.flatMap((track) => track.blocks);
  const current = blocks.find((block) => block.id === selected);

  return (
    <Column fillWidth height="100dvh">
      <Row
        fillWidth
        horizontal="between"
        vertical="center"
        gap="8"
        paddingX="12"
        paddingY="8"
        borderBottom
      >
        <Row gap="8" vertical="center">
          <IconButton
            icon={playing ? "pause" : "play"}
            variant="tertiary"
            tooltip={playing ? "Pause" : "Play"}
            onClick={() => setPlaying(!playing)}
          />
          <Text variant="label-default-s" onBackground="neutral-weak">
            Untitled project
          </Text>
        </Row>
        <IconButton icon="download" variant="secondary" tooltip="Export" />
      </Row>

      <SplitView
        fill
        defaultSplit={0.28}
        minSplit={0.2}
        maxSplit={0.6}
        collapseBelow="s"
        labels={{ left: "Layers", right: "Canvas" }}
        leftPanel={
          <Column fill overflowY="auto" padding="8" gap="4">
            {blocks.map((block) => (
              <ToggleButton
                key={block.id}
                fillWidth
                horizontal="start"
                selected={block.id === selected}
                onClick={() => setSelected(block.id)}
              >
                {block.label}
              </ToggleButton>
            ))}
          </Column>
        }
        rightPanel={
          <Column fill overflowY="auto" padding="24" center background="surface">
            <Column maxWidth="40rem" aspectRatio="16/9" radius="l" border background="page" center>
              <Text variant="label-default-s" onBackground="neutral-weak">
                {current ? current.label : "Nothing selected"}
              </Text>
            </Column>
          </Column>
        }
      />

      <Column fillWidth paddingX="12" paddingY="8" borderTop>
        <Scrubber
          duration={DURATION}
          value={time}
          onValueChange={setTime}
          tracks={tracks}
          selected={selected}
          onSelectedChange={setSelected}
          onGestureStart={() => setPlaying(false)}
          onBlockChange={(trackId, blockId, next) =>
            setTracks((all) =>
              all.map((track) =>
                track.id !== trackId
                  ? track
                  : {
                      ...track,
                      blocks: track.blocks.map((block) =>
                        block.id === blockId ? { ...block, ...next } : block,
                      ),
                    },
              ),
            )
          }
        />
      </Column>
    </Column>
  );
}
