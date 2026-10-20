import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";
import { Avatar, type AvatarProps } from "./Avatar";
import { Column, Row } from "./Flex";
import { Skeleton } from "./Skeleton";
import { Tag, type TagProps } from "./Tag";
import { Text } from "./Text";

export interface UserProps {
  name?: string;
  /** Rendered between the avatar and the name. */
  children?: ReactNode;
  subline?: ReactNode;
  /** A tag after the name, shown when it has a `label`. */
  tagProps?: TagProps;
  loading?: boolean;
  avatarProps?: AvatarProps;
  style?: ViewStyle;
}

/** Core's `User`: an avatar with a name, an optional tag and a subline, as in a list of people. */
export function User({
  name,
  children,
  subline,
  tagProps = {},
  loading = false,
  avatarProps = {},
  style,
}: UserProps) {
  return (
    <Row vertical="center" gap="8" style={style}>
      <Avatar size="m" loading={loading} {...avatarProps} />
      {children}
      {name && (
        <Column paddingLeft="4" paddingRight="12" style={{ flexShrink: 1 }}>
          {loading ? (
            <Row minWidth="6rem" paddingY="4">
              <Skeleton width="100%" size="m" shape="line" />
            </Row>
          ) : (
            <Row gap="8" vertical="center">
              <Text
                textVariant="label-default-m"
                onBackground="neutral-strong"
                truncate
                style={{ flexShrink: 1 }}
              >
                {name}
              </Text>
              {tagProps.label && <Tag size="s" {...tagProps} />}
            </Row>
          )}
          {loading ? (
            <Row paddingY="2">
              <Skeleton width="75%" size="xs" shape="line" />
            </Row>
          ) : (
            subline && (
              <Text textVariant="body-default-xs" onBackground="neutral-weak" truncate>
                {subline}
              </Text>
            )
          )}
        </Column>
      )}
    </Row>
  );
}
