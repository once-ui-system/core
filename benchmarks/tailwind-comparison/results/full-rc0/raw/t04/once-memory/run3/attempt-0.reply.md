```tsx
"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { Avatar, Column, Heading, Row, Text } from "@once-ui-system/core";

type Author = "me" | "maya" | "dev" | "assistant";

interface Message {
  id: string;
  author: Author;
  text: string;
  time: string;
}

interface Person {
  name: string;
  role: string;
  initials: string;
}

const PEOPLE: Record<Author, Person> = {
  me: { name: "You", role: "Product designer", initials: "YO" },
  maya: { name: "Maya Okafor", role: "Engineering lead", initials: "MO" },
  dev: { name: "Dev Patel", role: "Backend engineer", initials: "DP" },
  assistant: { name: "Atlas", role: "Team assistant", initials: "AT" },
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    author: "maya",
    text: "Morning all! The checkout redesign is on staging now. Could someone give the mobile flow a quick pass before standup?",
    time: "9:02 AM",
  },
  {
    id: "m2",
    author: "me",
    text: "On it. I'll start with the address form, that's where we saw the most drop-off last sprint.",
    time: "9:04 AM",
  },
  {
    id: "m3",
    author: "dev",
    text: "FYI I shipped the validation fix an hour ago, so postcode errors should now show inline instead of on submit. 🎉",
    time: "9:06 AM",
  },
  {
    id: "m4",
    author: "assistant",
    text: "Summary so far: 3 open review items on checkout, 1 blocked ticket (payment sandbox keys), and standup moved to 10:15 AM.",
    time: "9:07 AM",
  },
  {
    id: "m5",
    author: "me",
    text: "Nice. Found one issue already: the keyboard covers the Continue button on smaller phones. I'll attach screenshots.",
    time: "9:12 AM",
  },
];

const EMOJI: { char: string; label: string }[] = [
  { char: "😀", label: "Grinning face" },
  { char: "😂", label: "Laughing with tears" },
  { char: "😍", label: "Heart eyes" },
  { char: "🤔", label: "Thinking face" },
  { char: "😅", label: "Nervous smile" },
  { char: "😎", label: "Cool face" },
  { char: "🙏", label: "Folded hands" },
  { char: "👍", label: "Thumbs up" },
  { char: "👏", label: "Clapping hands" },
  { char: "🎉", label: "Party popper" },
  { char: "🔥", label: "Fire" },
  { char: "🚀", label: "Rocket" },
  { char: "✅", label: "Check mark" },
  { char: "👀", label: "Eyes" },
  { char: "💡", label: "Light bulb" },
  { char: "❤️", label: "Red heart" },
];

const COMMANDS: { key: string; label: string; hint: string }[] = [
  { key: "/summarize", label: "Summarize", hint: "Recap this thread" },
  { key: "/assign", label: "Assign", hint: "Hand a task to a teammate" },
  { key: "/remind", label: "Remind", hint: "Set a reminder for later" },
  { key: "/poll", label: "Poll", hint: "Ask the team to vote" },
];

const REPLIES: string[] = [
  "Good catch. I've logged it as CHK-482 and tagged it for the mobile sprint. Want me to link your screenshots once you upload them?",
  "Thanks for flagging that. Based on the device matrix, the issue affects screens under 700px tall. I'd suggest making the footer sticky above the keyboard.",
];

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100%",
  } satisfies CSSProperties,
  shell: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: 880,
    height: "100dvh",
    background: "var(--surface-background)",
    borderInline: "1px solid var(--neutral-alpha-weak)",
  } satisfies CSSProperties,
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderBottom: "1px solid var(--neutral-alpha-weak)",
    flexShrink: 0,
  } satisfies CSSProperties,
  list: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "16px",
    margin: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  } satisfies CSSProperties,
  composer: {
    flexShrink: 0,
    padding: "12px 16px 16px",
    borderTop: "1px solid var(--neutral-alpha-weak)",
    position: "relative",
  } satisfies CSSProperties,
  field: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    padding: 8,
    borderRadius: 16,
    border: "1px solid var(--neutral-alpha-medium)",
    background: "var(--page-background)",
  } satisfies CSSProperties,
  textarea: {
    flex: 1,
    minWidth: 0,
    resize: "none",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "var(--neutral-on-background-strong)",
    font: "inherit",
    fontSize: 15,
    lineHeight: 1.5,
    padding: "8px 4px",
    maxHeight: 140,
  } satisfies CSSProperties,
  iconBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 12,
    border: "none",
    background: "transparent",
    color: "var(--neutral-on-background-strong)",
    cursor: "pointer",
    fontSize: 20,
  } satisfies CSSProperties,
  sendBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    padding: "0 16px",
    flexShrink: 0,
    borderRadius: 12,
    border: "none",
    background: "var(--brand-solid-strong)",
    color: "var(--brand-on-solid-strong)",
    cursor: "pointer",
    font: "inherit",
    fontSize: 14,
    fontWeight: 600,
  } satisfies CSSProperties,
  kbd: {
    display: "inline-block",
    padding: "1px 6px",
    borderRadius: 6,
    border: "1px solid var(--neutral-alpha-medium)",
    background: "var(--neutral-alpha-weak)",
    fontFamily: "var(--font-code)",
    fontSize: 12,
    color: "var(--neutral-on-background-strong)",
  } satisfies CSSProperties,
  popover: {
    position: "absolute",
    bottom: "calc(100% - 4px)",
    left: 16,
    right: 16,
    maxWidth: 360,
    padding: 12,
    borderRadius: 16,
    border: "1px solid var(--neutral-alpha-medium)",
    background: "var(--surface-background)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
    zIndex: 10,
  } satisfies CSSProperties,
  emojiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
    gap: 4,
  } satisfies CSSProperties,
  emojiBtn: {
    height: 38,
    borderRadius: 10,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 22,
    lineHeight: 1,
  } satisfies CSSProperties,
  commandBtn: {
    display: "flex",
    alignItems: "baseline",
    gap: 12,
    width: "100%",
    padding: "8px 10px",
    borderRadius: 10,
    border: "none",
    background: "transparent",
    color: "var(--neutral-on-background-strong)",
    cursor: "pointer",
    font: "inherit",
    textAlign: "left",
  } satisfies CSSProperties,
} as const;

const keyframes = `
@keyframes chat-dot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}
@keyframes chat-caret {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.chat-dot { animation: chat-dot 1.2s infinite ease-in-out; }
.chat-caret { animation: chat-caret 1s infinite steps(1); }
.chat-btn:hover { background: var(--neutral-alpha-weak) !important; }
.chat-btn:focus-visible, .chat-send:focus-visible {
  outline: 2px solid var(--brand-solid-strong);
  outline-offset: 2px;
}
.chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
.chat-field:focus-within { border-color: var(--brand-solid-strong) !important; }
@media (max-width: 480px) {
  .chat-hint-desktop { display: none !important; }
  .chat-send-label { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .chat-dot, .chat-caret { animation: none; }
}
`;

function PersonAvatar({ author, size }: { author: Author; size: "s" | "m" }) {
  return <Avatar value={PEOPLE[author].initials} size={size} aria-hidden="true" />;
}

function MessageItem({ message }: { message: Message }) {
  const person = PEOPLE[message.author];
  const mine = message.author === "me";
  return (
    <li
      style={{
        display: "flex",
        flexDirection: mine ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 10,
      }}
    >
      <PersonAvatar author={message.author} size="m" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: mine ? "flex-end" : "flex-start",
          gap: 4,
          maxWidth: "min(80%, 560px)",
          minWidth: 0,
        }}
      >
        <Row gap="8" vertical="center">
          <Text variant="label-default-s" onBackground="neutral-strong">
            {person.name}
          </Text>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            <time>{message.time}</time>
          </Text>
        </Row>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 16,
            borderBottomRightRadius: mine ? 4 : 16,
            borderBottomLeftRadius: mine ? 16 : 4,
            background: mine ? "var(--brand-solid-strong)" : "var(--neutral-alpha-weak)",
            color: mine ? "var(--brand-on-solid-strong)" : "var(--neutral-on-background-strong)",
            fontSize: 15,
            lineHeight: 1.5,
            overflowWrap: "anywhere",
          }}
        >
          {message.text}
        </div>
      </div>
    </li>
  );
}

function TypingIndicator({ partial }: { partial: string }) {
  return (
    <li style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
      <PersonAvatar author="assistant" size="m" />
      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: "min(80%, 560px)", minWidth: 0 }}>
        <Text variant="label-default-s" onBackground="neutral-strong">
          Atlas{" "}
          <Text as="span" variant="body-default-xs" onBackground="neutral-weak">
            is typing…
          </Text>
        </Text>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 16,
            borderBottomLeftRadius: 4,
            background: "var(--neutral-alpha-weak)",
            color: "var(--neutral-on-background-strong)",
            fontSize: 15,
            lineHeight: 1.5,
            overflowWrap: "anywhere",
          }}
        >
          {partial ? (
            <>
              {partial}
              <span
                className="chat-caret"
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 2,
                  height: "1em",
                  marginLeft: 2,
                  verticalAlign: "text-bottom",
                  background: "currentColor",
                }}
              />
            </>
          ) : (
            <span style={{ display: "inline-flex", gap: 4, padding: "4px 0" }} aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="chat-dot"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--neutral-on-background-weak)",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [partial, setPartial] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [commandsOpen, setCommandsOpen] = useState(false);

  const replyIndex = useRef(0);
  const timers = useRef<number[]>([]);
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const idCounter = useRef(INITIAL_MESSAGES.length);

  const emojiPanelId = useId();
  const commandPanelId = useId();

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, partial, streaming]);

  const formatTime = () =>
    new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const nextId = () => {
    idCounter.current += 1;
    return `m${idCounter.current}`;
  };

  const streamReply = useCallback(() => {
    const full = REPLIES[replyIndex.current % REPLIES.length];
    replyIndex.current += 1;
    const words = full.split(" ");
    setStreaming(true);
    setPartial("");

    let shown = 0;
    const tick = () => {
      shown += 1;
      setPartial(words.slice(0, shown).join(" "));
      if (shown < words.length) {
        timers.current.push(window.setTimeout(tick, 70));
      } else {
        timers.current.push(
          window.setTimeout(() => {
            idCounter.current += 1;
            setMessages((prev) => [
              ...prev,
              {
                id: `m${idCounter.current}`,
                author: "assistant",
                text: full,
                time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
              },
            ]);
            setPartial("");
            setStreaming(false);
          }, 150),
        );
      }
    };
    timers.current.push(window.setTimeout(tick, 1100));
  }, []);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || streaming) return;
    setMessages((prev) => [...prev, { id: nextId(), author: "me", text, time: formatTime() }]);
    setDraft("");
    setEmojiOpen(false);
    setCommandsOpen(false);
    streamReply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, streaming, streamReply]);

  const insertText = (value: string) => {
    const el = textareaRef.current;
    if (!el) {
      setDraft((d) => d + value);
      return;
    }
    const start = el.selectionStart ?? draft.length;
    const end = el.selectionEnd ?? draft.length;
    const next = draft.slice(0, start) + value + draft.slice(end);
    setDraft(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + value.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const closePanels = () => {
    setEmojiOpen(false);
    setCommandsOpen(false);
  };

  // Global shortcut: Cmd/Ctrl + K toggles the command palette, Escape closes panels.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setEmojiOpen(false);
        setCommandsOpen((o) => !o);
      } else if (e.key === "Escape") {
        setEmojiOpen(false);
        setCommandsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onTextareaKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const onDraftChange = (value: string) => {
    setDraft(value);
    if (value === "/" && !commandsOpen) {
      setEmojiOpen(false);
      setCommandsOpen(true);
    }
  };

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [draft]);

  const liveStatus = useMemo(() => (streaming ? "Atlas is typing" : ""), [streaming]);

  return (
    <div style={styles.page}>
      <style>{keyframes}</style>
      <main style={styles.shell} aria-label="Team chat">
        <header style={styles.header}>
          <Row gap="12" vertical="center" style={{ minWidth: 0, flex: 1 }}>
            <Avatar value="CK" size="m" aria-hidden="true" />
            <Column gap="2" style={{ minWidth: 0 }}>
              <Heading as="h1" variant="heading-strong-m">
                # checkout-redesign
              </Heading>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                4 members · Maya, Dev, Atlas and you
              </Text>
            </Column>
          </Row>
          <span
            className="chat-hint-desktop"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--neutral-on-background-weak)" }}
          >
            Commands
            <kbd style={styles.kbd}>Ctrl</kbd>
            <kbd style={styles.kbd}>K</kbd>
          </span>
        </header>

        <ul style={styles.list} aria-label="Messages">
          {messages.map((m) => (
            <MessageItem key={m.id} message={m} />
          ))}
          {streaming && <TypingIndicator partial={partial} />}
          <div ref={listEndRef} aria-hidden="true" />
        </ul>

        <div role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          {liveStatus}
        </div>

        <div style={styles.composer}>
          {emojiOpen && (
            <div id={emojiPanelId} role="dialog" aria-label="Emoji picker" style={styles.popover}>
              <div style={styles.emojiGrid}>
                {EMOJI.map((e) => (
                  <button
                    key={e.char}
                    type="button"
                    className="chat-btn"
                    style={styles.emojiBtn}
                    aria-label={e.label}
                    onClick={() => insertText(e.char)}
                  >
                    <span aria-hidden="true">{e.char}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {commandsOpen && (
            <div id={commandPanelId} role="dialog" aria-label="Command palette" style={styles.popover}>
              <Text variant="label-default-xs" onBackground="neutral-weak" style={{ padding: "0 10px 6px", display: "block" }}>
                Commands
              </Text>
              <div role="list">
                {COMMANDS.map((c) => (
                  <div role="listitem" key={c.key}>
                    <button
                      type="button"
                      className="chat-btn"
                      style={styles.commandBtn}
                      onClick={() => {
                        setCommandsOpen(false);
                        setDraft(`${c.key} `);
                        requestAnimationFrame(() => textareaRef.current?.focus());
                      }}
                    >
                      <span style={{ fontFamily: "var(--font-code)", fontSize: 14, fontWeight: 600 }}>{c.key}</span>
                      <span style={{ fontSize: 13, color: "var(--neutral-on-background-weak)" }}>{c.hint}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="chat-field" style={styles.field}>
            <button
              type="button"
              className="chat-btn"
              style={styles.iconBtn}
              aria-label="Open emoji picker"
              aria-haspopup="dialog"
              aria-expanded={emojiOpen}
              aria-controls={emojiOpen ? emojiPanelId : undefined}
              onClick={() => {
                setCommandsOpen(false);
                setEmojiOpen((o) => !o);
              }}
            >
              <span aria-hidden="true">😊</span>
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              style={styles.textarea}
              value={draft}
              placeholder="Message #checkout-redesign"
              aria-label="Message"
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={onTextareaKey}
              onFocus={() => setEmojiOpen(false)}
            />
            <button
              type="button"
              className="chat-btn"
              style={styles.iconBtn}
              aria-label="Open command palette"
              aria-haspopup="dialog"
              aria-expanded={commandsOpen}
              aria-controls={commandsOpen ? commandPanelId : undefined}
              onClick={() => {
                setEmojiOpen(false);
                setCommandsOpen((o) => !o);
              }}
            >
              <span aria-hidden="true" style={{ fontFamily: "var(--font-code)", fontWeight: 700 }}>
                /
              </span>
            </button>
            <button
              type="button"
              className="chat-send"
              style={styles.sendBtn}
              onClick={send}
              disabled={!draft.trim() || streaming}
              aria-label="Send message"
            >
              <span className="chat-send-label">Send</span>
              <span aria-hidden="true">➤</span>
            </button>
          </div>
          <Text
            variant="body-default-xs"
            onBackground="neutral-weak"
            style={{ display: "block", marginTop: 8 }}
          >
            Press <kbd style={styles.kbd}>Enter</kbd> to send, <kbd style={styles.kbd}>Shift</kbd>+
            <kbd style={styles.kbd}>Enter</kbd> for a new line, or type <kbd style={styles.kbd}>/</kbd> for commands.
          </Text>
        </div>
      </main>
    </div>
  );
}
```