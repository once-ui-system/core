"use client"

import * as React from "react"
import {
  ArrowUpIcon,
  CommandIcon,
  CopyIcon,
  HashIcon,
  MoonIcon,
  PaperclipIcon,
  RefreshCwIcon,
  SearchIcon,
  SmileIcon,
  SquareIcon,
  ThumbsUpIcon,
  TrashIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
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

type Sender = "user" | "assistant" | "teammate"

type ChatMessage = {
  id: string
  sender: Sender
  name: string
  initials: string
  time: string
  text: string
  reaction?: string
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    sender: "teammate",
    name: "Priya Raman",
    initials: "PR",
    time: "9:41 AM",
    text: "Morning! I pushed the new onboarding checklist to the preview branch. Could you sanity-check the copy before we demo it at 11?",
  },
  {
    id: "m2",
    sender: "user",
    name: "You",
    initials: "ME",
    time: "9:43 AM",
    text: "On it. Does the empty state still say 'Nothing here yet'? I wanted to try something warmer.",
  },
  {
    id: "m3",
    sender: "assistant",
    name: "Atlas",
    initials: "AT",
    time: "9:43 AM",
    text: "It does. Here are three warmer options: 'Your checklist is a blank canvas', 'Ready when you are — add your first task', or 'All clear! Start by adding a task.' The second one tested best in last month's copy review.",
    reaction: "👍",
  },
  {
    id: "m4",
    sender: "teammate",
    name: "Priya Raman",
    initials: "PR",
    time: "9:47 AM",
    text: "Love the second one. I'll swap it in and rebuild the preview.",
  },
  {
    id: "m5",
    sender: "user",
    name: "You",
    initials: "ME",
    time: "9:52 AM",
    text: "Perfect. Atlas, can you summarize what changed in the checklist since last Friday so I can paste it into the demo notes?",
  },
]

const STREAMED_REPLY =
  "Here's the short version for your demo notes:\n\n• Added a four-step onboarding checklist with progress tracking\n• Replaced the empty state with friendlier copy\n• Fixed keyboard focus order on the skip button\n• Reduced first load by deferring the confetti animation\n\nWant me to turn this into a changelog entry as well?"

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
    label: "Symbols",
    emojis: [
      { char: "🎉", name: "Party popper" },
      { char: "🔥", name: "Fire" },
      { char: "✅", name: "Check mark" },
      { char: "🚀", name: "Rocket" },
      { char: "💡", name: "Light bulb" },
      { char: "❤️", name: "Red heart" },
      { char: "⭐", name: "Star" },
      { char: "🐛", name: "Bug" },
    ],
  },
]

