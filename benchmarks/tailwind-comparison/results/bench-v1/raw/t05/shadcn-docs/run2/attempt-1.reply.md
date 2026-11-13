The tsconfig and aliases are fine. The problem is that my earlier reply never saved the helper files, so `lib/data.ts`, `components/team/*` and the `members` route don't exist on disk. I'm resending every file in full. I also removed a redundant ternary in the activity list.

```ts lib/data.ts
export type Role = "Owner" | "Admin" | "Member" | "Viewer"
export type Status = "Active" | "Invited" | "Suspended"

export type Member = {
  id: string
  name: string
  email: string
  role: Role
  status: Status
  joined: string | null
}

export type ActivityItem = {
  id: string
  summary: string
  detail: string
  date: string
}

export const PRODUCT_NAME = "Lumen"
export const PRODUCT_TAGLINE =
  "Product analytics and issue tracking for small software teams"

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"]
export const INVITABLE_ROLES: Role[] = ["Admin", "Member", "Viewer"]

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full control, including billing and workspace deletion.",
  Admin: "Manages members, projects and integrations.",
  Member: "Creates and edits dashboards, issues and reports.",
  Viewer: "Read-only access to dashboards and issues.",
}

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
]

const activityByMember: Record<string, ActivityItem[]> = {
  "m-01": [
    {
      id: "a-01-1",
      summary: "Updated workspace billing contact",
      detail: "Billing → Acme Labs finance team",
      date: "2025-09-12",
    },
    {
      id: "a-01-2",
      summary: "Promoted Daniel Reyes to Admin",
      detail: "Team settings",
      date: "2025-08-30",
    },
    {
      id: "a-01-3",
      summary: "Created the “Q3 retention” dashboard",
      detail: "Dashboards",
      date: "2025-08-21",
    },
  ],
  "m-02": [
    {
      id: "a-02-1",
      summary: "Closed issue LUM-214 “Funnel drops on step 3”",
      detail: "Issues · Checkout funnel",
      date: "2025-09-14",
    },
    {
      id: "a-02-2",
      summary: "Connected the Slack integration",
      detail: "Integrations · #lumen-alerts",
      date: "2025-09-10",
    },
    {
      id: "a-02-3",
      summary: "Invited Hana Sato as Member",
      detail: "Team settings",
      date: "2025-09-08",
    },
    {
      id: "a-02-4",
      summary: "Edited the “Weekly active users” chart",
      detail: "Dashboards · Growth overview",
      date: "2025-09-02",
    },
  ],
  "m-03": [
    {
      id: "a-03-1",
      summary: "Commented on LUM-231 “Session replay lag”",
      detail: "Issues",
      date: "2025-09-13",
    },
    {
      id: "a-03-2",
      summary: "Saved the “Onboarding completion” report",
      detail: "Reports",
      date: "2025-09-05",
    },
  ],
  "m-04": [
    {
      id: "a-04-1",
      summary: "Opened issue LUM-238 “CSV export times out”",
      detail: "Issues · Data exports",
      date: "2025-09-11",
    },
    {
      id: "a-04-2",
      summary: "Added a funnel to “Growth overview”",
      detail: "Dashboards",
      date: "2025-09-03",
    },
  ],
  "m-05": [],
  "m-06": [
    {
      id: "a-06-1",
      summary: "Viewed the “Q3 retention” dashboard",
      detail: "Dashboards",
      date: "2025-09-09",
    },
  ],
  "m-07": [
    {
      id: "a-07-1",
      summary: "Account suspended by an admin",
      detail: "Team settings",
      date: "2025-08-18",
    },
    {
      id: "a-07-2",
      summary: "Resolved issue LUM-197 “Wrong timezone on weekly digest”",
      detail: "Issues",
      date: "2025-08-15",
    },
  ],
  "m-08": [],
}

export function getMember(id: string): Member | undefined {
  return members.find((m) => m.id === id)
}

export function getActivity(id: string): ActivityItem[] {
  return activityByMember[id] ?? []
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0]?.charAt(0) ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : ""
  return (first + last).toUpperCase()
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})

export function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`))
}
```

```tsx components/team/member-badges.tsx
import { Badge } from "@/components/ui/badge"
import type { Role, Status } from "@/lib/data"

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge variant={role === "Owner" ? "default" : "secondary"}>{role}</Badge>
  )
}

