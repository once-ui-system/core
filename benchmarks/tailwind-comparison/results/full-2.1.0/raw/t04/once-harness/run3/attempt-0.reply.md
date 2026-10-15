Everything is confirmed. Writing the page now.

```tsx
"use client";

import type { KbarItem } from "@once-ui-system/core";
import {
  Avatar,
  Column,
  EmojiPickerDropdown,
  Fade,
  IconButton,
  Kbar,
  KeyTip,
  Line,
  Row,
  Spinner,
  Tag,
  Text,
  Textarea,
  VisuallyHidden,
} from "@once-ui-system/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Author = "me" | "assistant" | "teammate";

interface Message {
  id: string;
  author: Author;
  name: string;
  time: string;
  body: string;
  reactions?: { emoji: string; count: number; reacted?: boolean }[];
}

const people: Record<Author, { name: string; initials: string; tone: string }> = {
  me: { name: "You", initials: "YO", tone: "neutral" },
  assistant: { name: "Sidekick", initials: "SK", tone: "brand" },
  teammate: { name: "Priya Raman", initials: "PR", tone: "accent" },
};

const initialMessages: Message[] = [
  {
    id: "m1",
    author: "teammate",
    name: "Priya Raman",
    time: "9:41 AM",
    body: "Morning all! The staging deploy finished cleanly. I'm seeing p95 checkout latency down from 840ms to 610ms after the connection-pool change.",
    reactions: [
      { emoji: "🎉", count: 4, reacted: true },
      { emoji: "🚀", count: 2 },
    ],
  },
  {
    id: "m2",
    author: "me",
    name: "You",
    time: "9:43 AM",
    body: "Nice work. @Sidekick can you summarise what changed in the release notes and flag anything risky before we promote to production?",
  },
  {
    id: "m3",
    author: "assistant",
    name: "Sidekick",
    time: "9:43 AM",
    body: "Here's the short version of release 2.14:\n\n1. Connection pool size raised from 20 to 50 per instance.\n2. Retry backoff on the payments client is now exponential with jitter.\n3. The legacy /v1/orders endpoint logs a deprecation warning.\n\nOne thing worth a second look: the pool change roughly doubles open database connections at peak, so confirm the replica limit is at least 400 before promoting.",
    reactions: [{ emoji: "👍", count: 3, reacted: true }],
  },
  {
    id: "m4",
    author: "teammate",
    name: "Priya Raman",
    time: "9:52 AM",
    body: "Good catch. Replica limit is 500, so we have headroom. I'll schedule the production rollout for 2 PM.",
  },
];

const streamedReply =
  "Sounds good. I'll draft the rollout checklist now: pre-flight health checks, a 10% canary for 15 minutes, then a full rollout if error rate stays under 0.5%. I'll also add a rollback step that restores the previous pool size in one command.";

const kbarItems = (actions: {
  clear: () => void;
  focus: () => void;
  replay: () => void;
}): KbarItem[] => [
  {
    id: "focus",
    name: "Focus message box",
    icon: "edit",
    shortcut: [],
    section: "Conversation",
    keywords: "focus compose write type input",
    perform: actions.focus,
  },
  {
    id: "replay",
    name: "Ask Sidekick to draft the checklist",
    icon: "sparkle",
    shortcut: [],
    section: "Conversation",
    keywords: "assistant ai stream reply draft checklist",
    perform: actions.replay,
  },
  {
    id: "clear",
    name: "Clear conversation",
    icon: "trash",
    shortcut: [],
    section: "Conversation",
    keywords: "clear reset delete messages",
    perform: actions.clear,
  },
  {
    id: "threads",
    name: "Go to #release-2-14",
    icon: "chat",
    shortcut: [],
    section: "Channels",
    keywords: "channel release thread",
    href: "#",
  },
  {
    id: "settings",
    name: "Notification settings",
    icon: "settings",
    shortcut: [],
    section: "Channels",
    keywords: "notifications settings preferences",
    href: "#",
  },
];

function nowLabel(): string {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function MessageAvatar({ author }: { author: Author }) {
  const p = people[author];
  return (
    <Avatar
      size="m"
      value={p.initials}
      statusIndicator={author === "assistant" ? { color: "green" } : undefined}
      aria-hidden="true"
    />
  );
}

function MessageItem({
  message,
  streaming,
  onToggleReaction,
}: {
  message: Message;
  streaming?: boolean;
  onToggleReaction?: (messageId: string, emoji: string) => void;
}) {
  const isMe = message.author === "me";
  return (
    <Row
      as="article"
      fillWidth
      gap="12"
      horizontal={isMe ? "end" : "start"}
      aria-label={`${message.name} at ${message.time}`}
      aria-busy={streaming ? true : undefined}
    >
      {!isMe && <MessageAvatar author={message.author} />}
      <Column gap="4" maxWidth={40} fitWidth horizontal={isMe ? "end" : "start"} style={{ minWidth: 0 }}>
        <Row gap="8" vertical="center" wrap>
          <Text variant="label-strong-s" onBackground={isMe ? "neutral-strong" : "brand-medium"}>
            {message.name}
          </Text>
          {message.author === "assistant" && (
            <Tag size="s" scheme="brand" prefixIcon="sparkle" label="AI" />
          )}
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {message.time}
          </Text>
        </Row>
        <Column
          paddingX="16"
          paddingY="12"
          radius="l"
          background={isMe ? "brand-alpha-weak" : "surface"}
          border={isMe ? "brand-alpha-medium" : true}
          gap="8"
        >
          <Text
            variant="body-default-m"
            wrap="pretty"
            style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
          >
            {message.body}
            {streaming && (
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: "0.5ch",
                  height: "1em",
                  marginLeft: "2px",
                  verticalAlign: "text-bottom",
                  background: "var(--brand-solid-strong)",
                  animation: "chat-caret 1s steps(1) infinite",
                }}
              />
            )}
          </Text>
        </Column>
        {message.reactions && message.reactions.length > 0 && (
          <Row gap="4" wrap marginTop="4">
            {message.reactions.map((r) => (
              <button
                key={r.emoji}
                type="button"
                className="chat-reaction"
                aria-pressed={!!r.reacted}
                aria-label={`${r.emoji} ${r.count} reactions${r.reacted ? ", you reacted" : ""}`}
                onClick={() => onToggleReaction?.(message.id, r.emoji)}
              >
                <span aria-hidden="true">{r.emoji}</span>
                <span aria-hidden="true">{r.count}</span>
              </button>
            ))}
          </Row>
        )}
      </Column>
      {isMe && <MessageAvatar author="me" />}
    </Row>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <Row gap="12" vertical="center" fillWidth>
      <Avatar size="m" value="SK" statusIndicator={{ color: "green" }} aria-hidden="true" />
      <Row
        gap="12"
        vertical="center"
        paddingX="16"
        paddingY="12"
        radius="l"
        background="surface"
        border
      >
        <Spinner size="xs" ariaLabel={label} />
        <Text variant="body-default-s" onBackground="neutral-weak">
          {label}
        </Text>
      </Row>
    </Row>
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState<"idle" | "thinking" | "streaming">("idle");
  const [streamText, setStreamText] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const logRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Keep the newest content in view.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight });
  }, [messages, streamText, phase]);

  const startReply = useCallback(() => {
    clearTimers();
    setPhase("thinking");
    setStreamText("");
    setAnnouncement("Sidekick is thinking");

    timers.current.push(
      window.setTimeout(() => {
        setPhase("streaming");
        setAnnouncement("Sidekick is replying");
        const words = streamedReply.split(" ");
        let i = 0;
        const tick = () => {
          i += 1;
          setStreamText(words.slice(0, i).join(" "));
          if (i < words.length) {
            timers.current.push(window.setTimeout(tick, 60 + ((i * 37) % 70)));
          } else {
            timers.current.push(
              window.setTimeout(() => {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `a-${prev.length + 1}`,
                    author: "assistant",
                    name: "Sidekick",
                    time: nowLabel(),
                    body: streamedReply,
                  },
                ]);
                setStreamText("");
                setPhase("idle");
                setAnnouncement("Sidekick sent a new message");
              }, 150),
            );
          }
        };
        tick();
      }, 1400),
    );
  }, [clearTimers]);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || phase !== "idle") return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${prev.length + 1}`, author: "me", name: "You", time: nowLabel(), body: text },
    ]);
    setDraft("");
    startReply();
  }, [draft, phase, startReply]);

  const stop = useCallback(() => {
    clearTimers();
    if (streamText) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${prev.length + 1}`,
          author: "assistant",
          name: "Sidekick",
          time: nowLabel(),
          body: `${streamText}…`,
        },
      ]);
    }
    setStreamText("");
    setPhase("idle");
    setAnnouncement("Reply stopped");
  }, [clearTimers, streamText]);

  const focusComposer = useCallback(() => {
    composerRef.current?.querySelector("textarea")?.focus();
  }, []);

  const clearConversation = useCallback(() => {
    clearTimers();
    setMessages([]);
    setStreamText("");
    setPhase("idle");
    setAnnouncement("Conversation cleared");
  }, [clearTimers]);

  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id !== messageId
          ? m
          : {
              ...m,
              reactions: m.reactions?.map((r) =>
                r.emoji !== emoji
                  ? r
                  : { ...r, reacted: !r.reacted, count: r.count + (r.reacted ? -1 : 1) },
              ),
            },
      ),
    );
  }, []);

  const items = useMemo(
    () =>
      kbarItems({
        clear: clearConversation,
        focus: () => window.setTimeout(focusComposer, 50),
        replay: startReply,
      }),
    [clearConversation, focusComposer, startReply],
  );

  const busy = phase !== "idle";

  return (
    <Column as="main" fillWidth horizontal="center" style={{ height: "100dvh" }}>
      <style>{`
        @keyframes chat-caret { 0%, 50% { opacity: 1 } 50.01%, 100% { opacity: 0 } }
        @media (prefers-reduced-motion: reduce) { .chat-caret-anim { animation: none !important } }
        .chat-reaction {
          display: inline-flex; align-items: center; gap: 0.375rem;
          padding: 0.125rem 0.625rem; min-height: 1.75rem;
          border-radius: 999px; cursor: pointer; font: inherit; font-size: 0.8125rem;
          color: var(--neutral-on-background-strong);
          background: var(--neutral-alpha-weak);
          border: 1px solid var(--neutral-alpha-medium);
        }
        .chat-reaction[aria-pressed="true"] {
          background: var(--brand-alpha-weak);
          border-color: var(--brand-alpha-medium);
        }
        .chat-reaction:hover { background: var(--neutral-alpha-medium); }
        .chat-reaction:focus-visible { outline: 2px solid var(--brand-solid-strong); outline-offset: 2px; }
      `}</style>

      <VisuallyHidden>
        <h1>Release 2.14 team chat</h1>
      </VisuallyHidden>

      <Column fillWidth maxWidth="m" fillHeight>
        {/* Header */}
        <Row
          as="header"
          fillWidth
          paddingX="16"
          paddingY="12"
          gap="12"
          vertical="center"
          horizontal="between"
          borderBottom
          background="page"
        >
          <Row gap="12" vertical="center" style={{ minWidth: 0 }}>
            <Row center background="brand-alpha-weak" radius="m" minWidth="32" minHeight="32">
              <Text variant="label-strong-m" onBackground="brand-medium" aria-hidden="true">
                #
              </Text>
            </Row>
            <Column style={{ minWidth: 0 }}>
              <Text variant="label-strong-m" truncate>
                release-2-14
              </Text>
              <Row gap="8" vertical="center">
                <Text variant="body-default-xs" onBackground="neutral-weak" truncate>
                  3 members · Sidekick is online
                </Text>
              </Row>
            </Column>
          </Row>

          <Row gap="8" vertical="center">
            <Kbar
              items={items}
              data-border="rounded"
              radius="full"
            >
              <Row
                as="span"
                vertical="center"
                gap="8"
                paddingX="12"
                paddingY="8"
                radius="full"
                background="neutral-alpha-weak"
                border
                onBackground="neutral-medium"
                cursor="interactive"
                aria-label="Open command palette"
              >
                <Text variant="body-default-xs" onBackground="neutral-medium">
                  <Row as="span" s={{ hide: true }}>Commands</Row>
                </Text>
                <KeyTip keys="mod+k" />
              </Row>
            </Kbar>
          </Row>
        </Row>

        {/* Log */}
        <Column fill style={{ position: "relative", minHeight: 0 }}>
          <Column
            ref={logRef}
            fill
            paddingX="16"
            paddingY="24"
            gap="24"
            overflowY="auto"
            role="log"
            aria-label="Conversation"
            aria-live="off"
            tabIndex={0}
            style={{ minHeight: 0 }}
          >
            <Row horizontal="center" vertical="center" gap="12" fillWidth>
              <Line />
              <Text variant="label-default-xs" onBackground="neutral-weak" style={{ whiteSpace: "nowrap" }}>
                Today
              </Text>
              <Line />
            </Row>

            {messages.length === 0 && phase === "idle" && (
              <Column fillWidth center gap="8" paddingY="64">
                <Text variant="heading-strong-s">No messages yet</Text>
                <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                  Say hello, or press the command palette shortcut to ask Sidekick for a draft.
                </Text>
              </Column>
            )}

            {messages.map((m) => (
              <MessageItem key={m.id} message={m} onToggleReaction={toggleReaction} />
            ))}

            {phase === "thinking" && <TypingIndicator label="Sidekick is thinking…" />}

            {phase === "streaming" && (
              <MessageItem
                streaming
                message={{
                  id: "stream",
                  author: "assistant",
                  name: "Sidekick",
                  time: "now",
                  body: streamText,
                }}
              />
            )}
          </Column>
          <Fade
            position="absolute"
            bottom="0"
            left="0"
            fillWidth
            to="top"
            height={2}
            pointerEvents="none"
          />
        </Column>

        <VisuallyHidden>
          <div role="status" aria-live="polite" aria-atomic="true">
            {announcement}
          </div>
        </VisuallyHidden>

        {/* Composer */}
        <Column
          as="form"
          fillWidth
          paddingX="12"
          paddingTop="8"
          paddingBottom="12"
          gap="8"
          // @ts-expect-error: Column's `as` form typing narrows onSubmit to a div handler
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            send();
          }}
        >
          <div ref={composerRef} style={{ width: "100%" }}>
            <Textarea
              id="chat-message"
              placeholder="Message #release-2-14"
              aria-label="Message"
              lines={1}
              resize="none"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              prefix={
                <EmojiPickerDropdown
                  onSelect={(emoji) => {
                    setDraft((d) => d + emoji);
                    focusComposer();
                  }}
                  trigger={
                    <Row themeBorder="rounded" style={{ marginLeft: "-0.25rem" }}>
                      <IconButton
                        icon="smiley"
                        variant="tertiary"
                        ariaLabel="Insert emoji"
                        tooltip="Insert emoji"
                      />
                    </Row>
                  }
                />
              }
              suffix={
                <Row gap="4" vertical="center" themeBorder="rounded" style={{ marginRight: "-0.25rem" }}>
                  {busy ? (
                    <IconButton
                      icon="pause"
                      variant="secondary"
                      ariaLabel="Stop reply"
                      tooltip="Stop reply"
                      onClick={stop}
                    />
                  ) : (
                    <IconButton
                      icon="send"
                      ariaLabel="Send message"
                      tooltip="Send"
                      disabled={draft.trim().length === 0}
                      onClick={send}
                    />
                  )}
                </Row>
              }
            />
          </div>
          <Row gap="8" vertical="center" horizontal="between" paddingX="4" wrap>
            <Row gap="8" vertical="center">
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Enter to send · Shift + Enter for a new line
              </Text>
            </Row>
            <Row gap="8" vertical="center" s={{ hide: true }}>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Command palette
              </Text>
              <KeyTip keys="mod+k" />
            </Row>
          </Row>
        </Column>
      </Column>
    </Column>
  );
}
```