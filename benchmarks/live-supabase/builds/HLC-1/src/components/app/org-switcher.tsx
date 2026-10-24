"use client";

import Link from "next/link";
import { ChevronsUpDown, Plus, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OrgWithRole } from "@/lib/orgs/types";

export function OrgSwitcher({ orgs, current }: { orgs: OrgWithRole[]; current: OrgWithRole }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 items-center gap-2 rounded-lg px-2.5 text-sm font-medium hover:bg-muted">
        <span className="max-w-[10rem] truncate">{current.name}</span>
        <ChevronsUpDown className="size-4 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        {orgs.map((org) => (
          <DropdownMenuItem key={org.id} render={<Link href={`/app/${org.slug}`} />}>
            <span className="flex-1 truncate">{org.name}</span>
            {org.id === current.id && <Check className="size-4" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/app/new" />}>
          <Plus className="size-4" aria-hidden="true" />
          New organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
