"use client";

import {
  Avatar,
  Card,
  Column,
  Icon,
  Line,
  Media,
  OgCard,
  Row,
  Swiper,
  Text,
} from "@once-ui-system/core";

type FeedPost = {
  id: string;
  title: string;
  time: string;
  author: {
    name: string;
    avatar?: string;
  };
  space: string;
  attachment?: {
    type: "carousel" | "youtube" | "link";
    url?: string;
    urls?: string[];
  };
  likes: number;
  comments: number;
  views: number;
};

const posts: FeedPost[] = [
  {
    id: "1",
    title: "Flex is confusing... We solved it.",
    time: "1d",
    author: { name: "lorant-one", avatar: "/images/creators/lorant.jpg" },
    space: "once-ui",
    attachment: {
      type: "carousel",
      urls: [
        "/images/products/social-flex-01.jpg",
        "/images/products/social-flex-02.jpg",
        "/images/products/social-flex-03.jpg",
        "/images/products/social-flex-04.jpg",
      ],
    },
    likes: 892,
    comments: 156,
    views: 8.9,
  },
  {
    id: "2",
    title: "The open-source design system for indie builders",
    time: "3d",
    author: { name: "once-ui", avatar: "/trademarks/icon-dark.svg" },
    space: "once-ui",
    attachment: {
      type: "link",
      url: "https://blog.once-ui.com/once-ui/open-source",
    },
    likes: 445,
    comments: 67,
    views: 5.2,
  },
  {
    id: "3",
    title: "Build something people want to share",
    time: "5h",
    author: { name: "lorant-one", avatar: "/images/creators/lorant.jpg" },
    space: "learn",
    attachment: {
      type: "youtube",
      url: "https://www.youtube.com/watch?v=PgOSMTAvnSo",
    },
    likes: 567,
    comments: 89,
    views: 12.5,
  },
];

function PostCard({ post }: { post: FeedPost }) {
  return (
    <Card fillWidth border radius="l" paddingY="16" background="surface">
      <Column fillWidth gap="2">
        <Row fillWidth gap="12" vertical="center" paddingBottom="16" paddingX="20">
          <Row fillWidth vertical="center" wrap gap="8">
            <Row gap="8" vertical="center">
              <Avatar size={1.5} src={post.author.avatar} />
              <Text variant="label-default-s">{post.author.name}</Text>
            </Row>
            <Text variant="label-default-s" onBackground="neutral-weak">
              s/{post.space}
            </Text>
            <Row vertical="center" gap="8">
              <Row minWidth="4" minHeight="4" radius="full" solid="neutral-medium" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                {post.time}
              </Text>
            </Row>
          </Row>
        </Row>

        <Row fillWidth paddingBottom="16" paddingX="20">
          <Text variant="heading-strong-m">{post.title}</Text>
        </Row>

        {post.attachment && (
          <Row fillWidth paddingX="4">
            {post.attachment.type === "carousel" && post.attachment.urls && (
              <Swiper
                radius="l"
                maxWidth={40}
                aspectRatio="3/4"
                controls="contained"
                items={post.attachment.urls.map((imageUrl, index) => ({
                  slide: (
                    <Media
                      key={imageUrl}
                      fillWidth
                      src={imageUrl}
                      sizes="(max-width: 768px) 100vw, 800px"
                      priority={index === 0}
                    />
                  ),
                }))}
              />
            )}
            {post.attachment.type === "youtube" && post.attachment.url && (
              <Media radius="l" border fillWidth aspectRatio="16/9" src={post.attachment.url} />
            )}
            {post.attachment.type === "link" && post.attachment.url && (
              <Row fillWidth horizontal="center">
                <Row maxWidth={40} paddingLeft="8">
                  <OgCard
                    url={post.attachment.url}
                    description={false}
                    background="neutral-medium"
                    sizes="(max-width: 768px) 100vw, 640px"
                  />
                </Row>
              </Row>
            )}
          </Row>
        )}

        <Row gap="16" vertical="center" fillWidth paddingTop="12" paddingX="20">
          <Row vertical="center" gap="8">
            <Text variant="label-default-s">⚡🔥🚀</Text>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {post.likes}
            </Text>
          </Row>
          <Line minHeight="20" vert />
          <Row gap="16">
            <Row vertical="center" gap="8">
              <Icon size="xs" name="chat" onBackground="neutral-weak" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                {post.comments}
              </Text>
            </Row>
            <Line minHeight="20" vert />
            <Row vertical="center" gap="8">
              <Icon size="xs" name="eye" onBackground="neutral-weak" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                {post.views}k
              </Text>
            </Row>
          </Row>
        </Row>
      </Column>
    </Card>
  );
}

export const Feed4 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth horizontal="center" padding="16" gap="16" {...flex}>
      <Column maxWidth="s" fillWidth gap="16">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </Column>
    </Column>
  );
};
