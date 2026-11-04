I'll design the data layer first, then the shared badges, the client table, the dialog, and the detail page.

```ts lib/data.ts
export type Role = "Owner" | "Admin" | "Member" | "Viewer";
export type Status = "Active" | "Invited" | "Suspended";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joined: string | null;
}

export interface ActivityItem {
  id: string;
  text: string;
  when: string;
}

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];
export const INVITE_ROLES: Role[] = ["Admin", "Member", "Viewer"];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full access, billing and workspace deletion.",
  Admin: "Manage members, projects and integrations.",
  Member: "Create and edit issues, dashboards and reports.",
  Viewer: "Read-only access to dashboards and issues.",
};

export const members: Member[] = [
  {
    id: "m-01",
    name: "Maya Okafor",
    email: "maya@acmelabs.io",
    role: "Owner",
    status: "Active",
    joined: "2024-03-02",
  },
  {
    id: "m-02",
    name: "Daniel Reyes",
    email: "daniel@acmelabs.io",
    role: "Admin",
    status: "Active",
    joined: "2024-05-19",
  },
  {
    id: "m-03",
    name: "Priya Natarajan",
    email: "priya@acmelabs.io",
    role: "Member",
    status: "Active",
    joined: "2024-11-07",
  },
  {
    id: "m-04",
    name: "Tomás Lindqvist",
    email: "tomas@acmelabs.io",
    role: "Member",
    status: "Active",
    joined: "2025-02-14",
  },
  {
    id: "m-05",
    name: "Hana Sato",
    email: "hana@acmelabs.io",
    role: "Member",
    status: "Invited",
    joined: null,
  },
  {
    id: "m-06",
    name: "Grace Mensah",
    email: "grace@acmelabs.io",
    role: "Viewer",
    status: "Active",
    joined: "2025-06-30",
  },
  {
    id: "m-07",
    name: "Leo Brandt",
    email: "leo@acmelabs.io",
    role: "Member",
    status: "Suspended",
    joined: "2025-01-21",
  },
  {
    id: "m-08",
    name: "Ines Duarte",
    email: "ines@acmelabs.io",
    role: "Viewer",
    status: "Invited",
    joined: null,
  },
];

const activityByMember: Record<string, ActivityItem[]> = {
  "m-01": [
    { id: "a1", text: "Updated the workspace billing plan to Team", when: "2 days ago" },
    { id: "a2", text: "Promoted Daniel Reyes to Admin", when: "1 week ago" },
    { id: "a3", text: "Created the dashboard “Weekly retention”", when: "2 weeks ago" },
  ],
  "m-02": [
    { id: "a1", text: "Closed issue LUM-214 “Funnel chart drops last day”", when: "3 hours ago" },
    { id: "a2", text: "Connected the GitHub integration to 2 repositories", when: "Yesterday" },
    { id: "a3", text: "Invited Hana Sato as Member", when: "4 days ago" },
    { id: "a4", text: "Commented on LUM-198 “Export CSV times out”", when: "6 days ago" },
    { id: "a5", text: "Created the dashboard “Activation by cohort”", when: "2 weeks ago" },
  ],
  "m-03": [
    { id: "a1", text: "Opened issue LUM-221 “Segment filter resets on reload”", when: "Yesterday" },
    { id: "a2", text: "Shared the report “Feature adoption Q2”", when: "5 days ago" },
    { id: "a3", text: "Edited the dashboard “Weekly retention”", when: "1 week ago" },
  ],
  "m-04": [
    { id: "a1", text: "Resolved issue LUM-209 “Wrong timezone in event log”", when: "2 days ago" },
    { id: "a2", text: "Added 3 new event definitions", when: "1 week ago" },
  ],
  "m-05": [],
  "m-06": [
    { id: "a1", text: "Viewed the dashboard “Weekly retention”", when: "3 days ago" },
    { id: "a2", text: "Viewed the report “Feature adoption Q2”", when: "1 week ago" },
  ],
  "m-07": [
    { id: "a1", text: "Account suspended by Maya Okafor", when: "3 weeks ago" },
    { id: "a2", text: "Commented on LUM-172 “Slow query on events page”", when: "1 month ago" },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export function getActivity(id: string): ActivityItem[] {
  return activityByMember[id] ?? [];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
```

