```tsx
"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  CreditCard,
  LifeBuoy,
  LogOut,
  MapPin,
  MessageSquare,
  Settings,
  Sparkles,
  UserCircle,
  UserPlus,
  Link as LinkIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type MenuItem = {
  label: string;
  hint?: string;
  icon: LucideIcon;
  danger?: boolean;
};

const user = {
  name: "Priya Raman",
  handle: "@priya.raman",
  initials: "PR",
  role: "Staff Product Designer",
  location: "Lisbon, Portugal",
  bio: "Designing calm interfaces for complex tools. Currently shaping the Atlas design system.",
  plan: "Pro plan",
  stats: [
    { label: "Projects", value: "48" },
    { label: "Followers", value: "12.4k" },
    { label: "Following", value: "312" },
  ],
};

const menuItems: MenuItem[] = [
  { label: "View profile", icon: UserCircle },
  { label: "Account settings", hint: "G S", icon: Settings },
  { label: "Billing & plans", icon: CreditCard },
  { label: "Documentation", icon: BookOpen },
  { label: "Help & support", icon: LifeBuoy },
  { label: "Sign out", icon: LogOut, danger: true },
];

const activity = [
  { title: "Published “Atlas tokens v2.3”", time: "2h ago" },
  { title: "Commented on “Onboarding revamp”", time: "Yesterday" },
  { title: "Joined the Design Ops team", time: "3 days ago" },
];

export default function Page() {
  const [open, setOpen] = useState(false);
  const [following, setFollowing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const panelId = useId();
  const titleId = useId();

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  // Outside click + Escape
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (target && wrapperRef.current && !wrapperRef.current.contains(target)) {
        close(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(true);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  // Move focus into the panel when it opens
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  // Close if focus leaves the popover via Tab
  const onBlurCapture = (e: React.FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null;
    if (open && next && wrapperRef.current && !wrapperRef.current.contains(next)) {
      setOpen(false);
    }
  };

  const onMenuKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [],
    );
    if (items.length === 0) return;
    const index = items.findIndex((el) => el === document.activeElement);
    let nextIndex: number | null = null;
    switch (e.key) {
      case "ArrowDown":
        nextIndex = index < 0 ? 0 : (index + 1) % items.length;
        break;
      case "ArrowUp":
        nextIndex = index < 0 ? items.length - 1 : (index - 1 + items.length) % items.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = items.length - 1;
        break;
    }
    if (nextIndex !== null) {
      e.preventDefault();
      items[nextIndex]?.focus();
    }
  };

  const onTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://example.com/${user.handle.slice(1)}`);
    } catch {
      // Clipboard may be unavailable; still show feedback.
    }
    setCopied(true);
    setStatus("Profile link copied to clipboard");
    window.setTimeout(() => setCopied(false), 1800);
  };

  const toggleFollow = () => {
    const next = !following;
    setFollowing(next);
    setStatus(next ? `You are now following ${user.name}` : `You unfollowed ${user.name}`);
  };

  const onMenuAction = (label: string) => {
    setStatus(`${label} selected`);
    close(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white"
            >
              <Sparkles className="size-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">Atlas Studio</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="relative grid size-10 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              aria-label="Notifications, 3 unread"
            >
              <Bell className="size-5" aria-hidden="true" />
              <span
                aria-hidden="true"
                className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white"
              />
            </button>

            <div ref={wrapperRef} className="relative" onBlurCapture={onBlurCapture}>
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                onKeyDown={onTriggerKeyDown}
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                aria-haspopup="dialog"
                aria-label={`Account menu for ${user.name}`}
                className="group flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 aria-expanded:bg-slate-100"
              >
                <Avatar size="sm" />
                <ChevronDown
                  aria-hidden="true"
                  className={`hidden size-4 text-slate-500 transition-transform sm:block ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {open && (
                <div
                  ref={panelRef}
                  id={panelId}
                  role="dialog"
                  aria-labelledby={titleId}
                  tabIndex={-1}
                  className="fixed inset-x-3 top-[4.5rem] z-30 max-h-[calc(100dvh-5.5rem)] origin-top-right overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 outline-none sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar size="lg" />
                      <div className="min-w-0 flex-1">
                        <h2 id={titleId} className="truncate text-base font-semibold leading-tight">
                          {user.name}
                        </h2>
                        <p className="truncate text-sm text-slate-500">{user.handle}</p>
                        <p className="mt-1 truncate text-sm text-slate-700">{user.role}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
                        {user.plan}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-slate-600">{user.bio}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      {user.location}
                    </p>

                    <dl className="mt-4 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50">
                      {user.stats.map((s) => (
                        <div key={s.label} className="px-2 py-3 text-center">
                          <dd className="text-lg font-semibold tabular-nums leading-none">
                            {s.value}
                          </dd>
                          <dt className="mt-1 text-xs text-slate-500">{s.label}</dt>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={toggleFollow}
                        aria-pressed={following}
                        className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                          following
                            ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                      >
                        {following ? (
                          <Check className="size-4" aria-hidden="true" />
                        ) : (
                          <UserPlus className="size-4" aria-hidden="true" />
                        )}
                        {following ? "Following" : "Follow"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(`Message composer opened for ${user.name}`)}
                        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        <MessageSquare className="size-4" aria-hidden="true" />
                        Message
                      </button>
                      <button
                        type="button"
                        onClick={copyLink}
                        aria-label={copied ? "Link copied" : "Copy profile link"}
                        className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        {copied ? (
                          <Check className="size-4 text-emerald-600" aria-hidden="true" />
                        ) : (
                          <LinkIcon className="size-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div
                    ref={menuRef}
                    role="menu"
                    aria-label="Account"
                    onKeyDown={onMenuKeyDown}
                    className="border-t border-slate-200 p-2"
                  >
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          role="menuitem"
                          onClick={() => onMenuAction(item.label)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 ${
                            item.danger
                              ? "text-rose-700 hover:bg-rose-50"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <Icon className="size-4 shrink-0" aria-hidden="true" />
                          <span className="flex-1">{item.label}</span>
                          {item.hint && (
                            <span className="text-xs tracking-widest text-slate-400">
                              {item.hint}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Team overview</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
          Select your avatar in the top-right corner to open your profile card with stats, quick
          actions and account shortcuts. Use the arrow keys to move through the menu and Escape to
          close it.
        </p>

        <section aria-labelledby="activity-heading" className="mt-8">
          <h2 id="activity-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recent activity
          </h2>
          <ul className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {activity.map((a) => (
              <li
                key={a.title}
                className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm text-slate-800">{a.title}</span>
                <span className="text-xs text-slate-500">{a.time}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <div role="status" aria-live="polite" className="sr-only">
        {status}
      </div>
    </div>
  );
}

function Avatar({ size }: { size: "sm" | "lg" }) {
  const dims = size === "sm" ? "size-9 text-sm" : "size-14 text-lg";
  return (
    <span
      aria-hidden="true"
      className={`relative grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 font-semibold text-white ${dims}`}
    >
      {user.initials}
      <span
        className={`absolute bottom-0 right-0 rounded-full bg-emerald-500 ring-2 ring-white ${
          size === "sm" ? "size-2.5" : "size-3.5"
        }`}
      />
    </span>
  );
}
```