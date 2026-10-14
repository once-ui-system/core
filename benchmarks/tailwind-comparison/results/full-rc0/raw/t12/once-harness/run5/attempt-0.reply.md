Now writing the page.

```tsx
"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  Button,
  Column,
  Dialog,
  Grid,
  Heading,
  Line,
  Row,
  Tag,
  Text,
  Textarea,
  ToggleButton,
  VisuallyHidden,
  useToast,
} from "@once-ui-system/core";

type Rating = {
  value: number;
  label: string;
  hint: string;
};

type Category = {
  value: string;
  label: string;
};

const RATINGS: Rating[] = [
  { value: 1, label: "Poor", hint: "Something is really getting in the way" },
  { value: 2, label: "Fair", hint: "It works, but it's frustrating" },
  { value: 3, label: "Okay", hint: "Does the job, nothing special" },
  { value: 4, label: "Good", hint: "Fast and mostly intuitive" },
  { value: 5, label: "Great", hint: "Exactly what I needed" },
];

const CATEGORIES: Category[] = [
  { value: "usability", label: "Usability" },
  { value: "performance", label: "Performance" },
  { value: "design", label: "Design" },
  { value: "bug", label: "Bug report" },
  { value: "idea", label: "Feature idea" },
];

const HIGHLIGHTS = [
  {
    title: "Shared inbox",
    description: "Route customer emails to the right teammate and track replies in a single thread.",
    tag: "Updated",
  },
  {
    title: "Saved replies",
    description: "Write a response once, then reuse it across conversations with variables filled in.",
    tag: "Popular",
  },
  {
    title: "Weekly digest",
    description: "A Monday summary of open conversations, response times and unresolved issues.",
    tag: "New",
  },
];

const MIN_COMMENT = 10;
const MAX_COMMENT = 500;

export default function Page() {
  const { addToast } = useToast();

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [category, setCategory] = useState<string>(CATEGORIES[0].value);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const triggerWrapRef = useRef<HTMLDivElement>(null);
  const ratingRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const categoryRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const baseId = useId();
  const ratingLabelId = `${baseId}-rating-label`;
  const ratingHintId = `${baseId}-rating-hint`;
  const ratingErrorId = `${baseId}-rating-error`;
  const categoryLabelId = `${baseId}-category-label`;
  const commentId = `${baseId}-comment`;

  const ratingMissing = attempted && rating === null;
  const trimmed = comment.trim();
  const commentTooShort = attempted && trimmed.length < MIN_COMMENT;
  const activeRating = RATINGS.find((r) => r.value === rating) ?? null;

  const reset = useCallback(() => {
    setRating(null);
    setCategory(CATEGORIES[0].value);
    setComment("");
    setAttempted(false);
    setSubmitting(false);
  }, []);

  const returnFocus = useCallback(() => {
    // Return focus to the floating trigger once the dialog has unmounted.
    window.setTimeout(() => {
      triggerWrapRef.current?.querySelector<HTMLElement>("button")?.focus();
    }, 0);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setAttempted(false);
    returnFocus();
  }, [returnFocus]);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  // Roving tabindex + arrow-key navigation shared by both radio groups.
  const handleGroupKeyDown = useCallback(
    (
      event: KeyboardEvent<HTMLDivElement>,
      count: number,
      current: number,
      refs: React.MutableRefObject<(HTMLButtonElement | null)[]>,
      select: (index: number) => void,
    ) => {
      let next = current;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          next = (current + 1) % count;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          next = (current - 1 + count) % count;
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
    },
    [],
  );

  const ratingFocusIndex = rating === null ? 0 : rating - 1;
  const categoryIndex = Math.max(
    0,
    CATEGORIES.findIndex((c) => c.value === category),
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAttempted(true);

      if (rating === null) {
        ratingRefs.current[0]?.focus();
        return;
      }
      if (trimmed.length < MIN_COMMENT) {
        document.getElementById(commentId)?.focus();
        return;
      }

      setSubmitting(true);
      // Simulated network round-trip so the loading state is visible.
      window.setTimeout(() => {
        addToast({
          variant: "success",
          message: "Thanks for the feedback — our team reads every note.",
        });
        setOpen(false);
        reset();
        returnFocus();
      }, 700);
    },
    [addToast, commentId, rating, reset, returnFocus, trimmed.length],
  );

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="24" paddingY="80" gap="64">
      <Column maxWidth="m" gap="64">
        <Column gap="16">
          <Text variant="label-default-s" onBackground="brand-medium">
            Northwind Help Desk
          </Text>
          <Heading as="h1" variant="display-strong-s">
            Support that keeps up with your team
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Triage conversations, share context and close the loop faster. Tried something new this
            week? Tell us how it went using the feedback button in the corner.
          </Text>
          <Row gap="12" wrap>
            <Button prefixIcon="chat" onClick={handleOpen}>
              Share feedback
            </Button>
            <Button variant="secondary" suffixIcon="arrowUpRight" href="#highlights">
              See what&apos;s new
            </Button>
          </Row>
        </Column>

        <Line />

        <Column gap="24" id="highlights">
          <Heading as="h2" variant="display-strong-xs">
            Recently shipped
          </Heading>
          <Grid columns="3" gap="16" m={{ columns: 2 }} s={{ columns: 1 }}>
            {HIGHLIGHTS.map((item) => (
              <Column
                key={item.title}
                background="surface"
                border
                radius="l"
                padding="24"
                gap="12"
              >
                <Row>
                  <Tag size="s" scheme="brand">
                    {item.tag}
                  </Tag>
                </Row>
                <Heading as="h3" variant="heading-strong-m">
                  {item.title}
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {item.description}
                </Text>
              </Column>
            ))}
          </Grid>
        </Column>
      </Column>

      {/* Floating trigger */}
      <Row
        ref={triggerWrapRef}
        position="fixed"
        bottom="24"
        right="24"
        s={{ bottom: "16", right: "16" }}
        shadow="l"
        radius="full"
      >
        <Button
          rounded
          size="l"
          prefixIcon="chat"
          onClick={handleOpen}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          Feedback
        </Button>
      </Row>

      <Dialog
        open={open}
        onClose={handleClose}
        title="Share your feedback"
        description="It takes under a minute and goes straight to the product team."
        footer={
          <Row fillWidth horizontal="end" gap="8" s={{ direction: "column-reverse" }}>
            <Button variant="tertiary" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={`${baseId}-form`}
              prefixIcon="send"
              loading={submitting}
              disabled={submitting}
            >
              Send feedback
            </Button>
          </Row>
        }
      >
        <form id={`${baseId}-form`} onSubmit={handleSubmit} noValidate>
          <Column gap="24" paddingTop="8">
            {/* Rating */}
            <Column gap="8">
              <Text as="span" id={ratingLabelId} variant="label-strong-s">
                How was your experience?
              </Text>
              <Row
                role="radiogroup"
                aria-labelledby={ratingLabelId}
                aria-describedby={ratingMissing ? ratingErrorId : ratingHintId}
                aria-required="true"
                gap="8"
                wrap
                onKeyDown={(e: KeyboardEvent<HTMLDivElement>) =>
                  handleGroupKeyDown(
                    e,
                    RATINGS.length,
                    ratingFocusIndex,
                    ratingRefs,
                    (index) => setRating(RATINGS[index].value),
                  )
                }
              >
                {RATINGS.map((item, index) => {
                  const selected = rating === item.value;
                  return (
                    <ToggleButton
                      key={item.value}
                      ref={(node: HTMLButtonElement | null) => {
                        ratingRefs.current[index] = node;
                      }}
                      role="radio"
                      aria-checked={selected}
                      tabIndex={index === ratingFocusIndex ? 0 : -1}
                      variant="outline"
                      radius="full"
                      selected={selected}
                      onClick={() => setRating(item.value)}
                    >
                      <Text as="span" variant="label-strong-s">
                        {item.value}
                      </Text>
                      <Text as="span" variant="label-default-s">
                        {item.label}
                      </Text>
                    </ToggleButton>
                  );
                })}
              </Row>
              {ratingMissing ? (
                <Text
                  id={ratingErrorId}
                  role="alert"
                  variant="body-default-xs"
                  onBackground="danger-medium"
                >
                  Pick a rating so we know where you landed.
                </Text>
              ) : (
                <Text id={ratingHintId} variant="body-default-xs" onBackground="neutral-weak">
                  {activeRating ? activeRating.hint : "Choose from 1 (poor) to 5 (great)."}
                </Text>
              )}
              <VisuallyHidden>
                <span aria-live="polite">
                  {activeRating ? `Selected ${activeRating.value} of 5, ${activeRating.label}` : ""}
                </span>
              </VisuallyHidden>
            </Column>

            {/* Category */}
            <Column gap="8">
              <Text as="span" id={categoryLabelId} variant="label-strong-s">
                What is this about?
              </Text>
              <Row
                role="radiogroup"
                aria-labelledby={categoryLabelId}
                gap="8"
                wrap
                onKeyDown={(e: KeyboardEvent<HTMLDivElement>) =>
                  handleGroupKeyDown(
                    e,
                    CATEGORIES.length,
                    categoryIndex,
                    categoryRefs,
                    (index) => setCategory(CATEGORIES[index].value),
                  )
                }
              >
                {CATEGORIES.map((item, index) => {
                  const selected = category === item.value;
                  return (
                    <ToggleButton
                      key={item.value}
                      ref={(node: HTMLButtonElement | null) => {
                        categoryRefs.current[index] = node;
                      }}
                      role="radio"
                      aria-checked={selected}
                      tabIndex={index === categoryIndex ? 0 : -1}
                      size="s"
                      variant="outline"
                      radius="full"
                      selected={selected}
                      onClick={() => setCategory(item.value)}
                    >
                      {item.label}
                    </ToggleButton>
                  );
                })}
              </Row>
            </Column>

            {/* Comment */}
            <Textarea
              id={commentId}
              label="Tell us more"
              placeholder="What worked, what didn't, and what would make it better?"
              lines={4}
              resize="vertical"
              value={comment}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setComment(event.target.value.slice(0, MAX_COMMENT))
              }
              characterCount
              maxLength={MAX_COMMENT}
              error={commentTooShort}
              errorMessage={
                commentTooShort ? `Please write at least ${MIN_COMMENT} characters.` : undefined
              }
              description={`Up to ${MAX_COMMENT} characters. Please don't include passwords or payment details.`}
              required
            />
          </Column>
        </form>
      </Dialog>
    </Column>
  );
}
```