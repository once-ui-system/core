"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Avatar, Column, Flex, Heading, Row, Text } from "@once-ui-system/core";

type Author = {
  id: string;
  name: string;
  role: string;
  initials: string;
  hue: number;
};

type Message = {
  id: string;
  authorId: string;
  time: string;
  text: string;
  reactions?: { emoji: string; count: number }[];
};

const AUTHORS: Record<string, Author> = {
  me: { id: "me", name: "You", role: "Product designer", initials: "YO", hue: 210 },
  maya: { id: "maya", name: "Maya Okafor", role: "Engineering lead", initials: "MO", hue: 340 },
  jonas: { id: "jonas", name: "Jonas Lindqvist", role: "Backend engineer", initials: "JL", hue: 150 },
  aria: { id: "aria", name: "Aria", role: "AI assistant", initials: "AI", hue: 270 },
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    authorId: "maya",
    time: "09:12",
    text: "Morning all! The checkout redesign is on staging now. Could someone give the address form a once-over before standup?",
    reactions: [
      { emoji: "👀", count: 2 },
      { emoji: "🚀", count: 3 },
    ],
  },
  {
    id: "m2",
    authorId: "jonas",
    time: "09:14",
    text: "On it. I noticed the postcode validation rejects UK formats with a space, so I'm pushing a fix to the regex in a few minutes.",
  },
  {
    id: "m3",
    authorId: "me",
    time: "09:16",
    text: "Thanks Jonas. I'll check the spacing on mobile and update the Figma file with the final error states.",
    reactions: [{ emoji: "👍", count: 1 }],
  },
  {
    id: "m4",
    authorId: "aria",
    time: "09:18",
    text: "Summary so far: 1 open bug (postcode validation), 1 design follow-up (mobile spacing). Both are tagged for today's release candidate.",
  },
  {
    id: "m5",
    authorId: "maya",
    time: "09:21",
    text: "Perfect. Aria, can you draft the release notes once those two are merged?",
  },
];

const STREAM_REPLY =
  "Absolutely. Here's a first draft: Checkout now supports saved addresses, clearer inline errors and a faster mobile layout. UK postcodes with spaces are now accepted. I'll refresh the draft when both fixes are merged.";

const EMOJIS = [
  "😀", "😂", "😍", "🥳", "😎", "🤔", "😅", "🙌",
  "👍", "👏", "🙏", "💪", "🔥", "✨", "🎉", "🚀",
  "❤️", "💡", "✅", "👀", "☕", "🐛", "📌", "🎯",
];

const COMMANDS = [
  { id: "c1", label: "Summarize this thread", hint: "/summarize" },
  { id: "c2", label: "Draft release notes", hint: "/release" },
  { id: "c3", label: "Assign a follow-up", hint: "/assign" },
  { id: "c4", label: "Search messages", hint: "/search" },
  { id: "c5", label: "Clear conversation", hint: "/clear" },
];

