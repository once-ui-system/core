"use client";

import {
  Avatar,
  Button,
  Column,
  CountFx,
  Dialog,
  DropdownWrapper,
  EmojiPickerDropdown,
  Icon,
  IconButton,
  OgCard,
  Option,
  Row,
  SmartLink,
  Text,
  Textarea,
  useToast,
} from "@once-ui-system/core";
import type React from "react";
import { useState } from "react";
import { formatShortRelativeTime } from "@/utils/date-formatter";

interface CommentProps {
  comment: {
    id: string;
    content: string;
    user: {
      name: string;
      avatar: string;
    };
    createdAt: string;
    reactions: {
      hearts: number;
    };
    replies?: CommentProps["comment"][];
  };
  onReply?: (parentId: string, content: string) => Promise<void> | void;
  isReply?: boolean;
}

export function Comment({ comment, onReply, isReply = false }: CommentProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reactionCount, setReactionCount] = useState(comment.reactions.hearts);
  const [hasReacted, setHasReacted] = useState(false);
  const { addToast } = useToast();
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleDeleteComment = async () => {
    setIsDeleting(true);

    try {
      addToast({
        message: "Comment deleted successfully",
        variant: "success",
      });
    } catch (_error) {
      addToast({
        message: "Failed to delete comment",
        variant: "danger",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const toggleReaction = (e: React.MouseEvent) => {
    e.preventDefault();
    setHasReacted(!hasReacted);
    setReactionCount(reactionCount + (!hasReacted ? 1 : -1));
  };

  // Extract the first domain or URL from the content. Accepts with or without http(s)
  const extractFirstUrl = (text: string): { match: string; url: string } | null => {
    // Matches optional protocol + domain with at least one dot and valid TLD-ish part, optional path
    const regex = /(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?/i;
    const m = text.match(regex);
    if (!m) return null;
    const raw = m[0];
    const normalized = raw.startsWith("http") ? raw : `https://${raw}`;
    return { match: raw, url: normalized };
  };

  const handleSubmitReply = async () => {
    if (!reply.trim()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Placeholder submit logic. Integrate API call here if available.
      if (onReply) {
        await onReply(comment.id, reply.trim());
      } else {
        await new Promise((res) => setTimeout(res, 400));
      }
      setReply("");
      setShowReply(false);
    } catch (_err) {
      setSubmitError("Failed to post reply");
      addToast({ message: "Failed to post reply", variant: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Row gap="16" vertical="start" fillWidth paddingLeft="4">
      <Row paddingY="8">
        <SmartLink unstyled href="#">
          <Text onBackground="neutral-strong">
            <Avatar src={comment.user.avatar} size="m" />
          </Text>
        </SmartLink>
      </Row>

      <Column gap="4" fillWidth>
        <Row gap="8" vertical="center" marginBottom="4">
          <SmartLink unstyled href="#">
            <Text variant="body-default-s" onBackground="neutral-strong">
              {comment.user.name}
            </Text>
          </SmartLink>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {formatShortRelativeTime(new Date(comment.createdAt))}
          </Text>
        </Row>

        {(() => {
          const hit = extractFirstUrl(comment.content);
          if (!hit) {
            return <Text variant="body-default-s">{comment.content}</Text>;
          }
          const [before, after] = comment.content.split(hit.match, 2);
          return (
            <>
              <Text variant="body-default-s">
                {before}
                <SmartLink href={hit.url} target="_blank" rel="noopener noreferrer">
                  {hit.match}
                </SmartLink>
                {after}
              </Text>
              <Row maxWidth={24}>
                <OgCard
                  size="s"
                  url={hit.url}
                  marginTop="16"
                  marginBottom="4"
                  description={false}
                />
              </Row>
            </>
          );
        })()}

        <Row gap="2" vertical="center">
          <Button
            variant="tertiary"
            size="s"
            data-border="rounded"
            onClick={(e: React.MouseEvent) => toggleReaction(e)}
            aria-label={hasReacted ? "Unlike comment" : "Like comment"}
            style={{ marginLeft: "-0.75rem" }}
          >
            <Row vertical="center" gap="2">
              <CountFx
                effect="smooth"
                value={reactionCount}
                marginRight="4"
                variant="body-default-s"
                style={{ color: hasReacted ? "var(--danger-solid-strong)" : undefined }}
              />
              <Icon
                key="reaction-icon"
                size="xs"
                style={{ color: hasReacted ? "var(--danger-solid-strong)" : undefined }}
                name={hasReacted ? "heartFilled" : "heart"}
              />
            </Row>
          </Button>
          {!isReply && (
            <Button
              data-border="rounded"
              size="s"
              weight="default"
              variant="tertiary"
              onClick={() => setShowReply((v) => !v)}
            >
              Reply
            </Button>
          )}
          <DropdownWrapper
            placement="right-start"
            dropdown={
              <Column padding="4" gap="2" minWidth={8}>
                <Option
                  value="delete"
                  prefix={<Icon name="trash" size="xs" />}
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete
                </Option>
              </Column>
            }
            trigger={
              <IconButton
                data-border="rounded"
                size="m"
                icon="moreHorizontal"
                variant="tertiary"
                aria-label="Comment options"
              />
            }
          />

          <Dialog
            open={showDeleteDialog}
            onClose={() => setShowDeleteDialog(false)}
            title="Delete comment"
            description="Are you sure you want to delete this comment? This action cannot be undone."
            footer={
              <Row gap="8" horizontal="end" fillWidth>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteComment} loading={isDeleting}>
                  Delete
                </Button>
              </Row>
            }
          />
        </Row>
        {showReply && (
          <Column gap="8" fillWidth>
            <Textarea
              id="reply-input"
              placeholder="Write reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              disabled={isSubmitting}
              error={!!submitError}
              errorMessage={submitError || undefined}
              suffix={
                <Row fillWidth gap={reply.length > 0 ? "8" : "0"} transition="micro-medium">
                  <EmojiPickerDropdown
                    onSelect={(emoji) => setReply((r) => r + emoji)}
                    trigger={
                      <Row fillWidth data-border="rounded">
                        <IconButton icon="smiley" size="m" variant="tertiary" />
                      </Row>
                    }
                  />
                  <Row
                    style={{
                      opacity: reply.length > 0 ? 1 : 0,
                      width: reply.length > 0 ? "1.75rem" : "0px",
                    }}
                    transition="micro-medium"
                  >
                    <IconButton
                      icon="send"
                      loading={isSubmitting}
                      size="m"
                      onClick={handleSubmitReply}
                      disabled={!reply || isSubmitting}
                    />
                  </Row>
                </Row>
              }
            ></Textarea>
          </Column>
        )}
      </Column>
    </Row>
  );
}
