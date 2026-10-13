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
import { useCallback, useEffect, useRef, useState } from "react";

type Author = "me" | "maya" | "dev" | "assistant";

interface Message {
  id: string;
  author: Author;
  text: string;
  time: string;
  reactions?: { emoji: string; count: number; reacted?: boolean }[];
}

interface Person {
  name: string;
  initials: string;
  role: string;
  status: "green" | "yellow" | "gray";
}

const people: Record<Author, Person> = {
  me: { name: "You", initials: "YO", role: "Product designer", status: "green" },
  maya: { name: "Maya Okafor", initials: "MO", role: "Engineering lead", status: "green" },
  dev: { name: "Devon Park", initials: "DP", role: "Backend engineer", status: "yellow" },
  assistant: { name: "Relay Assistant", initials: "RA", role: "AI helper", status: "green" },
};

const initialMessages: Message[] = [
  {
    id: "m1",
    author: "maya",
    text: "Morning all. The v2.4 release branch is cut. Staging deploy finished at 9:12 and smoke tests are green.",
    time: "9:14 AM",
    reactions: [
      { emoji: "🎉", count: 4, reacted: true },
      { emoji: "🚀", count: 2 },
    ],
  },
  {
    id: "m2",
    author: "dev",
    text: "Nice. One heads-up: the invoice export endpoint is still returning 504s for accounts with more than 10k rows. I'm adding pagination to the job runner now.",
    time: "9:17 AM",
  },
  {
    id: "m3",
    author: "me",
    text: "Thanks Devon. Can we still ship the new billing page today if the export is flagged off for large accounts?",
    time: "9:21 AM",
  },
  {
    id: "m4",
    author: "maya",
    text: "I think so. @Relay can you summarise the open blockers for the release?",
    time: "9:22 AM",
  },
  {
    id: "m5",
    author: "assistant",
    text: "Two blockers remain for v2.4: (1) the invoice export timeout for large accounts, mitigated by a feature flag, and (2) a missing translation for the new refund banner in German and French. Everything else on the checklist is complete.",
    time: "9:22 AM",
    reactions: [{ emoji: "👍", count: 3 }],
  },
];

const streamedReply =
  "Here's a suggested plan: ship the billing page behind the existing `billing_v2` flag, enable it for internal accounts first, and keep the export flag off for accounts above 10k rows. Devon's pagination fix can follow in a patch release once it passes load testing.";

const suggestions = ["Summarise this thread", "Draft release notes", "List open pull requests"];

