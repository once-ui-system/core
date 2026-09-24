"use client";

import {
  Avatar,
  Button,
  Column,
  CountFx,
  Icon,
  IconButton,
  Media,
  Row,
  Scroller,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";
import { Comments } from ".";

interface MediaPostProps {
  user: {
    avatar?: string;
    name: string;
  };
  media?: string[];
  content?: string;
  aspectRatio?: "16/9" | "1/1" | "3/4";
}

export const MediaPost1 = ({ user, media, content, aspectRatio = "16/9" }: MediaPostProps) => {
  const [reactionCount, setReactionCount] = useState(0);
  const [hasReacted, setHasReacted] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [hasShared, setHasShared] = useState(false);

  const toggleReaction = (e: React.MouseEvent) => {
    e.preventDefault();
    setHasReacted(!hasReacted);
    setReactionCount(reactionCount + (!hasReacted ? 1 : -1));
  };

  const toggleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    setHasShared(!hasShared);
    setShareCount(shareCount + (!hasShared ? 1 : -1));
  };

  return (
    <Column fillWidth borderTop>
      <Row fillWidth vertical="center" gap="12" paddingY="16" paddingX="24">
        <Avatar src={user.avatar} />
        <Text variant="label-default-s">{user.name}</Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          12h ago
        </Text>
      </Row>
      <Column fillWidth paddingX="8" gap="8">
        {content && (
          <Row textVariant="body-default-m" paddingX="16" paddingBottom="8">
            {content}
          </Row>
        )}
        {media && media?.length > 1 ? (
          <Scroller fadeColor="surface">
            <Row fitWidth gap="8">
              {media.map((item, index) => (
                <Media
                  key={index}
                  src={item}
                  radius="l"
                  border
                  minWidth={28}
                  maxWidth={28}
                  aspectRatio={aspectRatio}
                  sizes="(max-width: 768px) 100vw, 560px"
                />
              ))}
            </Row>
          </Scroller>
        ) : (
          media && (
            <Media
              src={media[0]}
              radius="l"
              border
              aspectRatio={aspectRatio}
              sizes="(max-width: 768px) 100vw, 768px"
            />
          )
        )}
      </Column>
      <Row fillWidth horizontal="between" paddingX="24" paddingTop="16" data-border="rounded">
        <Row gap="2">
          <Button variant="tertiary" size="s" onClick={toggleReaction}>
            <CountFx
              marginRight="8"
              effect="smooth"
              value={reactionCount}
              variant="body-default-s"
              style={{
                color: hasReacted
                  ? "var(--danger-solid-strong)"
                  : "var(--neutral-on-background-weak)",
              }}
            />
            <Icon
              size="s"
              style={{ color: hasReacted ? "var(--danger-solid-strong)" : undefined }}
              name={hasReacted ? "heartFilled" : "heart"}
            />
          </Button>
          <Button variant="tertiary" size="s" onClick={toggleShare}>
            <CountFx
              marginRight="8"
              effect="smooth"
              value={shareCount}
              variant="body-default-s"
              onBackground={hasShared ? "neutral-strong" : "neutral-weak"}
            />
            <Icon size="s" name="refresh" />
          </Button>
        </Row>
        <IconButton icon="send" size="m" variant="tertiary" />
      </Row>
      <Comments padding="24" gap="16" showTitle={false} limit={1} />
    </Column>
  );
};
