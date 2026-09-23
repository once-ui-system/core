"use client";

import {
  Button,
  Column,
  CountFx,
  Fade,
  Heading,
  IconButton,
  Media,
  ProgressBar,
  Pulse,
  Row,
  Scroller,
  SegmentedControl,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";
import { Footer2, Header3 } from ".";

const queue = [
  {
    title: "Neon District",
    episode: "S1 · E4",
    duration: "42m",
    image: "/images/movies/02.jpg",
    progress: 65,
  },
  {
    title: "Midnight Protocol",
    episode: "S2 · E1",
    duration: "38m",
    image: "/images/movies/04.jpg",
    progress: 0,
  },
  {
    title: "Glass Horizon",
    episode: "S1 · E8",
    duration: "51m",
    image: "/images/movies/05.jpg",
    progress: 0,
  },
  {
    title: "Signal Lost",
    episode: "S3 · E2",
    duration: "44m",
    image: "/images/movies/06.jpg",
    progress: 12,
  },
];

const recommendations = [
  { title: "Parallel Lines", image: "/images/movies/01.jpg" },
  { title: "Static Bloom", image: "/images/movies/03.jpg" },
  { title: "Deep Archive", image: "/images/movies/02.jpg" },
  { title: "Zero Day", image: "/images/movies/04.jpg" },
  { title: "Afterglow", image: "/images/movies/05.jpg" },
];

const genres = [
  { label: "For you", value: "for-you" },
  { label: "Sci-fi", value: "sci-fi" },
  { label: "Drama", value: "drama" },
  { label: "Documentary", value: "documentary" },
];

export const Streaming2 = () => {
  const [selectedGenre, setSelectedGenre] = useState("for-you");
  const featured = queue[0];

  return (
    <Column fillWidth>
      <Header3 position="sticky" top="0" />

      <Column fillWidth paddingX="l" paddingY="24" gap="24" maxWidth="xl" horizontal="center">
        <Row
          fillWidth
          padding="12"
          gap="16"
          radius="l"
          border
          background="overlay"
          vertical="center"
          horizontal="between"
          wrap
        >
          <Row gap="8" vertical="center">
            <Pulse size="s" scheme="danger" />
            <Tag scheme="danger" size="s" label="Live now" />
            <Text variant="label-default-s">Design Systems Summit — Keynote</Text>
          </Row>
          <Row gap="8" vertical="center">
            <Text variant="label-default-s" onBackground="neutral-weak">
              <CountFx value={2847} separator="," /> watching
            </Text>
            <Button size="s" variant="secondary">
              Join live
            </Button>
          </Row>
        </Row>

        <Row fillWidth gap="16" s={{ direction: "column" }}>
          <Column fill minWidth={24} gap="12">
            <Column fillWidth radius="l" overflow="hidden" border>
              <Media
                aspectRatio="16/9"
                src={featured.image}
                alt={featured.title}
                sizes="(max-width: 768px) 100vw, 720px"
              />
              <Row
                fillWidth
                position="absolute"
                bottom="0"
                left="0"
                padding="16"
                gap="12"
                vertical="end"
                horizontal="between"
              >
                <Fade fillWidth height={16} to="top" position="absolute" bottom="0" left="0" />
                <Column gap="4" fillWidth>
                  <Heading variant="heading-strong-l" onSolid="neutral-strong">
                    {featured.title}
                  </Heading>
                  <Text variant="body-default-s" onSolid="neutral-weak">
                    {featured.episode} · {featured.duration} remaining
                  </Text>
                </Column>
                <Row gap="8" pointerEvents="all">
                  <IconButton icon="play" variant="primary" size="l" tooltip="Play" />
                  <IconButton icon="plus" variant="secondary" size="l" tooltip="Add to list" />
                </Row>
              </Row>
            </Column>
            <ProgressBar showLabel={false} value={featured.progress} />
          </Column>

          <Column
            minWidth={20}
            fill
            gap="8"
            padding="12"
            radius="l"
            border
            background="page"
            fillWidth
          >
            <Heading variant="heading-strong-s">Up next</Heading>
            {queue.slice(1).map((item) => (
              <Row
                key={item.title}
                fillWidth
                gap="12"
                padding="8"
                radius="m"
                vertical="center"
                cursor="interactive"
              >
                <Media
                  aspectRatio="16/9"
                  src={item.image}
                  alt={item.title}
                  sizes="120px"
                  radius="s"
                  style={{ width: "5rem" }}
                />
                <Column gap="4" fillWidth>
                  <Text variant="label-default-s">{item.title}</Text>
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {item.episode} · {item.duration}
                  </Text>
                  {item.progress > 0 && <ProgressBar showLabel={false} value={item.progress} />}
                </Column>
              </Row>
            ))}
          </Column>
        </Row>

        <Column fillWidth gap="16">
          <Row fillWidth horizontal="between" vertical="center" wrap gap="12">
            <Heading variant="heading-strong-m">Because you watched {featured.title}</Heading>
            <SegmentedControl
              buttons={genres.map((genre) => ({ label: genre.label, value: genre.value }))}
              value={selectedGenre}
              onChange={(value) => setSelectedGenre(value)}
            />
          </Row>

          <Scroller fitWidth style={{ maxWidth: "100%" }}>
            <Row fitWidth gap="12">
              {recommendations.map((item) => (
                <Column key={item.title} minWidth={16} gap="8" cursor="interactive">
                  <Media
                    aspectRatio="16/9"
                    src={item.image}
                    alt={item.title}
                    sizes="200px"
                    radius="l"
                  />
                  <Text variant="label-default-s">{item.title}</Text>
                </Column>
              ))}
            </Row>
          </Scroller>
        </Column>
      </Column>

      <Row fillWidth paddingX="l" horizontal="center">
        <Footer2 maxWidth="xl" paddingX="0" />
      </Row>
    </Column>
  );
};
