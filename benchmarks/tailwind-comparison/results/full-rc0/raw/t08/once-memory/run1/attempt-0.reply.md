```tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { Button, Column, Flex, Heading, Icon, Row, Text } from "@once-ui-system/core";

type Step = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  estimate: string;
  actionLabel: string;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your workspace profile",
    summary: "Add your team name, logo and time zone.",
    detail:
      "Your workspace name appears in invites, email notifications and shared links. Pick the time zone your team works in so scheduled reports arrive at the right hour.",
    estimate: "2 min",
    actionLabel: "Open profile settings",
  },
  {
    id: "invite",
    title: "Invite your first teammates",
    summary: "Bring in at least two people to collaborate.",
    detail:
      "Invite colleagues by email or share an invite link. Admins can manage billing and permissions, while members can create and edit projects.",
    estimate: "3 min",
    actionLabel: "Send invites",
  },
  {
    id: "source",
    title: "Connect a data source",
    summary: "Link Postgres, BigQuery or upload a CSV.",
    detail:
      "Connections are read-only by default and credentials are encrypted at rest. You can start with a sample CSV and switch to a live source later.",
    estimate: "5 min",
    actionLabel: "Add a connection",
  },
  {
    id: "dashboard",
    title: "Build your first dashboard",
    summary: "Start from a template or an empty canvas.",
    detail:
      "Templates for product analytics, revenue and support health are ready to use. Drag in charts, then pin the dashboard to your sidebar for quick access.",
    estimate: "6 min",
    actionLabel: "Browse templates",
  },
  {
    id: "alerts",
    title: "Set up a weekly digest",
    summary: "Get key metrics in your inbox every Monday.",
    detail:
      "Choose which metrics to include and who receives the digest. You can pause or edit the schedule at any time from notification settings.",
    estimate: "2 min",
    actionLabel: "Schedule digest",
  },
];

const CONFETTI_COLORS = ["#f5b700", "#ef476f", "#06d6a0", "#118ab2", "#9b5de5", "#ff7b00"];

const CONFETTI = Array.from({ length: 36 }, (_, i) => ({
  left: `${(i * 97) % 100}%`,
  delay: `${((i * 53) % 100) / 100}s`,
  duration: `${2.4 + ((i * 37) % 18) / 10}s`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  rotate: `${(i * 47) % 360}deg`,
  size: 6 + (i % 4) * 2,
}));

const STYLES = `
.ob-bar-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: var(--neutral-alpha-medium);
  overflow: hidden;
}
.ob-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--brand-solid-strong);
  transition: width 500ms ease;
}
.ob-bar-fill[data-done="true"] {
  background: var(--success-solid-strong);
}
.ob-indicator {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--neutral-alpha-strong);
  color: var(--neutral-on-background-weak);
  font-size: 12px;
  font-weight: 600;
  transition: background 250ms ease, border-color 250ms ease, transform 250ms ease;
}
.ob-indicator[data-state="current"] {
  border-color: var(--brand-solid-strong);
  color: var(--brand-on-background-strong);
}
.ob-indicator[data-state="done"] {
  background: var(--success-solid-strong);
  border-color: var(--success-solid-strong);
  color: #fff;
  transform: scale(1.05);
}
.ob-row-toggle {
  all: unset;
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 4px 0;
  border-radius: 8px;
}
.ob-row-toggle:focus-visible {
  outline: 2px solid var(--brand-solid-strong);
  outline-offset: 4px;
}
.ob-title-done {
  text-decoration: line-through;
  opacity: 0.7;
}
.ob-confetti-wrap {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.ob-confetti {
  position: absolute;
  top: -16px;
  border-radius: 2px;
  opacity: 0;
  animation-name: ob-fall;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  animation-iteration-count: 2;
}
@keyframes ob-fall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(420px) rotate(540deg); opacity: 0; }
}
@keyframes ob-pop {
  0% { transform: scale(0.6); opacity: 0; }
  70% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.ob-trophy {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--success-solid-strong);
  color: #fff;
  animation: ob-pop 600ms ease-out both;
}
@media (prefers-reduced-motion: reduce) {
  .ob-confetti { display: none; }
  .ob-trophy { animation: none; }
  .ob-bar-fill, .ob-indicator { transition: none; }
}
`;

export default function Page() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [openId, setOpenId] = useState<string | null>(STEPS[0].id);

  const completedCount = useMemo(() => STEPS.filter((s) => done[s.id]).length, [done]);
  const total = STEPS.length;
  const percent = Math.round((completedCount / total) * 100);
  const allDone = completedCount === total;
  const currentId = STEPS.find((s) => !done[s.id])?.id ?? null;

  const toggleDone = useCallback((id: string) => {
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const completeAndAdvance = useCallback((id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: true };
      const upcoming = STEPS.find((s) => !next[s.id]);
      setOpenId(upcoming ? upcoming.id : null);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setDone({});
    setOpenId(STEPS[0].id);
  }, []);

  return (
    <Flex fillWidth horizontal="center" paddingX="16" paddingY="32">
      <style>{STYLES}</style>
      <Column
        as="main"
        fillWidth
        maxWidth={40}
        gap="24"
      >
        <Column gap="8">
          <Text variant="label-default-s" onBackground="neutral-weak">
            Getting started
          </Text>
          <Heading as="h1" variant="display-strong-s">
            Welcome to Northwind Analytics
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Finish these five steps to get your team up and running. It takes about 18 minutes, and
            your progress is saved as you go.
          </Text>
        </Column>

        <Column
          fillWidth
          gap="12"
          padding="20"
          radius="l"
          border="neutral-alpha-medium"
          background="surface"
        >
          <Row fillWidth horizontal="between" vertical="center" gap="12">
            <Text id="ob-progress-label" variant="label-strong-m">
              {allDone ? "All steps complete" : `${completedCount} of ${total} steps complete`}
            </Text>
            <Text variant="label-strong-m" onBackground={allDone ? "success-strong" : "brand-strong"}>
              {percent}%
            </Text>
          </Row>
          <div
            className="ob-bar-track"
            role="progressbar"
            aria-labelledby="ob-progress-label"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div className="ob-bar-fill" data-done={allDone} style={{ width: `${percent}%` }} />
          </div>
        </Column>

        {allDone ? (
          <Column
            fillWidth
            horizontal="center"
            gap="16"
            padding="32"
            radius="l"
            border="success-alpha-strong"
            background="success-alpha-weak"
            position="relative"
            style={{ position: "relative", overflow: "hidden", textAlign: "center" }}
          >
            <div className="ob-confetti-wrap" aria-hidden="true">
              {CONFETTI.map((c, i) => (
                <span
                  key={i}
                  className="ob-confetti"
                  style={{
                    left: c.left,
                    width: c.size,
                    height: c.size * 1.6,
                    background: c.color,
                    rotate: c.rotate,
                    animationDelay: c.delay,
                    animationDuration: c.duration,
                  }}
                />
              ))}
            </div>
            <span className="ob-trophy" aria-hidden="true">
              <Icon name="check" size="l" />
            </span>
            <div role="status" aria-live="polite">
              <Column gap="8" horizontal="center">
                <Heading as="h2" variant="heading-strong-xl">
                  You&apos;re all set!
                </Heading>
                <Text variant="body-default-m" onBackground="neutral-weak">
                  Your workspace is ready. Your team can now explore dashboards, share insights and
                  get the Monday digest.
                </Text>
              </Column>
            </div>
            <Row gap="12" wrap horizontal="center">
              <Button variant="primary" size="m" href="#">
                Go to dashboard
              </Button>
              <Button variant="secondary" size="m" prefixIcon="refresh" onClick={reset}>
                Restart checklist
              </Button>
            </Row>
          </Column>
        ) : null}

        <Column as="section" gap="12" fillWidth aria-labelledby="ob-steps-heading">
          <Heading as="h2" variant="heading-strong-m" id="ob-steps-heading">
            Your checklist
          </Heading>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {STEPS.map((step, index) => {
              const isDone = !!done[step.id];
              const isCurrent = step.id === currentId;
              const isOpen = openId === step.id;
              const state = isDone ? "done" : isCurrent ? "current" : "todo";
              const panelId = `ob-panel-${step.id}`;
              const buttonId = `ob-button-${step.id}`;

              return (
                <li key={step.id}>
                  <Column
                    fillWidth
                    padding="16"
                    gap="12"
                    radius="l"
                    border={isCurrent ? "brand-alpha-strong" : "neutral-alpha-medium"}
                    background="surface"
                  >
                    <Row fillWidth vertical="center" gap="12">
                      <button
                        type="button"
                        id={buttonId}
                        className="ob-row-toggle"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenId(isOpen ? null : step.id)}
                      >
                        <span className="ob-indicator" data-state={state} aria-hidden="true">
                          {isDone ? <Icon name="check" size="xs" /> : index + 1}
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                          <span className={isDone ? "ob-title-done" : undefined}>
                            <Text variant="label-strong-m" onBackground="neutral-strong">
                              {step.title}
                            </Text>
                          </span>
                          <Text variant="body-default-s" onBackground="neutral-weak">
                            {step.summary}
                          </Text>
                        </span>
                        <span style={{ flexShrink: 0, display: "inline-flex" }}>
                          <Icon name={isOpen ? "chevronUp" : "chevronDown"} size="s" onBackground="neutral-weak" />
                        </span>
                      </button>
                    </Row>

                    <span
                      style={{
                        position: "absolute",
                        width: 1,
                        height: 1,
                        overflow: "hidden",
                        clip: "rect(0 0 0 0)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Status: {isDone ? "completed" : isCurrent ? "up next" : "not started"}
                    </span>

                    {isOpen ? (
                      <div id={panelId} role="region" aria-labelledby={buttonId}>
                        <Column gap="12" paddingLeft="40">
                          <Text variant="body-default-m" onBackground="neutral-weak">
                            {step.detail}
                          </Text>
                          <Text variant="label-default-s" onBackground="neutral-weak">
                            Estimated time: {step.estimate}
                          </Text>
                          <Row gap="8" wrap>
                            {isDone ? (
                              <Button variant="tertiary" size="s" onClick={() => toggleDone(step.id)}>
                                Mark as not done
                              </Button>
                            ) : (
                              <>
                                <Button variant="secondary" size="s" href="#">
                                  {step.actionLabel}
                                </Button>
                                <Button variant="primary" size="s" onClick={() => completeAndAdvance(step.id)}>
                                  Mark as done
                                </Button>
                              </>
                            )}
                          </Row>
                        </Column>
                      </div>
                    ) : null}
                  </Column>
                </li>
              );
            })}
          </ol>
        </Column>

        {!allDone && completedCount > 0 ? (
          <Row horizontal="end">
            <Button variant="tertiary" size="s" prefixIcon="refresh" onClick={reset}>
              Reset progress
            </Button>
          </Row>
        ) : null}
      </Column>
    </Flex>
  );
}
```