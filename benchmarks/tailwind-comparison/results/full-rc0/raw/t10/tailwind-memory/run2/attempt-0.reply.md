Design plan: a dashboard-style page with a top header. The avatar button opens a popover (click or Enter/Space; also hover-preview on desktop pointers is skipped to keep it accessible and predictable). It includes a profile header, stats, a status selector, and action menu items with arrow-key navigation, Escape to close, outside-click close, and focus return.

```tsx
"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  Bell,
  Check,
  ChevronDown,
  CreditCard,
  FolderKanban,
  LifeBuoy,
  LogOut,
  MapPin,
  Moon,
  Settings,
  Sparkles,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

type Status = "online" | "focus" | "away";

const STATUS_OPTIONS: { value: Status; label: string; dot: string }[] = [
  { value: "online", label: "Available", dot: "bg-emerald-500" },
  { value: "focus", label: "Focusing", dot: "bg-amber-500" },
  { value: "away", label: "Away", dot: "bg-slate-400" },
];

const USER = {
  name: "Priya Raman",
  handle: "@priya",
  initials: "PR",
  role: "Staff Product Designer",
  location: "Lisbon, Portugal",
  email: "priya.raman@northwind.studio",
  stats: [
    { label: "Projects", value: "48" },
    { label: "Followers", value: "2.4k" },
    { label: "Following", value: "312" },
  ],
};

type MenuItem = {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  danger?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  { id: "profile", label: "View profile", icon: User },
  { id: "projects", label: "My projects", hint: "G P", icon: FolderKanban },
  { id: "team", label: "Team & invites", icon: Users },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "settings", label: "Settings", hint: "G S", icon: Settings },
  { id: "help", label: "Help & support", icon: LifeBuoy },
];

const ACTIVITY = [
  { id: 1, text: "Marcus commented on Onboarding flow v3", time: "12 min ago" },
  { id: 2, text: "You were added to Design Systems", time: "2 hours ago" },
  { id: 3, text: "Weekly review is scheduled for Friday", time: "Yesterday" },
];

export default function Page() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("online");
  const [quiet, setQuiet] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panelId = useId();
  const titleId = useId();

  const currentStatus =
    STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Outside click closes the popover.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Move focus into the panel when opened.
  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>(
      '[role="menuitem"]',
    );
    first?.focus();
  }, [open]);

  const onPanelKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close(true);
      return;
    }
    const items = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]',
      ) ?? [],
    );
    if (items.length === 0) return;
    const index = items.indexOf(document.activeElement as HTMLElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(index + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Tab") {
      // Keep the popover a contained, short-lived surface.
      close(false);
    }
  };

  const onTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handleAction = (item: MenuItem) => {
    close(true);
    showToast(`${item.label} is a demo action`);
  };

  const itemClass =
    "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 outline-none transition-colors hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white"
            >
              <Sparkles className="size-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">
              Northwind Studio
            </span>
          </div>

          <nav aria-label="Primary" className="hidden gap-1 md:flex">
            {["Overview", "Projects", "Library", "Reports"].map((label, i) => (
              <a
                key={label}
                href="#"
                aria-current={i === 0 ? "page" : undefined}
                onClick={(e) => e.preventDefault()}
                className={`rounded-md px-3 py-1.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  i === 0
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="relative">
            <button
              ref={triggerRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls={open ? panelId : undefined}
              aria-label={`Account menu for ${USER.name}`}
              onClick={() => setOpen((v) => !v)}
              onKeyDown={onTriggerKeyDown}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 shadow-sm outline-none transition hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <span className="relative">
                <span
                  aria-hidden="true"
                  className="grid size-8 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold text-white"
                >
                  {USER.initials}
                </span>
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white ${currentStatus.dot}`}
                />
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`size-4 text-slate-500 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {open && (
              <div
                ref={panelRef}
                id={panelId}
                role="menu"
                aria-labelledby={titleId}
                onKeyDown={onPanelKeyDown}
                className="fixed inset-x-3 top-[4.5rem] z-40 max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 ring-1 ring-black/5 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-85"
              >
                {/* Profile header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="grid size-14 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-indigo-500 to-fuchsia-500 text-lg font-semibold text-white"
                    >
                      {USER.initials}
                    </span>
                    <div className="min-w-0">
                      <p
                        id={titleId}
                        className="truncate text-base font-semibold text-slate-900"
                      >
                        {USER.name}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {USER.role}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin aria-hidden="true" className="size-3.5" />
                        <span className="truncate">{USER.location}</span>
                      </p>
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-3 divide-x divide-slate-200 rounded-xl bg-slate-50 py-2.5 text-center">
                    {USER.stats.map((s) => (
                      <div key={s.label} className="px-2">
                        <dd className="text-base font-semibold tabular-nums text-slate-900">
                          {s.value}
                        </dd>
                        <dt className="text-xs text-slate-500">{s.label}</dt>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* Status */}
                <div
                  role="group"
                  aria-label="Set your status"
                  className="border-t border-slate-100 p-2"
                >
                  <p
                    aria-hidden="true"
                    className="px-2.5 pb-1 pt-1.5 text-xs font-medium uppercase tracking-wide text-slate-400"
                  >
                    Status
                  </p>
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={status === opt.value}
                      tabIndex={-1}
                      onClick={() => {
                        setStatus(opt.value);
                        showToast(`Status set to ${opt.label}`);
                      }}
                      className={itemClass}
                    >
                      <span
                        aria-hidden="true"
                        className={`size-2.5 rounded-full ${opt.dot}`}
                      />
                      <span className="flex-1">{opt.label}</span>
                      {status === opt.value && (
                        <Check
                          aria-hidden="true"
                          className="size-4 text-indigo-600"
                        />
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={quiet}
                    tabIndex={-1}
                    onClick={() => setQuiet((v) => !v)}
                    className={itemClass}
                  >
                    <Moon aria-hidden="true" className="size-4 text-slate-500" />
                    <span className="flex-1">Pause notifications</span>
                    <span
                      aria-hidden="true"
                      className={`relative h-5 w-9 rounded-full transition-colors ${
                        quiet ? "bg-indigo-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${
                          quiet ? "left-4.5" : "left-0.5"
                        }`}
                      />
                    </span>
                  </button>
                </div>

                {/* Actions */}
                <div
                  role="group"
                  aria-label="Account actions"
                  className="border-t border-slate-100 p-2"
                >
                  {MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => handleAction(item)}
                        className={itemClass}
                      >
                        <Icon
                          aria-hidden="true"
                          className="size-4 text-slate-500 group-hover:text-slate-700"
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.hint && (
                          <kbd className="hidden rounded border border-slate-200 px-1.5 font-sans text-[11px] text-slate-400 sm:inline">
                            {item.hint}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() =>
                      handleAction({
                        id: "signout",
                        label: "Sign out",
                        icon: LogOut,
                        danger: true,
                      })
                    }
                    className={`${itemClass} text-red-600 hover:bg-red-50 focus-visible:bg-red-50 focus-visible:ring-red-500`}
                  >
                    <LogOut aria-hidden="true" className="size-4" />
                    <span className="flex-1">Sign out</span>
                    <span className="max-w-35 truncate text-xs text-slate-400">
                      {USER.email}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-indigo-600">Good morning</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back, Priya
          </h1>
          <p className="max-w-xl text-sm text-slate-600 sm:text-base">
            Open the avatar in the top-right corner to view your profile card,
            update your status and jump to account actions.
          </p>
        </div>

        <section
          aria-label="This week at a glance"
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[
            { label: "Active projects", value: "7", note: "2 due this week" },
            { label: "Reviews pending", value: "12", note: "4 need your sign-off" },
            { label: "Team velocity", value: "92%", note: "Up 6% from last sprint" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {card.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{card.note}</p>
            </div>
          ))}
        </section>

        <section
          aria-labelledby="activity-heading"
          className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <Bell aria-hidden="true" className="size-4 text-slate-500" />
            <h2 id="activity-heading" className="text-sm font-semibold">
              Recent activity
            </h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {ACTIVITY.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-0.5 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <span className="text-sm text-slate-700">{a.text}</span>
                <span className="text-xs text-slate-400">{a.time}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
      >
        {toast && (
          <p className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
            {toast}
          </p>
        )}
      </div>
    </div>
  );
}
```