function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
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
      </TooltipProvider>
      <PopoverContent
        align="start"
        side="top"
        className="w-[min(20rem,calc(100vw-2rem))] p-3"
        aria-label="Emoji picker"
      >
        <div className="flex max-h-64 flex-col gap-3 overflow-y-auto pe-1">
          {EMOJI_GROUPS.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">
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
                    className="flex size-8 items-center justify-center rounded-md text-lg transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
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

function ChatRow({
  message,
  onCopy,
}: {
  message: ChatMessage
  onCopy: (text: string) => void
}) {
  const isUser = message.sender === "user"
  const isAssistant = message.sender === "assistant"

  return (
    <Message align={isUser ? "end" : "start"}>
      <MessageAvatar>
        <Avatar>
          <AvatarFallback
            className={
              isUser
                ? "bg-primary text-xs font-medium text-primary-foreground"
                : isAssistant
                  ? "bg-secondary text-xs font-medium text-secondary-foreground"
                  : "bg-muted text-xs font-medium"
            }
          >
            {message.initials}
          </AvatarFallback>
        </Avatar>
      </MessageAvatar>
      <MessageContent>
        {!isUser && (
          <MessageHeader>
            <span>{message.name}</span>
            {isAssistant && (
              <span className="ms-1.5 rounded-sm bg-muted px-1.5 py-px text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                AI
              </span>
            )}
          </MessageHeader>
        )}
        <Bubble variant={isUser ? "default" : "secondary"} align={isUser ? "end" : "start"}>
          <BubbleContent className="whitespace-pre-wrap">
            {message.text}
          </BubbleContent>
          {message.reaction && (
            <BubbleReactions
              role="img"
              aria-label={`Reaction: ${message.reaction === "👍" ? "thumbs up" : message.reaction}`}
              align={isUser ? "start" : "end"}
            >
              <span>{message.reaction}</span>
            </BubbleReactions>
          )}
        </Bubble>
        <MessageFooter className={message.reaction ? "mt-1.5" : undefined}>
          <span>{message.time}</span>
          {isAssistant && (
            <span className="ms-2 inline-flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Copy message"
                onClick={() => onCopy(message.text)}
              >
                <CopyIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Mark as helpful"
                onClick={() => toast("Thanks for the feedback")}
              >
                <ThumbsUpIcon />
              </Button>
            </span>
          )}
        </MessageFooter>
      </MessageContent>
    </Message>
  )
}

export default function Page() {
  const [messages, setMessages] = React.useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [draft, setDraft] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "thinking" | "streaming">("idle")
  const [paletteOpen, setPaletteOpen] = React.useState(false)

  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const timersRef = React.useRef<number[]>([])
  const streamIdRef = React.useRef<string | null>(null)

  const clearTimers = React.useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    window.clearInterval(timersRef.current[0])
    timersRef.current = []
  }, [])

  React.useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => {
        window.clearTimeout(t)
        window.clearInterval(t)
      })
      timersRef.current = []
    }
  }, [])

  // Global ⌘K / Ctrl+K shortcut for the command palette.
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const isBusy = status !== "idle"

  const stopStreaming = React.useCallback(() => {
    clearTimers()
    streamIdRef.current = null
    setStatus("idle")
  }, [clearTimers])

  const startReply = React.useCallback(() => {
    const replyId = `a-${Date.now()}`
    streamIdRef.current = replyId
    setStatus("thinking")

    const words = STREAMED_REPLY.split(/(\s+)/)
    const begin = window.setTimeout(() => {
      setStatus("streaming")
      setMessages((prev) => [
        ...prev,
        {
          id: replyId,
          sender: "assistant",
          name: "Atlas",
          initials: "AT",
          time: "9:54 AM",
          text: "",
        },
      ])

      let index = 0
      const interval = window.setInterval(() => {
        index += 3
        const chunk = words.slice(0, index).join("")
        setMessages((prev) =>
          prev.map((m) => (m.id === replyId ? { ...m, text: chunk } : m))
        )
        if (index >= words.length) {
          window.clearInterval(interval)
          timersRef.current = timersRef.current.filter((t) => t !== interval)
          streamIdRef.current = null
          setStatus("idle")
        }
      }, 70)
      timersRef.current.push(interval)
    }, 1400)
    timersRef.current.push(begin)
  }, [])

  const send = React.useCallback(() => {
    const text = draft.trim()
    if (!text || isBusy) return
    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        sender: "user",
        name: "You",
        initials: "ME",
        time: "9:53 AM",
        text,
      },
    ])
    setDraft("")
    startReply()
  }, [draft, isBusy, startReply])

  const insertEmoji = React.useCallback((emoji: string) => {
    const el = textareaRef.current
    setDraft((current) => {
      const start = el?.selectionStart ?? current.length
      const end = el?.selectionEnd ?? current.length
      const next = current.slice(0, start) + emoji + current.slice(end)
      const caret = start + emoji.length
      window.requestAnimationFrame(() => {
        const node = textareaRef.current
        if (node) {
          node.focus()
          node.setSelectionRange(caret, caret)
        }
      })
      return next
    })
  }, [])

  const copyText = React.useCallback((text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => toast.success("Message copied"),
        () => toast.error("Couldn't copy the message")
      )
    } else {
      toast.error("Clipboard isn't available in this browser")
    }
  }, [])

  const runCommand = React.useCallback(
    (action: () => void) => {
      setPaletteOpen(false)
      action()
    },
    []
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      send()
    } else if (e.key === "/" && draft.length === 0) {
      e.preventDefault()
      setPaletteOpen(true)
    }
  }

  return (
    <div className="flex h-dvh w-full flex-col bg-background">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b px-4 py-3 sm:px-6">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <HashIcon className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm leading-tight font-semibold">
            onboarding-demo
          </h1>
          <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <UsersIcon className="size-3" aria-hidden="true" />
            3 members · Atlas is online
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setPaletteOpen(true)}
          aria-label="Open command palette"
          aria-keyshortcuts="Control+K Meta+K"
        >
          <SearchIcon />
          <span className="hidden sm:inline">Search or run a command</span>
          <KbdGroup className="ms-1">
            <Kbd>
              <CommandIcon aria-hidden="true" />
            </Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Button>
      </header>

      {/* Transcript */}
      <main className="relative min-h-0 flex-1">
        <MessageScrollerProvider autoScroll scrollPreviousItemPeek={64}>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent
                aria-busy={status === "streaming"}
                className="mx-auto w-full max-w-3xl gap-5 px-4 py-6 sm:px-6"
              >
                <MessageScrollerItem messageId="day-separator">
                  <Marker variant="separator">
                    <MarkerContent>Today</MarkerContent>
                  </Marker>
                </MessageScrollerItem>

                {messages.map((message) => (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={message.id}
                    scrollAnchor={message.sender === "user"}
                  >
                    <ChatRow message={message} onCopy={copyText} />
                  </MessageScrollerItem>
                ))}

                {status === "thinking" && (
                  <MessageScrollerItem messageId="thinking">
                    <Message>
                      <MessageAvatar>
                        <Avatar>
                          <AvatarFallback className="bg-secondary text-xs font-medium text-secondary-foreground">
                            AT
                          </AvatarFallback>
                        </Avatar>
                      </MessageAvatar>
                      <MessageContent>
                        <Bubble variant="secondary">
                          <BubbleContent>
                            <span
                              role="status"
                              className="flex items-center gap-2 text-muted-foreground"
                            >
                              <span className="flex items-center gap-1" aria-hidden="true">
                                <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s] motion-reduce:animate-none" />
                                <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s] motion-reduce:animate-none" />
                                <span className="size-1.5 animate-bounce rounded-full bg-current motion-reduce:animate-none" />
                              </span>
                              <span>Atlas is typing…</span>
                            </span>
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
      </main>

      {/* Composer */}
      <footer className="shrink-0 border-t bg-background px-4 pt-3 pb-4 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              Message onboarding-demo
            </label>
            <InputGroup className="rounded-xl">
              <InputGroupTextarea
                id="chat-input"
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message #onboarding-demo"
                rows={1}
                className="max-h-40 min-h-12"
                autoComplete="off"
                aria-describedby="chat-input-hint"
              />
              <InputGroupAddon align="block-end">
                <EmojiPicker onPick={insertEmoji} />
                <InputGroupButton
                  size="icon-sm"
                  aria-label="Attach a file"
                  onClick={() => toast("Attachments aren't available in this demo")}
                >
                  <PaperclipIcon />
                </InputGroupButton>
                <span
                  id="chat-input-hint"
                  className="ms-1 hidden min-w-0 items-center gap-1 truncate text-xs font-normal text-muted-foreground sm:flex"
                >
                  Type <Kbd>/</Kbd> for commands · <Kbd>Shift</Kbd>
                  <Kbd>Enter</Kbd> for a new line
                </span>
                {isBusy ? (
                  <InputGroupButton
                    size="icon-sm"
                    variant="outline"
                    className="ms-auto rounded-full"
                    aria-label="Stop generating"
                    onClick={stopStreaming}
                  >
                    <SquareIcon className="fill-current" />
                  </InputGroupButton>
                ) : (
                  <InputGroupButton
                    type="submit"
                    size="icon-sm"
                    variant="default"
                    className="ms-auto rounded-full"
                    aria-label="Send message"
                    disabled={draft.trim().length === 0}
                  >
                    <ArrowUpIcon />
                  </InputGroupButton>
                )}
              </InputGroupAddon>
            </InputGroup>
          </form>
          <p
            className="mt-2 flex h-4 items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"
            aria-live="polite"
          >
            {status === "streaming" ? (
              <>
                <Spinner className="size-3" aria-hidden="true" role="presentation" />
                Atlas is writing a reply…
              </>
            ) : (
              <span className="sm:hidden">
                Tap <SmileIcon className="inline size-3 align-[-2px]" aria-hidden="true" /> to add an emoji
              </span>
            )}
          </p>
        </div>
      </footer>

      {/* Command palette */}
      <CommandDialog
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        title="Command palette"
        description="Search for a command to run in this conversation."
      >
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No commands found.</CommandEmpty>
          <CommandGroup heading="Conversation">
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  setDraft("Can you summarize this thread?")
                  window.requestAnimationFrame(() => textareaRef.current?.focus())
                })
              }
            >
              <RefreshCwIcon />
              <span>Ask Atlas to summarize</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  const last = [...messages].reverse().find((m) => m.sender === "assistant")
                  if (last) copyText(last.text)
                  else toast("No assistant replies to copy yet")
                })
              }
            >
              <CopyIcon />
              <span>Copy last reply</span>
              <CommandShortcut>⌘C</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  stopStreaming()
                  setMessages(INITIAL_MESSAGES.slice(0, 1))
                  toast.success("Conversation cleared")
                })
              }
            >
              <TrashIcon />
              <span>Clear conversation</span>
              <CommandShortcut>⌘⌫</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Preferences">
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  document.documentElement.classList.toggle("dark")
                })
              }
            >
              <MoonIcon />
              <span>Toggle dark mode</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
