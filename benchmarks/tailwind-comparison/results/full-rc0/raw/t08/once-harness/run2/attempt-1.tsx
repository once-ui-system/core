"use client";

import { useState } from "react";
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
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";

interface Step {
  id: string;
  title: string;
  description: string;
  details: string;
  actionLabel: string;
  icon: IconName;
  minutes: number;
}

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your profile",
    description: "Add your name, role and a short bio so teammates know who you are.",
    details:
      "Your profile appears next to comments, assignments and mentions. Add a role such as “Product designer” and a one-line bio.",
    actionLabel: "Mark profile complete",
    icon: "person",
    minutes: 2,
  },
  {
    id: "workspace",
    title: "Create your first workspace",
    description: "Workspaces group projects, members and billing for a team.",
    details:
      "Name your workspace after your company or team, for example “Northwind Studio”. You can rename it later in settings.",
    actionLabel: "Mark workspace created",
    icon: "organization",
    minutes: 3,
  },
  {
    id: "invite",
    title: "Invite your teammates",
    description: "Projects move faster with at least two people. Send a few invites.",
    details:
      "Invite people by email and choose a role: Admin, Editor or Viewer. Invitations stay valid for 14 days.",
    actionLabel: "Mark invites sent",
    icon: "mail",
    minutes: 2,
  },
  {
    id: "integrations",
    title: "Connect your tools",
    description: "Link calendar, chat and file storage to keep everything in sync.",
    details:
      "Connect Google Calendar to see deadlines in context, and Slack to receive project updates in the channel you choose.",
    actionLabel: "Mark tools connected",
    icon: "link",
    minutes: 4,
  },
  {
    id: "notifications",
    title: "Set notification preferences",
    description: "Choose what is worth an email and what can wait for the daily digest.",
    details:
      "We recommend instant alerts for mentions and assignments, and a daily digest at 9:00 for everything else.",
    actionLabel: "Mark preferences saved",
    icon: "bell",
    minutes: 1,
  },
];

type Status = "complete" | "current" | "upcoming";

const STATUS_LABEL: Record<Status, string> = {
  complete: "Completed",
  current: "Up next",
  upcoming: "Not started",
};

function StepMarker({ status, index, icon }: { status: Status; index: number; icon: IconName }) {
  if (status === "complete") {
    return (
      <Row center width="32" height="32" radius="full" solid="brand-strong" flex={0}>
        <Icon name="check" size="s" onSolid="brand-strong" />
      </Row>
    );
  }
  if (status === "current") {
    return (
      <Row
        center
        width="32"
        height="32"
        radius="full"
        background="brand-alpha-weak"
        border="brand-alpha-strong"
        flex={0}
      >
        <Icon name={icon} size="s" onBackground="brand-strong" />
      </Row>
    );
  }
  return (
    <Row center width="32" height="32" radius="full" background="neutral-alpha-weak" border flex={0}>
      <Text variant="label-strong-s" onBackground="neutral-weak">
        {index + 1}
      </Text>
    </Row>
  );
}

