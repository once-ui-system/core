"use client";

import {
  Avatar,
  Button,
  Column,
  Grid,
  Heading,
  IconButton,
  Media,
  Row,
  SegmentedControl,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";
import { Sidebar3 } from "./Sidebar3";

export const Profile1 = () => {
  const [view, setView] = useState<string>("posts");
  const handleToggle = (value: string) => {
    setView(value);
  };

  return (
    <Row fillWidth padding="16">
      <Row
        s={{ hide: true }}
        position="sticky"
        fitHeight
        style={{ top: "50%", transform: "translateY(-50%)" }}
      >
        <Sidebar3 />
      </Row>
      <Column fillWidth fitHeight horizontal="center" gap="80" paddingX="l">
        <Column maxWidth="m" height="m">
          <Media
            sizes="100vw"
            src="/images/blocks/vibe-coding-dark.jpg"
            alt="Cover image"
            radius="xl"
          />
          <Avatar
            style={{
              left: "50%",
              transform: "translate(-50%, 50%)",
              borderColor: "var(--page-background)",
            }}
            bottom="0"
            position="absolute"
            src="/images/creators/lorant.jpg"
            borderWidth={8}
            size="xl"
            statusIndicator={{ color: "green" }}
          />
          <Row position="absolute" top="16" right="16">
            <IconButton icon="edit" tooltip="Edit profile" tooltipPosition="left" />
          </Row>
        </Column>
        <Column fillWidth horizontal="center" paddingTop="24" gap="8">
          <Heading variant="display-default-s" align="center">
            Lorant One
          </Heading>
          <Text onBackground="neutral-weak" align="center">
            Design Engineer
          </Text>
          <SegmentedControl
            marginTop="40"
            maxWidth={24}
            buttons={[
              {
                prefixIcon: "bookmark",
                label: "Posts",
                value: "posts",
              },
              {
                prefixIcon: "person",
                label: "About",
                value: "about",
              },
            ]}
            onChange={handleToggle}
          />
          {view === "posts" && (
            <Grid maxWidth="m" columns={3} gap="8" marginTop="40">
              {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
                <Media
                  key={num}
                  sizes="320px"
                  src={`/images/backgrounds/${num}.jpg`}
                  alt="Post image"
                  aspectRatio="3 / 4"
                  radius="l"
                />
              ))}
            </Grid>
          )}
          {view === "about" && (
            <Column maxWidth="xs" fillWidth gap="16" marginTop="40" paddingX="16">
              <Heading as="h2">About Me</Heading>
              <Text as="p" onBackground="neutral-medium" variant="body-default-m">
                I am a passionate and versatile Data Engineer with expertise in SQL, Python, and
                BigQuery. With 4 years of experience in the field, I specialize in extracting,
                transforming, and loading data for insights and decision-making.
              </Text>
              <Text as="p" onBackground="neutral-medium" variant="body-default-m">
                My strong analytical skills and attention to detail ensure the quality and accuracy
                of my work. I am always seeking new challenges that push me to stay ahead in the
                ever-evolving world of data engineering.
              </Text>
              <Row fillWidth gap="8" wrap data-border="rounded" marginTop="24">
                <Button
                  href="#"
                  weight="default"
                  prefixIcon="github"
                  label="GitHub"
                  size="s"
                  variant="secondary"
                />
                <Button
                  href="#"
                  weight="default"
                  prefixIcon="linkedin"
                  label="LinkedIn"
                  size="s"
                  variant="secondary"
                />
                <Button
                  href="#"
                  weight="default"
                  prefixIcon="threads"
                  label="Threads"
                  size="s"
                  variant="secondary"
                />
              </Row>
            </Column>
          )}
        </Column>
        <Row hide s={{ hide: false }} height="64" />
        <Sidebar3
          hide
          s={{ hide: false }}
          background="page"
          fillWidth
          horizontal="center"
          direction="row"
          position="sticky"
          bottom="0"
        />
      </Column>
    </Row>
  );
};
