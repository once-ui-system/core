"use client";

import { useCallback, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  Button,
  Column,
  Dialog,
  Grid,
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

const RATINGS: Rating[] = [
  { value: 1, label: "Frustrating", icon: "dislike" },
  { value: 2, label: "Needs work", icon: "warning" },
  { value: 3, label: "It's okay", icon: "smiley" },
  { value: 4, label: "Pretty good", icon: "like" },
  { value: 5, label: "Love it", icon: "heart" },
];

const TOPICS = ["Bug report", "Idea", "Design", "Performance", "Something else"] as const;

type Topic = (typeof TOPICS)[number];

type Highlight = {
  icon: IconName;
  title: string;
  body: string;
};

const HIGHLIGHTS: Highlight[] = [
  {
    icon: "barChart",
    title: "Weekly usage report",
    body: "Active projects rose 18% week over week. Most new activity came from the Berlin and Toronto teams.",
  },
  {
    icon: "bolt",
    title: "Faster exports",
    body: "CSV and PDF exports now finish in under four seconds for workspaces with up to 50,000 rows.",
  },
  {
    icon: "security",
    title: "Single sign-on is live",
    body: "Connect Okta or Google Workspace from Settings to let your whole team sign in with one account.",
  },
];

const MAX_LENGTH = 500;

export default function Page() {
  const { addToast } = useToast();

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [message, setMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const ratingRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const topicRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const ratingLabelId = useId();
  const ratingErrorId = useId();
  const topicLabelId = useId();
  const messageId = useId();

  const resetForm = useCallback(() => {
    setRating(null);
    setTopic(null);
    setMessage("");
    setShowError(false);
    setSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(() => {
    if (rating === null) {
      setShowError(true);
      ratingRefs.current[0]?.focus();
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      const picked = RATINGS.find((r) => r.value === rating);
      setOpen(false);
      resetForm();
      addToast({
        variant: "success",
        message: `Thanks for your feedback${picked ? ` — you rated us "${picked.label}"` : ""}. We read every note.`,
      });
    }, 600);
  }, [rating, resetForm, addToast]);

  const moveFocus = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
    count: number,
    refs: React.MutableRefObject<Array<HTMLButtonElement | null>>,
    select: (index: number) => void,
  ) => {
    let next = index;
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
    setShowError(false);
  };

  const selectTopic = (index: number) => {
    setTopic(TOPICS[index]);
  };

  // Roving tabindex: the selected option is the tab stop, or the first if none is selected.
  const ratingTabIndex = (value: number, index: number) =>
    rating === null ? (index === 0 ? 0 : -1) : rating === value ? 0 : -1;
  const topicTabIndex = (value: Topic, index: number) =>
    topic === null ? (index === 0 ? 0 : -1) : topic === value ? 0 : -1;

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="24" paddingY="64" s={{ paddingY: "40", paddingX: "16" }}>
      <Column maxWidth="m" gap="40">
        <Column gap="12">
          <Tag scheme="brand" size="m" prefixIcon="sparkle" label="Acme Analytics" />
          <Heading as="h1" variant="display-strong-s">
            Good morning, Priya
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Here is what changed in your workspace since Monday. Tell us how the new dashboard feels using the
            feedback button in the corner.
          </Text>
        </Column>

        <Grid columns="3" gap="16" m={{ columns: 1 }} s={{ columns: 1 }}>
          {HIGHLIGHTS.map((item) => (
            <Column key={item.title} background="surface" border radius="l" padding="24" gap="12">
              <Row
                center
                width={40}
                height={40}
                radius="m"
                background="brand-alpha-weak"
                onBackground="brand-strong"
              >
                <Icon name={item.icon} size="m" />
              </Row>
              <Heading as="h2" variant="heading-strong-m">
                {item.title}
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {item.body}
              </Text>
            </Column>
          ))}
        </Grid>
      </Column>

      {/* Floating trigger */}
      <Row
        ref={triggerRef}
        position="fixed"
        bottom="24"
        right="24"
        s={{ bottom: "16", right: "16" }}
        zIndex={2}
      >
        <Button
          variant="primary"
          size="l"
          rounded
          prefixIcon="chat"
          label="Feedback"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        />
      </Row>

      <Dialog
        open={open}
        onClose={handleClose}
        title="Share your feedback"
        description="It takes about a minute. Your note goes straight to the product team."
        footer={
          <Row fillWidth gap="8" horizontal="end" wrap>
            <Button variant="tertiary" label="Cancel" onClick={handleClose} disabled={submitting} />
            <Button
              variant="primary"
              label="Send feedback"
              suffixIcon="send"
              loading={submitting}
              onClick={handleSubmit}
            />
          </Row>
        }
      >
        <Column fillWidth gap="24" paddingTop="8">
          <Column gap="12">
            <Text id={ratingLabelId} variant="label-strong-m">
              How would you rate your experience?
            </Text>
            <Row
              gap="8"
              wrap
              role="radiogroup"
              aria-labelledby={ratingLabelId}
              aria-required="true"
              aria-invalid={showError}
              aria-describedby={showError ? ratingErrorId : undefined}
            >
              {RATINGS.map((item, index) => {
                const selected = rating === item.value;
                return (
                  <button
                    key={item.value}
                    ref={(el) => {
                      ratingRefs.current[index] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={ratingTabIndex(item.value, index)}
                    onClick={() => selectRating(index)}
                    onKeyDown={(e) => moveFocus(e, index, RATINGS.length, ratingRefs, selectRating)}
                    style={{
                      background: "none",
                      border: 0,
                      padding: 0,
                      margin: 0,
                      font: "inherit",
                      color: "inherit",
                      cursor: "pointer",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    <Row pointerEvents="none">
                      <Chip3 label={item.label} icon={item.icon} selected={selected} />
                    </Row>
                  </button>
                );
              })}
            </Row>
            {showError && (
              <Text id={ratingErrorId} role="alert" variant="body-default-s" onBackground="danger-medium">
                Please choose a rating before sending.
              </Text>
            )}
          </Column>

          <Column gap="12">
            <Text id={topicLabelId} variant="label-strong-m">
              What is this about? <Text as="span" variant="body-default-s" onBackground="neutral-weak">(optional)</Text>
            </Text>
            <Row gap="8" wrap role="radiogroup" aria-labelledby={topicLabelId}>
              {TOPICS.map((item, index) => {
                const selected = topic === item;
                return (
                  <button
                    key={item}
                    ref={(el) => {
                      topicRefs.current[index] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={topicTabIndex(item, index)}
                    onClick={() => selectTopic(index)}
                    onKeyDown={(e) => moveFocus(e, index, TOPICS.length, topicRefs, selectTopic)}
                    style={{
                      background: "none",
                      border: 0,
                      padding: 0,
                      margin: 0,
                      font: "inherit",
                      color: "inherit",
                      cursor: "pointer",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    <Row pointerEvents="none">
                      <Chip3 label={item} selected={selected} />
                    </Row>
                  </button>
                );
              })}
            </Row>
          </Column>

          <Textarea
            id={messageId}
            label="Tell us more"
            placeholder="What worked well? What got in your way?"
            lines={4}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_LENGTH))}
            description={`${message.length} / ${MAX_LENGTH} characters`}
          />
        </Column>
      </Dialog>
    </Column>
  );
}

/**
 * Presentational chip. Wrapped by a real <button role="radio"> above so that
 * keyboard, focus and screen-reader semantics come from a native control.
 */
function Chip3({ label, icon, selected }: { label: string; icon?: IconName; selected: boolean }) {
  return (
    <ChipView label={label} icon={icon} selected={selected} />
  );
}

function ChipView({ label, icon, selected }: { label: string; icon?: IconName; selected: boolean }) {
  return (
    <Row
      vertical="center"
      gap="8"
      paddingX="16"
      paddingY="8"
      radius="full"
      border={selected ? "brand-alpha-strong" : true}
      background={selected ? "brand-alpha-weak" : "surface"}
      onBackground={selected ? "brand-strong" : "neutral-strong"}
    >
      {icon && <Icon name={icon} size="s" />}
      <Text variant="label-default-s">{label}</Text>
    </Row>
  );
}
