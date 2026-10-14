"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  ArrowUp,
  Command,
  Hash,
  Search,
  Smile,
  Sparkles,
  Users,
  X,
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
};

const AUTHORS: Record<string, Author> = {
  me: {
    id: "me",
    name: "You",
    initials: "YO",
    color: "bg-indigo-600",
  },
  priya: {
    id: "priya",
    name: "Priya Raman",
    initials: "PR",
    color: "bg-rose-600",
    role: "Design",
  },
  marcus: {
    id: "marcus",
    name: "Marcus Holloway",
    initials: "MH",
    color: "bg-emerald-700",
    role: "Backend",
  },
  sage: {
    id: "sage",
    name: "Sage",
    initials: "SG",
    color: "bg-amber-600",
    role: "Assistant",
  },
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    authorId: "priya",
    text: "Morning all! I pushed the new onboarding flow mockups to the shared board. Would love eyes on the empty states before standup.",
    time: "9:02 AM",
  },
  {
    id: "m2",
    authorId: "marcus",
    text: "Nice. Looking at them now. The progress stepper reads really well on mobile.",
    time: "9:05 AM",
  },
  {
    id: "m3",
    authorId: "marcus",
    text: "One question: do we want to persist partial answers if someone closes the tab? I can add a draft endpoint this sprint.",
    time: "9:06 AM",
  },
  {
    id: "m4",
    authorId: "me",
    text: "Yes please. Drafts should expire after 7 days so we are not hoarding stale data.",
    time: "9:11 AM",
  },
  {
    id: "m5",
    authorId: "sage",
    text: "Summary so far: Priya shared onboarding mockups, Marcus will build a draft-saving endpoint with a 7-day expiry. Open item: final copy for the empty states.",
    time: "9:12 AM",
  },
  {
    id: "m6",
    authorId: "priya",
    text: "Perfect, I'll draft the copy this afternoon and drop it in the thread. 🙌",
    time: "9:15 AM",
  },
];

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: "Smileys", emojis: ["😀", "😂", "🥹", "😍", "😎", "🤔", "😅", "🥳"] },
  { label: "Gestures", emojis: ["👍", "🙌", "👏", "🙏", "💪", "👀", "🤝", "✌️"] },
  { label: "Objects", emojis: ["🔥", "✨", "🎉", "🚀", "💡", "📌", "✅", "☕"] },
];

const COMMANDS: { name: string; description: string }[] = [
  { name: "/summarize", description: "Summarize the last 50 messages" },
  { name: "/remind", description: "Set a reminder for this channel" },
  { name: "/poll", description: "Create a quick poll" },
  { name: "/status", description: "Update your status" },
];

const SAGE_REPLIES: string[] = [
  "Got it. I'll add that to the sprint notes and flag it for Marcus.",
  "Good call. I can also draft a short changelog entry once it ships.",
  "Noted. Want me to set a reminder for tomorrow's standup?",
];

