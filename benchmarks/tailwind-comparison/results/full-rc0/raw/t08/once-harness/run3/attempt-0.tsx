"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your profile",
    description:
      "Add your name, role and a short bio so teammates know who they are collaborating with.",
    icon: "person",
    actionLabel: "Edit profile",
    estimate: "2 min",
  },
  {
    id: "workspace",
    title: "Name your workspace",
    description:
      "Pick a workspace name and URL slug. You can change both later from the organization settings.",
    icon: "organization",
    actionLabel: "Open workspace settings",
    estimate: "1 min",
  },
  {
    id: "invite",
    title: "Invite your team",
    description:
      "Send invitations by email. Teammates can join as editors or viewers, and you can adjust roles at any time.",
    icon: "mail",
    actionLabel: "Invite teammates",
    estimate: "3 min",
  },
  {
    id: "project",
    title: "Create your first project",
    description:
      "Start from a blank board or use the Product launch template with tasks and milestones pre-filled.",
    icon: "folder",
    actionLabel: "Create project",
    estimate: "4 min",
  },
  {
    id: "integrations",
    title: "Connect an integration",
    description:
      "Link Slack or GitHub to get notifications and automatic status updates inside your project.",
    icon: "link",
    actionLabel: "Browse integrations",
    estimate: "3 min",
  },
  {
    id: "notifications",
    title: "Set notification preferences",
    description:
      "Choose what lands in your inbox: mentions, due dates, weekly digests. Stay informed without the noise.",
    icon: "bell",
    actionLabel: "Review preferences",
    estimate: "1 min",
  },
];

type StepStatus = "done" | "current" | "upcoming";

