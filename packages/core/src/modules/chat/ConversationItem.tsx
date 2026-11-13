"use client";

import classNames from "clsx";
import type React from "react";
import type { ReactNode } from "react";
import { Avatar, type AvatarProps } from "../../components/Avatar.js";
import { Column } from "../../components/Column.js";
import { ElementType } from "../../components/ElementType.js";
import { Row } from "../../components/Row.js";
import { Text } from "../../components/Text.js";
import { VisuallyHidden } from "../../components/VisuallyHidden.js";
import styles from "./Chat.module.scss";
import { type ChatTime, renderChatTime } from "./chatTime.js";

export interface ConversationItemProps
  extends Omit<React.ComponentProps<typeof Row>, "onClick" | "children" | "ref"> {
  /** Who the conversation is with, or its title. */
  name: ReactNode;
  /** The last message, cut to one line. */
  preview?: ReactNode;
  /** When the last message was sent. A `Date` shows the time today, the
   *  weekday this week, and the date before that. */
  time?: ChatTime;
  avatarProps?: AvatarProps;
  /** Unread messages: a number shows a count, `true` a dot. */
  unread?: number | boolean;
  /** What a screen reader hears for the unread count. */
  unreadLabel?: (count: number | true) => string;
  /** The open conversation. Marked with `aria-current`. */
  selected?: boolean;
  /** Shows "typing…" in place of the preview. */
  typing?: boolean;
  typingLabel?: ReactNode;
  /** Opens the conversation as a link. */
  href?: string;
  /** Opens the conversation as a button. */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /** The link or button. */
  ref?: React.Ref<HTMLElement>;
}

const defaultUnreadLabel = (count: number | true) =>
  count === true ? "Unread" : `${count} unread ${count === 1 ? "message" : "messages"}`;

/**
 * One row of an inbox: the avatar, the name, the last message and its time,
 * and an unread count. It is a link with `href`, a button with `onClick`.
 */
const ConversationItem = ({
  ref,
  name,
  preview,
  time,
  avatarProps,
  unread,
  unreadLabel = defaultUnreadLabel,
  selected = false,
  typing = false,
  typingLabel = "typing…",
  href,
  onClick,
  className,
  ...flex
}: ConversationItemProps) => {
  const count = typeof unread === "number" ? unread : unread ? 1 : 0;
  const hasUnread = count > 0;

  return (
    <ElementType
      ref={ref}
      href={href}
      onClick={onClick}
      type={href ? undefined : "button"}
      aria-current={selected ? (href ? "page" : "true") : undefined}
      className={classNames(
        styles.conversation,
        selected && styles.selected,
        "radius-l",
        className,
      )}
    >
      <Row fillWidth gap="12" vertical="center" paddingX="12" paddingY="8" {...flex}>
        {avatarProps && <Avatar size="m" aria-hidden="true" {...avatarProps} />}
        <Column fillWidth gap="2" className={styles.conversationText}>
          <Row fillWidth gap="8" vertical="center" horizontal="between">
            <Text
              textVariant={hasUnread ? "label-strong-s" : "label-default-s"}
              onBackground="neutral-strong"
              truncate
            >
              {name}
            </Text>
            {time != null && (
              <Text
                textVariant="body-default-xs"
                onBackground={hasUnread ? "brand-medium" : "neutral-weak"}
                wrap="nowrap"
              >
                {renderChatTime(time, true)}
              </Text>
            )}
          </Row>
          <Row fillWidth gap="8" vertical="center" horizontal="between">
            <Text
              textVariant="body-default-s"
              onBackground={typing ? "brand-medium" : hasUnread ? "neutral-strong" : "neutral-weak"}
              truncate
            >
              {typing ? typingLabel : preview}
            </Text>
            {hasUnread && (
              <Row
                center
                radius="full"
                solid="brand-strong"
                className={classNames(styles.unread, unread === true && styles.unreadDot)}
              >
                {typeof unread === "number" && (
                  <Text textVariant="label-strong-xs" onSolid="brand-strong" aria-hidden="true">
                    {unread > 99 ? "99+" : unread}
                  </Text>
                )}
                <VisuallyHidden>{unreadLabel(unread === true ? true : count)}</VisuallyHidden>
              </Row>
            )}
          </Row>
        </Column>
      </Row>
    </ElementType>
  );
};

ConversationItem.displayName = "ConversationItem";

export { ConversationItem };
