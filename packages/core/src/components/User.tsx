import classNames from "clsx";
import type React from "react";
import type { Placement } from "../types.js";
import { Avatar, type AvatarProps } from "./Avatar.js";
import { Column } from "./Column.js";
import { Dropdown, type DropdownProps } from "./Dropdown.js";
import { Flex } from "./Flex.js";
import { Skeleton } from "./Skeleton.js";
import { Tag, type TagProps } from "./Tag.js";
import { Text } from "./Text.js";
import styles from "./User.module.scss";

interface UserProps {
  name?: string;
  children?: React.ReactNode;
  subline?: React.ReactNode;
  tag?: string;
  tagProps?: TagProps;
  loading?: boolean;
  avatarProps?: AvatarProps;
  className?: string;
  /**
   * A menu the user opens from their avatar and name: the user becomes the
   * trigger of a Dropdown with this content (2.x `UserMenu`).
   */
  dropdown?: React.ReactNode;
  /** With `dropdown`: draw the trigger as selected. */
  selected?: boolean;
  /** With `dropdown`: where the menu opens. */
  placement?: Placement;
  /** With `dropdown`: the menu's minimum width (a number is px). */
  minWidth?: DropdownProps["minWidth"];
  /** With `dropdown`: the menu's maximum width (a number is px). */
  maxWidth?: DropdownProps["maxWidth"];
  /** With `dropdown`: the menu's minimum height in px. */
  minHeight?: DropdownProps["minHeight"];
  /** With `dropdown`: the trigger's inline style. */
  style?: React.CSSProperties;
}

const UserCard = ({
  ref,
  name,
  children,
  subline,
  tagProps = {},
  loading = false,
  avatarProps = {},
  className,
}: UserProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const { src, value, empty, ...restAvatarProps } = avatarProps;
  const isEmpty = empty || (!src && !value);

  return (
    <Flex ref={ref} vertical="center" gap="8" className={classNames(className)}>
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
            <Flex minWidth="6rem" paddingY="4">
              <Skeleton width="100%" size="m" shape="line" aria-label="Loading name" />
            </Flex>
          ) : (
            <Flex gap="8" vertical="center">
              <Text textVariant="label-default-m" onBackground="neutral-strong">
                {name}
              </Text>
              {tagProps.label && (
                <Tag size="s" {...tagProps}>
                  {tagProps.label}
                </Tag>
              )}
            </Flex>
          )}
          {loading ? (
            <Flex paddingY="2">
              <Skeleton width="75%" size="xs" shape="line" aria-label="Loading subline" />
            </Flex>
          ) : (
            <Text wrap="nowrap" textVariant="body-default-xs" onBackground="neutral-weak">
              {subline}
            </Text>
          )}
        </Column>
      )}
    </Flex>
  );
};

UserCard.displayName = "UserCard";

/**
 * An avatar with a name, a subline and an optional tag. With `dropdown` it is
 * the trigger of a menu (an account menu in a header).
 */
const User = ({
  ref,
  dropdown,
  selected = false,
  placement,
  minWidth,
  maxWidth,
  minHeight,
  className,
  style,
  loading,
  ...userProps
}: UserProps & { ref?: React.Ref<HTMLDivElement> }) => {
  if (dropdown === undefined) {
    return <UserCard ref={ref} loading={loading} className={className} {...userProps} />;
  }
  return (
    <Dropdown
      ref={ref}
      minWidth={minWidth}
      maxWidth={maxWidth}
      minHeight={minHeight}
      placement={placement}
      disableTriggerClick={loading}
      style={{
        borderRadius: "var(--radius-full)",
      }}
      trigger={
        <Column
          tabIndex={loading ? -1 : 0}
          padding="4"
          radius="full"
          cursor={loading ? "default" : "interactive"}
          border={selected ? "neutral-medium" : "transparent"}
          background={selected ? "neutral-strong" : "transparent"}
          pointerEvents={loading ? "none" : "auto"}
          className={classNames(className || "", selected ? styles.selected : "", styles.wrapper)}
          style={style}
        >
          <UserCard loading={loading} {...userProps} />
        </Column>
      }
    >
      {dropdown}
    </Dropdown>
  );
};

User.displayName = "User";

export type { UserProps };
export { User };
