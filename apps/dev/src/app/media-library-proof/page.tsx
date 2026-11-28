"use client";

import { Button, Column, Heading, Media, Row, Text } from "@once-ui-system/core";
import {
  createMemoryMediaAdapter,
  type MediaAsset,
  MediaLibrary,
  MediaPicker,
} from "@once-ui-system/core/media";
import { useMemo, useState } from "react";

const images = [
  "cover-01",
  "cover-02",
  "cover-03",
  "cover-04",
  "cover-05",
  "image-02",
  "image-03",
  "demo",
];

export default function MediaLibraryProof() {
  const adapter = useMemo(
    () =>
      createMemoryMediaAdapter({
        latency: 400,
        pageSize: 12,
        folders: [
          { id: "brand", name: "Brand", parentId: null },
          { id: "logos", name: "Logos", parentId: "brand" },
          { id: "launch", name: "Launch film", parentId: null },
          { id: "posts", name: "Social posts", parentId: null },
        ],
        assets: [
          ...images.map((name, index) => ({
            id: name,
            name: `${name}.jpg`,
            src: `/images/${name}.jpg`,
            kind: "image" as const,
            folderId: index < 3 ? "brand" : index < 5 ? "launch" : null,
          })),
          ...Array.from({ length: 8 }, (_, index) => ({
            id: `movie-${index + 1}`,
            name: `still-0${index + 1}.jpg`,
            src: `/images/movies/0${index + 1}.jpg`,
            kind: "image" as const,
            folderId: "posts",
          })),
          {
            id: "voice",
            name: "voiceover.mp3",
            src: "/voiceover.mp3",
            kind: "audio",
            folderId: "launch",
          },
          { id: "brief", name: "brief.pdf", src: "/brief.pdf", kind: "file", folderId: null },
        ],
      }),
    [],
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [picked, setPicked] = useState<MediaAsset | null>(null);

  return (
    <Column fillWidth background="page" padding="40" gap="40" horizontal="center">
      <Column maxWidth="xl" gap="16">
        <Heading textVariant="display-strong-xs">Media library</Heading>
        <Text onBackground="neutral-weak">
          Any storage behind one adapter. This page runs on the in-memory adapter.
        </Text>
        <Row background="surface" border radius="l" padding="16" height="40rem">
          <MediaLibrary adapter={adapter} />
        </Row>
      </Column>
      <Column maxWidth="xl" gap="16">
        <Heading textVariant="heading-strong-l">Picker</Heading>
        <Row gap="16" vertical="center">
          <Button label="Choose an image" onClick={() => setPickerOpen(true)} />
          {picked && (
            <Row width="8rem" radius="l" overflow="hidden">
              <Media src={picked.src} alt={picked.name} aspectRatio="1 / 1" />
            </Row>
          )}
        </Row>
        <MediaPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          adapter={adapter}
          accept={["image"]}
          onPick={([asset]) => setPicked(asset ?? null)}
        />
      </Column>
    </Column>
  );
}
