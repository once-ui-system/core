"use client"

import * as React from "react"
import {
  ArrowUpIcon,
  CommandIcon,
  CopyIcon,
  HashIcon,
  PaperclipIcon,
  RefreshCwIcon,
  SearchIcon,
  SmileIcon,
  SquareIcon,
  Trash2Icon,
  ArrowDownIcon,
  SparklesIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "@/components/ui/message-scroller"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/* -------------------------------------------------------------------------- */
/*                                    Data                                    */
/* -------------------------------------------------------------------------- */

type Sender = "me" | "assistant" | "teammate"

interface ChatMessage {
  id: string
  sender: Sender
  name: string
  initials: string
  time: string
  text: string
  /** Messages are rendered as one visual group when they share a groupId. */
  reactions?: { emoji: string; label: string }[]
  status?: string
}

const PEOPLE: Record<Sender, { name: string; initials: string }> = {
  me: { name: "You", initials: "YO" },
  assistant: { name: "Atlas", initials: "AT" },
  teammate: { name: "Priya Nair", initials: "PN" },
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    sender: "teammate",
    name: "Priya Nair",
    initials: "PN",
    time: "9:41 AM",
    text: "Morning! The checkout latency dashboard looks different after last night's deploy. p95 dropped from 840ms to 510ms.",
    reactions: [{ emoji: "🎉", label: "party popper" }],
  },
  {
    id: "m2",
    sender: "teammate",
    name: "Priya Nair",
    initials: "PN",
    time: "9:41 AM",
    text: "Can someone confirm it's the connection pool change and not just a quiet night?",
  },
  {
    id: "m3",
    sender: "me",
    name: "You",
    initials: "YO",
    time: "9:44 AM",
    text: "Pretty sure it's the pool change. Traffic was within 5% of a normal Tuesday. I'll ask Atlas to compare the two windows.",
    status: "Read by Priya",
  },
  {
    id: "m4",
    sender: "me",
    name: "You",
    initials: "YO",
    time: "9:45 AM",
    text: "@Atlas compare p95 checkout latency for Mon 9pm–Tue 9am against the previous Tuesday and tell me if the drop is explained by traffic.",
    status: "Delivered",
  },
  {
    id: "m5",
    sender: "assistant",
    name: "Atlas",
    initials: "AT",
    time: "9:45 AM",
    text: "Done. Request volume was 3.8% lower than last Tuesday, which accounts for roughly 25ms of the 330ms improvement. The rest lines up with the pool change shipped in release 2024.11.3: connection wait time fell from 290ms to 40ms at p95.",
  },
  {
    id: "m6",
    sender: "teammate",
    name: "Priya Nair",
    initials: "PN",
    time: "9:47 AM",
    text: "That's the answer I needed, thanks. Writing it up for the weekly review.",
    reactions: [
      { emoji: "👍", label: "thumbs up" },
      { emoji: "🔥", label: "fire" },
    ],
  },
]

const STREAMED_REPLY =
  "Here's a short summary you can paste into the weekly review:\n\nCheckout p95 latency fell from 840ms to 510ms after release 2024.11.3. Traffic differences explain about 25ms of that. The remaining ~305ms comes from the connection pool change, which cut connection wait time from 290ms to 40ms at p95. No regressions were seen in error rate (0.12% before, 0.11% after).\n\nWant me to add a chart of the two windows, or open a follow-up to roll the same pool settings out to the search service?"