```tsx components/badges.tsx
import type { Role, Status } from "@/lib/data";

const roleStyles: Record<Role, string> = {
  Owner: "bg-violet-50 text-violet-800 ring-violet-600/25",
  Admin: "bg-indigo-50 text-indigo-800 ring-indigo-600/25",
  Member: "bg-sky-50 text-sky-800 ring-sky-600/25",
  Viewer: "bg-slate-100 text-slate-700 ring-slate-500/25",
};

const statusStyles: Record<Status, { badge: string; dot: string }> = {
  Active: { badge: "bg-emerald-50 text-emerald-800 ring-emerald-600/25", dot: "bg-emerald-500" },
  Invited: { badge: "bg-amber-50 text-amber-900 ring-amber-600/30", dot: "bg-amber-500" },
  Suspended: { badge: "bg-rose-50 text-rose-800 ring-rose-600/25", dot: "bg-rose-500" },
};

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap";

export function RoleBadge({ role }: { role: Role }) {
  return <span className={`${base} ${roleStyles[role]}`}>{role}</span>;
}

export function StatusBadge({ status }: { status: Status }) {
  const s = statusStyles[status];
  return (
    <span className={`${base} ${s.badge}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
```

```tsx components/avatar.tsx
import { getInitials } from "@/lib/data";

