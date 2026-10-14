The Once UI package isn't installed in the project folder, so I can't inspect its types. I'll rely on well-known props and use native elements for the interactive parts, with inline styles using Once UI CSS tokens.

```tsx
"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { Column, Row, Text, Heading } from "@once-ui-system/core";

type MenuItem = {
  id: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  danger?: boolean;
};

type Stat = { label: string; value: string };

const USER = {
  name: "Marisol Vandenberg",
  handle: "@marisol.v",
  role: "Senior Product Designer",
  location: "Rotterdam, Netherlands",
  bio: "Designing calm interfaces for complex logistics software. Currently shipping the fleet dashboard redesign.",
  initials: "MV",
};

const STATS: Stat[] = [
  { label: "Projects", value: "48" },
  { label: "Followers", value: "12.4k" },
  { label: "Following", value: "386" },
];

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

const ProfileIcon = (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const SettingsIcon = (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);
const BillingIcon = (
  <svg {...iconProps}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);
const TeamIcon = (
  <svg {...iconProps}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
    <path d="M18 14.3c2 .7 3.5 2.6 3.5 5.7" />
  </svg>
);
const HelpIcon = (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7" />
    <path d="M12 17h.01" />
  </svg>
);
const SignOutIcon = (
  <svg {...iconProps}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);
const MapPinIcon = (
  <svg {...iconProps} width={14} height={14}>
    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const MENU_ITEMS: MenuItem[] = [
  { id: "profile", label: "View profile", hint: "G P", icon: ProfileIcon },
  { id: "team", label: "Switch workspace", hint: "G W", icon: TeamIcon },
  { id: "settings", label: "Account settings", hint: "G S", icon: SettingsIcon },
  { id: "billing", label: "Billing & plans", icon: BillingIcon },
  { id: "help", label: "Help center", icon: HelpIcon },
];

const styles = {
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 3,
    borderRadius: 999,
    border: "1px solid var(--neutral-alpha-medium)",
    background: "var(--surface-background)",
    color: "var(--neutral-on-background-strong)",
    cursor: "pointer",
    font: "inherit",
  } satisfies CSSProperties,
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: 0.5,
    color: "#fff",
    background: "linear-gradient(135deg, #6d5efc 0%, #e0549a 100%)",
    flexShrink: 0,
    position: "relative",
  } satisfies CSSProperties,
  panel: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    width: "min(360px, calc(100vw - 32px))",
    zIndex: 20,
    borderRadius: 16,
    border: "1px solid var(--neutral-alpha-medium)",
    background: "var(--surface-background)",
    boxShadow: "0 18px 48px rgba(0, 0, 0, 0.22)",
    overflow: "hidden",
    color: "var(--neutral-on-background-strong)",
  } satisfies CSSProperties,
  divider: {
    height: 1,
    background: "var(--neutral-alpha-weak)",
    border: 0,
    margin: 0,
  } satisfies CSSProperties,
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: 0,
    background: "transparent",
    color: "inherit",
    font: "inherit",
    fontSize: 14,
    textAlign: "left",
    cursor: "pointer",
    minHeight: 44,
  } satisfies CSSProperties,
  primaryBtn: {
    flex: 1,
    minHeight: 44,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid transparent",
    background: "var(--brand-solid-strong, #6d5efc)",
    color: "#fff",
    font: "inherit",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  } satisfies CSSProperties,
  secondaryBtn: {
    flex: 1,
    minHeight: 44,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid var(--neutral-alpha-medium)",
    background: "transparent",
    color: "inherit",
    font: "inherit",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  } satisfies CSSProperties,
};

export default function Page() {
  const [open, setOpen] = useState(false);
  const [following, setFollowing] = useState(false);
  const [status, setStatus] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panelId = useId();
  const titleId = useId();

  const allItems: MenuItem[] = [
    ...MENU_ITEMS,
    { id: "signout", label: "Sign out", icon: SignOutIcon, danger: true },
  ];

  const clearTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const close = useCallback(
    (returnFocus: boolean) => {
      clearTimer();
      setOpen(false);
      setActiveIndex(-1);
      if (returnFocus) triggerRef.current?.focus();
    },
    [clearTimer],
  );

  // Outside click / touch dismissal.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  // Move DOM focus with the roving index.
  useEffect(() => {
    if (open && activeIndex >= 0) itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  useEffect(() => clearTimer, [clearTimer]);

  const onRootKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      close(true);
      return;
    }
    if (!open) return;
    const last = allItems.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i >= last ? 0 : i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? last : i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(last);
    }
  };

  const onTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(0);
    }
  };

  const onBlurCapture = () => {
    // Close when focus leaves the whole widget.
    requestAnimationFrame(() => {
      const root = rootRef.current;
      if (root && !root.contains(document.activeElement) && open) {
        close(false);
      }
    });
  };

  const onMouseEnter = () => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      clearTimer();
      setOpen(true);
    }
  };

  const onMouseLeave = () => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      clearTimer();
      closeTimer.current = setTimeout(() => {
        const root = rootRef.current;
        // Don't close on hover-out while keyboard focus is inside.
        if (root && root.contains(document.activeElement) && activeIndex >= 0) return;
        setOpen(false);
        setActiveIndex(-1);
      }, 180);
    }
  };

  const onSelect = (item: MenuItem) => {
    setStatus(
      item.id === "signout"
        ? "You have been signed out (demo)."
        : `Navigating to “${item.label}” (demo).`,
    );
    close(true);
  };

  const toggleFollow = () => {
    const next = !following;
    setFollowing(next);
    setStatus(next ? `You are now following ${USER.name}.` : `You unfollowed ${USER.name}.`);
  };

  return (
    <Column fillWidth minHeight="100vh" background="page">
      <style>{`
        .pp-trigger:focus-visible,
        .pp-item:focus-visible,
        .pp-btn:focus-visible {
          outline: 2px solid var(--brand-solid-strong, #6d5efc);
          outline-offset: 2px;
        }
        .pp-item:hover { background: var(--neutral-alpha-weak); }
        .pp-item:focus-visible { background: var(--neutral-alpha-weak); }
        .pp-item[data-danger="true"] { color: var(--danger-on-background-strong, #d6336c); }
        .pp-btn:hover { filter: brightness(1.08); }
        .pp-trigger:hover { border-color: var(--neutral-alpha-strong); }
        .pp-panel { animation: pp-pop 140ms ease-out; transform-origin: top right; }
        @keyframes pp-pop {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pp-panel { animation: none; }
        }
        .pp-card {
          border: 1px solid var(--neutral-alpha-weak);
          border-radius: 16px;
          background: var(--surface-background);
          padding: 20px;
        }
        .pp-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 720px) {
          .pp-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .pp-sr {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
        }
      `}</style>

      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "12px 16px",
          borderBottom: "1px solid var(--neutral-alpha-weak)",
          background: "var(--surface-background)",
        }}
      >
        <Row vertical="center" gap="12">
          <span
            aria-hidden="true"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg, #6d5efc, #e0549a)",
              display: "inline-block",
            }}
          />
          <Text variant="label-default-m" onBackground="neutral-strong">
            Haulage Studio
          </Text>
        </Row>

        <div
          ref={rootRef}
          style={{ position: "relative" }}
          onKeyDown={onRootKeyDown}
          onBlurCapture={onBlurCapture}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <button
            ref={triggerRef}
            type="button"
            className="pp-trigger"
            style={styles.trigger}
            aria-haspopup="dialog"
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
            <span style={styles.avatar} aria-hidden="true">
              {USER.initials}
              <span
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: "#22c55e",
                  border: "2px solid var(--surface-background)",
                }}
              />
            </span>
          </button>

          {open && (
            <div
              id={panelId}
              role="dialog"
              aria-labelledby={titleId}
              className="pp-panel"
              style={styles.panel}
            >
              <div style={{ padding: 16, display: "flex", gap: 14, alignItems: "center" }}>
                <span style={{ ...styles.avatar, width: 56, height: 56, fontSize: 18 }} aria-hidden="true">
                  {USER.initials}
                </span>
                <div style={{ minWidth: 0 }}>
                  <Heading as="h2" variant="heading-strong-m" id={titleId}>
                    {USER.name}
                  </Heading>
                  <Text as="p" variant="body-default-s" onBackground="neutral-weak">
                    {USER.handle} · {USER.role}
                  </Text>
                </div>
              </div>

              <div style={{ padding: "0 16px 12px" }}>
                <Text as="p" variant="body-default-s" onBackground="neutral-medium">
                  {USER.bio}
                </Text>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 8,
                    color: "var(--neutral-on-background-weak)",
                    fontSize: 13,
                  }}
                >
                  {MapPinIcon}
                  <span>{USER.location}</span>
                </div>
              </div>

              <dl
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  margin: 0,
                  padding: "12px 8px",
                  borderTop: "1px solid var(--neutral-alpha-weak)",
                  borderBottom: "1px solid var(--neutral-alpha-weak)",
                  textAlign: "center",
                }}
              >
                {STATS.map((s) => (
                  <div key={s.label} style={{ display: "flex", flexDirection: "column-reverse", gap: 2 }}>
                    <dt style={{ fontSize: 12, color: "var(--neutral-on-background-weak)" }}>{s.label}</dt>
                    <dd style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{s.value}</dd>
                  </div>
                ))}
              </dl>

              <div style={{ display: "flex", gap: 8, padding: 12 }}>
                <button
                  type="button"
                  className="pp-btn"
                  style={following ? styles.secondaryBtn : styles.primaryBtn}
                  aria-pressed={following}
                  onClick={toggleFollow}
                >
                  {following ? "Following" : "Follow"}
                </button>
                <button
                  type="button"
                  className="pp-btn"
                  style={styles.secondaryBtn}
                  onClick={() => setStatus(`Message draft to ${USER.name} opened (demo).`)}
                >
                  Message
                </button>
              </div>

              <hr style={styles.divider} />

              <div role="menu" aria-label="Account" style={{ padding: 6 }}>
                {allItems.map((item, i) => (
                  <div key={item.id}>
                    {item.id === "signout" && <hr style={{ ...styles.divider, margin: "6px 0" }} />}
                    <button
                      ref={(el) => {
                        itemRefs.current[i] = el;
                      }}
                      type="button"
                      role="menuitem"
                      className="pp-item"
                      data-danger={item.danger ? "true" : "false"}
                      tabIndex={activeIndex === i ? 0 : -1}
                      style={styles.menuItem}
                      onClick={() => onSelect(item)}
                      onFocus={() => setActiveIndex(i)}
                    >
                      {item.icon}
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.hint && (
                        <span style={{ fontSize: 12, color: "var(--neutral-on-background-weak)" }}>
                          {item.hint}
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <main style={{ width: "100%", maxWidth: 960, margin: "0 auto", padding: "32px 16px 64px" }}>
        <Column gap="8" paddingBottom="24">
          <Heading as="h1" variant="display-strong-xs">
            Fleet overview
          </Heading>
          <Text as="p" variant="body-default-m" onBackground="neutral-weak">
            Hover, click, or press the arrow-down key on the avatar in the top right to open the profile card.
          </Text>
        </Column>

        <div className="pp-grid">
          {[
            { t: "Active routes", v: "128", d: "14 more than last week" },
            { t: "On-time delivery", v: "96.4%", d: "Up 1.2 points this month" },
            { t: "Open incidents", v: "3", d: "2 awaiting driver confirmation" },
          ].map((c) => (
            <section key={c.t} className="pp-card" aria-label={c.t}>
              <Text as="p" variant="label-default-s" onBackground="neutral-weak">
                {c.t}
              </Text>
              <Heading as="h2" variant="display-strong-s">
                {c.v}
              </Heading>
              <Text as="p" variant="body-default-s" onBackground="neutral-medium">
                {c.d}
              </Text>
            </section>
          ))}
        </div>

        <p role="status" aria-live="polite" style={{ marginTop: 24, minHeight: 24, fontSize: 14 }}>
          {status}
        </p>
      </main>
    </Column>
  );
}
```