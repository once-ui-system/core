"use client";

import {
  ChatComposer,
  ChatMessage,
  ChatMessageList,
  Column,
  ConversationItem,
  TypingIndicator,
} from "@once-ui-system/core";
import { useEffect, useRef, useState } from "react";

type Message = { id: number; from: "self" | "other"; text: string; time: Date };

// Counted back from 9:00 today rather than from now, so the demo shows the same
// times all day and two screenshots taken minutes apart still match.
const minutesAgo = (minutes: number) => {
  const anchor = new Date();
  anchor.setHours(9, 0, 0, 0);
  return new Date(anchor.getTime() - minutes * 60_000);
};

// A conversation that answers back: send a message and a reply follows.
export function ChatConversationExample() {
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: 1, from: "other", text: "Morning! Did the new build go out?", time: minutesAgo(12) },
    { id: 2, from: "other", text: "The release notes look good.", time: minutesAgo(11) },
    { id: 3, from: "self", text: "It did, about an hour ago.", time: minutesAgo(9) },
  ]);
  const [typing, setTyping] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const send = ({ text }: { text: string }) => {
    setMessages((current) => [
      ...current,
      { id: current.length + 1, from: "self", text, time: new Date() },
    ]);
    setTyping(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setTyping(false);
      setMessages((current) => [
        ...current,
        { id: current.length + 1, from: "other", text: "Nice, thanks!", time: new Date() },
      ]);
    }, 1500);
  };

  return (
    <Column fillWidth height="448px" border="neutral-alpha-weak" radius="l" overflow="hidden">
      <ChatMessageList aria-label="Chat with Lorant">
        {messages.map((message, index) => {
          const grouped = index > 0 && messages[index - 1].from === message.from;
          return (
            <ChatMessage
              key={message.id}
              from={message.from}
              name={message.from === "other" ? "Lorant" : undefined}
              avatarProps={message.from === "other" ? { src: "/images/avatar.jpg" } : undefined}
              grouped={grouped}
              time={message.time}
              status={message.from === "self" ? "read" : undefined}
            >
              {message.text}
            </ChatMessage>
          );
        })}
        {typing && <TypingIndicator aria-label="Lorant is typing" marginLeft="48" />}
      </ChatMessageList>
      <Column paddingX="12" paddingBottom="12">
        <ChatComposer onSend={send} attach />
      </Column>
    </Column>
  );
}

// The composer alone, with attachments. Pick a file or paste an image.
export function ChatComposerExample() {
  const [sent, setSent] = useState<string | null>(null);
  return (
    <Column fillWidth gap="8">
      <ChatComposer
        attach={{ accept: "image/*,.pdf" }}
        onSend={({ text, files }) =>
          setSent(`${text || "(no text)"}${files.length ? ` + ${files.length} file(s)` : ""}`)
        }
      />
      {sent && <TypingIndicator bubble={false} label={`Sent: ${sent}`} />}
    </Column>
  );
}

const conversations = [
  { id: "lorant", name: "Lorant", preview: "Nice, thanks!", time: minutesAgo(2), unread: 2 },
  { id: "design", name: "Design team", preview: "New tokens are in", time: minutesAgo(90) },
  { id: "ana", name: "Ana", preview: "See you Friday", time: minutesAgo(60 * 50) },
];

// An inbox: one conversation is open, one has unread messages, one is typing.
export function ConversationListExample() {
  const [open, setOpen] = useState("design");
  return (
    <Column fillWidth maxWidth="384px" gap="2">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          name={conversation.name}
          preview={conversation.preview}
          time={conversation.time}
          unread={open === conversation.id ? 0 : conversation.unread}
          typing={conversation.id === "ana"}
          avatarProps={
            conversation.id === "lorant"
              ? { src: "/images/avatar.jpg" }
              : { value: conversation.name.slice(0, 1) }
          }
          selected={open === conversation.id}
          onClick={() => setOpen(conversation.id)}
        />
      ))}
    </Column>
  );
}
