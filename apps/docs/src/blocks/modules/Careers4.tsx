"use client";

import {
  Animation,
  Background,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Media,
  Pulse,
  Row,
  Text,
} from "@once-ui-system/core";

const pillars = [
  {
    title: "Ship with intention",
    description:
      "We optimize for depth over velocity — every release should feel considered, not rushed.",
    image: "/images/customize/philosophy/01.jpg",
    alt: "Team reviewing design work together",
  },
  {
    title: "Build in public",
    description:
      "Roadmaps, changelogs, and design decisions live in the open so the community grows with us.",
    image: "/images/customize/philosophy/02.jpg",
    alt: "Developer sharing progress on a live stream",
  },
  {
    title: "Stay curious",
    description:
      "Learning budgets, async deep work, and room to experiment keep craft alive as we scale.",
    image: "/images/customize/philosophy/03.jpg",
    alt: "Workspace with books and sketches",
  },
];

const perks = [
  { label: "Remote-first", icon: "world" as const },
  { label: "Equity", icon: "banknotes" as const },
  { label: "Learning budget", icon: "book" as const },
  { label: "Flexible hours", icon: "calendar" as const },
];

export const Careers4 = () => {
  return (
    <Column fillWidth horizontal="center" borderY marginTop="8">
      <Column fillWidth maxWidth="l" borderX>
        <Background
          position="absolute"
          fill
          m={{ hide: true }}
          lines={{
            display: true,
            color: "neutral-alpha-weak",
            angle: -45,
            size: "4",
          }}
        />

        <Column fillWidth padding="l" gap="16" borderBottom>
          <Row gap="8" vertical="center">
            <Pulse size="m" scheme="brand" />
            <Text onBackground="brand-weak">Culture</Text>
          </Row>
          <Heading as="h1" variant="display-strong-s" wrap="balance">
            How we work before what we ship
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            Once UI is a small team of design engineers building tools for independent creators.
            These principles guide every hire, review, and release.
          </Text>
        </Column>

        <Grid fillWidth columns={3} s={{ columns: 1 }} gap="8" padding="8" background="page">
          {pillars.map((pillar, index) => (
            <Column
              key={pillar.title}
              fillWidth
              horizontal={index === 1 ? "center" : index === 2 ? "end" : "start"}
            >
              <Column
                maxWidth={24}
                fillWidth
                border
                radius="xl"
                padding="8"
                gap="8"
                background="page"
              >
                <Animation
                  triggerType="hover"
                  easing="spring"
                  duration={400}
                  zoomOut={1.08}
                  fade={0.8}
                >
                  <Media src={pillar.image} alt={pillar.alt} aspectRatio="1" radius="l" />
                </Animation>
                <Column fillWidth padding="16" gap="12">
                  <Heading as="h3" variant="heading-default-xs">
                    {pillar.title}
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
                    {pillar.description}
                  </Text>
                </Column>
              </Column>
            </Column>
          ))}
        </Grid>

        <Row fillWidth padding="l" gap="16" vertical="center" horizontal="between" borderTop wrap>
          <Row gap="8" wrap>
            {perks.map((perk) => (
              <Row
                key={perk.label}
                gap="8"
                vertical="center"
                paddingX="12"
                paddingY="8"
                radius="full"
                border="neutral-alpha-medium"
              >
                <Icon name={perk.icon} size="xs" onBackground="neutral-weak" />
                <Text variant="label-default-s">{perk.label}</Text>
              </Row>
            ))}
          </Row>
          <Button href="#" suffixIcon="arrowUpRight">
            View open roles
          </Button>
        </Row>
      </Column>
    </Column>
  );
};
