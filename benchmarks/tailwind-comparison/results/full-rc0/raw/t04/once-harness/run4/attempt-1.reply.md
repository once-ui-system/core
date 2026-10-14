```tsx
"use client";

import {
  Avatar,
  AvatarGroup,
  Button,
  Column,
  Dialog,
  EmojiPickerDropdown,
  Fade,
  IconButton,
  KeyTip,
  Option,
  Row,
  Spinner,
  Tag,
  Text,
  Textarea,
  VisuallyHidden,
  useHotkeys,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Author = {
  id: string;
  name: string;
  role: string;
  initials: string;
  isAssistant?: boolean;
};

type Reaction = { emoji: string; count: number };

type Message = {
  id: string;
  authorId: string;
  time: string;
  text: string;
  reactions?: Reaction[];
};

type Command = {
  id: string;
  label: string;
  description: string;
  icon: IconName;
  keywords: string;
};

const AUTHORS: Record<string, Author> = {
  maya: { id: "maya", name: "Maya Okafor", role: "Product designer", initials: "MO" },
  jonas: { id: "jonas", name: "Jonas Lindqvist", role: "Frontend engineer", initials: "JL" },
  priya: { id: "priya", name: "Priya Raman", role: "Engineering manager", initials: "PR" },
  assistant: {
    id: "assistant",
    name: "Relay Assistant",
    role: "AI teammate",
    initials: "RA",
    isAssistant: true,
  },
  me: { id: "me", name: "You", role: "Release captain", initials: "YO" },
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    authorId: "maya",
    time: "9:41 AM",
    text: "Morning all. The new onboarding checklist is in staging. I'd love eyes on the empty state before we cut the release.",
    reactions: [
      { emoji: "👀", count: 3 },
      { emoji: "🚀", count: 2 },
    ],
  },
  {
    id: "m2",
    authorId: "jonas",
    time: "9:44 AM",
    text: "Checked it on a 320px viewport. The illustration clips under the heading, so I'm pushing a fix to the `checklist-empty` branch now.",
  },
  {
    id: "m3",
    authorId: "priya",
    time: "9:52 AM",
    text: "Thanks both. We have a go/no-go at 2 PM. Can someone summarise what's still open for 2.14?",
    reactions: [{ emoji: "🙏", count: 1 }],
  },
  {
    id: "m4",
    authorId: "assistant",
    time: "9:53 AM",
    text: "Three items are still open for 2.14: the empty-state clipping on small screens (fix in review), a flaky avatar upload test on CI, and the changelog copy waiting on Maya's sign-off. Everything else is merged and green.",
  },
];

const STREAM_REPLY =
  "Happy to help. Based on the open items, the safest plan is to merge Jonas's clipping fix first, rerun the avatar upload suite twice to confirm the flake is isolated, and then ask Maya to approve the changelog copy. That leaves roughly forty minutes of buffer before the 2 PM go/no-go.";

const COMMANDS: Command[] = [
  {
    id: "new-thread",
    label: "Start a new thread",
    description: "Open a fresh conversation in this channel",
    icon: "plus",
    keywords: "new thread conversation start",
  },
  {
    id: "search",
    label: "Search messages",
    description: "Find anything said in #release-2-14",
    icon: "search",
    keywords: "search find messages history",
  },
  {
    id: "summarise",
    label: "Summarise this channel",
    description: "Ask Relay Assistant for a recap",
    icon: "sparkle",
    keywords: "summarise summary recap ai assistant",
  },
  {
    id: "mute",
    label: "Mute notifications",
    description: "Pause alerts for the next hour",
    icon: "bell",
    keywords: "mute notifications pause alerts",
  },
  {
    id: "settings",
    label: "Channel settings",
    description: "Members, integrations and permissions",
    icon: "settings",
    keywords: "settings members integrations permissions",
  },
];

const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const MessageRow = ({ message }: { message: Message }) => {
  const author = AUTHORS[message.authorId];
  const isMe = author.id === "me";

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
          value={author.initials}
          size="m"
          statusIndicator={author.isAssistant ? { color: "green" } : undefined}
        />
      )}
      <Column gap="4" maxWidth={40} style={{ minWidth: 0 }}>
        <Row gap="8" vertical="center" horizontal={isMe ? "end" : "start"} wrap>
          <Text variant="label-strong-s" onBackground={author.isAssistant ? "brand-medium" : "neutral-strong"}>
            {author.name}
          </Text>
          {author.isAssistant && <Tag size="s" scheme="brand" label="AI" />}
          <Text as="time" variant="body-default-xs" onBackground="neutral-weak">
            {message.time}
          </Text>
        </Row>
        <Column
          paddingX="16"
          paddingY="12"
          radius="l"
          background={isMe ? "brand-alpha-weak" : "surface"}
          border={isMe ? "brand-alpha-medium" : true}
        >
          <Text variant="body-default-m" wrap="pretty">
            {message.text}
          </Text>
        </Column>
        {message.reactions && message.reactions.length > 0 && (
          <Row gap="4" wrap horizontal={isMe ? "end" : "start"}>
            {message.reactions.map((reaction) => (
              <Row
                key={reaction.emoji}
                gap="4"
                paddingX="8"
                paddingY="2"
                radius="full"
                background="neutral-alpha-weak"
                vertical="center"
                role="img"
                aria-label={`${reaction.count} ${reaction.emoji} reactions`}
              >
                <Text variant="body-default-s" aria-hidden="true">
                  {reaction.emoji}
                </Text>
                <Text variant="label-default-xs" onBackground="neutral-medium" aria-hidden="true">
                  {reaction.count}
                </Text>
              </Row>
            ))}
          </Row>
        )}
      </Column>
      {isMe && <Avatar value={author.initials} size="m" />}
    </Row>
  );
};

const StreamingRow = ({ text, thinking }: { text: string; thinking: boolean }) => {
  const author = AUTHORS.assistant;

  return (
    <Row as="li" fillWidth gap="12" style={{ listStyle: "none" }}>
      <Avatar value={author.initials} size="m" statusIndicator={{ color: "green" }} />
      <Column gap="4" maxWidth={40} style={{ minWidth: 0 }}>
        <Row gap="8" vertical="center" wrap>
          <Text variant="label-strong-s" onBackground="brand-medium">
            {author.name}
          </Text>
          <Tag size="s" scheme="brand" label="AI" />
          <Row gap="4" vertical="center">
            <Spinner size="xs" ariaLabel="Relay Assistant is typing" />
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {thinking ? "Thinking…" : "Writing…"}
            </Text>
          </Row>
        </Row>
        {!thinking && (
          <Column
            paddingX="16"
            paddingY="12"
            radius="l"
            background="surface"
            border
            aria-hidden="true"
          >
            <Text variant="body-default-m" wrap="pretty">
              {text}
              <Text as="span" variant="body-default-m" onBackground="brand-medium">
                {" ▍"}
              </Text>
            </Text>
          </Column>
        )}
      </Column>
    </Row>
  );
};

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => {
      window.clearTimeout(id);
      window.clearInterval(id);
    });
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useHotkeys(
    "mod+k",
    (event) => {
      event.preventDefault();
      setPaletteOpen((open) => !open);
    },
    { allowWhileTyping: true },
  );

  // Keep the newest content in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streamText, thinking]);

  const startStream = useCallback(() => {
    setStreaming(true);
    setThinking(true);
    setStreamText("");

    const words = STREAM_REPLY.split(" ");
    let index = 0;

    const begin = window.setTimeout(() => {
      setThinking(false);
      const interval = window.setInterval(() => {
        index += 1;
        setStreamText(words.slice(0, index).join(" "));
        if (index >= words.length) {
          window.clearInterval(interval);
          setMessages((prev) => [
            ...prev,
            {
              id: `a-${prev.length + 1}`,
              authorId: "assistant",
              time: formatTime(new Date()),
              text: STREAM_REPLY,
            },
          ]);
          setStreaming(false);
          setStreamText("");
          setAnnouncement("Relay Assistant replied.");
        }
      }, 70);
      timers.current.push(interval);
    }, 1200);
    timers.current.push(begin);
  }, []);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || streaming) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${prev.length + 1}`, authorId: "me", time: formatTime(new Date()), text },
    ]);
    setDraft("");
    setAnnouncement("Message sent.");
    startStream();
  }, [draft, streaming, startStream]);

  const stop = useCallback(() => {
    clearTimers();
    setStreaming(false);
    setThinking(false);
    setStreamText("");
    setAnnouncement("Generation stopped.");
  }, [clearTimers]);

  const runCommand = useCallback(
    (id: string) => {
      setPaletteOpen(false);
      setQuery("");
      if (id === "summarise" && !streaming) {
        setMessages((prev) => [
          ...prev,
          {
            id: `u-${prev.length + 1}`,
            authorId: "me",
            time: formatTime(new Date()),
            text: "Can you summarise where we are on 2.14?",
          },
        ]);
        startStream();
      }
    },
    [streaming, startStream],
  );

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((c) => `${c.label} ${c.keywords}`.toLowerCase().includes(q));
  }, [query]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  return (
    <Column as="main" fillWidth horizontal="center" style={{ height: "100dvh" }}>
      <VisuallyHidden as="h1">Release 2.14 team chat</VisuallyHidden>
      <Column fill maxWidth={64} background="page" style={{ minHeight: 0 }}>
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
          background="surface"
        >
          <Row gap="12" vertical="center" style={{ minWidth: 0 }}>
            <Column style={{ minWidth: 0 }}>
              <Text variant="heading-strong-m" truncate>
                # release-2-14
              </Text>
              <Text variant="body-default-xs" onBackground="neutral-weak" truncate>
                5 members · go/no-go today at 2 PM
              </Text>
            </Column>
          </Row>
          <Row gap="12" vertical="center">
            <Row s={{ hide: true }}>
              <AvatarGroup
                size="s"
                limit={4}
                avatars={[
                  { value: "MO" },
                  { value: "JL" },
                  { value: "PR" },
                  { value: "RA" },
                  { value: "YO" },
                ]}
              />
            </Row>
            <Button
              variant="secondary"
              size="s"
              prefixIcon="search"
              onClick={() => setPaletteOpen(true)}
              aria-haspopup="dialog"
              aria-keyshortcuts="Control+K Meta+K"
            >
              <Row gap="8" vertical="center">
                <Row s={{ hide: true }}>
                  <Text variant="label-default-s">Commands</Text>
                </Row>
                <Row s={{ hide: true }}>
                  <KeyTip keys="mod+k" />
                </Row>
              </Row>
            </Button>
          </Row>
        </Row>

        {/* Message log */}
        <Column fill style={{ minHeight: 0 }} position="relative">
          <div
            ref={scrollRef}
            role="log"
            aria-label="Conversation"
            aria-live="off"
            tabIndex={0}
            style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "1.5rem 1rem" }}
          >
            <Column as="ul" fillWidth gap="24" margin="0" padding="0">
              <Row as="li" fillWidth center style={{ listStyle: "none" }}>
                <Text variant="label-default-xs" onBackground="neutral-weak">
                  Today
                </Text>
              </Row>
              {messages.map((message) => (
                <MessageRow key={message.id} message={message} />
              ))}
              {streaming && <StreamingRow text={streamText} thinking={thinking} />}
            </Column>
          </div>
          <Fade position="absolute" top="0" left="0" fillWidth height={2} to="bottom" pointerEvents="none" />
        </Column>

        {/* Composer */}
        <Column as="footer" fillWidth paddingX="12" paddingTop="8" paddingBottom="12" gap="8" borderTop background="page">
          <Row fillWidth gap="8" vertical="center" horizontal="between" paddingX="4">
            <Text variant="body-default-xs" onBackground="neutral-weak" aria-hidden="true">
              <Text as="span" variant="label-strong-xs">
                Enter
              </Text>{" "}
              to send ·{" "}
              <Text as="span" variant="label-strong-xs">
                Shift + Enter
              </Text>{" "}
              for a new line
            </Text>
            {streaming && (
              <Button size="s" variant="tertiary" prefixIcon="pause" onClick={stop}>
                Stop generating
              </Button>
            )}
          </Row>
          <Textarea
            id="message-input"
            placeholder="Message #release-2-14"
            aria-label="Message"
            lines={1}
            resize="none"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            prefix={
              <EmojiPickerDropdown
                onSelect={(emoji) => setDraft((current) => current + emoji)}
                trigger={
                  <IconButton
                    icon="smiley"
                    variant="tertiary"
                    ariaLabel="Insert emoji"
                    tooltip="Insert emoji"
                  />
                }
              />
            }
            suffix={
              <IconButton
                icon="send"
                ariaLabel="Send message"
                tooltip="Send"
                onClick={send}
                disabled={!draft.trim() || streaming}
              />
            }
          />
        </Column>
      </Column>

      <VisuallyHidden>
        <div role="status" aria-live="polite">
          {announcement}
        </div>
      </VisuallyHidden>

      {/* Command palette */}
      <Dialog
        open={paletteOpen}
        onClose={() => {
          setPaletteOpen(false);
          setQuery("");
        }}
        title="Command palette"
        description="Search for an action, then press Enter."
      >
        <Column gap="12" fillWidth>
          <Textarea
            id="command-search"
            placeholder="Type a command…"
            aria-label="Search commands"
            lines={1}
            resize="none"
            value={query}
            onChange={(event) => setQuery(event.target.value.replace(/\n/g, ""))}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                const first = filteredCommands[0];
                if (first) runCommand(first.id);
              }
            }}
          />
          <Column gap="2" role="listbox" aria-label="Commands">
            {filteredCommands.length === 0 ? (
              <Text variant="body-default-s" onBackground="neutral-weak" padding="12">
                No commands match “{query}”.
              </Text>
            ) : (
              filteredCommands.map((command) => (
                <Option
                  key={command.id}
                  value={command.id}
                  label={command.label}
                  description={command.description}
                  prefix={<IconButton icon={command.icon} variant="ghost" size="s" ariaLabel="" tabIndex={-1} />}
                  onClick={runCommand}
                />
              ))
            )}
          </Column>
        </Column>
      </Dialog>
    </Column>
  );
}
```