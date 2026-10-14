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
  Command,
  CornerDownLeft,
  Hash,
  Search,
  SendHorizontal,
  Smile,
  Users,
  Paperclip,
  Sparkles,
} from "lucide-react";

type Author = {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
};

type Message = {
  id: string;
  authorId: string;
  text: string;
  time: string;
  reactions?: { emoji: string; count: number }[];
};

const AUTHORS: Record<string, Author> = {
  me: {
    id: "me",
    name: "You",
    role: "Product Designer",
    initials: "YO",
    color: "bg-indigo-600",
  },
  priya: {
    id: "priya",
    name: "Priya Raman",
    role: "Engineering Manager",
    initials: "PR",
    color: "bg-emerald-600",
  },
  tomas: {
    id: "tomas",
    name: "Tomás Herrera",
    role: "Frontend Engineer",
    initials: "TH",
    color: "bg-amber-600",
  },
  aiko: {
    id: "aiko",
    name: "Aiko Tanaka",
    role: "QA Lead",
    initials: "AT",
    color: "bg-rose-600",
  },
  assistant: {
    id: "assistant",
    name: "Relay Assistant",
    role: "AI helper",
    initials: "RA",
    color: "bg-slate-700",
  },
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    authorId: "priya",
    text: "Morning all! The release branch for 2.8 is cut. Can everyone confirm their tickets are merged before noon?",
    time: "9:02 AM",
    reactions: [{ emoji: "👍", count: 3 }],
  },
  {
    id: "m2",
    authorId: "tomas",
    text: "Checkout redesign is merged. I'm still fixing a flaky test in the address form, should land within the hour.",
    time: "9:05 AM",
  },
  {
    id: "m3",
    authorId: "aiko",
    text: "I ran the regression suite on staging last night. 212 passed, 2 failed, both in the address form. Tomás, that matches what you're seeing.",
    time: "9:11 AM",
    reactions: [
      { emoji: "🎯", count: 2 },
      { emoji: "🙏", count: 1 },
    ],
  },
  {
    id: "m4",
    authorId: "me",
    text: "Design QA on the new empty states is done. I left two small spacing notes in the Figma file, nothing blocking.",
    time: "9:18 AM",
  },
  {
    id: "m5",
    authorId: "priya",
    text: "Perfect. @Relay can you draft the release notes from the merged pull requests?",
    time: "9:20 AM",
  },
  {
    id: "m6",
    authorId: "assistant",
    text: "Here's a first pass for 2.8:\n• Redesigned checkout with saved addresses\n• Faster search results on mobile\n• New empty states across the dashboard\n• Fixed a rounding issue in invoice totals",
    time: "9:21 AM",
  },
];

const EMOJIS: { char: string; label: string }[] = [
  { char: "😀", label: "Grinning face" },
  { char: "😂", label: "Tears of joy" },
  { char: "😊", label: "Smiling face" },
  { char: "😍", label: "Heart eyes" },
  { char: "🤔", label: "Thinking face" },
  { char: "😅", label: "Sweat smile" },
  { char: "😎", label: "Sunglasses" },
  { char: "🥳", label: "Party face" },
  { char: "👍", label: "Thumbs up" },
  { char: "👏", label: "Clapping hands" },
  { char: "🙌", label: "Raised hands" },
  { char: "🙏", label: "Folded hands" },
  { char: "🔥", label: "Fire" },
  { char: "🎉", label: "Party popper" },
  { char: "🚀", label: "Rocket" },
  { char: "✅", label: "Check mark" },
  { char: "💡", label: "Light bulb" },
  { char: "👀", label: "Eyes" },
  { char: "❤️", label: "Red heart" },
  { char: "✨", label: "Sparkles" },
];

const COMMANDS: { name: string; description: string }[] = [
  { name: "/summarize", description: "Summarize the last 50 messages" },
  { name: "/remind", description: "Set a reminder for this channel" },
  { name: "/poll", description: "Create a quick poll" },
  { name: "/assign", description: "Assign a task to a teammate" },
];

const CANNED_REPLY =
  "Thanks for the update! I've added that to the release checklist. Two items are still open: the address form fix and the final sign-off from QA. I'll post here once both are green.";

