"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { Avatar, Column, Flex, Row, Text } from "@once-ui-system/core";

type Author = {
  id: string;
  name: string;
  initials: string;
  role: string;
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
  me: { id: "me", name: "You", initials: "YO", role: "Product designer", hue: 215 },
  maya: { id: "maya", name: "Maya Okafor", initials: "MO", role: "Engineering lead", hue: 150 },
  daniel: { id: "daniel", name: "Daniel Reyes", initials: "DR", role: "Backend engineer", hue: 28 },
  aria: { id: "aria", name: "Aria", initials: "AI", role: "Assistant", hue: 275 },
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    authorId: "maya",
    time: "09:12",
    text: "Morning, team! The staging deploy for the billing revamp finished overnight. Smoke tests are green.",
    reactions: [{ emoji: "🎉", count: 4 }],
  },
  {
    id: "m2",
    authorId: "daniel",
    time: "09:15",
    text: "Nice. I'm still seeing a slow query on the invoices endpoint, around 800ms at p95. I'll add an index on customer_id + created_at today.",
  },
  {
    id: "m3",
    authorId: "me",
    time: "09:18",
    text: "Thanks both. Can someone summarize what's left before we can open the beta to the first 50 customers?",
  },
  {
    id: "m4",
    authorId: "aria",
    time: "09:18",
    text: "Here's where things stand: 1) invoice query index (Daniel, today), 2) updated receipt email copy (pending review), 3) accessibility pass on the checkout form. Everything else is merged and verified on staging.",
    reactions: [
      { emoji: "👍", count: 3 },
      { emoji: "🙏", count: 1 },
    ],
  },
  {
    id: "m5",
    authorId: "maya",
    time: "09:21",
    text: "Great summary. I'll take the accessibility pass. Let's aim for a go/no-go call at 3pm.",
  },
];

const STREAM_REPLY =
  "Sounds good. I've drafted the go/no-go checklist and pinned it to the channel. It covers rollback steps, on-call coverage for the first 48 hours, and the three metrics we'll watch: checkout conversion, invoice latency, and support ticket volume.";

const EMOJI_GROUPS: { label: string; emojis: { char: string; name: string }[] }[] = [
  {
    label: "Smileys",
    emojis: [
      { char: "😀", name: "Grinning face" },
      { char: "😂", name: "Laughing with tears" },
      { char: "😊", name: "Smiling face" },
      { char: "😍", name: "Heart eyes" },
      { char: "🤔", name: "Thinking face" },
      { char: "😅", name: "Sweat smile" },
      { char: "😎", name: "Sunglasses" },
      { char: "🥳", name: "Party face" },
    ],
  },
  {
    label: "Gestures",
    emojis: [
      { char: "👍", name: "Thumbs up" },
      { char: "👏", name: "Clapping hands" },
      { char: "🙌", name: "Raised hands" },
      { char: "🙏", name: "Folded hands" },
      { char: "👀", name: "Eyes" },
      { char: "💪", name: "Flexed biceps" },
      { char: "🤝", name: "Handshake" },
      { char: "✌️", name: "Victory hand" },
    ],
  },
  {
    label: "Work",
    emojis: [
      { char: "🚀", name: "Rocket" },
      { char: "🎉", name: "Party popper" },
      { char: "✅", name: "Check mark" },
      { char: "🔥", name: "Fire" },
      { char: "💡", name: "Light bulb" },
      { char: "🐛", name: "Bug" },
      { char: "📌", name: "Pushpin" },
      { char: "⏰", name: "Alarm clock" },
    ],
  },
];

const COMMANDS: { id: string; label: string; hint: string }[] = [
  { id: "c1", label: "Summarize this thread", hint: "/summarize" },
  { id: "c2", label: "Create a task from message", hint: "/task" },
  { id: "c3", label: "Schedule a meeting", hint: "/meet" },
  { id: "c4", label: "Search messages", hint: "/search" },
  { id: "c5", label: "Mute channel for 1 hour", hint: "/mute" },
];

