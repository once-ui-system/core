```tsx
"use client";

import {
  Avatar,
  Column,
  EmojiPickerDropdown,
  Fade,
  IconButton,
  Kbar,
  KeyTip,
  Row,
  Spinner,
  StatusIndicator,
  Tag,
  Text,
  Textarea,
  VisuallyHidden,
  useHotkeys,
} from "@once-ui-system/core";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type Author = "me" | "assistant" | "teammate";

type Message = {
  id: string;
  author: Author;
  name: string;
  time: string;
  text: string;
  reactions?: { emoji: string; count: number }[];
};

type PaletteItem = {
  id: string;
  name: string;
  section: string;
  shortcut: string[];
  keywords: string;
  perform: () => void;
};

const PEOPLE: Record<Author, { name: string; initials: string }> = {
  me: { name: "You", initials: "YO" },
  assistant: { name: "Atlas", initials: "AT" },
  teammate: { name: "Priya Raman", initials: "PR" },
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    author: "teammate",
    name: "Priya Raman",
    time: "9:12 AM",
    text: "Morning! The checkout latency regression from last night is still showing up in the p95 dashboard. Can someone take a look before standup?",
    reactions: [{ emoji: "👀", count: 3 }],
  },
  {
    id: "m2",
    author: "me",
    name: "You",
    time: "9:14 AM",
    text: "On it. Atlas, can you compare the deploy timeline against the latency spike and tell me what changed around 23:40?",
  },
  {
    id: "m3",
    author: "assistant",
    name: "Atlas",
    time: "9:14 AM",
    text: "Two things landed within ten minutes of the spike: the payments-gateway 4.18 rollout at 23:36 and a config change that lowered the connection pool from 40 to 12 at 23:41. The pool change lines up best with the queueing pattern in the traces, so I would start there.",
    reactions: [
      { emoji: "👍", count: 2 },
      { emoji: "🔍", count: 1 },
    ],
  },
  {
    id: "m4",
    author: "teammate",
    name: "Priya Raman",
    time: "9:17 AM",
    text: "That matches what I saw. Rolling the pool size back to 40 now, I will post here once p95 settles.",
  },
];

const STREAMED_REPLY =
  "Good call. Once the pool is back at 40, I would watch three signals for fifteen minutes: p95 checkout latency, connection wait time in the gateway, and the retry rate on the payments queue. If all three return to baseline, the 4.18 rollout is cleared and we can close the incident with a short note on the config guardrail.";

const REACTION_LABEL = (emoji: string, count: number) =>
  `${emoji} reaction, ${count} ${count === 1 ? "person" : "people"}`;

const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

function MessageRow({ message, streaming }: { message: Message; streaming?: boolean }) {
  const isMe = message.author === "me";
  const person = PEOPLE[message.author];

  return (
    <Row
      as="li"
      fillWidth
      gap="12"
      horizontal={isMe ? "end" : "start"}
      style={{ listStyle: "none" }}
    >
      {!isMe && (
        <Avatar
          value={person.initials}
          size="m"
          statusIndicator={
            message.author === "assistant" ? { color: streaming ? "yellow" : "green" } : undefined
          }
        />
      )}
      <Column gap="4" maxWidth={32} horizontal={isMe ? "end" : "start"} flex={1}>
        <Row gap="8" vertical="center" horizontal={isMe ? "end" : "start"}>
          <Text variant="label-strong-s" onBackground={isMe ? "neutral-strong" : "brand-medium"}>
            {message.name}
          </Text>
          {message.author === "assistant" && (
            <Tag size="s" scheme="brand">
              AI
            </Tag>
          )}
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {message.time}
          </Text>
        </Row>
        <Column
          padding="12"
          paddingX="16"
          radius="l"
          background={isMe ? "brand-alpha-weak" : "surface"}
          border
          gap="8"
        >
          <Text variant="body-default-s" wrap="pretty">
            {message.text}
            {streaming && <VisuallyHidden> (still typing)</VisuallyHidden>}
          </Text>
          {streaming && (
            <Row gap="8" vertical="center" onBackground="neutral-weak">
              <Spinner size="s" ariaLabel="Atlas is writing a reply" />
              <Text variant="label-default-xs" onBackground="neutral-weak">
                Atlas is typing…
              </Text>
            </Row>
          )}
        </Column>
        {message.reactions && message.reactions.length > 0 && (
          <Row gap="4" wrap>
            {message.reactions.map((reaction) => (
              <Row
                key={reaction.emoji}
                paddingX="8"
                paddingY="2"
                gap="4"
                radius="full"
                background="neutral-alpha-weak"
                border
                vertical="center"
                role="img"
                aria-label={REACTION_LABEL(reaction.emoji, reaction.count)}
              >
                <Text variant="label-default-xs" aria-hidden="true">
                  {reaction.emoji} {reaction.count}
                </Text>
              </Row>
            ))}
          </Row>
        )}
      </Column>
      {isMe && <Avatar value={person.initials} size="m" />}
    </Row>
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState<Message | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const logEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const logId = useId();

  const isStreaming = streaming !== null;

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => stopTimer, [stopTimer]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, streaming]);

  const focusComposer = useCallback(() => {
    composerRef.current?.querySelector("textarea")?.focus();
  }, []);

  const startStream = useCallback(() => {
    const words = STREAMED_REPLY.split(" ");
    const base: Message = {
      id: `a-${Date.now()}`,
      author: "assistant",
      name: "Atlas",
      time: formatTime(new Date()),
      text: "",
    };
    let index = 0;
    setStreaming(base);
    setAnnouncement("Atlas is typing a reply.");

    stopTimer();
    timerRef.current = setInterval(() => {
      index += 1;
      if (index >= words.length) {
        stopTimer();
        const finished: Message = { ...base, text: words.join(" ") };
        setStreaming(null);
        setMessages((prev) => [...prev, finished]);
        setAnnouncement("Atlas replied.");
        return;
      }
      setStreaming({ ...base, text: words.slice(0, index).join(" ") });
    }, 70);
  }, [stopTimer]);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || isStreaming) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        author: "me",
        name: "You",
        time: formatTime(new Date()),
        text,
      },
    ]);
    setDraft("");
    startStream();
  }, [draft, isStreaming, startStream]);

  const stop = useCallback(() => {
    stopTimer();
    setStreaming((current) => {
      if (current && current.text) {
        const partial: Message = { ...current, text: `${current.text}…` };
        setMessages((prev) => [...prev, partial]);
      }
      return null;
    });
    setAnnouncement("Reply stopped.");
  }, [stopTimer]);

  useHotkeys("/", (event) => {
    event.preventDefault();
    focusComposer();
  });

  const paletteItems: PaletteItem[] = [
    {
      id: "focus",
      name: "Focus message box",
      section: "Chat",
      shortcut: ["/"],
      keywords: "write compose type input",
      perform: focusComposer,
    },
    {
      id: "clear",
      name: "Clear conversation",
      section: "Chat",
      shortcut: [],
      keywords: "reset delete empty",
      perform: () => {
        stopTimer();
        setStreaming(null);
        setMessages([]);
        setAnnouncement("Conversation cleared.");
      },
    },
    {
      id: "restore",
      name: "Restore sample conversation",
      section: "Chat",
      shortcut: [],
      keywords: "reset demo undo",
      perform: () => {
        stopTimer();
        setStreaming(null);
        setMessages(INITIAL_MESSAGES);
        setAnnouncement("Sample conversation restored.");
      },
    },
  ];

  const canSend = draft.trim().length > 0 && !isStreaming;

  return (
    <Kbar items={paletteItems}>
      <VisuallyHidden focusable as="a" {...{ href: `#${inputId}` }}>
        Skip to message box
      </VisuallyHidden>

      <Column as="main" fillWidth horizontal="center" paddingX="xs" s={{ paddingX: "0" }}>
        <Column
          fillWidth
          maxWidth="m"
          height="100dvh"
          background="page"
          borderX
          s={{ borderX: false }}
        >
          <Row
            as="header"
            fillWidth
            paddingX="16"
            paddingY="12"
            gap="12"
            vertical="center"
            borderBottom
            background="surface"
          >
            <Avatar
              value="AT"
              size="m"
              statusIndicator={{ color: isStreaming ? "yellow" : "green" }}
            />
            <Column flex={1} gap="2">
              <Text as="h1" variant="heading-strong-s">
                #checkout-incident
              </Text>
              <Row gap="8" vertical="center">
                <StatusIndicator
                  size="s"
                  color={isStreaming ? "yellow" : "green"}
                  ariaLabel={isStreaming ? "Atlas is typing" : "Atlas is online"}
                />
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {isStreaming ? "Atlas is typing…" : "Priya, Atlas and you"}
                </Text>
              </Row>
            </Column>
            <Row
              hide
              s={{ hide: false }}
              gap="8"
              vertical="center"
              textVariant="label-default-xs"
              onBackground="neutral-weak"
            >
              <KeyTip keys="mod+k" />
            </Row>
          </Row>

          <Column flex={1} minHeight="0" position="relative">
            <Column
              fill
              overflowY="auto"
              paddingX="16"
              paddingY="24"
              gap="24"
              scrollbar="minimal"
              id={logId}
              role="log"
              aria-label="Conversation"
              aria-relevant="additions"
              tabIndex={0}
            >
              <Row horizontal="center">
                <Tag size="s" scheme="neutral">
                  Today
                </Tag>
              </Row>

              {messages.length === 0 && !streaming ? (
                <Column fill center gap="8" paddingY="64">
                  <Text variant="heading-strong-s">No messages yet</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                    Say hello, or open the command palette to restore the sample conversation.
                  </Text>
                </Column>
              ) : (
                <Column as="ul" gap="24" margin="0" padding="0">
                  {messages.map((message) => (
                    <MessageRow key={message.id} message={message} />
                  ))}
                  {streaming && <MessageRow key={streaming.id} message={streaming} streaming />}
                </Column>
              )}
              <div ref={logEndRef} aria-hidden="true" />
            </Column>
            <Fade
              position="absolute"
              top="0"
              left="0"
              fillWidth
              height="24"
              to="bottom"
              base="page"
              pointerEvents="none"
            />
          </Column>

          <VisuallyHidden as="div" {...{ role: "status", "aria-live": "polite" }}>
            {announcement}
          </VisuallyHidden>

          <Column
            as="form"
            fillWidth
            padding="12"
            gap="8"
            borderTop
            background="surface"
            ref={composerRef}
            {...{
              onSubmit: (event: React.FormEvent) => {
                event.preventDefault();
                send();
              },
            }}
          >
            <Textarea
              id={inputId}
              placeholder="Message #checkout-incident"
              aria-label="Message"
              lines={1}
              resize="none"
              value={draft}
              disabled={false}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDraft(event.target.value)
              }
              onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  send();
                }
              }}
              prefix={
                <EmojiPickerDropdown
                  onSelect={(emoji) => setDraft((current) => current + emoji)}
                  placement="top-start"
                  trigger={
                    <Row themeBorder="rounded">
                      <IconButton
                        icon="smiley"
                        variant="tertiary"
                        size="s"
                        ariaLabel="Add emoji"
                        tooltip="Add emoji"
                      />
                    </Row>
                  }
                />
              }
              suffix={
                isStreaming ? (
                  <IconButton
                    icon="pause"
                    variant="secondary"
                    size="s"
                    ariaLabel="Stop generating"
                    tooltip="Stop generating"
                    onClick={stop}
                  />
                ) : (
                  <IconButton
                    icon="send"
                    size="s"
                    ariaLabel="Send message"
                    tooltip="Send message"
                    disabled={!canSend}
                    onClick={send}
                  />
                )
              }
            />
            <Row fillWidth gap="12" vertical="center" horizontal="between" wrap>
              <Row
                gap="4"
                vertical="center"
                textVariant="body-default-xs"
                onBackground="neutral-weak"
              >
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  Enter to send, Shift+Enter for a new line
                </Text>
              </Row>
              <Row gap="8" vertical="center" textVariant="body-default-xs" onBackground="neutral-weak">
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  Command palette
                </Text>
                <KeyTip keys="mod+k" />
              </Row>
            </Row>
          </Column>
        </Column>
      </Column>
    </Kbar>
  );
}
```