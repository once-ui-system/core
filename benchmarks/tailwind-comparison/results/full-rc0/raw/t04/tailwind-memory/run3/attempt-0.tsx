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
  Command,
  Hash,
  Menu,
  Phone,
  Search,
  SendHorizontal,
  Smile,
  Users,
  Video,
  X,
} from "lucide-react";

type Author = {
  id: string;
  name: string;
  initials: string;
  color: string;
};

type Message = {
  id: string;
  authorId: string;
  text: string;
  time: string;
};

type Channel = {
  id: string;
  name: string;
  unread: number;
  topic: string;
};

const AUTHORS: Record<string, Author> = {
  me: { id: "me", name: "You", initials: "YO", color: "bg-indigo-600" },
  priya: { id: "priya", name: "Priya Raman", initials: "PR", color: "bg-rose-600" },
  marcus: { id: "marcus", name: "Marcus Oyelaran", initials: "MO", color: "bg-emerald-700" },
  lena: { id: "lena", name: "Lena Fischer", initials: "LF", color: "bg-amber-700" },
};

const CHANNELS: Channel[] = [
  { id: "launch", name: "launch-week", unread: 3, topic: "Release 4.2 checklist and rollout notes" },
  { id: "design", name: "design-review", unread: 0, topic: "Critiques, mockups and spacing debates" },
  { id: "support", name: "support-triage", unread: 7, topic: "Customer tickets that need an owner" },
  { id: "random", name: "random", unread: 0, topic: "Coffee, music and weekend plans" },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    authorId: "priya",
    text: "Morning all! The staging build for 4.2 finished overnight. Smoke tests are green on every browser we support.",
    time: "9:02 AM",
  },
  {
    id: "m2",
    authorId: "marcus",
    text: "Nice. I'm still seeing a slow query on the billing export, around 4s on the larger accounts. Looking at the index now.",
    time: "9:05 AM",
  },
  {
    id: "m3",
    authorId: "lena",
    text: "Release notes draft is in the shared doc. Could someone double-check the wording on the new permissions section?",
    time: "9:11 AM",
  },
  {
    id: "m4",
    authorId: "me",
    text: "I'll take the permissions wording. Marcus, ping me if the index fix changes the migration order.",
    time: "9:14 AM",
  },
  {
    id: "m5",
    authorId: "marcus",
    text: "Will do. Adding a composite index on (account_id, created_at) brought it down to 300ms locally 🎉",
    time: "9:21 AM",
  },
];

const EMOJIS: { char: string; label: string }[] = [
  { char: "😀", label: "Grinning face" },
  { char: "😂", label: "Laughing with tears" },
  { char: "😊", label: "Smiling face" },
  { char: "😍", label: "Heart eyes" },
  { char: "🤔", label: "Thinking face" },
  { char: "😎", label: "Sunglasses" },
  { char: "🙌", label: "Raised hands" },
  { char: "👍", label: "Thumbs up" },
  { char: "👏", label: "Clapping" },
  { char: "🎉", label: "Party popper" },
  { char: "🔥", label: "Fire" },
  { char: "🚀", label: "Rocket" },
  { char: "✅", label: "Check mark" },
  { char: "👀", label: "Eyes" },
  { char: "💡", label: "Light bulb" },
  { char: "❤️", label: "Red heart" },
];

const COMMANDS: { name: string; hint: string }[] = [
  { name: "/remind", hint: "Set a reminder for this channel" },
  { name: "/poll", hint: "Create a quick poll" },
  { name: "/status", hint: "Update your status" },
  { name: "/summarize", hint: "Summarize the last 50 messages" },
];

