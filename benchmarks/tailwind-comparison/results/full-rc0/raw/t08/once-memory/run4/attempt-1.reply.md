```tsx
"use client";

import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { Button, Column, Flex, Heading, Icon, Row, Text } from "@once-ui-system/core";

type Step = {
  id: string;
  title: string;
  description: string;
  detail: string;
  minutes: number;
  actionLabel: string;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your profile",
    description: "Add your name, role and a photo so teammates recognise you.",
    detail:
      "Head to Settings → Profile and fill in your display name and job title. Profiles with a photo get 3× more replies on shared boards.",
    minutes: 2,
    actionLabel: "Edit profile",
  },
  {
    id: "workspace",
    title: "Create your first workspace",
    description: "Workspaces keep projects, files and conversations in one place.",
    detail:
      "Pick a name like “Product Design” or “Q3 Launch”. You can rename it later and archive it when the work is done.",
    minutes: 3,
    actionLabel: "Create workspace",
  },
  {
    id: "invite",
    title: "Invite two teammates",
    description: "Collaboration is better together — send invites by email or link.",
    detail:
      "Paste email addresses separated by commas, or copy the invite link. New members join with Editor access by default.",
    minutes: 2,
    actionLabel: "Send invites",
  },
  {
    id: "integration",
    title: "Connect an integration",
    description: "Sync Slack, GitHub or Google Drive to bring your tools along.",
    detail:
      "Open Integrations and authorise one service. We only request read access until you choose to enable two-way sync.",
    minutes: 4,
    actionLabel: "Browse integrations",
  },
  {
    id: "notifications",
    title: "Set notification preferences",
    description: "Choose what reaches your inbox and what stays in the app.",
    detail:
      "We recommend a daily digest for activity and instant alerts for @mentions. Quiet hours can be configured too.",
    minutes: 1,
    actionLabel: "Open preferences",
  },
];

const CONFETTI_COLORS = [
  "var(--brand-solid-strong)",
  "var(--accent-solid-strong)",
  "var(--success-solid-strong)",
  "var(--warning-solid-strong)",
  "var(--danger-solid-strong)",
];

const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${((i * 13) % 10) / 10}s`,
  duration: `${2.2 + ((i * 7) % 10) / 8}s`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 6 + (i % 4) * 2,
  rotate: (i * 47) % 360,
}));

const STYLES = `
@keyframes ob-fall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(340px) rotate(540deg); opacity: 0; }
}
@keyframes ob-pop {
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.12); opacity: 1; }
  100% { transform: scale(1); }
}
.ob-confetti { position: absolute; top: 0; border-radius: 2px; animation-name: ob-fall; animation-timing-function: ease-in; animation-fill-mode: forwards; pointer-events: none; }
.ob-pop { animation: ob-pop 0.5s ease-out both; }
.ob-fill { transition: width 0.5s ease; }
.ob-step-btn { cursor: pointer; background: transparent; border: 0; padding: 0; font: inherit; color: inherit; text-align: left; width: 100%; border-radius: 12px; }
.ob-step-btn:focus-visible, .ob-check:focus-visible { outline: 2px solid var(--brand-solid-strong); outline-offset: 2px; }
.ob-check { cursor: pointer; background: transparent; border: 0; padding: 0; border-radius: 999px; display: inline-flex; flex-shrink: 0; }
@media (prefers-reduced-motion: reduce) {
  .ob-confetti, .ob-pop { animation: none; }
  .ob-confetti { display: none; }
  .ob-fill { transition: none; }
}
`;

function StatusIndicator({ done, current }: { done: boolean; current: boolean }) {
  if (done) {
    return (
      <Flex
        center
        radius="full"
        background="success-strong"
        style={{ width: 32, height: 32, flexShrink: 0 }}
        aria-hidden="true"
      >
        <Icon name="check" size="s" onBackground="neutral-strong" />
      </Flex>
    );
  }
  return (
    <div
      aria-hidden="true"
      style={{
        width: 32,
        height: 32,
        flexShrink: 0,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `2px solid ${current ? "var(--brand-solid-strong)" : "var(--neutral-alpha-strong)"}`,
        background: current ? "var(--brand-alpha-weak)" : "transparent",
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          display: "block",
          background: current ? "var(--brand-solid-strong)" : "var(--neutral-alpha-medium)",
        }}
      />
    </div>
  );
}

