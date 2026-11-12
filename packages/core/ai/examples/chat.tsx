"use client";

/**
 * Gold example: an assistant chat, built to ship.
 * Target: a conversation list and a thread with an assistant that has a face
 * (Mascot), a brand mark (Logo), attachments through the composer, and every
 * state a real backend produces: loading, empty, error, sending, failed with
 * retry, and the assistant working.
 *
 * The data layer sits at the top, in what would be `lib/assistant.ts`: typed
 * async functions over mock data with a delay. The screens call only these
 * functions, so a real API replaces their bodies and no screen changes.
 */
import {
  Background,
  Button,
  ChatComposer,
  type ChatComposerMessage,
  ChatMessage,
  ChatMessageList,
  type ChatMessageStatus,
  Column,
  ConversationItem,
  Feedback,
  IconButton,
  Line,
  Logo,
  Mascot,
  Row,
  Skeleton,
  Tag,
  Text,
  useToast,
  WorkingIndicator,
} from "@once-ui-system/core";
import { useCallback, useEffect, useState } from "react";

// ── lib/assistant.ts ─────────────────────────────────────────────────────

export type Message = {
  id: string;
  from: "self" | "assistant";
  text: string;
  sentAt: Date;
  status?: ChatMessageStatus;
};

export type Conversation = { id: string; title: string; preview: string; updatedAt: Date };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const conversations: Conversation[] = [
  {
    id: "c1",
    title: "Trip to Lisbon",
    preview: "Three days is enough for…",
    updatedAt: new Date(),
  },
  { id: "c2", title: "Weekly plan", preview: "Move the review to…", updatedAt: new Date() },
];
const threads: Record<string, Message[]> = { c1: [], c2: [] };

export const assistant = {
  async listConversations(): Promise<Conversation[]> {
    await wait(400);
    return conversations;
  },
  async getMessages(conversationId: string): Promise<Message[]> {
    await wait(300);
    return threads[conversationId] ?? [];
  },
  /** Resolves with the assistant's reply; rejects when the request fails. */
  async send(conversationId: string, text: string, files: File[]): Promise<Message> {
    await wait(1200);
    const reply: Message = {
      id: crypto.randomUUID(),
      from: "assistant",
      text: files.length
        ? `Got ${files.length} file(s). ${text}`
        : `Here is what I found about “${text}”.`,
      sentAt: new Date(),
    };
    threads[conversationId] = [...(threads[conversationId] ?? []), reply];
    return reply;
  },
};

// ── the screen ───────────────────────────────────────────────────────────

type Load<T> = { status: "loading" } | { status: "error" } | { status: "ready"; data: T };

const SUGGESTIONS = ["Plan my week", "Summarise a file", "Ideas for a trip"];

// The mascot shaped into the product, not the default body: Sol plans your
// days, so it is a warm pebble with a crown of sun rays. A plant app would
// draw a pot and a sprout, a water app a drop. Paths sit in a 200 × 200 box.
const SOL = {
  bodyPath:
    "M100 28C152 28 180 64 180 110C180 156 148 182 100 182C52 182 20 156 20 110C20 64 48 28 100 28Z",
  accessory: (
    <g stroke="var(--accent-solid-strong)" strokeWidth={8} strokeLinecap="round">
      <path d="M100 18V4" />
      <path d="M68 24L58 10" />
      <path d="M132 24L142 10" />
    </g>
  ),
  mouth: "smile",
  cheeks: true,
} as const;

