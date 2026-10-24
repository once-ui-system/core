"use client";

import { useState } from "react";
import { Button, Column, Grid, Heading, IconButton, Row, Text } from "@once-ui-system/core";
import { PostsClient } from "./components";
import { Newsletter } from "../components";
import { social } from "@/resources";
import { landingCopy } from "@/content";
import type { BlogPost } from "@/utils/utils";

/** The newest post leads; six more sit above the newsletter, the rest below in rows of three. */
const ABOVE_FOLD = 7;
const PAGE = 3;

export function BlogClient({ totalPosts, posts }: { totalPosts: number; posts: BlogPost[] }) {
  const [postsToShow, setPostsToShow] = useState(ABOVE_FOLD + PAGE);

  const handleShowMore = () => {
    setPostsToShow((prev) => Math.min(prev + PAGE, totalPosts));
  };

  return (
    <Column fillWidth maxWidth="l" horizontal="center" paddingX="l" gap="48" s={{ paddingX: "16" }}>
      <Row
        fillWidth
        horizontal="between"
        vertical="end"
        gap="24"
        paddingTop="32"
        s={{ direction: "column", vertical: "start" }}
      >
        <Column gap="12" maxWidth="s">
          <Heading as="h1" variant="display-strong-s">
            {landingCopy.blogIntro.title}
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            {landingCopy.blogIntro.description}
          </Text>
        </Column>
        <Row gap="8">
          {social.map((item) => (
            <IconButton
              key={item.name}
              href={item.link}
              icon={item.icon}
              size="m"
              variant="secondary"
              tooltip={item.name}
            />
          ))}
        </Row>
      </Row>
      <Column fillWidth gap="16">
        <PostsClient posts={posts} range={[1, 1]} featured />
        <Grid fillWidth columns={3} m={{ columns: 2 }} s={{ columns: 1 }} gap="16">
          <PostsClient posts={posts} range={[2, Math.min(ABOVE_FOLD, totalPosts)]} />
        </Grid>
      </Column>
      <Newsletter />
      {totalPosts > ABOVE_FOLD && (
        <Grid fillWidth columns={3} m={{ columns: 2 }} s={{ columns: 1 }} gap="16">
          <PostsClient posts={posts} range={[ABOVE_FOLD + 1, Math.min(postsToShow, totalPosts)]} />
        </Grid>
      )}
      {postsToShow < totalPosts && (
        <Row fillWidth horizontal="center">
          <Button variant="secondary" onClick={handleShowMore}>
            Show more
          </Button>
        </Row>
      )}
    </Column>
  );
}
