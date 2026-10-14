"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Column, Row, Text, Heading, Line } from "@once-ui-system/core";

type Stat = { label: string; value: string };
type MenuItem = { id: string; label: string; hint?: string; danger?: boolean };

const USER = {
  name: "Maya Okonkwo",
  handle: "@mayaok",
  initials: "MO",
  role: "Staff Product Designer",
  location: "Lisbon, Portugal",
  bio: "Designing calm, fast interfaces for logistics teams. Currently untangling our onboarding flow.",
  status: "Available for reviews",
};

const STATS: Stat[] = [
  { label: "Projects", value: "42" },
  { label: "Followers", value: "1.8k" },
  { label: "Reviews", value: "317" },
];

const ITEMS: MenuItem[] = [
  { id: "profile", label: "View profile", hint: "G P" },
  { id: "settings", label: "Account settings", hint: "G S" },
  { id: "billing", label: "Billing & plans" },
  { id: "invite", label: "Invite teammates" },
  { id: "signout", label: "Sign out", danger: true },
];

const HOVER_OPEN_DELAY = 150;
const HOVER_CLOSE_DELAY = 200;

export default function Page() {
  const [open, setOpen] = useState(false);
  const [following, setFollowing] = useState(false);
  const [lastAction, setLastAction] = useState<string>("No action yet");
  const [activeIndex, setActiveIndex] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panelId = useId();
  const triggerId = useId();

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const close = useCallback((returnFocus: boolean) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setOpen(false);
    setActiveIndex(-1);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const scheduleOpen = () => {
    clearTimer();
    timer.current = setTimeout(() => setOpen(true), HOVER_OPEN_DELAY);
  };

  const scheduleClose = () => {
    clearTimer();
    timer.current = setTimeout(() => {
      setOpen(false);
      setActiveIndex(-1);
    }, HOVER_CLOSE_DELAY);
  };

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  // Outside click + Escape
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Move focus to the active item
  useEffect(() => {
    if (open && activeIndex >= 0) itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  const onTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(e.key === "ArrowDown" ? 0 : ITEMS.length - 1);
    }
  };

  const onMenuKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const count = ITEMS.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % count);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? count - 1 : i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(count - 1);
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  const onSelect = (item: MenuItem) => {
    setLastAction(item.label);
    close(true);
  };

  return (
    <Column fillWidth minHeight="100vh" horizontal="center" paddingX="16" paddingY="24" gap="32">
      <Row
        as="header"
        fillWidth
        maxWidth={64}
        vertical="center"
        horizontal="between"
        paddingY="8"
        gap="16"
      >
        <Column gap="4">
          <Heading as="h1" variant="heading-strong-l">
            Northwind Studio
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Team workspace
          </Text>
        </Column>

        <div
          ref={rootRef}
          className="profile-root"
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
          onFocus={clearTimer}
        >
          <button
            ref={triggerRef}
            id={triggerId}
            type="button"
            className="avatar-trigger"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            aria-label={`Account menu for ${USER.name}`}
            onClick={() => {
              clearTimer();
              setOpen((o) => !o);
              setActiveIndex(-1);
            }}
            onKeyDown={onTriggerKeyDown}
          >
            <span className="avatar-initials" aria-hidden="true">
              {USER.initials}
            </span>
            <span className="avatar-status" aria-hidden="true" />
          </button>

          {open && (
            <div
              id={panelId}
              className="profile-panel"
              role="dialog"
              aria-label={`${USER.name} profile`}
            >
              <div className="panel-head">
                <span className="avatar-initials avatar-large" aria-hidden="true">
                  {USER.initials}
                </span>
                <div className="panel-id">
                  <p className="name">{USER.name}</p>
                  <p className="muted">
                    {USER.handle} · {USER.role}
                  </p>
                </div>
              </div>

              <p className="bio">{USER.bio}</p>
              <p className="muted loc">
                <span className="dot" aria-hidden="true" /> {USER.status} · {USER.location}
              </p>

              <dl className="stats">
                {STATS.map((s) => (
                  <div key={s.label} className="stat">
                    <dd>{s.value}</dd>
                    <dt>{s.label}</dt>
                  </div>
                ))}
              </dl>

              <div className="actions">
                <button
                  type="button"
                  className={following ? "btn btn-ghost" : "btn btn-primary"}
                  aria-pressed={following}
                  onClick={() => setFollowing((f) => !f)}
                >
                  {following ? "Following" : "Follow"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setLastAction("Message sent to Maya");
                    close(true);
                  }}
                >
                  Message
                </button>
              </div>

              <div className="sep" role="separator" />

              <div
                role="menu"
                aria-label="Account actions"
                onKeyDown={onMenuKeyDown}
                className="menu"
              >
                {ITEMS.map((item, i) => (
                  <button
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    type="button"
                    role="menuitem"
                    tabIndex={activeIndex === i ? 0 : -1}
                    className={item.danger ? "menu-item danger" : "menu-item"}
                    onClick={() => onSelect(item)}
                    onFocus={() => setActiveIndex(i)}
                  >
                    <span>{item.label}</span>
                    {item.hint && <kbd>{item.hint}</kbd>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Row>

      <Column fillWidth maxWidth={40} gap="16" paddingY="24">
        <Heading as="h2" variant="display-strong-xs">
          Welcome back, Maya
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Hover, click or focus the avatar in the top right to open your profile card. Use the arrow
          keys to move through the menu and Escape to close it.
        </Text>
        <Line />
        <Row gap="8" vertical="center">
          <Text variant="label-default-s" onBackground="neutral-weak">
            Last action:
          </Text>
          <span aria-live="polite" role="status">
            <Text variant="label-strong-s">{lastAction}</Text>
          </span>
        </Row>
      </Column>

      <style>{`
        .profile-root { position: relative; display: inline-block; }
        .avatar-trigger {
          position: relative; display: inline-flex; padding: 0; border: 2px solid transparent;
          background: none; border-radius: 999px; cursor: pointer;
          transition: border-color .15s ease, transform .15s ease;
        }
        .avatar-trigger:hover { transform: translateY(-1px); }
        .avatar-trigger:focus-visible, .btn:focus-visible, .menu-item:focus-visible {
          outline: 2px solid var(--brand-solid-strong, #4f6bff); outline-offset: 2px;
        }
        .avatar-trigger[aria-expanded="true"] { border-color: var(--brand-solid-strong, #4f6bff); }
        .avatar-initials {
          display: inline-flex; align-items: center; justify-content: center;
          width: 44px; height: 44px; border-radius: 999px; font-weight: 600; font-size: 15px;
          letter-spacing: .02em; color: #fff; background: linear-gradient(135deg, #5b6cff, #b05bff);
          font-family: var(--font-label);
        }
        .avatar-large { width: 56px; height: 56px; font-size: 18px; flex: none; }
        .avatar-status {
          position: absolute; right: 0; bottom: 0; width: 12px; height: 12px; border-radius: 999px;
          background: #2fb36d; border: 2px solid var(--page-background, #fff);
        }
        .profile-panel {
          position: absolute; top: calc(100% + 10px); right: 0; z-index: 50;
          width: min(360px, calc(100vw - 32px)); padding: 20px; border-radius: 16px;
          background: var(--surface-background, #fff); color: var(--neutral-on-background-strong, inherit);
          border: 1px solid var(--neutral-alpha-medium, rgba(128,128,128,.3));
          box-shadow: 0 16px 40px rgba(0,0,0,.18);
          font-family: var(--font-body);
          animation: panel-in .14s ease-out;
        }
        .profile-panel::before {
          content: ""; position: absolute; top: -14px; left: 0; right: 0; height: 14px;
        }
        @keyframes panel-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .profile-panel { animation: none; } .avatar-trigger { transition: none; }
        }
        .panel-head { display: flex; gap: 14px; align-items: center; }
        .panel-id { min-width: 0; }
        .name { margin: 0; font-size: 17px; font-weight: 650; }
        .muted { margin: 2px 0 0; font-size: 13px; opacity: .7; }
        .bio { margin: 14px 0 6px; font-size: 14px; line-height: 1.5; }
        .loc { display: flex; align-items: center; gap: 6px; margin: 0; }
        .dot { width: 8px; height: 8px; border-radius: 999px; background: #2fb36d; display: inline-block; }
        .stats {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 16px 0; padding: 0;
        }
        .stat {
          display: flex; flex-direction: column-reverse; align-items: center; padding: 10px 4px;
          border-radius: 12px; background: var(--neutral-alpha-weak, rgba(128,128,128,.1));
        }
        .stat dd { margin: 0; font-size: 18px; font-weight: 650; }
        .stat dt { font-size: 12px; opacity: .7; }
        .actions { display: flex; gap: 8px; }
        .btn {
          flex: 1; min-height: 40px; padding: 0 14px; border-radius: 10px; font: inherit;
          font-size: 14px; font-weight: 600; cursor: pointer;
          border: 1px solid var(--neutral-alpha-medium, rgba(128,128,128,.35));
        }
        .btn-primary { background: var(--brand-solid-strong, #4f6bff); color: #fff; border-color: transparent; }
        .btn-ghost { background: transparent; color: inherit; }
        .btn:hover { filter: brightness(1.08); }
        .sep { height: 1px; margin: 16px 0 8px; background: var(--neutral-alpha-medium, rgba(128,128,128,.3)); }
        .menu { display: flex; flex-direction: column; gap: 2px; }
        .menu-item {
          display: flex; justify-content: space-between; align-items: center; width: 100%;
          min-height: 40px; padding: 0 10px; border: 0; border-radius: 8px; background: transparent;
          color: inherit; font: inherit; font-size: 14px; text-align: left; cursor: pointer;
        }
        .menu-item:hover, .menu-item:focus-visible { background: var(--neutral-alpha-weak, rgba(128,128,128,.14)); }
        .menu-item.danger { color: #d64545; }
        .menu-item kbd {
          font-family: var(--font-code); font-size: 11px; opacity: .6; padding: 2px 6px;
          border-radius: 6px; border: 1px solid var(--neutral-alpha-medium, rgba(128,128,128,.3));
        }
        @media (max-width: 480px) {
          .profile-panel { position: fixed; top: 72px; left: 16px; right: 16px; width: auto; }
        }
      `}</style>
    </Column>
  );
}
