"use client";

import {
  AvatarGroup,
  Column,
  Icon,
  IconButton,
  Media,
  Row,
  Text,
  User,
} from "@once-ui-system/core";
import { useState } from "react";
import { Comments } from "./Comments";

interface MediaPost2Props extends React.ComponentProps<typeof Row> {
  user: {
    name: string;
    avatar: string;
  };
  media: string;
  content?: string;
}

export const MediaPost2 = ({ user, media, content, ...flex }: MediaPost2Props) => {
  const [isLiked, setIsLiked] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <Row
      fillWidth
      center
      paddingX="16"
      s={{ direction: "column", vertical: "start" }}
      gap="48"
      overflowY="auto"
      {...flex}
    >
      <Row maxWidth={32} aspectRatio="3 / 4" horizontal="center">
        <Media
          sizes="(max-width: 768px) 100vw, (max-width: 768px) 768px"
          border
          radius="l"
          alt="Cityscape at sunset"
          src={media}
        />
      </Row>
      <Column maxWidth={32} maxHeight={64} gap="8" paddingY="l">
        <Row marginBottom="12" horizontal="between" vertical="center">
          <User
            avatarProps={{
              src: user.avatar,
            }}
          >
            <Column gap="4" vertical="center" paddingLeft="8">
              <Row gap="8" vertical="center">
                <Text variant="body-strong-s" onBackground="neutral-strong">
                  {user.name}
                </Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  3h
                </Text>
              </Row>
              <Row textVariant="body-default-xs" onBackground="neutral-weak" gap="8">
                <Icon name="globe" onBackground="neutral-weak" size="xs" />
                Seoul, South Korea
              </Row>
            </Column>
          </User>
          <Row>
            <IconButton
              variant="ghost"
              tooltip={isBookmarked ? "Saved" : "Save"}
              tooltipPosition="top"
              style={{ color: isBookmarked ? "var(--warning-on-background-weak)" : undefined }}
              size="l"
              icon={isBookmarked ? "bookmarkFilled" : "bookmark"}
              onClick={toggleBookmark}
            />
            <IconButton
              variant="ghost"
              tooltip={isLiked ? "Liked" : "Like"}
              tooltipPosition="top"
              style={{ color: isLiked ? "var(--danger-solid-strong)" : undefined }}
              size="l"
              icon={isLiked ? "heartFilled" : "heart"}
              onClick={toggleLike}
            />
          </Row>
        </Row>
        <Column fill gap="16" paddingLeft="32">
          <Row
            marginBottom="8"
            paddingLeft="16"
            fillWidth
            textVariant="body-default-s"
            onBackground="neutral-medium"
          >
            {content}
          </Row>

          <Row gap="16" vertical="center" paddingLeft="16" paddingBottom="24">
            <AvatarGroup
              avatars={[
                { src: "/images/avatars/07.png", size: "xs" },
                { src: "/images/avatars/06.png", size: "xs" },
                { src: "/images/avatars/01.png", size: "xs" },
              ]}
              reverse
            />
            <Text variant="body-default-xs" onBackground="neutral-medium">
              Liked by <Text onBackground="neutral-strong">Milo</Text> and 126 others
            </Text>
          </Row>

          <Comments
            direction="column-reverse"
            fillHeight
            vertical="between"
            paddingLeft="12"
            overflowY="auto"
          />
        </Column>
      </Column>
    </Row>
  );
};
