```tsx
"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, KeyboardEvent } from "react";
import { Column, Row, Text, Heading } from "@once-ui-system/core";

type Author = "me" | "ai" | "teammate";

interface Message {
  id: string;
  author: Author;
  name: string;
  time: string;
  text: string;
}

interface Command {
  id: string;
  label: string;
  hint: string;
  keys: string;
}

const PEOPLE: Record<Author, { name: string; initials: string; color: string }> = {
  me: { name: "You", initials: "YO", color: "#3b6ef5" },
  ai: { name: "Atlas Assistant", initials: "AA", color: "#12906b" },
  teammate: { name: "Priya Raman", initials: "PR", color: "#b4541e" },
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    author: "teammate",
    name: "Priya Raman",
    time: "9:41 AM",
    text: "Morning! The staging deploy for the billing dashboard finished. Can someone sanity-check the invoice export?",
  },
  {
    id: "m2",
    author: "me",
    name: "You",
    time: "9:43 AM",
    text: "On it. @Atlas can you summarize what changed in the export module since last Thursday?",
  },
  {
    id: "m3",
    author: "ai",
    name: "Atlas Assistant",
    time: "9:43 AM",
    text: "Three changes landed since Thursday: CSV exports now stream in chunks of 5,000 rows, currency columns use ISO 4217 codes, and the date filter respects the workspace time zone. The chunked export cut peak memory on the 120k-row test account from 1.8 GB to roughly 310 MB.",
  },
  {
    id: "m4",
    author: "teammate",
    name: "Priya Raman",
    time: "9:45 AM",
    text: "Nice, that matches what I saw in the profiler. Let's ship it after lunch if the checks stay green. 🚀",
  },
];

const STREAM_REPLY =
  "Sounds good. I'll watch the staging error rate for the next two hours and post a summary here before 1 PM. If anything regresses, I'll flag the exact commit and prepare a rollback note so the release can be paused without a scramble.";

const EMOJIS: { char: string; label: string }[] = [
  { char: "😀", label: "Grinning face" },
  { char: "😂", label: "Face with tears of joy" },
  { char: "🙂", label: "Slightly smiling face" },
  { char: "😍", label: "Heart eyes" },
  { char: "🤔", label: "Thinking face" },
  { char: "😎", label: "Smiling face with sunglasses" },
  { char: "🙌", label: "Raising hands" },
  { char: "👍", label: "Thumbs up" },
  { char: "👏", label: "Clapping hands" },
  { char: "🔥", label: "Fire" },
  { char: "🎉", label: "Party popper" },
  { char: "🚀", label: "Rocket" },
  { char: "✅", label: "Check mark" },
  { char: "💡", label: "Light bulb" },
  { char: "🐛", label: "Bug" },
  { char: "☕", label: "Hot beverage" },
  { char: "👀", label: "Eyes" },
  { char: "🙏", label: "Folded hands" },
  { char: "💯", label: "Hundred points" },
  { char: "❤️", label: "Red heart" },
  { char: "😅", label: "Grinning face with sweat" },
  { char: "🥳", label: "Partying face" },
  { char: "😴", label: "Sleeping face" },
  { char: "🤝", label: "Handshake" },
];

const COMMANDS: Command[] = [
  { id: "c1", label: "Summarize this thread", hint: "Ask Atlas for a short recap", keys: "S" },
  { id: "c2", label: "Search messages", hint: "Find anything in this channel", keys: "F" },
  { id: "c3", label: "Create a task from message", hint: "Send to the sprint board", keys: "T" },
  { id: "c4", label: "Mute channel for 1 hour", hint: "Pause notifications", keys: "M" },
  { id: "c5", label: "Clear conversation", hint: "Remove messages from this view", keys: "⌫" },
];

const styles = `
@keyframes chat-dot {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
  40% { transform: translateY(-4px); opacity: 1; }
}
@keyframes chat-caret {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.chat-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--neutral-on-background-weak);
  display: inline-block;
  animation: chat-dot 1.2s infinite ease-in-out;
}
.chat-dot:nth-child(2) { animation-delay: 0.15s; }
.chat-dot:nth-child(3) { animation-delay: 0.3s; }
.chat-caret {
  display: inline-block; width: 2px; height: 1em; margin-left: 2px;
  background: currentColor; vertical-align: text-bottom;
  animation: chat-caret 1s steps(1) infinite;
}
@media (prefers-reduced-motion: reduce) {
  .chat-dot, .chat-caret { animation: none; }
}
.chat-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border: 1px solid var(--neutral-alpha-medium);
  background: var(--surface-background);
  color: var(--neutral-on-background-strong);
  border-radius: var(--radius-m);
  cursor: pointer; font: inherit; font-size: 14px;
  min-height: 40px; min-width: 40px; padding: 0 12px;
  transition: background 0.15s ease;
}
.chat-btn:hover { background: var(--neutral-alpha-weak); }
.chat-btn:focus-visible, .chat-emoji:focus-visible, .chat-cmd:focus-visible,
.chat-input:focus-visible, .chat-search:focus-visible {
  outline: 2px solid var(--brand-solid-strong);
  outline-offset: 2px;
}
.chat-send {
  background: var(--brand-solid-strong);
  border-color: transparent;
  color: var(--brand-on-solid-strong, #fff);
  font-weight: 600;
}
.chat-send:hover { background: var(--brand-solid-medium); }
.chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
.chat-emoji {
  border: none; background: transparent; border-radius: var(--radius-s);
  font-size: 22px; line-height: 1; cursor: pointer;
  min-height: 40px; min-width: 40px;
}
.chat-emoji:hover { background: var(--neutral-alpha-weak); }
.chat-input {
  flex: 1; min-width: 0; resize: none; font: inherit; font-size: 15px;
  line-height: 1.45; padding: 10px 12px;
  border: 1px solid var(--neutral-alpha-medium);
  border-radius: var(--radius-m);
  background: var(--surface-background);
  color: var(--neutral-on-background-strong);
  max-height: 140px;
}
.chat-kbd {
  display: inline-flex; align-items: center; padding: 1px 6px;
  border: 1px solid var(--neutral-alpha-medium);
  border-radius: var(--radius-s);
  background: var(--neutral-alpha-weak);
  font-family: inherit; font-size: 12px;
  color: var(--neutral-on-background-medium);
}
.chat-cmd {
  display: flex; width: 100%; align-items: center; justify-content: space-between;
  gap: 12px; text-align: left; border: none; background: transparent;
  color: var(--neutral-on-background-strong); font: inherit;
  padding: 10px 12px; border-radius: var(--radius-m); cursor: pointer; min-height: 44px;
}
.chat-cmd:hover { background: var(--neutral-alpha-weak); }
.chat-search {
  width: 100%; font: inherit; font-size: 15px; padding: 12px 14px;
  border: none; border-bottom: 1px solid var(--neutral-alpha-medium);
  background: transparent; color: var(--neutral-on-background-strong);
  border-radius: var(--radius-l) var(--radius-l) 0 0;
}
.chat-bubble-text { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.5; }
`;

function Avatar({ author, size = 36 }: { author: Author; size?: number }) {
  const p = PEOPLE[author];
  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    background: p.color,
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: size * 0.36,
    fontWeight: 600,
    flexShrink: 0,
    letterSpacing: 0.3,
  };
  return (
    <span style={style} aria-hidden="true">
      {p.initials}
    </span>
  );
}

function MessageRow({ message, streaming }: { message: Message; streaming?: boolean }) {
  const mine = message.author === "me";
  const bubble: CSSProperties = {
    background: mine ? "var(--brand-solid-strong)" : "var(--neutral-alpha-weak)",
    color: mine ? "var(--brand-on-solid-strong, #fff)" : "var(--neutral-on-background-strong)",
    border: mine ? "1px solid transparent" : "1px solid var(--neutral-alpha-medium)",
    borderRadius: "var(--radius-l)",
    padding: "10px 14px",
    maxWidth: "min(640px, 100%)",
    fontSize: 15,
  };
  return (
    <li
      style={{
        display: "flex",
        gap: 10,
        flexDirection: mine ? "row-reverse" : "row",
        alignItems: "flex-start",
        listStyle: "none",
        width: "100%",
      }}
    >
      <Avatar author={message.author} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: mine ? "flex-end" : "flex-start",
          gap: 4,
          minWidth: 0,
          maxWidth: "calc(100% - 52px)",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
          <Text variant="label-default-s" onBackground="neutral-strong">
            {message.name}
          </Text>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            <time>{message.time}</time>
          </Text>
        </div>
        <div style={bubble}>
          <span className="chat-bubble-text">
            {message.text}
            {streaming ? <span className="chat-caret" aria-hidden="true" /> : null}
          </span>
        </div>
      </div>
    </li>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <li style={{ display: "flex", gap: 10, alignItems: "center", listStyle: "none" }}>
      <Avatar author="ai" />
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "12px 14px",
          borderRadius: "var(--radius-l)",
          background: "var(--neutral-alpha-weak)",
          border: "1px solid var(--neutral-alpha-medium)",
        }}
      >
        <span className="chat-dot" aria-hidden="true" />
        <span className="chat-dot" aria-hidden="true" />
        <span className="chat-dot" aria-hidden="true" />
        <span
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </div>
    </li>
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState<"idle" | "thinking" | "streaming">("idle");
  const [streamText, setStreamText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isMac, setIsMac] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const emojiPanelRef = useRef<HTMLDivElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const idCounter = useRef(100);

  const emojiPanelId = useId();
  const paletteTitleId = useId();
  const inputId = useId();

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  useEffect(() => {
    const list = timers.current;
    return () => {
      list.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, streamText, phase]);

  // Global Cmd/Ctrl+K
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

  useEffect(() => {
    if (paletteOpen) {
      setQuery("");
      paletteInputRef.current?.focus();
    }
  }, [paletteOpen]);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!emojiOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (emojiPanelRef.current?.contains(t) || emojiBtnRef.current?.contains(t)) return;
      setEmojiOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [emojiOpen]);

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((c) => (c.label + " " + c.hint).toLowerCase().includes(q));
  }, [query]);

  const startReply = useCallback(() => {
    setPhase("thinking");
    setStreamText("");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const words = STREAM_REPLY.split(" ");

    const finish = () => {
      idCounter.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `m${idCounter.current}`,
          author: "ai",
          name: PEOPLE.ai.name,
          time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
          text: STREAM_REPLY,
        },
      ]);
      setStreamText("");
      setPhase("idle");
    };

    const begin = window.setTimeout(
      () => {
        if (reduce) {
          finish();
          return;
        }
        setPhase("streaming");
        let i = 0;
        const tick = () => {
          i += 1;
          setStreamText(words.slice(0, i).join(" "));
          if (i < words.length) {
            timers.current.push(window.setTimeout(tick, 70));
          } else {
            timers.current.push(window.setTimeout(finish, 250));
          }
        };
        tick();
      },
      reduce ? 400 : 1100,
    );
    timers.current.push(begin);
  }, []);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || phase !== "idle") return;
    idCounter.current += 1;
    setMessages((prev) => [
      ...prev,
      {
        id: `m${idCounter.current}`,
        author: "me",
        name: PEOPLE.me.name,
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        text,
      },
    ]);
    setDraft("");
    setEmojiOpen(false);
    startReply();
  }, [draft, phase, startReply]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send();
  };

  const onInputKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const insertEmoji = (char: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? draft.length;
    const end = el?.selectionEnd ?? draft.length;
    const next = draft.slice(0, start) + char + draft.slice(end);
    setDraft(next);
    requestAnimationFrame(() => {
      if (el) {
        el.focus();
        const pos = start + char.length;
        el.setSelectionRange(pos, pos);
      }
    });
  };

  const onEmojiKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      setEmojiOpen(false);
      emojiBtnRef.current?.focus();
    }
  };

  const closePalette = () => {
    setPaletteOpen(false);
    inputRef.current?.focus();
  };

  const runCommand = (c: Command) => {
    closePalette();
    if (c.id === "c5") {
      setMessages([]);
    } else if (c.id === "c1") {
      setDraft("Atlas, please summarize this thread in three bullet points.");
    }
  };

  const onPaletteKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      closePalette();
    }
  };

  const modKey = isMac ? "⌘" : "Ctrl";

  return (
    <Column fillWidth horizontal="center" style={{ height: "100dvh" }}>
      <style>{styles}</style>
      <Column
        fillWidth
        style={{
          maxWidth: 880,
          height: "100%",
          margin: "0 auto",
          borderLeft: "1px solid var(--neutral-alpha-weak)",
          borderRight: "1px solid var(--neutral-alpha-weak)",
          background: "var(--page-background)",
        }}
      >
        {/* Header */}
        <Row
          as="header"
          fillWidth
          vertical="center"
          horizontal="between"
          paddingX="16"
          paddingY="12"
          gap="12"
          style={{ borderBottom: "1px solid var(--neutral-alpha-medium)", flexShrink: 0 }}
        >
          <Row vertical="center" gap="12" style={{ minWidth: 0 }}>
            <div style={{ display: "flex" }} aria-hidden="true">
              <Avatar author="teammate" size={32} />
              <div style={{ marginLeft: -8 }}>
                <Avatar author="ai" size={32} />
              </div>
            </div>
            <Column style={{ minWidth: 0 }}>
              <Heading as="h1" variant="heading-strong-m">
                # billing-release
              </Heading>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                3 members · Atlas is online
              </Text>
            </Column>
          </Row>
          <button
            type="button"
            className="chat-btn"
            onClick={() => setPaletteOpen(true)}
            aria-haspopup="dialog"
            aria-label={`Open command palette (${modKey} K)`}
          >
            <span className="chat-btn-label" style={{ fontSize: 13 }}>
              Commands
            </span>
            <span className="chat-kbd" aria-hidden="true">
              {modKey} K
            </span>
          </button>
        </Row>

        {/* Message log */}
        <div
          style={{ flex: 1, overflowY: "auto", padding: "16px", minHeight: 0 }}
          tabIndex={0}
          role="region"
          aria-label="Conversation"
        >
          <ul
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            style={{
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {messages.length === 0 ? (
              <li style={{ listStyle: "none", textAlign: "center", padding: "48px 0" }}>
                <Text variant="body-default-m" onBackground="neutral-weak">
                  No messages yet. Say hello to the team.
                </Text>
              </li>
            ) : null}
            {messages.map((m) => (
              <MessageRow key={m.id} message={m} />
            ))}
            {phase === "thinking" ? <TypingIndicator label="Atlas Assistant is thinking" /> : null}
            {phase === "streaming" ? (
              <MessageRow
                streaming
                message={{
                  id: "stream",
                  author: "ai",
                  name: PEOPLE.ai.name,
                  time: "now",
                  text: streamText,
                }}
              />
            ) : null}
          </ul>
          <div ref={logEndRef} />
        </div>

        {/* Composer */}
        <form
          onSubmit={onSubmit}
          style={{
            flexShrink: 0,
            padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
            borderTop: "1px solid var(--neutral-alpha-medium)",
            position: "relative",
          }}
        >
          {emojiOpen ? (
            <div
              ref={emojiPanelRef}
              id={emojiPanelId}
              role="dialog"
              aria-label="Emoji picker"
              onKeyDown={onEmojiKey}
              style={{
                position: "absolute",
                bottom: "calc(100% - 4px)",
                left: 16,
                right: 16,
                maxWidth: 360,
                background: "var(--surface-background)",
                border: "1px solid var(--neutral-alpha-medium)",
                borderRadius: "var(--radius-l)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                padding: 8,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))",
                gap: 2,
                zIndex: 10,
              }}
            >
              {EMOJIS.map((e, i) => (
                <button
                  key={e.char}
                  type="button"
                  className="chat-emoji"
                  aria-label={e.label}
                  title={e.label}
                  autoFocus={i === 0}
                  onClick={() => insertEmoji(e.char)}
                >
                  {e.char}
                </button>
              ))}
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <button
              ref={emojiBtnRef}
              type="button"
              className="chat-btn"
              aria-label="Insert emoji"
              aria-expanded={emojiOpen}
              aria-controls={emojiOpen ? emojiPanelId : undefined}
              aria-haspopup="dialog"
              onClick={() => setEmojiOpen((o) => !o)}
              style={{ fontSize: 20, padding: 0, width: 44, minHeight: 44 }}
            >
              <span aria-hidden="true">😊</span>
            </button>
            <label htmlFor={inputId} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              Message #billing-release
            </label>
            <textarea
              id={inputId}
              ref={inputRef}
              className="chat-input"
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onInputKey}
              placeholder="Message #billing-release"
              style={{ minHeight: 44 }}
            />
            <button
              type="submit"
              className="chat-btn chat-send"
              disabled={!draft.trim() || phase !== "idle"}
              style={{ minHeight: 44, padding: "0 16px" }}
            >
              Send
            </button>
          </div>
          <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              <span className="chat-kbd">Enter</span> to send · <span className="chat-kbd">Shift</span>+
              <span className="chat-kbd">Enter</span> for a new line
            </Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Press <span className="chat-kbd">{modKey} K</span> for commands
            </Text>
          </div>
        </form>
      </Column>

      {/* Command palette */}
      {paletteOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "12vh 16px 16px",
            zIndex: 50,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closePalette();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={paletteTitleId}
            onKeyDown={onPaletteKey}
            style={{
              width: "100%",
              maxWidth: 520,
              background: "var(--surface-background)",
              border: "1px solid var(--neutral-alpha-medium)",
              borderRadius: "var(--radius-l)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
              maxHeight: "70dvh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2
              id={paletteTitleId}
              style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
            >
              Command palette
            </h2>
            <input
              ref={paletteInputRef}
              className="chat-search"
              type="text"
              placeholder="Type a command or search…"
              aria-label="Search commands"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filteredCommands[0]) {
                  e.preventDefault();
                  runCommand(filteredCommands[0]);
                }
              }}
            />
            <div style={{ overflowY: "auto", padding: 6 }}>
              {filteredCommands.length === 0 ? (
                <div style={{ padding: 16, textAlign: "center" }}>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    No commands match “{query}”.
                  </Text>
                </div>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {filteredCommands.map((c) => (
                    <li key={c.id}>
                      <button type="button" className="chat-cmd" onClick={() => runCommand(c)}>
                        <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{c.label}</span>
                          <span style={{ fontSize: 12, color: "var(--neutral-on-background-weak)" }}>
                            {c.hint}
                          </span>
                        </span>
                        <span className="chat-kbd" aria-hidden="true">
                          {c.keys}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div
              style={{
                padding: "8px 12px",
                borderTop: "1px solid var(--neutral-alpha-medium)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Text variant="body-default-xs" onBackground="neutral-weak">
                <span className="chat-kbd">Enter</span> run first result
              </Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                <span className="chat-kbd">Esc</span> close
              </Text>
            </div>
          </div>
        </div>
      ) : null}
    </Column>
  );
}
```