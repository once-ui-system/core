I'm writing the full page now.

```tsx
"use client"

import * as React from "react"
import {
  ArrowUpIcon,
  AtSignIcon,
  CommandIcon,
  FileTextIcon,
  HashIcon,
  MessageSquarePlusIcon,
  MoonIcon,
  PaperclipIcon,
  RotateCcwIcon,
  SearchIcon,
  SmileIcon,
  SquareIcon,
  SparklesIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
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

type Sender = {
  id: string
  name: string
  initials: string
  role: string
}

type ChatMessage = {
  id: string
  senderId: string
  text: string
  time: string
  reactions?: string[]
  attachment?: { name: string; meta: string }
}

const ME: Sender = { id: "me", name: "You", initials: "YO", role: "Product" }
const MAYA: Sender = {
  id: "maya",
  name: "Maya Okafor",
  initials: "MO",
  role: "Design",
}
const DEV: Sender = {
  id: "dev",
  name: "Devraj Patel",
  initials: "DP",
  role: "Engineering",
}
const ASSISTANT: Sender = {
  id: "assistant",
  name: "Relay Assistant",
  initials: "RA",
  role: "AI",
}

const SENDERS: Record<string, Sender> = {
  [ME.id]: ME,
  [MAYA.id]: MAYA,
  [DEV.id]: DEV,
  [ASSISTANT.id]: ASSISTANT,
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    senderId: "maya",
    text: "Morning! I pushed the new onboarding flow to the staging Figma file. The empty states finally match the illustration style.",
    time: "9:02 AM",
  },
  {
    id: "m2",
    senderId: "maya",
    text: "Biggest change: the checklist now collapses once three steps are done.",
    time: "9:03 AM",
    reactions: ["🎉 2"],
  },
  {
    id: "m3",
    senderId: "dev",
    text: "Nice. Does the collapsed state keep keyboard focus on the next incomplete step? That was the bug QA flagged last sprint.",
    time: "9:10 AM",
  },
  {
    id: "m4",
    senderId: "me",
    text: "Good catch. Maya, can you add a focus note to the spec? I'll attach the QA report so we have the repro steps in one place.",
    time: "9:14 AM",
    attachment: { name: "qa-report-sprint-41.pdf", meta: "PDF · 1.8 MB" },
  },
  {
    id: "m5",
    senderId: "maya",
    text: "Done, it's in the spec under “Focus management”. Shipping behind a flag on Thursday sounds right to me. 🚀",
    time: "9:21 AM",
    reactions: ["👍 3"],
  },
  {
    id: "m6",
    senderId: "me",
    text: "Perfect. @Relay can you summarise the open risks for Thursday's launch?",
    time: "9:24 AM",
  },
]

const STREAMED_REPLY =
  "Here's where Thursday's launch stands:\n\n1. Focus management: the fix is specced, but it still needs a regression test on Safari.\n2. Analytics: the three new onboarding events are defined, though the dashboards aren't updated yet.\n3. Copy: the empty-state text is waiting on legal review, expected by Wednesday noon.\n\nIf the Safari test passes, I'd rate the launch low risk. Want me to draft the rollout checklist?"

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: "Smileys", emojis: ["😀", "😂", "🥹", "😍", "😎", "🤔", "😅", "🙌"] },
  { label: "Gestures", emojis: ["👍", "👏", "🙏", "💪", "👀", "🤝", "✌️", "👋"] },
  { label: "Objects", emojis: ["🚀", "🎉", "💡", "🔥", "✅", "📌", "🧪", "☕"] },
]

const SUGGESTIONS = [
  "Draft the rollout checklist",
  "List Safari test cases",
  "Summarise today's thread",
]

/* -------------------------------------------------------------------------- */
/*                                 Components                                 */
/* -------------------------------------------------------------------------- */

function SenderAvatar({ sender }: { sender: Sender }) {
  return (
    <Avatar>
      <AvatarFallback
        className={cn(
          sender.id === "assistant" && "bg-primary text-primary-foreground",
          "text-xs font-medium"
        )}
      >
        {sender.id === "assistant" ? (
          <SparklesIcon className="size-4" aria-hidden="true" />
        ) : (
          sender.initials
        )}
        <span className="sr-only">{sender.name}</span>
      </AvatarFallback>
    </Avatar>
  )
}

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
        className="w-[min(18rem,calc(100vw-2rem))] p-3"
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
                    className="text-base"
                    aria-label={`Insert ${emoji}`}
                    onClick={() => {
                      onPick(emoji)
                      setOpen(false)
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
  )
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

type Status = "idle" | "thinking" | "streaming"

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export default function ChatPage() {
  const [messages, setMessages] = React.useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [draft, setDraft] = React.useState("")
  const [status, setStatus] = React.useState<Status>("idle")
  const [streamed, setStreamed] = React.useState("")
  const [paletteOpen, setPaletteOpen] = React.useState(false)

  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const timers = React.useRef<number[]>([])
  const streamedRef = React.useRef("")
  const counter = React.useRef(0)

  const clearTimers = React.useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id))
    window.clearInterval(timers.current[timers.current.length - 1])
    timers.current = []
  }, [])

  React.useEffect(() => clearTimers, [clearTimers])

  /* ⌘K / Ctrl+K opens the command palette */
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const finishStream = React.useCallback((text: string) => {
    counter.current += 1
    setMessages((prev) => [
      ...prev,
      {
        id: `a${counter.current}`,
        senderId: "assistant",
        text,
        time: formatTime(new Date()),
      },
    ])
    streamedRef.current = ""
    setStreamed("")
    setStatus("idle")
  }, [])

  const startReply = React.useCallback(() => {
    clearTimers()
    streamedRef.current = ""
    setStreamed("")
    setStatus("thinking")

    const words = STREAMED_REPLY.split(/(\s+)/)
    let index = 0

    const begin = window.setTimeout(() => {
      setStatus("streaming")
      const interval = window.setInterval(() => {
        const chunk = words.slice(index, index + 2).join("")
        index += 2
        streamedRef.current += chunk
        setStreamed(streamedRef.current)
        if (index >= words.length) {
          window.clearInterval(interval)
          timers.current = []
          finishStream(streamedRef.current)
        }
      }, 55)
      timers.current.push(interval)
    }, 1400)
    timers.current.push(begin)
  }, [clearTimers, finishStream])

  const stopReply = React.useCallback(() => {
    clearTimers()
    const partial = streamedRef.current.trim()
    if (partial) {
      finishStream(`${partial} …`)
    } else {
      setStatus("idle")
    }
    toast("Response stopped")
  }, [clearTimers, finishStream])

  const send = React.useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || status !== "idle") return
      counter.current += 1
      setMessages((prev) => [
        ...prev,
        {
          id: `u${counter.current}`,
          senderId: "me",
          text: trimmed,
          time: formatTime(new Date()),
        },
      ])
      setDraft("")
      startReply()
    },
    [startReply, status]
  )

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current
    if (!el) {
      setDraft((d) => d + emoji)
      return
    }
    const start = el.selectionStart ?? draft.length
    const end = el.selectionEnd ?? draft.length
    const next = draft.slice(0, start) + emoji + draft.slice(end)
    setDraft(next)
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + emoji.length
      el.setSelectionRange(pos, pos)
    })
  }

  const runCommand = (label: string, action?: () => void) => {
    setPaletteOpen(false)
    action?.()
    toast(label)
  }

  const busy = status !== "idle"

  return (
    <div className="flex h-dvh w-full flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 border-b px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="flex -space-x-2 *:ring-2 *:ring-background"
            aria-hidden="true"
          >
            <Avatar size="sm">
              <AvatarFallback className="text-[10px]">
                {MAYA.initials}
              </AvatarFallback>
            </Avatar>
            <Avatar size="sm">
              <AvatarFallback className="text-[10px]">
                {DEV.initials}
              </AvatarFallback>
            </Avatar>
            <Avatar size="sm">
              <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
                <SparklesIcon className="size-3" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">
              Onboarding launch · Thursday
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              Maya, Devraj, you and Relay Assistant
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
          <KbdGroup className="hidden sm:inline-flex">
            <Kbd>
              <CommandIcon aria-hidden="true" />
            </Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Button>
      </header>

      {/* Transcript */}
      <main className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
          <MessageScroller>
            <MessageScrollerViewport className="px-4 py-6 sm:px-6">
              <MessageScrollerContent aria-busy={busy}>
                <MessageScrollerItem messageId="day">
                  <Marker variant="separator">
                    <MarkerContent>Today</MarkerContent>
                  </Marker>
                </MessageScrollerItem>

                {messages.map((message, i) => {
                  const sender = SENDERS[message.senderId] ?? ME
                  const mine = sender.id === ME.id
                  const prev = messages[i - 1]
                  const next = messages[i + 1]
                  const firstInRun = prev?.senderId !== message.senderId
                  const lastInRun = next?.senderId !== message.senderId

                  return (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={mine}
                      className={cn(!lastInRun && "-mb-5")}
                    >
                      <MessageGroup>
                        <Message align={mine ? "end" : "start"}>
                          <MessageAvatar
                            className={cn(!lastInRun && "invisible")}
                          >
                            <SenderAvatar sender={sender} />
                          </MessageAvatar>
                          <MessageContent>
                            {firstInRun && !mine && (
                              <MessageHeader>
                                <span className="truncate">{sender.name}</span>
                                <span className="ml-2 font-normal">
                                  {sender.role}
                                </span>
                              </MessageHeader>
                            )}
                            <Bubble
                              variant={mine ? "default" : "secondary"}
                              align={mine ? "end" : "start"}
                              className={cn(
                                message.reactions && "mb-2"
                              )}
                            >
                              <BubbleContent className="whitespace-pre-wrap">
                                {message.text}
                              </BubbleContent>
                              {message.reactions && (
                                <BubbleReactions
                                  side="bottom"
                                  align={mine ? "end" : "start"}
                                >
                                  {message.reactions.map((reaction) => (
                                    <span
                                      key={reaction}
                                      className="text-xs"
                                    >
                                      {reaction}
                                    </span>
                                  ))}
                                </BubbleReactions>
                              )}
                            </Bubble>
                            {message.attachment && (
                              <Attachment
                                size="sm"
                                className="group-data-[align=end]/message:self-end"
                              >
                                <AttachmentMedia>
                                  <FileTextIcon />
                                </AttachmentMedia>
                                <AttachmentContent>
                                  <AttachmentTitle>
                                    {message.attachment.name}
                                  </AttachmentTitle>
                                  <AttachmentDescription>
                                    {message.attachment.meta}
                                  </AttachmentDescription>
                                </AttachmentContent>
                              </Attachment>
                            )}
                            {lastInRun && (
                              <MessageFooter>{message.time}</MessageFooter>
                            )}
                          </MessageContent>
                        </Message>
                      </MessageGroup>
                    </MessageScrollerItem>
                  )
                })}

                {status === "thinking" && (
                  <MessageScrollerItem messageId="thinking">
                    <Message>
                      <MessageAvatar>
                        <SenderAvatar sender={ASSISTANT} />
                      </MessageAvatar>
                      <MessageContent>
                        <MessageHeader>
                          <span>{ASSISTANT.name}</span>
                        </MessageHeader>
                        <Marker role="status" className="px-3">
                          <MarkerIcon>
                            <Spinner aria-hidden="true" role="presentation" />
                          </MarkerIcon>
                          <MarkerContent className="shimmer">
                            Reviewing the thread and launch notes…
                          </MarkerContent>
                        </Marker>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )}

                {status === "streaming" && (
                  <MessageScrollerItem messageId="streaming">
                    <Message>
                      <MessageAvatar>
                        <SenderAvatar sender={ASSISTANT} />
                      </MessageAvatar>
                      <MessageContent>
                        <MessageHeader>
                          <span>{ASSISTANT.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            <span className="shimmer">Typing</span>
                          </Badge>
                        </MessageHeader>
                        <Bubble variant="secondary">
                          <BubbleContent className="whitespace-pre-wrap">
                            {streamed}
                            <span
                              aria-hidden="true"
                              className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-foreground"
                            />
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
      <footer className="mx-auto w-full max-w-3xl px-4 pt-2 pb-4 sm:px-6 sm:pb-6">
        <div
          className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none"
          role="group"
          aria-label="Suggested prompts"
        >
          {SUGGESTIONS.map((suggestion) => (
            <Button
              key={suggestion}
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 rounded-full"
              disabled={busy}
              onClick={() => send(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            send(draft)
          }}
        >
          <InputGroup className="rounded-xl">
            <label htmlFor="chat-input" className="sr-only">
              Message the team
            </label>
            <InputGroupTextarea
              id="chat-input"
              ref={textareaRef}
              value={draft}
              rows={1}
              placeholder="Message the team, or type @ to mention someone…"
              className="max-h-40 min-h-12"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault()
                  send(draft)
                }
              }}
            />
            <InputGroupAddon align="block-end" className="justify-between">
              <div className="flex items-center gap-1">
                <EmojiPicker onPick={insertEmoji} />
                <InputGroupButton
                  size="icon-sm"
                  aria-label="Attach a file"
                  onClick={() => toast("Attachments are disabled in this demo")}
                >
                  <PaperclipIcon />
                </InputGroupButton>
                <InputGroupButton
                  size="icon-sm"
                  aria-label="Mention a teammate"
                  onClick={() => {
                    setDraft((d) => `${d}@`)
                    textareaRef.current?.focus()
                  }}
                >
                  <AtSignIcon />
                </InputGroupButton>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden text-xs font-normal text-muted-foreground sm:inline">
                  <Kbd>Enter</Kbd> to send
                </span>
                {busy ? (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    className="rounded-full"
                    aria-label="Stop generating"
                    onClick={stopReply}
                  >
                    <SquareIcon className="fill-current" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="icon-sm"
                    className="rounded-full"
                    aria-label="Send message"
                    disabled={draft.trim().length === 0}
                  >
                    <ArrowUpIcon />
                  </Button>
                )}
              </div>
            </InputGroupAddon>
          </InputGroup>
        </form>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          Press{" "}
          <KbdGroup>
            <Kbd>
              <CommandIcon aria-hidden="true" />
            </Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>{" "}
          or <Kbd>Ctrl</Kbd> <Kbd>K</Kbd> for commands. Relay can make
          mistakes, so double-check launch dates.
        </p>
      </footer>

      {/* Command palette */}
      <CommandDialog
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        title="Command palette"
        description="Search for a conversation action to run."
      >
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No matching commands.</CommandEmpty>
          <CommandGroup heading="Conversation">
            <CommandItem
              onSelect={() =>
                runCommand("Started a new conversation", () => {
                  clearTimers()
                  setStatus("idle")
                  setStreamed("")
                  streamedRef.current = ""
                  setMessages([])
                })
              }
            >
              <MessageSquarePlusIcon />
              New conversation
              <CommandShortcut>N</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand("Conversation restored", () => {
                  clearTimers()
                  setStatus("idle")
                  setStreamed("")
                  streamedRef.current = ""
                  setMessages(INITIAL_MESSAGES)
                })
              }
            >
              <RotateCcwIcon />
              Restore sample thread
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand("Summary requested", () =>
                  send("Summarise the open risks for Thursday's launch.")
                )
              }
            >
              <SparklesIcon />
              Ask Relay for a summary
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigate">
            <CommandItem
              onSelect={() => runCommand("Jumped to #design-reviews")}
            >
              <HashIcon />
              Go to #design-reviews
            </CommandItem>
            <CommandItem onSelect={() => runCommand("Opened shared files")}>
              <FileTextIcon />
              Shared files
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setPaletteOpen(false)
                requestAnimationFrame(() => textareaRef.current?.focus())
              }}
            >
              <SearchIcon />
              Focus message input
              <CommandShortcut>/</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Preferences">
            <CommandItem
              onSelect={() =>
                runCommand("Notifications muted for 1 hour")
              }
            >
              <MoonIcon />
              Mute notifications for 1 hour
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
```