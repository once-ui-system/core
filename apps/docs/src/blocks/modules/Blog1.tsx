import {
  Avatar,
  Button,
  Card,
  Column,
  Grid,
  Heading,
  IconButton,
  Media,
  Row,
  Scroller,
  Text,
} from "@once-ui-system/core";
import { Newsletter1 } from "./Newsletter1";

export const Blog1 = () => {
  const posts = [
    {
      title: "Discovery of a Supermassive Black Hole in the Heart of the Milky Way",
      publishedAt: "2025-02-08",
      tag: "Featured",
      image: "/images/docs/solar-01.jpg",
      author: {
        name: "Lorant One",
        avatar: "/images/creators/lorant.jpg",
      },
    },
    {
      title: "SpaceX's New Mars Colony Project: What You Need to Know",
      publishedAt: "2025-02-01",
      tag: "Space Travel",
      image: "/images/docs/solar-02.jpg",
      author: {
        name: "Lorant One",
        avatar: "/images/creators/lorant.jpg",
      },
    },
    {
      title: "Quantum Tunneling: The Key to Interstellar Travel?",
      publishedAt: "2025-01-28",
      tag: "Physics",
      image: "/images/docs/solar-03.jpg",
      author: {
        name: "Lorant One",
        avatar: "/images/creators/lorant.jpg",
      },
    },
    {
      title: "NASA's Latest Discovery: Water Ice Found on Europa",
      publishedAt: "2025-01-15",
      tag: "Discovery",
      image: "/images/docs/solar-01.jpg",
      author: {
        name: "Lorant One",
        avatar: "/images/creators/lorant.jpg",
      },
    },
    {
      title: "The Mystery of Dark Matter: New Theories Emerge",
      publishedAt: "2025-01-10",
      tag: "Astrophysics",
      image: "/images/docs/solar-02.jpg",
      author: {
        name: "Lorant One",
        avatar: "/images/creators/lorant.jpg",
      },
    },
    {
      title: "Living on Mars: The Challenges of Human Settlement",
      publishedAt: "2025-01-05",
      tag: "Space Colony",
      image: "/images/docs/solar-03.jpg",
      author: {
        name: "Lorant One",
        avatar: "/images/creators/lorant.jpg",
      },
    },
    {
      title: "Wormholes: A Shortcut Through Space-Time",
      publishedAt: "2024-12-28",
      tag: "Theory",
      image: "/images/docs/solar-01.jpg",
      author: {
        name: "Lorant One",
        avatar: "/images/creators/lorant.jpg",
      },
    },
  ];

  return (
    <Column fillWidth gap="24" maxWidth="s">
      <Heading variant="display-strong-xs" marginLeft="16">
        Deep Space
      </Heading>
      <Scroller>
        <Row fitWidth paddingX="16" gap="8">
          <Button size="s" weight="default" label="All" />
          <Button size="s" weight="default" variant="secondary" label="Space Travel" />
          <Button size="s" weight="default" variant="secondary" label="Physics" />
          <Button size="s" weight="default" variant="secondary" label="Space Colony" />
          <Button size="s" weight="default" variant="secondary" label="Theory" />
        </Row>
      </Scroller>
      <Card
        href="#"
        radius="l"
        border="transparent"
        background="transparent"
        direction="column"
        fillWidth
      >
        {posts[0].image && (
          <Media
            priority
            sizes="640px"
            border
            cursor="interactive"
            radius="l"
            src={posts[0].image}
            alt={`Thumbnail of ${posts[0].title}`}
            aspectRatio="16 / 9"
          />
        )}
        <Column padding="32" fillWidth gap="16" vertical="center">
          {posts[0].tag && (
            <Text variant="label-strong-s" onBackground="neutral-weak">
              {posts[0].tag}
            </Text>
          )}
          <Heading as="h2" variant="heading-strong-l" wrap="balance">
            {posts[0].title}
          </Heading>
          <Row gap="12" vertical="center">
            <Avatar src={posts[0].author.avatar} size="s" />
            <Text variant="label-default-s" onBackground="neutral-weak">
              {posts[0].author.name}
            </Text>
          </Row>
        </Column>
      </Card>
      {posts.slice(1, 3).map((post, index) => (
        <Card
          key={index}
          href="#"
          radius="l"
          border="transparent"
          background="transparent"
          s={{ direction: "column" }}
          fillWidth
        >
          {post.image && (
            <Media
              priority
              sizes="(max-width: 768px) 100vw, 720px"
              border
              cursor="interactive"
              radius="l"
              src={post.image}
              alt={`Thumbnail of ${post.title}`}
              aspectRatio="16 / 9"
            />
          )}
          <Column paddingY="32" paddingX="48" fillWidth gap="16" vertical="center">
            {post.tag && (
              <Text variant="label-strong-s" onBackground="neutral-weak">
                {post.tag}
              </Text>
            )}
            <Heading as="h2" variant="heading-strong-l" wrap="balance">
              {post.title}
            </Heading>
            <Row gap="12" vertical="center">
              <Avatar src={post.author.avatar} size="s" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                {post.author.name}
              </Text>
            </Row>
          </Column>
        </Card>
      ))}
      <Grid fillWidth columns={2} s={{ columns: 1 }} gap="8">
        {posts.slice(3).map((post, index) => (
          <Card
            key={index}
            href="#"
            radius="l"
            border="transparent"
            background="transparent"
            fillWidth
          >
            <Column padding="32" fillWidth gap="16" vertical="center">
              {post.tag && (
                <Text variant="label-strong-s" onBackground="neutral-weak">
                  {post.tag}
                </Text>
              )}
              <Heading as="h2" variant="heading-strong-l" wrap="balance">
                {post.title}
              </Heading>
              <Row gap="12" vertical="center">
                <Avatar src={post.author.avatar} size="s" />
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {post.author.name}
                </Text>
              </Row>
            </Column>
          </Card>
        ))}
      </Grid>
      <Row data-border="rounded" fillWidth center gap="8" paddingBottom="l">
        <IconButton size="s" icon="chevronLeft" variant="ghost" disabled />
        <Row gap="8" paddingX="8">
          <IconButton size="m">
            <Text variant="label-strong-s">1</Text>
          </IconButton>
          <IconButton variant="secondary" size="m">
            <Text variant="label-default-s">2</Text>
          </IconButton>
          <IconButton variant="secondary" size="m">
            <Text variant="label-default-s">3</Text>
          </IconButton>
        </Row>
        <IconButton size="s" icon="chevronRight" variant="ghost" />
      </Row>
      <Newsletter1 />
    </Column>
  );
};
