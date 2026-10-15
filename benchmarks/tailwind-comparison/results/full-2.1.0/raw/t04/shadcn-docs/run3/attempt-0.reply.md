The `Textarea` has `min-h-16` and `field-sizing-content`, and `InputGroupTextarea` sets `rounded-none border-0`. I'll use `InputGroup` with `block-end` addons for the toolbar. Writing the file now.

```tsx
"use client";

import * as React from "react";
import {
  BellOffIcon,
  ChevronsDownIcon,
  CommandIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  HashIcon,
  LayoutListIcon,
  PaperclipIcon,
  SendIcon,
  SmileIcon,
  SquareIcon,
  Trash2Icon,
  SparklesIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import {
  Avatar,
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
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "@/components/ui/message-scroller";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* -------------------------------------------------------------------------- */
/* Types & placeholder data                                                    */
/* -------------------------------------------------------------------------- */

type Person = {
  id: string;
  name: string;
  initials: string;
  role: string;
};

type ChatAttachment = {
  id: string;
  title: string;
  description: string;
  kind: "doc" | "sheet";
};

type ChatMessage = {
  id: string;
  authorId: string;
  text: string;
  time: string;
  reactions?: string[];
  attachments?: ChatAttachment[];
};

const ME: Person = { id: "me", name: "You", initials: "YO", role: "Design Lead" };

const PEOPLE: Record<string, Person> = {
  me: ME,
  mira: { id: "mira", name: "Mira Okafor", initials: "MO", role: "Product Manager" },
  tomas: { id: "tomas", name: "Tomás Reyes", initials: "TR", role: "Frontend Engineer" },
  priya: { id: "priya", name: "Priya Nair", initials: "PN", role: "UX Researcher" },
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    authorId: "mira",
    text: "Morning all! Quick recap before standup: the onboarding revamp ships to 10% of new accounts on Thursday.",
    time: "9:02 AM",
  },
  {
    id: "m2",
    authorId: "mira",
    text: "I've attached the rollout checklist and the latest funnel numbers so we're all looking at the same thing.",
    time: "9:03 AM",
    attachments: [
      {
        id: "a1",
        title: "rollout-checklist.pdf",
        description: "PDF · 480 KB",
        kind: "doc",
      },
      {
        id: "a2",
        title: "funnel-week-14.xlsx",
        description: "Spreadsheet · 1.2 MB",
        kind: "sheet",
      },
    ],
  },
  {
    id: "m3",
    authorId: "tomas",
    text: "Thanks Mira. The feature flag is wired up and the new step-two screen passes all the a11y checks. Only open item is the empty state on slow connections.",
    time: "9:08 AM",
    reactions: ["👍 3", "🚀 1"],
  },
  {
    id: "m4",
    authorId: "me",
    text: "Great progress. I'll finish the skeleton loading states today so the slow-connection case feels intentional rather than broken.",
    time: "9:11 AM",
  },
  {
    id: "m5",
    authorId: "priya",
    text: "One note from yesterday's sessions: 4 of 6 participants missed the 'skip for now' link on step three. Can we make it a proper secondary button?",
    time: "9:15 AM",
    reactions: ["💡 2"],
  },
  {
    id: "m6",
    authorId: "me",
    text: "Good catch, Priya. I'll swap it for an outline button and bump the contrast. Tomás, does that change anything on your side?",
    time: "9:17 AM",
  },
  {
    id: "m7",
    authorId: "tomas",
    text: "Nope, it's the same handler. Send me the updated spec and I'll have it in the preview build by lunch.",
    time: "9:19 AM",
    reactions: ["🙌 2"],
  },
];

const STREAMED_REPLY =
  "Sounds like a plan. I'll update the checklist with the skip-button change and move the review to 2 PM so everyone has time to look at the preview build first. I'll also add a line item for the slow-connection skeletons so nothing slips before Thursday's rollout.";

const EMOJI_GROUPS: { label: string; emojis: { char: string; name: string }[] }[] = [
  {
    label: "Smileys",
    emojis: [
      { char: "😀", name: "Grinning face" },
      { char: "😂", name: "Face with tears of joy" },
      { char: "🙂", name: "Slightly smiling face" },
      { char: "😍", name: "Heart eyes" },
      { char: "🤔", name: "Thinking face" },
      { char: "😅", name: "Grinning face with sweat" },
      { char: "😎", name: "Smiling face with sunglasses" },
      { char: "🥳", name: "Partying face" },
    ],
  },
  {
    label: "Gestures",
    emojis: [
      { char: "👍", name: "Thumbs up" },
      { char: "👏", name: "Clapping hands" },
      { char: "🙌", name: "Raising hands" },
      { char: "🙏", name: "Folded hands" },
      { char: "👀", name: "Eyes" },
      { char: "💪", name: "Flexed biceps" },
      { char: "🤝", name: "Handshake" },
      { char: "✌️", name: "Victory hand" },
    ],
  },
  {
    label: "Objects",
    emojis: [
      { char: "🚀", name: "Rocket" },
      { char: "🎉", name: "Party popper" },
      { char: "💡", name: "Light bulb" },
      { char: "🔥", name: "Fire" },
      { char: "✅", name: "Check mark" },
      { char: "📌", name: "Pushpin" },
      { char: "☕", name: "Coffee" },
      { char: "❤️", name: "Red heart" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Small presentational pieces                                                 */
/* -------------------------------------------------------------------------- */

function PersonAvatar({ person, size }: { person: Person; size?: "sm" | "default" | "lg" }) {
  return (
    <Avatar size={size}>
      <AvatarFallback aria-label={person.name}>{person.initials}</AvatarFallback>
    </Avatar>
  );
}

function TypingIndicator({ name }: { name: string }) {
  return (
    <Message>
      <MessageAvatar>
        <PersonAvatar person={PEOPLE.mira} />
      </MessageAvatar>
      <MessageContent>
        <Marker role="status" className="text-muted-foreground">
          <MarkerIcon>
            <Spinner aria-hidden="true" role="presentation" />
          </MarkerIcon>
          <MarkerContent>{name} is typing…</MarkerContent>
        </Marker>
      </MessageContent>
    </Message>
  );
}

function ChatAttachments({ items }: { items: ChatAttachment[] }) {
  return (
    <AttachmentGroup>
      {items.map((item) => (
        <Attachment key={item.id} state="done" size="sm">
          <AttachmentMedia variant="icon">
            {item.kind === "doc" ? <FileTextIcon /> : <FileSpreadsheetIcon />}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{item.title}</AttachmentTitle>
            <AttachmentDescription>{item.description}</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ))}
    </AttachmentGroup>
  );
}

/* -------------------------------------------------------------------------- */
/* Composer                                                                    */
/* -------------------------------------------------------------------------- */

type ComposerProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  streaming: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onOpenPalette: () => void;
};

function Composer({
  value,
  onValueChange,
  onSend,
  onStop,
  streaming,
  textareaRef,
  onOpenPalette,
}: ComposerProps) {
  const [emojiOpen, setEmojiOpen] = React.useState(false);
  const canSend = value.trim().length > 0 && !streaming;

  const insertEmoji = (char: string) => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + char + value.slice(end);
    onValueChange(next);
    setEmojiOpen(false);
    requestAnimationFrame(() => {
      const target = textareaRef.current;
      if (!target) return;
      const caret = start + char.length;
      target.focus();
      target.setSelectionRange(caret, caret);
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) onSend();
      }}
    >
      <InputGroup>
        <label htmlFor="chat-input" className="sr-only">
          Message #product-launch
        </label>
        <InputGroupTextarea
          id="chat-input"
          ref={textareaRef}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message #product-launch"
          rows={1}
          className="max-h-40 min-h-12"
        />
        <InputGroupAddon align="block-end">
          <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
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
              align="start"
              side="top"
              className="w-72 max-w-[calc(100vw-2rem)] p-3"
              aria-label="Emoji picker"
            >
              <div className="flex max-h-64 flex-col gap-3 overflow-y-auto">
                {EMOJI_GROUPS.map((group) => (
                  <div key={group.label} className="flex flex-col gap-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      {group.label}
                    </p>
                    <div className="grid grid-cols-8 gap-0.5">
                      {group.emojis.map((emoji) => (
                        <Button
                          key={emoji.char}
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-base"
                          aria-label={emoji.name}
                          onClick={() => insertEmoji(emoji.char)}
                        >
                          <span aria-hidden="true">{emoji.char}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                size="icon-sm"
                aria-label="Attach a file"
                onClick={() => toast("Attachments are disabled in this demo")}
              >
                <PaperclipIcon />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent side="top">Attach file</TooltipContent>
          </Tooltip>

          <button
            type="button"
            onClick={onOpenPalette}
            className="ml-1 hidden items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:flex"
            aria-label="Open command palette"
          >
            Press
            <KbdGroup>
              <Kbd>
                <CommandIcon aria-hidden="true" />
              </Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
            for commands
          </button>

          {streaming ? (
            <InputGroupButton
              type="button"
              variant="secondary"
              size="sm"
              className="ml-auto"
              onClick={onStop}
            >
              <SquareIcon data-icon="inline-start" />
              Stop
            </InputGroupButton>
          ) : (
            <InputGroupButton
              type="submit"
              variant="default"
              size="sm"
              className="ml-auto"
              disabled={!canSend}
            >
              <SendIcon data-icon="inline-start" />
              Send
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
      <p className="px-1 text-xs text-muted-foreground">
        <KbdGroup>
          <Kbd>Enter</Kbd>
        </KbdGroup>{" "}
        to send ·{" "}
        <KbdGroup>
          <Kbd>Shift</Kbd>
          <Kbd>Enter</Kbd>
        </KbdGroup>{" "}
        for a new line
      </p>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Command palette                                                             */
/* -------------------------------------------------------------------------- */

type PaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compact: boolean;
  onToggleCompact: () => void;
  onClear: () => void;
  onSimulate: () => void;
  onMute: () => void;
  streaming: boolean;
  hasDraft: boolean;
};

function CommandPalette({
  open,
  onOpenChange,
  compact,
  onToggleCompact,
  onClear,
  onSimulate,
  onMute,
  streaming,
  hasDraft,
}: PaletteProps) {
  const { scrollToEnd, scrollToStart } = useMessageScroller();

  const run = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Search for an action to run in this conversation."
    >
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No matching commands.</CommandEmpty>
        <CommandGroup heading="Conversation">
          <CommandItem onSelect={() => run(() => scrollToEnd())}>
            <ChevronsDownIcon />
            Jump to latest message
            <CommandShortcut>End</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => scrollToStart())}>
            <HashIcon />
            Jump to start of conversation
            <CommandShortcut>Home</CommandShortcut>
          </CommandItem>
          <CommandItem disabled={streaming} onSelect={() => run(onSimulate)}>
            <SparklesIcon />
            Ask Mira for a reply
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Preferences">
          <CommandItem onSelect={() => run(onToggleCompact)}>
            <LayoutListIcon />
            {compact ? "Switch to comfortable spacing" : "Switch to compact spacing"}
          </CommandItem>
          <CommandItem onSelect={() => run(onMute)}>
            <BellOffIcon />
            Mute #product-launch for 1 hour
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Composer">
          <CommandItem disabled={!hasDraft} onSelect={() => run(onClear)}>
            <Trash2Icon />
            Clear draft
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Chat                                                                        */
/* -------------------------------------------------------------------------- */

function Chat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = React.useState("");
  const [streamingId, setStreamingId] = React.useState<string | null>(null);
  const [typing, setTyping] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [compact, setCompact] = React.useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const timersRef = React.useRef<number[]>([]);
  const idRef = React.useRef(0);

  const streaming = typing || streamingId !== null;

  const clearTimers = React.useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  React.useEffect(() => clearTimers, [clearTimers]);

  // Global ⌘K / Ctrl+K shortcut.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const nextId = () => {
    idRef.current += 1;
    return `local-${idRef.current}`;
  };

  const startReply = React.useCallback(() => {
    clearTimers();
    setTyping(true);

    const words = STREAMED_REPLY.split(" ");
    const replyId = nextId();

    const begin = window.setTimeout(() => {
      setTyping(false);
      setStreamingId(replyId);
      setMessages((prev) => [
        ...prev,
        {
          id: replyId,
          authorId: "mira",
          text: "",
          time: "Just now",
        },
      ]);

      let index = 0;
      const tick = () => {
        index += 1;
        const chunk = words.slice(0, index).join(" ");
        setMessages((prev) =>
          prev.map((m) => (m.id === replyId ? { ...m, text: chunk } : m)),
        );
        if (index < words.length) {
          timersRef.current.push(window.setTimeout(tick, 55));
        } else {
          setStreamingId(null);
        }
      };
      timersRef.current.push(window.setTimeout(tick, 55));
    }, 1400);

    timersRef.current.push(begin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimers]);

  const stopReply = React.useCallback(() => {
    clearTimers();
    setTyping(false);
    setStreamingId(null);
    toast("Reply stopped");
  }, [clearTimers]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || streaming) return;
    setMessages((prev) => [
      ...prev,
      { id: nextId(), authorId: "me", text, time: "Just now" },
    ]);
    setDraft("");
    startReply();
  };

  const simulateReply = () => {
    if (streaming) return;
    startReply();
  };

  // Group consecutive messages from the same author.
  const rows = React.useMemo(() => {
    const result: { author: Person; items: ChatMessage[] }[] = [];
    for (const message of messages) {
      const author = PEOPLE[message.authorId] ?? ME;
      const last = result[result.length - 1];
      if (last && last.author.id === author.id) {
        last.items.push(message);
      } else {
        result.push({ author, items: [message] });
      }
    }
    return result;
  }, [messages]);

  return (
    <MessageScrollerProvider autoScroll defaultScrollPosition="end">
      <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col bg-background sm:border-x">
        <header className="flex items-center gap-3 border-b px-4 py-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="flex items-center gap-1.5 truncate text-base font-semibold">
              <HashIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              product-launch
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              Onboarding revamp · rollout Thursday
            </p>
          </div>

          <AvatarGroup aria-label="Members: Mira, Tomás, Priya and 2 more">
            <PersonAvatar person={PEOPLE.mira} size="sm" />
            <PersonAvatar person={PEOPLE.tomas} size="sm" />
            <PersonAvatar person={PEOPLE.priya} size="sm" />
            <AvatarGroupCount className="size-6 text-xs">+2</AvatarGroupCount>
          </AvatarGroup>

          <Separator orientation="vertical" className="hidden h-6 sm:block" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaletteOpen(true)}
                aria-label="Open command palette"
                aria-keyshortcuts="Control+K Meta+K"
              >
                <CommandIcon data-icon="inline-start" />
                <span className="hidden sm:inline">Commands</span>
                <KbdGroup className="hidden md:inline-flex">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Command palette (⌘K / Ctrl+K)</TooltipContent>
          </Tooltip>
        </header>

        <div className="relative min-h-0 flex-1">
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent
                aria-busy={streamingId !== null}
                className={cn("px-4 py-6", compact ? "gap-4" : "gap-8")}
              >
                <MessageScrollerItem messageId="divider-today">
                  <Marker variant="separator">
                    <MarkerContent>Today</MarkerContent>
                  </Marker>
                </MessageScrollerItem>

                {rows.map((row) => {
                  const mine = row.author.id === ME.id;
                  const align = mine ? "end" : "start";
                  const lastIndex = row.items.length - 1;

                  return (
                    <MessageScrollerItem
                      key={row.items[0].id}
                      messageId={row.items[0].id}
                      scrollAnchor={mine}
                    >
                      <MessageGroup>
                        {row.items.map((message, index) => {
                          const isLast = index === lastIndex;
                          const isStreamingThis = message.id === streamingId;
                          return (
                            <Message key={message.id} align={align}>
                              <MessageAvatar>
                                {isLast ? (
                                  <PersonAvatar person={row.author} />
                                ) : (
                                  <span className="size-8" aria-hidden="true" />
                                )}
                              </MessageAvatar>
                              <MessageContent>
                                {index === 0 && !mine ? (
                                  <MessageHeader>
                                    <span className="truncate text-foreground">
                                      {row.author.name}
                                    </span>
                                    <span className="ml-2 hidden truncate font-normal sm:inline">
                                      {row.author.role}
                                    </span>
                                  </MessageHeader>
                                ) : null}
                                <Bubble
                                  variant={mine ? "default" : "secondary"}
                                  align={align}
                                  className="max-w-[88%] sm:max-w-[80%]"
                                >
                                  <BubbleContent>
                                    {message.text}
                                    {isStreamingThis ? (
                                      <span
                                        aria-hidden="true"
                                        className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-current"
                                      />
                                    ) : null}
                                  </BubbleContent>
                                  {message.reactions && message.reactions.length > 0 ? (
                                    <BubbleReactions side="bottom" align={mine ? "end" : "start"}>
                                      {message.reactions.map((reaction) => (
                                        <span
                                          key={reaction}
                                          className="text-xs"
                                          aria-label={`Reaction ${reaction}`}
                                        >
                                          {reaction}
                                        </span>
                                      ))}
                                    </BubbleReactions>
                                  ) : null}
                                </Bubble>
                                {message.attachments ? (
                                  <ChatAttachments items={message.attachments} />
                                ) : null}
                                {isLast ? (
                                  <MessageFooter
                                    className={cn(
                                      message.reactions && message.reactions.length > 0 && "pt-2",
                                    )}
                                  >
                                    {isStreamingThis ? "Typing…" : message.time}
                                  </MessageFooter>
                                ) : null}
                              </MessageContent>
                            </Message>
                          );
                        })}
                      </MessageGroup>
                    </MessageScrollerItem>
                  );
                })}

                {typing ? (
                  <MessageScrollerItem messageId="typing-indicator">
                    <TypingIndicator name="Mira" />
                  </MessageScrollerItem>
                ) : null}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </div>

        <div className="border-t bg-background px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4">
          <Composer
            value={draft}
            onValueChange={setDraft}
            onSend={sendMessage}
            onStop={stopReply}
            streaming={streaming}
            textareaRef={textareaRef}
            onOpenPalette={() => setPaletteOpen(true)}
          />
        </div>
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        compact={compact}
        onToggleCompact={() => {
          setCompact((value) => !value);
          toast(compact ? "Comfortable spacing on" : "Compact spacing on");
        }}
        onClear={() => {
          setDraft("");
          textareaRef.current?.focus();
        }}
        onSimulate={simulateReply}
        onMute={() => toast.success("Muted #product-launch for 1 hour")}
        streaming={streaming}
        hasDraft={draft.length > 0}
      />
    </MessageScrollerProvider>
  );
}

export default function Page() {
  return (
    <main className="bg-muted/30">
      <TooltipProvider delayDuration={300}>
        <Chat />
      </TooltipProvider>
      <Badge className="sr-only">Chat demo</Badge>
    </main>
  );
}
```