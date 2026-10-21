"use client";

import classNames from "clsx";
import type React from "react";
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import { Column } from "../../components/Column";
import styles from "./Chat.module.scss";
import { ChatMessage, type ChatMessageProps } from "./ChatMessage";

export interface ChatMessageListProps extends React.ComponentProps<typeof Column> {
  /**
   * Keep the newest message in view: the list starts scrolled to the bottom
   * and follows new content while the reader is at the bottom. Once they
   * scroll up to read history, new messages no longer pull them down.
   */
  stickToBottom?: boolean;
  /** Called when the reader scrolls to the top, to load older messages. */
  onReachStart?: () => void;
  /** The list's accessible name. */
  ariaLabel?: string;
  /**
   * Stack a quick run of messages from one author: the bubbles close up, the
   * name and avatar show once, and the time and status show under the last
   * one. Applies to `ChatMessage` children that are next to each other, have
   * the same `from`, `name` and `variant`, and were sent within `stackWithin`.
   */
  stack?: boolean;
  /** The longest gap, in minutes, between two messages that still stack.
   *  Only `Date` times are compared; any other time stacks. */
  stackWithin?: number;
}

const isMessage = (node: ReactNode): node is ReactElement<ChatMessageProps> =>
  isValidElement(node) && node.type === ChatMessage;

const joins = (a: ChatMessageProps, b: ChatMessageProps, within: number) =>
  a.from === b.from &&
  a.name === b.name &&
  a.variant === b.variant &&
  (!(a.time instanceof Date) ||
    !(b.time instanceof Date) ||
    Math.abs(b.time.getTime() - a.time.getTime()) <= within * 60_000);

/** Marks each message with its place in a stack, leaving everything else as is. */
function stackMessages(children: ReactNode, within: number): ReactNode[] {
  const items = Children.toArray(children);
  return items.map((item, index) => {
    if (!isMessage(item) || item.props.stack) return item;
    const prev = items[index - 1];
    const next = items[index + 1];
    const withPrev = isMessage(prev) && joins(prev.props, item.props, within);
    const withNext = isMessage(next) && joins(item.props, next.props, within);
    if (!withPrev && !withNext) return item;
    const stack = withPrev && withNext ? "middle" : withPrev ? "end" : "start";
    return cloneElement(item, { stack });
  });
}

/** How close to an edge, in pixels, still counts as being at it. */
const EDGE = 48;

/**
 * The scrolling column a conversation lives in. It is a `log` live region, so
 * a screen reader announces messages as they are added.
 */
const ChatMessageList = forwardRef<HTMLDivElement, ChatMessageListProps>(
  (
    {
      stickToBottom = true,
      onReachStart,
      ariaLabel = "Messages",
      stack = false,
      stackWithin = 5,
      "aria-label": nativeAriaLabel,
      children,
      className,
      onScroll,
      ...flex
    },
    ref,
  ) => {
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

    // A stacked message closes up to the one above it by pulling back across
    // the list's gap, whatever `gap` resolved to (a token, a number, a
    // breakpoint), so the stylesheet reads it from here.
    useLayoutEffect(() => {
      const list = listRef.current;
      if (stack && list) list.style.setProperty("--chat-gap", getComputedStyle(list).rowGap);
    });

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
        aria-label={nativeAriaLabel ?? ariaLabel}
        tabIndex={0}
        className={classNames(styles.list, className)}
        onScroll={handleScroll}
        {...flex}
      >
        {stack ? stackMessages(children, stackWithin) : children}
      </Column>
    );
  },
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
