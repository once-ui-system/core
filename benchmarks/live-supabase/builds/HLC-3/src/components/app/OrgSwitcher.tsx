"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SwitcherOrg = { slug: string; name: string };

// Switches between the signed-in user's organizations, keeping the current section.
export function OrgSwitcher({ orgs }: { orgs: SwitcherOrg[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = orgs.find((o) => pathname === `/app/${o.slug}` || pathname.startsWith(`/app/${o.slug}/`));
  const label = current?.name ?? "Choose organization";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className="max-w-[14rem] justify-between gap-2" />}
      >
        <span className="truncate">{label}</span>
        <ChevronsUpDownIcon className="size-4 opacity-60" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        {orgs.map((org) => (
          <DropdownMenuItem key={org.slug} onClick={() => router.push(`/app/${org.slug}`)}>
            <span className="truncate">{org.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/app?new=1" />}>
          <PlusIcon className="size-4" aria-hidden="true" />
          Create organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
