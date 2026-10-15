"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  Avatar,
  Button,
  Column,
  Heading,
  Icon,
  Line,
  Row,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";

type Stat = { label: string; value: string };
type MenuAction = { id: string; label: string; icon: IconName; hint?: string; danger?: boolean };

const PROFILE = {
  name: "Maya Okonkwo",
  handle: "@maya.okonkwo",
  role: "Staff Product Designer",
  email: "maya.okonkwo@northfield.studio",
  initials: "Maya Okonkwo",
  plan: "Team plan",
  bio: "Designing the Northfield review workflow. Previously at a payments startup. Coffee, type specimens, and long walks.",
  location: "Lisbon, Portugal",
  joined: "Joined March 2022",
};

const STATS: Stat[] = [
  { label: "Projects", value: "24" },
  { label: "Reviews", value: "318" },
  { label: "Followers", value: "1.2k" },
];

const ACTIONS: MenuAction[] = [
  { id: "profile", label: "View profile", icon: "person" },
  { id: "settings", label: "Account settings", icon: "settings", hint: "G S" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "billing", label: "Billing and plan", icon: "payment" },
  { id: "help", label: "Help center", icon: "help" },
];

const TEAMMATE = {
  name: "Tomás Ferreira",
  handle: "@tomas.f",
  role: "Engineering Lead",
  bio: "Owns the review pipeline and the design-system release train.",
  stats: [
    { label: "Commits", value: "4.8k" },
    { label: "Reviews", value: "902" },
  ] as Stat[],
};

const ACTIVITY = [
  { id: "a1", icon: "check" as IconName, text: "Approved the onboarding flow v3", time: "12 min ago" },
  { id: "a2", icon: "chat" as IconName, text: "Commented on Checkout redesign", time: "1 hr ago" },
  { id: "a3", icon: "edit" as IconName, text: "Updated the spacing tokens doc", time: "Yesterday" },
];

function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <Row fillWidth gap="8" role="list" aria-label="Profile statistics">
      {stats.map((stat) => (
        <Column
          key={stat.label}
          flex={1}
          role="listitem"
          horizontal="center"
          gap="4"
          paddingY="12"
          paddingX="8"
          radius="m"
          background="neutral-alpha-weak"
        >
          <Text variant="heading-strong-m">{stat.value}</Text>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {stat.label}
          </Text>
        </Column>
      ))}
    </Row>
  );
}

function ProfilePopover() {
  const [open, setOpen] = useState(false);
  const [following, setFollowing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const titleId = useId();
  const { addToast } = useToast();

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && event.target instanceof Node && !rootRef.current.contains(event.target)) {
        close(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close(true);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    const firstFocusable = panelRef.current?.querySelector<HTMLElement>("button, a[href]");
    firstFocusable?.focus();

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  // Keep Tab focus inside the popover while open (dialog semantics).
  const onPanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;
    const items = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]"),
    );
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  // Arrow-key navigation across the action list.
  const onListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-menu-action]"),
    );
    const index = buttons.findIndex((b) => b === document.activeElement);
    if (index === -1) return;
    event.preventDefault();
    const next = event.key === "ArrowDown" ? (index + 1) % buttons.length : (index - 1 + buttons.length) % buttons.length;
    buttons[next].focus();
  };

  const runAction = (action: MenuAction) => {
    close(true);
    addToast({ variant: "success", message: `${action.label} (demo action)` });
  };

  return (
    <div ref={rootRef} style={{ position: "relative", display: "inline-flex" }}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={`Open profile menu for ${PROFILE.name}`}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          all: "unset",
          cursor: "pointer",
          borderRadius: "9999px",
          display: "inline-flex",
          padding: 2,
          outline: open ? "2px solid var(--brand-solid-strong)" : "none",
          outlineOffset: 2,
        }}
        onFocus={(e) => {
          if (e.currentTarget.matches(":focus-visible")) {
            e.currentTarget.style.outline = "2px solid var(--brand-solid-strong)";
          }
        }}
        onBlur={(e) => {
          if (!open) e.currentTarget.style.outline = "none";
        }}
      >
        <Avatar
          value="MO"
          size="m"
          statusIndicator={{ color: "green" }}
        />
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          onKeyDown={onPanelKeyDown}
          style={{
            position: "absolute",
            top: "calc(100% + 12px)",
            right: 0,
            width: "min(360px, calc(100vw - 32px))",
            zIndex: 10,
          }}
        >
          <Column
            background="surface"
            border="neutral-alpha-medium"
            radius="l"
            shadow="l"
            padding="16"
            gap="16"
            fillWidth
          >
            <Row gap="12" vertical="center">
              <Avatar value="MO" size="l" statusIndicator={{ color: "green" }} />
              <Column gap="2" flex={1}>
                <Text id={titleId} variant="heading-strong-m" truncate>
                  {PROFILE.name}
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak" truncate>
                  {PROFILE.email}
                </Text>
              </Column>
              <Tag size="s" scheme="brand" label={PROFILE.plan} />
            </Row>

            <StatsRow stats={STATS} />

            <Line />

            <Column gap="2" role="group" aria-label="Account actions" onKeyDown={onListKeyDown}>
              {ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  data-menu-action
                  onClick={() => runAction(action)}
                  className="profile-menu-action"
                  style={{
                    all: "unset",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: "var(--neutral-on-background-strong)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-alpha-weak)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onFocus={(e) => (e.currentTarget.style.background = "var(--neutral-alpha-weak)")}
                  onBlur={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <Icon name={action.icon} size="s" onBackground="neutral-weak" />
                  <Text variant="label-default-m" style={{ flex: 1 }}>
                    {action.label}
                  </Text>
                  {action.hint && (
                    <Text variant="label-default-xs" onBackground="neutral-weak">
                      {action.hint}
                    </Text>
                  )}
                </button>
              ))}
            </Column>

            <Line />

            <Row gap="8">
              <Button
                variant="secondary"
                size="m"
                prefixIcon="edit"
                label="Edit profile"
                fillWidth
                onClick={() => runAction({ id: "edit", label: "Edit profile", icon: "edit" })}
              />
              <Button
                variant="tertiary"
                size="m"
                prefixIcon="logout"
                label="Sign out"
                fillWidth
                onClick={() => runAction({ id: "signout", label: "Sign out", icon: "logout", danger: true })}
              />
            </Row>
          </Column>
        </div>
      )}
    </div>
  );
}

