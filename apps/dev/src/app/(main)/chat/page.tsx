"use client";

import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Column,
  EmojiPickerDropdown,
  Fade,
  Icon,
  IconButton,
  Input,
  Kbd,
  Line,
  Row,
  Spinner,
  SplitView,
  Text,
  User,
} from "@once-ui-system/core";

type Conversation = {
  id: string;
  name: string;
  preview: string;
  time: string;
  value: string;
  unread?: number;
  online?: boolean;
  isAi?: boolean;
  channel?: boolean;
};

type Message = {
  id: string;
  author: string;
  value: string;
  time: string;
  text: string;
  self?: boolean;
};

const conversations: Conversation[] = [
  {
    id: "design-system",
    name: "design-system",
    preview: "Nexus AI is responding…",
    time: "now",
    value: "DS",
    online: true,
    isAi: true,
    channel: true,
  },
  {
    id: "jane",
    name: "Jane Wong",
    preview: "Copy. Streaming indicator on the AI reply too?",
    time: "2m",
    value: "JW",
    unread: 2,
    online: true,
  },
  {
    id: "platform",
    name: "platform-eng",
    preview: "Canary at 12% — metrics look clean",
    time: "14m",
    value: "PE",
    channel: true,
  },
  {
    id: "releases",
    name: "releases",
    preview: "v2.4.0 tagged and ready",
    time: "1h",
    value: "RL",
    channel: true,
  },
  {
    id: "lorant",
    name: "Lorant K.",
    preview: "Pushed the token audit branch",
    time: "3h",
    value: "LK",
    online: true,
  },
];

const history: Message[] = [
  {
    id: "1",
    author: "Jane Wong",
    value: "JW",
    time: "9:38 AM",
    text: "Can you sanity-check the chat density before we ship? Linear-tight but still readable.",
  },
  {
    id: "2",
    author: "You",
    value: "ME",
    time: "9:39 AM",
    text: "On it — aiming for Discord sidebar + Linear message rhythm.",
    self: true,
  },
  {
    id: "3",
    author: "Jane Wong",
    value: "JW",
    time: "9:40 AM",
    text: "Perfect. Keep avatars at 32px and skip bubbles for thread messages.",
  },
  {
    id: "4",
    author: "You",
    value: "ME",
    time: "9:41 AM",
    text: "Copy. Streaming indicator on the AI reply too?",
    self: true,
  },
];

const STREAM_REPLY =
  "Pulling the deployment checklist — builds are green, e2e passed, and the canary is at 12% with no error spike. Safe to promote when you're ready.";

function UnreadCount({ count }: { count: number }) {
  return (
    <Row
      center
      minWidth={5}
      height={5}
      paddingX="8"
      radius="full"
      background="brand-strong"
      onBackground="brand-strong"
      textVariant="label-strong-xs"
    >
      {count}
    </Row>
  );
}

function ConversationItem({
  conversation,
  active,
  unread,
  onSelect,
}: {
  conversation: Conversation;
  active: boolean;
  unread: number;
  onSelect: () => void;
}) {
  return (
    <Row
      gap="12"
      paddingLeft="8"
      paddingRight="12"
      paddingY="8"
      radius="m"
      vertical="center"
      cursor="interactive"
      background={active ? "neutral-alpha-weak" : undefined}
      onClick={onSelect}
    >
      {active && (
        <Column
          width={0.25}
          height={8}
          background="brand-strong"
          radius="full"
        />
      )}
      {!active && <Column width={0.25} />}
      <Avatar
        size="s"
        value={conversation.value}
        statusIndicator={
          conversation.online ? { color: conversation.isAi ? "gray" : "green" } : undefined
        }
      />
      <Column flex={1} gap="2" minWidth={0}>
        <Row fillWidth horizontal="between" vertical="center" gap="8">
          <Text
            variant="label-default-s"
            onBackground={active ? "neutral-strong" : undefined}
            wrap="nowrap"
          >
            {conversation.channel ? `# ${conversation.name}` : conversation.name}
          </Text>
          <Text variant="label-default-xs" onBackground="neutral-weak" wrap="nowrap">
            {conversation.time}
          </Text>
        </Row>
        <Row fillWidth horizontal="between" vertical="center" gap="8">
          <Text
            variant="body-default-xs"
            onBackground={active ? "neutral-medium" : "neutral-weak"}
            wrap="nowrap"
          >
            {conversation.preview}
          </Text>
          {unread > 0 ? <UnreadCount count={unread} /> : null}
        </Row>
      </Column>
    </Row>
  );
}

