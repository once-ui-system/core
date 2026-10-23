"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDown, Plus, User as UserIcon, LogOut, Check } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

type OrgLite = { slug: string; name: string };

export function AppHeader({ current, orgs, email }: { current: string; orgs: OrgLite[]; email: string }) {
  const router = useRouter();
  const active = orgs.find((o) => o.slug === current);

  async function signOut() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await createClient().auth.signOut();
      router.push("/auth");
      router.refresh();
    } else router.push("/");
  }

  return (
    <header className="flex h-14 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          <span className="max-w-40 truncate">{active?.name ?? "Organization"}</span>
          <ChevronsUpDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            {orgs.map((o) => (
              <DropdownMenuItem key={o.slug} onClick={() => router.push(`/app/${o.slug}`)}>
                {o.name}
                {o.slug === current && <Check className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/app/new")}>
            <Plus /> Create organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" />}>
            <UserIcon />
            <span className="hidden max-w-40 truncate sm:inline">{email}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <UserIcon /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
