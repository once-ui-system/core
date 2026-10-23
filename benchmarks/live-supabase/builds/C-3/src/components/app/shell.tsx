"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDown, LayoutDashboard, Plus, Settings, Users, User, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/auth/actions";

type Org = { slug: string; name: string };

export function AppShell({
  siteName,
  org,
  orgs,
  email,
  children,
}: {
  siteName: string;
  org: Org;
  orgs: Org[];
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/app/${org.slug}`;
  const items = [
    { href: base, label: "Dashboard", icon: LayoutDashboard },
    { href: `${base}/members`, label: "Members", icon: Users },
    { href: `${base}/settings`, label: "Settings", icon: Settings },
  ];
  const trigger = cn(buttonVariants({ variant: "outline" }), "max-w-56 justify-between gap-2");
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/" className="px-2 py-1 font-semibold tracking-tight">
            {siteName}
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((i) => (
                  <SidebarMenuItem key={i.href}>
                    <SidebarMenuButton
                      isActive={pathname === i.href}
                      render={<Link href={i.href} />}
                    >
                      <i.icon />
                      <span>{i.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
          <DropdownMenu>
            <DropdownMenuTrigger className={trigger}>
              <span className="truncate">{org.name}</span>
              <ChevronsUpDown className="size-4 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-56">
              {orgs.map((o) => (
                <DropdownMenuItem key={o.slug} render={<Link href={`/app/${o.slug}`} />}>
                  {o.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/app/new" />}>
                <Plus /> New organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className={buttonVariants({ variant: "ghost" })} aria-label="User menu">
                <User /> <span className="hidden max-w-40 truncate sm:inline">{email}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuItem render={<Link href="/profile" />}>
                  <User /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
