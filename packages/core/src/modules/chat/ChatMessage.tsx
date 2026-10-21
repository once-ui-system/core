"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef, type ReactNode } from "react";
import { Avatar, type AvatarProps } from "../../components/Avatar";
import { Button } from "../../components/Button";
import { Column } from "../../components/Column";
import { Icon } from "../../components/Icon";
import { Row } from "../../components/Row";
import { Text } from "../../components/Text";
import styles from "./Chat.module.scss";
import { type ChatTime, type ChatTimeFormat, renderChatTime } from "./chatTime";

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
  /** How a `Date` in `time` reads: `"clock"` ("8:51 AM", the default) or
   *  `"relative"` ("now", "2m", "1h", then the date), kept current. */
  timeFormat?: ChatTimeFormat;
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
  /**
   * Where the message sits in a stack: a quick run of messages from one
   * author drawn as one block. `"middle"` and `"end"` are follow-ups, as
   * `grouped`; the bubbles close up and round less where they meet, and only
   * `"end"` shows the time and status. `ChatMessageList` sets it for you
   * with `stack`.
   */
  stack?: "start" | "middle" | "end";
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
const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  (
    {
      children,
      from = "other",
      name,
      avatarProps,
      time,
      timeFormat = "clock",
      status,
      statusLabels,
      onRetry,
      retryLabel = "Retry",
      grouped: groupedProp = false,
      stack,
      variant = "bubble",
      attachments,
      footer,
      actions,
      className,
      ...flex
    },
    ref,
  ) => {
    const self = from === "self";
    const bubble = variant === "bubble";
    const labels = { ...STATUS_LABELS, ...statusLabels };
    const failed = status === "failed";
    const grouped = groupedProp || stack === "middle" || stack === "end";
    // Inside a stack the time and status show once, under its last message.
    // A failed send still shows, on whichever message failed.
    const showMeta = !stack || stack === "end" || failed;

    // A plain row reads like a team chat: the time sits next to the name.
    const timeInHeader = !bubble && name != null && !grouped;
    const timeText = time != null && (
      <Text variant="body-default-xs" onBackground="neutral-weak">
        {renderChatTime(time, false, timeFormat)}
      </Text>
    );
    const showTime = time != null && !timeInHeader;

    const meta = showMeta && (showTime || status) && (
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
              variant="body-default-xs"
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
        data-stack={stack}
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
              <Text variant="label-strong-s" onBackground="neutral-strong">
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
  },
);

ChatMessage.displayName = "ChatMessage";

export { ChatMessage };
