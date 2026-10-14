"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  Bell,
  Bookmark,
  CalendarDays,
  ChevronDown,
  Check,
  CreditCard,
  LogOut,
  MapPin,
  MessageSquare,
  Settings,
  UserPlus,
  UserRound,
} from "lucide-react";

type Stat = { label: string; value: string };

const user = {
  name: "Priya Raman",
  handle: "@priya.raman",
  initials: "PR",
  role: "Staff Product Designer",
  location: "Lisbon, Portugal",
  joined: "Joined March 2021",
  bio: "Designing calm tools for busy teams. Currently working on the Atlas design system.",
};

const stats: Stat[] = [
  { label: "Projects", value: "48" },
  { label: "Followers", value: "12.4k" },
  { label: "Following", value: "386" },
];

const menuItems = [
  { label: "View profile", icon: UserRound, hint: "G P" },
  { label: "Saved items", icon: Bookmark, hint: "G S" },
  { label: "Notifications", icon: Bell, hint: "3 new" },
  { label: "Billing", icon: CreditCard, hint: "" },
  { label: "Settings", icon: Settings, hint: "G ," },
] as const;

export default function Page() {
  const [open, setOpen] = useState(false);
  const [following, setFollowing] = useState(false);
  const [status, setStatus] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  // Outside click
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Move focus into panel on open
  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    first?.focus();
  }, [open]);

  const onPanelKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close(true);
      return;
    }
    if (e.key === "Tab") {
      setOpen(false);
      return;
    }
    const items = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    if (items.length === 0) return;
    const idx = items.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (e.key === "ArrowDown") next = (idx + 1) % items.length;
    else if (e.key === "ArrowUp") next = (idx - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next >= 0) {
      e.preventDefault();
      items[next].focus();
    }
  };

  const onTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const toggleFollow = () => {
    setFollowing((f) => {
      const next = !f;
      setStatus(next ? `You are now following ${user.name}` : `You unfollowed ${user.name}`);
      return next;
    });
  };

  const activate = (label: string) => {
    setStatus(`${label} selected`);
    close(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
            >
              A
            </span>
            <span>Atlas</span>
          </div>

          <div ref={rootRef} className="relative">
            <button
              ref={triggerRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls={open ? panelId : undefined}
              aria-label={`Account menu for ${user.name}`}
              onClick={() => setOpen((o) => !o)}
              onKeyDown={onTriggerKeyDown}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-2 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-semibold text-white"
              >
                {user.initials}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`size-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <div
                ref={panelRef}
                id={panelId}
                role="menu"
                aria-label="Account"
                onKeyDown={onPanelKeyDown}
                className="absolute right-0 top-full z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 ring-1 ring-black/5"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg font-semibold text-white"
                    >
                      {user.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold leading-tight">{user.name}</p>
                      <p className="truncate text-sm text-slate-500">{user.handle}</p>
                      <p className="mt-1 truncate text-sm text-slate-700">{user.role}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{user.bio}</p>

                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <li className="flex items-center gap-1">
                      <MapPin aria-hidden="true" className="size-3.5" />
                      {user.location}
                    </li>
                    <li className="flex items-center gap-1">
                      <CalendarDays aria-hidden="true" className="size-3.5" />
                      {user.joined}
                    </li>
                  </ul>

                  <dl className="mt-4 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50 py-2 text-center">
                    {stats.map((s) => (
                      <div key={s.label} className="px-2">
                        <dd className="text-base font-semibold tabular-nums">{s.value}</dd>
                        <dt className="text-xs text-slate-500">{s.label}</dt>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      role="menuitem"
                      aria-pressed={following}
                      onClick={toggleFollow}
                      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                        following
                          ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {following ? (
                        <Check aria-hidden="true" className="size-4" />
                      ) : (
                        <UserPlus aria-hidden="true" className="size-4" />
                      )}
                      {following ? "Following" : "Follow"}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => activate("Message")}
                      className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      <MessageSquare aria-hidden="true" className="size-4" />
                      Message
                    </button>
                  </div>
                </div>

                <div role="separator" className="h-px bg-slate-200" />

                <div className="p-1.5">
                  {menuItems.map(({ label, icon: Icon, hint }) => (
                    <button
                      key={label}
                      type="button"
                      role="menuitem"
                      onClick={() => activate(label)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      <Icon aria-hidden="true" className="size-4 text-slate-500" />
                      <span className="flex-1">{label}</span>
                      {hint && <span className="text-xs text-slate-400">{hint}</span>}
                    </button>
                  ))}
                </div>

                <div role="separator" className="h-px bg-slate-200" />

                <div className="p-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => activate("Sign out")}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-red-600"
                  >
                    <LogOut aria-hidden="true" className="size-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Team workspace</h1>
        <p className="mt-2 max-w-xl text-slate-600">
          Select your avatar in the top-right corner to open the profile popover. Use the arrow keys
          to move between actions and Escape to close it.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Atlas design tokens", meta: "Updated 2 hours ago" },
            { title: "Onboarding flow review", meta: "6 comments, 2 unresolved" },
            { title: "Q3 research synthesis", meta: "Shared with 14 people" },
          ].map((card) => (
            <article
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <h2 className="font-medium">{card.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{card.meta}</p>
            </article>
          ))}
        </div>
      </section>

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>
    </main>
  );
}