export function StatusBadge({ status }: { status: Status }) {
  const variant =
    status === "Active"
      ? "outline"
      : status === "Suspended"
        ? "destructive"
        : "secondary"
  return <Badge variant={variant}>{status}</Badge>
}
```

```tsx components/team/invite-member-dialog.tsx
"use client"

import { useState } from "react"
import { SendIcon, UserPlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  INVITABLE_ROLES,
  ROLE_DESCRIPTIONS,
  type Member,
  type Role,
} from "@/lib/data"

type Errors = {
  email?: string
  role?: string
  message?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MESSAGE_LIMIT = 280

function validate(
  email: string,
  role: string,
  message: string,
  existing: Member[]
): Errors {
  const errors: Errors = {}
  const trimmed = email.trim()
  if (!trimmed) {
    errors.email = "Enter an email address."
  } else if (!EMAIL_PATTERN.test(trimmed)) {
    errors.email = "Enter a valid email address, like name@company.com."
  } else if (
    existing.some((m) => m.email.toLowerCase() === trimmed.toLowerCase())
  ) {
    errors.email = "This person is already on the team."
  }
  if (!role) {
    errors.role = "Choose a role for the new member."
  }
  if (message.length > MESSAGE_LIMIT) {
    errors.message = `Keep the message under ${MESSAGE_LIMIT} characters.`
  }
  return errors
}

export function InviteMemberDialog({
  existing,
  onInvite,
}: {
  existing: Member[]
  onInvite: (input: { email: string; role: Role; message: string }) => void
}) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)

  function reset() {
    setEmail("")
    setRole("")
    setMessage("")
    setErrors({})
    setSubmitted(false)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) reset()
  }

  function revalidate(nextEmail: string, nextRole: string, nextMessage: string) {
    if (submitted) {
      setErrors(validate(nextEmail, nextRole, nextMessage, existing))
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    const found = validate(email, role, message, existing)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    onInvite({
      email: email.trim(),
      role: role as Role,
      message: message.trim(),
    })
    toast.success("Invitation sent", {
      description: `${email.trim()} was invited as ${role}.`,
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlusIcon data-icon="inline-start" />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} noValidate className="grid gap-6">
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
            <DialogDescription>
              They&apos;ll get an email with a link to join your Lumen
              workspace.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input
                id="invite-email"
                name="email"
                type="email"
                autoComplete="off"
                placeholder="teammate@acmelabs.io"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  revalidate(e.target.value, role, message)
                }}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "invite-email-error" : undefined}
                aria-required="true"
              />
              <FieldError id="invite-email-error">{errors.email}</FieldError>
            </Field>

            <Field data-invalid={errors.role ? true : undefined}>
              <FieldLabel htmlFor="invite-role">Role</FieldLabel>
              <Select
                value={role}
                onValueChange={(value) => {
                  setRole(value)
                  revalidate(email, value, message)
                }}
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
                    {INVITABLE_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {role ? (
                <FieldDescription>
                  {ROLE_DESCRIPTIONS[role as Role]}
                </FieldDescription>
              ) : null}
              <FieldError id="invite-role-error">{errors.role}</FieldError>
            </Field>

            <Field data-invalid={errors.message ? true : undefined}>
              <FieldLabel htmlFor="invite-message">
                Message{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Textarea
                id="invite-message"
                name="message"
                rows={3}
                placeholder="Hey! We're tracking our Q4 launch in Lumen. Join us."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  revalidate(email, role, e.target.value)
                }}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={
                  errors.message ? "invite-message-error" : undefined
                }
              />
              <FieldError id="invite-message-error">{errors.message}</FieldError>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              <SendIcon data-icon="inline-start" />
              Send invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

