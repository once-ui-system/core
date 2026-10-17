"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import {
  Background,
  Button,
  Column,
  Dialog,
  Heading,
  Icon,
  Row,
  Tag,
  Text,
  Textarea,
  useToast,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";

type Rating = {
  value: number;
  label: string;
  icon: IconName;
};

const RATINGS: readonly Rating[] = [
  { value: 1, label: "Poor", icon: "dislike" },
  { value: 2, label: "Fair", icon: "minus" },
  { value: 3, label: "Okay", icon: "smiley" },
  { value: 4, label: "Good", icon: "like" },
  { value: 5, label: "Great", icon: "heart" },
];

const TOPICS: readonly string[] = ["Reports", "Dashboards", "Exports", "Billing", "Something else"];

const HIGHLIGHTS: readonly { title: string; value: string; note: string; icon: IconName }[] = [
  { title: "Weekly active teams", value: "1,284", note: "+6.2% vs. last week", icon: "organization" },
  { title: "Reports generated", value: "9,730", note: "+312 since Monday", icon: "document" },
  { title: "Median load time", value: "1.4 s", note: "Down from 1.9 s", icon: "bolt" },
];

const MAX_COMMENT = 500;

function RatingChips({
  value,
  onChange,
  labelledBy,
  describedBy,
  invalid,
}: {
  value: number | null;
  onChange: (next: number) => void;
  labelledBy: string;
  describedBy?: string;
  invalid: boolean;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const current = value === null ? 0 : value - 1;
    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % RATINGS.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + RATINGS.length) % RATINGS.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = RATINGS.length - 1;
    onChange(RATINGS[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-required="true"
      onKeyDown={handleKeyDown}
      style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
    >
      {RATINGS.map((rating, index) => {
        const selected = value === rating.value;
        const tabbable = selected || (value === null && index === 0);
        return (
          <button
            key={rating.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={tabbable ? 0 : -1}
            onClick={() => onChange(rating.value)}
            style={{
              all: "unset",
              boxSizing: "border-box",
              cursor: "pointer",
              borderRadius: "var(--radius-full, 999px)",
            }}
          >
            <Row
              gap="8"
              paddingX="16"
              paddingY="8"
              vertical="center"
              radius="full"
              border={selected ? "brand-alpha-strong" : true}
              background={selected ? "brand-alpha-weak" : "surface"}
              onBackground={selected ? "brand-strong" : "neutral-strong"}
              transition="micro-short"
            >
              <Icon name={rating.icon} size="xs" />
              <Text variant="label-default-s">{rating.label}</Text>
            </Row>
          </button>
        );
      })}
    </div>
  );
}

function TopicChips({ value, onChange }: { value: string | null; onChange: (next: string | null) => void }) {
  return (
    <div role="group" aria-label="Topic" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {TOPICS.map((topic) => {
        const pressed = value === topic;
        return (
          <button
            key={topic}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(pressed ? null : topic)}
            style={{
              all: "unset",
              boxSizing: "border-box",
              cursor: "pointer",
              borderRadius: "var(--radius-full, 999px)",
            }}
          >
            <Row
              paddingX="12"
              paddingY="4"
              radius="full"
              border={pressed ? "brand-alpha-strong" : true}
              background={pressed ? "brand-alpha-weak" : "transparent"}
              onBackground={pressed ? "brand-strong" : "neutral-medium"}
              transition="micro-short"
            >
              <Text variant="label-default-xs">{topic}</Text>
            </Row>
          </button>
        );
      })}
    </div>
  );
}

export default function Page() {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [showError, setShowError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ratingLabelId = useId();
  const ratingErrorId = useId();
  const commentId = useId();

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const reset = useCallback(() => {
    setRating(null);
    setTopic(null);
    setComment("");
    setShowError(false);
  }, []);

  const handleClose = useCallback(() => {
    if (submitting) return;
    setOpen(false);
  }, [submitting]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (rating === null) {
      setShowError(true);
      return;
    }
    setSubmitting(true);
    timer.current = setTimeout(() => {
      setSubmitting(false);
      setOpen(false);
      reset();
      addToast({
        variant: "success",
        message: "Thanks for the feedback. Our product team reads every response.",
      });
    }, 900);
  };

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="24" paddingTop="64" paddingBottom="160">
      <Column maxWidth="m" gap="40">
        <Column gap="16">
          <Tag scheme="brand" size="m" prefixIcon="barChart">
            Northwind Analytics
          </Tag>
          <Heading as="h1" variant="display-strong-s">
            Workspace overview
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            A quick look at how your teams used Northwind this week. Spotted something confusing or missing? Use the
            feedback button in the corner and tell us.
          </Text>
        </Column>

        <Column gap="16">
          {HIGHLIGHTS.map((item) => (
            <Row
              key={item.title}
              background="surface"
              border
              radius="l"
              padding="24"
              gap="16"
              vertical="center"
              s={{ direction: "column", vertical: "start" }}
            >
              <Row
                center
                radius="m"
                background="brand-alpha-weak"
                onBackground="brand-strong"
                width={48}
                height={48}
                aria-hidden="true"
              >
                <Icon name={item.icon} size="m" />
              </Row>
              <Column flex={1} gap="4">
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {item.title}
                </Text>
                <Text variant="heading-strong-xl">{item.value}</Text>
              </Column>
              <Text variant="body-default-s" onBackground="success-medium">
                {item.note}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>

      <Row position="fixed" bottom="24" right="24" zIndex={5} s={{ bottom: "16", right: "16" }}>
        <Button
          variant="primary"
          size="l"
          rounded
          prefixIcon="chat"
          label="Feedback"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          data-border="rounded"
        />
      </Row>

      <Dialog
        open={open}
        onClose={handleClose}
        title="Share your feedback"
        description="Tell us how Northwind is working for you. It takes less than a minute."
        footer={
          <Row fillWidth horizontal="end" gap="8" s={{ direction: "column-reverse" }}>
            <Button variant="tertiary" label="Cancel" onClick={handleClose} disabled={submitting} />
            <Button
              variant="primary"
              label={submitting ? "Sending" : "Send feedback"}
              suffixIcon="send"
              loading={submitting}
              onClick={() => {
                const form = document.getElementById("feedback-form");
                if (form instanceof HTMLFormElement) form.requestSubmit();
              }}
            />
          </Row>
        }
      >
        <form id="feedback-form" onSubmit={handleSubmit} noValidate>
          <Column gap="24" fillWidth>
            <Column gap="12">
              <Text id={ratingLabelId} variant="label-default-m">
                How would you rate your experience?
              </Text>
              <RatingChips
                value={rating}
                onChange={(next) => {
                  setRating(next);
                  setShowError(false);
                }}
                labelledBy={ratingLabelId}
                describedBy={showError ? ratingErrorId : undefined}
                invalid={showError}
              />
              {showError && (
                <Text id={ratingErrorId} role="alert" variant="body-default-s" onBackground="danger-medium">
                  Please choose a rating before sending.
                </Text>
              )}
            </Column>

            <Column gap="12">
              <Text variant="label-default-m">What is it about? (optional)</Text>
              <TopicChips value={topic} onChange={setTopic} />
            </Column>

            <Textarea
              id={commentId}
              label="Anything else we should know?"
              placeholder="What worked well, what didn't, what you wish it did…"
              lines={4}
              value={comment}
              onChange={(event) => setComment(event.target.value.slice(0, MAX_COMMENT))}
              characterCount
              maxLength={MAX_COMMENT}
              disabled={submitting}
            />
          </Column>
        </form>
      </Dialog>
    </Column>
  );
}