function TeammateMention() {
  const [open, setOpen] = useState(false);
  const [following, setFollowing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardId = useId();

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), 150);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <span
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-describedby={open ? cardId : undefined}
        aria-expanded={open}
        onClick={() => setOpen((p) => !p)}
        style={{
          all: "unset",
          cursor: "pointer",
          color: "var(--brand-on-background-strong)",
          fontWeight: 600,
          textDecoration: "underline",
          textDecorationStyle: "dotted",
          textUnderlineOffset: 3,
          borderRadius: 4,
        }}
      >
        {TEAMMATE.handle}
      </button>

      {open && (
        <span
          id={cardId}
          role="tooltip"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            width: "min(300px, calc(100vw - 48px))",
            zIndex: 10,
            display: "block",
          }}
        >
          <Column
            background="surface"
            border="neutral-alpha-medium"
            radius="l"
            shadow="m"
            padding="16"
            gap="12"
            fillWidth
          >
            <Row gap="12" vertical="center">
              <Avatar value="TF" size="l" />
              <Column gap="2" flex={1}>
                <Text variant="heading-strong-s" truncate>
                  {TEAMMATE.name}
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak" truncate>
                  {TEAMMATE.role}
                </Text>
              </Column>
            </Row>
            <Text variant="body-default-s" onBackground="neutral-medium">
              {TEAMMATE.bio}
            </Text>
            <StatsRow stats={TEAMMATE.stats} />
            <Button
              variant={following ? "secondary" : "primary"}
              size="s"
              fillWidth
              prefixIcon={following ? "check" : "plus"}
              label={following ? "Following" : "Follow"}
              onClick={() => setFollowing((p) => !p)}
            />
          </Column>
        </span>
      )}
    </span>
  );
}

export default function Page() {
  return (
    <Column as="main" fillWidth horizontal="center" minHeight="100vh">
      <Column
        as="header"
        fillWidth
        borderBottom="neutral-alpha-weak"
        background="surface"
        horizontal="center"
        paddingX="16"
        paddingY="12"
      >
        <Row fillWidth maxWidth="l" vertical="center" horizontal="between" gap="16">
          <Row gap="12" vertical="center">
            <Icon name="organization" size="m" onBackground="brand-medium" />
            <Text variant="heading-strong-m">Northfield</Text>
          </Row>
          <Row gap="8" vertical="center">
            <Text variant="label-default-s" onBackground="neutral-weak" hide>
              {PROFILE.name}
            </Text>
            <ProfilePopover />
          </Row>
        </Row>
      </Column>

      <Column maxWidth="m" fillWidth paddingX="16" paddingY="40" gap="32">
        <Column gap="8">
          <Text variant="label-default-s" onBackground="brand-medium">
            Review workspace
          </Text>
          <Heading variant="display-strong-s" as="h1">
            Good morning, Maya
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Select your avatar in the top right to open your profile menu, or hover a teammate's handle below to preview
            their card.
          </Text>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="16">
          <Row horizontal="between" vertical="center" gap="12" wrap>
            <Heading variant="heading-strong-l" as="h2">
              Recent activity
            </Heading>
            <Tag size="s" label="Last 24 hours" prefixIcon="time" />
          </Row>

          <Column gap="16" as="ul" margin="0" padding="0" style={{ listStyle: "none" }}>
            {ACTIVITY.map((item) => (
              <Row as="li" key={item.id} gap="12" vertical="center">
                <Row
                  center
                  width={40}
                  height={40}
                  radius="full"
                  background="neutral-alpha-weak"
                  style={{ flexShrink: 0 }}
                >
                  <Icon name={item.icon} size="s" onBackground="neutral-medium" />
                </Row>
                <Column flex={1} gap="2">
                  <Text variant="body-default-m">{item.text}</Text>
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {item.time}
                  </Text>
                </Column>
              </Row>
            ))}
          </Column>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="12">
          <Heading variant="heading-strong-l" as="h2">
            Review thread
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-medium" style={{ lineHeight: 1.8 }}>
            Thanks for the quick pass on the new checkout. <TeammateMention /> flagged the focus order on the payment
            step, and I agree it needs another look before we ship. I'll fold the spacing fixes into the next token
            release.
          </Text>
          <Row gap="8" vertical="center" wrap>
            <Icon name="calendar" size="xs" onBackground="neutral-weak" />
            <Text variant="label-default-s" onBackground="neutral-weak">
              {PROFILE.joined} · {PROFILE.location}
            </Text>
          </Row>
        </Column>
      </Column>
    </Column>
  );
}
