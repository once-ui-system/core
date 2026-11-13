"use client";

/**
 * Gold example: editor shell
 * Target: a toolbar, two panes that scroll on their own, and a timeline that
 * spans both — the shape of a video editor, a page builder or a diff view.
 *
 * `ai/layouts.md` §3 says why each piece sits where it does: overflow on the
 * panels and not the SplitView, labels for the tabs it collapses into, the
 * timeline as a sibling of the split, playback paused while scrubbing.
 *
 * The project loads and saves through `project` (what would be
 * `lib/project.ts`): async functions over mock data, so a real API replaces
 * them. The shell covers loading, a failed load, an empty project with its
 * way to start, and saving with a rollback when a save fails.
 */
import {
  Button,
  Column,
  Feedback,
  IconButton,
  Row,
  Skeleton,
  SplitView,
  Text,
  ToggleButton,
  useToast,
} from "@once-ui-system/core";
import { Scrubber } from "@once-ui-system/core/media";
import { useCallback, useEffect, useState } from "react";

type Track = NonNullable<React.ComponentProps<typeof Scrubber>["tracks"]>[number];

// Scrubber times are milliseconds: its ruler and clock read them as m:ss.
const DURATION = 30_000;

const sampleTracks: Track[] = [
  {
    id: "video",
    tone: "brand",
    movable: true,
    resizable: true,
    blocks: [
      { id: "intro", start: 0, end: 6000, label: "Intro" },
      { id: "demo", start: 6000, end: 22000, label: "Demo" },
      { id: "outro", start: 22000, end: 30000, label: "Outro" },
    ],
  },
  {
    id: "audio",
    tone: "accent",
    blocks: [{ id: "music", start: 0, end: 30000, label: "Music", locked: true }],
  },
];

// ── lib/project.ts ──
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const project = {
  async load(): Promise<Track[]> {
    await wait(500);
    return sampleTracks;
  },
  /** Rejects when the save fails, so the editor can roll back. */
  async save(tracks: Track[]): Promise<void> {
    await wait(300);
    if (!tracks) throw new Error("Nothing to save");
  },
};

export function EditorExample() {
  const { addToast } = useToast();
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<string | null>("intro");

  const load = useCallback(() => {
    setStatus("loading");
    project
      .load()
      .then((loaded) => {
        setTracks(loaded);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);
  useEffect(load, [load]);

  // Optimistic: the change shows at once and goes back if the save fails.
  const change = (next: Track[]) => {
    const before = tracks;
    setTracks(next);
    project.save(next).catch(() => {
      setTracks(before);
      addToast({ tone: "danger", message: "Couldn't save that change." });
    });
  };

  const blocks = tracks.flatMap((track) => track.blocks);

  if (status === "loading") {
    return (
      <Column fillWidth height="100dvh" padding="12" gap="12">
        <Skeleton shape="block" height={40} />
        <Skeleton shape="block" fill />
        <Skeleton shape="block" height={96} />
      </Column>
    );
  }
  if (status === "error") {
    return (
      <Column fillWidth height="100dvh" center padding="24">
        <Feedback tone="danger" title="The project didn't open">
          <Button size="s" variant="secondary" label="Retry" onClick={load} />
        </Feedback>
      </Column>
    );
  }
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
          <Text textVariant="label-default-s" onBackground="neutral-weak">
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
            {blocks.length === 0 && (
              <Column padding="16" gap="8">
                <Text textVariant="label-strong-s">No clips yet</Text>
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  Add a clip to start the timeline.
                </Text>
              </Column>
            )}
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
              <Text textVariant="label-default-s" onBackground="neutral-weak">
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
            change(
              tracks.map((track) =>
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
