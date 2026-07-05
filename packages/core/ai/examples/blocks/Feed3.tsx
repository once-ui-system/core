"use client";

import { Avatar, Button, Column, EmojiPickerDropdown, IconButton, Media, OgCard, Row, Text, Textarea } from "@once-ui-system/core";
import { useState } from "react";
import { chatMessages } from "./content/chat1content";

export const Feed3: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const handleSubmitMessage = async () => {
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessage("");
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred while submitting your message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Column fill {...flex}>
      <Row fillWidth paddingX="24" paddingY="8" background="surface" borderBottom="neutral-alpha-weak" vertical="center" gap="12">
        <Text variant="label-default-s">👋 | intro</Text>
        <Row minWidth="4" minHeight="4" background="neutral-strong" radius="full"/>
        <Text variant="body-default-xs" onBackground="neutral-weak">Let us know a bit about you!</Text>
      </Row>
      <Column fill vertical="end">
        <Column fill padding="16" gap="24" overflowY="auto">
          {chatMessages.map((messages, index) => (
            <Row key={index} fillWidth fitHeight gap="16">
              <Avatar src={messages.author.avatar} />
              <Column fillWidth gap="4">
                <Row fillWidth gap="8" vertical="center">
                  <Text variant="label-strong-s" onBackground="brand-medium">{messages.author.name}</Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak">{formatTime(messages.postedAt)}</Text>
                </Row>
                {messages.message && (
                  <Text variant="body-default-s">{messages.message}</Text>
                )}

                {/* Attachments */}
                {messages.attachments && messages.attachments.length > 0 && (
                  <Column>
                    {/* If multiple media, show as a grid-like row, else handle individually */}
                    {messages.attachments.length > 1 ? (
                      <Row maxWidth={48} marginTop="16" gap="8" wrap>
                        {messages.attachments.map((att, aIdx) => (
                          att?.media ? (
                            <Media
                              key={aIdx}
                              maxWidth={20}
                              src={att.media}
                              border="neutral-alpha-weak"
                              radius="l"
                              sizes="320px"
                            />
                          ) : null
                        ))}
                      </Row>
                    ) : (
                      messages.attachments[0]?.media && (
                        messages.attachments[0].media.includes("youtube.com") || messages.attachments[0].media.includes("youtu.be") ? (
                          <Media maxWidth={32} border="neutral-alpha-weak" aspectRatio="16/9" marginTop="16" src={messages.attachments[0].media} radius="l" sizes="320px"/>
                        ) : (messages.attachments[0].media.match(/\.(png|jpg|jpeg|gif|webp)$/i)) ? (
                          <Media maxWidth={32} border="neutral-alpha-weak" marginTop="16" src={messages.attachments[0].media} radius="l" sizes="320px"/>
                        ) : (
                          <Row maxWidth={24} marginTop="16">
                            <OgCard url={messages.attachments[0].media} description={false} />
                          </Row>
                        )
                      )
                    )}
                  </Column>
                )}

                {/* Reactions */}
                {messages.reactions && messages.reactions.length > 0 && (
                  <Row gap="4" marginTop="8">
                    {messages.reactions.map((reaction, index) => (
                      reaction.reacted ? (
                        <Row key={index} background="brand-alpha-medium" radius="m">
                          <Button size="s" data-scaling="90" variant="secondary">
                            <Text marginRight="4">{reaction.emoji} {reaction.count}</Text>
                          </Button>
                        </Row>
                      ) : (
                        <Button key={index} size="s" data-scaling="90" variant="secondary">
                          <Text marginRight="2">{reaction.emoji} {reaction.count}</Text>
                        </Button>
                      )
                    ))}
                  </Row>
                )}
              </Column>
            </Row>
          ))}
        </Column>
        <Row fillWidth paddingX="8" paddingBottom="12">
          <Textarea
            id="comment-input"
            placeholder="Message 👋 | intro"
            style={{padding: "0.75rem"}}
            lines="auto"
            value={message}
            hasPrefix={
              <EmojiPickerDropdown
                onSelect={(emoji) => setMessage(message + emoji)}
                trigger={
                  <Row fillWidth data-border="rounded" style={{marginLeft: "-0.25rem"}}>
                    <IconButton icon="smiley" size="m" variant="tertiary" />
                  </Row>
                }
              />
            }
            hasSuffix={
              <Row
                style={{ opacity: message.length > 0 ? 1 : 0, marginRight: "-0.25rem" }}
                transition="micro-medium">
                <IconButton
                  icon={isSubmitting ? "loading" : "send"}
                  size="m"
                  onClick={handleSubmitMessage}
                  disabled={!message || isSubmitting}
                />
              </Row>
            }
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSubmitting}
            error={!!submitError}
            errorMessage={submitError}
          >
          </Textarea>
        </Row>
      </Column>
    </Column>
  )
}