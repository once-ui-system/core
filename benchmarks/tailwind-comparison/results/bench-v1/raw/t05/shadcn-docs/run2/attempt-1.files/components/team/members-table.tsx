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