```tsx components/team/member-actions.tsx
"use client"

import { useState } from "react"
import {
  MailIcon,
  MoreHorizontalIcon,
  ShieldIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ROLES, ROLE_DESCRIPTIONS, type Member, type Role } from "@/lib/data"

export function MemberActions({
  member,
  onChangeRole,
  onResendInvite,
  onRemove,
}: {
  member: Member
  onChangeRole: (id: string, role: Role) => void
  onResendInvite: (id: string) => void
  onRemove: (id: string) => void
}) {
  const [roleOpen, setRoleOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [pendingRole, setPendingRole] = useState<Role>(member.role)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontalIcon />
            <span className="sr-only">Actions for {member.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => {
                setPendingRole(member.role)
                setRoleOpen(true)
              }}
            >
              <ShieldIcon />
              Change role
            </DropdownMenuItem>
            {member.status === "Invited" ? (
              <DropdownMenuItem onSelect={() => onResendInvite(member.id)}>
                <MailIcon />
                Resend invite
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setRemoveOpen(true)}
            >
              <Trash2Icon />
              Remove
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
            <DialogDescription>
              Choose what {member.name} can do in your Lumen workspace.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor={`role-${member.id}`}>Role</FieldLabel>
            <Select
              value={pendingRole}
              onValueChange={(value) => setPendingRole(value as Role)}
            >
              <SelectTrigger id={`role-${member.id}`} className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription>{ROLE_DESCRIPTIONS[pendingRole]}</FieldDescription>
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onChangeRole(member.id, pendingRole)
                setRoleOpen(false)
              }}
              disabled={pendingRole === member.role}
            >
              Save role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {member.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {member.name} will lose access to your Lumen workspace right away.
              Their issues and comments stay in place.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => onRemove(member.id)}
            >
              Remove member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
```

```tsx components/team/members-table.tsx
"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { SearchIcon, UsersIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ROLES,
  getInitials,
  members as initialMembers,
  type Member,
  type Role,
} from "@/lib/data"
import { InviteMemberDialog } from "./invite-member-dialog"
import { MemberActions } from "./member-actions"
import { RoleBadge, StatusBadge } from "./member-badges"

const ALL_ROLES = "all"

export function MembersTable() {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>(ALL_ROLES)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return members.filter((m) => {
      const matchesRole = roleFilter === ALL_ROLES || m.role === roleFilter
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      return matchesRole && matchesQuery
    })
  }, [members, query, roleFilter])

  const hasFilters = query.trim() !== "" || roleFilter !== ALL_ROLES

  function clearFilters() {
    setQuery("")
    setRoleFilter(ALL_ROLES)
  }

  function handleInvite(input: { email: string; role: Role; message: string }) {
    const localPart = input.email.split("@")[0] ?? input.email
    const name = localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
    setMembers((prev) => [
      ...prev,
      {
        id: `m-new-${prev.length + 1}`,
        name: name || input.email,
        email: input.email,
        role: input.role,
        status: "Invited",
        joined: null,
      },
    ])
  }

  function handleChangeRole(id: string, role: Role) {
    const target = members.find((m) => m.id === id)
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)))
    if (target) {
      toast.success("Role updated", {
        description: `${target.name} is now ${role}.`,
      })
    }
  }

  function handleResend(id: string) {
    const target = members.find((m) => m.id === id)
    if (target) {
      toast.success("Invite sent again", {
        description: `We emailed ${target.email} a fresh invitation link.`,
      })
    }
  }

  function handleRemove(id: string) {
    const target = members.find((m) => m.id === id)
    setMembers((prev) => prev.filter((m) => m.id !== id))
    if (target) {
      toast.success("Member removed", {
        description: `${target.name} no longer has access.`,
      })
    }
  }

  return (
    <section aria-labelledby="members-heading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="members-heading" className="sr-only">
          Team members
        </h2>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <InputGroup className="sm:max-w-xs">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              placeholder="Search by name or email"
              aria-label="Search members"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger
              aria-label="Filter by role"
              className="w-full sm:w-40"
            >
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent position="popper">
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
        </div>
        <InviteMemberDialog existing={members} onInvite={handleInvite} />
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {filtered.length} of {members.length}{" "}
        {members.length === 1 ? "member" : "members"}
      </p>

      {filtered.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>No members found</EmptyTitle>
            <EmptyDescription>
              {hasFilters
                ? "Nobody matches your search and role filter. Try a different name or clear the filters."
                : "Invite your first teammate to get started."}
            </EmptyDescription>
          </EmptyHeader>
          {hasFilters ? (
            <EmptyContent>
              <Button variant="outline" onClick={clearFilters}>
                <XIcon data-icon="inline-start" />
                Clear filters
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ) : (
        <div className="rounded-lg border">
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
                      <Avatar>
                        <AvatarFallback aria-hidden="true">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <Link
                          href={`/members/${member.id}`}
                          className="rounded-sm font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          {member.name}
                        </Link>
                        <span className="max-w-[12rem] truncate text-xs text-muted-foreground md:hidden">
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
                    <MemberActions
                      member={member}
                      onChangeRole={handleChangeRole}
                      onResendInvite={handleResend}
                      onRemove={handleRemove}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}
```