const styles: Record<string, CSSProperties> = {
  shell: {
    height: "100dvh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "clamp(0px, 2vw, 24px)",
    boxSizing: "border-box",
  },
  panel: {
    width: "100%",
    maxWidth: 880,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "var(--surface-background, transparent)",
    border: "1px solid var(--neutral-alpha-medium, rgba(128,128,128,0.25))",
    borderRadius: "clamp(0px, 2vw, 16px)",
    overflow: "hidden",
    position: "relative",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 16px",
    borderBottom: "1px solid var(--neutral-alpha-medium, rgba(128,128,128,0.25))",
  },
  log: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    listStyle: "none",
    margin: 0,
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: 14,
    maxWidth: "100%",
    lineHeight: 1.5,
    fontSize: 15,
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
  },
  composer: {
    borderTop: "1px solid var(--neutral-alpha-medium, rgba(128,128,128,0.25))",
    padding: "12px 16px 14px",
    position: "relative",
  },
  inputWrap: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    border: "1px solid var(--neutral-alpha-medium, rgba(128,128,128,0.35))",
    borderRadius: 14,
    padding: 6,
  },
  textarea: {
    flex: 1,
    minWidth: 0,
    resize: "none",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "inherit",
    font: "inherit",
    fontSize: 15,
    lineHeight: 1.5,
    padding: "8px 6px",
    maxHeight: 140,
  },
  iconBtn: {
    width: 40,
    height: 40,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    border: "none",
    background: "transparent",
    color: "inherit",
    cursor: "pointer",
    fontSize: 20,
    flexShrink: 0,
  },
  sendBtn: {
    height: 40,
    padding: "0 16px",
    borderRadius: 10,
    border: "none",
    background: "var(--brand-solid-strong, #3b6df0)",
    color: "var(--brand-on-solid-strong, #fff)",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    flexShrink: 0,
  },
  popover: {
    position: "absolute",
    bottom: "calc(100% - 4px)",
    left: 16,
    width: "min(340px, calc(100% - 32px))",
    maxHeight: 300,
    overflowY: "auto",
    padding: 12,
    borderRadius: 14,
    background: "var(--page-background, #fff)",
    border: "1px solid var(--neutral-alpha-medium, rgba(128,128,128,0.35))",
    boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
    zIndex: 5,
  },
  emojiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(40px, 1fr))",
    gap: 4,
  },
  emojiBtn: {
    height: 40,
    border: "none",
    borderRadius: 8,
    background: "transparent",
    fontSize: 22,
    cursor: "pointer",
  },
  kbd: {
    display: "inline-flex",
    alignItems: "center",
    padding: "1px 6px",
    borderRadius: 6,
    border: "1px solid var(--neutral-alpha-medium, rgba(128,128,128,0.4))",
    fontSize: 12,
    fontFamily: "var(--font-code, monospace)",
    lineHeight: 1.6,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "12vh 16px 16px",
    zIndex: 50,
  },
  palette: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 16,
    background: "var(--page-background, #fff)",
    border: "1px solid var(--neutral-alpha-medium, rgba(128,128,128,0.35))",
    boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
    overflow: "hidden",
  },
  paletteInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    border: "none",
    borderBottom: "1px solid var(--neutral-alpha-medium, rgba(128,128,128,0.3))",
    outline: "none",
    background: "transparent",
    color: "inherit",
    font: "inherit",
    fontSize: 15,
  },
  paletteItem: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    border: "none",
    background: "transparent",
    color: "inherit",
    font: "inherit",
    fontSize: 14,
    textAlign: "left",
    cursor: "pointer",
  },
};