function Avatar({ author, size = "md" }: { author: Author; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "size-7 text-[10px]" : "size-9 text-xs";
  return (
    <span
      aria-hidden="true"
      className={`${dims} ${author.color} inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white`}
    >
      {author.id === "sage" ? <Sparkles className="size-4" /> : author.initials}
    </span>
  );
}

function StreamingIndicator({ author }: { author: Author }) {
  return (
    <li className="flex items-end gap-3" aria-hidden="true">
      <Avatar author={author} />
      <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
        <span className="flex items-center gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="size-2 animate-bounce rounded-full bg-slate-400 motion-reduce:animate-none"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      </div>
    </li>
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCmd, setActiveCmd] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const emojiWrapRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const replyIndex = useRef(0);
  const counter = useRef(0);

  const emojiPanelId = useId();
  const paletteTitleId = useId();
  const listboxId = useId();

  const filteredCommands = useMemo(
    () =>
      COMMANDS.filter((c) =>
        (c.name + " " + c.description).toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );

  // Clear pending timers on unmount.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  // Keep the newest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, streaming, streamText]);

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

  // Focus the palette search when it opens; restore focus when it closes.
  useEffect(() => {
    if (paletteOpen) {
      setQuery("");
      setActiveCmd(0);
      paletteInputRef.current?.focus();
    }
  }, [paletteOpen]);

  // Close emoji picker on outside click or Escape.
  useEffect(() => {
    if (!emojiOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!emojiWrapRef.current?.contains(e.target as Node)) setEmojiOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setEmojiOpen(false);
        emojiButtonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [emojiOpen]);

  const closePalette = useCallback(() => {
    setPaletteOpen(false);
    inputRef.current?.focus();
  }, []);

  const streamReply = useCallback(() => {
    const reply = SAGE_REPLIES[replyIndex.current % SAGE_REPLIES.length];
    replyIndex.current += 1;
    setStreaming(true);
    setStreamText("");
    const words = reply.split(" ");
    let i = 0;
    const startDelay = window.setTimeout(function tick() {
      i += 1;
      setStreamText(words.slice(0, i).join(" "));
      if (i < words.length) {
        timers.current.push(window.setTimeout(tick, 70));
      } else {
        timers.current.push(
          window.setTimeout(() => {
            counter.current += 1;
            setMessages((m) => [
              ...m,
              {
                id: `s${counter.current}`,
                authorId: "sage",
                text: reply,
                time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
              },
            ]);
            setStreaming(false);
            setStreamText("");
          }, 200),
        );
      }
    }, 1200);
    timers.current.push(startDelay);
  }, []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;
      counter.current += 1;
      setMessages((m) => [
        ...m,
        {
          id: `u${counter.current}`,
          authorId: "me",
          text: trimmed,
          time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        },
      ]);
      setDraft("");
      setEmojiOpen(false);
      streamReply();
    },
    [streaming, streamReply],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  const onInputKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(draft);
    }
  };

  const insertEmoji = (emoji: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? draft.length;
    const end = el?.selectionEnd ?? draft.length;
    setDraft(draft.slice(0, start) + emoji + draft.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + emoji.length;
      el?.setSelectionRange(pos, pos);
    });
  };

  const runCommand = (name: string) => {
    setDraft(name + " ");
    closePalette();
  };

  const onPaletteKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredCommands.length) setActiveCmd((i) => (i + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredCommands.length)
        setActiveCmd((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filteredCommands[activeCmd];
      if (cmd) runCommand(cmd.name);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col bg-slate-50 shadow-xl sm:my-4 sm:overflow-hidden sm:rounded-2xl sm:ring-1 sm:ring-slate-200">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Hash className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold sm:text-base">product-onboarding</h1>
              <p className="flex items-center gap-1 truncate text-xs text-slate-600">
                <Users className="size-3.5 shrink-0" aria-hidden="true" />
                4 members · 3 online
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            aria-label="Open command palette"
            aria-haspopup="dialog"
          >
            <Search className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Commands</span>
            <kbd className="hidden items-center gap-0.5 rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-sans text-[11px] text-slate-700 sm:inline-flex">
              <Command className="size-3" aria-hidden="true" />K
            </kbd>
          </button>
        </header>

        {/* Message list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5" tabIndex={0} aria-label="Conversation">
          <div className="mb-5 flex items-center gap-3 text-xs text-slate-600" aria-hidden="true">
            <span className="h-px flex-1 bg-slate-200" />
            Today
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <ul className="flex flex-col gap-4" role="log" aria-live="polite" aria-label="Messages">
            {messages.map((m, idx) => {
              const author = AUTHORS[m.authorId];
              const mine = m.authorId === "me";
              const prev = messages[idx - 1];
              const grouped = prev?.authorId === m.authorId;
              return (
                <li
                  key={m.id}
                  className={`flex items-end gap-3 ${mine ? "flex-row-reverse" : ""} ${grouped ? "-mt-2" : ""}`}
                >
                  <div className={grouped ? "invisible" : ""}>
                    <Avatar author={author} />
                  </div>
                  <div className={`flex max-w-[82%] flex-col sm:max-w-[75%] ${mine ? "items-end" : "items-start"}`}>
                    {!grouped && (
                      <p className="mb-1 flex items-baseline gap-2 text-xs">
                        <span className="font-semibold text-slate-800">{author.name}</span>
                        {author.role && <span className="text-slate-600">{author.role}</span>}
                        <time className="text-slate-600">{m.time}</time>
                      </p>
                    )}
                    <p
                      className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        mine
                          ? "rounded-br-sm bg-indigo-600 text-white"
                          : "rounded-bl-sm bg-white text-slate-800 shadow-sm ring-1 ring-slate-200"
                      }`}
                    >
                      {m.text}
                    </p>
                  </div>
                </li>
              );
            })}
            {streaming && streamText && (
              <li className="flex items-end gap-3">
                <Avatar author={AUTHORS.sage} />
                <div className="flex max-w-[82%] flex-col items-start sm:max-w-[75%]">
                  <p className="mb-1 flex items-baseline gap-2 text-xs">
                    <span className="font-semibold text-slate-800">Sage</span>
                    <span className="text-slate-600">Assistant</span>
                  </p>
                  <p className="rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 text-sm leading-relaxed text-slate-800 shadow-sm ring-1 ring-slate-200">
                    {streamText}
                    <span
                      aria-hidden="true"
                      className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-slate-500 motion-reduce:animate-none"
                    />
                  </p>
                </div>
              </li>
            )}
            {streaming && !streamText && <StreamingIndicator author={AUTHORS.sage} />}
          </ul>
          <div ref={endRef} />
        </div>

        {/* Status line for assistive tech */}
        <p className="sr-only" role="status">
          {streaming ? "Sage is typing" : ""}
        </p>

        {/* Input bar */}
        <div className="border-t border-slate-200 bg-white px-3 pb-3 pt-2 sm:px-4">
          <div className="mb-1.5 flex items-center justify-between px-1 text-xs text-slate-600">
            <span aria-live="off" className="min-h-4">
              {streaming ? "Sage is typing…" : "\u00A0"}
            </span>
            <span className="hidden sm:inline">
              Press <kbd className="rounded border border-slate-300 bg-slate-100 px-1 font-sans">Enter</kbd> to send,{" "}
              <kbd className="rounded border border-slate-300 bg-slate-100 px-1 font-sans">Shift</kbd>+
              <kbd className="rounded border border-slate-300 bg-slate-100 px-1 font-sans">Enter</kbd> for a new line
            </span>
          </div>
          <form onSubmit={onSubmit} className="relative flex items-end gap-2">
            <div ref={emojiWrapRef} className="relative">
              <button
                ref={emojiButtonRef}
                type="button"
                onClick={() => setEmojiOpen((o) => !o)}
                aria-label="Insert emoji"
                aria-expanded={emojiOpen}
                aria-controls={emojiOpen ? emojiPanelId : undefined}
                className="inline-flex size-11 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Smile className="size-5" aria-hidden="true" />
              </button>
              {emojiOpen && (
                <div
                  id={emojiPanelId}
                  role="group"
                  aria-label="Emoji picker"
                  className="absolute bottom-full left-0 z-20 mb-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
                >
                  {EMOJI_GROUPS.map((g) => (
                    <div key={g.label} className="mb-2 last:mb-0">
                      <p className="mb-1 text-xs font-medium text-slate-600">{g.label}</p>
                      <div className="grid grid-cols-8 gap-0.5">
                        {g.emojis.map((e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => insertEmoji(e)}
                            aria-label={`Insert ${e}`}
                            className="inline-flex size-8 items-center justify-center rounded-md text-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label htmlFor="chat-input" className="sr-only">
              Message #product-onboarding
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onInputKey}
              placeholder="Message #product-onboarding"
              className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:border-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600"
            />

            <button
              type="submit"
              disabled={!draft.trim() || streaming}
              aria-label="Send message"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              <ArrowUp className="size-5" aria-hidden="true" />
            </button>
          </form>
          <p className="mt-2 px-1 text-xs text-slate-600">
            Tip: type <code className="rounded bg-slate-100 px-1 font-mono">/</code> or press{" "}
            <kbd className="rounded border border-slate-300 bg-slate-100 px-1 font-sans">Ctrl/⌘ K</kbd> to browse
            commands.
          </p>
        </div>
      </div>

      {/* Command palette */}
      {paletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 pt-[15vh]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closePalette();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={paletteTitleId}
            onKeyDown={onPaletteKey}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
          >
            <h2 id={paletteTitleId} className="sr-only">
              Command palette
            </h2>
            <div className="flex items-center gap-2 border-b border-slate-200 px-4">
              <Search className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
              <input
                ref={paletteInputRef}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={listboxId}
                aria-activedescendant={
                  filteredCommands[activeCmd] ? `${listboxId}-${activeCmd}` : undefined
                }
                aria-label="Search commands"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveCmd(0);
                }}
                placeholder="Search commands…"
                className="h-12 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={closePalette}
                aria-label="Close command palette"
                className="inline-flex size-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <ul id={listboxId} role="listbox" aria-label="Commands" className="max-h-72 overflow-y-auto p-2">
              {filteredCommands.length === 0 && (
                <li role="presentation" className="px-3 py-6 text-center text-sm text-slate-600">
                  No commands match “{query}”.
                </li>
              )}
              {filteredCommands.map((c, i) => (
                <li
                  key={c.name}
                  id={`${listboxId}-${i}`}
                  role="option"
                  aria-selected={i === activeCmd}
                  onMouseEnter={() => setActiveCmd(i)}
                  onClick={() => runCommand(c.name)}
                  className={`flex cursor-pointer flex-col rounded-lg px-3 py-2 ${
                    i === activeCmd ? "bg-indigo-50 text-indigo-900" : "text-slate-800"
                  }`}
                >
                  <span className="font-mono text-sm font-medium">{c.name}</span>
                  <span className="text-xs text-slate-600">{c.description}</span>
                </li>
              ))}
            </ul>
            <p className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
              ↑↓ to navigate · Enter to select · Esc to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
