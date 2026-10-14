```tsx
"use client";

import {
  Avatar,
  Button,
  Column,
  EmojiPickerDropdown,
  Fade,
  IconButton,
  Kbar,
  KeyTip,
  Line,
  Row,
  Spinner,
  StatusIndicator,
  Tag,
  Text,
  Textarea,
  VisuallyHidden,
  useHotkeys,
} from "@once-ui-system/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type AuthorId = "maya" | "tomas" | "priya" | "assistant" | "me";

interface Author {
  id: AuthorId;
  name: string;
  role: string;
  initials: string;
  online: boolean;
}

interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface Message {
  id: string;
  author: AuthorId;
  time: string;
  text: string;
  reactions?: Reaction[];
}

const AUTHORS: Record<AuthorId, Author> = {
  maya: { id: "maya", name: "Maya Okafor", role: "Design lead", initials: "MO", online: true },
  tomas: { id: "tomas", name: "Tomás Reyes", role: "Frontend engineer", initials: "TR", online: true },
  priya: { id: "priya", name: "Priya Nair", role: "Product manager", initials: "PN", online: false },
  assistant: { id: "assistant", name: "Relay Assistant", role: "AI helper", initials: "RA", online: true },
  me: { id: "me", name: "You", role: "Engineer", initials: "YO", online: true },
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    author: "priya",
    time: "9:41 AM",
    text: "Morning all. The release candidate for the billing dashboard is tagged. Can we do a final pass on the empty states before noon?",
    reactions: [{ emoji: "👍", count: 3, reacted: false }],
  },
  {
    id: "m2",
    author: "maya",
    time: "9:44 AM",
    text: "On it. I found two spots where the invoice table shows a blank card instead of the illustration. Pushing a fix to the design tokens branch now.",
  },
  {
    id: "m3",
    author: "tomas",
    time: "9:52 AM",
    text: "Nice catch. I'll rebase once Maya's branch lands. The keyboard focus order on the filters drawer still needs a look too, so I'll take that.",
    reactions: [
      { emoji: "🙌", count: 2, reacted: true },
      { emoji: "🚀", count: 1, reacted: false },
    ],
  },
  {
    id: "m4",
    author: "me",
    time: "10:03 AM",
    text: "@Relay Assistant can you summarise what's left on the release checklist?",
  },
  {
    id: "m5",
    author: "assistant",
    time: "10:03 AM",
    text: "Three items remain: empty-state illustrations (Maya, in progress), filters drawer focus order (Tomás, not started) and the changelog copy review (Priya, waiting on legal). Everything else is checked off.",
  },
];

const STREAM_REPLY =
  "Based on the checklist, the only blocker for a noon cut is the filters drawer. Tomás estimates about forty minutes, so a 12:30 release is realistic. I can draft the changelog announcement while you wait if that helps.";

const COMMAND_ITEMS = [
  {
    id: "clear",
    name: "Clear conversation",
    section: "Conversation",
    shortcut: [] as string[],
    keywords: "reset delete messages",
    icon: "trash" as const,
    perform: () => {
      document.dispatchEvent(new CustomEvent("relay:clear"));
    },
  },
  {
    id: "focus",
    name: "Focus message box",
    section: "Conversation",
    shortcut: [] as string[],
    keywords: "type write composer input",
    icon: "edit" as const,
    perform: () => {
      document.getElementById("chat-composer")?.focus();
    },
  },
  {
    id: "members",
    name: "View channel members",
    section: "Channel",
    shortcut: [] as string[],
    keywords: "people team users",
    icon: "organization" as const,
    perform: () => {},
  },
  {
    id: "settings",
    name: "Channel settings",
    section: "Channel",
    shortcut: [] as string[],
    keywords: "preferences notifications",
    icon: "settings" as const,
    perform: () => {},
  },
];

function formatNow(): string {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function MessageRow({
  message,
  grouped,
  onToggleReaction,
}: {
  message: Message;
  grouped: boolean;
  onToggleReaction: (messageId: string, emoji: string) => void;
}) {
  const author = AUTHORS[message.author];
  const isAssistant = author.id === "assistant";
  const isMe = author.id === "me";

  return (
    <Row as="li" fillWidth gap="12" paddingY={grouped ? "2" : "8"} style={{ listStyle: "none" }}>
      <Row minWidth="32" width="32" horizontal="center">
        {!grouped && (
          <Avatar
            size="m"
            value={author.initials}
            statusIndicator={author.online ? { color: "green" } : undefined}
          />
        )}
      </Row>
      <Column fillWidth gap="4">
        {!grouped && (
          <Row gap="8" vertical="center" wrap>
            <Text variant="label-strong-s" onBackground={isMe ? "neutral-strong" : "brand-medium"}>
              {author.name}
            </Text>
            {isAssistant && <Tag size="s" scheme="brand" label="AI" />}
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {message.time}
            </Text>
          </Row>
        )}
        <Text variant="body-default-s" onBackground="neutral-strong" wrap="pretty">
          {message.text}
        </Text>
        {message.reactions && message.reactions.length > 0 && (
          <Row gap="4" marginTop="4" wrap>
            {message.reactions.map((reaction) => (
              <Button
                key={reaction.emoji}
                size="s"
                variant={reaction.reacted ? "primary" : "secondary"}
                data-border="rounded"
                aria-pressed={reaction.reacted}
                aria-label={`${reaction.emoji} ${reaction.count} ${
                  reaction.count === 1 ? "reaction" : "reactions"
                }${reaction.reacted ? ", you reacted" : ""}`}
                onClick={() => onToggleReaction(message.id, reaction.emoji)}
              >
                {reaction.emoji} {reaction.count}
              </Button>
            ))}
          </Row>
        )}
      </Column>
    </Row>
  );
}

function StreamingRow({ text, done }: { text: string; done: boolean }) {
  const author = AUTHORS.assistant;
  return (
    <Row as="li" fillWidth gap="12" paddingY="8" style={{ listStyle: "none" }}>
      <Row minWidth="32" width="32" horizontal="center">
        <Avatar size="m" value={author.initials} statusIndicator={{ color: "green" }} />
      </Row>
      <Column fillWidth gap="4">
        <Row gap="8" vertical="center" wrap>
          <Text variant="label-strong-s" onBackground="brand-medium">
            {author.name}
          </Text>
          <Tag size="s" scheme="brand" label="AI" />
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {done ? "Just now" : "Typing…"}
          </Text>
        </Row>
        {text ? (
          <Text variant="body-default-s" onBackground="neutral-strong" wrap="pretty">
            {text}
            {!done && (
              <Text as="span" onBackground="brand-medium" aria-hidden="true">
                {" ▍"}
              </Text>
            )}
          </Text>
        ) : (
          <Row gap="8" vertical="center">
            <Spinner size="s" ariaLabel="Assistant is thinking" />
            <Text variant="body-default-s" onBackground="neutral-weak">
              Thinking…
            </Text>
          </Row>
        )}
      </Column>
    </Row>
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const idRef = useRef(100);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streamText, streaming]);

  const finishStream = useCallback((finalText: string) => {
    const text = finalText.trim();
    setStreaming(false);
    setStreamText("");
    if (text) {
      idRef.current += 1;
      setMessages((prev) => [
        ...prev,
        { id: `m${idRef.current}`, author: "assistant", time: formatNow(), text },
      ]);
      setAnnouncement(`Relay Assistant replied: ${text}`);
    }
  }, []);

  const startStream = useCallback(() => {
    clearTimers();
    setStreaming(true);
    setStreamText("");
    setAnnouncement("Relay Assistant is typing");

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const words = STREAM_REPLY.split(" ");
    let index = 0;
    let built = "";

    const tick = () => {
      if (index >= words.length) {
        finishStream(built);
        return;
      }
      built = built ? `${built} ${words[index]}` : words[index];
      index += 1;
      setStreamText(built);
      timersRef.current.push(window.setTimeout(tick, reduced ? 20 : 70));
    };

    // Brief "thinking" phase before tokens arrive.
    timersRef.current.push(window.setTimeout(tick, reduced ? 100 : 900));
  }, [clearTimers, finishStream]);

  const stopStream = useCallback(() => {
    clearTimers();
    setStreamText((current) => {
      finishStream(current);
      return "";
    });
  }, [clearTimers, finishStream]);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || streaming) return;
    idRef.current += 1;
    setMessages((prev) => [
      ...prev,
      { id: `m${idRef.current}`, author: "me", time: formatNow(), text },
    ]);
    setDraft("");
    startStream();
  }, [draft, streaming, startStream]);

  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id !== messageId || !m.reactions
          ? m
          : {
              ...m,
              reactions: m.reactions.map((r) =>
                r.emoji === emoji
                  ? { ...r, reacted: !r.reacted, count: r.count + (r.reacted ? -1 : 1) }
                  : r,
              ),
            },
      ),
    );
  }, []);

  // Clear-conversation command from the palette.
  useEffect(() => {
    const onClear = () => {
      clearTimers();
      setStreaming(false);
      setStreamText("");
      setMessages([]);
      setAnnouncement("Conversation cleared");
    };
    document.addEventListener("relay:clear", onClear);
    return () => document.removeEventListener("relay:clear", onClear);
  }, [clearTimers]);

  // Kbar itself binds mod+k; this focuses the composer with "/" as a second hint.
  useHotkeys(
    "/",
    (event) => {
      event.preventDefault();
      document.getElementById("chat-composer")?.focus();
    },
    { enabled: true },
  );

  const rows = useMemo(
    () =>
      messages.map((message, i) => ({
        message,
        grouped: i > 0 && messages[i - 1].author === message.author,
      })),
    [messages],
  );

  return (
    <Kbar items={COMMAND_ITEMS}>
      <VisuallyHidden as="a" focusable href="#chat-composer">
        Skip to message box
      </VisuallyHidden>

      <Column as="main" fillWidth horizontal="center" height="100dvh">
        <Column fill maxWidth={56} background="surface" borderX>
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
            <Column fillWidth gap="2" style={{ minWidth: 0 }}>
              <Row gap="8" vertical="center">
                <Text as="h1" variant="heading-strong-m" truncate>
                  # release-war-room
                </Text>
                <StatusIndicator color="green" size="s" ariaLabel="Channel is active" />
              </Row>
              <Text variant="body-default-xs" onBackground="neutral-weak" truncate>
                4 members online · Billing dashboard v2.4
              </Text>
            </Column>
            <Row gap="8" vertical="center" hide s={{ hide: false }}>
              <IconButton
                icon="search"
                variant="tertiary"
                tooltip="Command palette"
                ariaLabel="Open command palette"
                onClick={() =>
                  document.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true, bubbles: true }),
                  )
                }
              />
            </Row>
            <Row gap="8" vertical="center" s={{ hide: true }}>
              <Text variant="label-default-xs" onBackground="neutral-weak">
                Command palette
              </Text>
              <KeyTip keys="mod+k" />
            </Row>
          </Row>

          {/* Messages */}
          <Column fill position="relative" style={{ minHeight: 0 }}>
            <div
              ref={scrollRef}
              role="log"
              aria-label="Conversation"
              aria-live="off"
              aria-relevant="additions"
              tabIndex={0}
              style={{
                position: "absolute",
                inset: 0,
                overflowY: "auto",
                padding: "1rem",
              }}
            >
              {messages.length === 0 && !streaming ? (
                <Column fill center gap="8" paddingY="64">
                  <Text variant="heading-strong-s">No messages yet</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                    Say hello or press <KeyTip keys="mod+k" /> to explore commands.
                  </Text>
                </Column>
              ) : (
                <Column as="ul" fillWidth margin="0" padding="0" gap="0">
                  <Row fillWidth horizontal="center" paddingY="8" aria-hidden="true">
                    <Row gap="12" vertical="center" fillWidth>
                      <Line />
                      <Text variant="label-default-xs" onBackground="neutral-weak">
                        Today
                      </Text>
                      <Line />
                    </Row>
                  </Row>
                  {rows.map(({ message, grouped }) => (
                    <MessageRow
                      key={message.id}
                      message={message}
                      grouped={grouped}
                      onToggleReaction={toggleReaction}
                    />
                  ))}
                  {streaming && <StreamingRow text={streamText} done={false} />}
                </Column>
              )}
            </div>
            <Fade
              position="absolute"
              bottom="0"
              left="0"
              fillWidth
              height={4}
              to="top"
              base="surface"
              pointerEvents="none"
            />
          </Column>

          {/* Streaming status + composer */}
          <Column fillWidth gap="8" paddingX="12" paddingBottom="12" paddingTop="8" borderTop>
            <Row fillWidth vertical="center" gap="8" style={{ minHeight: "2rem" }}>
              {streaming ? (
                <>
                  <Spinner size="s" ariaLabel="Generating reply" />
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    Relay Assistant is writing a reply…
                  </Text>
                  <Row fillWidth horizontal="end">
                    <Button
                      size="s"
                      variant="secondary"
                      prefixIcon="close"
                      data-border="rounded"
                      onClick={stopStream}
                    >
                      Stop
                    </Button>
                  </Row>
                </>
              ) : (
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  Enter to send · Shift + Enter for a new line
                </Text>
              )}
            </Row>

            <Textarea
              id="chat-composer"
              placeholder="Message #release-war-room"
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
                  onSelect={(emoji) => setDraft((d) => d + emoji)}
                  trigger={
                    <Row themeBorder="rounded" style={{ marginLeft: "-0.25rem" }}>
                      <IconButton
                        icon="smiley"
                        variant="tertiary"
                        tooltip="Add emoji"
                        ariaLabel="Open emoji picker"
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
                    disabled={!draft.trim() || streaming}
                    onClick={send}
                  />
                </Row>
              }
            />

            <Row fillWidth horizontal="between" vertical="center" gap="8" wrap>
              <Row gap="8" vertical="center">
                <Text variant="label-default-xs" onBackground="neutral-weak">
                  Command palette
                </Text>
                <KeyTip keys="mod+k" />
              </Row>
              <Row gap="8" vertical="center">
                <Text variant="label-default-xs" onBackground="neutral-weak">
                  Focus input
                </Text>
                <KeyTip keys="/" />
              </Row>
            </Row>
          </Column>
        </Column>
      </Column>

      <VisuallyHidden as="div">
        <div role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>
      </VisuallyHidden>
    </Kbar>
  );
}
```