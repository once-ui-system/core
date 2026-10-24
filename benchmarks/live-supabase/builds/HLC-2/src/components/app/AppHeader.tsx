"use client";

import Link from "next/link";
import { useRef } from "react";
import { CheckIcon, ChevronsUpDownIcon, LogOutIcon, PlusIcon, UserIcon } from "lucide-react";
import { signOut } from "@/app/(site)/auth/actions";
import type { ShellOrg } from "@/components/app/AppSidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader({
  email,
  orgs,
  current,
}: {
  email: string;
  orgs: ShellOrg[];
  current: ShellOrg | null;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur">
      {current && <SidebarTrigger />}
      <OrgSwitcher orgs={orgs} current={current} />
      <div className="ml-auto">
        <UserMenu email={email} />
      </div>
    </header>
  );
}

function OrgSwitcher({ orgs, current }: { orgs: ShellOrg[]; current: ShellOrg | null }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <span className="max-w-[12rem] truncate">{current?.name ?? "Choose an organization"}</span>
        <ChevronsUpDownIcon className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          {orgs.map((org) => (
            <DropdownMenuItem key={org.slug} render={<Link href={`/app/${org.slug}`} />}>
              <CheckIcon className={current?.slug === org.slug ? "size-4" : "size-4 opacity-0"} />
              <span className="truncate">{org.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/app/new" />}>
          <PlusIcon className="size-4" />
          New organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({ email }: { email: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const initial = (email[0] ?? "?").toUpperCase();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Account menu" className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar size="sm">
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/app/profile" />}>
            <UserIcon className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => formRef.current?.requestSubmit()}>
            <LogOutIcon className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <form ref={formRef} action={signOut} className="hidden" />
    </>
  );
}
