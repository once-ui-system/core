"use client";

import {
  Avatar,
  Background,
  Card,
  Column,
  Grid,
  Heading,
  Icon,
  IconButton,
  type IconName,
  MatrixFx,
  Media,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";

const social = [
  { icon: "github" as const, href: "#" },
  { icon: "discord" as const, href: "#" },
  { icon: "threads" as const, href: "#" },
];

const featured = {
  title: "Design tokens without the chaos",
  excerpt:
    "How a single theme file keeps complex brand systems predictable across dozens of surfaces.",
  publishedAt: "Jul 8, 2026",
  tag: "Design",
  image: "/images/products/docs-02.jpg",
  author: { name: "Ryan Ford", avatar: "/images/creators/ryan.jpg" },
};

const posts = [
  {
    title: "From prototype to production in one sprint",
    excerpt: "The workflow we use to ship landing pages without context switching.",
    publishedAt: "Jul 2, 2026",
    tag: "Product",
    image: "/images/products/studio-04.jpg",
    author: { name: "Evan Carter", avatar: "/images/creators/evan.jpg" },
  },
  {
    title: "Composable blocks for AI-native teams",
    excerpt: "Why copy-paste sections beat one-off prompts at scale.",
    publishedAt: "Jun 24, 2026",
    tag: "Engineering",
    image: "/images/products/starter-02.jpg",
    author: { name: "Kevin Wu", avatar: "/images/creators/kevin.jpg" },
  },
];

const resourceCards = [
  {
    href: "#",
    icon: "bolt" as const,
    title: "Changelog",
    description: "Release notes and changes",
  },
  {
    href: "#",
    icon: "time" as const,
    title: "Roadmap",
    description: "Future plans and progress",
  },
];

function ResourceCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: IconName;
  title: string;
  description: string;
}) {
  return (
    <Card
      href={href}
      fillWidth
      aspectRatio="16 / 9"
      background="transparent"
      border="transparent"
      direction="column"
      padding="4"
      radius="l"
    >
      <MatrixFx
        radius="l"
        border
        flicker
        fps={40}
        colors={["neutral-solid-strong", "static-transparent"]}
        size={2}
        spacing={4}
      />
      <Background
        pointerEvents="none"
        fill
        center
        position="absolute"
        left="0"
        top="0"
        gradient={{
          display: true,
          colorStart: "page-background",
        }}
      >
        <Column paddingY="20" paddingX="24" gap="8" align="center" horizontal="center">
          <Icon name={icon} size="s" padding="8" radius="m" border marginBottom="12" />
          <Heading as="h2" variant="heading-strong-xl">
            {title}
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {description}
          </Text>
        </Column>
      </Background>
    </Card>
  );
}

export const Blog4 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth horizontal="center" paddingY="24" gap="56" {...flex}>
      <Column fillWidth maxWidth="l" gap="40" paddingX="16">
        <Row fillWidth horizontal="between" vertical="center" paddingX="8">
          <Heading variant="heading-strong-xl">Blog</Heading>
          <Row gap="8">
            {social.map((item) => (
              <IconButton
                key={item.icon}
                data-border="rounded"
                href={item.href}
                icon={item.icon}
                size="l"
                variant="secondary"
              />
            ))}
          </Row>
        </Row>

        <Card href="#" radius="l" border="transparent" background="transparent" fillWidth>
          <Row fillWidth aspectRatio="16/7" radius="l" overflow="hidden" position="relative">
            <Media
              stretch
              sizes="1024px"
              src={featured.image}
              alt={`Cover image of ${featured.title}`}
            />
            <Column
              fill
              position="absolute"
              vertical="end"
              padding="32"
              gap="12"
              background="overlay"
            >
              <Tag scheme="brand" size="s">
                {featured.tag}
              </Tag>
              <Heading as="h2" variant="display-strong-xs" wrap="balance">
                {featured.title}
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
                {featured.excerpt}
              </Text>
              <Row gap="12" vertical="center">
                <Avatar src={featured.author.avatar} size="s" />
                <Text variant="label-default-s">{featured.author.name}</Text>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {featured.publishedAt}
                </Text>
              </Row>
            </Column>
          </Row>
        </Card>

        <Row fillWidth gap="56" s={{ direction: "column" }}>
          {resourceCards.map((card) => (
            <ResourceCard key={card.title} {...card} />
          ))}
        </Row>

        <Column fillWidth gap="24">
          <Heading as="h2" paddingX="8">
            Recent posts
          </Heading>
          <Grid fillWidth columns={2} gap="56" s={{ columns: 1 }}>
            {posts.map((post) => (
              <Card
                key={post.title}
                href="#"
                fillWidth
                radius="l"
                border="transparent"
                background="transparent"
                direction="column"
                gap="16"
              >
                <Media
                  aspectRatio="16/9"
                  src={post.image}
                  radius="l"
                  alt={post.title}
                  sizes="512px"
                />
                <Column gap="8" paddingX="8">
                  <Row gap="8" vertical="center">
                    <Tag scheme="neutral" size="s">
                      {post.tag}
                    </Tag>
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {post.publishedAt}
                    </Text>
                  </Row>
                  <Heading as="h3" variant="heading-strong-m" wrap="balance">
                    {post.title}
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
                    {post.excerpt}
                  </Text>
                  <Row gap="8" vertical="center">
                    <Avatar src={post.author.avatar} size="xs" />
                    <Text variant="label-default-s">{post.author.name}</Text>
                  </Row>
                </Column>
              </Card>
            ))}
          </Grid>
        </Column>
      </Column>
    </Column>
  );
};
