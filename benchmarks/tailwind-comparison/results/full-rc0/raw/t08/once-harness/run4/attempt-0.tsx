"use client";

import { useCallback, useId, useMemo, useState } from "react";
import {
  Background,
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
  detail: string;
  icon: IconName;
  actionLabel: string;
  estimate: string;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your profile",
    description: "Add your name, role and team so collaborators know who you are.",
    detail:
      "Your profile appears on comments, assignments and activity logs. Add a role like “Product designer” and pick the team you work with most.",
    icon: "person",
    actionLabel: "Edit profile",
    estimate: "1 min",
  },
  {
    id: "workspace",
    title: "Name your workspace",
    description: "Give Northwind Studio a name and URL your team will recognize.",
    detail:
      "The workspace name shows in the sidebar and in invite emails. You can change the URL later, and old links will keep redirecting.",
    icon: "organization",
    actionLabel: "Open workspace settings",
    estimate: "1 min",
  },
  {
    id: "invite",
    title: "Invite two teammates",
    description: "Projects move faster when the people who review your work are here.",
    detail:
      "Paste email addresses or share an invite link. Teammates join as editors by default, and you can switch anyone to viewer at any time.",
    icon: "mail",
    actionLabel: "Send invites",
    estimate: "2 min",
  },
  {
    id: "project",
    title: "Create your first project",
    description: "Start from the Product launch template or begin with a blank board.",
    detail:
      "Templates come with sample tasks, a timeline and a review checklist. Everything is editable, so pick the closest match and adjust.",
    icon: "folder",
    actionLabel: "Browse templates",
    estimate: "3 min",
  },
  {
    id: "integrations",
    title: "Connect your calendar",
    description: "Sync due dates so deadlines show up where you already plan your week.",
    detail:
      "We only read event times and titles to flag conflicts with project deadlines. You can disconnect from Settings → Integrations whenever you like.",
    icon: "calendar",
    actionLabel: "Connect calendar",
    estimate: "1 min",
  },
  {
    id: "notifications",
    title: "Choose notification settings",
    description: "Decide what lands in your inbox and what stays in the app.",
    detail:
      "Start with the recommended digest: one summary each morning plus instant alerts when someone mentions you.",
    icon: "bell",
    actionLabel: "Review notifications",
    estimate: "1 min",
  },
];

type Status = "done" | "current" | "upcoming";

function StatusBadge({ status, index }: { status: Status; index: number }) {
  if (status === "done") {
    return (
      <Row
        aria-hidden="true"
        solid="success-strong"
        onSolid="success-strong"
        radius="full"
        center
        minWidth={2}
        width={2}
        height={2}
        shadow="xs"
      >
        <Icon name="check" size="xs" onSolid="success-strong" />
      </Row>
    );
  }
  if (status === "current") {
    return (
      <Row
        aria-hidden="true"
        radius="full"
        center
        width={2}
        height={2}
        minWidth={2}
        border="brand-alpha-strong"
        borderWidth={2}
        background="brand-alpha-weak"
        onBackground="brand-strong"
        textVariant="label-strong-xs"
      >
        {index + 1}
      </Row>
    );
  }
  return (
    <Row
      aria-hidden="true"
      radius="full"
      center
      width={2}
      height={2}
      minWidth={2}
      border
      borderStyle="dashed"
      background="transparent"
      onBackground="neutral-weak"
      textVariant="label-default-xs"
    >
      {index + 1}
    </Row>
  );
}

