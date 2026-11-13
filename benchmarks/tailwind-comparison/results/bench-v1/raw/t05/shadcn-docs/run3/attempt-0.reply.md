```ts lib/data.ts
export type Role = "Owner" | "Admin" | "Member" | "Viewer";
export type Status = "Active" | "Invited" | "Suspended";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  /** ISO date (YYYY-MM-DD) or null when the invite has not been accepted. */
  joined: string | null;
}

export interface ActivityItem {
  id: string;
  action: string;
  target: string;
  when: string;
}

export const PRODUCT_NAME = "Lumen";

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];
export const ASSIGNABLE_ROLES: Role[] = ["Admin", "Member", "Viewer"];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full control of the workspace, billing and members.",
  Admin: "Manage members, projects and integrations.",
  Member: "Create and edit issues, dashboards and reports.",
  Viewer: "Read-only access to dashboards and issues.",
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

const ACTIVITY: Record<string, ActivityItem[]> = {
  "m-01": [
    { id: "a1", action: "Updated billing plan to", target: "Team (annual)", when: "2 days ago" },
    { id: "a2", action: "Invited", target: "ines@acmelabs.io", when: "5 days ago" },
    { id: "a3", action: "Created project", target: "Checkout funnel", when: "2 weeks ago" },
  ],
  "m-02": [
    { id: "a1", action: "Closed issue", target: "LUM-214 Funnel chart drops last step", when: "3 hours ago" },
    { id: "a2", action: "Changed role of Leo Brandt to", target: "Member", when: "Yesterday" },
    { id: "a3", action: "Connected integration", target: "GitHub: acme-labs/web", when: "4 days ago" },
    { id: "a4", action: "Published dashboard", target: "Weekly retention", when: "1 week ago" },
    { id: "a5", action: "Commented on", target: "LUM-198 Slow session replay load", when: "2 weeks ago" },
  ],
  "m-03": [
    { id: "a1", action: "Opened issue", target: "LUM-221 Export CSV misses timezone column", when: "Yesterday" },
    { id: "a2", action: "Edited dashboard", target: "Activation metrics", when: "3 days ago" },
  ],
  "m-04": [
    { id: "a1", action: "Merged fix for", target: "LUM-209 Duplicate events on retry", when: "Today" },
    { id: "a2", action: "Commented on", target: "LUM-214 Funnel chart drops last step", when: "2 days ago" },
    { id: "a3", action: "Created report", target: "Mobile crash rate", when: "1 week ago" },
  ],
  "m-05": [],
  "m-06": [
    { id: "a1", action: "Viewed dashboard", target: "Weekly retention", when: "Yesterday" },
    { id: "a2", action: "Viewed issue", target: "LUM-221 Export CSV misses timezone column", when: "4 days ago" },
  ],
  "m-07": [
    { id: "a1", action: "Account suspended by", target: "Daniel Reyes", when: "3 weeks ago" },
    { id: "a2", action: "Closed issue", target: "LUM-176 Tooltip clipped on small screens", when: "1 month ago" },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

export function getActivity(id: string): ActivityItem[] {
  return ACTIVITY[id] ?? [];
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Formats an ISO date (YYYY-MM-DD) deterministically, e.g. "19 May 2024". */
export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
```

