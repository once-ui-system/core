"use client";

import * as React from "react";
import {
  ArrowUpIcon,
  CommandIcon,
  FileTextIcon,
  HashIcon,
  MoonIcon,
  PaperclipIcon,
  PinIcon,
  SearchIcon,
  SmileIcon,
  SquareIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
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

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

type Person = {
  id: string;
  name: string;
  initials: string;
  role: string;
};

const ME: Person = { id: "me", name: "You", initials: "YO", role: "Product designer" };

const PEOPLE: Record<string, Person> = {
  priya: { id: "priya", name: "Priya Raman", initials: "PR", role: "Engineering lead" },
  marcus: { id: "marcus", name: "Marcus Oyelaran", initials: "MO", role: "Mobile engineer" },
  elena: { id: "elena", name: "Elena Sokolova", initials: "ES", role: "Research" },
  atlas: { id: "atlas", name: "Atlas", initials: "AI", role: "Assistant" },
};

type ChatItem =
  | { kind: "marker"; id: string; label: string; icon?: "pin" | "users" }
  | {
      kind: "message";
      id: string;
      from: Person;
      time: string;
      text: string;
      reactions?: string[];
      attachment?: { title: string; meta: string };
    };

const INITIAL_ITEMS: ChatItem[] = [
  { kind: "marker", id: "d1", label: "Yesterday" },
  {
    kind: "message",
    id: "m1",
    from: PEOPLE.priya,
    time: "4:12 PM",
    text: "Quick recap on the onboarding revamp: we're cutting the signup flow from five steps to three. Role selection and team size move to a post-signup checklist.",
    reactions: ["🎯 3", "🙌 2"],
  },
  {
    kind: "message",
    id: "m2",
    from: PEOPLE.marcus,
    time: "4:20 PM",
    text: "That also removes the keyboard-overlap bug on the old step 4. Android build is in TestFlight-equivalent now if anyone wants to try it.",
  },
  { kind: "marker", id: "d2", label: "Today", icon: "pin" },
  {
    kind: "message",
    id: "m3",
    from: PEOPLE.elena,
    time: "9:02 AM",
    text: "Morning! I ran five sessions on the new flow last night. Completion went up, but two people missed the skip link on the team-size screen.",
    attachment: { title: "onboarding-sessions-notes.pdf", meta: "PDF · 1.8 MB" },
  },
  {
    kind: "message",
    id: "m4",
    from: ME,
    time: "9:10 AM",
    text: "Thanks Elena. I'll make the skip link a proper secondary button and bump the contrast. Can someone sanity-check the empty state copy?",
  },
  { kind: "marker", id: "j1", label: "Atlas joined the conversation", icon: "users" },
  {
    kind: "message",
    id: "m5",
    from: PEOPLE.priya,
    time: "9:14 AM",
    text: "@Atlas can you suggest tighter copy for the checklist empty state? Something friendly, under 12 words.",
  },
];

const AI_REPLY =
  "Here are three options, each under 12 words:\n\n1. “You're all set. Pick a task below whenever you're ready.”\n2. “Nothing to do yet. Your checklist will show up here.”\n3. “All caught up! New setup tasks will land here.”\n\nI'd go with option 1: it reassures people and nudges them forward without pressure.";

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: "Smileys", emojis: ["😀", "😄", "😂", "🙂", "😉", "😍", "🤔", "😅", "😎", "🥳", "😮", "😢"] },
  { label: "Gestures", emojis: ["👍", "👏", "🙌", "🙏", "👀", "💪", "🤝", "👌", "✌️", "🫡"] },
  { label: "Objects", emojis: ["🎉", "🚀", "✅", "🔥", "💡", "📌", "📎", "⭐", "❤️", "🎯"] },
];

/* -------------------------------------------------------------------------- */
/* Small pieces                                                               */
/* -------------------------------------------------------------------------- */