function Avatar({ author, size = "md" }: { author: Author; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-xs sm:h-10 sm:w-10 sm:text-sm";
  return (
    <span
      aria-hidden="true"
      className={`${dims} ${author.color} inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white`}
    >
      {author.id === "assistant" ? <Sparkles className="h-4 w-4" /> : author.initials}
    </span>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 motion-reduce:animate-none"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [activeCommand, setActiveCommand] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerButtonRef = useRef<HTMLButtonElement>(null);
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const idCounter = useRef(0);

  const pickerId = useId();
  const paletteTitleId = useId();
  const listboxId = useId();

  const isStreaming = streamingText !== null;

  const nextId = useCallback(() => {
    idCounter.current += 1;
    return `local-${idCounter.current}`;
  }, []);

  // Auto-scroll to latest content.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight });
  }, [messages, streamingText]);

  // Clean up streaming timer on unmount.
  useEffect(() => {
    return () => {
      if (streamTimer.current) clearInterval(streamTimer.current);
    };
  }, []);

  // Global shortcut for the command palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus management for palette.
  useEffect(() => {
    if (paletteOpen) {
      setPaletteQuery("");
      setActiveCommand(0);
      paletteInputRef.current?.focus();
    }
  }, [paletteOpen]);

  // Close emoji picker on outside click / Escape.
  useEffect(() => {
    if (!pickerOpen) return;
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (pickerRef.current?.contains(target) || pickerButtonRef.current?.contains(target)) return;
      setPickerOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPickerOpen(false);
        pickerButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen]);

  const filteredCommands = useMemo(() => {
    const q = paletteQuery.trim().toLowerCase().replace(/^\//, "");
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
    );
  }, [paletteQuery]);

  const startStreaming = useCallback(() => {
    const full = CANNED_REPLY;
    let i = 0;
    setStreamingText("");
    streamTimer.current = setInterval(() => {
      i += 3;
      if (i >= full.length) {
        if (streamTimer.current) clearInterval(streamTimer.current);
        streamTimer.current = null;
        setStreamingText(null);
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            authorId: "assistant",
            text: full,
            time: formatTime(new Date()),
          },
        ]);
      } else {
        setStreamingText(full.slice(0, i));
      }
    }, 45);
  }, [nextId]);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || isStreaming) return;
    setMessages((prev) => [
      ...prev,
      { id: nextId(), authorId: "me", text, time: formatTime(new Date()) },
    ]);
    setDraft("");
    setPickerOpen(false);
    startStreaming();
  }, [draft, isStreaming, nextId, startStreaming]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send();
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
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

  const runCommand = (name: string) => {
    setDraft(name + " ");
    setPaletteOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onPaletteKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveCommand((i) => (filteredCommands.length ? (i + 1) % filteredCommands.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveCommand((i) =>
        filteredCommands.length ? (i - 1 + filteredCommands.length) % filteredCommands.length : 0,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filteredCommands[activeCommand];
      if (cmd) runCommand(cmd.name);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setPaletteOpen(false);
      inputRef.current?.focus();
    }
  };

  return (
    <main className="flex h-dvh w-full justify-center bg-slate-100 sm:p-4 lg:p-6">
      <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-sm">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Hash className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-slate-900">release-2-8</h1>
              <p className="truncate text-xs text-slate-600">
                Coordinating the 2.8 launch · Ship date Thursday
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 text-xs text-slate-600 sm:inline-flex">
              <Users className="h-4 w-4" aria-hidden="true" />
              12 members
            </span>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              aria-label="Open command palette"
              aria-keyshortcuts="Control+K Meta+K"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Commands</span>
              <kbd className="hidden rounded border border-slate-300 bg-slate-50 px-1.5 font-sans text-[10px] text-slate-600 sm:inline">
                Ctrl K
              </kbd>
            </button>
          </div>
        </header>

        {/* Message list */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-5 sm:px-6"
          role="log"
          aria-label="Conversation"
          aria-live="polite"
          aria-relevant="additions"
          tabIndex={0}
        >
          <div className="mb-5 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-500">Today</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <ul className="space-y-5">
            {messages.map((m, idx) => {
              const author = AUTHORS[m.authorId];
              const isMe = m.authorId === "me";
              const prev = messages[idx - 1];
              const grouped = prev?.authorId === m.authorId;
              return (
                <li
                  key={m.id}
                  className={`flex items-end gap-2.5 sm:gap-3 ${isMe ? "flex-row-reverse" : ""} ${
                    grouped ? "-mt-3" : ""
                  }`}
                >
                  <div className={grouped ? "invisible" : ""}>
                    <Avatar author={author} />
                  </div>
                  <div className={`flex min-w-0 max-w-[85%] flex-col sm:max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                    {!grouped && (
                      <div className={`mb-1 flex items-baseline gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                        <span className="text-sm font-semibold text-slate-900">{author.name}</span>
                        <span className="hidden text-xs text-slate-500 sm:inline">{author.role}</span>
                        <time className="text-xs text-slate-500">{m.time}</time>
                      </div>
                    )}
                    <p
                      className={`whitespace-pre-line break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                        isMe
                          ? "rounded-br-md bg-indigo-600 text-white"
                          : "rounded-bl-md bg-slate-100 text-slate-900"
                      }`}
                    >
                      {m.text}
                    </p>
                    {m.reactions && (
                      <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Reactions">
                        {m.reactions.map((r) => (
                          <li
                            key={r.emoji}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700"
                          >
                            <span aria-hidden="true">{r.emoji}</span>
                            <span>{r.count}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}

            {isStreaming && (
              <li className="flex items-end gap-2.5 sm:gap-3">
                <Avatar author={AUTHORS.assistant} />
                <div className="flex min-w-0 max-w-[85%] flex-col items-start sm:max-w-[75%]">
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-slate-900">Relay Assistant</span>
                    <span className="text-xs text-slate-500">
                      {streamingText ? "writing…" : "thinking…"}
                    </span>
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-2 text-sm leading-relaxed text-slate-900">
                    {streamingText ? (
                      <>
                        {streamingText}
                        <span
                          aria-hidden="true"
                          className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-slate-500 motion-reduce:animate-none"
                        />
                      </>
                    ) : (
                      <TypingDots />
                    )}
                  </div>
                </div>
              </li>
            )}
          </ul>
        </div>

        {/* Status line for screen readers */}
        <p className="sr-only" role="status">
          {isStreaming ? "Relay Assistant is typing" : ""}
        </p>

        {/* Input bar */}
        <div className="border-t border-slate-200 bg-white px-3 pb-3 pt-3 sm:px-6 sm:pb-4">
          <form onSubmit={onSubmit} className="relative">
            {pickerOpen && (
              <div
                ref={pickerRef}
                id={pickerId}
                role="dialog"
                aria-label="Emoji picker"
                className="absolute bottom-full left-0 mb-2 w-[17.5rem] rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
              >
                <ul className="grid grid-cols-5 gap-1">
                  {EMOJIS.map((e) => (
                    <li key={e.label}>
                      <button
                        type="button"
                        onClick={() => insertEmoji(e.char)}
                        aria-label={e.label}
                        title={e.label}
                        className="flex h-11 w-full items-center justify-center rounded-lg text-xl hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
                      >
                        <span aria-hidden="true">{e.char}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-end gap-1.5 rounded-2xl border border-slate-300 bg-white px-2 py-2 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/30">
              <button
                type="button"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
                aria-label="Attach a file"
              >
                <Paperclip className="h-5 w-5" aria-hidden="true" />
              </button>
              <label htmlFor="message-input" className="sr-only">
                Message #release-2-8
              </label>
              <textarea
                id="message-input"
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Message #release-2-8"
                className="max-h-32 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
              />
              <button
                ref={pickerButtonRef}
                type="button"
                onClick={() => setPickerOpen((o) => !o)}
                aria-label="Insert emoji"
                aria-haspopup="dialog"
                aria-expanded={pickerOpen}
                aria-controls={pickerOpen ? pickerId : undefined}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                <Smile className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="submit"
                disabled={!draft.trim() || isStreaming}
                aria-label="Send message"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <SendHorizontal className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </form>

          <p className="mt-2 hidden items-center gap-1.5 text-xs text-slate-600 sm:flex">
            <Command className="h-3.5 w-3.5" aria-hidden="true" />
            Press{" "}
            <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 font-sans text-[11px]">
              Ctrl K
            </kbd>{" "}
            for commands, or type{" "}
            <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 font-sans text-[11px]">
              /
            </kbd>{" "}
            to browse them.
            <span className="ml-auto inline-flex items-center gap-1">
              <CornerDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Enter to send · Shift+Enter for new line
            </span>
          </p>
        </div>
      </div>

      {/* Command palette */}
      {paletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 pt-[15vh]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPaletteOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={paletteTitleId}
            className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            <h2 id={paletteTitleId} className="sr-only">
              Command palette
            </h2>
            <div className="flex items-center gap-2 border-b border-slate-200 px-3">
              <Search className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <input
                ref={paletteInputRef}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={listboxId}
                aria-activedescendant={
                  filteredCommands[activeCommand] ? `${listboxId}-${activeCommand}` : undefined
                }
                aria-label="Search commands"
                value={paletteQuery}
                onChange={(e) => {
                  setPaletteQuery(e.target.value);
                  setActiveCommand(0);
                }}
                onKeyDown={onPaletteKeyDown}
                placeholder="Search commands…"
                className="h-12 min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
              />
              <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 font-sans text-[11px] text-slate-600">
                Esc
              </kbd>
            </div>
            <ul id={listboxId} role="listbox" aria-label="Commands" className="max-h-72 overflow-y-auto p-2">
              {filteredCommands.length === 0 && (
                <li role="presentation" className="px-3 py-6 text-center text-sm text-slate-600">
                  No commands match “{paletteQuery}”.
                </li>
              )}
              {filteredCommands.map((c, i) => (
                <li
                  key={c.name}
                  id={`${listboxId}-${i}`}
                  role="option"
                  aria-selected={i === activeCommand}
                  onMouseEnter={() => setActiveCommand(i)}
                  onClick={() => runCommand(c.name)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm ${
                    i === activeCommand ? "bg-indigo-50 text-indigo-900" : "text-slate-800"
                  }`}
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="truncate text-xs text-slate-600">{c.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}

function formatTime(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${suffix}`;
}
