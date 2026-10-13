"use client";

import * as React from "react";
import {
  ArrowUpIcon,
  CommandIcon,
  FileTextIcon,
  HashIcon,
  ImageIcon,
  PaperclipIcon,
  PinIcon,
  SearchIcon,
  SmileIcon,
  SquareIcon,
  SparklesIcon,
  Trash2Icon,
  UsersIcon,
  DownloadIcon,
  CopyIcon,
  BellOffIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import {
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@/components/ui/bubble";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Data                                                               */
/* ------------------------------------------------------------------ */

type Sender = {
  id: string;
  name: string;
  initials: string;
  role: string;
};

const ME: Sender = { id: "me", name: "You", initials: "YO", role: "Design" };

const PEOPLE: Record<string, Sender> = {
  priya: { id: "priya", name: "Priya Raman", initials: "PR", role: "Product" },
  marcus: {
    id: "marcus",
    name: "Marcus Oyelaran",
    initials: "MO",
    role: "Engineering",
  },
  lena: { id: "lena", name: "Lena Fischer", initials: "LF", role: "Research" },
};

type FileAttachment = {
  name: string;
  meta: string;
  kind: "pdf" | "image";
};

type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  time: string;
  reactions?: string[];
  attachments?: FileAttachment[];
};

type TimelineEntry =
  | { type: "marker"; id: string; label: string; icon?: "users" | "pin" }
  | { type: "message"; message: ChatMessage };

const INITIAL_TIMELINE: TimelineEntry[] = [
  { type: "marker", id: "m-day", label: "Tuesday, March 11" },
  {
    type: "message",
    message: {
      id: "msg-1",
      senderId: "priya",
      text: "Morning all! Quick reminder that the onboarding revamp review is at 2pm. I'd love a gut check on the new three-step flow before then.",
      time: "9:02 AM",
    },
  },
  {
    type: "message",
    message: {
      id: "msg-2",
      senderId: "marcus",
      text: "Looked at it last night. The step-two form validation is much cleaner now. One thing: we still fire the analytics event twice on retry.",
      time: "9:07 AM",
      reactions: ["👀 1"],
    },
  },
  {
    type: "message",
    message: {
      id: "msg-3",
      senderId: "me",
      text: "Good catch, Marcus. I'll file a ticket and fold the fix into this sprint. Here's the latest prototype walkthrough and the usability notes from Thursday's sessions.",
      time: "9:12 AM",
      attachments: [
        { name: "onboarding-usability-notes.pdf", meta: "PDF · 2.4 MB", kind: "pdf" },
        { name: "step-two-prototype.png", meta: "PNG · 840 KB", kind: "image" },
      ],
    },
  },
  {
    type: "marker",
    id: "m-join",
    label: "Lena Fischer joined the conversation",
    icon: "users",
  },
  {
    type: "message",
    message: {
      id: "msg-4",
      senderId: "lena",
      text: "Hi! Priya looped me in. In the sessions, 6 of 8 participants hesitated on the \"Connect workspace\" step. They weren't sure it was optional.",
      time: "9:31 AM",
      reactions: ["💡 3", "🙏 1"],
    },
  },
  {
    type: "message",
    message: {
      id: "msg-5",
      senderId: "priya",
      text: "That matches the drop-off we see in the funnel. Could we add a visible \"Skip for now\" link and soften the copy?",
      time: "9:34 AM",
    },
  },
  {
    type: "message",
    message: {
      id: "msg-6",
      senderId: "me",
      text: "Yes, I'll mock up two variants this morning and drop them here before the 2pm review.",
      time: "9:36 AM",
    },
  },
];

const STREAM_REPLY =
  "Two variants are ready. A keeps the step but adds a quiet \"Skip for now\" link under the primary button. B moves workspace connection to the dashboard checklist and shortens onboarding to two steps. I'd test A first since it's the smaller change, and we can ship it behind a flag this sprint.";

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: "Smileys", emojis: ["😀", "😂", "🥹", "😍", "😎", "🤔", "😅", "🥳"] },
  { label: "Gestures", emojis: ["👍", "👏", "🙌", "🙏", "👀", "💪", "🤝", "🫡"] },
  { label: "Symbols", emojis: ["🎉", "🔥", "✅", "💡", "🚀", "❤️", "⭐", "📌"] },
];