function formatNow(): string {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

interface MessageRowProps {
  message: Message;
  onReact: (messageId: string, emoji: string) => void;
}

function MessageRow({ message, onReact }: MessageRowProps) {
  const person = people[message.author];
  const isMe = message.author === "me";

  return (
    <Row
      as="article"
      fillWidth
      gap="12"
      aria-label={`${person.name} at ${message.time}`}
      horizontal={isMe ? "end" : "start"}
    >
      {!isMe && <Avatar value={person.initials} size="m" statusIndicator={{ color: person.status }} />}
      <Column maxWidth={36} gap="4" horizontal={isMe ? "end" : "start"}>
        <Row gap="8" vertical="center">
          <Text variant="label-strong-s" onBackground={isMe ? "neutral-strong" : "brand-medium"}>
            {person.name}
          </Text>
          {message.author === "assistant" && <Tag size="s" scheme="accent" label="AI" />}
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {message.time}
          </Text>
        </Row>
        <Column
          paddingX="16"
          paddingY="12"
          radius="l"
          background={isMe ? "brand-alpha-weak" : "surface"}
          border
        >
          <Text variant="body-default-s" wrap="pretty">
            {message.text}
          </Text>
        </Column>
        {message.reactions && message.reactions.length > 0 && (
          <Row gap="4" wrap marginTop="4">
            {message.reactions.map((reaction) => (
              <Row
                key={reaction.emoji}
                as="button"
                type="button"
                onClick={() => onReact(message.id, reaction.emoji)}
                aria-pressed={!!reaction.reacted}
                aria-label={`${reaction.emoji} ${reaction.count} reactions${
                  reaction.reacted ? ", you reacted" : ""
                }`}
                paddingX="8"
                paddingY="2"
                gap="4"
                radius="full"
                vertical="center"
                border
                background={reaction.reacted ? "brand-alpha-medium" : "surface"}
                cursor="interactive"
              >
                <Text variant="label-default-xs" aria-hidden="true">
                  {reaction.emoji} {reaction.count}
                </Text>
              </Row>
            ))}
          </Row>
        )}
      </Column>
      {isMe && <Avatar value={person.initials} size="m" statusIndicator={{ color: person.status }} />}
    </Row>
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idRef = useRef(initialMessages.length);

  const nextId = useCallback(() => {
    idRef.current += 1;
    return `m${idRef.current}`;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  // Keep the newest content in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streamText, streaming]);

  const startStreaming = useCallback(() => {
    clearTimer();
    const words = streamedReply.split(" ");
    let index = 0;
    setStreaming(true);
    setStreamText("");
    setAnnouncement("Relay Assistant is typing");

    timerRef.current = setInterval(() => {
      index += 1;
      setStreamText(words.slice(0, index).join(" "));
      if (index >= words.length) {
        clearTimer();
        setMessages((prev) => [
          ...prev,
          { id: nextId(), author: "assistant", text: streamedReply, time: formatNow() },
        ]);
        setStreaming(false);
        setStreamText("");
        setAnnouncement("Relay Assistant replied");
      }
    }, 90);
  }, [clearTimer, nextId]);

  const stopStreaming = useCallback(() => {
    clearTimer();
    setStreamText((partial) => {
      if (partial.trim()) {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), author: "assistant", text: `${partial} …`, time: formatNow() },
        ]);
      }
      return "";
    });
    setStreaming(false);
    setAnnouncement("Response stopped");
  }, [clearTimer, nextId]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;
      setMessages((prev) => [...prev, { id: nextId(), author: "me", text: trimmed, time: formatNow() }]);
      setDraft("");
      startStreaming();
    },
    [nextId, startStreaming, streaming],
  );

  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id !== messageId
          ? m
          : {
              ...m,
              reactions: (m.reactions ?? []).map((r) =>
                r.emoji !== emoji
                  ? r
                  : { ...r, reacted: !r.reacted, count: r.reacted ? r.count - 1 : r.count + 1 },
              ),
            },
      ),
    );
  }, []);

  const focusComposer = useCallback(() => {
    document.getElementById("chat-composer")?.focus();
  }, []);

  // Cmd/Ctrl+K is handled by Kbar itself; "/" jumps to the composer.
  useHotkeys("/", (event) => {
    event.preventDefault();
    focusComposer();
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send(draft);
    }
  };

  const kbarItems = [
    {
      id: "focus-composer",
      name: "Write a message",
      section: "Actions",
      shortcut: ["/"],
      keywords: "compose type reply input",
      icon: "edit" as const,
      perform: focusComposer,
    },
    {
      id: "summarise",
      name: "Ask Relay to summarise the thread",
      section: "Actions",
      shortcut: [],
      keywords: "assistant ai summary stream",
      icon: "sparkle" as const,
      perform: () => send("Can you summarise this thread?"),
    },
    {
      id: "clear",
      name: "Clear conversation",
      section: "Actions",
      shortcut: [],
      keywords: "reset delete remove",
      icon: "trash" as const,
      perform: () => {
        clearTimer();
        setStreaming(false);
        setStreamText("");
        setMessages([]);
        setAnnouncement("Conversation cleared");
      },
    },
    {
      id: "restore",
      name: "Restore sample conversation",
      section: "Actions",
      shortcut: [],
      keywords: "reset undo history",
      icon: "refresh" as const,
      perform: () => {
        clearTimer();
        setStreaming(false);
        setStreamText("");
        setMessages(initialMessages);
        setAnnouncement("Conversation restored");
      },
    },
  ];

  const canSend = draft.trim().length > 0 && !streaming;

  return (
    <Kbar items={kbarItems}>
      <Column as="main" fillWidth horizontal="center" style={{ height: "100dvh" }}>
        <VisuallyHidden>
          <h1>Release coordination chat</h1>
        </VisuallyHidden>

        <Column fill maxWidth="m" background="surface" borderX>
          {/* Header */}
          <Row
            as="header"
            fillWidth
            paddingX="16"
            paddingY="12"
            gap="12"
            vertical="center"
            borderBottom
          >
            <Avatar value="#" size="m" />
            <Column fillWidth gap="2">
              <Text as="h2" variant="heading-strong-s">
                release-v2-4
              </Text>
              <Row gap="8" vertical="center">
                <StatusIndicator size="s" color="green" ariaLabel="3 members online" />
                <Text variant="body-default-xs" onBackground="neutral-weak" truncate>
                  3 online · Maya, Devon, Relay
                </Text>
              </Row>
            </Column>
            <Row hide s={{ hide: true }} gap="8" vertical="center">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Command menu
              </Text>
              <KeyTip keys="mod+k" />
            </Row>
          </Row>

          {/* Message list */}
          <Column fill position="relative" overflow="hidden">
            <Column
              fill
              ref={scrollRef}
              overflowY="auto"
              padding="16"
              gap="24"
              role="log"
              aria-label="Conversation"
              aria-live="polite"
              aria-relevant="additions"
              tabIndex={0}
            >
              {messages.length === 0 && !streaming && (
                <Column fill center gap="8">
                  <Text variant="heading-strong-s">No messages yet</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Say hello, or press the command menu shortcut to restore the sample thread.
                  </Text>
                </Column>
              )}

              {messages.map((message) => (
                <MessageRow key={message.id} message={message} onReact={toggleReaction} />
              ))}

              {streaming && (
                <Row fillWidth gap="12" aria-busy="true">
                  <Avatar
                    value={people.assistant.initials}
                    size="m"
                    statusIndicator={{ color: people.assistant.status }}
                  />
                  <Column maxWidth={36} gap="4">
                    <Row gap="8" vertical="center">
                      <Text variant="label-strong-s" onBackground="brand-medium">
                        {people.assistant.name}
                      </Text>
                      <Tag size="s" scheme="accent" label="AI" />
                      <Row gap="4" vertical="center">
                        <Spinner size="xs" ariaLabel="Relay Assistant is responding" />
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          {streamText ? "Writing…" : "Thinking…"}
                        </Text>
                      </Row>
                    </Row>
                    <Column
                      paddingX="16"
                      paddingY="12"
                      radius="l"
                      background="surface"
                      border
                      minWidth={8}
                    >
                      <Text variant="body-default-s" wrap="pretty" aria-hidden="true">
                        {streamText || "\u00A0"}
                      </Text>
                    </Column>
                  </Column>
                </Row>
              )}
            </Column>
            <Fade
              position="absolute"
              top="0"
              left="0"
              fillWidth
              height={2}
              to="bottom"
              base="surface"
              pointerEvents="none"
            />
          </Column>

          {/* Live region for assistive tech */}
          <VisuallyHidden>
            <div role="status" aria-live="polite">
              {announcement}
            </div>
          </VisuallyHidden>

          {/* Composer */}
          <Column fillWidth paddingX="12" paddingTop="8" paddingBottom="12" gap="8" borderTop>
            <Row gap="8" wrap vertical="center">
              {streaming ? (
                <Row
                  as="button"
                  type="button"
                  onClick={stopStreaming}
                  paddingX="12"
                  paddingY="4"
                  gap="8"
                  radius="full"
                  vertical="center"
                  border
                  background="surface"
                  cursor="interactive"
                >
                  <Spinner size="xs" ariaLabel="Generating" />
                  <Text variant="label-default-s">Stop generating</Text>
                </Row>
              ) : (
                suggestions.map((suggestion) => (
                  <Row
                    key={suggestion}
                    as="button"
                    type="button"
                    onClick={() => send(suggestion)}
                    paddingX="12"
                    paddingY="4"
                    radius="full"
                    border
                    background="surface"
                    cursor="interactive"
                  >
                    <Text variant="label-default-s">{suggestion}</Text>
                  </Row>
                ))
              )}
            </Row>

            <Textarea
              id="chat-composer"
              placeholder="Message #release-v2-4"
              aria-label="Message"
              lines={1}
              resize="none"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              prefix={
                <EmojiPickerDropdown
                  onSelect={(emoji) => setDraft((current) => current + emoji)}
                  trigger={
                    <Row themeBorder="rounded" style={{ marginLeft: "-0.25rem" }}>
                      <IconButton
                        icon="smiley"
                        variant="tertiary"
                        tooltip="Add emoji"
                        ariaLabel="Add emoji"
                      />
                    </Row>
                  }
                />
              }
              suffix={
                <Row themeBorder="rounded" style={{ marginRight: "-0.25rem" }}>
                  <IconButton
                    icon="send"
                    tooltip="Send message"
                    ariaLabel="Send message"
                    disabled={!canSend}
                    onClick={() => send(draft)}
                  />
                </Row>
              }
            />

            <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Enter to send · Shift+Enter for a new line
              </Text>
              <Row gap="8" vertical="center">
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
