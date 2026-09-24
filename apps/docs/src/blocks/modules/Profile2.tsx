"use client";

import {
  Avatar,
  Button,
  Card,
  Column,
  Heading,
  IconButton,
  Line,
  Media,
  Row,
  Scroller,
  Text,
} from "@once-ui-system/core";

const stats = [
  { label: "Followers", value: "12.4k" },
  { label: "Following", value: "842" },
  { label: "Projects", value: "38" },
];

const highlights = [
  { label: "Studio", image: "/images/products/studio-01.jpg" },
  { label: "Docs", image: "/images/products/docs-01.jpg" },
  { label: "Journal", image: "/images/products/journal-02.jpg" },
  { label: "Spotlight", image: "/images/products/spotlight-02.jpg" },
  { label: "Convert", image: "/images/products/convert-hero.jpg" },
];

const recentPosts = [
  {
    title: "Shipping a design system in public",
    excerpt: "Notes from building Once UI with a community-first release cadence.",
    image: "/images/backgrounds/1.jpg",
    time: "2h",
    likes: "284",
  },
  {
    title: "Why semantic layout props beat utility classes",
    excerpt: "Readable syntax that keeps AI agents on track without bloating context.",
    image: "/images/backgrounds/4.jpg",
    time: "1d",
    likes: "512",
  },
  {
    title: "A week of block design reviews",
    excerpt: "How we keep Pro blocks cohesive while exploring new patterns every sprint.",
    image: "/images/backgrounds/7.jpg",
    time: "3d",
    likes: "198",
  },
];

export const Profile2 = () => {
  return (
    <Column fillWidth horizontal="center" padding="16" gap="32">
      <Column fillWidth maxWidth="m" gap="24">
        <Row fillWidth gap="16" vertical="center" wrap>
          <Avatar
            src="/images/creators/lorant.jpg"
            size="xl"
            statusIndicator={{ color: "green" }}
          />
          <Column fill gap="4" minWidth={16}>
            <Heading variant="heading-strong-l">Lorant One</Heading>
            <Text onBackground="neutral-weak" variant="body-default-m">
              Design Engineer · Once UI
            </Text>
            <Text onBackground="neutral-medium" variant="body-default-s" wrap="balance">
              Building semantic design systems and shipping production-ready blocks for modern
              product teams.
            </Text>
          </Column>
          <Row gap="8" wrap>
            <Button size="s" prefixIcon="addPerson">
              Follow
            </Button>
            <Button size="s" variant="secondary">
              Message
            </Button>
            <IconButton icon="moreHorizontal" tooltip="More options" tooltipPosition="left" />
          </Row>
        </Row>

        <Row fillWidth gap="24" wrap>
          {stats.map((stat, index) => (
            <Row key={stat.label} gap="24" vertical="center">
              <Column gap="2">
                <Heading variant="heading-strong-m">{stat.value}</Heading>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {stat.label}
                </Text>
              </Column>
              {index < stats.length - 1 && (
                <Line vert height="32" background="neutral-alpha-weak" />
              )}
            </Row>
          ))}
        </Row>

        <Column fillWidth gap="12">
          <Text variant="label-strong-s" onBackground="neutral-weak">
            Highlights
          </Text>
          <Scroller fadeColor="page">
            <Row gap="16" paddingBottom="4">
              {highlights.map((item) => (
                <Column key={item.label} gap="8" horizontal="center" minWidth={6}>
                  <Row radius="full" border="brand-alpha-weak" padding="2" overflow="hidden">
                    <Media
                      sizes="80px"
                      src={item.image}
                      alt={item.label}
                      aspectRatio="1"
                      radius="full"
                      width={5}
                    />
                  </Row>
                  <Text variant="label-default-s">{item.label}</Text>
                </Column>
              ))}
            </Row>
          </Scroller>
        </Column>

        <Column fillWidth gap="12">
          <Row fillWidth horizontal="between" vertical="center">
            <Text variant="label-strong-s" onBackground="neutral-weak">
              Recent posts
            </Text>
            <Button href="#" size="s" variant="tertiary" weight="default">
              View all
            </Button>
          </Row>
          <Column fillWidth gap="8">
            {recentPosts.map((post) => (
              <Card
                key={post.title}
                href="#"
                fillWidth
                direction="row"
                gap="16"
                padding="12"
                radius="l"
                border
                background="transparent"
                s={{ direction: "column" }}
              >
                <Media
                  sizes="120px"
                  src={post.image}
                  alt={post.title}
                  aspectRatio="1"
                  radius="m"
                  minWidth={8}
                  maxWidth={8}
                />
                <Column fill gap="8" vertical="center">
                  <Heading as="h3" variant="heading-strong-s" wrap="balance">
                    {post.title}
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
                    {post.excerpt}
                  </Text>
                  <Row gap="12" vertical="center">
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {post.time}
                    </Text>
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      ·
                    </Text>
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {post.likes} likes
                    </Text>
                  </Row>
                </Column>
              </Card>
            ))}
          </Column>
        </Column>
      </Column>
    </Column>
  );
};