const CSS = `
@keyframes chat-dot { 0%, 80%, 100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
@keyframes chat-caret { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
.chat-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; display: inline-block; animation: chat-dot 1.2s infinite ease-in-out; }
.chat-dot:nth-child(2) { animation-delay: .15s; }
.chat-dot:nth-child(3) { animation-delay: .3s; }
.chat-caret { display: inline-block; width: 2px; height: 1em; margin-left: 2px; vertical-align: text-bottom; background: currentColor; animation: chat-caret 1s infinite; }
.chat-btn:hover { background: var(--neutral-alpha-weak, rgba(128,128,128,0.15)) !important; }
.chat-btn:focus-visible, .chat-send:focus-visible, .chat-ta:focus-visible { outline: 2px solid var(--brand-solid-strong, #3b6df0); outline-offset: 2px; }
.chat-item:hover, .chat-item[data-active="true"] { background: var(--neutral-alpha-weak, rgba(128,128,128,0.15)) !important; }
.chat-send:disabled { opacity: .5; cursor: not-allowed; }
.chat-input-wrap:focus-within { border-color: var(--brand-solid-strong, #3b6df0) !important; }
@media (prefers-reduced-motion: reduce) { .chat-dot, .chat-caret { animation: none; } }
`;

function UserAvatar({ author, size = "m" }: { author: Author; size?: "s" | "m" | "l" }) {
  if (author.id === "aria") {
    return (
      <Avatar
        size={size}
        value={author.initials}
        style={{ background: `hsl(${author.hue} 60% 45%)`, color: "#fff" }}
        aria-hidden="true"
      />
    );
  }
  return (
    <Avatar
      size={size}
      value={author.initials}
      style={{ background: `hsl(${author.hue} 55% 42%)`, color: "#fff" }}
      aria-hidden="true"
    />
  );
}

function TypingDots() {
  return (
    <span aria-hidden="true" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      <span className="chat-dot" />
      <span className="chat-dot" />
      <span className="chat-dot" />
    </span>
  );
}

function MessageRow({
  message,
  streaming = false,
}: {
  message: Message;
  streaming?: boolean;
}) {
  const author = AUTHORS[message.authorId];
  const mine = author.id === "me";
  return (
    <li
      style={{
        display: "flex",
        gap: 10,
        flexDirection: mine ? "row-reverse" : "row",
        alignItems: "flex-start",
      }}
    >
      <UserAvatar author={author} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: mine ? "flex-end" : "flex-start",
          gap: 4,
          maxWidth: "min(78%, 600px)",
          minWidth: 0,
        }}
      >
        <Row gap="8" vertical="center" style={{ flexDirection: mine ? "row-reverse" : "row" }}>
          <Text variant="label-default-s" onBackground="neutral-strong">
            {author.name}
          </Text>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {author.role !== "Assistant" ? author.role : "AI assistant"} · {message.time}
          </Text>
        </Row>
        <div
          style={{
            ...styles.bubble,
            background: mine
              ? "var(--brand-solid-strong, #3b6df0)"
              : "var(--neutral-alpha-weak, rgba(128,128,128,0.15))",
            color: mine ? "var(--brand-on-solid-strong, #fff)" : "inherit",
            borderTopRightRadius: mine ? 4 : 14,
            borderTopLeftRadius: mine ? 14 : 4,
          }}
        >
          {message.text}
          {streaming && <span className="chat-caret" aria-hidden="true" />}
        </div>
        {message.reactions && message.reactions.length > 0 && (
          <Row gap="4" wrap>
            {message.reactions.map((r) => (
              <span
                key={r.emoji}
                style={{
                  ...styles.kbd,
                  fontFamily: "inherit",
                  gap: 4,
                  borderRadius: 999,
                  padding: "1px 8px",
                }}
                aria-label={`${r.count} reactions: ${r.emoji}`}
              >
                <span aria-hidden="true">{r.emoji}</span>
                <span aria-hidden="true">{r.count}</span>
              </span>
            ))}
          </Row>
        )}
      </div>
    </li>
  );
}