function PersonAvatar({ person }: { person: Person }) {
  return (
    <Avatar>
      <AvatarFallback aria-hidden="true">{person.initials}</AvatarFallback>
    </Avatar>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground motion-reduce:animate-none"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

function ChatMessage({ item }: { item: Extract<ChatItem, { kind: "message" }> }) {
  const mine = item.from.id === ME.id;
  const align = mine ? "end" : "start";

  return (
    <Message align={align}>
      <MessageAvatar>
        <PersonAvatar person={item.from} />
      </MessageAvatar>
      <MessageContent>
        <MessageHeader>
          <span className="truncate">{mine ? "You" : item.from.name}</span>
          {!mine && (
            <span className="ml-2 hidden truncate font-normal sm:inline">
              {item.from.role}
            </span>
          )}
        </MessageHeader>
        <Bubble
          align={align}
          variant={mine ? "default" : "secondary"}
          className={cn2(item.reactions && "mb-2")}
        >
          <BubbleContent className="whitespace-pre-wrap">{item.text}</BubbleContent>
          {item.reactions && (
            <BubbleReactions side="bottom" align={mine ? "end" : "start"}>
              {item.reactions.map((r) => (
                <span key={r} className="text-xs">
                  {r}
                </span>
              ))}
            </BubbleReactions>
          )}
        </Bubble>
        {item.attachment && (
          <Attachment size="default" className="self-start">
            <AttachmentMedia variant="icon">
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{item.attachment.title}</AttachmentTitle>
              <AttachmentDescription>{item.attachment.meta}</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction
                aria-label={`Open ${item.attachment.title}`}
                onClick={() => toast("Preview isn't available in this demo")}
              >
                <SearchIcon />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        )}
        <MessageFooter>
          <time>{item.time}</time>
        </MessageFooter>
      </MessageContent>
    </Message>
  );
}

function cn2(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ") || undefined;
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Page() {
  const [items, setItems] = React.useState<ChatItem[]>(INITIAL_ITEMS);
  const [draft, setDraft] = React.useState("");
  const [phase, setPhase] = React.useState<"idle" | "thinking" | "streaming">("idle");
  const [streamed, setStreamed] = React.useState("");
  const [emojiOpen, setEmojiOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [isMac, setIsMac] = React.useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const timersRef = React.useRef<number[]>([]);
  const idRef = React.useRef(100);

  const busy = phase !== "idle";

  const clearTimers = React.useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    window.clearInterval(timersRef.current[timersRef.current.length - 1]);
    timersRef.current = [];
  }, []);

  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform));
    return clearTimers;
  }, [clearTimers]);

  // Global ⌘K / Ctrl+K opens the command palette.
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const nextId = () => `m${idRef.current++}`;

  const finishStream = React.useCallback((text: string) => {
    if (text.trim()) {
      setItems((prev) => [
        ...prev,
        {
          kind: "message",
          id: `m${idRef.current++}`,
          from: PEOPLE.atlas,
          time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
          text,
        },
      ]);
    }
    setStreamed("");
    setPhase("idle");
  }, []);

  const startReply = () => {
    setPhase("thinking");
    const startTimer = window.setTimeout(() => {
      setPhase("streaming");
      const tokens = AI_REPLY.split(/(\s+)/);
      let index = 0;
      let acc = "";
      const interval = window.setInterval(() => {
        acc += tokens[index] ?? "";
        index += 1;
        setStreamed(acc);
        if (index >= tokens.length) {
          window.clearInterval(interval);
          finishStream(acc);
        }
      }, 45);
      timersRef.current.push(interval);
    }, 1100);
    timersRef.current.push(startTimer);
  };

  const send = () => {
    const text = draft.trim();
    if (!text || busy) return;
    setItems((prev) => [
      ...prev,
      {
        kind: "message",
        id: nextId(),
        from: ME,
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        text,
      },
    ]);
    setDraft("");
    startReply();
  };

  const stop = () => {
    const partial = streamed;
    clearTimers();
    finishStream(partial ? `${partial.trimEnd()}…` : "");
    toast("Response stopped");
  };

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? draft.length;
    const end = el?.selectionEnd ?? draft.length;
    const next = draft.slice(0, start) + emoji + draft.slice(end);
    setDraft(next);
    setEmojiOpen(false);
    requestAnimationFrame(() => {
      el?.focus();
      const caret = start + emoji.length;
      el?.setSelectionRange(caret, caret);
    });
  };

  const runCommand = (label: string, action?: () => void) => {
    setPaletteOpen(false);
    action?.();
    toast(label);
  };

  const modKey = isMac ? "⌘" : "Ctrl";

  return (
    <TooltipProvider>
      <div className="flex h-dvh w-full justify-center bg-muted/40 sm:p-4">
        <main
          aria-label="Design team chat"
          className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-background sm:rounded-xl sm:border sm:shadow-sm"
        >
          {/* Header */}
          <header className="flex items-center gap-3 border-b px-3 py-3 sm:px-4">
            <div className="flex min-w-0 flex-1 flex-col">
              <h1 className="flex items-center gap-1.5 truncate text-base font-semibold">
                <HashIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                onboarding-revamp
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                4 members · Atlas is available for questions
              </p>
            </div>

            <AvatarGroup className="hidden sm:flex" aria-label="Members">
              {[PEOPLE.priya, PEOPLE.marcus, PEOPLE.elena].map((p) => (
                <Avatar key={p.id} size="sm">
                  <AvatarFallback aria-hidden="true">{p.initials}</AvatarFallback>
                </Avatar>
              ))}
              <Avatar size="sm">
                <AvatarFallback aria-hidden="true">AI</AvatarFallback>
                <AvatarBadge aria-hidden="true" />
              </Avatar>
              <AvatarGroupCount className="size-6 text-xs">+2</AvatarGroupCount>
            </AvatarGroup>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaletteOpen(true)}
                  aria-label="Open command palette"
                  aria-keyshortcuts="Control+K Meta+K"
                >
                  <SearchIcon data-icon="inline-start" />
                  <span className="hidden sm:inline">Search or run…</span>
                  <KbdGroup className="hidden sm:inline-flex">
                    <Kbd>{modKey}</Kbd>
                    <Kbd>K</Kbd>
                  </KbdGroup>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Command palette ({modKey} K)</TooltipContent>
            </Tooltip>
          </header>

          {/* Thread */}
          <div className="min-h-0 flex-1">
            <MessageScrollerProvider autoScroll>
              <MessageScroller>
                <MessageScrollerViewport
                  role="log"
                  aria-label="Conversation"
                  aria-live="polite"
                  aria-relevant="additions"
                  tabIndex={0}
                  className="outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
                >
                  <MessageScrollerContent className="gap-6 px-3 py-4 sm:px-5">
                    {items.map((item) => (
                      <MessageScrollerItem
                        key={item.id}
                        messageId={item.id}
                        scrollAnchor={item.kind === "message" && item.from.id === ME.id}
                      >
                        {item.kind === "marker" ? (
                          <Marker variant="separator">
                            {item.icon === "pin" && (
                              <MarkerIcon>
                                <PinIcon />
                              </MarkerIcon>
                            )}
                            {item.icon === "users" && (
                              <MarkerIcon>
                                <UsersIcon />
                              </MarkerIcon>
                            )}
                            <MarkerContent>{item.label}</MarkerContent>
                          </Marker>
                        ) : (
                          <ChatMessage item={item} />
                        )}
                      </MessageScrollerItem>
                    ))}

                    {phase !== "idle" && (
                      <MessageScrollerItem messageId="streaming">
                        <Message align="start">
                          <MessageAvatar>
                            <PersonAvatar person={PEOPLE.atlas} />
                          </MessageAvatar>
                          <MessageContent>
                            <MessageHeader>
                              <span>Atlas</span>
                              <Badge variant="secondary" className="ml-2">
                                {phase === "thinking" ? "Thinking" : "Writing"}
                              </Badge>
                            </MessageHeader>
                            <Bubble variant="secondary" aria-busy="true">
                              <BubbleContent className="whitespace-pre-wrap">
                                {phase === "thinking" ? (
                                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                                    <TypingDots />
                                    <span className="shimmer">Atlas is thinking…</span>
                                  </span>
                                ) : (
                                  <>
                                    {streamed}
                                    <span
                                      aria-hidden="true"
                                      className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-foreground motion-reduce:animate-none"
                                    />
                                  </>
                                )}
                              </BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    )}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>
          </div>

          {/* Composer */}
          <footer className="flex flex-col gap-2 border-t p-3 sm:p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex flex-col gap-2"
            >
              <label htmlFor="composer" className="sr-only">
                Message #onboarding-revamp
              </label>
              <InputGroup>
                <InputGroupTextarea
                  id="composer"
                  ref={textareaRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Message #onboarding-revamp"
                  rows={1}
                  className="max-h-40 min-h-12"
                />
                <InputGroupAddon align="block-end">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InputGroupButton
                        size="icon-sm"
                        aria-label="Attach a file"
                        onClick={() => toast("Attachments aren't available in this demo")}
                      >
                        <PaperclipIcon />
                      </InputGroupButton>
                    </TooltipTrigger>
                    <TooltipContent>Attach a file</TooltipContent>
                  </Tooltip>

                  <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <InputGroupButton size="icon-sm" aria-label="Insert emoji">
                            <SmileIcon />
                          </InputGroupButton>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Insert emoji</TooltipContent>
                    </Tooltip>
                    <PopoverContent align="start" side="top" className="w-72 p-3">
                      <div className="flex max-h-64 flex-col gap-3 overflow-y-auto">
                        {EMOJI_GROUPS.map((group) => (
                          <div key={group.label} role="group" aria-label={group.label} className="flex flex-col gap-1.5">
                            <p className="text-xs font-medium text-muted-foreground">
                              {group.label}
                            </p>
                            <div className="grid grid-cols-6 gap-1">
                              {group.emojis.map((emoji) => (
                                <Button
                                  key={emoji}
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-lg"
                                  onClick={() => insertEmoji(emoji)}
                                  aria-label={`Insert ${emoji}`}
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

                  <span className="ml-auto hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                    <Kbd>Enter</Kbd> to send
                  </span>

                  {busy ? (
                    <InputGroupButton
                      size="icon-sm"
                      variant="secondary"
                      aria-label="Stop generating"
                      onClick={stop}
                      className="sm:ml-1"
                    >
                      <SquareIcon />
                    </InputGroupButton>
                  ) : (
                    <InputGroupButton
                      type="submit"
                      size="icon-sm"
                      variant="default"
                      aria-label="Send message"
                      disabled={!draft.trim()}
                      className="ml-auto sm:ml-1"
                    >
                      <ArrowUpIcon />
                    </InputGroupButton>
                  )}
                </InputGroupAddon>
              </InputGroup>
            </form>

            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
              <CommandIcon className="size-3" aria-hidden="true" />
              <span>Press</span>
              <KbdGroup>
                <Kbd>{modKey}</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
              <span>for commands, or type</span>
              <Kbd>/</Kbd>
              <span>to start one.</span>
            </p>
          </footer>
        </main>

        {/* Command palette */}
        <CommandDialog
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          title="Command palette"
          description="Search for a command or conversation action"
        >
          <CommandInput placeholder="Type a command or search…" />
          <CommandList>
            <CommandEmpty>No matching commands.</CommandEmpty>
            <CommandGroup heading="Conversation">
              <CommandItem
                onSelect={() => runCommand("Pinned the latest message", undefined)}
              >
                <PinIcon />
                Pin latest message
                <CommandShortcut>P</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand("Conversation cleared", () => {
                    clearTimers();
                    setStreamed("");
                    setPhase("idle");
                    setItems(INITIAL_ITEMS);
                  })
                }
              >
                <XIcon />
                Reset conversation
                <CommandShortcut>R</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand("Focused the composer", () =>
                    requestAnimationFrame(() => textareaRef.current?.focus()),
                  )
                }
              >
                <SearchIcon />
                Focus message box
                <CommandShortcut>/</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Workspace">
              <CommandItem onSelect={() => runCommand("Opened member list")}>
                <UsersIcon />
                View members
              </CommandItem>
              <CommandItem onSelect={() => runCommand("Toggled theme")}>
                <MoonIcon />
                Toggle theme
              </CommandItem>
            </CommandGroup>
          </CommandList>
          <Separator />
          <p className="px-3 py-2 text-xs text-muted-foreground">
            Use arrow keys to navigate, Enter to select, Esc to close.
          </p>
        </CommandDialog>
      </div>
    </TooltipProvider>
  );
}
