"use client";

import {
  Avatar,
  Button,
  Column,
  EmojiPickerDropdown,
  IconButton,
  Row,
  Spinner,
  Text,
  Textarea,
} from "@once-ui-system/core";
import type React from "react";
import { useEffect, useState } from "react";
import { Comment } from "./Comment";

interface CommentProps extends React.ComponentProps<typeof Column> {
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
  replies?: CommentProps[];
}

type CommentsProps = React.ComponentProps<typeof Column> & { limit?: number; showTitle?: boolean };

export function Comments({ limit, showTitle = true, ...flex }: CommentsProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(
    typeof limit === "number" ? limit : Number.POSITIVE_INFINITY,
  );
  const [inputFocused, setInputFocused] = useState(false);

  const currentUser = {
    name: "Lorant",
    avatar: "/images/creators/lorant.jpg",
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setComments([
        {
          id: "1",
          content:
            "Finally something fresh, something new. I love once-ui.com my friend. You're coookin'!",
          user: {
            name: "Jony Ive",
            avatar: "/images/avatars/jony-ive.jpg",
          },
          createdAt: "2025-07-07T15:30:00Z",
          reactions: {
            hearts: 7,
          },
        },
        {
          id: "2",
          content: "@Jony buddy, will you migrate to Once UI finally or what...",
          user: {
            name: "Lorant One",
            avatar: "/images/creators/lorant.jpg",
          },
          createdAt: "2025-07-06T10:15:00Z",
          reactions: {
            hearts: 3,
          },
          replies: [
            {
              id: "2-1",
              content: "Dude yes, Sammy was so stoked to see this stuff!",
              user: {
                name: "Jony Ive",
                avatar: "/images/avatars/jony-ive.jpg",
              },
              createdAt: "2025-07-06T11:20:00Z",
              reactions: {
                hearts: 5,
              },
            },
          ],
        },
      ]);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Keep visibleCount in sync if parent updates `limit`
  useEffect(() => {
    if (typeof limit === "number") {
      setVisibleCount(limit);
    }
  }, [limit]);

  const handleSubmitComment = async () => {
    if (!comment.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newComment: CommentProps = {
        id: `new-${Date.now()}`,
        content: comment,
        user: currentUser,
        createdAt: new Date().toISOString(),
        reactions: {
          hearts: 0,
        },
      };

      setComments((prevComments) => [newComment, ...prevComments]);
      setComment("");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "An error occurred while submitting your comment",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReply = async (parentId: string, content: string) => {
    const newReply: CommentProps = {
      id: `reply-${Date.now()}`,
      content,
      user: currentUser,
      createdAt: new Date().toISOString(),
      reactions: { hearts: 0 },
    };

    const addReplyRecursive = (items: CommentProps[]): CommentProps[] =>
      items.map((item) => {
        if (item.id === parentId) {
          const existing = item.replies ?? [];
          return { ...item, replies: [...existing, newReply] };
        }
        if (item.replies && item.replies.length > 0) {
          return { ...item, replies: addReplyRecursive(item.replies) };
        }
        return item;
      });

    setComments((prev) => addReplyRecursive(prev));
  };

  return (
    <Column gap="24" fillWidth id="comments" {...flex}>
      <Column fillWidth gap="12">
        {showTitle && (
          <Row paddingLeft="56" textVariant="label-default-s" onBackground="neutral-weak">
            {comments.length > 0 ? "Join" : "Start"} the discussion!
          </Row>
        )}

        <Row gap="4" fillWidth>
          <Row padding="4" fitHeight marginTop="8">
            <Avatar src="/images/creators/lorant.jpg" size="m" />
          </Row>

          <Column gap="8" fillWidth>
            <Textarea
              id="comment-input"
              placeholder="Add a comment..."
              style={{ padding: "0.75rem" }}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              disabled={isSubmitting}
              error={!!submitError}
              errorMessage={submitError}
            >
              <Row
                fillWidth
                style={{ height: inputFocused ? "2.5rem" : "0" }}
                transition="micro-medium"
              >
                <Row fillWidth horizontal="between" paddingX="8" paddingBottom="8">
                  <EmojiPickerDropdown
                    onSelect={(emoji) => setComment(comment + emoji)}
                    trigger={
                      <Row fillWidth data-border="rounded">
                        <IconButton icon="smiley" size="m" variant="tertiary" />
                      </Row>
                    }
                  />
                  <Row style={{ opacity: comment.length > 0 ? 1 : 0 }} transition="micro-medium">
                    <IconButton
                      icon="send"
                      loading={isSubmitting}
                      size="m"
                      onClick={handleSubmitComment}
                      disabled={!comment || isSubmitting}
                    />
                  </Row>
                </Row>
              </Row>
            </Textarea>
          </Column>
        </Row>
      </Column>
      {/* Comments list */}
      <Column gap="16" marginTop="8" fillWidth>
        {isLoading ? (
          <Spinner minHeight={12} center align="center" fillWidth size="s" />
        ) : error ? (
          <Text variant="body-default-s" onBackground="danger-weak" align="center" paddingY="l">
            {error}
          </Text>
        ) : comments.length > 0 ? (
          (() => {
            // Total available across comments + replies
            const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
            const effectiveCount = Math.min(visibleCount, totalCount);

            let shown = 0;
            const nodes: React.ReactNode[] = [];

            for (const c of comments) {
              if (shown >= effectiveCount) break;
              // Render top-level comment if we still have budget
              nodes.push(
                <Column key={c.id} gap="16" fillWidth>
                  <Comment key={c.id} comment={c} onReply={handleAddReply} />
                  {(() => {
                    // Render replies within the remaining budget
                    const remainingAfterParent = effectiveCount - ++shown;
                    if (!c.replies || c.replies.length === 0 || remainingAfterParent <= 0) {
                      return null;
                    }
                    const replyNodes: React.ReactNode[] = [];
                    for (const r of c.replies.slice(0, remainingAfterParent)) {
                      replyNodes.push(
                        <Comment key={r.id} comment={r} isReply={true} onReply={handleAddReply} />,
                      );
                      shown++;
                    }
                    return replyNodes.length > 0 ? (
                      <Column gap="16" fillWidth paddingLeft="48">
                        {replyNodes}
                      </Column>
                    ) : null;
                  })()}
                </Column>,
              );
            }

            return nodes;
          })()
        ) : (
          <Text variant="body-default-s" onBackground="neutral-weak" align="center" paddingY="l">
            No comments yet. Be the first to share your thoughts!
          </Text>
        )}
      </Column>
      {(() => {
        const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
        const effectiveCount = Math.min(visibleCount, totalCount);
        const remaining = Math.max(totalCount - effectiveCount, 0);
        if (remaining <= 0) return null;
        return (
          <Row fillWidth paddingLeft="48">
            <Button
              data-border="rounded"
              variant="secondary"
              size="s"
              weight="default"
              onClick={() => setVisibleCount((v) => Math.min(v + 5, totalCount))}
            >
              Load {remaining} more
            </Button>
          </Row>
        );
      })()}
    </Column>
  );
}
