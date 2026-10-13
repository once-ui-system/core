```tsx
"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  ArrowUp,
  Command,
  Hash,
  Search,
  Smile,
  Users,
  Phone,
  Video,
  Sparkles,
  Pin,
  AtSign,
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
  time: string;
  text: string;
  reactions?: { emoji: string; count: number }[];
};

const AUTHORS: Record<string, Author> = {
  me: { id: "me", name: "You", initials: "YO", color: "bg-indigo-600" },
  maya: {
    id: "maya",
    name: "Maya Okafor",
    initials: "MO",
    color: "bg-rose-500",
    role: "Design",
  },
  dev: {
    id: "dev",
    name: "Devansh Rao",
    initials: "DR",
    color: "bg-emerald-600",
    role: "Engineering",
  },
  lena: {
    id: "lena",
    name: "Lena Fischer",
    initials: "LF",
    color: "bg-amber-600",
    role: "Product",
  },
  bot: {
    id: "bot",
    name: "Relay Assistant",
    initials: "RA",
    color: "bg-violet-600",
    role: "Bot",
  },
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    authorId: "lena",
    time: "9:12 AM",
    text: "Morning all! Quick reminder that the 2.4 release branch gets cut at 2 PM today. Anything still in review should be flagged now.",
    reactions: [{ emoji: "👍", count: 4 }],
  },
  {
    id: "m2",
    authorId: "dev",
    time: "9:15 AM",
    text: "The checkout retry fix is merged. I'm still waiting on a second look at the notifications migration, it touches the queue worker.",
  },
  {
    id: "m3",
    authorId: "maya",
    time: "9:21 AM",
    text: "I can review the migration after standup. Also, the new empty-state illustrations are in Figma, ready for handoff 🎨",
    reactions: [
      { emoji: "🎉", count: 3 },
      { emoji: "🙏", count: 1 },
    ],
  },
  {
    id: "m4",
    authorId: "me",
    time: "9:24 AM",
    text: "Thanks Maya! I'll pull the illustrations into the onboarding flow this afternoon. Can someone summarise the open blockers for the release?",
  },
  {
    id: "m5",
    authorId: "bot",
    time: "9:24 AM",
    text: "Here's the current picture for 2.4: 2 pull requests awaiting review, 1 flaky test on the billing suite (retried twice, passing), and 0 open P1 bugs. The notifications migration is the only item on the critical path.",
  },
];

const EMOJIS = [
  "😀", "😂", "🙂", "😍", "🤔", "😅", "😎", "🥳",
  "👍", "👏", "🙌", "🙏", "💪", "🔥", "✨", "🎉",
  "🚀", "✅", "👀", "💡", "❤️", "😮", "😢", "🤝",
];

const COMMANDS = [
  { cmd: "/summarize", desc: "Summarize this channel" },
  { cmd: "/remind", desc: "Set a reminder for the team" },
  { cmd: "/poll", desc: "Create a quick poll" },
  { cmd: "/status", desc: "Update your status" },
];

const BOT_REPLIES = [
  "Got it. I've noted that and will keep an eye on the notifications migration. I'll post here as soon as the review is approved and CI is green.",
  "Sure thing. Based on the last 24 hours of activity, the team is on track for the 2 PM cut. I'll ping the reviewers if nothing moves by noon.",
];

function Avatar({ author, size = "md" }: { author: Author; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "size-7 text-[10px]" : "size-9 text-xs";
  return (
    <span
      aria-hidden="true"
      className={`${dims} ${author.color} inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white`}
    >
      {author.id === "bot" ? <Sparkles className="size-4" /> : author.initials}
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
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const emojiWrapRef = useRef<HTMLDivElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const timersRef = useRef<number[]>([]);
  const replyIndex = useRef(0);
  const idCounter = useRef(0);

  const emojiPanelId = useId();
  const paletteTitleId = useId();

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, streamText, streaming]);

  // Global shortcut for the command palette
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
      paletteInputRef.current?.focus();
    } else {
      setPaletteQuery("");
    }
  }, [paletteOpen]);

  // Close the emoji picker on outside click
  useEffect(() => {
    if (!emojiOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !emojiWrapRef.current?.contains(target) &&
        !emojiBtnRef.current?.contains(target)
      ) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [emojiOpen]);

  const nextId = () => {
    idCounter.current += 1;
    return `local-${idCounter.current}`;
  };

  const startStreaming = useCallback(() => {
    const reply = BOT_REPLIES[replyIndex.current % BOT_REPLIES.length];
    replyIndex.current += 1;
    const words = reply.split(" ");
    setStreaming(true);
    setStreamText("");

    let i = 0;
    const tick = () => {
      i += 1;
      setStreamText(words.slice(0, i).join(" "));
      if (i < words.length) {
        timersRef.current.push(window.setTimeout(tick, 60));
      } else {
        timersRef.current.push(
          window.setTimeout(() => {
            idCounter.current += 1;
            setMessages((m) => [
              ...m,
              {
                id: `local-${idCounter.current}`,
                authorId: "bot",
                time: new Date().toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                }),
                text: reply,
              },
            ]);
            setStreaming(false);
            setStreamText("");
          }, 150),
        );
      }
    };
    timersRef.current.push(window.setTimeout(tick, 900));
  }, []);

  const send = () => {
    const text = draft.trim();
    if (!text || streaming) return;
    setMessages((m) => [
      ...m,
      {
        id: nextId(),
        authorId: "me",
        time: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
        text,
      },
    ]);
    setDraft("");
    setEmojiOpen(false);
    startStreaming();
  };

  const onInputKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    } else if (e.key === "Escape") {
      setEmojiOpen(false);
    }
  };

  const insertEmoji = (emoji: string) => {
    const el = inputRef.current;
    if (!el) {
      setDraft((d) => d + emoji);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = draft.slice(0, start) + emoji + draft.slice(end);
    setDraft(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const filteredCommands = useMemo(() => {
    const q = paletteQuery.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) =>
        c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q),
    );
  }, [paletteQuery]);

  const runCommand = (cmd: string) => {
    setPaletteOpen(false);
    setDraft(cmd + " ");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onPaletteKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      setPaletteOpen(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  return (
    <div className="flex h-dvh w-full flex-col bg-slate-100 text-slate-900 sm:p-4 md:p-6">
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col overflow-hidden bg-white shadow-xl ring-1 ring-slate-200 sm:rounded-2xl">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"
            >
              <Hash className="size-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold leading-tight">
                release-2-4
              </h1>
              <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                <Users className="size-3.5 shrink-0" aria-hidden="true" />
                <span>12 members · 4 online</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[
              { label: "Start voice call", Icon: Phone },
              { label: "Start video call", Icon: Video },
              { label: "Pinned messages", Icon: Pin },
            ].map(({ label, Icon }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                className="hidden size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:inline-flex"
              >
                <Icon className="size-4" aria-hidden="true" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open command palette"
              className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:hidden"
            >
              <Search className="size-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6"
          role="log"
          aria-label="Conversation in release-2-4"
          aria-live="polite"
          aria-relevant="additions"
          tabIndex={0}
        >
          <div className="mb-4 flex items-center gap-3 text-xs font-medium text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            Today
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <ul className="flex flex-col gap-4">
            {messages.map((m, idx) => {
              const author = AUTHORS[m.authorId];
              const mine = author.id === "me";
              const prev = messages[idx - 1];
              const grouped = prev?.authorId === m.authorId;
              return (
                <li
                  key={m.id}
                  className={`flex items-end gap-2.5 ${mine ? "flex-row-reverse" : ""} ${grouped ? "-mt-2" : ""}`}
                >
                  <div className={grouped ? "invisible" : ""}>
                    <Avatar author={author} />
                  </div>
                  <div
                    className={`flex min-w-0 max-w-[85%] flex-col sm:max-w-[75%] ${mine ? "items-end" : "items-start"}`}
                  >
                    {!grouped && (
                      <p
                        className={`mb-1 flex items-baseline gap-2 text-xs ${mine ? "flex-row-reverse" : ""}`}
                      >
                        <span className="font-semibold text-slate-800">
                          {author.name}
                        </span>
                        {author.role && (
                          <span
                            className={`rounded px-1.5 py-px text-[10px] font-medium ${author.id === "bot" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}
                          >
                            {author.role}
                          </span>
                        )}
                        <time className="text-slate-500">{m.time}</time>
                      </p>
                    )}
                    <div
                      className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                        mine
                          ? "rounded-br-md bg-indigo-600 text-white"
                          : "rounded-bl-md bg-slate-100 text-slate-800"
                      }`}
                    >
                      {m.text}
                    </div>
                    {m.reactions && (
                      <ul
                        className="mt-1 flex flex-wrap gap-1"
                        aria-label="Reactions"
                      >
                        {m.reactions.map((r) => (
                          <li
                            key={r.emoji}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700"
                          >
                            <span aria-hidden="true">{r.emoji}</span>
                            <span>
                              <span className="sr-only">reaction, </span>
                              {r.count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}

            {streaming && (
              <li className="flex items-end gap-2.5">
                <Avatar author={AUTHORS.bot} />
                <div className="flex min-w-0 max-w-[85%] flex-col items-start sm:max-w-[75%]">
                  <p className="mb-1 flex items-baseline gap-2 text-xs">
                    <span className="font-semibold text-slate-800">
                      {AUTHORS.bot.name}
                    </span>
                    <span className="rounded bg-violet-100 px-1.5 py-px text-[10px] font-medium text-violet-700">
                      {streamText ? "Writing…" : "Thinking…"}
                    </span>
                  </p>
                  <div className="whitespace-pre-wrap break-words rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-2 text-sm leading-relaxed text-slate-800">
                    {streamText ? (
                      <>
                        {streamText}
                        <span
                          aria-hidden="true"
                          className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-violet-600 motion-reduce:animate-none"
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
          <div ref={endRef} />
        </div>

        {/* Status for screen readers */}
        <p className="sr-only" role="status">
          {streaming ? "Relay Assistant is typing" : ""}
        </p>

        {/* Input bar */}
        <div className="relative border-t border-slate-200 bg-white px-3 pb-3 pt-3 sm:px-6 sm:pb-4">
          {emojiOpen && (
            <div
              ref={emojiWrapRef}
              id={emojiPanelId}
              role="dialog"
              aria-label="Emoji picker"
              className="absolute bottom-full left-3 z-10 mb-2 w-[min(18rem,calc(100%-1.5rem))] rounded-xl border border-slate-200 bg-white p-2 shadow-lg sm:left-6"
            >
              <ul className="grid grid-cols-8 gap-0.5">
                {EMOJIS.map((e) => (
                  <li key={e}>
                    <button
                      type="button"
                      onClick={() => insertEmoji(e)}
                      aria-label={`Insert ${e}`}
                      className="inline-flex size-8 items-center justify-center rounded-md text-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
                    >
                      {e}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-white p-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30">
            <button
              ref={emojiBtnRef}
              type="button"
              onClick={() => setEmojiOpen((o) => !o)}
              aria-label="Choose emoji"
              aria-haspopup="dialog"
              aria-expanded={emojiOpen}
              aria-controls={emojiOpen ? emojiPanelId : undefined}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <Smile className="size-5" aria-hidden="true" />
            </button>
            <label htmlFor="chat-input" className="sr-only">
              Message #release-2-4
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onInputKey}
              rows={1}
              placeholder="Message #release-2-4"
              className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-5 text-slate-900 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={send}
              disabled={!draft.trim() || streaming}
              aria-label="Send message"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              <ArrowUp className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-1.5 rounded-md py-0.5 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600 sm:inline-flex"
            >
              <Command className="size-3.5" aria-hidden="true" />
              Press
              <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-px font-sans text-[11px] font-medium text-slate-600">
                Ctrl K
              </kbd>
              for commands
            </button>
            <span className="inline-flex items-center gap-1.5">
              <AtSign className="size-3.5" aria-hidden="true" />
              Enter to send · Shift+Enter for a new line
            </span>
          </div>
        </div>
      </div>

      {/* Command palette */}
      {paletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-[15vh]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPaletteOpen(false);
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
            <div className="flex items-center gap-2 border-b border-slate-200 px-3">
              <Search className="size-4 text-slate-500" aria-hidden="true" />
              <input
                ref={paletteInputRef}
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredCommands[0]) {
                    e.preventDefault();
                    runCommand(filteredCommands[0].cmd);
                  }
                }}
                aria-label="Search commands"
                placeholder="Type a command…"
                className="h-12 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setPaletteOpen(false)}
                aria-label="Close command palette"
                className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            {filteredCommands.length > 0 ? (
              <ul className="max-h-72 overflow-y-auto p-1.5">
                {filteredCommands.map((c, i) => (
                  <li key={c.cmd}>
                    <button
                      type="button"
                      onClick={() => runCommand(c.cmd)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-indigo-50 focus-visible:bg-indigo-50 focus-visible:outline-none ${i === 0 ? "bg-slate-50" : ""}`}
                    >
                      <span className="font-mono font-medium text-slate-900">
                        {c.cmd}
                      </span>
                      <span className="truncate text-xs text-slate-500">
                        {c.desc}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                No commands match “{paletteQuery}”.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```