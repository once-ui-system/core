The package isn't available locally, so I'll stick to Once UI APIs I'm confident about (Flex, Column, Row, Text, Avatar, Button, IconButton, Input-free native textarea, Kbd, Tag, Line) and keep props conservative. I'll use native elements for the input and the emoji popover to minimise type risk.

```tsx
"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Avatar, Button, Column, Flex, IconButton, Row, Text } from "@once-ui-system/core";

type Author = "me" | "maya" | "dev" | "assistant";

interface Person {
  name: string;
  role: string;
  initials: string;
  hue: number;
}

interface Message {
  id: number;
  author: Author;
  time: string;
  text: string;
}

const PEOPLE: Record<Author, Person> = {
  me: { name: "You", role: "Product designer", initials: "YO", hue: 220 },
  maya: { name: "Maya Okafor", role: "Engineering manager", initials: "MO", hue: 340 },
  dev: { name: "Dev Patel", role: "Backend engineer", initials: "DP", hue: 150 },
  assistant: { name: "Sage", role: "AI assistant", initials: "SG", hue: 265 },
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    author: "maya",
    time: "09:12",
    text: "Morning! The staging deploy for the billing revamp finished. Can someone sanity-check the invoice PDF layout before we ping finance?",
  },
  {
    id: 2,
    author: "dev",
    time: "09:14",
    text: "On it. I'll also run the migration dry-run against last month's data to make sure the tax rounding still matches.",
  },
  {
    id: 3,
    author: "me",
    time: "09:18",
    text: "Checked the PDF on A4 and Letter. Header spacing looks off by a few pixels on Letter, otherwise great. 🎉",
  },
  {
    id: 4,
    author: "assistant",
    time: "09:19",
    text: "I compared both renders: the Letter header sits 6px lower because the logo block uses a fixed height. Switching it to min-height and trimming the top margin to 18px should align them.",
  },
  {
    id: 5,
    author: "maya",
    time: "09:21",
    text: "Perfect, thanks Sage. Dev, can you fold that into the release branch once the dry-run is green?",
  },
];

const EMOJIS: { char: string; label: string }[] = [
  { char: "😀", label: "Grinning face" },
  { char: "😂", label: "Face with tears of joy" },
  { char: "😍", label: "Heart eyes" },
  { char: "🤔", label: "Thinking face" },
  { char: "😎", label: "Smiling face with sunglasses" },
  { char: "🙌", label: "Raising hands" },
  { char: "👍", label: "Thumbs up" },
  { char: "👀", label: "Eyes" },
  { char: "🎉", label: "Party popper" },
  { char: "🚀", label: "Rocket" },
  { char: "🔥", label: "Fire" },
  { char: "✅", label: "Check mark" },
  { char: "💡", label: "Light bulb" },
  { char: "❤️", label: "Red heart" },
  { char: "🙏", label: "Folded hands" },
  { char: "☕", label: "Hot beverage" },
];

const REPLIES: string[] = [
  "Got it. I'll draft that now and share a summary in the thread once it's ready for review.",
  "Good call. One thing to watch: the same change touches the export job, so I'd add a regression test there too.",
  "Makes sense. I've noted it down and flagged the open question about Letter-size margins for the next standup.",
];

const COMMANDS: { cmd: string; hint: string }[] = [
  { cmd: "/summarize", hint: "Summarize this thread" },
  { cmd: "/assign", hint: "Assign a follow-up" },
  { cmd: "/remind", hint: "Set a reminder" },
];

function nowLabel(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function PersonAvatar({ person, size }: { person: Person; size: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 600,
        color: "#fff",
        background: `linear-gradient(135deg, hsl(${person.hue} 70% 55%), hsl(${(person.hue + 40) % 360} 65% 42%))`,
      }}
    >
      {person.initials}
    </div>
  );
}

function TypingDots() {
  return (
    <span className="chat-dots" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const listEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiWrapRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(INITIAL_MESSAGES.length + 1);
  const replyIndex = useRef(0);
  const timers = useRef<number[]>([]);

  const emojiPanelId = useId();
  const paletteId = useId();
  const inputId = useId();

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, streamText, streaming]);

  // Close emoji picker on outside click / Escape.
  useEffect(() => {
    if (!emojiOpen) return;
    const onDown = (e: MouseEvent) => {
      if (emojiWrapRef.current && !emojiWrapRef.current.contains(e.target as Node)) {
        setEmojiOpen(false);
      }
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setEmojiOpen(false);
        textareaRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [emojiOpen]);

  // Global Cmd/Ctrl+K toggles the command palette hint.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const startReply = useCallback(() => {
    const full = REPLIES[replyIndex.current % REPLIES.length];
    replyIndex.current += 1;
    setStreaming(true);
    setStreamText("");
    const words = full.split(" ");
    let i = 0;
    const begin = window.setTimeout(() => {
      const tick = () => {
        i += 1;
        setStreamText(words.slice(0, i).join(" "));
        if (i < words.length) {
          timers.current.push(window.setTimeout(tick, 70));
        } else {
          timers.current.push(
            window.setTimeout(() => {
              setMessages((prev) => [
                ...prev,
                { id: nextId.current++, author: "assistant", time: nowLabel(), text: full },
              ]);
              setStreaming(false);
              setStreamText("");
            }, 200),
          );
        }
      };
      tick();
    }, 900);
    timers.current.push(begin);
  }, []);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || streaming) return;
    setMessages((prev) => [...prev, { id: nextId.current++, author: "me", time: nowLabel(), text }]);
    setDraft("");
    setEmojiOpen(false);
    setPaletteOpen(false);
    startReply();
  }, [draft, streaming, startReply]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    send();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
      if (!el) return;
      el.focus();
      const pos = start + char.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const applyCommand = (cmd: string) => {
    setDraft(cmd + " ");
    setPaletteOpen(false);
    textareaRef.current?.focus();
  };

  const showSlashHints = useMemo(() => draft.startsWith("/") && !draft.includes(" "), [draft]);
  const filteredCommands = useMemo(
    () => COMMANDS.filter((c) => c.cmd.startsWith(draft.toLowerCase())),
    [draft],
  );
  const visibleCommands = paletteOpen ? COMMANDS : showSlashHints ? filteredCommands : [];

  return (
    <Flex fillWidth horizontal="center" style={{ minHeight: "100vh" }}>
      <style>{`
        .chat-shell { width: 100%; max-width: 860px; height: 100vh; height: 100dvh; display: flex; flex-direction: column; }
        .chat-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 16px; }
        .chat-bubble { max-width: min(640px, 100%); padding: 10px 14px; border-radius: 16px; line-height: 1.5; font-size: 15px; word-break: break-word; white-space: pre-wrap; }
        .chat-bubble.other { background: var(--neutral-alpha-weak); border: 1px solid var(--neutral-alpha-medium); border-top-left-radius: 4px; color: var(--neutral-on-background-strong); }
        .chat-bubble.mine { background: var(--brand-solid-strong, #3b5bdb); color: #fff; border-top-right-radius: 4px; }
        .chat-dots { display: inline-flex; gap: 4px; align-items: center; }
        .chat-dots span { width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: .35; animation: chat-bounce 1.2s infinite ease-in-out; }
        .chat-dots span:nth-child(2) { animation-delay: .15s; }
        .chat-dots span:nth-child(3) { animation-delay: .3s; }
        @keyframes chat-bounce { 0%, 80%, 100% { opacity: .3; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
        .chat-caret { display: inline-block; width: 2px; height: 1em; margin-left: 2px; vertical-align: text-bottom; background: currentColor; animation: chat-blink 1s steps(2) infinite; }
        @keyframes chat-blink { 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .chat-dots span, .chat-caret { animation: none; } }
        .chat-input-wrap { border: 1px solid var(--neutral-alpha-medium); background: var(--surface-background, var(--page-background)); border-radius: 16px; padding: 8px; transition: border-color .15s, box-shadow .15s; }
        .chat-input-wrap:focus-within { border-color: var(--brand-alpha-strong, #3b5bdb); box-shadow: 0 0 0 3px var(--brand-alpha-weak, rgba(59,91,219,.2)); }
        .chat-textarea { width: 100%; resize: none; border: 0; outline: 0; background: transparent; color: var(--neutral-on-background-strong); font: inherit; font-size: 15px; line-height: 1.5; padding: 6px 8px; max-height: 140px; }
        .chat-textarea::placeholder { color: var(--neutral-on-background-weak); }
        .chat-icon-btn { all: unset; box-sizing: border-box; width: 36px; height: 36px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; color: var(--neutral-on-background-medium); }
        .chat-icon-btn:hover { background: var(--neutral-alpha-weak); }
        .chat-icon-btn:focus-visible, .chat-emoji:focus-visible, .chat-cmd:focus-visible, .chat-kbd-btn:focus-visible { outline: 2px solid var(--brand-solid-strong, #3b5bdb); outline-offset: 2px; }
        .chat-popover { position: absolute; bottom: calc(100% + 10px); left: 0; z-index: 10; background: var(--page-background); border: 1px solid var(--neutral-alpha-medium); border-radius: 14px; box-shadow: 0 12px 32px rgba(0,0,0,.25); padding: 10px; }
        .chat-emoji-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; }
        @media (max-width: 480px) { .chat-emoji-grid { grid-template-columns: repeat(4, 1fr); } }
        .chat-emoji { all: unset; box-sizing: border-box; width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; font-size: 22px; border-radius: 8px; cursor: pointer; }
        .chat-emoji:hover { background: var(--neutral-alpha-weak); }
        .chat-cmd { all: unset; box-sizing: border-box; display: flex; gap: 12px; align-items: baseline; width: 100%; padding: 8px 10px; border-radius: 8px; cursor: pointer; color: var(--neutral-on-background-strong); font-size: 14px; }
        .chat-cmd:hover { background: var(--neutral-alpha-weak); }
        .chat-cmd code { font-family: var(--font-code); color: var(--brand-on-background-strong, inherit); }
        .chat-kbd { font-family: var(--font-code); font-size: 12px; padding: 2px 6px; border: 1px solid var(--neutral-alpha-strong); border-bottom-width: 2px; border-radius: 6px; color: var(--neutral-on-background-medium); background: var(--neutral-alpha-weak); }
        .chat-kbd-btn { all: unset; cursor: pointer; display: inline-flex; gap: 6px; align-items: center; border-radius: 8px; padding: 2px 4px; color: var(--neutral-on-background-weak); font-size: 12px; }
        .chat-kbd-btn:hover { color: var(--neutral-on-background-strong); }
        .chat-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        .chat-send { all: unset; box-sizing: border-box; height: 36px; padding: 0 16px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; background: var(--brand-solid-strong, #3b5bdb); color: #fff; display: inline-flex; align-items: center; }
        .chat-send:disabled { opacity: .45; cursor: not-allowed; }
        .chat-send:focus-visible { outline: 2px solid var(--brand-solid-strong, #3b5bdb); outline-offset: 2px; }
        @media (max-width: 480px) { .chat-hide-sm { display: none !important; } .chat-scroll { padding: 12px; } }
      `}</style>

      <div className="chat-shell">
        {/* Header */}
        <Row
          as="header"
          fillWidth
          paddingX="16"
          paddingY="12"
          vertical="center"
          gap="12"
          style={{ borderBottom: "1px solid var(--neutral-alpha-medium)" }}
        >
          <PersonAvatar person={PEOPLE.assistant} size={40} />
          <Column flex={1} gap="2" style={{ minWidth: 0 }}>
            <Text as="h1" variant="heading-strong-m" onBackground="neutral-strong">
              #billing-revamp
            </Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Maya, Dev, Sage and you · 4 members
            </Text>
          </Column>
          <Row gap="4" className="chat-hide-sm" vertical="center">
            <button
              type="button"
              className="chat-kbd-btn"
              onClick={() => setPaletteOpen((v) => !v)}
              aria-expanded={paletteOpen}
              aria-controls={paletteId}
              aria-label="Toggle command palette"
            >
              <span className="chat-kbd">⌘K</span>
              <span>Commands</span>
            </button>
          </Row>
        </Row>

        {/* Message list */}
        <div className="chat-scroll" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions">
          <Column gap="16" fillWidth>
            <Row horizontal="center">
              <Text variant="label-default-xs" onBackground="neutral-weak">
                Today
              </Text>
            </Row>

            {messages.map((m) => {
              const person = PEOPLE[m.author];
              const mine = m.author === "me";
              return (
                <Row
                  as="article"
                  key={m.id}
                  fillWidth
                  gap="12"
                  horizontal={mine ? "end" : "start"}
                  style={{ flexDirection: mine ? "row-reverse" : "row" }}
                  aria-label={`${person.name} at ${m.time}`}
                >
                  <PersonAvatar person={person} size={36} />
                  <Column gap="4" style={{ minWidth: 0, maxWidth: "calc(100% - 52px)" }} horizontal={mine ? "end" : "start"}>
                    <Row gap="8" vertical="center" style={{ flexDirection: mine ? "row-reverse" : "row" }}>
                      <Text variant="label-strong-s" onBackground="neutral-strong">
                        {person.name}
                      </Text>
                      <Text variant="label-default-xs" onBackground="neutral-weak">
                        <time>{m.time}</time>
                      </Text>
                    </Row>
                    <div className={`chat-bubble ${mine ? "mine" : "other"}`}>{m.text}</div>
                  </Column>
                </Row>
              );
            })}

            {streaming && (
              <Row fillWidth gap="12" aria-label="Sage is replying">
                <PersonAvatar person={PEOPLE.assistant} size={36} />
                <Column gap="4" style={{ minWidth: 0, maxWidth: "calc(100% - 52px)" }}>
                  <Row gap="8" vertical="center">
                    <Text variant="label-strong-s" onBackground="neutral-strong">
                      {PEOPLE.assistant.name}
                    </Text>
                    <Text variant="label-default-xs" onBackground="neutral-weak">
                      {streamText ? "typing…" : "thinking…"}
                    </Text>
                  </Row>
                  <div className="chat-bubble other">
                    {streamText ? (
                      <>
                        {streamText}
                        <span className="chat-caret" aria-hidden="true" />
                      </>
                    ) : (
                      <TypingDots />
                    )}
                  </div>
                </Column>
              </Row>
            )}
            <div ref={listEndRef} />
          </Column>
        </div>

        <span className="chat-sr" role="status">
          {streaming ? "Sage is typing a reply" : ""}
        </span>

        {/* Composer */}
        <form onSubmit={onSubmit} style={{ padding: "8px 16px 16px" }}>
          <div style={{ position: "relative" }}>
            {visibleCommands.length > 0 && (
              <div id={paletteId} className="chat-popover" role="listbox" aria-label="Commands" style={{ left: 0, right: 0 }}>
                <Text variant="label-default-xs" onBackground="neutral-weak" style={{ display: "block", padding: "2px 10px 6px" }}>
                  Commands
                </Text>
                {visibleCommands.map((c) => (
                  <button
                    key={c.cmd}
                    type="button"
                    role="option"
                    aria-selected={false}
                    className="chat-cmd"
                    onClick={() => applyCommand(c.cmd)}
                  >
                    <code>{c.cmd}</code>
                    <span style={{ color: "var(--neutral-on-background-weak)" }}>{c.hint}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="chat-input-wrap">
              <label htmlFor={inputId} className="chat-sr">
                Message #billing-revamp
              </label>
              <textarea
                id={inputId}
                ref={textareaRef}
                className="chat-textarea"
                rows={1}
                value={draft}
                placeholder="Message #billing-revamp"
                onChange={(e) => {
                  setDraft(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                }}
                onKeyDown={onKeyDown}
              />
              <Row vertical="center" horizontal="between" paddingTop="4" gap="8">
                <Row gap="4" vertical="center">
                  <div ref={emojiWrapRef} style={{ position: "relative" }}>
                    <button
                      type="button"
                      className="chat-icon-btn"
                      aria-label="Insert emoji"
                      aria-haspopup="true"
                      aria-expanded={emojiOpen}
                      aria-controls={emojiPanelId}
                      onClick={() => setEmojiOpen((v) => !v)}
                    >
                      <span aria-hidden="true">😊</span>
                    </button>
                    {emojiOpen && (
                      <div id={emojiPanelId} className="chat-popover" role="group" aria-label="Emoji picker">
                        <div className="chat-emoji-grid">
                          {EMOJIS.map((e) => (
                            <button
                              key={e.char}
                              type="button"
                              className="chat-emoji"
                              aria-label={e.label}
                              title={e.label}
                              onClick={() => insertEmoji(e.char)}
                            >
                              <span aria-hidden="true">{e.char}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="chat-icon-btn"
                    aria-label="Show commands"
                    aria-expanded={paletteOpen}
                    aria-controls={paletteId}
                    onClick={() => setPaletteOpen((v) => !v)}
                  >
                    <span aria-hidden="true" style={{ fontFamily: "var(--font-code)", fontSize: 18 }}>
                      /
                    </span>
                  </button>
                </Row>
                <Row gap="12" vertical="center">
                  <span className="chat-hide-sm" style={{ color: "var(--neutral-on-background-weak)", fontSize: 12 }}>
                    <span className="chat-kbd">Enter</span> to send · <span className="chat-kbd">⌘K</span> commands
                  </span>
                  <button type="submit" className="chat-send" disabled={!draft.trim() || streaming}>
                    Send
                  </button>
                </Row>
              </Row>
            </div>
          </div>
        </form>
      </div>
    </Flex>
  );
}
```