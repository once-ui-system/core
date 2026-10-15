`Input` has no `value` listed either, yet the examples pass `value`/`onChange` to `Select` and `NumberInput`. It's near-certain that `Textarea` extends the native textarea attributes (as `Input` extends input attributes), so `value`, `onChange` and `maxLength` should type-check. I'll use them.

```tsx
"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import {
  Button,
  Column,
  Dialog,
  Heading,
  Icon,
  Row,
  Text,
  Textarea,
  useToast,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";

interface Rating {
  value: number;
  label: string;
  icon: IconName;
}

interface Highlight {
  title: string;
  body: string;
  icon: IconName;
}

const RATINGS: readonly Rating[] = [
  { value: 1, label: "Poor", icon: "dislike" },
  { value: 2, label: "Fair", icon: "warning" },
  { value: 3, label: "Okay", icon: "smiley" },
  { value: 4, label: "Good", icon: "like" },
  { value: 5, label: "Great", icon: "heart" },
];

const TOPICS: readonly string[] = [
  "Billing",
  "Performance",
  "Design",
  "Documentation",
  "Integrations",
];

const HIGHLIGHTS: readonly Highlight[] = [
  {
    title: "Faster deploys",
    body: "Median build time dropped from 4m 12s to 1m 48s after last week's cache rework.",
    icon: "bolt",
  },
  {
    title: "Shared dashboards",
    body: "Invite teammates with view-only links and keep sensitive widgets hidden per role.",
    icon: "barChart",
  },
  {
    title: "Audit history",
    body: "Every change to a project is logged for 90 days, with who, what and when.",
    icon: "clipboard",
  },
];

const MAX_LENGTH = 500;
const FORM_ID = "feedback-form";

interface ChipProps {
  label: string;
  icon?: IconName;
  selected: boolean;
  tabIndex: number;
  size: "m" | "s";
  buttonRef: (node: HTMLButtonElement | null) => void;
  onSelect: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

/** A radio-styled chip: a real button with role="radio" so it is keyboard and screen-reader friendly. */
function ChoiceChip({
  label,
  icon,
  selected,
  tabIndex,
  size,
  buttonRef,
  onSelect,
  onKeyDown,
}: ChipProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={tabIndex}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      style={{
        all: "unset",
        boxSizing: "border-box",
        cursor: "pointer",
        borderRadius: "9999px",
      }}
    >
      <Row
        vertical="center"
        gap="8"
        paddingX={size === "m" ? "16" : "12"}
        paddingY={size === "m" ? "8" : "4"}
        radius="full"
        border={selected ? "brand-alpha-strong" : true}
        background={selected ? "brand-alpha-weak" : "surface"}
        onBackground={selected ? "brand-strong" : "neutral-strong"}
        transition="micro-medium"
      >
        {icon && <Icon name={icon} size="s" />}
        <Text variant={size === "m" ? "label-default-m" : "label-default-s"}>{label}</Text>
      </Row>
    </button>
  );
}

export default function Page() {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [ratingError, setRatingError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const textareaId = useId();
  const ratingLabelId = useId();
  const topicLabelId = useId();
  const ratingRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const topicRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const triggerWrapRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const focusTrigger = useCallback(() => {
    window.setTimeout(() => {
      triggerWrapRef.current?.querySelector("button")?.focus();
    }, 0);
  }, []);

  const handleClose = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(false);
    setSubmitting(false);
    focusTrigger();
  }, [focusTrigger]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (rating === null) {
      setRatingError(true);
      ratingRefs.current[0]?.focus();
      return;
    }
    setSubmitting(true);
    const picked = RATINGS.find((item) => item.value === rating);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      addToast({
        variant: "success",
        message: `Thanks for your feedback! You rated us "${picked?.label ?? rating}".`,
        duration: 5000,
      });
      setRating(null);
      setTopic(null);
      setMessage("");
      setRatingError(false);
      setSubmitting(false);
      setOpen(false);
      focusTrigger();
    }, 700);
  };

  const requestSubmit = () => {
    const form = document.getElementById(FORM_ID);
    if (form instanceof HTMLFormElement) form.requestSubmit();
  };

  /** Roving-tabindex arrow-key handling for a radio group. */
  const radioKeys = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
    count: number,
    refs: React.MutableRefObject<(HTMLButtonElement | null)[]>,
    select: (next: number) => void,
  ) => {
    let next: number;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (index + 1) % count;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = (index - 1 + count) % count;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    select(next);
    refs.current[next]?.focus();
  };

  const selectRating = (index: number) => {
    setRating(RATINGS[index].value);
    setRatingError(false);
  };

  const selectedRating = RATINGS.find((item) => item.value === rating);
  const ratingTabStop = rating === null ? 0 : RATINGS.findIndex((item) => item.value === rating);
  const topicTabStop = topic === null ? 0 : TOPICS.indexOf(topic);

  const ratingHint = ratingError
    ? "Please choose a rating before sending."
    : selectedRating
      ? `You selected ${selectedRating.value} of 5: ${selectedRating.label}.`
      : "1 is poor, 5 is great.";

  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      paddingX="24"
      paddingY="64"
      s={{ paddingX: "16", paddingY: "40" }}
    >
      <Column maxWidth="m" gap="40">
        <Column gap="16">
          <Text variant="label-default-s" onBackground="brand-medium">
            Product update · March
          </Text>
          <Heading as="h1" variant="display-strong-s">
            What&apos;s new in Northwind Cloud
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Three changes shipped this month. Tried them out? Tell us how they landed using the feedback button in
            the corner of your screen. We read every message.
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
              vertical="start"
              s={{ padding: "16" }}
            >
              <Row
                center
                background="brand-alpha-weak"
                onBackground="brand-strong"
                radius="m"
                minWidth={40}
                minHeight={40}
              >
                <Icon name={item.icon} size="m" />
              </Row>
              <Column gap="8" fillWidth>
                <Heading as="h2" variant="heading-strong-m">
                  {item.title}
                </Heading>
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {item.body}
                </Text>
              </Column>
            </Row>
          ))}
        </Column>
      </Column>

      <div
        ref={triggerWrapRef}
        style={{ position: "fixed", right: "1.5rem", bottom: "1.5rem", zIndex: 20 }}
      >
        <Button
          size="l"
          rounded
          prefixIcon="chat"
          label="Feedback"
          data-border="rounded"
          onClick={() => setOpen(true)}
        />
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        title="Send us feedback"
        description="Your input shapes what we build next. It takes under a minute."
        footer={
          <Row gap="12" horizontal="end" fillWidth wrap>
            <Button variant="tertiary" label="Cancel" onClick={handleClose} disabled={submitting} />
            <Button
              label={submitting ? "Sending…" : "Send feedback"}
              prefixIcon="send"
              loading={submitting}
              onClick={requestSubmit}
            />
          </Row>
        }
      >
        <form id={FORM_ID} onSubmit={handleSubmit} noValidate>
          <Column gap="24" paddingY="8">
            <Column gap="12">
              <Text id={ratingLabelId} variant="label-default-m">
                How was your experience?
              </Text>
              <div
                role="radiogroup"
                aria-labelledby={ratingLabelId}
                aria-required="true"
                aria-invalid={ratingError}
                style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
              >
                {RATINGS.map((item, index) => (
                  <ChoiceChip
                    key={item.value}
                    label={item.label}
                    icon={item.icon}
                    size="m"
                    selected={rating === item.value}
                    tabIndex={index === ratingTabStop ? 0 : -1}
                    buttonRef={(node) => {
                      ratingRefs.current[index] = node;
                    }}
                    onSelect={() => selectRating(index)}
                    onKeyDown={(event) => radioKeys(event, index, RATINGS.length, ratingRefs, selectRating)}
                  />
                ))}
              </div>
              <Text
                variant="body-default-s"
                onBackground={ratingError ? "danger-medium" : "neutral-weak"}
                aria-live="polite"
              >
                {ratingHint}
              </Text>
            </Column>

            <Column gap="12">
              <Text id={topicLabelId} variant="label-default-m">
                What is it about?{" "}
                <Text as="span" variant="label-default-s" onBackground="neutral-weak">
                  (optional)
                </Text>
              </Text>
              <div
                role="radiogroup"
                aria-labelledby={topicLabelId}
                style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
              >
                {TOPICS.map((name, index) => (
                  <ChoiceChip
                    key={name}
                    label={name}
                    size="s"
                    selected={topic === name}
                    tabIndex={index === topicTabStop ? 0 : -1}
                    buttonRef={(node) => {
                      topicRefs.current[index] = node;
                    }}
                    onSelect={() => setTopic(topic === name ? null : name)}
                    onKeyDown={(event) =>
                      radioKeys(event, index, TOPICS.length, topicRefs, (next) => setTopic(TOPICS[next]))
                    }
                  />
                ))}
              </div>
            </Column>

            <Textarea
              id={textareaId}
              label="Tell us more"
              placeholder="What worked well? What would you change?"
              lines={4}
              resize="vertical"
              characterCount
              maxLength={MAX_LENGTH}
              description={`Up to ${MAX_LENGTH} characters.`}
              value={message}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setMessage(event.target.value)}
            />
          </Column>
        </form>
      </Dialog>
    </Column>
  );
}
```