export default function OnboardingPage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(STEPS[0].id);
  const [runId, setRunId] = useState(0);

  const total = STEPS.length;
  const doneCount = completed.length;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  const firstOpen = STEPS.find((s) => !completed.includes(s.id));
  const currentId = firstOpen ? firstOpen.id : null;
  const remainingMinutes = STEPS.filter((s) => !completed.includes(s.id)).reduce(
    (sum, s) => sum + s.minutes,
    0,
  );

  const completeStep = (id: string) => {
    if (completed.includes(id)) return;
    const next = [...completed, id];
    setCompleted(next);
    const following = STEPS.find((s) => !next.includes(s.id));
    setExpandedId(following ? following.id : null);
    if (next.length === STEPS.length) {
      setRunId((n) => n + 1);
    }
  };

  const reopenStep = (id: string) => {
    setCompleted(completed.filter((c) => c !== id));
    setExpandedId(id);
  };

  const reset = () => {
    setCompleted([]);
    setExpandedId(STEPS[0].id);
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="48">
      <Column maxWidth="s" gap="32">
        <Column gap="12">
          <Text variant="label-default-s" onBackground="brand-medium">
            Getting started
          </Text>
          <Heading as="h1" variant="display-strong-s">
            Set up your Fieldnote workspace
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Five short steps to get your team collaborating. It takes about 12 minutes, and you can
            come back to any step later.
          </Text>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="16">
          <Row horizontal="between" vertical="center" gap="12" wrap>
            <Text variant="label-strong-m">Your progress</Text>
            <Tag
              scheme={allDone ? "success" : "brand"}
              size="m"
              label={`${doneCount} of ${total} complete`}
            />
          </Row>
          <ProgressBar value={percent} showLabel={false} />
          <Row horizontal="between" gap="12" wrap>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {percent}% done
            </Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {allDone ? "All steps finished" : `About ${remainingMinutes} min remaining`}
            </Text>
          </Row>
          <div
            role="status"
            aria-live="polite"
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              overflow: "hidden",
              clip: "rect(0 0 0 0)",
              whiteSpace: "nowrap",
            }}
          >
            {allDone
              ? "Onboarding complete. All five steps are finished."
              : `${doneCount} of ${total} steps complete, ${percent} percent.`}
          </div>
        </Column>

        {allDone && (
          <Column
            key={runId}
            background="brand-alpha-weak"
            border="brand-alpha-medium"
            radius="l"
            padding="32"
            gap="16"
            horizontal="center"
            align="center"
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
            >
              <span />
            </CelebrationFx>
            <Row center width="56" height="56" radius="full" solid="brand-strong">
              <Icon name="sparkle" size="l" onSolid="brand-strong" />
            </Row>
            <Heading as="h2" variant="display-strong-xs">
              You&apos;re all set!
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-medium">
              Your workspace is ready. Create your first project and watch your team come together.
            </Text>
            <Row gap="12" horizontal="center" wrap>
              <Button label="Create first project" suffixIcon="arrowRight" onClick={reset} />
              <Button variant="secondary" label="Start over" prefixIcon="refresh" onClick={reset} />
            </Row>
          </Column>
        )}

        <Column as="ol" gap="12" margin="0" padding="0" aria-label="Onboarding steps">
          {STEPS.map((step, index) => {
            const isComplete = completed.includes(step.id);
            const isCurrent = step.id === currentId;
            const status: Status = isComplete ? "complete" : isCurrent ? "current" : "upcoming";
            const isExpanded = expandedId === step.id;
            const panelId = `step-panel-${step.id}`;
            const buttonId = `step-button-${step.id}`;

            return (
              <Column
                as="li"
                key={step.id}
                background="surface"
                border={isCurrent ? "brand-alpha-medium" : "neutral-alpha-weak"}
                radius="l"
                padding="16"
                gap="12"
                style={{ listStyle: "none" }}
              >
                <Row gap="16" vertical="start">
                  <StepMarker status={status} index={index} icon={step.icon} />
                  <Column fillWidth gap="4">
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      onClick={() => toggleExpanded(step.id)}
                      style={{
                        all: "unset",
                        cursor: "pointer",
                        display: "block",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      <Row horizontal="between" vertical="center" gap="12">
                        <Column gap="4" fillWidth>
                          <Text
                            variant="heading-strong-m"
                            onBackground={isComplete ? "neutral-weak" : "neutral-strong"}
                          >
                            <span className="sr-only" style={{ display: "none" }}>
                              {`Step ${index + 1} of ${total}: `}
                            </span>
                            {step.title}
                          </Text>
                          {!isExpanded && (
                            <Text variant="body-default-s" onBackground="neutral-weak">
                              {step.description}
                            </Text>
                          )}
                        </Column>
                        <Tag
                          scheme={
                            status === "complete"
                              ? "success"
                              : status === "current"
                                ? "brand"
                                : "neutral"
                          }
                          size="s"
                          label={STATUS_LABEL[status]}
                        />
                        <Icon
                          name={isExpanded ? "chevronUp" : "chevronDown"}
                          size="s"
                          onBackground="neutral-weak"
                        />
                      </Row>
                    </button>

                    {isExpanded && (
                      <Column id={panelId} role="region" aria-labelledby={buttonId} gap="16" paddingTop="8">
                        <Text variant="body-default-m" onBackground="neutral-medium">
                          {step.details}
                        </Text>
                        <Row gap="12" vertical="center" wrap>
                          {isComplete ? (
                            <Button
                              variant="secondary"
                              size="s"
                              label="Mark as not done"
                              prefixIcon="return"
                              onClick={() => reopenStep(step.id)}
                            />
                          ) : (
                            <Button
                              size="s"
                              label={step.actionLabel}
                              prefixIcon="check"
                              onClick={() => completeStep(step.id)}
                            />
                          )}
                          <Row gap="4" vertical="center">
                            <Icon name="time" size="xs" onBackground="neutral-weak" />
                            <Text variant="label-default-s" onBackground="neutral-weak">
                              {step.minutes} min
                            </Text>
                          </Row>
                        </Row>
                      </Column>
                    )}
                  </Column>
                </Row>
              </Column>
            );
          })}
        </Column>
      </Column>
    </Column>
  );
}