function MessageRow({
  message,
  showHeader,
}: {
  message: Message;
  showHeader: boolean;
}) {
  return (
    <Row
      gap="12"
      paddingX="20"
      paddingTop={showHeader ? "16" : "2"}
      paddingBottom="2"
    >
      <Column width={8} horizontal="start">
        {showHeader && <Avatar size="m" value={message.value} />}
      </Column>
      <Column flex={1} gap="4" minWidth={0} paddingTop={showHeader ? undefined : "2"}>
        {showHeader && (
          <Row gap="8" vertical="center">
            <Text variant="label-strong-s">{message.author}</Text>
            <Text variant="label-default-xs" onBackground="neutral-weak">
              {message.time}
            </Text>
          </Row>
        )}
        {message.self ? (
          <Row
            paddingX="12"
            paddingY="8"
            radius="m"
            background="brand-alpha-weak"
            border="brand-alpha-weak"
            maxWidth={48}
            fitWidth
          >
            <Text variant="body-default-s" onBackground="neutral-strong">
              {message.text}
            </Text>
          </Row>
        ) : (
          <Text variant="body-default-s" onBackground="neutral-strong">
            {message.text}
          </Text>
        )}
      </Column>
    </Row>
  );
}

function StreamingMessage({ text, active }: { text: string; active: boolean }) {
  return (
    <Row gap="12" paddingX="20" paddingY="16">
      <Column width={8} horizontal="start">
        <Avatar size="m" value="AI" icon="sparkle" />
      </Column>
      <Column flex={1} gap="4" minWidth={0}>
        <Row gap="8" vertical="center">
          <Text variant="label-strong-s">Nexus AI</Text>
          <Text variant="label-default-xs" onBackground="neutral-weak">
            now
          </Text>
          {active && <Spinner size="xs" ariaLabel="Nexus AI is responding" />}
        </Row>
        <Column maxWidth={48}>
          <Text variant="body-default-s" onBackground="neutral-strong">
            {text}
            {active && (
              <Text as="span" onBackground="brand-medium">
                ▍
              </Text>
            )}
          </Text>
        </Column>
      </Column>
    </Row>
  );
}

function threadTitle(conversation: Conversation) {
  return conversation.channel ? `#${conversation.name}` : conversation.name;
}

function threadPlaceholder(conversation: Conversation) {
  return conversation.channel
    ? `Message #${conversation.name}`
    : `Message ${conversation.name}`;
}

