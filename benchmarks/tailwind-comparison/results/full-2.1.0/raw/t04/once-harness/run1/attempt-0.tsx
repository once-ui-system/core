"use client";

import {
  Avatar,
  AvatarGroup,
  Button,
  Column,
  Dialog,
  EmojiPickerDropdown,
  IconButton,
  Kbd,
  KeyTip,
  Row,
  Spinner,
  Tag,
  Text,
  Textarea,
  VisuallyHidden,
  useHotkeys,
  useReducedMotion,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ----------------------------------------------------------------------------
 * Types & placeholder content
 * -------------------------------------------------------------------------- */

type Person = {
  id: string;
  name: string;
  initials: string;
  role: string;
  status: "green" | "yellow" | "gray";
};

type Reaction = { emoji: string; count: number; reacted: boolean };

type ChatMessage = {
  id: string;
  authorId: string;
  time: string;
  text: string;
  reactions?: Reaction[];
};

type PaletteCommand = {
  id: string;
  name: string;
  hint: string;
  icon: IconName;
  keywords: string;
};

const ME: Person = {
  id: "me",
  name: "You",
  initials: "YO",
  role: "Product designer",
  status: "green",
};

const PEOPLE: Person[] = [
  { id: "amara", name: "Amara Okafor", initials: "AO", role: "Engineering lead", status: "green" },
  { id: "tomas", name: "Tomás Herrera", initials: "TH", role: "Backend engineer", status: "yellow" },
  { id: "priya", name: "Priya Raman", initials: "PR", role: "Product manager", status: "green" },
  { id: "aria", name: "Aria", initials: "AI", role: "Assistant", status: "green" },
];

const ARIA = PEOPLE[3];

const personById = (id: string): Person =>
  id === ME.id ? ME : (PEOPLE.find((p) => p.id === id) ?? ARIA);

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    authorId: "priya",
    time: "9:41 AM",
    text: "Morning all! Release 2.14 is scheduled for Thursday. Can everyone confirm their changes are merged by Wednesday evening?",
    reactions: [{ emoji: "👍", count: 3, reacted: false }],
  },
  {
    id: "m2",
    authorId: "amara",
    time: "9:44 AM",
    text: "Billing migration is merged and passing on staging. I'm running the rollback drill this afternoon, so ping me if anything looks off.",
    reactions: [
      { emoji: "🚀", count: 2, reacted: true },
      { emoji: "🙌", count: 1, reacted: false },
    ],
  },
  {
    id: "m3",
    authorId: "amara",
    time: "9:45 AM",
    text: "One more thing: the new invoice PDF layout needs a design pass before we ship.",
  },
  {
    id: "m4",
    authorId: "me",
    time: "9:52 AM",
    text: "On it. I'll share updated spacing and a dark-mode variant by lunchtime. Quick question for Aria: can you summarize what's still open for the release?",
  },
];

const STREAM_REPLY =
  "Here's where 2.14 stands. Merged: billing migration, SSO session fixes and the new onboarding checklist. Still open: the invoice PDF layout (waiting on design), two flaky end-to-end tests in checkout, and the changelog draft. The riskiest item is the checkout tests, since they block the Wednesday code freeze. I'd suggest assigning them to Tomás today and moving the changelog to Priya.";

const COMMANDS: PaletteCommand[] = [
  { id: "c1", name: "Jump to #release-2-14", hint: "Channel", icon: "chat", keywords: "channel release go" },
  { id: "c2", name: "Search messages", hint: "Search", icon: "search", keywords: "find history" },
  { id: "c3", name: "Summarize this thread", hint: "Aria", icon: "sparkle", keywords: "ai summary tldr" },
  { id: "c4", name: "Invite a teammate", hint: "People", icon: "person", keywords: "add member invite" },
  { id: "c5", name: "Mute notifications", hint: "Settings", icon: "bell", keywords: "quiet silence" },
];

const TYPING_DELAY_MS = 1100;
const TOKEN_INTERVAL_MS = 38;

/* ----------------------------------------------------------------------------
 * Small presentational pieces
 * -------------------------------------------------------------------------- */

