import { getPosts } from "@/utils/utils";
import { Column, Heading, Row, ScrollContainer } from "@once-ui-system/core";
import { Post } from "../blog/components/Post";

/** How many of the newest posts the homepage carousel runs through. */
const COUNT = 8;

/*
 * One tile per post. The carousel steps a tile at a time, so each item has to
 * be a single card: the run used to be ten copies of the same five-post strip,
 * which made every press of Next move 2,300 px onto an identical strip — the
 * track moved and nothing on screen changed.
 */
export const Blog = async ({ ...flex }: React.ComponentProps<typeof Column>) => {
  const posts = (await getPosts(["src", "content", "blog"]))
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
    )
    .slice(0, COUNT);

  return (
    <Row fillWidth borderY horizontal="center" overflow="hidden">
      <Column gap="20" horizontal="center" {...flex}>
        <Heading as="h2" marginLeft="l" variant="heading-strong-s">
          From the blog
        </Heading>
        <Row fillWidth maxWidth="xl">
          <ScrollContainer
            proximity={0.05}
            items={posts.map((post) => (
              <Post
                key={post.slug}
                post={post}
                thumbnail
                direction="column"
                width={28}
                fillHeight
              />
            ))}
          />
        </Row>
      </Column>
    </Row>
  );
};
