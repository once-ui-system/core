```ts lib/data.ts
export const ROLES = ["Owner", "Admin", "Member", "Viewer"] as const;
export type Role = (typeof ROLES)[number];

export const STATUSES = ["Active", "Invited", "Suspended"] as const;
export type Status = (typeof STATUSES)[number];

export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joined: string | null;
};

export type Activity = {
  id: string;
  action: string;
  target: string;
  when: string;
};

export const PRODUCT = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
  workspace: "Acme Labs",
};

export const MEMBERS: Member[] = [
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

const ACTIVITY: Record<string, Activity[]> = {
  "m-01": [
    { id: "a1", action: "Updated billing plan to", target: "Team (10 seats)", when: "2 days ago" },
    { id: "a2", action: "Promoted Daniel Reyes to", target: "Admin", when: "3 weeks ago" },
    { id: "a3", action: "Created dashboard", target: "Weekly activation funnel", when: "1 month ago" },
  ],
  "m-02": [
    { id: "b1", action: "Resolved issue", target: "LUM-482 Funnel chart drops last day of range", when: "3 hours ago" },
    { id: "b2", action: "Invited Hana Sato as", target: "Member", when: "Yesterday" },
    { id: "b3", action: "Created dashboard", target: "Retention by signup cohort", when: "4 days ago" },
    { id: "b4", action: "Commented on", target: "LUM-471 Slow event ingestion on large workspaces", when: "1 week ago" },
    { id: "b5", action: "Changed role of Leo Brandt to", target: "Member", when: "3 weeks ago" },
  ],
  "m-03": [
    { id: "c1", action: "Opened issue", target: "LUM-490 Export to CSV ignores filters", when: "5 hours ago" },
    { id: "c2", action: "Commented on", target: "LUM-482 Funnel chart drops last day of range", when: "Yesterday" },
    { id: "c3", action: "Saved report", target: "Feature adoption by plan", when: "6 days ago" },
  ],
  "m-04": [
    { id: "d1", action: "Closed issue", target: "LUM-476 Tooltip clipped on mobile charts", when: "2 days ago" },
    { id: "d2", action: "Opened issue", target: "LUM-488 Add dark mode to shared dashboards", when: "1 week ago" },
  ],
  "m-05": [],
  "m-06": [
    { id: "f1", action: "Viewed dashboard", target: "Weekly activation funnel", when: "Yesterday" },
    { id: "f2", action: "Viewed report", target: "Feature adoption by plan", when: "1 week ago" },
  ],
  "m-07": [
    { id: "g1", action: "Account suspended by", target: "Daniel Reyes", when: "2 weeks ago" },
    { id: "g2", action: "Resolved issue", target: "LUM-455 Duplicate events from retry logic", when: "3 weeks ago" },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

export function getActivity(id: string): Activity[] {
  return ACTIVITY[id] ?? [];
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatJoined(joined: string | null): string {
  if (!joined) return "Not joined yet";
  const [year, month, day] = joined.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full access, including billing and workspace deletion.",
  Admin: "Manage members, projects and integrations.",
  Member: "Create and edit dashboards, reports and issues.",
  Viewer: "Read-only access to dashboards and issues.",
};
```

```tsx components/member-badges.tsx
import { Badge } from "@/components/ui/badge";
import type { Role, Status } from "@/lib/data";

export function RoleBadge({ role }: { role: Role }) {
  return <Badge variant={role === "Owner" ? "default" : "secondary"}>{role}</Badge>;
}

export function StatusBadge({ status }: { status: Status }) {
  const variant =
    status === "Active" ? "outline" : status === "Suspended" ? "destructive" : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}
```

```tsx components/member-avatar.tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/data";
import { cn } from "@/lib/utils";

export function MemberAvatar({
  name,
  size = "default",
  className,
}: {
  name: string;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  return (
    <Avatar size={size} className={cn(className)}>
      <AvatarFallback aria-hidden="true">{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}
```