function TypingDots() {
  return (
    <Row gap="4" vertical="center" aria-hidden="true" height="16">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="chat-dot"
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--neutral-on-background-weak)",
            display: "inline-block",
            animation: `chat-bounce 1.2s ${i * 0.15}s infinite ease-in-out`,
          }}
        />
      ))}
    </Row>
  );
}

function MessageRow({
  message,
  grouped,
  streaming,
  onToggleReaction,
}: {
  message: ChatMessage;
  grouped: boolean;
  streaming?: boolean;
  onToggleReaction: (messageId: string, emoji: string) => void;
}) {
  const author = personById(message.authorId);
  const isMe = author.id === ME.id;

  return (
    <Row
      as="li"
      fillWidth
      gap="12"
      vertical="start"
      paddingY={grouped ? "2" : "8"}
      style={{ listStyle: "none" }}
    >
      <Row minWidth={32} width={32} horizontal="center" flex={0}>
        {!grouped && (
          <Avatar
            size="s"
            value={author.initials}
            statusIndicator={{ color: author.status }}
          />
        )}
      </Row>
      <Column fillWidth gap="4">
        {!grouped && (
          <Row gap="8" vertical="center" wrap>
            <Text variant="label-strong-s" onBackground={isMe ? "accent-medium" : "brand-medium"}>
              {author.name}
            </Text>
            {author.id === ARIA.id && (
              <Tag size="s" scheme="brand" prefixIcon="sparkle">
                AI
              </Tag>
            )}
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {message.time}
            </Text>
          </Row>
        )}
        <Text
          variant="body-default-s"
          onBackground="neutral-strong"
          wrap="pretty"
          style={{ overflowWrap: "anywhere" }}
        >
          {message.text}
          {streaming && (
            <span
              aria-hidden="true"
              className="chat-caret"
              style={{
                display: "inline-block",
                width: 2,
                height: "1em",
                marginLeft: 2,
                verticalAlign: "text-bottom",
                background: "var(--brand-solid-strong)",
                animation: "chat-blink 1s steps(2, start) infinite",
              }}
            />
          )}
        </Text>
        {message.reactions && message.reactions.length > 0 && (
          <Row gap="4" wrap marginTop="4">
            {message.reactions.map((r) => (
              <Row
                key={r.emoji}
                fit
                background={r.reacted ? "brand-alpha-medium" : undefined}
                radius="m"
              >
                <Button
                  size="s"
                  variant="secondary"
                  data-scaling="90"
                  data-border="rounded"
                  aria-pressed={r.reacted}
                  aria-label={`${r.emoji} ${r.count} ${r.count === 1 ? "reaction" : "reactions"}${
                    r.reacted ? ", you reacted" : ""
                  }`}
                  onClick={() => onToggleReaction(message.id, r.emoji)}
                >
                  <Text marginRight="2">
                    {r.emoji} {r.count}
                  </Text>
                </Button>
              </Row>
            ))}
          </Row>
        )}
      </Column>
    </Row>
  );
}

/* ----------------------------------------------------------------------------
 * Command palette (hint + lightweight dialog)
 * -------------------------------------------------------------------------- */

