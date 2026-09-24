"use client";

import {
  Avatar,
  AvatarGroup,
  Card,
  Column,
  CountFx,
  Icon,
  InfiniteScroll,
  Line,
  Row,
  SegmentedControl,
  SmartLink,
  Tag,
  Text,
  ToggleButton,
} from "@once-ui-system/core";
import { useCallback, useState } from "react";
import { Footer1 } from "./Footer1";
import { posts } from "./forum1content";
import { Header1 } from "./Header1";

export const Forum1 = () => {
  const pageSize = 6;
  const [items, setItems] = useState(posts.slice(0, pageSize));
  const [cursor, setCursor] = useState(pageSize);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading) return true; // prevent concurrent loads
    setLoading(true);

    // Simulate async fetch; replace with real API when available
    await new Promise((r) => setTimeout(r, 400));
    const next = posts.slice(cursor, cursor + pageSize);
    setItems((prev) => [...prev, ...next]);
    const newCursor = cursor + next.length;
    setCursor(newCursor);
    setLoading(false);
    return newCursor < posts.length; // indicate if more items remain
  }, [cursor, loading]);

  return (
    <Column fillWidth style={{ minHeight: "100%" }} horizontal="center">
      <Row fillWidth borderBottom horizontal="center">
        <Header1 borderBottom="transparent" maxWidth="l" />
      </Row>
      <Row maxWidth="l" style={{ minHeight: "100%" }}>
        <Column maxWidth={16} style={{ minHeight: "100%" }} borderRight>
          <Column fillWidth padding="16" gap="12">
            <Text onBackground="neutral-weak" marginLeft="12" variant="label-default-s">
              Home
            </Text>
            <Column fillWidth gap="4">
              <ToggleButton fillWidth horizontal="start">
                <Row vertical="center" gap="12">
                  <Icon size="xs" name="flag" onBackground="neutral-weak" />
                  Leaderboard
                </Row>
              </ToggleButton>
              <ToggleButton fillWidth horizontal="start">
                <Row vertical="center" gap="12">
                  <Icon size="xs" name="viewColumns" onBackground="neutral-weak" />
                  Categories
                </Row>
              </ToggleButton>
              <ToggleButton fillWidth horizontal="start">
                <Row vertical="center" gap="12">
                  <Icon size="xs" name="book" onBackground="neutral-weak" />
                  Rules
                </Row>
              </ToggleButton>
            </Column>
          </Column>
          <Column fillWidth padding="16" gap="12">
            <Text onBackground="neutral-weak" marginLeft="12" variant="label-default-s">
              Community
            </Text>
            <Column fillWidth gap="4">
              <ToggleButton fillWidth horizontal="start" selected>
                <Row vertical="center" gap="12">
                  <Row center minWidth="16" minHeight="16">
                    <Line background="neutral-alpha-strong" />
                  </Row>
                  Discover
                </Row>
              </ToggleButton>
              <ToggleButton fillWidth horizontal="start">
                <Row vertical="center" gap="12">
                  <Row center minWidth="16" minHeight="16">
                    <Line background="neutral-alpha-strong" />
                  </Row>
                  Announcements
                </Row>
              </ToggleButton>
              <ToggleButton fillWidth horizontal="start">
                <Row vertical="center" gap="12">
                  <Row center minWidth="16" minHeight="16">
                    <Line background="neutral-alpha-strong" />
                  </Row>
                  Showcase
                </Row>
              </ToggleButton>
              <ToggleButton fillWidth horizontal="start">
                <Row vertical="center" gap="12">
                  <Row center minWidth="16" minHeight="16">
                    <Line background="neutral-alpha-strong" />
                  </Row>
                  Discussions
                </Row>
              </ToggleButton>
              <ToggleButton fillWidth horizontal="start">
                <Row vertical="center" gap="12">
                  <Row center minWidth="16" minHeight="16">
                    <Line background="neutral-alpha-strong" />
                  </Row>
                  Feature Requests
                </Row>
              </ToggleButton>
              <ToggleButton fillWidth horizontal="start">
                <Row vertical="center" gap="12">
                  <Row center minWidth="16" minHeight="16">
                    <Line background="neutral-alpha-strong" />
                  </Row>
                  Help & Feedback
                </Row>
              </ToggleButton>
            </Column>
          </Column>
        </Column>
        <Column fillWidth paddingX="l" paddingY="24" gap="8">
          <Row fillWidth horizontal="between" vertical="center" paddingBottom="8">
            <Text variant="label-default-s">Once UI Forum</Text>
            <SegmentedControl
              fitWidth
              buttons={[
                { label: "Hot", value: "hot" },
                { label: "New", value: "new" },
              ]}
              onChange={() => {}}
            />
          </Row>
          <InfiniteScroll
            items={items}
            loading={loading}
            loadMore={loadMore}
            threshold={200}
            renderItem={(post, index) => (
              <Card
                key={index}
                fillWidth
                gap="20"
                paddingY="8"
                paddingRight="16"
                paddingLeft="12"
                radius="m"
                vertical="center"
                border
              >
                <Row fillWidth vertical="center" gap="12">
                  <Avatar src={post.author.avatar} />
                  <Column fillWidth gap="2">
                    <Row vertical="center" gap="8">
                      <Text variant="body-default-s">{post.title}</Text>
                      <Tag size="s" data-scaling="90">
                        {post.tag}
                      </Tag>
                    </Row>
                    <SmartLink href="#">
                      <Text variant="label-strong-s">@{post.author.name}</Text>
                    </SmartLink>
                  </Column>
                </Row>
                {post.participants.length > 1 && (
                  <AvatarGroup s={{ hide: true }} reverse size="s" avatars={post.participants} />
                )}
                <Column gap="4" horizontal="end" minWidth={8}>
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {post.date}
                  </Text>
                  <Row gap="16" data-scaling="90">
                    <Row vertical="center" gap="4">
                      <Icon size="xs" name="chat" onBackground="neutral-weak" />
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {post.comments}
                      </Text>
                    </Row>
                    <Row vertical="center" gap="4">
                      <Icon size="xs" name="eye" onBackground="neutral-weak" />
                      <CountFx
                        variant="body-default-xs"
                        onBackground="neutral-weak"
                        separator=","
                        value={post.views}
                      />
                    </Row>
                  </Row>
                </Column>
              </Card>
            )}
          />
        </Column>
      </Row>
      <Footer1 borderTop />
    </Column>
  );
};