const STYLES = `
.chat-root { height: 100dvh; display: flex; flex-direction: column; max-width: 960px; margin: 0 auto; width: 100%; }
.chat-scroll { flex: 1; overflow-y: auto; padding: 16px; scroll-behavior: smooth; }
.chat-msg { display: flex; gap: 12px; margin-bottom: 18px; max-width: 100%; }
.chat-msg.mine { flex-direction: row-reverse; }
.chat-bubble { padding: 10px 14px; border-radius: 16px; line-height: 1.5; font-size: 15px; word-break: break-word; border: 1px solid var(--neutral-alpha-medium); background: var(--surface-background); color: var(--neutral-on-background-strong); }
.chat-msg.mine .chat-bubble { background: var(--brand-solid-medium); color: var(--brand-on-solid-strong); border-color: transparent; }
.chat-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; max-width: min(560px, 85%); }
.chat-msg.mine .chat-body { align-items: flex-end; }
.chat-meta { display: flex; gap: 8px; align-items: baseline; font-size: 12px; color: var(--neutral-on-background-weak); }
.chat-meta strong { color: var(--neutral-on-background-strong); font-size: 13px; }
.chat-reactions { display: flex; gap: 6px; flex-wrap: wrap; }
.chat-chip { font: inherit; font-size: 13px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--neutral-alpha-medium); background: transparent; color: var(--neutral-on-background-strong); cursor: pointer; }
.chat-chip:hover { background: var(--neutral-alpha-weak); }
.chat-dots { display: inline-flex; gap: 4px; align-items: center; height: 14px; }
.chat-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--neutral-on-background-weak); animation: chat-bounce 1.2s infinite ease-in-out; }
.chat-dots span:nth-child(2) { animation-delay: 0.15s; }
.chat-dots span:nth-child(3) { animation-delay: 0.3s; }
@keyframes chat-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }
.chat-caret { display: inline-block; width: 2px; height: 1em; background: currentColor; margin-left: 2px; vertical-align: text-bottom; animation: chat-blink 1s steps(2) infinite; }
@keyframes chat-blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .chat-dots span, .chat-caret { animation: none; }
  .chat-scroll { scroll-behavior: auto; }
}
.chat-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--neutral-alpha-medium); }
.chat-btn { font: inherit; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 10px; border: 1px solid var(--neutral-alpha-medium); background: var(--surface-background); color: var(--neutral-on-background-strong); cursor: pointer; padding: 0 12px; height: 40px; min-width: 40px; }
.chat-btn:hover { background: var(--neutral-alpha-weak); }
.chat-btn:focus-visible, .chat-chip:focus-visible, .chat-input:focus-visible, .chat-cmd-item:focus-visible, .chat-emoji:focus-visible { outline: 2px solid var(--brand-solid-strong); outline-offset: 2px; }
.chat-btn.primary { background: var(--brand-solid-medium); color: var(--brand-on-solid-strong); border-color: transparent; }
.chat-btn.primary:disabled { opacity: 0.5; cursor: not-allowed; }
.chat-kbd { font-family: var(--font-code); font-size: 12px; padding: 2px 6px; border-radius: 6px; border: 1px solid var(--neutral-alpha-medium); background: var(--neutral-alpha-weak); color: var(--neutral-on-background-weak); }
.chat-composer { padding: 12px 16px 16px; border-top: 1px solid var(--neutral-alpha-medium); position: relative; }
.chat-form { display: flex; gap: 8px; align-items: flex-end; }
.chat-input { flex: 1; font: inherit; font-size: 15px; resize: none; min-height: 40px; max-height: 140px; padding: 9px 12px; border-radius: 12px; border: 1px solid var(--neutral-alpha-strong); background: var(--surface-background); color: var(--neutral-on-background-strong); line-height: 1.4; }
.chat-hint { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-top: 8px; font-size: 12px; color: var(--neutral-on-background-weak); }
.chat-popover { position: absolute; bottom: calc(100% - 4px); left: 16px; right: 16px; max-width: 340px; padding: 10px; border-radius: 14px; border: 1px solid var(--neutral-alpha-medium); background: var(--surface-background); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; z-index: 5; }
.chat-emoji { font: inherit; font-size: 20px; height: 36px; border: none; background: transparent; border-radius: 8px; cursor: pointer; }
.chat-emoji:hover { background: var(--neutral-alpha-weak); }
.chat-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: flex-start; justify-content: center; padding: 12vh 16px 16px; z-index: 50; }
.chat-palette { width: 100%; max-width: 520px; border-radius: 16px; border: 1px solid var(--neutral-alpha-medium); background: var(--surface-background); overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35); }
.chat-palette input { width: 100%; font: inherit; font-size: 16px; padding: 14px 16px; border: none; border-bottom: 1px solid var(--neutral-alpha-medium); background: transparent; color: var(--neutral-on-background-strong); }
.chat-palette input:focus-visible { outline: 2px solid var(--brand-solid-strong); outline-offset: -2px; }
.chat-cmd-item { font: inherit; width: 100%; display: flex; justify-content: space-between; gap: 12px; align-items: center; padding: 10px 16px; border: none; background: transparent; color: var(--neutral-on-background-strong); cursor: pointer; text-align: left; }
.chat-cmd-item:hover { background: var(--neutral-alpha-weak); }
.chat-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.chat-hide-sm { display: none; }
@media (min-width: 640px) { .chat-hide-sm { display: inline; } .chat-scroll { padding: 24px; } }
`;