function CommandPalette({
  open,
  onClose,
  onRun,
}: {
  open: boolean;
  onClose: () => void;
  onRun: (command: PaletteCommand) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((c) => `${c.name} ${c.keywords}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Command palette"
      description="Type to filter, then choose a command."
    >
      <Column gap="12" fillWidth>
        <label htmlFor="palette-input">
          <VisuallyHidden>Search commands</VisuallyHidden>
        </label>
        <input
          id="palette-input"
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) onRun(results[0]);
          }}
          placeholder="Type a command or search…"
          autoComplete="off"
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-m)",
            border: "1px solid var(--neutral-alpha-medium)",
            background: "var(--surface-background)",
            color: "var(--neutral-on-background-strong)",
            font: "inherit",
            outlineOffset: 2,
          }}
        />
        <Column as="ul" gap="2" fillWidth style={{ margin: 0, padding: 0 }} aria-label="Commands">
          {results.length === 0 && (
            <Text as="li" variant="body-default-s" onBackground="neutral-weak" style={{ listStyle: "none" }} padding="12">
              No commands match “{query}”.
            </Text>
          )}
          {results.map((c) => (
            <li key={c.id} style={{ listStyle: "none" }}>
              <Button
                fillWidth
                variant="tertiary"
                size="m"
                horizontal="between"
                prefixIcon={c.icon}
                data-border="rounded"
                onClick={() => onRun(c)}
              >
                <Row fillWidth horizontal="between" gap="16">
                  <Text variant="label-default-s">{c.name}</Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    {c.hint}
                  </Text>
                </Row>
              </Button>
            </li>
          ))}
        </Column>
      </Column>
    </Dialog>
  );
}

/* ----------------------------------------------------------------------------
 * Page
 * -------------------------------------------------------------------------- */

export default function Page() {
  const { shouldAnimate } = useReducedMotion();

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState<"idle" | "typing" | "streaming">("idle");
  const [streamText, setStreamText] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const nextId = useRef(100);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    setPaletteOpen((o) => !o);
  }, { allowWhileTyping: true });

  // Keep the newest content in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: shouldAnimate ? "smooth" : "auto" });
  }, [messages, streamText, phase, shouldAnimate]);

  const startAssistantReply = useCallback(() => {
    setPhase("typing");
    setStreamText("");
    setAnnouncement("Aria is typing");

    const tokens = STREAM_REPLY.split(/(\s+)/).filter(Boolean);

    const begin = window.setTimeout(() => {
      setPhase("streaming");
      let index = 0;

      const step = () => {
        index += 1;
        setStreamText(tokens.slice(0, index).join(""));
        if (index < tokens.length) {
          timers.current.push(window.setTimeout(step, shouldAnimate ? TOKEN_INTERVAL_MS : 0));
        } else {
          const id = `m${nextId.current++}`;
          setMessages((prev) => [
            ...prev,
            { id, authorId: ARIA.id, time: "9:53 AM", text: STREAM_REPLY },
          ]);
          setStreamText("");
          setPhase("idle");
          setAnnouncement("Aria sent a reply");
        }
      };
      step();
    }, TYPING_DELAY_MS);

    timers.current.push(begin);
  }, [shouldAnimate]);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || phase !== "idle") return;
    const id = `m${nextId.current++}`;
    setMessages((prev) => [...prev, { id, authorId: ME.id, time: "9:53 AM", text }]);
    setDraft("");
    startAssistantReply();
  }, [draft, phase, startAssistantReply]);

  const stop = useCallback(() => {
    clearTimers();
    if (streamText) {
      const id = `m${nextId.current++}`;
      setMessages((prev) => [
        ...prev,
        { id, authorId: ARIA.id, time: "9:53 AM", text: `${streamText.trimEnd()}…` },
      ]);
    }
    setStreamText("");
    setPhase("idle");
    setAnnouncement("Reply stopped");
  }, [clearTimers, streamText]);

  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id !== messageId
          ? m
          : {
              ...m,
              reactions: m.reactions?.map((r) =>
                r.emoji === emoji
                  ? { ...r, reacted: !r.reacted, count: r.count + (r.reacted ? -1 : 1) }
                  : r,
              ),
            },
      ),
    );
  }, []);

  const runCommand = useCallback((command: PaletteCommand) => {
    setPaletteOpen(false);
    setAnnouncement(`${command.name} selected`);
  }, []);

  const busy = phase !== "idle";

  const streamingMessage: ChatMessage = {
    id: "streaming",
    authorId: ARIA.id,
    time: "Now",
    text: streamText,
  };

  return (
    <Column as="main" fillWidth horizontal="center" style={{ height: "100dvh" }}>
      <style>{`
        @keyframes chat-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: .5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes chat-blink { to { visibility: hidden; } }
        @media (prefers-reduced-motion: reduce) {
          .chat-dot, .chat-caret { animation: none !important; }
        }
      `}</style>

      <Column fill maxWidth="m" background="surface" borderX>
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
        >
          <Column gap="4" flex={1}>
            <Text as="h1" variant="heading-strong-m">
              # release-2-14
            </Text>
            <Text variant="body-default-xs" onBackground="neutral-weak" truncate>
              4 members · Coordinating Thursday’s release
            </Text>
          </Column>

          <Row gap="12" vertical="center" fit>
            <Row s={{ hide: true }} fit>
              <AvatarGroup
                size="s"
                avatars={PEOPLE.map((p) => ({ value: p.initials }))}
              />
            </Row>
            <Button
              variant="secondary"
              size="s"
              data-border="rounded"
              prefixIcon="search"
              onClick={() => setPaletteOpen(true)}
              aria-haspopup="dialog"
              aria-label="Open command palette"
            >
              <Row gap="8" vertical="center">
                <Row xs={{ hide: true }} fit>
                  <Text variant="label-default-s">Commands</Text>
                </Row>
                <Row s={{ hide: true }} fit>
                  <KeyTip keys="mod+k" />
                </Row>
              </Row>
            </Button>
          </Row>
        </Row>

        {/* Messages */}
        <Column fill style={{ minHeight: 0 }}>
          <div
            ref={scrollRef}
            role="log"
            aria-live="off"
            aria-label="Conversation"
            tabIndex={0}
            style={{ flex: 1, overflowY: "auto", padding: "1rem" }}
          >
            <Column as="ul" fillWidth gap="0" style={{ margin: 0, padding: 0 }}>
              <Row as="li" fillWidth horizontal="center" paddingY="8" style={{ listStyle: "none" }}>
                <Tag size="s" label="Today" />
              </Row>

              {messages.map((m, i) => (
                <MessageRow
                  key={m.id}
                  message={m}
                  grouped={i > 0 && messages[i - 1].authorId === m.authorId}
                  onToggleReaction={toggleReaction}
                />
              ))}

              {phase === "typing" && (
                <Row as="li" fillWidth gap="12" vertical="center" paddingY="8" style={{ listStyle: "none" }}>
                  <Row width={32} minWidth={32} horizontal="center" flex={0}>
                    <Avatar size="s" value={ARIA.initials} statusIndicator={{ color: "green" }} />
                  </Row>
                  <Row gap="8" vertical="center" background="neutral-alpha-weak" radius="l" paddingX="12" paddingY="8" fit>
                    <TypingDots />
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      Aria is thinking…
                    </Text>
                  </Row>
                </Row>
              )}

              {phase === "streaming" && (
                <MessageRow
                  message={streamingMessage}
                  grouped={false}
                  streaming
                  onToggleReaction={toggleReaction}
                />
              )}
            </Column>
          </div>
        </Column>

        {/* Composer */}
        <Column fillWidth paddingX="12" paddingTop="8" paddingBottom="12" gap="8" borderTop>
          {busy && (
            <Row fillWidth horizontal="between" vertical="center" paddingX="4">
              <Row gap="8" vertical="center">
                <Spinner size="xs" ariaLabel="Aria is responding" />
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {phase === "typing" ? "Aria is preparing a reply…" : "Aria is writing…"}
                </Text>
              </Row>
              <Button size="s" variant="tertiary" data-border="rounded" prefixIcon="close" onClick={stop}>
                Stop
              </Button>
            </Row>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <Textarea
              id="chat-composer"
              placeholder="Message #release-2-14"
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
                    <IconButton
                      icon="smiley"
                      variant="tertiary"
                      size="m"
                      tooltip="Add emoji"
                      ariaLabel="Add emoji"
                    />
                  }
                />
              }
              suffix={
                <IconButton
                  icon="send"
                  size="m"
                  ariaLabel="Send message"
                  tooltip="Send"
                  disabled={!draft.trim() || busy}
                  onClick={send}
                />
              }
            />
          </form>

          <Row fillWidth horizontal="between" vertical="center" paddingX="4" gap="8" wrap>
            <Row gap="4" vertical="center" s={{ hide: true }}>
              <Kbd>Enter</Kbd>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                to send
              </Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                ·
              </Text>
              <Kbd>Shift</Kbd>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                +
              </Text>
              <Kbd>Enter</Kbd>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                for a new line
              </Text>
            </Row>
            <Row gap="4" vertical="center">
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Press
              </Text>
              <Kbd>⌘ K</Kbd>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                or
              </Text>
              <Kbd>Ctrl K</Kbd>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                for commands
              </Text>
            </Row>
          </Row>
        </Column>
      </Column>

      <VisuallyHidden>
        <div role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>
      </VisuallyHidden>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onRun={runCommand} />
    </Column>
  );
}
