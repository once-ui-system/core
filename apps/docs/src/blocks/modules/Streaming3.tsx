"use client";

import {
  Button,
  Column,
  Fade,
  Heading,
  IconButton,
  Media,
  ProgressBar,
  Row,
  Scroller,
  SegmentedControl,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";
import { Footer2, Header3 } from ".";

const continueListening = [
  {
    title: "Design Systems Daily",
    episode: "E42 · Tokens in the wild",
    progress: 72,
    image: "/images/docs/vibe-coding-light.jpg",
    duration: "18m left",
  },
  {
    title: "Ship Notes",
    episode: "E18 · Launch week debrief",
    progress: 34,
    image: "/images/docs/vibe-coding-dark.jpg",
    duration: "26m left",
  },
  {
    title: "Frontend Radio",
    episode: "E91 · React Server Components",
    progress: 8,
    image: "/images/products/journal-04.jpg",
    duration: "41m left",
  },
];

const shows = [
  {
    title: "Once UI Office Hours",
    host: "Lorant & community",
    episodes: 128,
    image: "/images/products/studio-03.jpg",
    tag: "Weekly",
  },
  {
    title: "Builder Stories",
    host: "Indie founders",
    episodes: 64,
    image: "/images/showcase/iqon.jpg",
    tag: "Featured",
  },
  {
    title: "Component Craft",
    host: "Design engineers",
    episodes: 45,
    image: "/images/showcase/vivid.jpg",
    tag: "New season",
  },
  {
    title: "Deploy & Chill",
    host: "Platform squad",
    episodes: 31,
    image: "/images/showcase/aveiro.jpg",
    tag: "Live",
  },
  {
    title: "Theming Deep Dives",
    host: "Once UI team",
    episodes: 22,
    image: "/images/showcase/jexcellence.jpg",
    tag: "Series",
  },
  {
    title: "Open Source Hour",
    host: "Contributors",
    episodes: 56,
    image: "/images/showcase/dec.jpg",
    tag: "Community",
  },
];

const topics = [
  { label: "All", value: "all" },
  { label: "Design", value: "design" },
  { label: "Engineering", value: "engineering" },
  { label: "Business", value: "business" },
];

const nowPlaying = continueListening[0];

export const Streaming3 = () => {
  const [topic, setTopic] = useState("all");
  const [playing, setPlaying] = useState(true);

  return (
    <Column fillWidth>
      <Header3 position="sticky" top="0" background="page" />

      <Column fillWidth paddingX="l" paddingY="24" gap="32" maxWidth="xl" horizontal="center">
        <Column fillWidth radius="l" overflow="hidden" border>
          <Media
            aspectRatio="21/9"
            src={nowPlaying.image}
            alt={nowPlaying.title}
            sizes="(max-width: 768px) 100vw, 960px"
          />
          <Fade fillWidth height={20} to="top" position="absolute" bottom="0" left="0" />
          <Row
            fillWidth
            position="absolute"
            bottom="0"
            left="0"
            padding="24"
            gap="16"
            vertical="end"
            horizontal="between"
            wrap
          >
            <Column gap="8" maxWidth={40}>
              <Tag size="s" scheme="brand">
                Now playing
              </Tag>
              <Heading variant="display-default-xs" onSolid="neutral-strong" wrap="balance">
                {nowPlaying.episode}
              </Heading>
              <Text variant="body-default-s" onSolid="neutral-weak">
                {nowPlaying.title} · {nowPlaying.duration}
              </Text>
            </Column>
            <Row gap="8">
              <IconButton icon="backward" variant="secondary" size="l" tooltip="Back 15s" />
              <IconButton
                icon={playing ? "pause" : "play"}
                variant="primary"
                size="l"
                tooltip={playing ? "Pause" : "Play"}
                onClick={() => setPlaying((value) => !value)}
              />
              <IconButton icon="forward" variant="secondary" size="l" tooltip="Forward 30s" />
            </Row>
          </Row>
        </Column>

        <Column fillWidth gap="16">
          <Row fillWidth horizontal="between" vertical="center" wrap gap="12">
            <Heading variant="heading-strong-m">Continue listening</Heading>
            <Button size="s" variant="tertiary">
              View history
            </Button>
          </Row>
          <Scroller fitWidth style={{ maxWidth: "100%" }}>
            <Row fitWidth gap="12">
              {continueListening.map((item) => (
                <Column
                  key={item.episode}
                  minWidth={18}
                  gap="12"
                  padding="12"
                  radius="l"
                  border
                  background="page"
                  cursor="interactive"
                >
                  <Media
                    aspectRatio="1/1"
                    src={item.image}
                    alt={item.title}
                    sizes="144px"
                    radius="m"
                  />
                  <Column gap="4">
                    <Text variant="label-default-s">{item.title}</Text>
                    <Text variant="label-default-xs" onBackground="neutral-weak">
                      {item.episode}
                    </Text>
                    <ProgressBar showLabel={false} value={item.progress} />
                  </Column>
                </Column>
              ))}
            </Row>
          </Scroller>
        </Column>

        <Column fillWidth gap="16">
          <Row fillWidth horizontal="between" vertical="center" wrap gap="12">
            <Heading variant="heading-strong-m">Browse shows</Heading>
            <SegmentedControl
              buttons={topics.map((item) => ({ label: item.label, value: item.value }))}
              value={topic}
              onChange={setTopic}
            />
          </Row>
          <Row fillWidth gap="16" wrap>
            {shows.map((show) => (
              <Column
                key={show.title}
                flex={1}
                minWidth={16}
                gap="12"
                padding="12"
                radius="l"
                border
                background="overlay"
                cursor="interactive"
              >
                <Row fillWidth gap="12" vertical="center">
                  <Media
                    aspectRatio="1/1"
                    src={show.image}
                    alt={show.title}
                    sizes="80px"
                    radius="m"
                    style={{ width: "4rem" }}
                  />
                  <Column gap="4" fillWidth>
                    <Row gap="8" vertical="center">
                      <Text variant="label-default-s">{show.title}</Text>
                      <Tag size="s" scheme="neutral">
                        {show.tag}
                      </Tag>
                    </Row>
                    <Text variant="label-default-xs" onBackground="neutral-weak">
                      {show.host} · {show.episodes} episodes
                    </Text>
                  </Column>
                  <IconButton icon="plus" variant="tertiary" size="s" tooltip="Follow" />
                </Row>
              </Column>
            ))}
          </Row>
        </Column>
      </Column>

      <Row
        fillWidth
        position="sticky"
        bottom="0"
        padding="12"
        borderTop
        background="page"
        vertical="center"
        gap="16"
        zIndex={2}
      >
        <Row fillWidth maxWidth="xl" horizontal="center" gap="16" paddingX="l" vertical="center">
          <Media
            aspectRatio="1/1"
            src={nowPlaying.image}
            alt={nowPlaying.title}
            sizes="48px"
            radius="s"
            style={{ width: "3rem" }}
          />
          <Column fillWidth gap="4" minWidth={0}>
            <Text variant="label-default-s">{nowPlaying.episode}</Text>
            <ProgressBar showLabel={false} value={nowPlaying.progress} />
          </Column>
          <Row gap="4" vertical="center">
            <IconButton
              icon={playing ? "pause" : "play"}
              variant="primary"
              size="m"
              tooltip={playing ? "Pause" : "Play"}
              onClick={() => setPlaying((value) => !value)}
            />
            <IconButton icon="document" variant="tertiary" size="m" tooltip="Queue" />
          </Row>
        </Row>
      </Row>

      <Row fillWidth paddingX="l" horizontal="center" paddingBottom="24">
        <Footer2 maxWidth="xl" paddingX="0" />
      </Row>
    </Column>
  );
};