export default function Page() {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(new Set());
  const [skipped, setSkipped] = useState<ReadonlySet<string>>(new Set());
  const [order, setOrder] = useState<string[]>(() => STEPS.map((s) => s.id));
  const [announcement, setAnnouncement] = useState("");
  const headingRef = useRef<HTMLDivElement>(null);

  const stepsById = useMemo(() => new Map(STEPS.map((s) => [s.id, s])), []);
  const orderedSteps = useMemo(
    () =>
      order
        .map((id) => stepsById.get(id))
        .filter((s): s is Step => s !== undefined),
    [order, stepsById],
  );

  const total = STEPS.length;
  const doneCount = completed.size;
  const allDone = doneCount === total;
  const percent = Math.round((doneCount / total) * 100);
  const currentId = orderedSteps.find((s) => !completed.has(s.id))?.id ?? null;

  const announce = useCallback(
    (nextDone: number, title: string, verb: string) => {
      const base = `${title} ${verb}. ${nextDone} of ${total} steps complete.`;
      setAnnouncement(
        nextDone === total ? `${base} Your checklist is complete.` : base,
      );
    },
    [total],
  );

  const toggleStep = useCallback(
    (step: Step) => {
      const isDone = completed.has(step.id);
      const next = new Set(completed);
      if (isDone) {
        next.delete(step.id);
      } else {
        next.add(step.id);
      }
      setCompleted(next);
      if (!isDone) {
        setSkipped((prev) => {
          if (!prev.has(step.id)) return prev;
          const copy = new Set(prev);
          copy.delete(step.id);
          return copy;
        });
      }
      announce(next.size, step.title, isDone ? "marked as not done" : "completed");
    },
    [completed, announce],
  );

  const skipStep = useCallback(
    (step: Step) => {
      setSkipped((prev) => new Set(prev).add(step.id));
      setOrder((prev) => [...prev.filter((id) => id !== step.id), step.id]);
      setAnnouncement(`${step.title} skipped for now. It moved to the end of your list.`);
    },
    [],
  );

  const restart = useCallback(() => {
    setCompleted(new Set());
    setSkipped(new Set());
    setOrder(STEPS.map((s) => s.id));
    setAnnouncement(`Checklist reset. 0 of ${total} steps complete.`);
    headingRef.current?.focus();
  }, [total]);

  const statusOf = (id: string): StepStatus =>
    completed.has(id) ? "done" : id === currentId ? "current" : "upcoming";

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="48">
      <Column maxWidth="s" gap="32">
        {/* Header */}
        <Column gap="12">
          <Text variant="label-default-s" onBackground="brand-medium">
            Getting started
          </Text>
          <div ref={headingRef} tabIndex={-1} style={{ outline: "none" }}>
            <Heading as="h1" variant="display-strong-s">
              Welcome to Northwind, Priya
            </Heading>
          </div>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Finish these six steps to get your workspace ready for your team. It
            takes about fifteen minutes.
          </Text>
        </Column>

        {/* Progress */}
        <Column
          background="surface"
          border
          radius="l"
          padding="24"
          gap="12"
        >
          <Row horizontal="between" vertical="center" gap="16" wrap>
            <Text variant="label-strong-m" id="progress-label">
              Your progress
            </Text>
            <Text variant="label-default-m" onBackground="neutral-weak">
              {doneCount} of {total} complete
            </Text>
          </Row>
          <div
            role="progressbar"
            aria-labelledby="progress-label"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${doneCount} of ${total} steps complete`}
            style={{ width: "100%" }}
          >
            <ProgressBar
              value={percent}
              showLabel={false}
              barBackground={allDone ? "success-strong" : "brand-strong"}
              aria-hidden="true"
            />
          </div>
        </Column>

        {/* Completion celebration */}
        {allDone && (
          <Column
            background="surface"
            border="success-alpha-medium"
            radius="l"
            padding="32"
            gap="16"
            horizontal="center"
            align="center"
            overflow="hidden"
            role="status"
          >
            <CelebrationFx
              position="absolute"
              top="0"
              left="0"
              fill
              pointerEvents="none"
              type="confetti"
              trigger="mount"
              intensity={60}
              duration={4000}
            />
            <Column zIndex={1} horizontal="center" gap="16">
              <Row
                center
                radius="full"
                solid="success-strong"
                onSolid="success-weak"
                style={{ width: 56, height: 56 }}
              >
                <Icon name="check" size="l" onSolid="success-strong" />
              </Row>
              <Heading as="h2" variant="display-strong-xs">
                You&apos;re all set!
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                Your workspace is ready. Your team can start planning, tracking
                and shipping together right away.
              </Text>
              <Row gap="12" horizontal="center" wrap>
                <Button href="/" label="Go to dashboard" suffixIcon="arrowRight" />
                <Button
                  variant="secondary"
                  label="Restart checklist"
                  prefixIcon="refresh"
                  onClick={restart}
                />
              </Row>
            </Column>
          </Column>
        )}

        {/* Steps */}
        <Column as="ol" gap="12" padding="0" margin="0" aria-label="Onboarding steps" style={{ listStyle: "none" }}>
          {orderedSteps.map((step) => {
            const status = statusOf(step.id);
            const index = STEPS.findIndex((s) => s.id === step.id) + 1;
            const isSkipped = skipped.has(step.id) && status !== "done";
            const isCurrent = status === "current";
            return (
              <Row
                as="li"
                key={step.id}
                aria-current={isCurrent ? "step" : undefined}
                background={isCurrent ? "surface" : "transparent"}
                border={isCurrent ? "brand-alpha-medium" : true}
                radius="l"
                padding="16"
                gap="16"
                vertical="start"
              >
                {/* Status indicator */}
                <Row
                  center
                  radius="full"
                  flex={0}
                  solid={status === "done" ? "success-strong" : undefined}
                  border={status === "done" ? "transparent" : isCurrent ? "brand-alpha-strong" : true}
                  borderWidth={2}
                  style={{ width: 32, height: 32, flexShrink: 0 }}
                >
                  {status === "done" ? (
                    <Icon name="check" size="s" onSolid="success-strong" />
                  ) : (
                    <Text
                      variant="label-strong-s"
                      onBackground={isCurrent ? "brand-strong" : "neutral-weak"}
                      aria-hidden="true"
                    >
                      {index}
                    </Text>
                  )}
                </Row>

                {/* Content */}
                <Column fillWidth gap="12">
                  <Row horizontal="between" vertical="center" gap="12" wrap>
                    <Row gap="12" vertical="center" wrap>
                      <Icon
                        name={step.icon}
                        size="s"
                        onBackground={status === "done" ? "neutral-weak" : "neutral-strong"}
                      />
                      <Text
                        variant="label-strong-m"
                        onBackground={status === "done" ? "neutral-weak" : "neutral-strong"}
                        style={status === "done" ? { textDecoration: "line-through" } : undefined}
                      >
                        {step.title}
                      </Text>
                      {isSkipped && <Tag scheme="warning" size="s" label="Skipped" />}
                      {status === "done" && <Tag scheme="success" size="s" label="Done" />}
                      {isCurrent && <Tag scheme="brand" size="s" label="Up next" />}
                    </Row>
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {step.estimate}
                    </Text>
                  </Row>

                  {isCurrent && (
                    <>
                      <Text variant="body-default-m" onBackground="neutral-weak">
                        {step.description}
                      </Text>
                      <Row gap="8" wrap>
                        <Button
                          size="s"
                          label="Mark as done"
                          prefixIcon="check"
                          onClick={() => toggleStep(step)}
                        />
                        <Button
                          size="s"
                          variant="secondary"
                          label={step.actionLabel}
                          suffixIcon="arrowUpRight"
                          onClick={() => toggleStep(step)}
                        />
                        <Button
                          size="s"
                          variant="tertiary"
                          label="Skip for now"
                          onClick={() => skipStep(step)}
                        />
                      </Row>
                    </>
                  )}

                  {status === "done" && (
                    <Row>
                      <Button
                        size="s"
                        variant="tertiary"
                        label="Undo"
                        prefixIcon="return"
                        onClick={() => toggleStep(step)}
                        aria-label={`Undo: mark ${step.title} as not done`}
                      />
                    </Row>
                  )}

                  {status === "upcoming" && (
                    <Row>
                      <Button
                        size="s"
                        variant="tertiary"
                        label="Mark as done"
                        prefixIcon="check"
                        onClick={() => toggleStep(step)}
                        aria-label={`Mark ${step.title} as done`}
                      />
                    </Row>
                  )}

                  <VisuallyHidden>
                    {status === "done"
                      ? "Status: completed."
                      : isCurrent
                        ? "Status: current step."
                        : isSkipped
                          ? "Status: skipped, not yet completed."
                          : "Status: not started."}
                  </VisuallyHidden>
                </Column>
              </Row>
            );
          })}
        </Column>

        {/* Live region for screen readers */}
        <VisuallyHidden>
          <div aria-live="polite" aria-atomic="true">
            {announcement}
          </div>
        </VisuallyHidden>
      </Column>
    </Column>
  );
}
