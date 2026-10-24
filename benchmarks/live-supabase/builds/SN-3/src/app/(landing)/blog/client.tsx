"use client";

import { Column, Grid, Heading, Text } from "@once-ui-system/core";
import { PostsClient } from "./components";
import type { BlogPost } from "@/utils/utils";

export function BlogClient({ posts }: { totalPosts?: number; posts: BlogPost[] }) {
  return (
    <Column fillWidth maxWidth="l" horizontal="center" paddingX="l" gap="48" s={{ paddingX: "16" }}>
      <Column fillWidth gap="12" maxWidth="s" paddingTop="32">
        <Heading as="h1" variant="display-strong-s">
          Blog
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
          News and updates from the Acme Notes team.
        </Text>
      </Column>
      <Grid fillWidth columns={2} s={{ columns: 1 }} gap="16">
        <PostsClient posts={posts} />
      </Grid>
    </Column>
  );
}