```tsx components/member-badges.tsx
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials, type Role, type Status } from "@/lib/data";

export function RoleBadge({ role }: { role: Role }) {
  const variant = role === "Owner" ? "default" : role === "Admin" ? "secondary" : "outline";
  return <Badge variant={variant}>{role}</Badge>;
}

export function StatusBadge({ status }: { status: Status }) {
  if (status === "Active") {
    return (
      <Badge variant="secondary">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
        Active
      </Badge>
    );
  }
  if (status === "Invited") {
    return (
      <Badge variant="outline">
        <span aria-hidden="true" className="size-1.5 rounded-full border border-muted-foreground" />
        Invited
      </Badge>
    );
  }
  return <Badge variant="destructive">Suspended</Badge>;
}

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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
import { ASSIGNABLE_ROLES, ROLE_DESCRIPTIONS, type Role } from "@/lib/data";

interface FormErrors {
  email?: string;
  role?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Enter an email address.";
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address, like name@company.com.";
  return undefined;
}

export function InviteMemberDialog({
  existingEmails,
  onInvite,
}: {
  existingEmails: string[];
  onInvite: (invite: { email: string; role: Role; message: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function reset() {
    setEmail("");
    setRole("");
    setMessage("");
    setErrors({});
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: FormErrors = {};
    let emailError = validateEmail(email);
    if (
      !emailError &&
      existingEmails.some((e) => e.toLowerCase() === email.trim().toLowerCase())
    ) {
      emailError = "This person is already on your team.";
    }
    if (emailError) next.email = emailError;
    if (!role) next.role = "Choose a role for this person.";
    setErrors(next);
    if (next.email || next.role || !role) return;

    onInvite({ email: email.trim(), role, message: message.trim() });
    toast.success(`Invitation sent to ${email.trim()}`);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <SendIcon data-icon="inline-start" />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            They&apos;ll get an email with a link to join your Lumen workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <FieldGroup className="gap-5">
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input
                id="invite-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="off"
                placeholder="teammate@acmelabs.io"
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
                  setRole(value as Role);
                  if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
                }}
                name="role"
              >
                <SelectTrigger
                  id="invite-role"
                  className="w-full"
                  aria-invalid={errors.role ? true : undefined}
                  aria-describedby={errors.role ? "invite-role-error" : undefined}
                  aria-required="true"
                >
                  <SelectValue placeholder="Select a role" />
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
              {errors.role ? (
                <FieldError id="invite-role-error">{errors.role}</FieldError>
              ) : (
                <FieldDescription>
                  {role ? ROLE_DESCRIPTIONS[role] : "Roles control what they can see and change."}
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
                placeholder="Hi! I've set up our Lumen workspace and would love your help triaging issues."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={300}
                rows={3}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Send invite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

```tsx components/team-page.tsx
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
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { TeamPage } from "@/components/team-page";

export const metadata: Metadata = {
  title: "Team · Lumen",
  description: "Manage who has access to your Lumen workspace.",
};

export default function Page() {
  return <TeamPage />;
}
```

```tsx app/members/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, CalendarIcon, MailIcon, ShieldIcon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { MemberAvatar, RoleBadge, StatusBadge } from "@/components/member-badges";
import {
  formatDate,
  getActivity,
  getMember,
  MEMBERS,
  ROLE_DESCRIPTIONS,
} from "@/lib/data";

type PageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const member = getMember(id);
  return { title: member ? `${member.name} · Lumen` : "Member not found · Lumen" };
}

export default async function MemberPage({ params }: PageProps) {
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
          <Button asChild variant="ghost" size="sm" className="-ml-2">
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
            <CardDescription>Account details for this workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <MailIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium break-all">{member.email}</dd>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <ShieldIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-col gap-0.5">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="font-medium">{member.role}</dd>
                  <dd className="text-muted-foreground">{ROLE_DESCRIPTIONS[member.role]}</dd>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <CalendarIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-col gap-0.5">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium">{member.status}</dd>
                  <dt className="mt-3 text-muted-foreground">Joined</dt>
                  <dd className="font-medium">{formatDate(member.joined)}</dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest actions by {member.name.split(" ")[0]} in Lumen.</CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <Empty className="border p-6 md:p-8">
                <EmptyHeader>
                  <EmptyTitle>No activity yet</EmptyTitle>
                  <EmptyDescription>
                    {member.status === "Invited"
                      ? `${member.name.split(" ")[0]} hasn't accepted the invitation yet.`
                      : "Nothing to show for this person."}
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
                    <div className="flex min-w-0 flex-col gap-0.5 pb-5 text-sm">
                      <p>
                        {item.action} <span className="font-medium">{item.target}</span>
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