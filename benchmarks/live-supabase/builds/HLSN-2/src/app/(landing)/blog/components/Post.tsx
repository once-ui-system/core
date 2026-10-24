"use client";

import { AvatarGroup, Card, Column, Grid, Heading, Media, Row, Text } from "@once-ui-system/core";
import { formatDate } from "@/utils";
import type { BlogPost } from "@/utils/utils";

interface PostProps extends React.ComponentProps<typeof Card> {
  post: BlogPost;
  thumbnail: boolean;
  /** The newest post leads the list as a wide card; the rest share a grid. */
  featured?: boolean;
}

const authorLine = (team: BlogPost["metadata"]["team"]) => {
  if (!team?.length) return null;
  const names = team.map((person) => person.name);
  return names.length <= 2
    ? names.join(" and ")
    : `${names.slice(0, 2).join(", ")} + ${names.length - 2} more`;
};

export function Post({ post, thumbnail, featured = false, ...card }: PostProps) {
  const avatars = post.metadata.team?.map((person) => ({ src: person.avatar })) || [];
  const authors = authorLine(post.metadata.team);

  return (
    <Card
      href={`/blog/${post.slug}`}
      transition="micro-medium"
      direction="column"
      radius="l"
      padding="8"
      gap="8"
      background="transparent"
      border="neutral-alpha-weak"
      fillWidth
      {...card}
    >
      <Grid fillWidth fillHeight columns={featured ? 2 : 1} s={{ columns: 1 }} gap="8">
        {post.metadata.image && thumbnail && (
          <Media
            priority={featured}
            sizes={featured ? "(max-width: 768px) 100vw, 720px" : "(max-width: 768px) 100vw, 400px"}
            radius="m"
            border="neutral-alpha-weak"
            cursor="interactive"
            src={post.metadata.image}
            alt=""
            aspectRatio="16 / 9"
          />
        )}
        <Column
          flex={1}
          gap="12"
          paddingX={featured ? "32" : "12"}
          paddingTop={featured ? "32" : "16"}
          paddingBottom={featured ? "32" : "12"}
          vertical={featured ? "center" : undefined}
          s={{ paddingX: "12", paddingTop: "16", paddingBottom: "12" }}
        >
          <Row gap="8" vertical="center" textVariant="label-default-s" onBackground="neutral-weak">
            {post.metadata.tag && (
              <Text variant="label-strong-s" onBackground="brand-medium">
                {post.metadata.tag}
              </Text>
            )}
            {post.metadata.tag && <Text aria-hidden>·</Text>}
            <Text>{formatDate(post.metadata.publishedAt, false)}</Text>
          </Row>
          <Heading
            as="h2"
            data-exclude-nav
            variant={featured ? "display-strong-xs" : "heading-strong-l"}
            wrap="balance"
          >
            {post.metadata.title}
          </Heading>
          <Text
            wrap="pretty"
            variant={featured ? "body-default-l" : "body-default-s"}
            onBackground="neutral-weak"
          >
            {post.metadata.summary}
          </Text>
          {authors && (
            <Row flex={1} vertical="end" paddingTop="12">
              <Row gap="12" vertical="center">
                <AvatarGroup reverse size="xs" avatars={avatars} limit={2} />
                <Text variant="label-default-s" onBackground="neutral-medium">
                  {authors}
                </Text>
              </Row>
            </Row>
          )}
        </Column>
      </Grid>
    </Card>
  );
}