export function ChatExample() {
  const { addToast } = useToast();
  const [list, setList] = useState<Load<Conversation[]>>({ status: "loading" });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [thread, setThread] = useState<Load<Message[]>>({ status: "loading" });
  const [working, setWorking] = useState(false);

  const loadList = useCallback(() => {
    setList({ status: "loading" });
    assistant
      .listConversations()
      .then((data) => {
        setList({ status: "ready", data });
        setActiveId((id) => id ?? data[0]?.id ?? null);
      })
      .catch(() => setList({ status: "error" }));
  }, []);

  const loadThread = useCallback((id: string) => {
    setThread({ status: "loading" });
    assistant
      .getMessages(id)
      .then((data) => setThread({ status: "ready", data }))
      .catch(() => setThread({ status: "error" }));
  }, []);

  useEffect(loadList, [loadList]);
  useEffect(() => {
    if (activeId) loadThread(activeId);
  }, [activeId, loadThread]);

  const messages = thread.status === "ready" ? thread.data : [];
  const setMessages = (update: (current: Message[]) => Message[]) =>
    setThread((t) => (t.status === "ready" ? { status: "ready", data: update(t.data) } : t));

  // Optimistic: the message shows at once as sending, turns failed with a
  // retry when the request fails, and the assistant's face says it is working.
  const send = async ({ text, files }: ChatComposerMessage, retryId?: string) => {
    if (!activeId) return;
    const id = retryId ?? crypto.randomUUID();
    const mine: Message = { id, from: "self", text, sentAt: new Date(), status: "sending" };
    setMessages((current) =>
      retryId ? current.map((m) => (m.id === id ? mine : m)) : [...current, mine],
    );
    setWorking(true);
    try {
      const reply = await assistant.send(activeId, text, files);
      setMessages((current) => [
        ...current.map((m) => (m.id === id ? { ...m, status: "sent" as const } : m)),
        reply,
      ]);
    } catch {
      setMessages((current) =>
        current.map((m) => (m.id === id ? { ...m, status: "failed" as const } : m)),
      );
      addToast({ tone: "danger", message: "The assistant couldn't answer. Try again." });
    } finally {
      setWorking(false);
    }
  };

  return (
    <Row fill height="100dvh" background="page">
      <Column width={20} borderRight padding="12" gap="8" s={{ hide: true }}>
        <Row paddingX="8" paddingY="8" horizontal="between" vertical="center">
          <Logo text="Sol" monogram="S" size="s" />
          <IconButton icon="plus" variant="tertiary" tooltip="New chat" />
        </Row>
        {list.status === "loading" &&
          [0, 1, 2].map((i) => <Skeleton key={i} shape="block" height={56} />)}
        {list.status === "error" && (
          <Feedback tone="danger" title="Chats didn't load">
            <Button size="s" variant="secondary" label="Retry" onClick={loadList} />
          </Feedback>
        )}
        {list.status === "ready" && list.data.length === 0 && (
          <Text onBackground="neutral-weak" textVariant="body-default-s" marginX="8">
            No chats yet. Start one with the + button.
          </Text>
        )}
        {list.status === "ready" &&
          list.data.map((c) => (
            <ConversationItem
              key={c.id}
              name={c.title}
              preview={c.preview}
              time={c.updatedAt}
              selected={c.id === activeId}
              onClick={() => setActiveId(c.id)}
            />
          ))}
      </Column>

      <Column fill>
        <Row paddingX="20" paddingY="12" gap="12" vertical="center" borderBottom>
          <Mascot
            {...SOL}
            size={64}
            state={working ? "thinking" : "idle"}
            color="brand"
            aria-label="Sol"
          />
          <Column>
            <Text textVariant="label-strong-m">Sol</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {working ? "Thinking…" : "Your assistant"}
            </Text>
          </Column>
        </Row>

        {thread.status === "loading" && (
          <Column fill padding="24" gap="16">
            <Skeleton shape="block" width={24} height={48} />
            <Skeleton shape="block" width={32} height={64} style={{ alignSelf: "flex-end" }} />
          </Column>
        )}
        {thread.status === "error" && (
          <Column fill center padding="24">
            <Feedback
              tone="danger"
              title="This chat didn't load"
              description="Check your connection and try again."
            >
              <Button
                size="s"
                variant="secondary"
                label="Retry"
                onClick={() => activeId && loadThread(activeId)}
              />
            </Feedback>
          </Column>
        )}
        {thread.status === "ready" && messages.length === 0 && !working && (
          // The empty state is the assistant's welcome: its face, one line, and a way to start.
          <Column fill center gap="16" padding="24">
            <Background
              position="absolute"
              top="0"
              left="0"
              fill
              pointerEvents="none"
              gradient={{
                display: true,
                colorStart: "brand-alpha-weak",
                colorEnd: "static-transparent",
                x: "50%",
                y: "40%",
                width: "80%",
                height: "70%",
              }}
            />
            <Mascot
              {...SOL}
              size="xl"
              mood="happy"
              color="brand"
              poke
              aria-label="Sol says hello"
            />
            <Text textVariant="heading-strong-m">What can I help with?</Text>
            <Row gap="8" wrap horizontal="center">
              {SUGGESTIONS.map((s) => (
                <Tag key={s} label={s} onClick={() => send({ text: s, files: [] })} />
              ))}
            </Row>
          </Column>
        )}
        {thread.status === "ready" && (messages.length > 0 || working) && (
          <ChatMessageList fill paddingX="20" paddingY="16" aria-label="Messages">
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                from={m.from === "self" ? "self" : "other"}
                time={m.sentAt}
                status={m.status}
                onRetry={
                  m.status === "failed" ? () => send({ text: m.text, files: [] }, m.id) : undefined
                }
              >
                {m.text}
              </ChatMessage>
            ))}
            {working && <WorkingIndicator size="s" />}
          </ChatMessageList>
        )}

        <Line />
        <Column padding="16">
          <ChatComposer
            onSend={(message) => send(message)}
            attach={{ accept: "image/*,.pdf" }}
            loading={working}
            disabled={!activeId || thread.status !== "ready"}
            placeholder="Ask Sol anything"
          />
        </Column>
      </Column>
    </Row>
  );
}
