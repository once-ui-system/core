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
