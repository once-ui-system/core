"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronsUpDownIcon, LayoutDashboardIcon, SettingsIcon, UsersIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { siteConfig } from "@/config/site";

type OrgRef = { slug: string; name: string };

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function AppShell({
  org,
  orgs,
  email,
  children,
}: {
  org: OrgRef;
  orgs: OrgRef[];
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const base = `/app/${org.slug}`;
  const nav = [
    { href: base, label: "Dashboard", icon: LayoutDashboardIcon },
    { href: `${base}/members`, label: "Members", icon: UsersIcon },
    { href: `${base}/settings`, label: "Settings", icon: SettingsIcon },
  ];

  async function signOut() {
    if (configured) await createBrowserSupabase().auth.signOut();
    router.push(configured ? "/auth" : "/");
    router.refresh();
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/" className="px-2 py-1 font-semibold">{siteConfig.name}</Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((n) => (
                  <SidebarMenuItem key={n.href}>
                    <SidebarMenuButton
                      isActive={pathname === n.href}
                      render={<Link href={n.href} />}
                    >
                      <n.icon />
                      <span>{n.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger aria-label="Toggle sidebar" />
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
              {org.name}
              <ChevronsUpDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Organizations</DropdownMenuLabel>
                {orgs.map((o) => (
                  <DropdownMenuItem key={o.slug} render={<Link href={`/app/${o.slug}`} />}>
                    {o.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/app/new" />}>New organization</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className={buttonVariants({ variant: "ghost" })}>
                {email}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem render={<Link href="/app/profile" />}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
