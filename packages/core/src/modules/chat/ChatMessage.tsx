"use client";

import classNames from "clsx";
import type React from "react";
import type { ReactNode } from "react";
import { Avatar, type AvatarProps } from "../../components/Avatar.js";
import { Button } from "../../components/Button.js";
import { Column } from "../../components/Column.js";
import { Icon } from "../../components/Icon.js";
import { Row } from "../../components/Row.js";
import { Text } from "../../components/Text.js";
import styles from "./Chat.module.scss";
import { type ChatTime, renderChatTime } from "./chatTime.js";

export type ChatMessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

const STATUS_LABELS: Record<ChatMessageStatus, string> = {
  sending: "Sending…",
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
  failed: "Not sent",
};

export interface ChatMessageProps extends Omit<React.ComponentProps<typeof Row>, "children"> {
  /** The message body: text, or any content such as a `Media` or `OgCard`. */
  children?: ReactNode;
  /** `"self"` sits on the right with the brand tint; `"other"` (the default) on the left. */
  from?: "self" | "other";
  /** The author's name, shown above the bubble. */
  name?: ReactNode;
  /** The author's avatar. Leave it out for no avatar column at all. */
  avatarProps?: AvatarProps;
  /** When it was sent. A `Date` is formatted and rendered as `<time>`. */
  time?: ChatTime;
  /** Delivery state, shown next to the time. */
  status?: ChatMessageStatus;
  /** Replaces the status words, for another language. */
  statusLabels?: Partial<Record<ChatMessageStatus, string>>;
  /** With `status="failed"`, adds a retry button. */
  onRetry?: () => void;
  /** The label of the retry button. */
  retryLabel?: string;
  /**
   * A follow-up from the same author: the name is dropped and the avatar
   * keeps its space but is not drawn, so the bubbles line up.
   */
  grouped?: boolean;
  /** `"bubble"` draws a tinted bubble; `"plain"` is a flat row, like a team chat. */
  variant?: "bubble" | "plain";
  /** Content under the bubble: images, files, link previews. */
  attachments?: ReactNode;
  /** A row under the attachments, such as reactions. */
  footer?: ReactNode;
  /** Controls that appear while the message is hovered or has focus, such as reply or copy. */
  actions?: ReactNode;
}

/**
 * One message in a conversation: the bubble, its author, time and delivery
 * state. Put a run of them in a `ChatMessageList`.
 */
const ChatMessage = ({
  ref,
  children,
  from = "other",
  name,
  avatarProps,
  time,
  status,
  statusLabels,
  onRetry,
  retryLabel = "Retry",
  grouped = false,
  variant = "bubble",
  attachments,
  footer,
  actions,
  className,
  ...flex
}: ChatMessageProps) => {
  const self = from === "self";
  const bubble = variant === "bubble";
  const labels = { ...STATUS_LABELS, ...statusLabels };
  const failed = status === "failed";

  // A plain row reads like a team chat: the time sits next to the name.
  const timeInHeader = !bubble && name != null && !grouped;
  const timeText = time != null && (
    <Text textVariant="body-default-xs" onBackground="neutral-weak">
      {renderChatTime(time)}
    </Text>
  );
  const showTime = time != null && !timeInHeader;

  const meta = (showTime || status) && (
    <Row gap="4" vertical="center" wrap>
      {showTime && timeText}
      {status && (
        <Row gap="4" vertical="center" data-status={status}>
          {(status === "delivered" || status === "read" || status === "sent") && (
            <Icon
              name="check"
              size="xs"
              onBackground={status === "read" ? "brand-medium" : "neutral-weak"}
            />
          )}
          {failed && <Icon name="danger" size="xs" onBackground="danger-medium" />}
          <Text
            textVariant="body-default-xs"
            onBackground={failed ? "danger-medium" : "neutral-weak"}
            role={failed ? "alert" : undefined}
          >
            {labels[status]}
          </Text>
          {failed && onRetry && (
            <Button size="s" variant="tertiary" onClick={onRetry}>
              {retryLabel}
            </Button>
          )}
        </Row>
      )}
    </Row>
  );

  return (
    <Row
      ref={ref}
      fillWidth
      gap="12"
      vertical="start"
      direction={self && bubble ? "row-reverse" : "row"}
      data-from={from}
      className={classNames(styles.message, className)}
      {...flex}
    >
      {avatarProps && (
        <Avatar
          size="m"
          // The name next to it already says who wrote this, so by default the
          // avatar is decorative; an `aria-label` in avatarProps makes it an image.
          aria-hidden={grouped || !avatarProps["aria-label"] || undefined}
          {...avatarProps}
          className={classNames(grouped && styles.hidden, avatarProps.className)}
        />
      )}
      <Column
        gap="4"
        horizontal={self && bubble ? "end" : "start"}
        className={classNames(styles.body, bubble && styles.bubbleBody)}
      >
        {name && !grouped && (
          <Row gap="8" vertical="center" wrap>
            <Text textVariant="label-strong-s" onBackground="neutral-strong">
              {name}
            </Text>
            {timeInHeader && timeText}
          </Row>
        )}
        {children != null && (
          <Column
            paddingX={bubble ? "12" : undefined}
            paddingY={bubble ? "8" : undefined}
            radius={bubble ? "l" : undefined}
            background={bubble ? (self ? "brand-alpha-weak" : "neutral-alpha-weak") : undefined}
            border={bubble ? (self ? "brand-alpha-weak" : "neutral-alpha-weak") : undefined}
            textVariant="body-default-s"
            onBackground="neutral-strong"
            className={styles.bubble}
          >
            {children}
          </Column>
        )}
        {attachments}
        {footer}
        {meta}
      </Column>
      {actions && (
        <Row gap="4" vertical="center" className={styles.actions}>
          {actions}
        </Row>
      )}
    </Row>
  );
};

ChatMessage.displayName = "ChatMessage";

export { ChatMessage };