export default function Page() {
  const baseId = useId();
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set<string>(["profile"]),
  );
  const [expanded, setExpanded] = useState<string | null>("workspace");
  const [celebrationKey, setCelebrationKey] = useState(0);

  const total = STEPS.length;
  const doneCount = completed.size;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  const currentId = useMemo(
    () => STEPS.find((s) => !completed.has(s.id))?.id ?? null,
    [completed],
  );

  const statusOf = useCallback(
    (id: string): Status => {
      if (completed.has(id)) return "done";
      if (id === currentId) return "current";
      return "upcoming";
    },
    [completed, currentId],
  );

  const toggleStep = useCallback(
    (id: string) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        const wasDone = next.has(id);
        if (wasDone) {
          next.delete(id);
        } else {
          next.add(id);
        }
        if (!wasDone && next.size === STEPS.length) {
          setCelebrationKey((k) => k + 1);
        }
        return next;
      });
      // After finishing a step, move focus of attention to the next unfinished one.
      setExpanded((prevExpanded) => {
        if (prevExpanded !== id) return prevExpanded;
        const idx = STEPS.findIndex((s) => s.id === id);
        const following = STEPS.slice(idx + 1).find((s) => !completed.has(s.id));
        return following ? following.id : prevExpanded;
      });
    },
    [completed],
  );

  const reset = useCallback(() => {
    setCompleted(new Set<string>());
    setExpanded(STEPS[0].id);
  }, []);

  const statusText = allDone
    ? "All steps complete. Your workspace is ready."
    : `${doneCount} of ${total} steps complete.`;

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="48" s={{ paddingY: "24" }}>
      <Column maxWidth="s" gap="24">
        {/* Header */}
        <Column gap="12">
          <Text variant="label-default-s" onBackground="brand-medium">
            Getting started
          </Text>
          <Heading as="h1" variant="display-strong-xs" wrap="balance">
            Set up Northwind Studio
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Six quick steps to get your team collaborating. It takes about nine minutes, and you can
            leave and come back at any time.
          </Text>
        </Column>

        {/* Progress panel */}
        <Column
          background="surface"
          border
          radius="l"
          padding="24"
          gap="16"
          s={{ padding: "16" }}
        >
          <Row horizontal="between" vertical="center" gap="16" wrap>
            <Column gap="4">
              <Text variant="heading-strong-m" id={`${baseId}-progress-label`}>
                Your progress
              </Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {allDone
                  ? "Everything is set up."
                  : `${total - doneCount} ${total - doneCount === 1 ? "step" : "steps"} left`}
              </Text>
            </Column>
            <Tag scheme={allDone ? "success" : "brand"} size="m" prefixIcon={allDone ? "check" : undefined}>
              {percent}% complete
            </Tag>
          </Row>

          <div
            role="progressbar"
            aria-labelledby={`${baseId}-progress-label`}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={doneCount}
            aria-valuetext={`${doneCount} of ${total} steps complete`}
          >
            <ProgressBar
              value={percent}
              showLabel={false}
              barBackground={allDone ? "success-strong" : "brand-strong"}
              aria-hidden="true"
            />
          </div>

          <VisuallyHidden>
            <span role="status" aria-live="polite">
              {statusText}
            </span>
          </VisuallyHidden>
        </Column>

        {/* Completion panel */}
        {allDone && (
          <Column
            key={celebrationKey}
            background="surface"
            border="success-alpha-medium"
            radius="l"
            padding="32"
            s={{ padding: "20" }}
            gap="16"
            horizontal="center"
            align="center"
            overflow="hidden"
            role="region"
            aria-label="Setup complete"
          >
            <Background
              position="absolute"
              top="0"
              left="0"
              fill
              pointerEvents="none"
              gradient={{
                display: true,
                colorStart: "success-alpha-medium",
                colorEnd: "static-transparent",
                x: 50,
                y: 0,
                width: 200,
                height: 80,
                opacity: 60,
              }}
            />
            <CelebrationFx
              position="absolute"
              top="0"
              left="0"
              fill
              pointerEvents="none"
              type="confetti"
              intensity={60}
              duration={4000}
              aria-hidden="true"
            />
            <Column zIndex={1} horizontal="center" gap="16" fillWidth>
              <Row
                solid="success-strong"
                radius="full"
                center
                width={4}
                height={4}
                aria-hidden="true"
              >
                <Icon name="sparkle" size="l" onSolid="success-strong" />
              </Row>
              <Heading as="h2" variant="display-strong-xs" wrap="balance">
                You’re all set, welcome aboard!
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                Your workspace is ready. Your teammates have been invited and your first project is
                waiting on the board.
              </Text>
              <Row gap="12" horizontal="center" wrap>
                <Button href="#" prefixIcon="arrowRight" label="Go to your workspace" />
                <Button variant="secondary" prefixIcon="refresh" label="Start over" onClick={reset} />
              </Row>
            </Column>
          </Column>
        )}

        {/* Steps */}
        <Column as="ol" gap="8" margin="0" padding="0" aria-label="Setup steps" style={{ listStyle: "none" }}>
          {STEPS.map((step, index) => {
            const status = statusOf(step.id);
            const isOpen = expanded === step.id;
            const panelId = `${baseId}-panel-${step.id}`;
            const buttonId = `${baseId}-button-${step.id}`;
            const isDone = status === "done";
            return (
              <Column
                as="li"
                key={step.id}
                background="surface"
                border={status === "current" ? "brand-alpha-medium" : true}
                radius="l"
                overflow="hidden"
              >
                <h3 style={{ margin: 0, font: "inherit" }}>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setExpanded(isOpen ? null : step.id)}
                    style={{
                      all: "unset",
                      boxSizing: "border-box",
                      width: "100%",
                      cursor: "pointer",
                      display: "block",
                    }}
                  >
                    <Row gap="16" padding="16" vertical="center" s={{ padding: "12", gap: "12" }}>
                      <StatusBadge status={status} index={index} />
                      <Column flex={1} gap="4">
                        <Row gap="8" vertical="center" wrap>
                          <Text
                            variant="label-strong-m"
                            onBackground={isDone ? "neutral-weak" : "neutral-strong"}
                            style={isDone ? { textDecoration: "line-through" } : undefined}
                          >
                            {step.title}
                          </Text>
                          <VisuallyHidden>
                            {isDone ? "Completed" : status === "current" ? "Up next" : "Not started"}
                          </VisuallyHidden>
                        </Row>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {step.description}
                        </Text>
                      </Column>
                      <Row gap="8" vertical="center" aria-hidden="true">
                        <Row hide s={{ hide: true }} />
                        <Tag
                          scheme={isDone ? "success" : status === "current" ? "brand" : "neutral"}
                          size="s"
                        >
                          {isDone ? "Done" : status === "current" ? "Up next" : step.estimate}
                        </Tag>
                        <Icon name={isOpen ? "chevronUp" : "chevronDown"} size="s" onBackground="neutral-weak" />
                      </Row>
                    </Row>
                  </button>
                </h3>

                <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}>
                  {isOpen && (
                    <Column
                      paddingX="16"
                      paddingBottom="16"
                      gap="16"
                      s={{ paddingX: "12", paddingBottom: "12" }}
                      borderTop
                      paddingTop="16"
                    >
                      <Row gap="12" vertical="start">
                        <Icon name={step.icon} size="m" onBackground="brand-medium" />
                        <Text variant="body-default-m" onBackground="neutral-medium">
                          {step.detail}
                        </Text>
                      </Row>
                      <Row gap="8" wrap>
                        {!isDone && (
                          <Button size="s" variant="secondary" label={step.actionLabel} suffixIcon="arrowUpRight" href="#" />
                        )}
                        <Button
                          size="s"
                          variant={isDone ? "tertiary" : "primary"}
                          prefixIcon={isDone ? "refresh" : "check"}
                          label={isDone ? "Mark as not done" : "Mark as done"}
                          onClick={() => toggleStep(step.id)}
                        />
                      </Row>
                    </Column>
                  )}
                </div>
              </Column>
            );
          })}
        </Column>

        <Text variant="body-default-xs" onBackground="neutral-weak" align="center">
          Need a hand? Our support team replies within one business day.
        </Text>
      </Column>
    </Column>
  );
}
