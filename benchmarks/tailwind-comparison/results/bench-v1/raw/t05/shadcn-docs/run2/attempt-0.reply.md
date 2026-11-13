Now the members table with row actions, the change-role dialog, and the remove confirmation.

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
import { Field, FieldLabel } from "@/components/ui/field"
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
            <p className="text-sm text-muted-foreground">
              {ROLE_DESCRIPTIONS[pendingRole]}
            </p>
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
                    <div
                      className={
                        index > 0
                          ? "flex flex-col gap-1 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                          : "flex flex-col gap-1 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                      }
                    >
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