function MessageAvatar({ author }: { author: Author }) {
  return (
    <Avatar
      size="m"
      value={author.initials}
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    />
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [announce, setAnnounce] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<number[]>([]);
  const idCounter = useRef(100);
  const paletteTitleId = useId();
  const emojiPanelId = useId();

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Auto-scroll on new content
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streamText, streaming]);

  // Global shortcut for the command palette
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
        setEmojiOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (paletteOpen) {
      setQuery("");
      paletteInputRef.current?.focus();
    }
  }, [paletteOpen]);

  const nextId = () => `m${++idCounter.current}`;

  const startStream = useCallback(() => {
    setStreaming(true);
    setStreamText("");
    const words = STREAM_REPLY.split(" ");
    let i = 0;
    const tick = () => {
      i += 1;
      setStreamText(words.slice(0, i).join(" "));
      if (i < words.length) {
        timersRef.current.push(window.setTimeout(tick, 70));
      } else {
        timersRef.current.push(
          window.setTimeout(() => {
            const now = new Date();
            const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
            setMessages((prev) => [
              ...prev,
              { id: `m${++idCounter.current}`, authorId: "aria", time, text: STREAM_REPLY },
            ]);
            setStreaming(false);
            setStreamText("");
            setAnnounce("Aria replied.");
          }, 200),
        );
      }
    };
    // Initial "thinking" phase with dots only
    timersRef.current.push(window.setTimeout(tick, 1400));
  }, []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      setMessages((prev) => [...prev, { id: nextId(), authorId: "me", time, text: trimmed }]);
      setDraft("");
      setEmojiOpen(false);
      setAnnounce("Message sent. Aria is typing.");
      startStream();
    },
    [streaming, startStream],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(draft);
    }
  };

  const addEmoji = (emoji: string) => {
    setDraft((d) => d + emoji);
    inputRef.current?.focus();
  };

  const runCommand = (hint: string) => {
    setPaletteOpen(false);
    if (hint === "/clear") {
      clearTimers();
      setStreaming(false);
      setStreamText("");
      setMessages([]);
      setAnnounce("Conversation cleared.");
    } else {
      setDraft(`${hint} `);
    }
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const filtered = useMemo(
    () =>
      COMMANDS.filter((c) =>
        `${c.label} ${c.hint}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );

  return (
    <Flex fillWidth horizontal="center" background="page">
      <style>{STYLES}</style>
      <main className="chat-root" aria-label="Team chat">
        <header className="chat-header">
          <Row gap="12" vertical="center" style={{ minWidth: 0 }}>
            <Column gap="2" style={{ minWidth: 0 }}>
              <Heading as="h1" variant="heading-strong-m">
                # checkout-redesign
              </Heading>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                4 members · 3 online
              </Text>
            </Column>
          </Row>
          <Row gap="12" vertical="center">
            <Row gap="0" aria-hidden="true" className="chat-hide-sm">
              <Avatar size="s" value="MO" />
              <Avatar size="s" value="JL" style={{ marginLeft: -8 }} />
              <Avatar size="s" value="AI" style={{ marginLeft: -8 }} />
            </Row>
            <button
              type="button"
              className="chat-btn"
              onClick={() => setPaletteOpen(true)}
              aria-haspopup="dialog"
              aria-label="Open command palette"
            >
              <span aria-hidden="true">⌘</span>
              <span className="chat-hide-sm">Commands</span>
              <span className="chat-kbd chat-hide-sm" aria-hidden="true">⌘K</span>
            </button>
          </Row>
        </header>

        <div
          ref={scrollRef}
          className="chat-scroll"
          role="log"
          aria-live="off"
          aria-label="Message history"
          tabIndex={0}
        >
          {messages.length === 0 && !streaming && (
            <Column fillWidth horizontal="center" paddingY="48" gap="8">
              <Text variant="heading-strong-s">No messages yet</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Say hello, or press Ctrl/⌘ + K to try a command.
              </Text>
            </Column>
          )}

          {messages.map((m) => {
            const author = AUTHORS[m.authorId];
            const mine = m.authorId === "me";
            return (
              <article key={m.id} className={`chat-msg${mine ? " mine" : ""}`}>
                <MessageAvatar author={author} />
                <div className="chat-body">
                  <div className="chat-meta">
                    <strong>{author.name}</strong>
                    <span>{author.role}</span>
                    <time>{m.time}</time>
                  </div>
                  <div className="chat-bubble">{m.text}</div>
                  {m.reactions && (
                    <div className="chat-reactions">
                      {m.reactions.map((r) => (
                        <button
                          key={r.emoji}
                          type="button"
                          className="chat-chip"
                          aria-label={`${r.count} reactions: ${r.emoji}`}
                        >
                          <span aria-hidden="true">{r.emoji}</span> {r.count}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {streaming && (
            <article className="chat-msg" aria-busy="true">
              <MessageAvatar author={AUTHORS.aria} />
              <div className="chat-body">
                <div className="chat-meta">
                  <strong>Aria</strong>
                  <span>{streamText ? "writing…" : "thinking…"}</span>
                </div>
                <div className="chat-bubble">
                  {streamText ? (
                    <>
                      {streamText}
                      <span className="chat-caret" aria-hidden="true" />
                    </>
                  ) : (
                    <span className="chat-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                  )}
                </div>
              </div>
            </article>
          )}
        </div>

        <div className="chat-sr" role="status" aria-live="polite">
          {announce}
        </div>

        <div className="chat-composer">
          {emojiOpen && (
            <div
              id={emojiPanelId}
              className="chat-popover"
              role="group"
              aria-label="Emoji picker"
            >
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="chat-emoji"
                  onClick={() => addEmoji(e)}
                  aria-label={`Insert ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          <form className="chat-form" onSubmit={onSubmit}>
            <button
              type="button"
              className="chat-btn"
              onClick={() => setEmojiOpen((o) => !o)}
              aria-expanded={emojiOpen}
              aria-controls={emojiOpen ? emojiPanelId : undefined}
              aria-label="Toggle emoji picker"
            >
              <span aria-hidden="true">😊</span>
            </button>
            <label htmlFor="chat-message" className="chat-sr">
              Message
            </label>
            <textarea
              id="chat-message"
              ref={inputRef}
              className="chat-input"
              rows={1}
              placeholder="Message #checkout-redesign"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button
              type="submit"
              className="chat-btn primary"
              disabled={!draft.trim() || streaming}
              aria-label="Send message"
            >
              <span aria-hidden="true">➤</span>
              <span className="chat-hide-sm">Send</span>
            </button>
          </form>

          <div className="chat-hint">
            <span className="chat-kbd">Enter</span> to send
            <span aria-hidden="true">·</span>
            <span className="chat-kbd">Shift</span>+<span className="chat-kbd">Enter</span> for new line
            <span aria-hidden="true">·</span>
            <span className="chat-kbd">⌘K</span> / <span className="chat-kbd">Ctrl K</span> for commands
          </div>
        </div>
      </main>

      {paletteOpen && (
        <div
          className="chat-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPaletteOpen(false);
          }}
        >
          <div
            className="chat-palette"
            role="dialog"
            aria-modal="true"
            aria-labelledby={paletteTitleId}
          >
            <h2 id={paletteTitleId} className="chat-sr">
              Command palette
            </h2>
            <input
              ref={paletteInputRef}
              type="text"
              placeholder="Type a command…"
              aria-label="Search commands"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtered[0]) runCommand(filtered[0].hint);
              }}
            />
            <div role="list">
              {filtered.length === 0 && (
                <Text as="p" variant="body-default-s" onBackground="neutral-weak" style={{ padding: 16 }}>
                  No matching commands.
                </Text>
              )}
              {filtered.map((c) => (
                <div role="listitem" key={c.id}>
                  <button type="button" className="chat-cmd-item" onClick={() => runCommand(c.hint)}>
                    <span>{c.label}</span>
                    <span className="chat-kbd">{c.hint}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Flex>
  );
}
