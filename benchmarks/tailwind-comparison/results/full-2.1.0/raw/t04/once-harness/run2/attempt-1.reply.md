```tsx
"use client";

import {
  Avatar,
  Button,
  Column,
  Dialog,
  EmojiPickerDropdown,
  IconButton,
  KeyTip,
  Line,
  Row,
  Spinner,
  StatusIndicator,
  Tag,
  Text,
  Textarea,
  useHotkeys,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Author = {
  id: string;
  name: string;
  initials: string;
  role: string;
  isAssistant?: boolean;
};

type Reaction = { emoji: string; count: number; reacted?: boolean };

type Message = {
  id: string;
  authorId: string;
  time: string;
  text: string;
  reactions?: Reaction[];
};

type PresenceColor = "green" | "gray" | "yellow" | "red";

const AUTHORS: Record<string, Author> = {
  maya: { id: "maya", name: "Maya Okafor", initials: "MO", role: "Product designer" },
  daniel: { id: "daniel", name: "Daniel Reyes", initials: "DR", role: "Staff engineer" },
  priya: { id: "priya", name: "Priya Raman", initials: "PR", role: "Product manager" },
  atlas: { id: "atlas", name: "Atlas", initials: "AI", role: "Workspace assistant", isAssistant: true },
  me: { id: "me", name: "You", initials: "YO", role: "Engineering" },
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    authorId: "priya",
    time: "9:41 AM",
    text: "Morning all. The 4.2 release candidate is cut. Can someone confirm the checkout flow is behaving on the staging build before we send it to QA?",
    reactions: [{ emoji: "👀", count: 3 }],
  },
  {
    id: "m2",
    authorId: "daniel",
    time: "9:44 AM",
    text: "Ran through it twice. Card payments are fine, but the saved-address picker flickers on Safari when you switch between two addresses quickly. Looks like a re-render loop in the selector.",
    reactions: [
      { emoji: "🐛", count: 2, reacted: true },
      { emoji: "👍", count: 1 },
    ],
  },
  {
    id: "m3",
    authorId: "maya",
    time: "9:47 AM",
    text: "That matches what I saw in the design review. I can adjust the transition so it doesn't animate height while the list is still loading. That should hide it even before the fix lands.",
  },
  {
    id: "m4",
    authorId: "me",
    time: "9:52 AM",
    text: "Thanks both. I'll take the selector fix and push a patch to the release branch this morning. @Atlas can you summarize the open blockers for 4.2?",
  },
  {
    id: "m5",
    authorId: "atlas",
    time: "9:52 AM",
    text: "Here is where 4.2 stands: 2 blockers open, 11 resolved since yesterday.\n\n1. Saved-address selector re-render loop (Safari), assigned to you.\n2. Receipt email missing the VAT line for EU orders, assigned to Priya.\n\nEverything else on the checklist is green. I'll post again when either blocker closes.",
    reactions: [{ emoji: "🙌", count: 4, reacted: true }],
  },
];

const AUTO_REPLY =
  "Got it. I've noted that against the 4.2 checklist. The selector patch is the only item gating QA now, so I'll flag the team as soon as it's merged and the staging build is green.";

type Command = {
  id: string;
  label: string;
  hint: string;
  icon: IconName;
  keys?: string;
};

const COMMANDS: Command[] = [
  { id: "new", label: "Start a new thread", hint: "Open an empty conversation", icon: "plus", keys: "mod+n" },
  { id: "search", label: "Search messages", hint: "Find anything in #release-4-2", icon: "search", keys: "mod+f" },
  { id: "summary", label: "Summarize this channel", hint: "Ask Atlas for a recap", icon: "sparkle" },
  { id: "mute", label: "Mute notifications", hint: "Pause alerts for one hour", icon: "bell" },
  { id: "settings", label: "Channel settings", hint: "Members, topic and integrations", icon: "settings" },
];

const MEMBERS: { author: Author; status: PresenceColor }[] = [
  { author: AUTHORS.maya, status: "green" },
  { author: AUTHORS.daniel, status: "yellow" },
  { author: AUTHORS.priya, status: "green" },
  { author: AUTHORS.atlas, status: "green" },
];

function nowLabel(): string {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function MessageBody({ text }: { text: string }) {
  const paragraphs = text.split("\n\n");
  return (
    <Column gap="8">
      {paragraphs.map((p, i) => (
        <Text key={i} variant="body-default-m" style={{ whiteSpace: "pre-line" }}>
          {p}
        </Text>
      ))}
    </Column>
  );
}

function MessageItem({ message, grouped }: { message: Message; grouped: boolean }) {
  const author = AUTHORS[message.authorId];
  const isMe = author.id === "me";
  return (
    <Row
      as="li"
      fillWidth
      gap="12"
      paddingTop={grouped ? "0" : "8"}
      horizontal={isMe ? "end" : "start"}
      style={{ listStyle: "none" }}
    >
      {!isMe && (
        <Column width={32} minWidth={32} horizontal="center">
          {!grouped && <Avatar size="m" value={author.initials} />}
        </Column>
      )}
      <Column gap="4" maxWidth={40} style={{ minWidth: 0 }} horizontal={isMe ? "end" : "start"}>
        {!grouped && (
          <Row gap="8" vertical="center">
            <Text variant="label-strong-s">{author.name}</Text>
            {author.isAssistant && (
              <Tag size="s" scheme="brand">
                AI
              </Tag>
            )}
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {message.time}
            </Text>
          </Row>
        )}
        <Column
          paddingX="16"
          paddingY="12"
          radius="l"
          background={isMe ? "brand-alpha-weak" : "surface"}
          border
        >
          <MessageBody text={message.text} />
        </Column>
        {message.reactions && message.reactions.length > 0 && (
          <Row gap="4" wrap>
            {message.reactions.map((r) => (
              <Row
                key={r.emoji}
                background={r.reacted ? "brand-alpha-medium" : "neutral-alpha-weak"}
                radius="full"
                paddingX="8"
                paddingY="2"
                gap="4"
                vertical="center"
                role="img"
                aria-label={`${r.count} ${r.count === 1 ? "reaction" : "reactions"}: ${r.emoji}${r.reacted ? ", including yours" : ""}`}
              >
                <Text variant="body-default-s" aria-hidden="true">
                  {r.emoji}
                </Text>
                <Text variant="label-default-xs" aria-hidden="true">
                  {r.count}
                </Text>
              </Row>
            ))}
          </Row>
        )}
      </Column>
    </Row>
  );
}

function StreamingIndicator({ label }: { label: string }) {
  return (
    <Row as="li" fillWidth gap="12" paddingTop="8" style={{ listStyle: "none" }}>
      <Column width={32} minWidth={32} horizontal="center">
        <Avatar size="m" value={AUTHORS.atlas.initials} />
      </Column>
      <Column gap="4">
        <Row gap="8" vertical="center">
          <Text variant="label-strong-s">{AUTHORS.atlas.name}</Text>
          <Tag size="s" scheme="brand">
            AI
          </Tag>
        </Row>
        <Row
          gap="12"
          vertical="center"
          paddingX="16"
          paddingY="12"
          radius="l"
          background="surface"
          border
        >
          <Spinner size="s" ariaLabel={label} />
          <Text variant="body-default-s" onBackground="neutral-weak">
            {label}
          </Text>
        </Row>
      </Column>
    </Row>
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [membersOpen, setMembersOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useHotkeys(
    "mod+k",
    (event) => {
      event.preventDefault();
      setPaletteOpen((open) => !open);
    },
    { allowWhileTyping: true },
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streaming]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || streaming) return;
    const id = `u${Date.now()}`;
    setMessages((prev) => [...prev, { id, authorId: "me", time: nowLabel(), text }]);
    setDraft("");
    setStreaming(true);
    setAnnouncement("Atlas is typing a reply");
    timerRef.current = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `a${Date.now()}`, authorId: "atlas", time: nowLabel(), text: AUTO_REPLY },
      ]);
      setStreaming(false);
      setAnnouncement("Atlas replied");
      timerRef.current = null;
    }, 2600);
  }, [draft, streaming]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const runCommand = (command: Command) => {
    setPaletteOpen(false);
    setAnnouncement(`${command.label} selected`);
    if (command.id === "summary") {
      setDraft("@Atlas can you summarize this channel?");
    }
  };

  const grouped = useMemo(
    () => messages.map((m, i) => i > 0 && messages[i - 1].authorId === m.authorId),
    [messages],
  );

  return (
    <Column as="main" fillWidth horizontal="center" style={{ height: "100dvh" }}>
      <Row fill maxWidth="xl" style={{ minHeight: 0 }}>
        {/* Sidebar: members (hidden on small screens) */}
        <Column
          as="aside"
          aria-label="Channel members"
          width={20}
          minWidth={20}
          paddingX="16"
          paddingY="20"
          gap="20"
          borderRight
          background="surface"
          s={{ hide: true }}
          m={{ width: 16, minWidth: 16 }}
        >
          <Column gap="4">
            <Text variant="label-default-xs" onBackground="neutral-weak">
              Channel
            </Text>
            <Text variant="heading-strong-s"># release-4-2</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Coordinating the 4.2 checkout release.
            </Text>
          </Column>
          <Line />
          <Column as="ul" gap="12" margin="0" padding="0" aria-label="Members">
            {MEMBERS.map(({ author, status }) => (
              <Row
                as="li"
                key={author.id}
                gap="12"
                vertical="center"
                style={{ listStyle: "none" }}
              >
                <Avatar
                  size="s"
                  value={author.initials}
                  statusIndicator={{ color: status }}
                />
                <Column style={{ minWidth: 0 }}>
                  <Text variant="label-default-s" truncate>
                    {author.name}
                  </Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak" truncate>
                    {author.role}
                  </Text>
                </Column>
              </Row>
            ))}
          </Column>
        </Column>

        {/* Conversation */}
        <Column fill style={{ minWidth: 0 }}>
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
            <Column fillWidth style={{ minWidth: 0 }}>
              <Row gap="8" vertical="center">
                <Text variant="heading-strong-s" as="h1" truncate>
                  # release-4-2
                </Text>
                <StatusIndicator size="s" color="green" ariaLabel="3 members online" />
              </Row>
              <Text variant="body-default-xs" onBackground="neutral-weak" truncate>
                4 members · 3 online
              </Text>
            </Column>
            <Button
              variant="secondary"
              size="s"
              prefixIcon="search"
              onClick={() => setPaletteOpen(true)}
              aria-haspopup="dialog"
              aria-label="Open command palette"
            >
              <Row gap="8" vertical="center">
                <Row s={{ hide: true }}>
                  <Text variant="label-default-s">Commands</Text>
                </Row>
                <Row s={{ hide: true }} aria-hidden="true">
                  <KeyTip keys="mod+k" />
                </Row>
              </Row>
            </Button>
            <Row hide s={{ hide: false }}>
              <IconButton
                icon="person"
                variant="tertiary"
                ariaLabel="Show members"
                tooltip="Members"
                onClick={() => setMembersOpen((v) => !v)}
              />
            </Row>
          </Row>

          {membersOpen && (
            <Row
              fillWidth
              paddingX="16"
              paddingY="8"
              gap="8"
              wrap
              borderBottom
              background="neutral-alpha-weak"
            >
              {MEMBERS.map(({ author, status }) => (
                <Row key={author.id} gap="8" vertical="center">
                  <Avatar size="xs" value={author.initials} statusIndicator={{ color: status }} />
                  <Text variant="label-default-xs">{author.name}</Text>
                </Row>
              ))}
            </Row>
          )}

          {/* Message list */}
          <Column fill style={{ minHeight: 0 }}>
            <div
              ref={scrollRef}
              tabIndex={0}
              role="region"
              aria-label="Conversation messages"
              style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
            >
              <Column
                as="ul"
                margin="0"
                gap="4"
                paddingX="16"
                paddingY="24"
                style={{ padding: undefined }}
              >
                <Row horizontal="center" paddingBottom="16" style={{ listStyle: "none" }}>
                  <Text variant="label-default-xs" onBackground="neutral-weak">
                    Today
                  </Text>
                </Row>
                {messages.map((m, i) => (
                  <MessageItem key={m.id} message={m} grouped={grouped[i]} />
                ))}
                {streaming && <StreamingIndicator label="Atlas is writing a reply…" />}
              </Column>
            </div>
          </Column>

          {/* Input bar */}
          <Column paddingX="16" paddingBottom="16" paddingTop="8" gap="8" borderTop background="page">
            <Textarea
              id="chat-input"
              placeholder="Message #release-4-2"
              lines={1}
              resize="none"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Message"
              prefix={
                <EmojiPickerDropdown
                  onSelect={(emoji) => setDraft((d) => d + emoji)}
                  trigger={
                    <IconButton
                      icon="smiley"
                      variant="tertiary"
                      ariaLabel="Add emoji"
                      tooltip="Add emoji"
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
            <Row gap="16" vertical="center" wrap>
              <Row gap="4" vertical="center">
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  Press
                </Text>
                <KeyTip keys="enter" />
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  to send,
                </Text>
                <KeyTip keys="shift+enter" />
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  for a new line
                </Text>
              </Row>
              <Row gap="4" vertical="center" s={{ hide: true }}>
                <KeyTip keys="mod+k" />
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  opens the command palette
                </Text>
              </Row>
            </Row>
          </Column>
        </Column>
      </Row>

      <div
        role="status"
        aria-live="polite"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        {announcement}
      </div>

      <Dialog
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        title="Command palette"
        description="Pick an action to run in this channel."
      >
        <Column as="ul" margin="0" padding="0" gap="4" fillWidth>
          {COMMANDS.map((command) => (
            <Row as="li" key={command.id} fillWidth style={{ listStyle: "none" }}>
              <Button
                variant="tertiary"
                fillWidth
                horizontal="between"
                prefixIcon={command.icon}
                onClick={() => runCommand(command)}
              >
                <Row fillWidth gap="16" vertical="center" horizontal="between">
                  <Column horizontal="start">
                    <Text variant="label-default-s">{command.label}</Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {command.hint}
                    </Text>
                  </Column>
                  {command.keys && <KeyTip keys={command.keys} />}
                </Row>
              </Button>
            </Row>
          ))}
        </Column>
      </Dialog>
    </Column>
  );
}
```