const EMOJI_GROUPS: { label: string; emojis: { char: string; name: string }[] }[] = [
  {
    label: "Smileys",
    emojis: [
      { char: "😀", name: "grinning face" },
      { char: "😂", name: "face with tears of joy" },
      { char: "🙂", name: "slightly smiling face" },
      { char: "😉", name: "winking face" },
      { char: "😍", name: "smiling face with heart eyes" },
      { char: "🤔", name: "thinking face" },
      { char: "😅", name: "grinning face with sweat" },
      { char: "😎", name: "smiling face with sunglasses" },
    ],
  },
  {
    label: "Gestures",
    emojis: [
      { char: "👍", name: "thumbs up" },
      { char: "👏", name: "clapping hands" },
      { char: "🙌", name: "raising hands" },
      { char: "🙏", name: "folded hands" },
      { char: "👀", name: "eyes" },
      { char: "💪", name: "flexed biceps" },
      { char: "🤝", name: "handshake" },
      { char: "👋", name: "waving hand" },
    ],
  },
  {
    label: "Things",
    emojis: [
      { char: "🎉", name: "party popper" },
      { char: "🔥", name: "fire" },
      { char: "🚀", name: "rocket" },
      { char: "✅", name: "check mark" },
      { char: "💡", name: "light bulb" },
      { char: "📈", name: "chart increasing" },
      { char: "🐛", name: "bug" },
      { char: "☕", name: "hot beverage" },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function formatNow(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function PersonAvatar({ sender, initials }: { sender: Sender; initials: string }) {
  return (
    <Avatar>
      <AvatarFallback
        className={cn(
          "text-xs font-medium",
          sender === "assistant" && "bg-primary text-primary-foreground",
          sender === "teammate" &&
            "bg-[oklch(0.93_0.05_250)] text-[oklch(0.35_0.1_250)] dark:bg-[oklch(0.35_0.08_250)] dark:text-[oklch(0.92_0.04_250)]",
          sender === "me" && "bg-secondary text-secondary-foreground"
        )}
      >
        {sender === "assistant" ? (
          <SparklesIcon className="size-4" aria-hidden="true" />
        ) : (
          initials
        )}
        <span className="sr-only">{PEOPLE[sender].name}</span>
      </AvatarFallback>
    </Avatar>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Message rows                                */
/* -------------------------------------------------------------------------- */

function ChatRow({
  message,
  isLastInGroup,
  isFirstInGroup,
  onCopy,
}: {
  message: ChatMessage
  isFirstInGroup: boolean
  isLastInGroup: boolean
  onCopy: (text: string) => void
}) {
  const mine = message.sender === "me"
  const assistant = message.sender === "assistant"
  const hasFooter = isLastInGroup && (Boolean(message.status) || assistant || true)

  return (
    <Message align={mine ? "end" : "start"}>
      <MessageAvatar className={cn(!isLastInGroup && "invisible")}>
        {isLastInGroup ? (
          <PersonAvatar sender={message.sender} initials={message.initials} />
        ) : (
          <span className="size-8" aria-hidden="true" />
        )}
      </MessageAvatar>
      <MessageContent>
        {isFirstInGroup && !mine && (
          <MessageHeader>
            <span>{message.name}</span>
            {assistant && (
              <Badge variant="secondary" className="ms-2 h-4 px-1.5 text-[10px]">
                AI
              </Badge>
            )}
          </MessageHeader>
        )}
        <Bubble
          variant={mine ? "default" : assistant ? "outline" : "secondary"}
          align={mine ? "end" : "start"}
          className={cn(message.reactions && "mb-2")}
        >
          <BubbleContent className="whitespace-pre-wrap">{message.text}</BubbleContent>
          {message.reactions && (
            <BubbleReactions
              align={mine ? "start" : "end"}
              role="img"
              aria-label={`Reactions: ${message.reactions.map((r) => r.label).join(", ")}`}
            >
              {message.reactions.map((r) => (
                <span key={r.label}>{r.emoji}</span>
              ))}
            </BubbleReactions>
          )}
        </Bubble>
        {hasFooter && (
          <MessageFooter className="gap-2">
            <time>{message.time}</time>
            {message.status && <span aria-hidden="true">·</span>}
            {message.status && <span>{message.status}</span>}
            {assistant && (
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Copy reply"
                onClick={() => onCopy(message.text)}
              >
                <CopyIcon />
              </Button>
            )}
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  )
}

function StreamingRow({ text, thinking }: { text: string; thinking: boolean }) {
  return (
    <Message>
      <MessageAvatar>
        <PersonAvatar sender="assistant" initials="AT" />
      </MessageAvatar>
      <MessageContent>
        <MessageHeader>
          <span>Atlas</span>
          <Badge variant="secondary" className="ms-2 h-4 px-1.5 text-[10px]">
            AI
          </Badge>
        </MessageHeader>
        {thinking ? (
          <Marker role="status" className="px-3 py-2">
            <MarkerIcon>
              <Spinner aria-hidden="true" role="presentation" />
            </MarkerIcon>
            <MarkerContent>Atlas is thinking…</MarkerContent>
          </Marker>
        ) : (
          <>
            <Bubble variant="outline">
              <BubbleContent className="whitespace-pre-wrap">
                {text}
                <span
                  aria-hidden="true"
                  className="ms-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-foreground align-baseline motion-reduce:animate-none"
                />
              </BubbleContent>
            </Bubble>
            <Marker role="status" className="px-3 text-xs">
              <MarkerIcon>
                <Spinner aria-hidden="true" role="presentation" className="size-3" />
              </MarkerIcon>
              <MarkerContent>Atlas is writing…</MarkerContent>
            </Marker>
          </>
        )}
      </MessageContent>
    </Message>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Composer                                  */
/* -------------------------------------------------------------------------- */

function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Insert emoji"
              >
                <SmileIcon />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">Insert emoji</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent
        align="start"
        side="top"
        className="w-[min(18rem,calc(100vw-2rem))] p-3"
        aria-label="Emoji picker"
      >
        <div className="flex max-h-64 flex-col gap-3 overflow-y-auto">
          {EMOJI_GROUPS.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h3 className="mb-1 text-xs font-medium text-muted-foreground">
                {group.label}
              </h3>
              <div className="grid grid-cols-8 gap-0.5">
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji.char}
                    type="button"
                    aria-label={emoji.name}
                    title={emoji.name}
                    onClick={() => {
                      onPick(emoji.char)
                      setOpen(false)
                    }}
                    className="flex aspect-square items-center justify-center rounded-md text-lg transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <span aria-hidden="true">{emoji.char}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function Composer({
  streaming,
  onSend,
  onStop,
  textareaRef,
  value,
  setValue,
  onOpenPalette,
}: {
  streaming: boolean
  onSend: (text: string) => void
  onStop: () => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  value: string
  setValue: (v: string) => void
  onOpenPalette: () => void
}) {
  const canSend = value.trim().length > 0 && !streaming

  const submit = () => {
    if (!canSend) return
    onSend(value.trim())
    setValue("")
  }

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current
    if (!el) {
      setValue(value + emoji)
      return
    }
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const next = value.slice(0, start) + emoji + value.slice(end)
    setValue(next)
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + emoji.length
      el.setSelectionRange(pos, pos)
    })
  }

  return (
    <div className="border-t bg-background px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
      <form
        className="mx-auto w-full max-w-3xl"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <div className="flex flex-col rounded-2xl border border-input bg-background shadow-xs transition-[box-shadow,border-color] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30">
          <label htmlFor="chat-input" className="sr-only">
            Message #checkout-perf
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={value}
            rows={1}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Message #checkout-perf, or press ⌘K for commands"
            className="field-sizing-content max-h-40 min-h-12 w-full resize-none bg-transparent px-4 pt-3 pb-1 text-base outline-none placeholder:text-muted-foreground md:text-sm"
          />
          <div className="flex items-center gap-1 px-2 pb-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Attach a file"
                    onClick={() =>
                      toast("Attachments are disabled in this preview")
                    }
                  >
                    <PaperclipIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Attach a file</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <EmojiPicker onPick={insertEmoji} />
            <button
              type="button"
              onClick={onOpenPalette}
              className="ms-1 hidden items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:inline-flex"
            >
              <span>Commands</span>
              <KbdGroup>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </button>
            <div className="ms-auto flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground md:inline">
                <Kbd>Enter</Kbd> to send · <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for
                a new line
              </span>
              {streaming ? (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="secondary"
                  className="rounded-full"
                  aria-label="Stop generating"
                  onClick={onStop}
                >
                  <SquareIcon className="fill-current" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon-sm"
                  className="rounded-full"
                  aria-label="Send message"
                  disabled={!canSend}
                >
                  <ArrowUpIcon />
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Command palette                              */
/* -------------------------------------------------------------------------- */

function Palette({
  open,
  onOpenChange,
  onClearDraft,
  onRegenerate,
  streaming,
  hasDraft,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClearDraft: () => void
  onRegenerate: () => void
  streaming: boolean
  hasDraft: boolean
}) {
  const { scrollToEnd, scrollToStart, scrollToMessage } = useMessageScroller()

  const run = (fn: () => void) => {
    onOpenChange(false)
    // Wait for the dialog to release focus before moving the transcript.
    window.setTimeout(fn, 50)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Search for an action or jump to a message."
    >
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No matching commands.</CommandEmpty>
        <CommandGroup heading="Conversation">
          <CommandItem onSelect={() => run(() => scrollToEnd())}>
            <ArrowDownIcon />
            Jump to latest message
            <CommandShortcut>End</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => scrollToStart())}>
            <ArrowUpIcon />
            Jump to start
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => scrollToMessage("m5"))}
            keywords={["latency", "atlas", "comparison"]}
          >
            <SearchIcon />
            Go to Atlas&apos;s latency comparison
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            disabled={streaming}
            onSelect={() => run(onRegenerate)}
            keywords={["retry", "ask", "summary"]}
          >
            <RefreshCwIcon />
            Ask Atlas for a summary
          </CommandItem>
          <CommandItem
            disabled={!hasDraft}
            onSelect={() => run(onClearDraft)}
          >
            <Trash2Icon />
            Clear draft
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => toast.success("Channel link copied to clipboard"))
            }
          >
            <HashIcon />
            Copy channel link
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

function ChatApp() {
  const [messages, setMessages] = React.useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [draft, setDraft] = React.useState("")
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const [phase, setPhase] = React.useState<"idle" | "thinking" | "streaming">(
    "idle"
  )
  const [streamed, setStreamed] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
  const timersRef = React.useRef<number[]>([])
  const idRef = React.useRef(100)
  const streaming = phase !== "idle"

  const clearTimers = React.useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
  }, [])

  React.useEffect(() => clearTimers, [clearTimers])

  // ⌘K / Ctrl+K opens the command palette from anywhere on the page.
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const nextId = () => `m${++idRef.current}`

  const finishStream = React.useCallback((full: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `m${++idRef.current}`,
        sender: "assistant",
        name: "Atlas",
        initials: "AT",
        time: formatNow(),
        text: full,
      },
    ])
    setStreamed("")
    setPhase("idle")
  }, [])

  const startReply = React.useCallback(() => {
    clearTimers()
    setStreamed("")
    setPhase("thinking")

    const tokens = STREAMED_REPLY.split(/(\s+)/)
    let index = 0
    let acc = ""

    const tick = () => {
      if (index >= tokens.length) {
        finishStream(acc)
        return
      }
      acc += tokens[index]
      index += 1
      setStreamed(acc)
      setPhase("streaming")
      timersRef.current.push(window.setTimeout(tick, 35 + Math.random() * 45))
    }

    timersRef.current.push(window.setTimeout(tick, 1400))
  }, [clearTimers, finishStream])

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: nextId(),
        sender: "me",
        name: "You",
        initials: "YO",
        time: formatNow(),
        text,
        status: "Delivered",
      },
    ])
    startReply()
  }

  const handleStop = () => {
    clearTimers()
    if (streamed.trim()) {
      finishStream(streamed.trim() + " …")
    } else {
      setPhase("idle")
      setStreamed("")
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Reply copied to clipboard")
    } catch {
      toast.error("Couldn't access the clipboard")
    }
  }

  const askForSummary = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: nextId(),
        sender: "me",
        name: "You",
        initials: "YO",
        time: formatNow(),
        text: "@Atlas can you write a short summary of this thread for the weekly review?",
        status: "Delivered",
      },
    ])
    startReply()
  }

  return (
    <MessageScrollerProvider
      autoScroll
      scrollPreviousItemPeek={64}
      defaultScrollPosition="end"
    >
      <div className="flex h-dvh min-h-0 flex-col bg-background">
        {/* Header */}
        <header className="flex items-center gap-3 border-b px-3 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
              aria-hidden="true"
            >
              <HashIcon className="size-4" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm leading-tight font-semibold">
                checkout-perf
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                3 members · Priya, You, Atlas
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setPaletteOpen(true)}
            aria-label="Open command palette"
            aria-keyshortcuts="Control+K Meta+K"
          >
            <SearchIcon />
            <span className="hidden sm:inline">Search or run a command</span>
            <KbdGroup className="ms-1 hidden sm:inline-flex">
              <Kbd>
                <CommandIcon />
              </Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </Button>
        </header>

        {/* Transcript */}
        <main className="min-h-0 flex-1">
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent
                aria-busy={phase === "streaming"}
                className="mx-auto w-full max-w-3xl gap-4 px-3 py-6 sm:px-6"
              >
                <MessageScrollerItem messageId="day-tue">
                  <Marker variant="separator">
                    <MarkerContent>Tuesday, November 12</MarkerContent>
                  </Marker>
                </MessageScrollerItem>

                {messages.map((message, i) => {
                  const prev = messages[i - 1]
                  const next = messages[i + 1]
                  const isFirstInGroup = !prev || prev.sender !== message.sender
                  const isLastInGroup = !next || next.sender !== message.sender

                  return (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={message.sender === "me"}
                      className={cn(!isLastInGroup && "-mb-2")}
                    >
                      <MessageGroup>
                        <ChatRow
                          message={message}
                          isFirstInGroup={isFirstInGroup}
                          isLastInGroup={isLastInGroup}
                          onCopy={handleCopy}
                        />
                      </MessageGroup>
                    </MessageScrollerItem>
                  )
                })}

                {streaming && (
                  <MessageScrollerItem messageId="streaming">
                    <StreamingRow text={streamed} thinking={phase === "thinking"} />
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </main>

        <Composer
          streaming={streaming}
          onSend={handleSend}
          onStop={handleStop}
          textareaRef={textareaRef}
          value={draft}
          setValue={setDraft}
          onOpenPalette={() => setPaletteOpen(true)}
        />
      </div>

      <Palette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onClearDraft={() => {
          setDraft("")
          textareaRef.current?.focus()
        }}
        onRegenerate={askForSummary}
        streaming={streaming}
        hasDraft={draft.length > 0}
      />
    </MessageScrollerProvider>
  )
}

export default function Page() {
  return <ChatApp />
}