const palette = [
  "bg-indigo-100 text-indigo-800",
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-900",
  "bg-rose-100 text-rose-800",
  "bg-sky-100 text-sky-800",
  "bg-violet-100 text-violet-800",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "md" | "lg";
}) {
  const color = palette[hash(name) % palette.length];
  const dims = size === "lg" ? "size-20 text-2xl" : "size-10 text-sm";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${dims} ${color}`}
    >
      {getInitials(name)}
    </span>
  );
}
```

```tsx components/invite-dialog.tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { INVITE_ROLES, ROLE_DESCRIPTIONS, type Role } from "@/lib/data";

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string, role: Role) => void;
}

interface Errors {
  email?: string;
  role?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function InviteDialog({ open, onClose, onInvite }: InviteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function reset() {
    setEmail("");
    setRole("");
    setMessage("");
    setErrors({});
  }

  function validate(): Errors {
    const next: Errors = {};
    const trimmed = email.trim();
    if (!trimmed) next.email = "Enter an email address.";
    else if (!EMAIL_RE.test(trimmed)) next.email = "Enter a valid email address, like name@company.com.";
    if (!role) next.role = "Choose a role for the new member.";
    return next;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (next.email) {
      document.getElementById(`${uid}-email`)?.focus();
      return;
    }
    if (next.role) {
      document.getElementById(`${uid}-role`)?.focus();
      return;
    }
    onInvite(email.trim(), role as Role);
    reset();
    onClose();
  }

  function handleClose() {
    // Fires for Escape, form close and programmatic close.
    reset();
    onClose();
  }

  const fieldBase =
    "mt-1.5 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600";

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
      aria-labelledby={`${uid}-title`}
      aria-describedby={`${uid}-desc`}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/50"
    >
      <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={`${uid}-title`} className="text-lg font-semibold">
              Invite member
            </h2>
            <p id={`${uid}-desc`} className="mt-1 text-sm text-slate-600">
              They&apos;ll get an email with a link to join the Acme Labs workspace on Lumen.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close dialog"
            className="-m-1.5 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor={`${uid}-email`} className="text-sm font-medium text-slate-800">
              Email <span aria-hidden="true" className="text-rose-600">*</span>
            </label>
            <input
              id={`${uid}-email`}
              type="email"
              autoComplete="off"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@acmelabs.io"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? `${uid}-email-err` : undefined}
              className={`${fieldBase} ${errors.email ? "border-rose-500" : "border-slate-300"}`}
            />
            {errors.email && (
              <p id={`${uid}-email-err`} className="mt-1.5 text-sm text-rose-700">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={`${uid}-role`} className="text-sm font-medium text-slate-800">
              Role <span aria-hidden="true" className="text-rose-600">*</span>
            </label>
            <select
              id={`${uid}-role`}
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              aria-invalid={errors.role ? true : undefined}
              aria-describedby={errors.role ? `${uid}-role-err` : `${uid}-role-hint`}
              className={`${fieldBase} ${errors.role ? "border-rose-500" : "border-slate-300"}`}
            >
              <option value="">Select a role…</option>
              {INVITE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.role ? (
              <p id={`${uid}-role-err`} className="mt-1.5 text-sm text-rose-700">
                {errors.role}
              </p>
            ) : (
              <p id={`${uid}-role-hint`} className="mt-1.5 text-xs text-slate-500">
                {role ? ROLE_DESCRIPTIONS[role as Role] : "Roles control what someone can see and change."}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={`${uid}-message`} className="text-sm font-medium text-slate-800">
              Message <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              id={`${uid}-message`}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hey! We're tracking the launch issues in Lumen — come join us."
              className={`${fieldBase} border-slate-300 resize-none`}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Send invite
          </button>
        </div>
      </form>
    </dialog>
  );
}
```

```tsx components/row-actions.tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import type { Member } from "@/lib/data";

interface RowActionsProps {
  member: Member;
  onChangeRole: (member: Member) => void;
  onResendInvite: (member: Member) => void;
  onRemove: (member: Member) => void;
}

export function RowActions({ member, onChangeRole, onResendInvite, onRemove }: RowActionsProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const items: { label: string; danger?: boolean; run: () => void }[] = [
    { label: "Change role", run: () => onChangeRole(member) },
    ...(member.status === "Invited"
      ? [{ label: "Resend invite", run: () => onResendInvite(member) }]
      : []),
    { label: "Remove", danger: true, run: () => onRemove(member) },
  ];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    }
  }, [open]);

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }

  function onMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const els = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const idx = els.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      els[(idx + 1) % els.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      els[(idx - 1 + els.length) % els.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      els[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      els[els.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Actions for ${member.name}`}
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
      >
        <MoreHorizontal className="size-5" aria-hidden="true" />
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={`Actions for ${member.name}`}
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 z-20 mt-1 w-44 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                item.run();
                close(true);
              }}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm focus:outline-none focus-visible:bg-slate-100 hover:bg-slate-100 ${
                item.danger ? "text-rose-700" : "text-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

```tsx components/team-table.tsx
"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Search, UserPlus } from "lucide-react";
import {
  INVITE_ROLES,
  ROLES,
  formatDate,
  members as initialMembers,
  type Member,
  type Role,
} from "@/lib/data";
import { Avatar } from "@/components/avatar";
import { RoleBadge, StatusBadge } from "@/components/badges";
import { InviteDialog } from "@/components/invite-dialog";
import { RowActions } from "@/components/row-actions";

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() + p.slice(1))
    .join(" ");
}

export function TeamTable() {
  const [people, setPeople] = useState<Member[]>(initialMembers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | Role>("All");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [roleEditing, setRoleEditing] = useState<Member | null>(null);
  const nextId = useRef(initialMembers.length + 1);
  const uid = useId();
  const roleDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    const d = roleDialogRef.current;
    if (!d) return;
    if (roleEditing && !d.open) d.showModal();
    if (!roleEditing && d.open) d.close();
  }, [roleEditing]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people.filter((m) => {
      if (roleFilter !== "All" && m.role !== roleFilter) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    });
  }, [people, query, roleFilter]);

  function handleInvite(email: string, role: Role) {
    const id = `m-${String(nextId.current++).padStart(2, "0")}-new`;
    setPeople((prev) => [
      ...prev,
      { id, name: nameFromEmail(email), email, role, status: "Invited", joined: null },
    ]);
    setNotice(`Invitation sent to ${email}.`);
  }

  function applyRole(member: Member, role: Role) {
    setPeople((prev) => prev.map((m) => (m.id === member.id ? { ...m, role } : m)));
    setNotice(`${member.name} is now ${role === "Admin" ? "an" : "a"} ${role}.`);
    setRoleEditing(null);
  }

  return (
    <section aria-labelledby={`${uid}-heading`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 id={`${uid}-heading`} className="text-2xl font-semibold tracking-tight text-slate-900">
            Team
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage who has access to the Acme Labs workspace on Lumen.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <UserPlus className="size-4" aria-hidden="true" />
          Invite member
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor={`${uid}-search`} className="sr-only">
            Search members by name or email
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id={`${uid}-search`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-indigo-600"
          />
        </div>
        <div className="sm:w-48">
          <label htmlFor={`${uid}-role`} className="sr-only">
            Filter by role
          </label>
          <select
            id={`${uid}-role`}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "All" | Role)}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-indigo-600"
          >
            <option value="All">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-slate-600">
        {notice ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-800">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            {notice}
          </span>
        ) : (
          `Showing ${filtered.length} of ${people.length} members`
        )}
      </p>

      <div className="mt-2 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">Workspace members</caption>
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Member</th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Email</th>
                <th scope="col" className="px-4 py-3 font-medium">Role</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="w-14 px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} />
                      <div className="min-w-0">
                        <Link
                          href={`/members/${m.id}`}
                          className="font-medium text-slate-900 hover:text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-600"
                        >
                          {m.name}
                        </Link>
                        <div className="truncate text-slate-600 md:hidden">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{m.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={m.role} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RowActions
                      member={m}
                      onChangeRole={setRoleEditing}
                      onResendInvite={(member) => setNotice(`Invite resent to ${member.email}.`)}
                      onRemove={(member) => {
                        setPeople((prev) => prev.filter((p) => p.id !== member.id));
                        setNotice(`${member.name} was removed from the workspace.`);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="font-medium text-slate-900">No members match your filters</p>
            <p className="mt-1 text-sm text-slate-600">
              Try a different name or email, or reset the role filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setRoleFilter("All");
              }}
              className="mt-4 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={handleInvite} />

      <dialog
        ref={roleDialogRef}
        onClose={() => setRoleEditing(null)}
        onClick={(e) => {
          if (e.target === roleDialogRef.current) roleDialogRef.current?.close();
        }}
        aria-labelledby={`${uid}-role-title`}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/50"
      >
        {roleEditing && (
          <div className="p-5 sm:p-6">
            <h2 id={`${uid}-role-title`} className="text-lg font-semibold">
              Change role
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Choose a new role for {roleEditing.name}.
            </p>
            <ul className="mt-4 space-y-2">
              {[...(roleEditing.role === "Owner" ? (["Owner"] as Role[]) : []), ...INVITE_ROLES].map(
                (r) => (
                  <li key={r}>
                    <button
                      type="button"
                      onClick={() => applyRole(roleEditing, r)}
                      aria-pressed={roleEditing.role === r}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                        roleEditing.role === r
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-medium">{r}</span>
                      <span className="block text-xs text-slate-600">{ROLE_DESC(r)}</span>
                    </button>
                  </li>
                ),
              )}
            </ul>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => roleDialogRef.current?.close()}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}

import { ROLE_DESCRIPTIONS } from "@/lib/data";

function ROLE_DESC(r: Role): string {
  return ROLE_DESCRIPTIONS[r];
}
```

```tsx app/page.tsx
import { TeamTable } from "@/components/team-table";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 sm:px-6">
          <span
            aria-hidden="true"
            className="inline-flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
          >
            L
          </span>
          <span className="text-base font-semibold">Lumen</span>
          <span className="text-sm text-slate-500">/ Acme Labs</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <TeamTable />
      </main>
    </div>
  );
}
```

```tsx app/members/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Mail, ShieldCheck } from "lucide-react";
import { formatDate, getActivity, getMember, members, ROLE_DESCRIPTIONS } from "@/lib/data";
import { Avatar } from "@/components/avatar";
import { RoleBadge, StatusBadge } from "@/components/badges";

export function generateStaticParams() {
  return members.map((m) => ({ id: m.id }));
}

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const activity = getActivity(member.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3 sm:px-6">
          <span
            aria-hidden="true"
            className="inline-flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
          >
            L
          </span>
          <span className="text-base font-semibold">Lumen</span>
          <span className="text-sm text-slate-500">/ Acme Labs</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-slate-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to team
        </Link>

        <section
          aria-labelledby="profile-heading"
          className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Avatar name={member.name} size="lg" />
            <div className="min-w-0">
              <h1 id="profile-heading" className="text-2xl font-semibold tracking-tight">
                {member.name}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${member.email}`}
                  className="truncate hover:text-indigo-700 hover:underline"
                >
                  {member.email}
                </a>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <RoleBadge role={member.role} />
                <StatusBadge status={member.status} />
              </div>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Role
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {member.role}
                <span className="block text-slate-600">{ROLE_DESCRIPTIONS[member.role]}</span>
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Calendar className="size-4" aria-hidden="true" />
                Joined
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {member.joined ? (
                  <time dateTime={member.joined}>{formatDate(member.joined)}</time>
                ) : (
                  "Invitation pending"
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="activity-heading"
          className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 id="activity-heading" className="text-lg font-semibold">
            Recent activity
          </h2>
          {activity.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              {member.status === "Invited"
                ? `${member.name} hasn't accepted the invitation yet, so there's no activity to show.`
                : "No recent activity."}
            </p>
          ) : (
            <ol className="mt-4 divide-y divide-slate-100">
              {activity.map((a) => (
                <li key={a.id} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:justify-between sm:gap-4">
                  <span className="text-sm text-slate-900">{a.text}</span>
                  <span className="shrink-0 text-sm text-slate-500">{a.when}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}
```