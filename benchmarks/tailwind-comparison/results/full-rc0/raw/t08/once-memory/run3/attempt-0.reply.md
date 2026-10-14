```tsx
"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import { Button, Column, Heading, Row, Text } from "@once-ui-system/core";

type Step = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  minutes: number;
  actionLabel: string;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your workspace profile",
    summary: "Add your team name, logo and time zone.",
    detail:
      "A complete profile helps teammates recognise your workspace in invites and notification emails. Your time zone is used to schedule weekly digests at a sensible hour.",
    minutes: 2,
    actionLabel: "Finish profile",
  },
  {
    id: "invite",
    title: "Invite your first teammates",
    summary: "Bring in at least two people to collaborate with.",
    detail:
      "Invite colleagues by email or share a secure join link. You can assign roles (Admin, Editor, Viewer) now and change them at any time from Settings.",
    minutes: 3,
    actionLabel: "Send invites",
  },
  {
    id: "integration",
    title: "Connect a data source",
    summary: "Link Postgres, Stripe or a CSV upload.",
    detail:
      "Connecting a source lets dashboards populate with live numbers. Credentials are encrypted at rest and you can revoke access whenever you like.",
    minutes: 5,
    actionLabel: "Connect source",
  },
  {
    id: "dashboard",
    title: "Create your first dashboard",
    summary: "Start from a template or build from scratch.",
    detail:
      "Pick the Weekly Revenue template for a ready-made layout, or start with a blank canvas and drag in charts, tables and KPI tiles.",
    minutes: 4,
    actionLabel: "Open dashboard builder",
  },
  {
    id: "alerts",
    title: "Set up a notification rule",
    summary: "Get pinged in Slack or email when a metric moves.",
    detail:
      "Alert rules watch a metric and notify you when it crosses a threshold. Start with a simple one, such as daily signups dropping 20% below average.",
    minutes: 2,
    actionLabel: "Create rule",
  },
];

const CONFETTI_COLORS = ["#f5a524", "#17c964", "#006fee", "#f31260", "#7828c8", "#06b7db"];

const CONFETTI = Array.from({ length: 36 }, (_, i) => {
  const angle = (i / 36) * Math.PI * 2;
  const distance = 90 + ((i * 37) % 80);
  return {
    key: i,
    x: Math.round(Math.cos(angle) * distance * 1.6),
    y: Math.round(Math.sin(angle) * distance - 40),
    rot: (i * 53) % 360,
    delay: (i % 6) * 40,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    round: i % 3 === 0,
  };
});

const STYLES = `
.ob-wrap { width: 100%; max-width: 760px; margin: 0 auto; }
.ob-bar-track {
  position: relative; width: 100%; height: 12px; border-radius: 999px;
  background: var(--neutral-alpha-medium); overflow: hidden;
}
.ob-bar-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, var(--brand-solid-strong), var(--accent-solid-strong));
  transition: width 500ms cubic-bezier(.2,.8,.2,1);
}
.ob-bar-fill[data-done="true"] { background: var(--success-solid-strong, #17c964); }
.ob-step {
  border: 1px solid var(--neutral-alpha-medium);
  border-radius: 16px;
  background: var(--surface-background, transparent);
  transition: border-color 200ms ease, background 200ms ease, transform 200ms ease;
}
.ob-step[data-status="current"] { border-color: var(--brand-solid-strong); }
.ob-step[data-status="done"] { background: var(--neutral-alpha-weak); }
.ob-toggle {
  all: unset; box-sizing: border-box; cursor: pointer; width: 100%;
  display: flex; align-items: center; gap: 14px; padding: 16px;
  border-radius: 16px; text-align: left;
}
.ob-toggle:focus-visible, .ob-check:focus-visible {
  outline: 3px solid var(--brand-solid-strong); outline-offset: 2px;
}
.ob-toggle:hover { background: var(--neutral-alpha-weak); }
.ob-indicator {
  flex: none; width: 32px; height: 32px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 600;
  border: 2px solid var(--neutral-alpha-strong);
  color: var(--neutral-on-background-medium);
  transition: background 250ms ease, border-color 250ms ease, transform 250ms ease;
}
.ob-indicator[data-status="current"] {
  border-color: var(--brand-solid-strong); color: var(--brand-on-background-strong);
}
.ob-indicator[data-status="done"] {
  background: var(--success-solid-strong, #17c964);
  border-color: var(--success-solid-strong, #17c964);
  color: #fff; transform: scale(1.05);
}
.ob-chevron { transition: transform 200ms ease; flex: none; }
.ob-chevron[data-open="true"] { transform: rotate(180deg); }
.ob-panel { padding: 0 16px 16px 62px; }
@media (max-width: 480px) { .ob-panel { padding-left: 16px; } }
.ob-title[data-done="true"] { text-decoration: line-through; opacity: .65; }
.ob-celebrate {
  position: relative; overflow: hidden; text-align: center;
  border-radius: 20px; border: 1px solid var(--success-solid-strong, #17c964);
  background: var(--success-alpha-weak, var(--neutral-alpha-weak));
  padding: 32px 20px;
  animation: ob-pop 500ms cubic-bezier(.2,.9,.3,1.3);
}
.ob-burst { position: absolute; left: 50%; top: 40%; width: 0; height: 0; pointer-events: none; }
.ob-piece {
  position: absolute; width: 10px; height: 14px; opacity: 0;
  animation: ob-fly 1400ms cubic-bezier(.2,.7,.3,1) forwards;
}
@keyframes ob-fly {
  0% { opacity: 1; transform: translate(0,0) rotate(0deg) scale(.6); }
  70% { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--x), calc(var(--y) + 140px)) rotate(var(--r)) scale(1); }
}
@keyframes ob-pop {
  0% { transform: scale(.94); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.ob-trophy { animation: ob-bounce 900ms ease 300ms 2; display: inline-block; }
@keyframes ob-bounce {
  0%,100% { transform: translateY(0); } 40% { transform: translateY(-12px); }
}
.ob-sr {
  position: absolute; width: 1px; height: 1px; overflow: hidden;
  clip: rect(0 0 0 0); white-space: nowrap;
}
@media (prefers-reduced-motion: reduce) {
  .ob-bar-fill, .ob-step, .ob-indicator, .ob-chevron { transition: none; }
  .ob-celebrate, .ob-trophy { animation: none; }
  .ob-burst { display: none; }
}
`;

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function Page() {
  const baseId = useId();
  const [completed, setCompleted] = useState<Set<string>>(() => new Set(["profile"]));
  const [openId, setOpenId] = useState<string | null>("invite");
  const [announcement, setAnnouncement] = useState("");
  const [burstKey, setBurstKey] = useState(0);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const total = STEPS.length;
  const doneCount = completed.size;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  const currentId = useMemo(
    () => STEPS.find((s) => !completed.has(s.id))?.id ?? null,
    [completed],
  );

  const remainingMinutes = useMemo(
    () => STEPS.filter((s) => !completed.has(s.id)).reduce((sum, s) => sum + s.minutes, 0),
    [completed],
  );

  const setStepDone = useCallback(
    (step: Step, done: boolean) => {
      const next = new Set(completed);
      if (done) next.add(step.id);
      else next.delete(step.id);
      setCompleted(next);

      if (done) {
        const nextStep = STEPS.find((s) => !next.has(s.id));
        setOpenId(nextStep ? nextStep.id : null);
        if (next.size === total) {
          setBurstKey((k) => k + 1);
          setAnnouncement("All steps complete. Your workspace is ready!");
        } else {
          setAnnouncement(`${step.title} marked complete. ${next.size} of ${total} steps done.`);
        }
      } else {
        setOpenId(step.id);
        setAnnouncement(`${step.title} marked incomplete. ${next.size} of ${total} steps done.`);
      }
    },
    [completed, total],
  );

  const reset = useCallback(() => {
    setCompleted(new Set());
    setOpenId(STEPS[0].id);
    setAnnouncement("Checklist reset. 0 of 5 steps done.");
  }, []);

  return (
    <Column fillWidth paddingX="m" paddingY="xl" horizontal="center">
      <style>{STYLES}</style>
      <main className="ob-wrap" aria-labelledby={`${baseId}-title`}>
        <Column gap="24" fillWidth>
          <Column gap="8">
            <Text variant="label-default-s" onBackground="brand-weak">
              Getting started
            </Text>
            <Heading as="h1" variant="display-strong-s" id={`${baseId}-title`} ref={headingRef}>
              Set up your Northwind workspace
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Finish these five steps to get live data flowing to your team. It takes about{" "}
              {STEPS.reduce((s, x) => s + x.minutes, 0)} minutes in total.
            </Text>
          </Column>

          <Column
            gap="12"
            padding="20"
            radius="l"
            border="neutral-alpha-medium"
            background="surface"
            fillWidth
          >
            <Row horizontal="between" vertical="center" gap="12" wrap>
              <Text variant="label-strong-m" id={`${baseId}-progress-label`}>
                {allDone ? "All done" : `${doneCount} of ${total} steps complete`}
              </Text>
              <Text variant="label-strong-m" onBackground={allDone ? "success-strong" : "brand-strong"}>
                {percent}%
              </Text>
            </Row>
            <div
              className="ob-bar-track"
              role="progressbar"
              aria-labelledby={`${baseId}-progress-label`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-valuetext={`${doneCount} of ${total} steps complete`}
            >
              <div className="ob-bar-fill" data-done={allDone} style={{ width: `${percent}%` }} />
            </div>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {allDone
                ? "Nice work. Nothing left to do here."
                : `About ${remainingMinutes} min remaining`}
            </Text>
          </Column>

          {allDone && (
            <div className="ob-celebrate" key={burstKey}>
              <div className="ob-burst" aria-hidden="true">
                {CONFETTI.map((c) => (
                  <span
                    key={c.key}
                    className="ob-piece"
                    style={
                      {
                        "--x": `${c.x}px`,
                        "--y": `${c.y}px`,
                        "--r": `${c.rot + 360}deg`,
                        background: c.color,
                        borderRadius: c.round ? "50%" : "2px",
                        animationDelay: `${c.delay}ms`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
              <Column gap="12" horizontal="center">
                <span className="ob-trophy" style={{ fontSize: 48, lineHeight: 1 }} aria-hidden="true">
                  🎉
                </span>
                <Heading as="h2" variant="heading-strong-l">
                  You&apos;re all set!
                </Heading>
                <Text variant="body-default-m" onBackground="neutral-weak" style={{ maxWidth: 420 }}>
                  Your workspace is fully configured. Your team will receive their first weekly digest
                  on Monday morning.
                </Text>
                <Row gap="12" wrap horizontal="center" paddingTop="8">
                  <Button variant="primary" size="m" href="#dashboard">
                    Go to dashboard
                  </Button>
                  <Button variant="secondary" size="m" onClick={reset}>
                    Restart checklist
                  </Button>
                </Row>
              </Column>
            </div>
          )}

          <ol
            style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}
            aria-label="Onboarding steps"
          >
            {STEPS.map((step, index) => {
              const isDone = completed.has(step.id);
              const status = isDone ? "done" : step.id === currentId ? "current" : "todo";
              const isOpen = openId === step.id;
              const panelId = `${baseId}-panel-${step.id}`;
              const btnId = `${baseId}-btn-${step.id}`;
              return (
                <li key={step.id} className="ob-step" data-status={status}>
                  <h2 style={{ margin: 0, font: "inherit" }}>
                    <button
                      id={btnId}
                      type="button"
                      className="ob-toggle"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenId(isOpen ? null : step.id)}
                    >
                      <span className="ob-indicator" data-status={status} aria-hidden="true">
                        {isDone ? <CheckIcon /> : index + 1}
                      </span>
                      <span style={{ flex: 1, minWidth: 0, display: "block" }}>
                        <Text
                          as="span"
                          variant="label-strong-m"
                          className="ob-title"
                          data-done={isDone}
                          style={{ display: "block" }}
                        >
                          {step.title}
                        </Text>
                        <Text
                          as="span"
                          variant="body-default-s"
                          onBackground="neutral-weak"
                          style={{ display: "block", marginTop: 2 }}
                        >
                          {step.summary}
                        </Text>
                      </span>
                      <span className="ob-sr">
                        {isDone ? "Completed." : status === "current" ? "Up next." : "Not started."}
                      </span>
                      <Text
                        as="span"
                        variant="label-default-s"
                        onBackground="neutral-weak"
                        style={{ flex: "none", whiteSpace: "nowrap" }}
                      >
                        {isDone ? "Done" : `${step.minutes} min`}
                      </Text>
                      <span className="ob-chevron" data-open={isOpen}>
                        <ChevronIcon />
                      </span>
                    </button>
                  </h2>
                  {isOpen && (
                    <div id={panelId} role="region" aria-labelledby={btnId} className="ob-panel">
                      <Column gap="16" fillWidth>
                        <Text variant="body-default-m" onBackground="neutral-weak">
                          {step.detail}
                        </Text>
                        <Row gap="12" wrap>
                          {isDone ? (
                            <Button
                              variant="secondary"
                              size="s"
                              onClick={() => setStepDone(step, false)}
                            >
                              Mark as not done
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="s"
                              onClick={() => setStepDone(step, true)}
                            >
                              {step.actionLabel}
                            </Button>
                          )}
                        </Row>
                      </Column>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          {!allDone && doneCount > 0 && (
            <Row horizontal="end">
              <Button variant="tertiary" size="s" onClick={reset}>
                Reset progress
              </Button>
            </Row>
          )}
        </Column>

        <div className="ob-sr" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>
      </main>
    </Column>
  );
}
```