const REPLIES: string[] = [
  "Sounds good, I'll update the checklist and tag you when it's ready.",
  "Thanks for flagging that. I'll add it to the rollout notes before the afternoon sync.",
  "Agreed. Let's confirm with the support team before we flip the flag for everyone.",
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function Avatar({ author, size = "md" }: { author: Author; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "size-7 text-[10px]" : "size-9 text-xs";
  return (
    <span
      aria-hidden="true"
      className={`${dims} ${author.color} inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white`}
    >
      {author.initials}
    </span>
  );
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [activeChannel, setActiveChannel] = useState("launch");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [typingAuthor, setTypingAuthor] = useState<Author | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const emojiWrapRef = useRef<HTMLDivElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const replyTimers = useRef<number[]>([]);
  const replyIndex = useRef(0);

  const emojiPanelId = useId();
  const paletteTitleId = useId();
  const paletteListId = useId();

  const channel = CHANNELS.find((c) => c.id === activeChannel) ?? CHANNELS[0];

  // Keep the newest message in view.
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, typingAuthor]);

  // Clear pending timers on unmount.
  useEffect(() => {
    const timers = replyTimers.current;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // Global shortcut: Ctrl/Cmd + K toggles the command palette.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus palette input when opened.
  useEffect(() => {
    if (paletteOpen) {
      setPaletteQuery("");
      paletteInputRef.current?.focus();
    }
  }, [paletteOpen]);

  // Close the emoji picker on outside click or Escape.
  useEffect(() => {
    if (!emojiOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (emojiWrapRef.current && !emojiWrapRef.current.contains(e.target as Node)) {
        setEmojiOpen(false);
      }
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setEmojiOpen(false);
        inputRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [emojiOpen]);

  // Close palette with Escape.
  useEffect(() => {
    if (!paletteOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setPaletteOpen(false);
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [paletteOpen]);

  const filteredCommands = useMemo(() => {
    const q = paletteQuery.trim().toLowerCase().replace(/^\//, "");
    return COMMANDS.filter((c) => c.name.slice(1).includes(q) || c.hint.toLowerCase().includes(q));
  }, [paletteQuery]);

  const scheduleReply = useCallback(() => {
    const responder = [AUTHORS.priya, AUTHORS.marcus, AUTHORS.lena][replyIndex.current % 3];
    const text = REPLIES[replyIndex.current % REPLIES.length];
    replyIndex.current += 1;

    const startTyping = window.setTimeout(() => setTypingAuthor(responder), 600);
    const finish = window.setTimeout(() => {
      setTypingAuthor(null);
      setMessages((prev) => [
        ...prev,
        {
          id: `r-${Date.now()}`,
          authorId: responder.id,
          text,
          time: formatTime(new Date()),
        },
      ]);
    }, 3000);
    replyTimers.current.push(startTyping, finish);
  }, []);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, authorId: "me", text, time: formatTime(new Date()) },
    ]);
    setDraft("");
    setEmojiOpen(false);
    if (!typingAuthor) scheduleReply();
  }, [draft, typingAuthor, scheduleReply]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    send();
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const insertEmoji = (char: string) => {
    const el = inputRef.current;
    if (!el) {
      setDraft((d) => d + char);
      return;
    }
    const start = el.selectionStart ?? draft.length;
    const end = el.selectionEnd ?? draft.length;
    const next = draft.slice(0, start) + char + draft.slice(end);
    setDraft(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + char.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const applyCommand = (name: string) => {
    setDraft(`${name} `);
    setPaletteOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-100 text-slate-900">
      {/* Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        id="channel-sidebar"
        aria-label="Channels"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
          <span className="text-sm font-semibold tracking-tight">Northwind Team</span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 md:hidden"
            aria-label="Close channel list"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <h2 className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Channels
          </h2>
          <ul className="space-y-0.5">
            {CHANNELS.map((c) => {
              const active = c.id === activeChannel;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveChannel(c.id);
                      setSidebarOpen(false);
                    }}
                    aria-current={active ? "page" : undefined}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                      active
                        ? "bg-indigo-50 font-semibold text-indigo-800"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Hash className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="flex-1 truncate">{c.name}</span>
                    {c.unread > 0 && (
                      <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
                        <span className="sr-only">{c.unread} unread messages</span>
                        <span aria-hidden="true">{c.unread}</span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-3 border-t border-slate-200 p-3">
          <Avatar author={AUTHORS.me} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Alex Morgan</p>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
              Online
            </p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 sm:px-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 md:hidden"
            aria-label="Open channel list"
            aria-expanded={sidebarOpen}
            aria-controls="channel-sidebar"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-1 truncate text-base font-semibold">
              <Hash className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
              {channel.name}
            </h1>
            <p className="hidden truncate text-xs text-slate-500 sm:block">{channel.topic}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600 sm:inline-flex"
              aria-label="Open command palette"
              aria-keyshortcuts="Control+K Meta+K"
            >
              <Search className="size-3.5" aria-hidden="true" />
              Search or run a command
              <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-sans text-[10px] font-medium text-slate-600">
                Ctrl K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 sm:hidden"
              aria-label="Open command palette"
            >
              <Command className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="hidden rounded-md p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 sm:inline-flex"
              aria-label="Start voice call"
            >
              <Phone className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="hidden rounded-md p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 sm:inline-flex"
              aria-label="Start video call"
            >
              <Video className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md p-2 text-sm text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
              aria-label="View 4 members"
            >
              <Users className="size-5" aria-hidden="true" />
              <span className="hidden text-xs font-medium lg:inline" aria-hidden="true">
                4
              </span>
            </button>
          </div>
        </header>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-6">
            <div className="mb-4 flex items-center gap-3 text-xs font-medium text-slate-500">
              <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
              Today
              <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
            </div>
            <ol
              className="space-y-4"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              aria-label={`Messages in ${channel.name}`}
            >
              {messages.map((m, i) => {
                const author = AUTHORS[m.authorId];
                const mine = m.authorId === "me";
                const prev = messages[i - 1];
                const grouped = prev?.authorId === m.authorId;
                return (
                  <li
                    key={m.id}
                    className={`flex gap-3 ${mine ? "flex-row-reverse" : ""} ${grouped ? "-mt-2" : ""}`}
                  >
                    <div className="w-9 shrink-0">
                      {!grouped && <Avatar author={author} />}
                    </div>
                    <div className={`flex min-w-0 max-w-[85%] flex-col sm:max-w-[75%] ${mine ? "items-end" : "items-start"}`}>
                      {!grouped && (
                        <p className="mb-1 flex items-baseline gap-2 text-sm">
                          <span className="font-semibold">{author.name}</span>
                          <time className="text-xs text-slate-500">{m.time}</time>
                        </p>
                      )}
                      <p
                        className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          mine
                            ? "rounded-tr-sm bg-indigo-600 text-white"
                            : "rounded-tl-sm bg-slate-100 text-slate-800"
                        }`}
                      >
                        {grouped && <span className="sr-only">{author.name} at {m.time}: </span>}
                        {m.text}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Streaming indicator */}
            <div className="mt-4 min-h-7" role="status" aria-live="polite">
              {typingAuthor && (
                <div className="flex items-center gap-3">
                  <Avatar author={typingAuthor} size="sm" />
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2" aria-hidden="true">
                    <span className="size-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.3s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.15s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-slate-500" />
                  </span>
                  <span className="text-xs text-slate-500">{typingAuthor.name} is typing…</span>
                </div>
              )}
            </div>
            <div ref={listEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-3 pb-3 pt-3 sm:px-6">
          <form onSubmit={onSubmit} className="mx-auto w-full max-w-3xl">
            <div className="relative flex items-end gap-1 rounded-xl border border-slate-300 bg-white p-1.5 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/30">
              <div ref={emojiWrapRef} className="relative">
                <button
                  type="button"
                  onClick={() => setEmojiOpen((o) => !o)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-600"
                  aria-label="Insert emoji"
                  aria-haspopup="dialog"
                  aria-expanded={emojiOpen}
                  aria-controls={emojiOpen ? emojiPanelId : undefined}
                >
                  <Smile className="size-5" aria-hidden="true" />
                </button>
                {emojiOpen && (
                  <div
                    id={emojiPanelId}
                    role="dialog"
                    aria-label="Emoji picker"
                    className="absolute bottom-full left-0 z-20 mb-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
                  >
                    <ul className="grid grid-cols-8 gap-0.5">
                      {EMOJIS.map((e) => (
                        <li key={e.label}>
                          <button
                            type="button"
                            onClick={() => insertEmoji(e.char)}
                            aria-label={e.label}
                            title={e.label}
                            className="flex size-7 items-center justify-center rounded-md text-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
                          >
                            <span aria-hidden="true">{e.char}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <label htmlFor="message-input" className="sr-only">
                Message #{channel.name}
              </label>
              <textarea
                id="message-input"
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onInputKeyDown}
                rows={1}
                placeholder={`Message #${channel.name}`}
                className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-5 text-slate-900 placeholder:text-slate-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={draft.trim().length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
              >
                <SendHorizontal className="size-4" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Send</span>
              </button>
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span>
                <kbd className="rounded border border-slate-300 bg-slate-50 px-1 font-sans">Enter</kbd> to send,{" "}
                <kbd className="rounded border border-slate-300 bg-slate-50 px-1 font-sans">Shift</kbd>+
                <kbd className="rounded border border-slate-300 bg-slate-50 px-1 font-sans">Enter</kbd> for a new line
              </span>
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="inline-flex items-center gap-1 rounded text-slate-600 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                <Command className="size-3" aria-hidden="true" />
                Press{" "}
                <kbd className="rounded border border-slate-300 bg-slate-50 px-1 font-sans">Ctrl K</kbd> for commands
              </button>
            </p>
          </form>
        </div>
      </main>

      {/* Command palette */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setPaletteOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={paletteTitleId}
            className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <h2 id={paletteTitleId} className="sr-only">
              Command palette
            </h2>
            <div className="flex items-center gap-2 border-b border-slate-200 px-3">
              <Search className="size-4 text-slate-400" aria-hidden="true" />
              <input
                ref={paletteInputRef}
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredCommands[0]) {
                    e.preventDefault();
                    applyCommand(filteredCommands[0].name);
                  }
                }}
                type="text"
                aria-label="Search commands"
                aria-controls={paletteListId}
                placeholder="Type a command…"
                className="h-12 flex-1 bg-transparent text-sm placeholder:text-slate-500 focus:outline-none"
              />
              <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-sans text-[10px] text-slate-600">
                Esc
              </kbd>
            </div>
            <ul id={paletteListId} className="max-h-72 overflow-y-auto p-2">
              {filteredCommands.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-slate-500">No matching commands</li>
              )}
              {filteredCommands.map((c) => (
                <li key={c.name}>
                  <button
                    type="button"
                    onClick={() => applyCommand(c.name)}
                    className="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-indigo-50 focus-visible:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
                  >
                    <span className="text-sm font-semibold text-slate-900">{c.name}</span>
                    <span className="text-xs text-slate-600">{c.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
