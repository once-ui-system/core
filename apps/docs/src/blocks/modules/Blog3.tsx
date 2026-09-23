"use client";

import {
  Avatar,
  Button,
  Card,
  Column,
  Heading,
  Input,
  Line,
  Media,
  Row,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

interface Article {
  title: string;
  excerpt: string;
  publishedAt: string;
  readTime: string;
  topic: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
}

const topics = ["All posts", "Product", "Engineering", "Design", "Culture"];

const articles: Article[] = [
  {
    title: "Design tokens without the chaos",
    excerpt:
      "How a single theme file keeps complex brand systems predictable across dozens of surfaces.",
    publishedAt: "Jul 8, 2026",
    readTime: "6 min read",
    topic: "Design",
    image: "/images/products/docs-02.jpg",
    author: { name: "Ryan Ford", avatar: "/images/creators/ryan.jpg" },
  },
  {
    title: "From prototype to production in one sprint",
    excerpt:
      "The workflow we use to ship landing pages, dashboards, and docs without context switching.",
    publishedAt: "Jul 2, 2026",
    readTime: "8 min read",
    topic: "Product",
    image: "/images/products/studio-04.jpg",
    author: { name: "Evan Carter", avatar: "/images/creators/evan.jpg" },
  },
  {
    title: "Composable blocks for AI-native teams",
    excerpt: "Why copy-paste sections beat one-off prompts when you need consistent UI at scale.",
    publishedAt: "Jun 24, 2026",
    readTime: "5 min read",
    topic: "Engineering",
    image: "/images/products/starter-02.jpg",
    author: { name: "Kevin Wu", avatar: "/images/creators/kevin.jpg" },
  },
  {
    title: "Building in public without burning out",
    excerpt:
      "Rituals that keep weekly releases sustainable when your roadmap is also your marketing.",
    publishedAt: "Jun 18, 2026",
    readTime: "4 min read",
    topic: "Culture",
    image: "/images/products/spotlight-03.jpg",
    author: { name: "Lorant One", avatar: "/images/creators/lorant.jpg" },
  },
];

export const Blog3 = (flex: React.ComponentProps<typeof Column>) => {
  const [activeTopic, setActiveTopic] = useState("All posts");

  const filtered =
    activeTopic === "All posts"
      ? articles
      : articles.filter((article) => article.topic === activeTopic);

  return (
    <Column fillWidth horizontal="center" paddingY="24" {...flex}>
      <Row fillWidth maxWidth="l" gap="40" s={{ direction: "column" }} paddingX="16">
        <Column minWidth={20} maxWidth={24} gap="24" fillWidth>
          <Column gap="8">
            <Heading as="h1" variant="display-strong-xs">
              Journal
            </Heading>
            <Text onBackground="neutral-medium" variant="body-default-m" wrap="balance">
              Essays on product craft, design systems, and shipping software that lasts.
            </Text>
          </Column>

          <Column fillWidth gap="4">
            {topics.map((topic) => (
              <Button
                key={topic}
                fillWidth
                horizontal="start"
                size="s"
                variant={activeTopic === topic ? "secondary" : "tertiary"}
                weight="default"
                onClick={() => setActiveTopic(topic)}
              >
                {topic}
              </Button>
            ))}
          </Column>

          <Line background="neutral-alpha-weak" />

          <Column
            fillWidth
            gap="12"
            padding="16"
            radius="l"
            border="brand-alpha-weak"
            background="brand-alpha-weak"
          >
            <Heading as="h2" variant="heading-strong-s">
              Weekly digest
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-medium" wrap="balance">
              One email with new posts, block drops, and builder stories.
            </Text>
            <Input id="blog3-email" label="Email" placeholder="you@company.com" />
            <Button fillWidth size="s">
              Subscribe
            </Button>
          </Column>
        </Column>

        <Column fill gap="16">
          {filtered.map((article) => (
            <Card
              key={article.title}
              href="#"
              fillWidth
              direction="row"
              gap="20"
              padding="16"
              radius="l"
              border
              background="transparent"
              s={{ direction: "column" }}
            >
              <Media
                sizes="(max-width: 768px) 100vw, 240px"
                src={article.image}
                alt={article.title}
                aspectRatio="16 / 10"
                radius="m"
                fillWidth
              />
              <Column fill gap="12" vertical="center">
                <Text variant="label-strong-s" onBackground="brand-medium">
                  {article.topic}
                </Text>
                <Heading as="h3" variant="heading-strong-m" wrap="balance">
                  {article.title}
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
                  {article.excerpt}
                </Text>
                <Row gap="8" vertical="center" wrap>
                  <Avatar src={article.author.avatar} size="s" />
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {article.author.name}
                  </Text>
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    ·
                  </Text>
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {article.publishedAt}
                  </Text>
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    ·
                  </Text>
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {article.readTime}
                  </Text>
                </Row>
              </Column>
            </Card>
          ))}
        </Column>
      </Row>
    </Column>
  );
};