export default function ChatPage() {
  const [activeId, setActiveId] = useState("jane");
  const [draft, setDraft] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);
  const [clearedUnread, setClearedUnread] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? conversations[0];

  useEffect(() => {
    if (!activeConversation.isAi) return;

    let index = 0;
    setStreamedText("");
    setIsStreaming(true);

    const interval = window.setInterval(() => {
      index += 1;
      setStreamedText(STREAM_REPLY.slice(0, index));
      if (index >= STREAM_REPLY.length) {
        setIsStreaming(false);
        window.clearInterval(interval);
      }
    }, 28);

    return () => window.clearInterval(interval);
  }, [activeId, activeConversation.isAi]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamedText, isStreaming, activeId]);

  const handleSelect = (id: string) => {
    setActiveId(id);
    setClearedUnread((prev) => ({ ...prev, [id]: true }));
  };

  const handleEmojiSelect = (emoji: string) => {
    setDraft((prev) => prev + emoji);
  };

  const getUnread = (conversation: Conversation) =>
    clearedUnread[conversation.id] ? 0 : (conversation.unread ?? 0);

  return (
    <Column as="main" fill fillWidth maxWidth="xl" minHeight={36}>
      <SplitView
        fill
        defaultSplit={0.28}
        minSplit={0.22}
        maxSplit={0.38}
        leftPanel={
          <Column
            fill
            background="surface"
            border="neutral-alpha-weak"
            radius="l"
            overflow="hidden"
          >
            <Column paddingX="12" paddingTop="12" paddingBottom="8" gap="8">
              <Row horizontal="between" vertical="center" paddingX="4">
                <Text variant="heading-strong-s">Inbox</Text>
                <IconButton icon="plus" variant="tertiary" size="s" tooltip="New message" />
              </Row>
              <Input
                id="chat-search"
                placeholder="Search conversations"
                height="s"
                variant="ghost"
                hasPrefix={<Icon name="search" size="xs" onBackground="neutral-weak" />}
              />
            </Column>
            <Column flex={1} overflowY="auto" paddingBottom="8" gap="1">
              {conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  active={conversation.id === activeId}
                  unread={getUnread(conversation)}
                  onSelect={() => handleSelect(conversation.id)}
                />
              ))}
            </Column>
          </Column>
        }
        rightPanel={
          <Column fill overflow="hidden" radius="l" border="neutral-alpha-weak">
            <Row
              paddingX="20"
              paddingY="12"
              gap="12"
              vertical="center"
              horizontal="between"
              background="surface"
              border="neutral-alpha-weak"
              borderBottom="neutral-alpha-weak"
            >
              <User
                name={threadTitle(activeConversation)}
                subline={
                  activeConversation.isAi
                    ? "AI assistant · always on"
                    : activeConversation.online
                      ? "Active now"
                      : "Direct message"
                }
                avatarProps={{
                  value: activeConversation.value,
                  size: "s",
                  statusIndicator: activeConversation.online
                    ? { color: activeConversation.isAi ? "gray" : "green" }
                    : undefined,
                }}
              />
              <Row gap="2">
                <IconButton icon="search" variant="tertiary" size="s" tooltip="Search in thread" />
                <IconButton icon="bell" variant="tertiary" size="s" tooltip="Mute thread" />
                <IconButton icon="more" variant="tertiary" size="s" tooltip="Thread options" />
              </Row>
            </Row>

            <Column flex={1} overflow="hidden" background="page">
              <Fade to="top" base="page" fill>
                <Column flex={1} overflowY="auto" paddingY="8">
                  <Row paddingX="20" paddingY="12" center gap="12">
                    <Line />
                    <Text variant="label-default-xs" onBackground="neutral-weak">
                      Today
                    </Text>
                    <Line />
                  </Row>

                  {activeConversation.isAi ? (
                    <>
                      <MessageRow
                        message={{
                          id: "ai-prompt",
                          author: "You",
                          value: "ME",
                          time: "9:41 AM",
                          text: "Can you run the pre-deploy checklist for v2.4.0?",
                          self: true,
                        }}
                        showHeader
                      />
                      <StreamingMessage text={streamedText} active={isStreaming} />
                    </>
                  ) : (
                    history.map((message, index) => {
                      const previous = history[index - 1];
                      const showHeader = !previous || previous.author !== message.author;
                      return <MessageRow key={message.id} message={message} showHeader={showHeader} />;
                    })
                  )}

                  <Column ref={messagesEndRef} height={1} />
                </Column>
              </Fade>
            </Column>

            <Column
              paddingX="16"
              paddingY="8"
              gap="4"
              background="surface"
              border="neutral-alpha-weak"
              borderTop="neutral-alpha-weak"
            >
              <Row
                gap="4"
                paddingLeft="8"
                paddingRight="4"
                paddingY="4"
                vertical="center"
                background="neutral-alpha-weak"
                radius="l"
                border="neutral-alpha-weak"
              >
                <IconButton icon="plus" variant="tertiary" size="s" tooltip="Attach file" />
                <Column flex={1}>
                  <Input
                    id="chat-message"
                    placeholder={threadPlaceholder(activeConversation)}
                    height="s"
                    variant="ghost"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                </Column>
                <EmojiPickerDropdown
                  placement="top"
                  trigger={<IconButton icon="smiley" variant="tertiary" size="s" tooltip="Add emoji" />}
                  onSelect={handleEmojiSelect}
                />
                <IconButton
                  icon="arrowRight"
                  variant={draft.trim() ? "primary" : "tertiary"}
                  size="s"
                  tooltip="Send message"
                  disabled={!draft.trim()}
                />
              </Row>
              <Row gap="8" vertical="center" paddingX="8">
                <Text variant="label-default-xs" onBackground="neutral-weak">
                  Press
                </Text>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
                <Text variant="label-default-xs" onBackground="neutral-weak">
                  for commands
                </Text>
              </Row>
            </Column>
          </Column>
        }
      />
    </Column>
  );
}
