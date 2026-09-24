"use client";

import {
  AvatarGroup,
  Button,
  Column,
  Heading,
  Icon,
  Input,
  Line,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

const topics = ["Product updates", "Design systems", "Engineering", "Community"];

const issues = [
  { title: "Shipping faster with design tokens", date: "Jul 9" },
  { title: "Behind the scenes: our new theming engine", date: "Jun 25" },
  { title: "How we run design reviews", date: "Jun 11" },
];

export const Newsletter5: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["Product updates"]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((item) => item !== topic) : [...prev, topic],
    );
  };

  return (
    <Row fillWidth radius="xl" border overflow="hidden" m={{ direction: "column" }} {...flex}>
      <Column fill minWidth={24} padding="40" gap="20">
        <Column gap="8">
          <Heading variant="display-strong-xs">Once UI Digest</Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            Pick the topics you care about and get a short, no-fluff email whenever we ship
            something worth reading.
          </Text>
        </Column>

        <Row wrap gap="8">
          {topics.map((topic) => {
            const selected = selectedTopics.includes(topic);
            return (
              <Tag
                key={topic}
                onClick={() => toggleTopic(topic)}
                cursor="interactive"
                scheme={selected ? "brand" : "neutral"}
                prefixIcon={selected ? "check" : undefined}
              >
                {topic}
              </Tag>
            );
          })}
        </Row>

        {subscribed ? (
          <Row
            gap="8"
            vertical="center"
            paddingY="12"
            textVariant="label-default-m"
            onBackground="brand-medium"
          >
            <Icon name="check" size="s" />
            You're subscribed to {selectedTopics.length || 0} topic
            {selectedTopics.length === 1 ? "" : "s"}
          </Row>
        ) : (
          <Row maxWidth={22}>
            <Input
              id="digest-email"
              placeholder="Email"
              type="email"
              size="s"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              suffix={
                <Button
                  size="s"
                  style={{ marginRight: "-0.325rem" }}
                  onClick={() => email && setSubscribed(true)}
                >
                  Subscribe
                </Button>
              }
            />
          </Row>
        )}

        <Row gap="12" vertical="center">
          <AvatarGroup
            size="s"
            reverse
            avatars={[
              { src: "/images/creators/lorant.jpg" },
              { src: "/images/creators/justin.jpg" },
              { src: "/images/creators/suhaib.jpg" },
            ]}
          />
          <Text variant="body-default-s" onBackground="neutral-weak">
            Joined by 5,200+ designers and engineers
          </Text>
        </Row>
      </Column>

      <Line vert background="neutral-alpha-weak" s={{ hide: true }} />

      <Column fill minWidth={20} background="surface" padding="32" gap="16" s={{ hide: true }}>
        <Text variant="label-default-s" onBackground="neutral-weak">
          Latest issues
        </Text>
        <Column fillWidth gap="4">
          {issues.map((issue) => (
            <Row
              key={issue.title}
              fillWidth
              horizontal="between"
              vertical="center"
              paddingY="12"
              borderTop
              cursor="interactive"
            >
              <Column gap="2" fillWidth>
                <Text variant="label-default-s" truncate>
                  {issue.title}
                </Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {issue.date}
                </Text>
              </Column>
              <Icon name="arrowUpRight" size="xs" onBackground="neutral-weak" />
            </Row>
          ))}
        </Column>
      </Column>
    </Row>
  );
};
