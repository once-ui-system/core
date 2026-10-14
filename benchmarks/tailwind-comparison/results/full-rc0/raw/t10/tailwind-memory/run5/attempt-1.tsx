"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  LogOut,
  MapPin,
  MessageSquare,
  Moon,
  Search,
  Settings,
  Sparkles,
  User,
  UserPlus,
  HelpCircle,
  Layers,
} from "lucide-react";

type Stat = { label: string; value: string };

type MenuItem = {
  id: string;
  label: string;
  hint?: string;
};

const USER = {
  name: "Amara Okafor",
  handle: "@amara.okafor",
  initials: "AO",
  role: "Staff Product Designer",
  location: "Lisbon, Portugal",
  bio: "Designing calm tools for busy teams. Currently shaping the Atlas design system and mentoring the junior design cohort.",
  plan: "Pro",
};

const STATS: Stat[] = [
  { label: "Projects", value: "48" },
  { label: "Followers", value: "12.4k" },
  { label: "Reviews", value: "326" },
];

const MENU: MenuItem[] = [
  { id: "profile", label: "View profile" },
  { id: "settings", label: "Account settings", hint: "G S" },
  { id: "notifications", label: "Notifications", hint: "3 new" },
  { id: "help", label: "Help & documentation" },
];

const FEED = [
  { title: "Atlas tokens v2.4 shipped", meta: "Design system · 2 hours ago" },
  { title: "Onboarding flow review requested", meta: "Growth · Yesterday" },
  { title: "Quarterly research readout", meta: "Research · 3 days ago" },
];

function MenuIcon({ id }: { id: string }) {
  const cls = "size-4 text-slate-500";
  switch (id) {
    case "profile":
      return <User aria-hidden="true" className={cls} />;
    case "settings":
      return <Settings aria-hidden="true" className={cls} />;
    case "notifications":
      return <Bell aria-hidden="true" className={cls} />;
    default:
      return <HelpCircle aria-hidden="true" className={cls} />;
  }
}

function Avatar({ size }: { size: "sm" | "lg" }) {
  const dims = size === "lg" ? "size-14 text-lg" : "size-9 text-sm";
  const dot = size === "lg" ? "size-3.5" : "size-2.5";
  return (
    <span
      aria-hidden="true"
      className={`${dims} relative inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 font-semibold tracking-wide text-white`}
    >
      {USER.initials}
      <span
        className={`${dot} absolute bottom-0 right-0 rounded-full border-2 border-white bg-emerald-500`}
      />
    </span>
  );
}

