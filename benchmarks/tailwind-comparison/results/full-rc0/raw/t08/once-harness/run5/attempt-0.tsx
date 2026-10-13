"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Button,
  CelebrationFx,
  Column,
  Heading,
  Icon,
  ProgressBar,
  Row,
  Tag,
  Text,
  VisuallyHidden,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";

type Step = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  actionLabel: string;
  estimate: string;
};

const STEPS: readonly Step[] = [
  {
    id: "profile",
    title: "Complete your workspace profile",
    description:
      "Add your company name, time zone and a logo so teammates recognise the workspace in invites and notifications.",
    icon: "organization",
    actionLabel: "Edit profile",
    estimate: "2 min",
  },
  {
    id: "invite",
    title: "Invite your first teammates",
    description:
      "Send invites to the people you work with most. Everyone you add can see the shared project board right away.",
    icon: "mail",
    actionLabel: "Invite people",
    estimate: "3 min",
  },
  {
    id: "project",
    title: "Create your first project",
    description:
      "Start from the Product Launch template or build from scratch. Projects keep tasks, files and discussions together.",
    icon: "folder",
    actionLabel: "Create project",
    estimate: "5 min",
  },
  {
    id: "integration",
    title: "Connect Slack for notifications",
    description:
      "Get a message in #product-updates whenever a task changes status, a comment is added or a deadline gets close.",
    icon: "link",
    actionLabel: "Connect Slack",
    estimate: "2 min",
  },
  {
    id: "security",
    title: "Turn on two-factor authentication",
    description:
      "Protect your account and your team's data with an authenticator app. Recovery codes are generated for you.",
    icon: "security",
    actionLabel: "Secure account",
    estimate: "4 min",
  },
];

type Status = "done" | "current" | "todo";

function StatusBadge({ status, index }: { status: Status; index: number }) {
  if (status === "done") {
    return (
      <Row
        center
        width={32}
        height={32}
        radius="full"
        solid="brand-strong"
        onSolid="brand-strong"
        flex={0}
        aria-hidden="true"
      >
        <Icon name="check" size="s" onBackground="brand-strong" decorative />
      </Row>
    );
  }
  if (status === "current") {
    return (
      <Row
        center
        width={32}
        height={32}
        radius="full"
        background="brand-alpha-weak"
        border="brand-alpha-strong"
        borderWidth={2}
        aria-hidden="true"
      >
        <Text variant="label-strong-s" onBackground="brand-strong">
          {index + 1}
        </Text>
      </Row>
    );
  }
  return (
    <Row
      center
      width={32}
      height={32}
      radius="full"
      background="neutral-alpha-weak"
      border
      aria-hidden="true"
    >
      <Text variant="label-default-s" onBackground="neutral-weak">
        {index + 1}
      </Text>
    </Row>
  );
}