const EMOJI_NAMES: Record<string, string> = {
  "😀": "grinning face",
  "😂": "laughing with tears",
  "🥹": "holding back tears",
  "😍": "heart eyes",
  "😎": "sunglasses",
  "🤔": "thinking face",
  "😅": "sweat smile",
  "🥳": "party face",
  "👍": "thumbs up",
  "👏": "clapping hands",
  "🙌": "raised hands",
  "🙏": "folded hands",
  "👀": "eyes",
  "💪": "flexed bicep",
  "🤝": "handshake",
  "🫡": "salute",
  "🎉": "party popper",
  "🔥": "fire",
  "✅": "check mark",
  "💡": "light bulb",
  "🚀": "rocket",
  "❤️": "red heart",
  "⭐": "star",
  "📌": "pushpin",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getSender(id: string): Sender {
  return id === ME.id ? ME : (PEOPLE[id] ?? ME);
}

/* ------------------------------------------------------------------ */
/* Pieces                                                             */
/* ------------------------------------------------------------------ */

function SenderAvatar({ sender, online }: { sender: Sender; online?: boolean }) {
  return (
    <Avatar>
      <AvatarFallback aria-hidden="true">{sender.initials}</AvatarFallback>
      {online ? <AvatarBadge aria-hidden="true" /> : null}
    </Avatar>
  );
}

function MessageAttachments({ items }: { items: FileAttachment[] }) {
  return (
    <AttachmentGroup>
      {items.map((file) => (
        <Attachment key={file.name} state="done" size="sm">
          <AttachmentMedia variant="icon">
            {file.kind === "pdf" ? <FileTextIcon /> : <ImageIcon />}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{file.name}</AttachmentTitle>
            <AttachmentDescription>{file.meta}</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction
              aria-label={`Download ${file.name}`}
              onClick={() => toast(`Downloading ${file.name}`)}
            >
              <DownloadIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ))}
    </AttachmentGroup>
  );
}

function ChatRow({ message }: { message: ChatMessage }) {
  const sender = getSender(message.senderId);
  const mine = sender.id === ME.id;
  const hasReactions = Boolean(message.reactions?.length);

  return (
    <Message align={mine ? "end" : "start"}>
      <MessageAvatar>
        <SenderAvatar sender={sender} online={!mine && sender.id !== "lena"} />
      </MessageAvatar>
      <MessageContent>
        <MessageHeader>
          <span className="truncate">{mine ? "You" : sender.name}</span>
          {!mine ? (
            <span className="ml-2 font-normal opacity-80">{sender.role}</span>
          ) : null}
        </MessageHeader>
        <Bubble
          variant={mine ? "default" : "muted"}
          align={mine ? "end" : "start"}
          className={cn(hasReactions && "mb-2")}
        >
          <BubbleContent>{message.text}</BubbleContent>
          {hasReactions ? (
            <BubbleReactions side="bottom" align={mine ? "end" : "start"}>
              {message.reactions?.map((reaction) => (
                <span key={reaction} className="text-xs">
                  {reaction}
                </span>
              ))}
            </BubbleReactions>
          ) : null}
        </Bubble>
        {message.attachments?.length ? (
          <MessageAttachments items={message.attachments} />
        ) : null}
        <MessageFooter>
          <time>{message.time}</time>
        </MessageFooter>
      </MessageContent>
    </Message>
  );
}

function StreamingRow({ text, thinking }: { text: string; thinking: boolean }) {
  const sender = PEOPLE.lena;
  return (
    <Message align="start" aria-live="off">
      <MessageAvatar>
        <SenderAvatar sender={sender} online />
      </MessageAvatar>
      <MessageContent>
        <MessageHeader>
          <span className="truncate">Lena Fischer</span>
          <span className="ml-2 font-normal opacity-80">
            {thinking ? "is typing…" : "replying…"}
          </span>
        </MessageHeader>
        <Bubble variant="muted">
          <BubbleContent>
            {thinking ? (
              <span className="flex items-center gap-2">
                <span className="flex items-center gap-1" aria-hidden="true">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </span>
                <span className="shimmer">Lena is typing…</span>
              </span>
            ) : (
              <>
                {text}
                <span
                  aria-hidden="true"
                  className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-foreground"
                />
              </>
            )}
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}

/* ------------------------------------------------------------------ */
/* Emoji picker                                                       */
/* ------------------------------------------------------------------ */

function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <InputGroupButton
              size="icon-sm"
              aria-label="Open emoji picker"
              aria-haspopup="dialog"
            >
              <SmileIcon />
            </InputGroupButton>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">Add emoji</TooltipContent>
      </Tooltip>
      <PopoverContent
        side="top"
        align="start"
        className="w-72 p-3"
        aria-label="Emoji picker"
      >
        <div className="flex flex-col gap-3">
          {EMOJI_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                {group.label}
              </p>
              <div className="grid grid-cols-8 gap-1">
                {group.emojis.map((emoji) => (
                  <Button
                    key={emoji}
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-lg"
                    aria-label={EMOJI_NAMES[emoji] ?? emoji}
                    onClick={() => {
                      onPick(emoji);
                      setOpen(false);
                    }}
                  >
                    <span aria-hidden="true">{emoji}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------------------------------------------------ */
/* Command palette                                                    */
/* ------------------------------------------------------------------ */

type PaletteActions = {
  onInsertCommand: (text: string) => void;
  onClear: () => void;
};

function ChatCommandPalette({
  open,
  onOpenChange,
  actions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: PaletteActions;
}) {
  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Search commands, people and channels for this conversation."
    >
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem
            onSelect={() =>
              run(() => actions.onInsertCommand("/summarize "))
            }
          >
            <SparklesIcon />
            <span>Summarize this thread</span>
            <CommandShortcut>/summarize</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => toast("Thread pinned to the channel"))}
          >
            <PinIcon />
            <span>Pin thread</span>
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => toast("Notifications muted for 1 hour"))}
          >
            <BellOffIcon />
            <span>Mute notifications</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard
                    .writeText("https://chat.example.com/c/onboarding-revamp")
                    .catch(() => undefined);
                }
                toast("Conversation link copied");
              })
            }
          >
            <CopyIcon />
            <span>Copy conversation link</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="People">
          {Object.values(PEOPLE).map((person) => (
            <CommandItem
              key={person.id}
              value={`${person.name} ${person.role}`}
              onSelect={() =>
                run(() => actions.onInsertCommand(`@${person.name.split(" ")[0]} `))
              }
            >
              <UsersIcon />
              <span>{person.name}</span>
              <CommandShortcut>{person.role}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Danger zone">
          <CommandItem onSelect={() => run(actions.onClear)}>
            <Trash2Icon />
            <span>Clear my messages</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

type StreamState =
  | { status: "idle" }
  | { status: "thinking" }
  | { status: "streaming"; text: string };

export default function Page() {
  const [timeline, setTimeline] =
    React.useState<TimelineEntry[]>(INITIAL_TIMELINE);
  const [draft, setDraft] = React.useState("");
  const [stream, setStream] = React.useState<StreamState>({ status: "idle" });
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [isMac, setIsMac] = React.useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const timersRef = React.useRef<number[]>([]);
  const idRef = React.useRef(100);

  const isBusy = stream.status !== "idle";

  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform));
  }, []);

  // Global ⌘K / Ctrl+K opens the command palette.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Clear pending timers on unmount.
  React.useEffect(() => {
    const timers = timersRef;
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, []);

  const nextId = React.useCallback((prefix: string) => {
    idRef.current += 1;
    return `${prefix}-${idRef.current}`;
  }, []);

  const finishStream = React.useCallback(
    (fullText: string) => {
      setTimeline((prev) => [
        ...prev,
        {
          type: "message",
          message: {
            id: nextId("msg"),
            senderId: "lena",
            text: fullText,
            time: formatTime(new Date()),
          },
        },
      ]);
      setStream({ status: "idle" });
    },
    [nextId],
  );

  const startStream = React.useCallback(() => {
    const words = STREAM_REPLY.split(" ");
    let index = 0;

    const tick = () => {
      index += 1;
      const text = words.slice(0, index).join(" ");
      if (index >= words.length) {
        finishStream(STREAM_REPLY);
        return;
      }
      setStream({ status: "streaming", text });
      timersRef.current.push(window.setTimeout(tick, 55));
    };

    setStream({ status: "thinking" });
    timersRef.current.push(window.setTimeout(tick, 1400));
  }, [finishStream]);

  const stopStream = React.useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setStream((current) => {
      if (current.status === "streaming" && current.text) {
        const text = `${current.text}…`;
        setTimeline((prev) => [
          ...prev,
          {
            type: "message",
            message: {
              id: nextId("msg"),
              senderId: "lena",
              text,
              time: formatTime(new Date()),
            },
          },
        ]);
      }
      return { status: "idle" };
    });
    toast("Reply stopped");
  }, [nextId]);

  const send = React.useCallback(() => {
    const text = draft.trim();
    if (!text || isBusy) return;

    setTimeline((prev) => [
      ...prev,
      {
        type: "message",
        message: {
          id: nextId("msg"),
          senderId: ME.id,
          text,
          time: formatTime(new Date()),
        },
      },
    ]);
    setDraft("");
    startStream();
  }, [draft, isBusy, nextId, startStream]);

  const insertAtCursor = React.useCallback((snippet: string) => {
    const el = textareaRef.current;
    setDraft((prev) => {
      if (!el) return prev + snippet;
      const start = el.selectionStart ?? prev.length;
      const end = el.selectionEnd ?? prev.length;
      const next = prev.slice(0, start) + snippet + prev.slice(end);
      const caret = start + snippet.length;
      window.requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(caret, caret);
      });
      return next;
    });
  }, []);

  const paletteActions = React.useMemo<PaletteActions>(
    () => ({
      onInsertCommand: (text) => {
        window.setTimeout(() => insertAtCursor(text), 0);
      },
      onClear: () => {
        setTimeline((prev) =>
          prev.filter(
            (entry) =>
              entry.type === "marker" || entry.message.senderId !== ME.id,
          ),
        );
        toast("Your messages were cleared");
      },
    }),
    [insertAtCursor],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  const modKey = isMac ? "⌘" : "Ctrl";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-dvh w-full flex-col bg-background">
        {/* Header */}
        <header className="flex items-center gap-3 border-b px-4 py-3 sm:px-6">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
            aria-hidden="true"
          >
            <HashIcon className="size-4" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="truncate text-sm font-semibold leading-tight">
              onboarding-revamp
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              4 members · Priya, Marcus, Lena and you
            </p>
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Review at 2:00 PM
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setPaletteOpen(true)}
            aria-label="Open command palette"
            aria-keyshortcuts="Control+K Meta+K"
          >
            <SearchIcon data-icon="inline-start" />
            <span className="hidden sm:inline">Search or run a command</span>
            <KbdGroup className="hidden sm:inline-flex">
              <Kbd>{modKey}</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </Button>
        </header>

        {/* Transcript */}
        <main className="relative mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
          <MessageScrollerProvider autoScroll defaultScrollPosition="end">
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent
                  className="gap-6 px-4 py-6 sm:px-6"
                  aria-busy={isBusy}
                >
                  {timeline.map((entry) =>
                    entry.type === "marker" ? (
                      <MessageScrollerItem key={entry.id} messageId={entry.id}>
                        <Marker variant="separator">
                          {entry.icon === "users" ? (
                            <MarkerIcon>
                              <UsersIcon />
                            </MarkerIcon>
                          ) : null}
                          <MarkerContent>{entry.label}</MarkerContent>
                        </Marker>
                      </MessageScrollerItem>
                    ) : (
                      <MessageScrollerItem
                        key={entry.message.id}
                        messageId={entry.message.id}
                        scrollAnchor={entry.message.senderId === ME.id}
                      >
                        <ChatRow message={entry.message} />
                      </MessageScrollerItem>
                    ),
                  )}

                  {isBusy ? (
                    <MessageScrollerItem messageId="streaming-reply">
                      <StreamingRow
                        thinking={stream.status === "thinking"}
                        text={stream.status === "streaming" ? stream.text : ""}
                      />
                    </MessageScrollerItem>
                  ) : null}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        </main>

        {/* Composer */}
        <footer className="border-t bg-background px-4 pt-3 pb-4 sm:px-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}
              aria-label="Send a message"
            >
              <InputGroup>
                <InputGroupTextarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Message #onboarding-revamp"
                  aria-label="Message"
                  rows={1}
                  className="max-h-40 min-h-12"
                />
                <InputGroupAddon align="block-end" className="gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InputGroupButton
                        size="icon-sm"
                        aria-label="Attach a file"
                        onClick={() => toast("File picker is not available in this demo")}
                      >
                        <PaperclipIcon />
                      </InputGroupButton>
                    </TooltipTrigger>
                    <TooltipContent side="top">Attach file</TooltipContent>
                  </Tooltip>
                  <EmojiPicker onPick={insertAtCursor} />
                  <span className="ml-auto hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                    <Kbd>Enter</Kbd> to send
                    <Separator orientation="vertical" className="mx-1 h-4" />
                    <Kbd>Shift</Kbd>
                    <span aria-hidden="true">+</span>
                    <Kbd>Enter</Kbd> for new line
                  </span>
                  {isBusy ? (
                    <InputGroupButton
                      size="icon-sm"
                      variant="default"
                      className="ml-auto rounded-full sm:ml-0"
                      aria-label="Stop reply"
                      onClick={stopStream}
                    >
                      <SquareIcon />
                    </InputGroupButton>
                  ) : (
                    <InputGroupButton
                      type="submit"
                      size="icon-sm"
                      variant="default"
                      className="ml-auto rounded-full sm:ml-0"
                      aria-label="Send message"
                      disabled={draft.trim().length === 0}
                    >
                      <ArrowUpIcon />
                    </InputGroupButton>
                  )}
                </InputGroupAddon>
              </InputGroup>
            </form>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <CommandIcon className="size-3" aria-hidden="true" />
              <span>
                Press{" "}
                <KbdGroup>
                  <Kbd>{modKey}</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>{" "}
                for commands, or type <Kbd>/</Kbd> to start one
              </span>
            </p>
            <p className="sr-only" role="status" aria-live="polite">
              {stream.status === "thinking"
                ? "Lena is typing"
                : stream.status === "streaming"
                  ? "Lena is replying"
                  : ""}
            </p>
          </div>
        </footer>

        <ChatCommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          actions={paletteActions}
        />
      </div>
    </TooltipProvider>
  );
}
