The `shimmer` utility isn't defined in globals.css, so I'll avoid it and use a plain `animate-pulse` on the status text. Now I'll write the page.

```tsx
"use client"

import * as React from "react"
import {
  ArrowUpIcon,
  CheckCheckIcon,
  CommandIcon,
  CopyIcon,
  EraserIcon,
  HashIcon,
  PhoneIcon,
  SearchIcon,
  SmileIcon,
  SquareIcon,
  VideoIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar"
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
/*  Types & placeholder data                                                  */
/* -------------------------------------------------------------------------- */

type Sender = "me" | "maya" | "assistant"

type ChatMessage = {
  id: string
  sender: Sender
  text: string
  time: string
  reactions?: string
}

const PEOPLE: Record<Sender, { name: string; initials: string }> = {
  me: { name: "You", initials: "YO" },
  maya: { name: "Maya Okafor", initials: "MO" },
  assistant: { name: "Relay Assistant", initials: "RA" },
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    sender: "maya",
    text: "Morning! The checkout redesign went out to 10% of traffic overnight.",
    time: "9:02 AM",
  },
  {
    id: "m2",
    sender: "maya",
    text: "Early numbers look good: conversion is up 3.4% and nothing is spiking in Sentry.",
    time: "9:03 AM",
    reactions: "🎉 🙌",
  },
  {
    id: "m3",
    sender: "me",
    text: "Great news. Can you pull the funnel drop-off for the new address step? I want to compare it with last week.",
    time: "9:06 AM",
  },
  {
    id: "m4",
    sender: "assistant",
    text: "Here is the comparison for the address step, new vs. control:\n\n• Reached step: 8,412 vs. 8,377\n• Completed step: 7,126 vs. 6,589\n• Drop-off: 15.3% vs. 21.3%\n\nThe autocomplete field seems to be doing the heavy lifting, since mobile users saved about 11 seconds on average.",
    time: "9:07 AM",
  },
  {
    id: "m5",
    sender: "me",
    text: "That's a big improvement on mobile. Let's ramp to 50% after lunch if error rates stay flat.",
    time: "9:12 AM",
    reactions: "👍",
  },
  {
    id: "m6",
    sender: "maya",
    text: "Agreed. I'll schedule the ramp for 1:30 PM and post in #releases.",
    time: "9:14 AM",
  },
]

const STREAMED_REPLY =
  "Sounds like a solid plan. Before the 1:30 PM ramp I'd suggest three checks: confirm the p95 latency of the address lookup API is under 300 ms, make sure the rollback flag is tested in staging, and have support on standby with a short macro about the new address form. I can draft the #releases announcement and the support macro now if you'd like."

const EMOJI_GROUPS: { label: string; emojis: { char: string; name: string }[] }[] =
  [
    {
      label: "Smileys",
      emojis: [
        { char: "😀", name: "Grinning face" },
        { char: "😂", name: "Face with tears of joy" },
        { char: "😊", name: "Smiling face with smiling eyes" },
        { char: "😍", name: "Heart eyes" },
        { char: "🤔", name: "Thinking face" },
        { char: "😅", name: "Grinning face with sweat" },
        { char: "😎", name: "Smiling face with sunglasses" },
        { char: "🥳", name: "Partying face" },
        { char: "😴", name: "Sleeping face" },
        { char: "🙃", name: "Upside-down face" },
        { char: "😮", name: "Face with open mouth" },
        { char: "🤯", name: "Exploding head" },
      ],
    },
    {
      label: "Gestures & symbols",
      emojis: [
        { char: "👍", name: "Thumbs up" },
        { char: "👏", name: "Clapping hands" },
        { char: "🙌", name: "Raising hands" },
        { char: "🙏", name: "Folded hands" },
        { char: "💪", name: "Flexed biceps" },
        { char: "👀", name: "Eyes" },
        { char: "🔥", name: "Fire" },
        { char: "✨", name: "Sparkles" },
        { char: "🎉", name: "Party popper" },
        { char: "🚀", name: "Rocket" },
        { char: "✅", name: "Check mark" },
        { char: "❤️", name: "Red heart" },
      ],
    },
  ]

/* -------------------------------------------------------------------------- */
/*  Small presentational pieces                                               */
/* -------------------------------------------------------------------------- */

function PersonAvatar({
  sender,
  online = false,
}: {
  sender: Sender
  online?: boolean
}) {
  const person = PEOPLE[sender]
  return (
    <Avatar>
      <AvatarFallback
        className={
          sender === "assistant"
            ? "bg-primary text-xs font-medium text-primary-foreground"
            : "text-xs font-medium"
        }
      >
        {person.initials}
      </AvatarFallback>
      {online ? <AvatarBadge aria-hidden="true" /> : null}
    </Avatar>
  )
}

function MessageText({ text }: { text: string }) {
  return <span className="whitespace-pre-wrap">{text}</span>
}

function ChatRow({
  message,
  showHeader,
}: {
  message: ChatMessage
  showHeader: boolean
}) {
  const mine = message.sender === "me"
  const person = PEOPLE[message.sender]
  const variant =
    message.sender === "me"
      ? "default"
      : message.sender === "assistant"
        ? "outline"
        : "secondary"

  return (
    <Message align={mine ? "end" : "start"}>
      {!mine ? (
        <MessageAvatar className="bg-transparent">
          <PersonAvatar sender={message.sender} />
        </MessageAvatar>
      ) : null}
      <MessageContent>
        {showHeader && !mine ? (
          <MessageHeader>{person.name}</MessageHeader>
        ) : null}
        <Bubble variant={variant} align={mine ? "end" : "start"}>
          <BubbleContent>
            <MessageText text={message.text} />
          </BubbleContent>
          {message.reactions ? (
            <BubbleReactions
              side="bottom"
              align={mine ? "start" : "end"}
              role="img"
              aria-label={`Reactions: ${message.reactions}`}
            >
              <span aria-hidden="true">{message.reactions}</span>
            </BubbleReactions>
          ) : null}
        </Bubble>
        <MessageFooter className={message.reactions ? "mt-2" : undefined}>
          <time>{message.time}</time>
          {mine ? (
            <CheckCheckIcon
              className="ml-1 size-3.5 text-primary"
              aria-label="Read"
              role="img"
            />
          ) : null}
        </MessageFooter>
      </MessageContent>
    </Message>
  )
}

/* -------------------------------------------------------------------------- */
/*  Emoji picker                                                              */
/* -------------------------------------------------------------------------- */

function EmojiPicker({
  onPick,
  disabled,
}: {
  onPick: (emoji: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <InputGroupButton
          size="icon-sm"
          aria-label="Insert emoji"
          disabled={disabled}
        >
          <SmileIcon />
        </InputGroupButton>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        className="w-72 p-3"
        aria-label="Emoji picker"
      >
        <div className="flex flex-col gap-3">
          {EMOJI_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                {group.label}
              </p>
              <div className="grid grid-cols-6 gap-1">
                {group.emojis.map((emoji) => (
                  <Button
                    key={emoji.name}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-lg"
                    aria-label={emoji.name}
                    title={emoji.name}
                    onClick={() => {
                      onPick(emoji.char)
                      setOpen(false)
                    }}
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
  )
}

/* -------------------------------------------------------------------------- */
/*  Chat (lives inside the scroller provider so it can drive the transcript)  */
/* -------------------------------------------------------------------------- */

function Chat() {
  const { scrollToMessage, scrollToEnd } = useMessageScroller()

  const [messages, setMessages] = React.useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [draft, setDraft] = React.useState("")
  const [thinking, setThinking] = React.useState(false)
  const [streamingText, setStreamingText] = React.useState<string | null>(null)
  const [paletteOpen, setPaletteOpen] = React.useState(false)

  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const timersRef = React.useRef<number[]>([])
  const idRef = React.useRef(100)
  const streaming = thinking || streamingText !== null

  const clearTimers = React.useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
  }, [])

  React.useEffect(() => clearTimers, [clearTimers])

  // Cmd/Ctrl + K opens the command palette.
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

  const nextId = () => {
    idRef.current += 1
    return `m${idRef.current}`
  }

  const timeNow = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })

  const finishStream = React.useCallback((text: string) => {
    setStreamingText(null)
    setThinking(false)
    idRef.current += 1
    setMessages((prev) => [
      ...prev,
      {
        id: `m${idRef.current}`,
        sender: "assistant",
        text,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      },
    ])
  }, [])

  const startReply = React.useCallback(() => {
    clearTimers()
    setThinking(true)
    const words = STREAMED_REPLY.split(" ")
    let index = 0

    const tick = () => {
      index += 1
      const text = words.slice(0, index).join(" ")
      if (index >= words.length) {
        finishStream(text)
        return
      }
      setThinking(false)
      setStreamingText(text)
      timersRef.current.push(window.setTimeout(tick, 55))
    }

    timersRef.current.push(window.setTimeout(tick, 1400))
  }, [clearTimers, finishStream])

  const stopReply = () => {
    clearTimers()
    const partial = streamingText
    if (partial) {
      finishStream(partial + "…")
    } else {
      setThinking(false)
    }
    toast("Response stopped")
  }

  const send = () => {
    const text = draft.trim()
    if (!text || streaming) return
    setMessages((prev) => [
      ...prev,
      { id: nextId(), sender: "me", text, time: timeNow() },
    ])
    setDraft("")
    startReply()
  }

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
    const caret = start + emoji.length
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(caret, caret)
    })
  }

  const runCommand = (action: () => void) => {
    setPaletteOpen(false)
    // Let the dialog close and restore focus before acting.
    window.setTimeout(action, 50)
  }

  const clearChat = () => {
    clearTimers()
    setStreamingText(null)
    setThinking(false)
    setMessages([])
    toast.success("Conversation cleared")
  }

  return (
    <TooltipProvider>
      <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col bg-background sm:border-x">
        {/* Header */}
        <header className="flex items-center gap-3 border-b px-3 py-3 sm:px-4">
          <Avatar size="lg">
            <AvatarFallback className="text-sm font-medium">
              <HashIcon className="size-4" aria-hidden="true" />
            </AvatarFallback>
            <AvatarBadge aria-hidden="true" />
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm leading-tight font-semibold">
              checkout-redesign
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              Maya Okafor, Relay Assistant and you · 3 members
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
                  onClick={() => toast("Voice calls are not available in this demo")}
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
                  onClick={() => toast("Video calls are not available in this demo")}
                >
                  <VideoIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Video call</TooltipContent>
            </Tooltip>
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open command palette"
              aria-keyshortcuts="Control+K Meta+K"
            >
              <SearchIcon data-icon="inline-start" />
              <span className="hidden sm:inline">Search or run…</span>
              <KbdGroup className="ml-1 hidden sm:inline-flex">
                <Kbd>
                  <CommandIcon />
                </Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </Button>
          </div>
        </header>

        {/* Transcript */}
        <div className="min-h-0 flex-1">
          <MessageScroller>
            <MessageScrollerViewport className="px-3 py-4 sm:px-4">
              <MessageScrollerContent
                aria-busy={streamingText !== null}
                className="gap-4"
              >
                <MessageScrollerItem messageId="day-marker">
                  <Marker variant="separator">
                    <MarkerContent>Today</MarkerContent>
                  </Marker>
                </MessageScrollerItem>

                {messages.length === 0 ? (
                  <MessageScrollerItem messageId="empty">
                    <p className="py-10 text-center text-sm text-muted-foreground">
                      No messages yet. Say hello to start the conversation.
                    </p>
                  </MessageScrollerItem>
                ) : null}

                {messages.map((message, index) => {
                  const previous = messages[index - 1]
                  const showHeader =
                    !previous || previous.sender !== message.sender
                  return (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={message.sender === "me"}
                    >
                      <ChatRow message={message} showHeader={showHeader} />
                    </MessageScrollerItem>
                  )
                })}

                {thinking ? (
                  <MessageScrollerItem messageId="thinking">
                    <Message>
                      <MessageAvatar className="bg-transparent">
                        <PersonAvatar sender="assistant" />
                      </MessageAvatar>
                      <MessageContent>
                        <MessageHeader>{PEOPLE.assistant.name}</MessageHeader>
                        <Marker role="status" className="px-3 py-2">
                          <MarkerIcon>
                            <Spinner aria-hidden="true" role="presentation" />
                          </MarkerIcon>
                          <MarkerContent className="animate-pulse">
                            Thinking…
                          </MarkerContent>
                        </Marker>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ) : null}

                {streamingText !== null ? (
                  <MessageScrollerItem messageId="streaming">
                    <Message>
                      <MessageAvatar className="bg-transparent">
                        <PersonAvatar sender="assistant" />
                      </MessageAvatar>
                      <MessageContent>
                        <MessageHeader>{PEOPLE.assistant.name}</MessageHeader>
                        <Bubble variant="outline">
                          <BubbleContent>
                            <MessageText text={streamingText} />
                            <span
                              aria-hidden="true"
                              className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-foreground"
                            />
                          </BubbleContent>
                        </Bubble>
                        <MessageFooter>
                          <span role="status" className="flex items-center gap-1.5">
                            <Spinner aria-hidden="true" role="presentation" className="size-3" />
                            Relay Assistant is typing…
                          </span>
                        </MessageFooter>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ) : null}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </div>

        {/* Input bar */}
        <div className="border-t bg-background px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              send()
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              Message #checkout-redesign
            </label>
            <InputGroup className="rounded-xl">
              <InputGroupTextarea
                id="chat-input"
                ref={textareaRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    send()
                  }
                }}
                placeholder="Message #checkout-redesign"
                rows={1}
                className="max-h-40 min-h-12 [field-sizing:content]"
              />
              <InputGroupAddon align="block-end">
                <EmojiPicker onPick={insertEmoji} disabled={streaming} />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InputGroupButton
                      size="icon-sm"
                      aria-label="Open command palette"
                      onClick={() => setPaletteOpen(true)}
                    >
                      <CommandIcon />
                    </InputGroupButton>
                  </TooltipTrigger>
                  <TooltipContent>Commands (⌘K)</TooltipContent>
                </Tooltip>
                <span className="ml-1 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                  <Kbd>Enter</Kbd> to send
                  <Kbd>Shift</Kbd>
                  <span aria-hidden="true">+</span>
                  <Kbd>Enter</Kbd> for new line
                </span>
                {streaming ? (
                  <InputGroupButton
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={stopReply}
                  >
                    <SquareIcon data-icon="inline-start" />
                    Stop
                  </InputGroupButton>
                ) : (
                  <InputGroupButton
                    type="submit"
                    variant="default"
                    size="icon-sm"
                    className="ml-auto rounded-full"
                    aria-label="Send message"
                    disabled={draft.trim().length === 0}
                  >
                    <ArrowUpIcon />
                  </InputGroupButton>
                )}
              </InputGroupAddon>
            </InputGroup>
          </form>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Press{" "}
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>{" "}
            or{" "}
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>{" "}
            to open the command palette
          </p>
        </div>
      </div>

      {/* Command palette */}
      <CommandDialog
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        title="Command palette"
        description="Search for a message or run a chat action."
      >
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigate">
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  scrollToEnd()
                })
              }
            >
              <ArrowUpIcon className="rotate-180" />
              <span>Jump to latest message</span>
              <CommandShortcut>End</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  if (!scrollToMessage("m4")) {
                    toast("That message is no longer in the conversation")
                  }
                })
              }
            >
              <SearchIcon />
              <span>Go to funnel drop-off comparison</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  if (!scrollToMessage("m1")) {
                    toast("That message is no longer in the conversation")
                  }
                })
              }
            >
              <SearchIcon />
              <span>Go to first message today</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  const last = [...messages]
                    .reverse()
                    .find((m) => m.sender !== "me")
                  if (!last) {
                    toast("Nothing to copy yet")
                    return
                  }
                  void navigator.clipboard
                    ?.writeText(last.text)
                    .then(() => toast.success("Copied last reply"))
                    .catch(() => toast.error("Couldn't access the clipboard"))
                })
              }
            >
              <CopyIcon />
              <span>Copy last reply</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(clearChat)}>
              <EraserIcon />
              <span>Clear conversation</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </TooltipProvider>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function Page() {
  return (
    <main className="min-h-dvh bg-muted/30">
      <MessageScrollerProvider autoScroll defaultScrollPosition="end">
        <Chat />
      </MessageScrollerProvider>
    </main>
  )
}
```