```tsx components/invite-member-dialog.tsx
"use client";

import { useState } from "react";
import { SendIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ROLE_DESCRIPTIONS, ROLES, type Role } from "@/lib/data";

type Errors = { email?: string; role?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Owner is not assignable through an invite.
const INVITABLE_ROLES = ROLES.filter((r) => r !== "Owner");

export function InviteMemberDialog({
  open,
  onOpenChange,
  existingEmails,
  onInvite,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingEmails: string[];
  onInvite: (email: string, role: Role) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function reset() {
    setEmail("");
    setRole("");
    setMessage("");
    setErrors({});
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function validate(): Errors {
    const next: Errors = {};
    const trimmed = email.trim();
    if (!trimmed) {
      next.email = "Enter an email address.";
    } else if (!EMAIL_PATTERN.test(trimmed)) {
      next.email = "Enter a valid email address, like name@company.com.";
    } else if (existingEmails.includes(trimmed.toLowerCase())) {
      next.email = "This person is already on your team.";
    }
    if (!role) next.role = "Choose a role for this person.";
    return next;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const trimmed = email.trim();
    onInvite(trimmed, role as Role);
    toast.success(`Invitation sent to ${trimmed}`, {
      description: `They'll join as ${role}.`,
    });
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            They&apos;ll get an email with a link to join the Acme Labs workspace on Lumen.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <FieldGroup>
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="invite-email">Email address</FieldLabel>
              <Input
                id="invite-email"
                name="email"
                type="email"
                autoComplete="off"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "invite-email-error" : undefined}
                aria-required="true"
              />
              {errors.email ? (
                <FieldError id="invite-email-error">{errors.email}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={errors.role ? true : undefined}>
              <FieldLabel htmlFor="invite-role">Role</FieldLabel>
              <Select
                value={role}
                onValueChange={(value) => {
                  setRole(value);
                  if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
                }}
              >
                <SelectTrigger
                  id="invite-role"
                  className="w-full"
                  aria-invalid={errors.role ? true : undefined}
                  aria-describedby={errors.role ? "invite-role-error" : "invite-role-hint"}
                  aria-required="true"
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {INVITABLE_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.role ? (
                <FieldError id="invite-role-error">{errors.role}</FieldError>
              ) : (
                <FieldDescription id="invite-role-hint">
                  {role ? ROLE_DESCRIPTIONS[role as Role] : "You can change this later."}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="invite-message">
                Message <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="invite-message"
                name="message"
                rows={3}
                placeholder="Hey! We're tracking launch issues in Lumen — join us there."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <SendIcon data-icon="inline-start" />
              Send invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

```tsx components/change-role-dialog.tsx
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_DESCRIPTIONS, ROLES, type Member, type Role } from "@/lib/data";

export function ChangeRoleDialog({
  member,
  onClose,
  onSave,
}: {
  member: Member | null;
  onClose: () => void;
  onSave: (id: string, role: Role) => void;
}) {
  return (
    <Dialog open={member !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {member ? (
          <ChangeRoleForm key={member.id} member={member} onClose={onClose} onSave={onSave} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ChangeRoleForm({
  member,
  onClose,
  onSave,
}: {
  member: Member;
  onClose: () => void;
  onSave: (id: string, role: Role) => void;
}) {
  const [role, setRole] = useState<Role>(member.role);

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(member.id, role);
      }}
    >
      <DialogHeader>
        <DialogTitle>Change role</DialogTitle>
        <DialogDescription>
          Choose what {member.name} can do in the Acme Labs workspace.
        </DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="change-role-select">Role</FieldLabel>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger id="change-role-select" className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>{ROLE_DESCRIPTIONS[role]}</FieldDescription>
        </Field>
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={role === member.role}>
          Save role
        </Button>
      </DialogFooter>
    </form>
  );
}
```

```tsx components/members-table.tsx
"use client";

import Link from "next/link";
import {
  MailIcon,
  MoreHorizontalIcon,
  ShieldIcon,
  Trash2Icon,
  UserPlusIcon,
  UsersIcon,
  SearchIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ChangeRoleDialog } from "@/components/change-role-dialog";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { MemberAvatar } from "@/components/member-avatar";
import { RoleBadge, StatusBadge } from "@/components/member-badges";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
import { MEMBERS, ROLES, type Member, type Role } from "@/lib/data";

const ALL_ROLES = "all";

export function MembersTable() {
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(ALL_ROLES);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<Member | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const matchesRole = roleFilter === ALL_ROLES || m.role === roleFilter;
      const matchesQuery =
        !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
  }, [members, query, roleFilter]);

  const hasFilters = query.trim() !== "" || roleFilter !== ALL_ROLES;

  function handleInvite(email: string, role: Role) {
    const local = email.split("@")[0] ?? email;
    const name = local
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    setMembers((prev) => [
      ...prev,
      {
        id: `m-new-${prev.length + 1}`,
        name: name || email,
        email: email.toLowerCase(),
        role,
        status: "Invited",
        joined: null,
      },
    ]);
  }

  function handleSaveRole(id: string, role: Role) {
    const target = members.find((m) => m.id === id);
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
    setRoleTarget(null);
    if (target) toast.success(`${target.name} is now ${role}`);
  }

  function handleRemove() {
    if (!removeTarget) return;
    const target = removeTarget;
    setMembers((prev) => prev.filter((m) => m.id !== target.id));
    setRemoveTarget(null);
    toast.success(`${target.name} was removed from the team`);
  }

  function handleResend(member: Member) {
    toast.success(`Invitation resent to ${member.email}`);
  }

  function clearFilters() {
    setQuery("");
    setRoleFilter(ALL_ROLES);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="sm:max-w-sm">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            placeholder="Search by name or email"
            aria-label="Search members by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by role">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL_ROLES}>All roles</SelectItem>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground sm:ml-auto" aria-live="polite">
          {filtered.length} of {members.length} {members.length === 1 ? "member" : "members"}
        </p>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlusIcon data-icon="inline-start" />
          Invite member
        </Button>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <CardContent className="px-0">
          {filtered.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UsersIcon />
                </EmptyMedia>
                <EmptyTitle>No members found</EmptyTitle>
                <EmptyDescription>
                  {hasFilters
                    ? "Nobody matches your search and role filter. Try a different name or clear the filters."
                    : "Invite your first teammate to start collaborating on Lumen."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                {hasFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={() => setInviteOpen(true)}>
                    <UserPlusIcon data-icon="inline-start" />
                    Invite member
                  </Button>
                )}
              </EmptyContent>
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
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <MemberAvatar name={member.name} />
                        <div className="flex min-w-0 flex-col">
                          <Link
                            href={`/members/${member.id}`}
                            className="truncate font-medium underline-offset-4 outline-none hover:underline focus-visible:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                          >
                            {member.name}
                          </Link>
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
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${member.name}`}
                          >
                            <MoreHorizontalIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{member.name}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem onSelect={() => setRoleTarget(member)}>
                              <ShieldIcon />
                              Change role
                            </DropdownMenuItem>
                            {member.status === "Invited" ? (
                              <DropdownMenuItem onSelect={() => handleResend(member)}>
                                <MailIcon />
                                Resend invite
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              variant="destructive"
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
        </CardContent>
      </Card>

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        existingEmails={members.map((m) => m.email.toLowerCase())}
        onInvite={handleInvite}
      />

      <ChangeRoleDialog
        member={roleTarget}
        onClose={() => setRoleTarget(null)}
        onSave={handleSaveRole}
      />

      <AlertDialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removeTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget?.name} will lose access to the Acme Labs workspace right away. Their
              dashboards and issues stay in Lumen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleRemove}>
              Remove member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

```tsx app/page.tsx
import { MembersTable } from "@/components/members-table";
import { PRODUCT } from "@/lib/data";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">
          {PRODUCT.name} &middot; {PRODUCT.workspace}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Team</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Manage who can view dashboards, triage issues and administer the {PRODUCT.workspace}{" "}
          workspace.
        </p>
      </header>
      <MembersTable />
    </main>
  );
}
```

```tsx app/members/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, CalendarIcon, MailIcon, ShieldIcon } from "lucide-react";

import { MemberAvatar } from "@/components/member-avatar";
import { RoleBadge, StatusBadge } from "@/components/member-badges";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
  MEMBERS,
  ROLE_DESCRIPTIONS,
  formatJoined,
  getActivity,
  getMember,
} from "@/lib/data";
import { ActivityIcon } from "lucide-react";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return MEMBERS.map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = getMember(id);
  return { title: member ? `${member.name} · Team · Lumen` : "Member not found · Lumen" };
}

export default async function MemberPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const activity = getActivity(member.id);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Team</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{member.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2.5">
            <Link href="/">
              <ArrowLeftIcon data-icon="inline-start" />
              Back to team
            </Link>
          </Button>
        </div>
      </div>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <MemberAvatar name={member.name} size="lg" className="size-16 text-xl" />
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{member.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge role={member.role} />
            <StatusBadge status={member.status} />
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Account details in the Acme Labs workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <MailIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium break-words">{member.email}</dd>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <ShieldIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="flex flex-col gap-1">
                    <span className="font-medium">{member.role}</span>
                    <span className="text-muted-foreground">{ROLE_DESCRIPTIONS[member.role]}</span>
                  </dd>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <span
                  className="mt-1.5 inline-block size-2 shrink-0 rounded-full bg-muted-foreground"
                  aria-hidden="true"
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium">{member.status}</dd>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <CalendarIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-muted-foreground">Joined</dt>
                  <dd className="font-medium">
                    {member.joined ? (
                      <time dateTime={member.joined}>{formatJoined(member.joined)}</time>
                    ) : (
                      "Invitation pending"
                    )}
                  </dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Latest actions by {member.name.split(" ")[0]} in Lumen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <Empty className="border p-6 md:p-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ActivityIcon />
                  </EmptyMedia>
                  <EmptyTitle>No activity yet</EmptyTitle>
                  <EmptyDescription>
                    {member.status === "Invited"
                      ? `Activity will show up here once ${member.name.split(" ")[0]} accepts the invitation.`
                      : "Nothing to show for this member yet."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ol className="flex flex-col">
                {activity.map((item, index) => (
                  <li key={item.id} className="flex gap-3">
                    <div className="flex flex-col items-center" aria-hidden="true">
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                      {index < activity.length - 1 ? (
                        <span className="w-px flex-1 bg-border" />
                      ) : null}
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5 pb-5">
                      <p className="text-sm">
                        <span className="text-muted-foreground">{item.action}</span>{" "}
                        <span className="font-medium">{item.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{item.when}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
```

```tsx app/members/[id]/not-found.tsx
import Link from "next/link";
import { UserXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function MemberNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center px-4 py-12 sm:px-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserXIcon />
          </EmptyMedia>
          <EmptyTitle>Member not found</EmptyTitle>
          <EmptyDescription>
            This person isn&apos;t on the Acme Labs team, or they were removed.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/">Back to team</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
```