"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import { Avatar, type AvatarProps } from "./Avatar";
import { Column } from "./Column";
import { Flex, type FlexComponentProps } from "./Flex";
import { Skeleton } from "./Skeleton";
import { Tag, type TagProps } from "./Tag";
import { Text } from "./Text";

export const userVariants = cva("");

export interface UserProps extends Omit<FlexComponentProps, "children"> {
  name?: string;
  children?: ReactNode;
  subline?: ReactNode;
  tag?: string;
  tagProps?: TagProps;
  loading?: boolean;
  avatarProps?: AvatarProps;
  className?: string;
  style?: CSSProperties;
}

const User = forwardRef<HTMLDivElement, UserProps>(
  (
    {
      name,
      children,
      subline,
      tag,
      tagProps = {},
      loading = false,
      avatarProps = {},
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const { src, value, empty, ...restAvatarProps } = avatarProps;
    const isEmpty = empty || (!src && !value);
    const resolvedTagProps = tag && !tagProps.label ? { label: tag, ...tagProps } : tagProps;

    return (
      <Flex
        ref={ref}
        vertical="center"
        gap="8"
        className={cn(userVariants(), className)}
        style={style}
        {...rest}
      >
        <Avatar
          size="m"
          src={src}
          value={value}
          empty={isEmpty}
          loading={loading}
          {...restAvatarProps}
        />
        {children}
        {name && (
          <Column paddingLeft="4" paddingRight="12">
            {loading ? (
              <Flex minWidth={6} paddingY="4">
                <Skeleton width="xl" height="m" shape="line" aria-label="Loading name" />
              </Flex>
            ) : (
              <Flex gap="8" vertical="center">
                <Text variant="label-default-m" onBackground="neutral-strong">
                  {name}
                </Text>
                {resolvedTagProps.label && (
                  <Tag size="s" {...resolvedTagProps}>
                    {resolvedTagProps.label}
                  </Tag>
                )}
              </Flex>
            )}
            {loading ? (
              <Flex paddingY="2">
                <Skeleton width="l" height="xs" shape="line" aria-label="Loading subline" />
              </Flex>
            ) : (
              <Text wrap="nowrap" variant="body-default-xs" onBackground="neutral-weak">
                {subline}
              </Text>
            )}
          </Column>
        )}
      </Flex>
    );
  },
);

User.displayName = "User";

export { User };