```tsx app/page.tsx
import type { Metadata } from "next"

import { MembersTable } from "@/components/team/members-table"
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/lib/data"

export const metadata: Metadata = {
  title: `Team · ${PRODUCT_NAME}`,
  description: PRODUCT_TAGLINE,
}

export default function TeamPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">
          {PRODUCT_NAME} workspace · Acme Labs
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Team
        </h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Manage who can see and edit your dashboards, reports and issues.
          Invite teammates, adjust roles, or remove access at any time.
        </p>
      </header>
      <MembersTable />
    </main>
  )
}
```

```tsx app/members/[id]/page.tsx
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  MailIcon,
  ShieldIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { RoleBadge, StatusBadge } from "@/components/team/member-badges"
import {
  PRODUCT_NAME,
  ROLE_DESCRIPTIONS,
  formatDate,
  getActivity,
  getInitials,
  getMember,
  members,
} from "@/lib/data"

type PageProps = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return members.map((m) => ({ id: m.id }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const member = getMember(id)
  return {
    title: member
      ? `${member.name} · Team · ${PRODUCT_NAME}`
      : `Member not found · ${PRODUCT_NAME}`,
  }
}

export default async function MemberPage({ params }: PageProps) {
  const { id } = await params
  const member = getMember(id)
  if (!member) notFound()

  const activity = getActivity(member.id)

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
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

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="size-16">
          <AvatarFallback aria-hidden="true" className="text-xl">
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {member.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge role={member.role} />
            <StatusBadge status={member.status} />
            <span className="break-all text-sm text-muted-foreground">
              {member.email}
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Account details for this {PRODUCT_NAME} workspace member.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <MailIcon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium break-all">{member.email}</dd>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <ShieldIcon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="flex flex-col items-start gap-1">
                    <RoleBadge role={member.role} />
                    <span className="text-muted-foreground">
                      {ROLE_DESCRIPTIONS[member.role]}
                    </span>
                  </dd>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <ClockIcon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <StatusBadge status={member.status} />
                  </dd>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <CalendarIcon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-0.5">
                  <dt className="text-muted-foreground">Joined</dt>
                  <dd className="font-medium">
                    {member.joined
                      ? formatDate(member.joined)
                      : "Hasn’t accepted the invite yet"}
                  </dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              The latest actions {member.name} took in {PRODUCT_NAME}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ClockIcon />
                  </EmptyMedia>
                  <EmptyTitle>No activity yet</EmptyTitle>
                  <EmptyDescription>
                    Activity will show up here once {member.name} joins and
                    starts working in the workspace.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ol className="flex flex-col">
                {activity.map((item, index) => (
                  <li key={item.id} className="flex flex-col gap-4">
                    {index > 0 ? <Separator /> : null}
                    <div className="flex flex-col gap-1 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <p className="text-sm font-medium">{item.summary}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                      <time
                        dateTime={item.date}
                        className="shrink-0 text-sm text-muted-foreground"
                      >
                        {formatDate(item.date)}
                      </time>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeftIcon data-icon="inline-start" />
            Back to team
          </Link>
        </Button>
      </div>
    </main>
  )
}
```