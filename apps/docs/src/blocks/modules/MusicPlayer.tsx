import {
  Background,
  Button,
  Card,
  Column,
  IconButton,
  Line,
  Media,
  Row,
  Scroller,
  Text,
  User,
} from "@once-ui-system/core";
import { clsx } from "clsx";
import type React from "react";
import styles from "./MusicPlayer.module.scss";

export const MusicPlayer: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  const tracks = [
    {
      title: "Vibe Coding Theme",
      artist: "Texz",
      coverImage: "/images/docs/vibe-coding-light.jpg",
      duration: "3:15",
    },
    {
      title: "Daytime Coding",
      artist: "Texz",
      coverImage: "/images/docs/vibe-coding-dark.jpg",
      duration: "2:47",
    },
    {
      title: "Midnight Coding",
      artist: "Texz",
      coverImage: "/images/docs/vibe-coding-light.jpg",
      duration: "5:51",
    },
    {
      title: "Chill Coding",
      artist: "Texz",
      coverImage: "/images/docs/vibe-coding-dark.jpg",
      duration: "2:47",
    },
    {
      title: "All Day Coding",
      artist: "Texz",
      coverImage: "/images/docs/vibe-coding-light.jpg",
      duration: "3:55",
    },
    {
      title: "The World is Burning But I'm Coding",
      artist: "Texz",
      coverImage: "/images/docs/vibe-coding-light.jpg",
      duration: "3:15",
    },
    {
      title: "WTF are you coding?",
      artist: "Texz",
      coverImage: "/images/docs/vibe-coding-dark.jpg",
      duration: "2:47",
    },
    {
      title: "2AM Ice Coffee Coding",
      artist: "Texz",
      coverImage: "/images/docs/vibe-coding-light.jpg",
      duration: "1:05",
    },
    {
      title: "Existential Crisis Coding",
      artist: "Texz",
      coverImage: "/images/docs/vibe-coding-dark.jpg",
      duration: "5:23",
    },
    {
      title: "Thanks for Coding",
      artist: "Texz",
      coverImage: "/images/docs/vibe-coding-light.jpg",
      duration: "6:12",
    },
  ];

  return (
    <Column
      fillWidth
      border="surface"
      radius="l-4"
      padding="8"
      gap="20"
      overflow="hidden"
      {...flex}
    >
      <Background
        position="absolute"
        left="0"
        top="0"
        mask={{
          x: 50,
          y: -50,
          radius: 100,
        }}
        gradient={{
          display: true,
          opacity: 50,
          x: 50,
          y: 0,
          colorStart: "brand-background-strong",
          colorEnd: "static-transparent",
        }}
      />
      <Row fillWidth s={{ direction: "column" }} fill>
        <Column fill>
          <Column padding="24" gap="24" fill horizontal="center" align="center">
            <Row fillWidth horizontal="between" vertical="center" gap="12">
              <IconButton tooltip="Like" tooltipPosition="bottom" variant="ghost" icon="heart" />
              <Text truncate variant="label-default-s" onBackground="brand-medium">
                Design Engineers Club
              </Text>
              <Row minWidth="32" height="32" padding="8" vertical="end" horizontal="between">
                {[1, 2, 3].map((index) => (
                  <Row
                    key={index}
                    width="2"
                    radius="xs"
                    solid="neutral-strong"
                    className={clsx(styles.audiovisualizer, styles[`bar${index}`])}
                  />
                ))}
              </Row>
            </Row>
            <Column fill center gap="32">
              <Media
                priority
                sizes="320px"
                radius="l"
                maxWidth={16}
                aspectRatio="1/1"
                border
                src="/images/docs/vibe-coding-dark.jpg"
                alt="Music player album cover"
              />
              <Column fillWidth center gap="8">
                <Text onBackground="brand-weak" variant="heading-strong-xl">
                  Vibe Coding Theme
                </Text>
                <User avatarProps={{ src: "/images/creators/texz.jpg", size: "s" }} name="Texz" />
                <Row marginTop="24" fillWidth gap="12" center>
                  <IconButton
                    tooltipPosition="bottom"
                    tooltip="Previous"
                    variant="ghost"
                    icon="backward"
                  />
                  <IconButton
                    tooltipPosition="bottom"
                    tooltip="Pause"
                    variant="ghost"
                    icon="pause"
                  />
                  <IconButton
                    tooltipPosition="bottom"
                    tooltip="Next"
                    variant="ghost"
                    icon="forward"
                  />
                </Row>
              </Column>
            </Column>
          </Column>
        </Column>
        <Column fill radius="l" background="surface" border overflow="hidden">
          <Row fillWidth center padding="16">
            <Column fillWidth gap="2">
              <Text onBackground="neutral-weak" variant="body-default-xs">
                Playing from:
              </Text>
              <Text onBackground="neutral-strong" variant="heading-strong-xs">
                Design Engineers Club
              </Text>
            </Column>
            <Button size="s" prefixIcon="plus">
              Follow
            </Button>
          </Row>
          <Scroller fillHeight flex={1} radius={undefined} direction="column" borderTop>
            {tracks.map((track, index) => (
              <Column key={index}>
                <Card
                  radius={undefined}
                  background="transparent"
                  border="transparent"
                  fillWidth
                  paddingY="8"
                  paddingLeft="12"
                  paddingRight="20"
                  gap="16"
                  vertical="center"
                >
                  <Media
                    priority
                    sizes="56px"
                    radius="s"
                    width="48"
                    aspectRatio="1/1"
                    border
                    src={track.coverImage}
                    alt={`${track.title} album cover`}
                  />
                  <Column fillWidth>
                    <Text truncate onBackground="neutral-strong" variant="label-strong-m">
                      {track.title}
                    </Text>
                    <Text truncate onBackground="neutral-weak" variant="body-default-xs">
                      {track.artist}
                    </Text>
                  </Column>
                  <Text onBackground="neutral-weak" variant="label-default-s">
                    {track.duration}
                  </Text>
                </Card>
                {index < tracks.length - 1 && <Line background="neutral-alpha-weak" />}
              </Column>
            ))}
          </Scroller>
        </Column>
      </Row>
      <Column fillWidth gap="8" paddingX="12" paddingBottom="8">
        <Row background="neutral-alpha-weak" border radius="full" height="4" fillWidth>
          <Row solid="brand-strong" radius="full" className={styles.grow} fill />
        </Row>
        <Row
          fillWidth
          onBackground="neutral-weak"
          textVariant="body-default-xs"
          horizontal="between"
          paddingX="4"
        >
          <Text>2:37</Text>
          <Text>3:15</Text>
        </Row>
      </Column>
    </Column>
  );
};
