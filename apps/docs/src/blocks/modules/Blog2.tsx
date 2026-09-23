import { Avatar, Card, Column, Grid, Heading, Media, Row, Tag, Text } from "@once-ui-system/core";

interface Post {
  title: string;
  excerpt: string;
  publishedAt: string;
  tag: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
}

const topics = ["All", "Product", "Engineering", "Design", "Culture"];

const posts: Post[] = [
  {
    title: "Redesigning our onboarding flow from the ground up",
    excerpt:
      "How we cut time-to-first-value in half by rethinking the first five minutes of the product.",
    publishedAt: "Jun 12, 2026",
    tag: "Product",
    image: "/images/products/docs-01.jpg",
    author: { name: "Evan Carter", avatar: "/images/creators/evan.jpg" },
  },
  {
    title: "5 patterns for building resilient APIs",
    excerpt:
      "Retries, idempotency, and graceful degradation — the building blocks of an API that doesn't fall over.",
    publishedAt: "Jun 3, 2026",
    tag: "Engineering",
    image: "/images/products/studio-01.jpg",
    author: { name: "Kevin Wu", avatar: "/images/creators/kevin.jpg" },
  },
  {
    title: "How we structure design reviews at scale",
    excerpt: "A lightweight process that keeps quality high without slowing teams down.",
    publishedAt: "May 22, 2026",
    tag: "Design",
    image: "/images/products/journal-02.jpg",
    author: { name: "Ryan Ford", avatar: "/images/creators/ryan.jpg" },
  },
  {
    title: "A practical guide to feature flags",
    excerpt: "Ship faster and roll back instantly with a flagging strategy that actually scales.",
    publishedAt: "May 14, 2026",
    tag: "Engineering",
    image: "/images/products/starter-02.jpg",
    author: { name: "Justin Cole", avatar: "/images/creators/justin.jpg" },
  },
  {
    title: "What we learned shipping weekly for a year",
    excerpt: "The habits, rituals, and tooling that made a weekly release cadence sustainable.",
    publishedAt: "May 2, 2026",
    tag: "Culture",
    image: "/images/products/spotlight-02.jpg",
    author: { name: "Lorant One", avatar: "/images/creators/lorant.jpg" },
  },
];

export const Blog2 = (flex: React.ComponentProps<typeof Column>) => {
  const [featured, ...rest] = posts;

  return (
    <Column fillWidth horizontal="center" gap="40" {...flex}>
      <Column fillWidth maxWidth="l" gap="24">
        <Column fillWidth gap="8" paddingX="16">
          <Heading as="h1" variant="display-strong-s">
            From the journal
          </Heading>
          <Text onBackground="neutral-medium" variant="body-default-l">
            Notes on product, engineering, and the craft of building software.
          </Text>
        </Column>

        <Row fillWidth gap="8" paddingX="16" wrap>
          {topics.map((topic, index) => (
            <Tag key={topic} size="l" scheme={index === 0 ? "brand" : "neutral"}>
              {topic}
            </Tag>
          ))}
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
              <Tag size="s" scheme="neutral">
                {featured.tag}
              </Tag>
              <Heading
                as="h2"
                variant="display-strong-xs"
                onBackground="neutral-strong"
                wrap="balance"
              >
                {featured.title}
              </Heading>
              <Text onBackground="neutral-weak" variant="body-default-m" wrap="balance">
                {featured.excerpt}
              </Text>
              <Row gap="8" vertical="center" paddingTop="4">
                <Avatar src={featured.author.avatar} size="s" />
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {featured.author.name} · {featured.publishedAt}
                </Text>
              </Row>
            </Column>
          </Row>
        </Card>

        <Grid fillWidth columns={2} s={{ columns: 1 }} gap="16">
          {rest.map((post) => (
            <Card
              key={post.title}
              href="#"
              radius="l"
              border="transparent"
              background="transparent"
              direction="column"
              fillWidth
            >
              <Media
                sizes="(max-width: 768px) 100vw, 480px"
                border
                cursor="interactive"
                radius="l"
                src={post.image}
                alt={`Thumbnail of ${post.title}`}
                aspectRatio="16 / 9"
              />
              <Column paddingTop="16" gap="12" fillWidth>
                <Text variant="label-strong-s" onBackground="neutral-weak">
                  {post.tag}
                </Text>
                <Heading as="h3" variant="heading-strong-m" wrap="balance">
                  {post.title}
                </Heading>
                <Text onBackground="neutral-weak" variant="body-default-s" wrap="balance">
                  {post.excerpt}
                </Text>
                <Row gap="8" vertical="center" paddingTop="4">
                  <Avatar src={post.author.avatar} size="s" />
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {post.author.name} · {post.publishedAt}
                  </Text>
                </Row>
              </Column>
            </Card>
          ))}
        </Grid>
      </Column>
    </Column>
  );
};
