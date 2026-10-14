"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  BadgeCheck,
  Bell,
  ChevronDown,
  CreditCard,
  LifeBuoy,
  LogOut,
  MapPin,
  Moon,
  Settings,
  UserRound,
  UserPlus,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Stat = { label: string; value: string };

type MenuAction = {
  id: string;
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
  bio: "Designing calm tools for busy teams. Currently working on the Atlas design system.",
  plan: "Pro plan",
};

const stats: Stat[] = [
  { label: "Projects", value: "48" },
  { label: "Followers", value: "12.4k" },
  { label: "Following", value: "326" },
];

const actions: MenuAction[] = [
  { id: "profile", label: "View profile", icon: UserRound },
  { id: "notifications", label: "Notifications", hint: "3 new", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "settings", label: "Settings", hint: "⌘,", icon: Settings },
  { id: "support", label: "Help & support", icon: LifeBuoy },
];

export default function Page() {
  const [open, setOpen] = useState(false);
  const [following, setFollowing] = useState(false);
  const [dark, setDark] = useState(false);
  const [status, setStatus] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
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

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>("[data-autofocus]");
    first?.focus();
  }, [open]);

  const onPanelKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(e.key)) {
      if (e.key === "Tab") {
        // Keep focus cycling inside the popover while open.
        const items = getFocusable();
        if (items.length === 0) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
      return;
    }
    const items = getFocusable();
    if (items.length === 0) return;
    e.preventDefault();
    const idx = items.indexOf(document.activeElement as HTMLElement);
    let next = idx;
    if (e.key === "ArrowDown") next = (idx + 1) % items.length;
    if (e.key === "ArrowUp") next = (idx - 1 + items.length) % items.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = items.length - 1;
    items[next].focus();
  };

  const getFocusable = (): HTMLElement[] =>
    Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href]",
      ) ?? [],
    );

  const onAction = (a: MenuAction) => {
    setStatus(`${a.label} selected`);
    close(true);
  };

  const onSignOut = () => {
    setStatus("Signed out (demo)");
    close(true);
  };

  const ring =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";

  return (
    <main
      className={`min-h-dvh transition-colors ${
        dark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      <header
        className={`border-b ${
          dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
            >
              A
            </span>
            <span className="truncate">Atlas Studio</span>
          </div>

          <div ref={rootRef} className="relative">
            <button
              ref={triggerRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={open ? panelId : undefined}
              onClick={() => setOpen((v) => !v)}
              className={`group flex items-center gap-2 rounded-full p-1 pr-2 transition-colors ${ring} ${
                dark ? "hover:bg-slate-800" : "hover:bg-slate-100"
              }`}
            >
              <Avatar size="sm" />
              <span className="sr-only">Account menu for {user.name}</span>
              <ChevronDown
                aria-hidden="true"
                className={`size-4 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                } ${dark ? "text-slate-400" : "text-slate-500"}`}
              />
            </button>

            {open && (
              <div
                ref={panelRef}
                id={panelId}
                role="dialog"
                aria-label={`${user.name} profile`}
                onKeyDown={onPanelKeyDown}
                className={`absolute right-0 z-20 mt-2 w-[min(20rem,calc(100vw-2rem))] origin-top-right rounded-2xl border shadow-xl motion-safe:animate-[popover-in_140ms_ease-out] ${
                  dark
                    ? "border-slate-700 bg-slate-900 text-slate-100 shadow-black/40"
                    : "border-slate-200 bg-white text-slate-900 shadow-slate-900/10"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h2 className="truncate text-base font-semibold">
                          {user.name}
                        </h2>
                        <BadgeCheck
                          aria-label="Verified"
                          role="img"
                          className="size-4 shrink-0 text-indigo-500"
                        />
                      </div>
                      <p
                        className={`truncate text-sm ${
                          dark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {user.handle}
                      </p>
                      <p className="mt-0.5 truncate text-sm">{user.role}</p>
                    </div>
                  </div>

                  <p
                    className={`mt-3 text-sm leading-relaxed ${
                      dark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {user.bio}
                  </p>
                  <p
                    className={`mt-2 flex items-center gap-1.5 text-xs ${
                      dark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    <MapPin aria-hidden="true" className="size-3.5" />
                    {user.location}
                  </p>

                  <dl
                    className={`mt-4 grid grid-cols-3 divide-x rounded-xl border text-center ${
                      dark
                        ? "divide-slate-700 border-slate-700 bg-slate-800/50"
                        : "divide-slate-200 border-slate-200 bg-slate-50"
                    }`}
                  >
                    {stats.map((s) => (
                      <div key={s.label} className="px-2 py-2.5">
                        <dd className="text-base font-semibold tabular-nums">
                          {s.value}
                        </dd>
                        <dt
                          className={`text-xs ${
                            dark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {s.label}
                        </dt>
                      </div>
                    ))}
                  </dl>

                  <button
                    type="button"
                    data-autofocus
                    aria-pressed={following}
                    onClick={() => {
                      setFollowing((f) => !f);
                      setStatus(
                        following
                          ? `Unfollowed ${user.name}`
                          : `Following ${user.name}`,
                      );
                    }}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${ring} ${
                      following
                        ? dark
                          ? "border border-slate-600 text-slate-100 hover:bg-slate-800"
                          : "border border-slate-300 text-slate-800 hover:bg-slate-100"
                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                    }`}
                  >
                    {following ? (
                      <UserCheck aria-hidden="true" className="size-4" />
                    ) : (
                      <UserPlus aria-hidden="true" className="size-4" />
                    )}
                    {following ? "Following" : "Follow"}
                  </button>
                </div>

                <div
                  role="separator"
                  className={`h-px ${dark ? "bg-slate-700" : "bg-slate-200"}`}
                />

                <ul className="p-1.5">
                  {actions.map((a) => {
                    const Icon = a.icon;
                    return (
                      <li key={a.id}>
                        <button
                          type="button"
                          onClick={() => onAction(a)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${ring} ${
                            dark
                              ? "hover:bg-slate-800 focus-visible:bg-slate-800"
                              : "hover:bg-slate-100 focus-visible:bg-slate-100"
                          }`}
                        >
                          <Icon
                            aria-hidden="true"
                            className={`size-4 ${
                              dark ? "text-slate-400" : "text-slate-500"
                            }`}
                          />
                          <span className="flex-1">{a.label}</span>
                          {a.hint && (
                            <span
                              className={`text-xs ${
                                a.id === "notifications"
                                  ? "rounded-full bg-indigo-100 px-2 py-0.5 font-medium text-indigo-700"
                                  : dark
                                    ? "text-slate-500"
                                    : "text-slate-400"
                              }`}
                            >
                              {a.hint}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                  <li>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={dark}
                      onClick={() => setDark((d) => !d)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${ring} ${
                        dark
                          ? "hover:bg-slate-800 focus-visible:bg-slate-800"
                          : "hover:bg-slate-100 focus-visible:bg-slate-100"
                      }`}
                    >
                      <Moon
                        aria-hidden="true"
                        className={`size-4 ${
                          dark ? "text-slate-400" : "text-slate-500"
                        }`}
                      />
                      <span className="flex-1">Dark mode</span>
                      <span
                        aria-hidden="true"
                        className={`relative h-5 w-9 rounded-full transition-colors ${
                          dark ? "bg-indigo-600" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform ${
                            dark ? "translate-x-4" : ""
                          }`}
                        />
                      </span>
                    </button>
                  </li>
                </ul>

                <div
                  role="separator"
                  className={`h-px ${dark ? "bg-slate-700" : "bg-slate-200"}`}
                />

                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={onSignOut}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${ring} ${
                      dark
                        ? "text-red-400 hover:bg-red-950/50 focus-visible:bg-red-950/50"
                        : "text-red-600 hover:bg-red-50 focus-visible:bg-red-50"
                    }`}
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
        <p
          className={`text-sm font-medium ${
            dark ? "text-indigo-400" : "text-indigo-600"
          }`}
        >
          {user.plan}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Good morning, Priya
        </h1>
        <p
          className={`mt-3 max-w-xl text-base leading-relaxed ${
            dark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          Select your avatar in the top right corner to open the profile
          popover. You can follow, jump to settings, switch themes, or sign out
          using the keyboard alone.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { t: "Atlas design system", d: "12 components awaiting review" },
            { t: "Onboarding revamp", d: "Usability test scheduled Thursday" },
            { t: "Icon refresh", d: "Final set exported yesterday" },
          ].map((c) => (
            <div
              key={c.t}
              className={`rounded-xl border p-4 ${
                dark
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <h3 className="font-medium">{c.t}</h3>
              <p
                className={`mt-1 text-sm ${
                  dark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {c.d}
              </p>
            </div>
          ))}
        </div>

        <p
          role="status"
          aria-live="polite"
          className={`mt-8 min-h-6 text-sm ${
            dark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {status}
        </p>
      </section>

      <style>{`
        @keyframes popover-in {
          from { opacity: 0; transform: translateY(-4px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </main>
  );
}

function Avatar({ size }: { size: "sm" | "lg" }) {
  const dims = size === "sm" ? "size-9 text-sm" : "size-14 text-lg";
  return (
    <span
      aria-hidden="true"
      className={`relative grid shrink-0 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-fuchsia-500 font-semibold text-white ${dims}`}
    >
      {user.initials}
      <span
        className={`absolute right-0 bottom-0 rounded-full border-2 border-white bg-emerald-500 ${
          size === "sm" ? "size-2.5" : "size-3.5"
        }`}
      />
    </span>
  );
}