export default function Page() {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(() => new Set());
  const [announcement, setAnnouncement] = useState("");

  const total = STEPS.length;
  const doneCount = completed.size;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  const currentId = useMemo(
    () => STEPS.find((s) => !completed.has(s.id))?.id ?? null,
    [completed],
  );

  const toggleStep = useCallback(
    (step: Step) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        const wasDone = next.has(step.id);
        if (wasDone) {
          next.delete(step.id);
        } else {
          next.add(step.id);
        }
        const count = next.size;
        setAnnouncement(
          wasDone
            ? `${step.title} marked as not done. ${count} of ${total} steps complete.`
            : count === total
              ? `${step.title} done. All ${total} steps complete. Your workspace is ready.`
              : `${step.title} done. ${count} of ${total} steps complete.`,
        );
        return next;
      });
    },
    [total],
  );

  const reset = useCallback(() => {
    setCompleted(new Set());
    setAnnouncement(`Checklist reset. 0 of ${total} steps complete.`);
  }, [total]);

  const statusOf = (id: string): Status =>
    completed.has(id) ? "done" : id === currentId ? "current" : "todo";

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="40" s={{ paddingY: "24" }}>
      <Column maxWidth="m" gap="32">
        <Column gap="12">
          <Tag scheme="brand" size="m" prefixIcon="sparkle">
            Getting started
          </Tag>
          <Heading as="h1" variant="display-strong-s" wrap="balance">
            Set up your Northwind workspace
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            Five quick steps to get your team collaborating. It takes about 16 minutes, and you can
            come back to any step later.
          </Text>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="16" s={{ padding: "16" }}>
          <Row horizontal="between" vertical="center" gap="16" wrap>
            <Text as="h2" variant="heading-strong-m" id="progress-heading">
              Your progress
            </Text>
            <Text variant="label-default-m" onBackground="neutral-weak" aria-hidden="true">
              {doneCount} of {total} steps complete
            </Text>
          </Row>
          <div
            role="progressbar"
            aria-labelledby="progress-heading"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${doneCount} of ${total} steps complete, ${percent} percent`}
            style={{ width: "100%" }}
          >
            <ProgressBar value={percent} showLabel={false} aria-hidden="true" />
          </div>
          <Text variant="label-default-s" onBackground="neutral-weak" aria-hidden="true">
            {percent}% done
          </Text>
        </Column>

        {allDone && (
          <Column
            background="brand-alpha-weak"
            border="brand-alpha-medium"
            radius="l"
            padding="32"
            s={{ padding: "20" }}
            gap="16"
            horizontal="center"
            align="center"
            position="relative"
            overflow="hidden"
          >
            <CelebrationFx
              type="confetti"
              trigger="mount"
              intensity={60}
              duration={4000}
              position="absolute"
              top="0"
              left="0"
              fill
              pointerEvents="none"
            />
            <Row center width={56} height={56} radius="full" solid="brand-strong">
              <Icon name="sparkle" size="l" onBackground="brand-strong" decorative />
            </Row>
            <Heading as="h2" variant="display-strong-xs" wrap="balance">
              You&apos;re all set — nice work!
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-medium" wrap="balance">
              Your workspace is ready. Your team can now plan, track and ship together.
            </Text>
            <Row gap="12" horizontal="center" wrap>
              <Button href="#" prefixIcon="arrowRight" label="Go to dashboard" />
              <Button variant="secondary" prefixIcon="refresh" onClick={reset} label="Restart checklist" />
            </Row>
          </Column>
        )}

        <Column as="section" aria-labelledby="steps-heading" gap="16">
          <Heading as="h2" variant="display-strong-xs" id="steps-heading">
            Checklist
          </Heading>
          <Column as="ol" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
            {STEPS.map((step, index) => {
              const status = statusOf(step.id);
              const isDone = status === "done";
              const isCurrent = status === "current";
              return (
                <Column
                  as="li"
                  key={step.id}
                  background={isCurrent ? "surface" : "transparent"}
                  border={isCurrent ? "brand-alpha-medium" : true}
                  radius="l"
                  padding="20"
                  s={{ padding: "16" }}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <Row gap="16" vertical="start" s={{ direction: "column" }}>
                    <Row gap="16" vertical="start" fillWidth>
                      <StatusBadge status={status} index={index} />
                      <Column gap="8" fillWidth>
                        <Row gap="12" vertical="center" wrap>
                          <Text
                            as="h3"
                            variant="heading-strong-s"
                            onBackground={isDone ? "neutral-weak" : "neutral-strong"}
                            style={isDone ? { textDecoration: "line-through" } : undefined}
                          >
                            {step.title}
                          </Text>
                          {isDone ? (
                            <Tag scheme="success" size="s" prefixIcon="check">
                              Done
                            </Tag>
                          ) : isCurrent ? (
                            <Tag scheme="brand" size="s">
                              Up next
                            </Tag>
                          ) : null}
                        </Row>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {step.description}
                        </Text>
                        <Row gap="4" vertical="center">
                          <Icon name="time" size="xs" onBackground="neutral-weak" decorative />
                          <Text variant="label-default-xs" onBackground="neutral-weak">
                            About {step.estimate}
                          </Text>
                        </Row>
                      </Column>
                    </Row>
                    <Row flex={0} s={{ paddingLeft: "48" }}>
                      {isDone ? (
                        <Button
                          variant="tertiary"
                          size="s"
                          prefixIcon="return"
                          onClick={() => toggleStep(step)}
                          aria-label={`Undo: ${step.title}`}
                          label="Undo"
                        />
                      ) : (
                        <Button
                          variant={isCurrent ? "primary" : "secondary"}
                          size="s"
                          prefixIcon={step.icon}
                          onClick={() => toggleStep(step)}
                          aria-label={`${step.actionLabel}: ${step.title}`}
                          label={step.actionLabel}
                        />
                      )}
                    </Row>
                  </Row>
                </Column>
              );
            })}
          </Column>
        </Column>

        <VisuallyHidden>
          <div role="status" aria-live="polite" aria-atomic="true">
            {announcement}
          </div>
        </VisuallyHidden>
      </Column>
    </Column>
  );
}
