```tsx
"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  ArrowUp,
  Command,
  CornerDownLeft,
  Hash,
  MoonStar,
  Paperclip,
  Search,
  Smile,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

type Author = {
  id: string;
  name: string;
  initials: string;
  color: string;
  role?: string;
};

type Message = {
  id: string;
  authorId: string;
  text: string;
  time: string;
  reactions?: { emoji: string; count: number }[];
};

const AUTHORS: Record<string, Author> = {
  me: { id: "me", name: "You", initials: "YO", color: "bg-indigo-600" },
  maya: { id: "maya", name: "Maya Okafor", initials: "MO", color: "bg-emerald-600", role: "Design" },
  dev: { id: "dev", name: "Devon Park", initials: "DP", color: "bg-amber-600", role: "Engineering" },
  sage: { id: "sage", name: "Sage", initials: "SA", color: "bg-fuchsia-600", role: "Assistant" },
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    authorId: "maya",
    text: "Morning! I pushed the new onboarding illustrations to the shared folder. Could someone sanity-check the dark-mode variants?",
    time: "9:02 AM",
    reactions: [{ emoji: "🎨", count: 2 }],
  },
  {
    id: "m2",
    authorId: "dev",
    text: "On it. The checkout banner still has the old contrast ratio, so I'll fix that in the same PR.",
    time: "9:05 AM",
  },
  {
    id: "m3",
    authorId: "me",
    text: "Thanks both. Can we land everything before Thursday's release cut?",
    time: "9:06 AM",
  },
  {
    id: "m4",
    authorId: "sage",
    text: "Based on the open tickets, that looks feasible. Three items are still in review and none are blocked. I'd suggest freezing the illustration assets by Wednesday noon to leave time for QA.",
    time: "9:07 AM",
    reactions: [
      { emoji: "👍", count: 3 },
      { emoji: "🚀", count: 1 },
    ],
  },
  {
    id: "m5",
    authorId: "maya",
    text: "Wednesday noon works for me. I'll post a changelog in the thread once the export is final.",
    time: "9:10 AM",
  },
];

const STREAM_REPLY =
  "Here's a quick summary of where things stand: illustrations are final pending dark-mode review, the checkout contrast fix is in progress, and QA has Wednesday afternoon reserved. I'll flag anything that slips past noon.";

const EMOJIS = [
  "😀", "😂", "🙂", "😍", "🤔", "😅", "😎", "🥳",
  "👍", "👏", "🙌", "🙏", "💪", "🎉", "🚀", "🔥",
  "✅", "👀", "💡", "❤️", "📌", "🎨", "☕", "🐛",
];

const EMOJI_LABELS: Record<string, string> = {
  "😀": "grinning face", "😂": "laughing with tears", "🙂": "slightly smiling", "😍": "heart eyes",
  "🤔": "thinking", "😅": "relieved sweat", "😎": "sunglasses", "🥳": "party face",
  "👍": "thumbs up", "👏": "clapping", "🙌": "raised hands", "🙏": "folded hands",
  "💪": "flexed bicep", "🎉": "party popper", "🚀": "rocket", "🔥": "fire",
  "✅": "check mark", "👀": "eyes", "💡": "light bulb", "❤️": "red heart",
  "📌": "pushpin", "🎨": "artist palette", "☕": "coffee", "🐛": "bug",
};

type PaletteCommand = {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  run: "clear" | "summarize" | "focus" | "emoji";
};

const COMMANDS: PaletteCommand[] = [
  { id: "summarize", label: "Summarize this thread", hint: "Ask Sage", icon: <Sparkles className="size-4" aria-hidden="true" />, run: "summarize" },
  { id: "emoji", label: "Open emoji picker", hint: "Insert", icon: <Smile className="size-4" aria-hidden="true" />, run: "emoji" },
  { id: "focus", label: "Jump to message input", hint: "Navigate", icon: <CornerDownLeft className="size-4" aria-hidden="true" />, run: "focus" },
  { id: "clear", label: "Clear conversation", hint: "Destructive", icon: <Trash2 className="size-4" aria-hidden="true" />, run: "clear" },
];

function Avatar({ author, size = "md" }: { author: Author; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "size-8 text-[11px]" : "size-9 text-xs";
  return (
    <span
      aria-hidden="true"
      className={`${dim} ${author.color} inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white`}
    >
      {author.id === "sage" ? <Sparkles className="size-4" /> : author.initials}
    </span>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-slate-400 motion-reduce:animate-none"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [streamText, setStreamText] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [announce, setAnnounce] = useState("");

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const emojiWrapRef = useRef<HTMLDivElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const paletteTriggerRef = useRef<HTMLButtonElement>(null);
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const idCounter = useRef(100);

  const paletteTitleId = useId();
  const listboxId = useId();
  const emojiPopoverId = useId();

  const isStreaming = streamText !== null;

  const stopStream = useCallback(() => {
    if (streamTimer.current) {
      clearInterval(streamTimer.current);
      streamTimer.current = null;
    }
  }, []);

  useEffect(() => stopStream, [stopStream]);

  const nextId = () => {
    idCounter.current += 1;
    return `m${idCounter.current}`;
  };

  const startStream = useCallback(() => {
    stopStream();
    const words = STREAM_REPLY.split(" ");
    let i = 0;
    setStreamText("");
    setAnnounce("Sage is typing a reply");
    streamTimer.current = setInterval(() => {
      i += 1;
      if (i >= words.length) {
        stopStream();
        setStreamText(null);
        setMessages((prev) => [
          ...prev,
          { id: `m${++idCounter.current}`, authorId: "sage", text: STREAM_REPLY, time: "9:14 AM" },
        ]);
        setAnnounce("Sage replied");
        return;
      }
      setStreamText(words.slice(0, i).join(" "));
    }, 90);
  }, [stopStream]);

  const stopGenerating = () => {
    stopStream();
    setStreamText((current) => {
      if (current && current.length > 0) {
        const text = current;
        setMessages((prev) => [
          ...prev,
          { id: `m${++idCounter.current}`, authorId: "sage", text: `${text}…`, time: "9:14 AM" },
        ]);
      }
      return null;
    });
    setAnnounce("Generation stopped");
  };

  // Keep the log scrolled to the newest content.
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, streamText]);

  // Auto-resize the textarea.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [draft]);

  const send = () => {
    const text = draft.trim();
    if (!text || isStreaming) return;
    setMessages((prev) => [...prev, { id: nextId(), authorId: "me", text, time: "9:13 AM" }]);
    setDraft("");
    setEmojiOpen(false);
    startStream();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send();
  };

  const onInputKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const insertEmoji = (emoji: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? draft.length;
    const end = el?.selectionEnd ?? draft.length;
    const next = draft.slice(0, start) + emoji + draft.slice(end);
    setDraft(next);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
  };

  // Global shortcut: Cmd/Ctrl+K toggles the palette.
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

  // Emoji popover: close on outside click / Escape.
  useEffect(() => {
    if (!emojiOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (emojiWrapRef.current?.contains(t) || emojiBtnRef.current?.contains(t)) return;
      setEmojiOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setEmojiOpen(false);
        emojiBtnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [emojiOpen]);

  // Palette: focus input on open, reset state on close.
  useEffect(() => {
    if (paletteOpen) {
      setQuery("");
      setActiveIdx(0);
      requestAnimationFrame(() => paletteInputRef.current?.focus());
    }
  }, [paletteOpen]);

  const closePalette = useCallback(() => {
    setPaletteOpen(false);
    requestAnimationFrame(() => paletteTriggerRef.current?.focus());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? COMMANDS.filter((c) => c.label.toLowerCase().includes(q)) : COMMANDS;
  }, [query]);

  const runCommand = (cmd: PaletteCommand) => {
    setPaletteOpen(false);
    switch (cmd.run) {
      case "clear":
        stopStream();
        setStreamText(null);
        setMessages([]);
        setAnnounce("Conversation cleared");
        requestAnimationFrame(() => inputRef.current?.focus());
        break;
      case "summarize":
        if (!isStreaming) {
          setMessages((prev) => [
            ...prev,
            { id: nextId(), authorId: "me", text: "/summarize Give me a summary of this thread.", time: "9:13 AM" },
          ]);
          startStream();
        }
        requestAnimationFrame(() => inputRef.current?.focus());
        break;
      case "emoji":
        setEmojiOpen(true);
        requestAnimationFrame(() => emojiBtnRef.current?.focus());
        break;
      case "focus":
        requestAnimationFrame(() => inputRef.current?.focus());
        break;
    }
  };

  const onPaletteKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filtered.length) setActiveIdx((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filtered.length) setActiveIdx((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[activeIdx];
      if (cmd) runCommand(cmd);
    } else if (e.key === "Tab") {
      // Keep focus inside the dialog: the search input is its only tab stop.
      e.preventDefault();
    }
  };

  return (
    <div className="flex h-dvh w-full items-stretch justify-center bg-slate-100 text-slate-900 sm:p-4 lg:p-6">
      <main className="flex h-full w-full max-w-4xl flex-col overflow-hidden bg-white shadow-xl ring-1 ring-slate-200 sm:rounded-2xl">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Hash className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold leading-tight">release-thursday</h1>
              <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                <Users className="size-3.5 shrink-0" aria-hidden="true" />
                4 members · Design sync and release prep
              </p>
            </div>
          </div>
          <button
            ref={paletteTriggerRef}
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-haspopup="dialog"
            aria-keyshortcuts="Control+K Meta+K"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Search className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Commands</span>
            <span className="sr-only sm:hidden">Open command palette</span>
            <kbd className="hidden items-center gap-0.5 rounded border border-slate-300 bg-white px-1.5 py-0.5 font-sans text-[11px] font-medium text-slate-500 sm:inline-flex">
              <Command className="size-3" aria-hidden="true" />K
            </kbd>
          </button>
        </header>

        {/* Message log */}
        <div className="relative min-h-0 flex-1">
          <div
            role="log"
            aria-label="Conversation"
            aria-relevant="additions"
            tabIndex={0}
            className="h-full overflow-y-auto px-4 py-5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:px-6"
          >
            <div className="mb-5 flex items-center gap-3 text-xs text-slate-400" aria-hidden="true">
              <span className="h-px flex-1 bg-slate-200" />
              Today
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            {messages.length === 0 && !isStreaming && (
              <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-500">
                <MoonStar className="size-8 text-slate-300" aria-hidden="true" />
                <p className="text-sm font-medium text-slate-700">Nothing here yet</p>
                <p className="max-w-xs text-sm">
                  Say hello to the team, or press <kbd className="rounded border border-slate-300 px-1 font-sans text-xs">Ctrl K</kbd> to see what you can do.
                </p>
              </div>
            )}

            <ul className="flex flex-col gap-5">
              {messages.map((m, idx) => {
                const author = AUTHORS[m.authorId];
                const mine = author.id === "me";
                const prev = messages[idx - 1];
                const grouped = prev?.authorId === m.authorId;
                return (
                  <li
                    key={m.id}
                    className={`flex items-end gap-3 ${mine ? "flex-row-reverse" : ""} ${grouped ? "-mt-3" : ""}`}
                  >
                    <div className={grouped ? "invisible" : ""}>
                      <Avatar author={author} />
                    </div>
                    <div className={`flex min-w-0 max-w-[85%] flex-col sm:max-w-[75%] ${mine ? "items-end" : "items-start"}`}>
                      {!grouped && (
                        <p className="mb-1 flex items-baseline gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-slate-800">{author.name}</span>
                          {author.role && <span>{author.role}</span>}
                          <time>{m.time}</time>
                        </p>
                      )}
                      <p
                        className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          mine
                            ? "rounded-br-md bg-indigo-600 text-white"
                            : "rounded-bl-md bg-slate-100 text-slate-800"
                        }`}
                      >
                        {m.text}
                      </p>
                      {m.reactions && (
                        <ul className="mt-1 flex gap-1" aria-label="Reactions">
                          {m.reactions.map((r) => (
                            <li
                              key={r.emoji}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600"
                            >
                              <span aria-hidden="true">{r.emoji}</span>
                              <span>{r.count}</span>
                              <span className="sr-only">{r.count === 1 ? "reaction" : "reactions"}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}

              {isStreaming && (
                <li className="flex items-end gap-3" aria-label="Sage is typing">
                  <Avatar author={AUTHORS.sage} />
                  <div className="flex min-w-0 max-w-[85%] flex-col items-start sm:max-w-[75%]">
                    <p className="mb-1 flex items-baseline gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">Sage</span>
                      <span>Assistant</span>
                      <span className="text-fuchsia-600">typing…</span>
                    </p>
                    <div className="rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-2 text-sm leading-relaxed text-slate-800">
                      {streamText ? (
                        <span aria-hidden="true">
                          {streamText}
                          <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-slate-500 motion-reduce:animate-none" />
                        </span>
                      ) : (
                        <TypingDots />
                      )}
                    </div>
                  </div>
                </li>
              )}
            </ul>
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Live region for status changes */}
        <p role="status" aria-live="polite" className="sr-only">
          {announce}
        </p>

        {/* Input bar */}
        <div className="border-t border-slate-200 bg-white px-3 pb-3 pt-3 sm:px-6 sm:pb-4">
          <form onSubmit={onSubmit} className="relative">
            {emojiOpen && (
              <div
                ref={emojiWrapRef}
                id={emojiPopoverId}
                role="dialog"
                aria-label="Emoji picker"
                className="absolute bottom-full left-0 z-10 mb-2 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
              >
                <ul className="grid grid-cols-8 gap-0.5">
                  {EMOJIS.map((emoji) => (
                    <li key={emoji}>
                      <button
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        aria-label={EMOJI_LABELS[emoji] ?? emoji}
                        className="flex size-8 items-center justify-center rounded-md text-lg transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
                      >
                        <span aria-hidden="true">{emoji}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-end gap-1.5 rounded-2xl border border-slate-300 bg-white p-1.5 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/30">
              <button
                type="button"
                aria-label="Attach a file (not available in this demo)"
                disabled
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-400 disabled:cursor-not-allowed"
              >
                <Paperclip className="size-5" aria-hidden="true" />
              </button>
              <button
                ref={emojiBtnRef}
                type="button"
                onClick={() => setEmojiOpen((o) => !o)}
                aria-label="Emoji picker"
                aria-haspopup="dialog"
                aria-expanded={emojiOpen}
                aria-controls={emojiOpen ? emojiPopoverId : undefined}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                <Smile className="size-5" aria-hidden="true" />
              </button>

              <label htmlFor="chat-input" className="sr-only">
                Message #release-thursday
              </label>
              <textarea
                id="chat-input"
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Message #release-thursday"
                className="max-h-36 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-5 text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />

              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopGenerating}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-slate-800 px-3 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800"
                >
                  <span aria-hidden="true" className="size-2.5 rounded-sm bg-white" />
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={draft.trim().length === 0}
                  aria-label="Send message"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <ArrowUp className="size-5" aria-hidden="true" />
                </button>
              )}
            </div>
          </form>

          <p className="mt-2 hidden items-center gap-3 px-1 text-xs text-slate-500 sm:flex">
            <span>
              <kbd className="rounded border border-slate-300 bg-slate-50 px-1 font-sans">Enter</kbd> to send
            </span>
            <span>
              <kbd className="rounded border border-slate-300 bg-slate-50 px-1 font-sans">Shift</kbd>
              {" + "}
              <kbd className="rounded border border-slate-300 bg-slate-50 px-1 font-sans">Enter</kbd> for a new line
            </span>
            <span className="ml-auto">
              <kbd className="rounded border border-slate-300 bg-slate-50 px-1 font-sans">Ctrl</kbd>
              {" / "}
              <kbd className="rounded border border-slate-300 bg-slate-50 px-1 font-sans">⌘</kbd>
              {" + "}
              <kbd className="rounded border border-slate-300 bg-slate-50 px-1 font-sans">K</kbd> for commands
            </span>
          </p>
        </div>
      </main>

      {/* Command palette */}
      {paletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-[12vh]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closePalette();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={paletteTitleId}
            onKeyDown={onPaletteKeyDown}
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
          >
            <h2 id={paletteTitleId} className="sr-only">
              Command palette
            </h2>
            <div className="flex items-center gap-2 border-b border-slate-200 px-4">
              <Search className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
              <input
                ref={paletteInputRef}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={listboxId}
                aria-activedescendant={filtered[activeIdx] ? `${listboxId}-${filtered[activeIdx].id}` : undefined}
                aria-autocomplete="list"
                aria-label="Search commands"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIdx(0);
                }}
                placeholder="Type a command…"
                className="h-12 w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <kbd className="rounded border border-slate-300 px-1.5 py-0.5 font-sans text-[11px] text-slate-500">Esc</kbd>
            </div>
            <ul id={listboxId} role="listbox" aria-label="Commands" className="max-h-72 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <li role="presentation" className="px-3 py-6 text-center text-sm text-slate-500">
                  No commands match “{query}”.
                </li>
              )}
              {filtered.map((cmd, i) => (
                <li
                  key={cmd.id}
                  id={`${listboxId}-${cmd.id}`}
                  role="option"
                  aria-selected={i === activeIdx}
                  onMouseMove={() => setActiveIdx(i)}
                  onClick={() => runCommand(cmd)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                    i === activeIdx ? "bg-indigo-50 text-indigo-900" : "text-slate-700"
                  }`}
                >
                  <span className={i === activeIdx ? "text-indigo-600" : "text-slate-400"}>{cmd.icon}</span>
                  <span className="flex-1">{cmd.label}</span>
                  <span className="text-xs text-slate-400">{cmd.hint}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
```