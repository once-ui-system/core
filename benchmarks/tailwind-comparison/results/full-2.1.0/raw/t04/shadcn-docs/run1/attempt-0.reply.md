I'll build a working chat that simulates streaming replies. It uses these pieces:

-   **Transcript:** `MessageScroller` with `autoScroll` and a user-message anchor.
-   **Typing indicator:** a `Marker` with `role="status"` and the `shimmer` utility.
-   **Input bar:** `InputGroup` with an emoji `Popover`.
-   **Command palette:** `CommandDialog`, opened with ⌘K or Ctrl+K and hinted with a `Kbd`.

Cleanup of timers and stream state is handled in effects.

```tsx
"use client"

import * as React from "react"
import {
  ArrowUpIcon,
  CheckCheckIcon,
  CommandIcon,
  CopyIcon,
  DownloadIcon,
  FileTextIcon,
  HashIcon,
  MoonIcon,
  PaperclipIcon,
  PhoneIcon,
  PinIcon,
  SearchIcon,
  SmileIcon,
  SquareIcon,
  Trash2Icon,
  VideoIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Attachment,
  AttachmentAction,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentActions,
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
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Sender = "me" | "maya" | "devon" | "assistant"

type ChatMessage = {
  id: string
  sender: Sender
  text: string
  time: string
  reactions?: string[]
  attachment?: { name: string; meta: string }
}

const PEOPLE: Record<Sender, { name: string; initials: string }> = {
  me: { name: "You", initials: "YO" },
  maya: { name: "Maya Okafor", initials: "MO" },
  devon: { name: "Devon Park", initials: "DP" },
  assistant: { name: "Relay Assistant", initials: "RA" },
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    sender: "maya",
    text: "Morning! The staging deploy for the billing revamp finished overnight. Smoke tests are green.",
    time: "9:02 AM",
    reactions: ["🎉", "🚀"],
  },
  {
    id: "m2",
    sender: "devon",
    text: "Nice. I noticed the invoice PDF still shows the old footer though. Can someone double-check the template?",
    time: "9:05 AM",
  },
  {
    id: "m3",
    sender: "me",
    text: "On it. I'll compare against the new brand guidelines and push a fix before standup.",
    time: "9:06 AM",
  },
  {
    id: "m4",
    sender: "maya",
    text: "Here's the latest spec with the footer copy, in case it helps.",
    time: "9:08 AM",
    attachment: { name: "invoice-footer-spec-v3.pdf", meta: "PDF · 1.8 MB" },
  },
  {
    id: "m5",
    sender: "me",
    text: "Perfect, thanks. Found it: the template was still pointing at the legacy partial. Fixing now.",
    time: "9:14 AM",
    reactions: ["👍"],
  },
]

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: "Smileys", emojis: ["😀", "😂", "🙂", "😉", "😍", "🤔", "😅", "🥳"] },
  { label: "Gestures", emojis: ["👍", "👏", "🙌", "🙏", "👀", "💪", "🤝", "✌️"] },
  { label: "Symbols", emojis: ["🎉", "🚀", "🔥", "✅", "💡", "❤️", "⭐", "🐛"] },
]

const ASSISTANT_REPLIES: string[] = [
  "Good catch. The footer partial lives in `templates/invoice/_footer.hbs`. Once your fix is merged, I'd regenerate a sample invoice and compare it against the spec PDF.",
  "I can draft a short changelog entry for the billing revamp if you'd like. It would cover the new footer, the updated tax line, and the faster PDF rendering.",
  "Standup is in about 20 minutes. Based on this thread, your update is: footer template fixed, awaiting review, staging redeploy next.",
]

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

function SenderAvatar({ sender }: { sender: Sender }) {
  const person = PEOPLE[sender]
  return (
    <Avatar>
      <AvatarFallback
        className={
          sender === "assistant"
            ? "bg-primary text-primary-foreground"
            : undefined
        }
      >
        {person.initials}
      </AvatarFallback>
    </Avatar>
  )
}

export default function Page() {
  const [messages, setMessages] = React.useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [draft, setDraft] = React.useState("")
  const [emojiOpen, setEmojiOpen] = React.useState(false)
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const [phase, setPhase] = React.useState<"idle" | "thinking" | "streaming">(
    "idle"
  )
  const [streamingText, setStreamingText] = React.useState("")
  const [replyIndex, setReplyIndex] = React.useState(0)

  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const timersRef = React.useRef<number[]>([])
  const streamTargetRef = React.useRef("")

  const clearTimers = React.useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  React.useEffect(() => clearTimers, [clearTimers])

  // Global shortcut for the command palette.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const finishStream = React.useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${prev.length + 1}-${Date.now()}`,
        sender: "assistant",
        text,
        time: formatTime(new Date()),
      },
    ])
    setStreamingText("")
    setPhase("idle")
  }, [])

  const startAssistantReply = React.useCallback(
    (index: number) => {
      const full = ASSISTANT_REPLIES[index % ASSISTANT_REPLIES.length]
      streamTargetRef.current = full
      setPhase("thinking")
      setStreamingText("")

      const words = full.split(" ")
      const begin = window.setTimeout(() => {
        setPhase("streaming")
        let count = 0
        const tick = () => {
          count += 1
          const partial = words.slice(0, count).join(" ")
          setStreamingText(partial)
          if (count >= words.length) {
            const done = window.setTimeout(() => finishStream(full), 250)
            timersRef.current.push(done)
            return
          }
          const next = window.setTimeout(tick, 70)
          timersRef.current.push(next)
        }
        tick()
      }, 1400)
      timersRef.current.push(begin)
    },
    [finishStream]
  )

  const stopStreaming = React.useCallback(() => {
    clearTimers()
    if (streamingText.trim().length > 0) {
      finishStream(`${streamingText} …`)
    } else {
      setPhase("idle")
      setStreamingText("")
    }
  }, [clearTimers, finishStream, streamingText])

  const sendMessage = React.useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || phase !== "idle") return
      setMessages((prev) => [
        ...prev,
        {
          id: `u-${prev.length + 1}-${Date.now()}`,
          sender: "me",
          text: trimmed,
          time: formatTime(new Date()),
        },
      ])
      setDraft("")
      startAssistantReply(replyIndex)
      setReplyIndex((i) => i + 1)
    },
    [phase, replyIndex, startAssistantReply]
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
    setEmojiOpen(false)
    window.requestAnimationFrame(() => {
      el.focus()
      const caret = start + emoji.length
      el.setSelectionRange(caret, caret)
    })
  }

  const runCommand = (action: () => void) => {
    setPaletteOpen(false)
    action()
  }

  const isBusy = phase !== "idle"

  return (
    <TooltipProvider>
      <div className="flex h-dvh w-full flex-col bg-background">
        {/* Header */}
        <header className="flex items-center gap-3 border-b px-3 py-3 sm:px-6">
          <Avatar size="lg">
            <AvatarFallback>
              <HashIcon className="size-4" />
            </AvatarFallback>
            <AvatarBadge />
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="truncate text-sm font-semibold sm:text-base">
              billing-revamp
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              Maya, Devon, you and Relay Assistant · 4 members
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:inline-flex"
                  aria-label="Start voice call"
                  onClick={() => toast("Voice calls aren't available in this demo")}
                >
                  <PhoneIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voice call</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:inline-flex"
                  aria-label="Start video call"
                  onClick={() => toast("Video calls aren't available in this demo")}
                >
                  <VideoIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Video call</TooltipContent>
            </Tooltip>
            <Separator
              orientation="vertical"
              className="mx-1 hidden h-6 sm:block"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open command palette"
              aria-keyshortcuts="Control+K Meta+K"
            >
              <SearchIcon data-icon="inline-start" />
              <span className="hidden sm:inline">Commands</span>
              <KbdGroup className="hidden sm:inline-flex">
                <Kbd>
                  <CommandIcon />
                </Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </Button>
          </div>
        </header>

        {/* Transcript */}
        <main className="min-h-0 flex-1">
          <MessageScrollerProvider autoScroll>
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent
                  aria-busy={phase === "streaming"}
                  className="mx-auto w-full max-w-3xl px-3 py-6 sm:px-6"
                >
                  <MessageScrollerItem messageId="day-marker">
                    <Marker variant="separator">
                      <MarkerContent>Today</MarkerContent>
                    </Marker>
                  </MessageScrollerItem>

                  {messages.map((message) => {
                    const mine = message.sender === "me"
                    const person = PEOPLE[message.sender]
                    return (
                      <MessageScrollerItem
                        key={message.id}
                        messageId={message.id}
                        scrollAnchor={mine}
                      >
                        <Message align={mine ? "end" : "start"}>
                          <MessageAvatar>
                            <SenderAvatar sender={message.sender} />
                          </MessageAvatar>
                          <MessageContent>
                            {!mine && (
                              <MessageHeader>
                                {person.name}
                                {message.sender === "assistant" && (
                                  <Badge variant="secondary" className="ml-2">
                                    AI
                                  </Badge>
                                )}
                              </MessageHeader>
                            )}
                            <Bubble
                              variant={
                                mine
                                  ? "default"
                                  : message.sender === "assistant"
                                    ? "tinted"
                                    : "secondary"
                              }
                              align={mine ? "end" : "start"}
                              className={
                                message.reactions ? "mb-2" : undefined
                              }
                            >
                              <BubbleContent>{message.text}</BubbleContent>
                              {message.reactions && (
                                <BubbleReactions
                                  side="bottom"
                                  align={mine ? "start" : "end"}
                                  role="img"
                                  aria-label={`Reactions: ${message.reactions.join(" ")}`}
                                >
                                  {message.reactions.map((emoji) => (
                                    <span key={emoji}>{emoji}</span>
                                  ))}
                                </BubbleReactions>
                              )}
                            </Bubble>
                            {message.attachment && (
                              <Attachment state="done" className="max-w-full">
                                <AttachmentMedia variant="icon">
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
                                <AttachmentActions>
                                  <AttachmentAction
                                    aria-label={`Download ${message.attachment.name}`}
                                    onClick={() =>
                                      toast(`Downloading ${message.attachment?.name}…`)
                                    }
                                  >
                                    <DownloadIcon />
                                  </AttachmentAction>
                                </AttachmentActions>
                              </Attachment>
                            )}
                            <MessageFooter>
                              {message.time}
                              {mine && (
                                <CheckCheckIcon
                                  className="ml-1 size-3.5"
                                  aria-label="Delivered"
                                />
                              )}
                            </MessageFooter>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    )
                  })}

                  {phase === "thinking" && (
                    <MessageScrollerItem messageId="assistant-thinking">
                      <Message>
                        <MessageAvatar>
                          <SenderAvatar sender="assistant" />
                        </MessageAvatar>
                        <MessageContent>
                          <MessageHeader>{PEOPLE.assistant.name}</MessageHeader>
                          <Marker role="status" className="px-3">
                            <MarkerIcon>
                              <Spinner />
                            </MarkerIcon>
                            <MarkerContent className="shimmer">
                              Relay Assistant is thinking…
                            </MarkerContent>
                          </Marker>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  )}

                  {phase === "streaming" && (
                    <MessageScrollerItem messageId="assistant-streaming">
                      <Message>
                        <MessageAvatar>
                          <SenderAvatar sender="assistant" />
                        </MessageAvatar>
                        <MessageContent>
                          <MessageHeader>
                            {PEOPLE.assistant.name}
                            <Badge variant="secondary" className="ml-2">
                              AI
                            </Badge>
                          </MessageHeader>
                          <Bubble variant="tinted">
                            <BubbleContent>
                              {streamingText}
                              <span
                                aria-hidden="true"
                                className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-foreground"
                              />
                            </BubbleContent>
                          </Bubble>
                          <MessageFooter>
                            <span className="shimmer">Typing…</span>
                          </MessageFooter>
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

        {/* Input bar */}
        <footer className="border-t bg-background px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
          <form
            className="mx-auto flex w-full max-w-3xl flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage(draft)
            }}
          >
            <InputGroup>
              <InputGroupTextarea
                ref={textareaRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault()
                    sendMessage(draft)
                  }
                }}
                placeholder="Message #billing-revamp"
                aria-label="Message"
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
                        >
                          <SmileIcon />
                        </InputGroupButton>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Emoji</TooltipContent>
                  </Tooltip>
                  <PopoverContent
                    align="start"
                    side="top"
                    className="w-[min(18rem,calc(100vw-2rem))] p-3"
                    aria-label="Emoji picker"
                  >
                    <div className="flex flex-col gap-3">
                      {EMOJI_GROUPS.map((group) => (
                        <div key={group.label} className="flex flex-col gap-1">
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
                                onClick={() => insertEmoji(emoji)}
                              >
                                {emoji}
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
                      onClick={() => toast("Attachments aren't available in this demo")}
                    >
                      <PaperclipIcon />
                    </InputGroupButton>
                  </TooltipTrigger>
                  <TooltipContent>Attach file</TooltipContent>
                </Tooltip>

                <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
                  <Kbd>Enter</Kbd> to send · <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd>{" "}
                  for new line
                </span>

                {isBusy ? (
                  <InputGroupButton
                    size="icon-sm"
                    variant="secondary"
                    className="ml-auto rounded-full sm:ml-0"
                    aria-label="Stop generating"
                    onClick={stopStreaming}
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

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <span>Press</span>
              <KbdGroup>
                <Kbd>
                  <CommandIcon />
                </Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
              <span>for commands</span>
            </p>
          </form>
        </footer>

        {/* Command palette */}
        <CommandDialog
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          title="Command palette"
          description="Search for an action to run in this conversation."
        >
          <CommandInput placeholder="Type a command or search…" />
          <CommandList>
            <CommandEmpty>No matching commands.</CommandEmpty>
            <CommandGroup heading="Conversation">
              <CommandItem
                onSelect={() =>
                  runCommand(() => {
                    textareaRef.current?.focus()
                  })
                }
              >
                <SearchIcon />
                Focus message box
                <CommandShortcut>/</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => toast("Thread pinned to the channel"))
                }
              >
                <PinIcon />
                Pin this thread
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => {
                    const last = [...messages].reverse().find((m) => m.sender !== "me")
                    if (last && navigator.clipboard) {
                      navigator.clipboard
                        .writeText(last.text)
                        .then(() => toast("Last reply copied"))
                        .catch(() => toast("Couldn't access the clipboard"))
                    }
                  })
                }
              >
                <CopyIcon />
                Copy last reply
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem
                onSelect={() =>
                  runCommand(() => toast("Notifications muted for 1 hour"))
                }
              >
                <MoonIcon />
                Mute notifications
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runCommand(() => {
                    clearTimers()
                    setPhase("idle")
                    setStreamingText("")
                    setMessages(INITIAL_MESSAGES)
                    toast("Conversation reset")
                  })
                }
              >
                <Trash2Icon />
                Reset conversation
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </TooltipProvider>
  )
}
```