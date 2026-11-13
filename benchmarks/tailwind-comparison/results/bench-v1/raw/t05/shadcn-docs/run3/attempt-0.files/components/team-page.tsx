"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  MailIcon,
  MoreHorizontalIcon,
  SearchIcon,
  ShieldIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { MemberAvatar, RoleBadge, StatusBadge } from "@/components/member-badges";
import {
  ASSIGNABLE_ROLES,
  MEMBERS,
  nameFromEmail,
  ROLES,
  type Member,
  type Role,
} from "@/lib/data";

type RoleFilter = Role | "all";

export function TeamPage() {
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [roleTarget, setRoleTarget] = useState<Member | null>(null);
  const [pendingRole, setPendingRole] = useState<Role>("Member");
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (roleFilter !== "all" && m.role !== roleFilter) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    });
  }, [members, query, roleFilter]);

  function handleInvite(invite: { email: string; role: Role; message: string }) {
    setMembers((prev) => [
      ...prev,
      {
        id: `m-new-${prev.length + 1}`,
        name: nameFromEmail(invite.email),
        email: invite.email,
        role: invite.role,
        status: "Invited",
        joined: null,
      },
    ]);
  }

  function openChangeRole(member: Member) {
    setPendingRole(member.role);
    setRoleTarget(member);
  }

  function confirmChangeRole() {
    if (!roleTarget) return;
    const target = roleTarget;
    setMembers((prev) => prev.map((m) => (m.id === target.id ? { ...m, role: pendingRole } : m)));
    toast.success(`${target.name} is now ${pendingRole === "Admin" ? "an" : "a"} ${pendingRole}`);
    setRoleTarget(null);
  }

  function confirmRemove() {
    if (!removeTarget) return;
    const target = removeTarget;
    setMembers((prev) => prev.filter((m) => m.id !== target.id));
    toast.success(`${target.name} was removed from the team`);
    setRemoveTarget(null);
  }

  function resetFilters() {
    setQuery("");
    setRoleFilter("all");
  }

  const invitedCount = members.filter((m) => m.status === "Invited").length;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">Lumen · Acme Labs</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Team</h1>
          <p className="text-sm text-muted-foreground">
            {members.length} {members.length === 1 ? "person" : "people"} in your workspace
            {invitedCount > 0 ? `, ${invitedCount} pending invite${invitedCount === 1 ? "" : "s"}` : ""}.
          </p>
        </div>
        <InviteMemberDialog
          existingEmails={members.map((m) => m.email)}
          onInvite={handleInvite}
        />
      </header>

      <section aria-label="Filter team members" className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field className="sm:max-w-sm">
          <FieldLabel htmlFor="member-search" className="sr-only">
            Search members
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              id="member-search"
              type="search"
              placeholder="Search by name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </InputGroup>
        </Field>
        <Field className="sm:w-48">
          <FieldLabel htmlFor="role-filter" className="sr-only">
            Filter by role
          </FieldLabel>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
            <SelectTrigger id="role-filter" className="w-full">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                <SelectItem value="all">All roles</SelectItem>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </section>

      <p className="sr-only" role="status" aria-live="polite">
        Showing {filtered.length} of {members.length} members
      </p>

      <div className="rounded-xl border bg-card">
        {filtered.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UsersIcon />
              </EmptyMedia>
              <EmptyTitle>No members found</EmptyTitle>
              <EmptyDescription>
                Nobody matches your search and role filter. Try a different name or clear the
                filters.
              </EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" onClick={resetFilters}>
              Clear filters
            </Button>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Member</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="w-12 pr-4">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="py-3 pl-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <MemberAvatar name={member.name} />
                      <div className="flex min-w-0 flex-col">
                        {member.id.startsWith("m-new-") ? (
                          <span className="truncate font-medium">{member.name}</span>
                        ) : (
                          <Link
                            href={`/members/${member.id}`}
                            className="truncate rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                          >
                            {member.name}
                          </Link>
                        )}
                        <span className="truncate text-xs text-muted-foreground md:hidden">
                          {member.email}
                        </span>
                        <span className="mt-1 sm:hidden">
                          <StatusBadge status={member.status} />
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={member.role} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StatusBadge status={member.status} />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${member.name}`}>
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            disabled={member.role === "Owner"}
                            onSelect={() => openChangeRole(member)}
                          >
                            <ShieldIcon />
                            Change role
                          </DropdownMenuItem>
                          {member.status === "Invited" ? (
                            <DropdownMenuItem
                              onSelect={() => toast.success(`Invitation resent to ${member.email}`)}
                            >
                              <MailIcon />
                              Resend invite
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={member.role === "Owner"}
                            onSelect={() => setRemoveTarget(member)}
                          >
                            <Trash2Icon />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={roleTarget !== null} onOpenChange={(o) => !o && setRoleTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
            <DialogDescription>
              Choose a new role for {roleTarget?.name}. The change applies immediately.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="change-role-select">Role</FieldLabel>
            <Select value={pendingRole} onValueChange={(v) => setPendingRole(v as Role)}>
              <SelectTrigger id="change-role-select" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleTarget(null)}>
              Cancel
            </Button>
            <Button onClick={confirmChangeRole}>Save role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={removeTarget !== null} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removeTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They will lose access to your Lumen workspace right away. Their past activity stays in
              the issue history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmRemove}>
              Remove member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
