"use client";

import classNames from "clsx";
import type React from "react";
import { useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { Column } from "../../components/Column.js";
import styles from "./Chat.module.scss";

export interface ChatMessageListProps extends React.ComponentProps<typeof Column> {
  /**
   * Keep the newest message in view: the list starts scrolled to the bottom
   * and follows new content while the reader is at the bottom. Once they
   * scroll up to read history, new messages no longer pull them down.
   */
  stickToBottom?: boolean;
  /** Called when the reader scrolls to the top, to load older messages. */
  onReachStart?: () => void;
  /** The list's accessible name. Defaults to "Messages". */
  "aria-label"?: string;
}

/** How close to an edge, in pixels, still counts as being at it. */
const EDGE = 48;

/**
 * The scrolling column a conversation lives in. It is a `log` live region, so
 * a screen reader announces messages as they are added.
 */
const ChatMessageList = ({
  ref,
  stickToBottom = true,
  onReachStart,
  "aria-label": ariaLabel = "Messages",
  children,
  className,
  onScroll,
  ...flex
}: ChatMessageListProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => listRef.current as HTMLDivElement);
  const pinned = useRef(true);
  const atStart = useRef(false);

  const scrollToBottom = useCallback(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, []);

  // A MutationObserver rather than an effect on `children`: content that
  // grows on its own (a streamed reply, an image that loads, a typing
  // indicator a child renders) changes the height without a new render here.
  useEffect(() => {
    const list = listRef.current;
    if (!stickToBottom || !list) return;
    scrollToBottom();
    const observer = new MutationObserver(() => {
      if (pinned.current) scrollToBottom();
    });
    observer.observe(list, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [stickToBottom, scrollToBottom]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const list = event.currentTarget;
    pinned.current = list.scrollHeight - list.scrollTop - list.clientHeight <= EDGE;
    const nearStart = list.scrollTop <= EDGE;
    if (nearStart && !atStart.current) onReachStart?.();
    atStart.current = nearStart;
    onScroll?.(event);
  };

  return (
    <Column
      ref={listRef}
      fill
      gap="16"
      padding="16"
      overflowY="auto"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label={ariaLabel}
      tabIndex={0}
      className={classNames(styles.list, className)}
      onScroll={handleScroll}
      {...flex}
    >
      {children}
    </Column>
  );
};

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