function CommandPalette({ onClose, onPick }: { onClose: () => void; onPick: (hint: string) => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMMANDS.filter((c) => !q || c.label.toLowerCase().includes(q) || c.hint.includes(q));
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const safeActive = Math.min(active, Math.max(results.length - 1, 0));

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((safeActive + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((safeActive - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      const item = results[safeActive];
      if (item) {
        e.preventDefault();
        onPick(item.hint);
      }
    }
  };

  return (
    <div
      style={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={styles.palette}
        onKeyDown={onKeyDown}
      >
        <span id={titleId} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Command palette
        </span>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results[safeActive] ? `${listId}-${results[safeActive].id}` : undefined}
          aria-label="Search commands"
          placeholder="Type a command or search…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          style={styles.paletteInput}
        />
        <div id={listId} role="listbox" aria-label="Commands" style={{ padding: "6px 0", maxHeight: 320, overflowY: "auto" }}>
          {results.length === 0 && (
            <div style={{ padding: "12px 16px", opacity: 0.7, fontSize: 14 }}>No commands match “{query}”.</div>
          )}
          {results.map((c, i) => (
            <button
              key={c.id}
              id={`${listId}-${c.id}`}
              type="button"
              role="option"
              aria-selected={i === safeActive}
              tabIndex={-1}
              className="chat-item"
              data-active={i === safeActive}
              style={styles.paletteItem}
              onMouseEnter={() => setActive(i)}
              onClick={() => onPick(c.hint)}
            >
              <span>{c.label}</span>
              <span style={styles.kbd}>{c.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [streamText, setStreamText] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const logRef = useRef<HTMLUListElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const idCounter = useRef(100);
  const emojiId = useId();

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  useEffect(() => {
    const list = timers.current;
    return () => {
      list.forEach((t) => window.clearTimeout(t));
      list.length = 0;
    };
  }, []);

  // Global shortcut for command palette
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Auto-scroll on new content
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streamText, thinking]);

  // Close emoji popover on outside click / Escape
  useEffect(() => {
    if (!emojiOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (emojiRef.current?.contains(t) || emojiBtnRef.current?.contains(t)) return;
      setEmojiOpen(false);
    };
    const onEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setEmojiOpen(false);
        emojiBtnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [emojiOpen]);

  // Autosize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [draft]);

  const nowTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const busy = thinking || streamText !== null;

  const startReply = useCallback(() => {
    setThinking(true);
    const t1 = window.setTimeout(() => {
      setThinking(false);
      setStreamText("");
      let i = 0;
      const tick = () => {
        i = Math.min(i + 3, STREAM_REPLY.length);
        setStreamText(STREAM_REPLY.slice(0, i));
        if (i < STREAM_REPLY.length) {
          timers.current.push(window.setTimeout(tick, 35));
        } else {
          timers.current.push(
            window.setTimeout(() => {
              idCounter.current += 1;
              setMessages((m) => [
                ...m,
                { id: `m${idCounter.current}`, authorId: "aria", time: nowTime(), text: STREAM_REPLY },
              ]);
              setStreamText(null);
            }, 150),
          );
        }
      };
      timers.current.push(window.setTimeout(tick, 35));
    }, 1400);
    timers.current.push(t1);
  }, []);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || busy) return;
    idCounter.current += 1;
    setMessages((m) => [...m, { id: `m${idCounter.current}`, authorId: "me", time: nowTime(), text }]);
    setDraft("");
    setEmojiOpen(false);
    startReply();
  }, [draft, busy, startReply]);

  const onTextareaKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const insertEmoji = (char: string) => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? draft.length;
    const end = el?.selectionEnd ?? draft.length;
    const next = draft.slice(0, start) + char + draft.slice(end);
    setDraft(next);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + char.length;
      el?.setSelectionRange(pos, pos);
    });
  };

  const pickCommand = (hint: string) => {
    setPaletteOpen(false);
    setDraft((d) => (d ? `${d} ${hint} ` : `${hint} `));
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const modKey = isMac ? "⌘" : "Ctrl";

  return (
    <Flex fillWidth style={styles.shell} as="main">
      <style>{CSS}</style>
      <section aria-label="Chat: Billing revamp launch" style={styles.panel}>
        <header style={styles.header}>
          <Row gap="12" vertical="center" style={{ minWidth: 0 }}>
            <div style={{ display: "flex" }} aria-hidden="true">
              {(["maya", "daniel", "aria"] as const).map((id, i) => (
                <div key={id} style={{ marginLeft: i === 0 ? 0 : -10 }}>
                  <UserAvatar author={AUTHORS[id]} size="s" />
                </div>
              ))}
            </div>
            <Column style={{ minWidth: 0 }}>
              <Text as="h1" variant="heading-strong-s" style={{ margin: 0 }}>
                # billing-revamp
              </Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                4 members · Beta launch planning
              </Text>
            </Column>
          </Row>
          <button
            type="button"
            className="chat-btn"
            onClick={() => setPaletteOpen(true)}
            aria-label={`Open command palette (${modKey} K)`}
            aria-haspopup="dialog"
            style={{
              ...styles.iconBtn,
              width: "auto",
              padding: "0 10px",
              gap: 8,
              fontSize: 13,
              border: "1px solid var(--neutral-alpha-medium, rgba(128,128,128,0.35))",
              height: 34,
            }}
          >
            <span>Commands</span>
            <span style={styles.kbd} aria-hidden="true">
              {modKey} K
            </span>
          </button>
        </header>

        <ul
          ref={logRef}
          style={styles.log}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Message history"
          tabIndex={0}
        >
          <li style={{ textAlign: "center" }}>
            <Text variant="label-default-xs" onBackground="neutral-weak">
              Today
            </Text>
          </li>
          {messages.map((m) => (
            <MessageRow key={m.id} message={m} />
          ))}
          {thinking && (
            <li style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <UserAvatar author={AUTHORS.aria} />
              <div
                style={{ ...styles.bubble, background: "var(--neutral-alpha-weak, rgba(128,128,128,0.15))" }}
                role="status"
                aria-label="Aria is typing"
              >
                <TypingDots />
              </div>
            </li>
          )}
          {streamText !== null && (
            <MessageRow
              streaming
              message={{ id: "stream", authorId: "aria", time: nowTime(), text: streamText || "…" }}
            />
          )}
        </ul>

        <div style={styles.composer}>
          {emojiOpen && (
            <div
              ref={emojiRef}
              id={emojiId}
              role="dialog"
              aria-label="Emoji picker"
              style={styles.popover}
            >
              {EMOJI_GROUPS.map((g) => (
                <div key={g.label} role="group" aria-label={g.label} style={{ marginBottom: 8 }}>
                  <Text variant="label-default-xs" onBackground="neutral-weak">
                    {g.label}
                  </Text>
                  <div style={styles.emojiGrid}>
                    {g.emojis.map((e) => (
                      <button
                        key={e.char}
                        type="button"
                        className="chat-btn"
                        style={styles.emojiBtn}
                        aria-label={e.name}
                        title={e.name}
                        onClick={() => insertEmoji(e.char)}
                      >
                        {e.char}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="chat-input-wrap" style={styles.inputWrap}>
            <button
              ref={emojiBtnRef}
              type="button"
              className="chat-btn"
              style={styles.iconBtn}
              aria-label="Insert emoji"
              aria-haspopup="dialog"
              aria-expanded={emojiOpen}
              aria-controls={emojiOpen ? emojiId : undefined}
              onClick={() => setEmojiOpen((o) => !o)}
            >
              <span aria-hidden="true">😊</span>
            </button>
            <textarea
              ref={textareaRef}
              className="chat-ta"
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onTextareaKey}
              placeholder="Message #billing-revamp"
              aria-label="Message"
              style={styles.textarea}
            />
            <button
              type="button"
              className="chat-send"
              style={styles.sendBtn}
              onClick={send}
              disabled={!draft.trim() || busy}
            >
              Send
            </button>
          </div>
          <Row horizontal="space-between" vertical="center" gap="8" wrap paddingTop="8" paddingX="4">
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {busy ? "Aria is replying…" : "Enter to send · Shift+Enter for a new line"}
            </Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Press <span style={styles.kbd}>{modKey} K</span> for commands
            </Text>
          </Row>
        </div>
      </section>

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} onPick={pickCommand} />}
    </Flex>
  );
}