export default function Page() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({ profile: true });
  const [expanded, setExpanded] = useState<string | null>("workspace");
  const [announcement, setAnnouncement] = useState("");

  const doneCount = useMemo(() => STEPS.filter((s) => completed[s.id]).length, [completed]);
  const total = STEPS.length;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;
  const currentId = STEPS.find((s) => !completed[s.id])?.id ?? null;
  const remainingMinutes = STEPS.filter((s) => !completed[s.id]).reduce((n, s) => n + s.minutes, 0);

  const toggle = (step: Step) => {
    const next = !completed[step.id];
    const nextDone = doneCount + (next ? 1 : -1);
    setCompleted((prev) => ({ ...prev, [step.id]: next }));
    setAnnouncement(
      nextDone === total
        ? "All steps complete. Onboarding finished!"
        : `${step.title} marked ${next ? "complete" : "incomplete"}. ${nextDone} of ${total} steps done.`,
    );
    if (next) {
      const upcoming = STEPS.find((s) => s.id !== step.id && !completed[s.id]);
      setExpanded(upcoming ? upcoming.id : null);
    }
  };

  const reset = () => {
    setCompleted({});
    setExpanded(STEPS[0].id);
    setAnnouncement("Checklist reset. 0 of 5 steps done.");
  };

  return (
    <Column fillWidth horizontal="center" paddingX="m" paddingY="xl" gap="l">
      <style>{STYLES}</style>

      <Column as="main" fillWidth maxWidth={40} gap="l">
        <Column gap="8" as="header">
          <Text variant="label-default-s" onBackground="brand-weak">
            Welcome to Northwind
          </Text>
          <Heading as="h1" variant="display-strong-s" wrap="balance">
            Get set up in under 15 minutes
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Finish these five steps to unlock your workspace. Your progress is saved as you go.
          </Text>
        </Column>

        <Column
          background="surface"
          border="neutral-alpha-medium"
          radius="l"
          padding="l"
          gap="12"
          style={{ position: "relative", overflow: "hidden" }}
        >
          <Row horizontal="between" vertical="end" gap="8" wrap>
            <Column gap="4">
              <Text id="ob-progress-label" variant="label-strong-m" onBackground="neutral-strong">
                Your progress
              </Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {allDone ? "Everything is done" : `About ${remainingMinutes} min remaining`}
              </Text>
            </Column>
            <Text variant="heading-strong-l" onBackground="neutral-strong">
              {doneCount} / {total}
            </Text>
          </Row>

          <div
            role="progressbar"
            aria-labelledby="ob-progress-label"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${doneCount} of ${total} steps complete`}
            style={{
              height: 10,
              width: "100%",
              borderRadius: 999,
              background: "var(--neutral-alpha-medium)",
              overflow: "hidden",
            }}
          >
            <div
              className="ob-fill"
              style={{
                height: "100%",
                width: `${percent}%`,
                borderRadius: 999,
                background: allDone ? "var(--success-solid-strong)" : "var(--brand-solid-strong)",
              }}
            />
          </div>
        </Column>

        {allDone && (
          <Column
            className="ob-pop"
            background="success-alpha-weak"
            border="success-alpha-medium"
            radius="l"
            padding="xl"
            gap="12"
            horizontal="center"
            style={{ position: "relative", overflow: "hidden", textAlign: "center" }}
          >
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              {CONFETTI.map((c, i) => (
                <span
                  key={i}
                  className="ob-confetti"
                  style={{
                    left: c.left,
                    width: c.size,
                    height: c.size * 1.6,
                    background: c.color,
                    animationDelay: c.delay,
                    animationDuration: c.duration,
                    rotate: `${c.rotate}deg`,
                  }}
                />
              ))}
            </div>
            <Flex
              center
              radius="full"
              background="success-strong"
              style={{ width: 56, height: 56, position: "relative" }}
              aria-hidden="true"
            >
              <Icon name="check" size="l" onBackground="neutral-strong" />
            </Flex>
            <Heading as="h2" variant="heading-strong-xl" style={{ position: "relative" }}>
              You&apos;re all set — nice work!
            </Heading>
            <Text
              variant="body-default-m"
              onBackground="neutral-weak"
              wrap="balance"
              style={{ position: "relative" }}
            >
              Your workspace is ready, your team is invited and your tools are connected. Time to
              start building something great.
            </Text>
            <Row gap="8" wrap horizontal="center" style={{ position: "relative" }}>
              <Button
                variant="primary"
                size="m"
                onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
              >
                Go to dashboard
              </Button>
              <Button variant="tertiary" size="m" onClick={reset}>
                Reset checklist
              </Button>
            </Row>
          </Column>
        )}

        <Column as="section" aria-labelledby="ob-steps-heading" gap="12">
          <Heading as="h2" id="ob-steps-heading" variant="heading-strong-m">
            Setup steps
          </Heading>

          <Column as="ol" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
            {STEPS.map((step, index) => {
              const done = !!completed[step.id];
              const current = step.id === currentId;
              const open = expanded === step.id;
              const panelId = `ob-panel-${step.id}`;
              return (
                <li key={step.id}>
                  <Column
                    background={current ? "surface" : "transparent"}
                    border={current ? "brand-alpha-medium" : "neutral-alpha-weak"}
                    radius="l"
                    padding="12"
                    gap="12"
                  >
                    <Row gap="12" vertical="center">
                      <button
                        type="button"
                        className="ob-check"
                        role="checkbox"
                        aria-checked={done}
                        aria-label={`Mark “${step.title}” as ${done ? "incomplete" : "complete"}`}
                        onClick={() => toggle(step)}
                      >
                        <StatusIndicator done={done} current={current} />
                      </button>

                      <button
                        type="button"
                        className="ob-step-btn"
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => setExpanded(open ? null : step.id)}
                      >
                        <Row gap="12" vertical="center" horizontal="between">
                          <Column gap="2" flex={1} minWidth={0}>
                            <Text variant="label-default-xs" onBackground="neutral-weak">
                              Step {index + 1} · {step.minutes} min
                              {done ? " · Completed" : current ? " · Up next" : ""}
                            </Text>
                            <Text
                              variant="heading-strong-s"
                              onBackground={done ? "neutral-weak" : "neutral-strong"}
                              style={done ? { textDecoration: "line-through" } : undefined}
                            >
                              {step.title}
                            </Text>
                          </Column>
                          <Icon
                            name={open ? "chevronUp" : "chevronDown"}
                            size="s"
                            onBackground="neutral-weak"
                          />
                        </Row>
                      </button>
                    </Row>

                    {open && (
                      <Column
                        id={panelId}
                        role="region"
                        aria-label={`${step.title} details`}
                        gap="12"
                        paddingLeft="48"
                      >
                        <Text variant="body-default-m" onBackground="neutral-strong">
                          {step.description}
                        </Text>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {step.detail}
                        </Text>
                        <Row gap="8" wrap>
                          <Button
                            variant={done ? "secondary" : "primary"}
                            size="s"
                            onClick={() => toggle(step)}
                          >
                            {done ? "Mark as not done" : "Mark as done"}
                          </Button>
                          <Button variant="tertiary" size="s" onClick={() => undefined}>
                            {step.actionLabel}
                          </Button>
                        </Row>
                      </Column>
                    )}
                  </Column>
                </li>
              );
            })}
          </Column>
        </Column>

        {!allDone && doneCount > 0 && (
          <Row horizontal="center">
            <Button variant="tertiary" size="s" onClick={reset}>
              Reset checklist
            </Button>
          </Row>
        )}
      </Column>

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
        {announcement}
      </div>
    </Column>
  );
}
```