function ProfilePopover() {
  const [open, setOpen] = useState(false);
  const [following, setFollowing] = useState(false);
  const [dark, setDark] = useState(false);
  const [status, setStatus] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panelId = useId();
  const titleId = useId();

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const close = useCallback(
    (returnFocus: boolean) => {
      clearTimer();
      setOpen(false);
      if (returnFocus) triggerRef.current?.focus();
    },
    [clearTimer],
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (root && e.target instanceof Node && !root.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
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

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const getFocusable = (): HTMLElement[] => {
    const panel = panelRef.current;
    if (!panel) return [];
    return Array.from(
      panel.querySelectorAll<HTMLElement>("button:not([disabled])"),
    );
  };

  const onTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
      window.requestAnimationFrame(() => {
        getFocusable()[0]?.focus();
      });
    }
  };

  const onPanelKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = getFocusable();
    if (items.length === 0) return;
    const active = document.activeElement;
    const idx = items.findIndex((el) => el === active);
    const last = items.length - 1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[idx >= last ? 0 : idx + 1]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[idx <= 0 ? last : idx - 1]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[last]?.focus();
    } else if (e.key === "Tab") {
      if (e.shiftKey && idx <= 0) {
        e.preventDefault();
        items[last]?.focus();
      } else if (!e.shiftKey && idx === last) {
        e.preventDefault();
        items[0]?.focus();
      }
    }
  };

  const toggle = () => {
    clearTimer();
    setOpen((v) => !v);
  };

  const canHover = (): boolean => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  };

  const onMouseEnter = () => {
    if (!canHover()) return;
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(true), 120);
  };

  const onMouseLeave = () => {
    if (!canHover()) return;
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(false), 220);
  };

  const onMenuAction = (label: string) => {
    setStatus(`${label} selected`);
    close(true);
  };

  const onFollow = () => {
    const next = !following;
    setFollowing(next);
    setStatus(next ? `You are now following ${USER.name}` : `Unfollowed ${USER.name}`);
  };

  const onDarkToggle = () => {
    const next = !dark;
    setDark(next);
    setStatus(next ? "Dark appearance on" : "Dark appearance off");
  };

  const itemClass =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600";

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={`Account menu for ${USER.name}`}
        onClick={toggle}
        onKeyDown={onTriggerKeyDown}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 shadow-sm transition hover:border-slate-300 hover:shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <Avatar size="sm" />
        <ChevronDown
          aria-hidden="true"
          className={`size-4 text-slate-500 transition-transform duration-200 motion-reduce:transition-none ${
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
          onKeyDown={onPanelKeyDown}
          className="fixed inset-x-3 top-16 z-50 max-h-[calc(100vh-5rem)] origin-top-right overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[22rem]"
        >
          <div>
            <div
              aria-hidden="true"
              className="h-14 bg-gradient-to-r from-indigo-100 via-violet-100 to-fuchsia-100"
            />
            <div className="-mt-8 px-5">
              <div className="flex items-end justify-between">
                <div className="rounded-full bg-white p-1 shadow-sm">
                  <Avatar size="lg" />
                </div>
                <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                  <Sparkles aria-hidden="true" className="size-3" />
                  {USER.plan}
                </span>
              </div>
              <h2 id={titleId} className="mt-3 text-base font-semibold text-slate-900">
                {USER.name}
              </h2>
              <p className="text-sm text-slate-500">
                {USER.handle} · {USER.role}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin aria-hidden="true" className="size-3.5" />
                {USER.location}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{USER.bio}</p>
            </div>
          </div>

          <dl className="mx-5 mt-4 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50">
            {STATS.map((s) => (
              <div key={s.label} className="px-2 py-2.5 text-center">
                <dd className="text-base font-semibold tabular-nums text-slate-900">
                  {s.value}
                </dd>
                <dt className="text-xs text-slate-500">{s.label}</dt>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex gap-2 px-5">
            <button
              type="button"
              aria-pressed={following}
              onClick={onFollow}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                following
                  ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
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
              onClick={() => onMenuAction("Message")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <MessageSquare aria-hidden="true" className="size-4" />
              Message
            </button>
          </div>

          <div role="menu" aria-label="Account" className="mt-3 border-t border-slate-100 p-2">
            {MENU.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onClick={() => onMenuAction(item.label)}
                className={itemClass}
              >
                <MenuIcon id={item.id} />
                <span className="flex-1">{item.label}</span>
                {item.hint ? (
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                    {item.hint}
                  </span>
                ) : null}
              </button>
            ))}
            <button
              type="button"
              role="menuitemcheckbox"
              aria-checked={dark}
              onClick={onDarkToggle}
              className={itemClass}
            >
              <Moon aria-hidden="true" className="size-4 text-slate-500" />
              <span className="flex-1">Dark appearance</span>
              <span
                aria-hidden="true"
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  dark ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all motion-reduce:transition-none ${
                    dark ? "left-[1.125rem]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          </div>

          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              onClick={() => onMenuAction("Sign out")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50 focus-visible:bg-rose-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose-600"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Sign out
            </button>
          </div>
        </div>
      )}

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <a
            href="#main"
            className="flex items-center gap-2 rounded-md font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <span
              aria-hidden="true"
              className="inline-flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white"
            >
              <Layers className="size-4" />
            </span>
            <span className="hidden sm:inline">Atlas Studio</span>
          </a>

          <div className="relative ml-2 min-w-0 flex-1 sm:max-w-sm">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              aria-label="Search projects"
              placeholder="Search projects"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder:text-slate-500 focus-visible:border-indigo-500 focus-visible:bg-white focus-visible:outline-2 focus-visible:outline-indigo-500/30"
            />
          </div>

          <div className="ml-auto">
            <ProfilePopover />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-indigo-700">Workspace overview</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Good morning, Amara
          </h1>
          <p className="mt-2 text-slate-600">
            Select your avatar in the top right to open your profile card. On desktop it also
            previews on hover; on touch devices and with the keyboard it opens on tap or Enter.
          </p>
        </div>

        <section aria-labelledby="activity-heading" className="mt-8">
          <h2 id="activity-heading" className="text-base font-semibold">
            Recent activity
          </h2>
          <ul className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {FEED.map((item) => (
              <li key={item.title} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <span
                  aria-hidden="true"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"
                >
                  <Bell className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.meta}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
