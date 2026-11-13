"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import {
  FolderKanban,
  LayoutDashboard,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";

import { AppProvider } from "@/components/app-context";
import { CommandPalette } from "@/components/command-palette";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { initials, user } from "@/lib/data";

const nav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/members", label: "Members", icon: Users },
];

function NavLinks({ orientation }: { orientation: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  return (
    <ul
      className={cn(
        "flex gap-1",
        orientation === "vertical" ? "flex-col" : "flex-row"
      )}
    >
      {nav.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <li key={item.href} className={orientation === "horizontal" ? "flex-1" : undefined}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                orientation === "horizontal" && "justify-center",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ShortcutHint() {
  // Platform is only known on the client; render "Ctrl" first to keep hydration stable.
  const [isMac, setIsMac] = React.useState(false);
  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent));
  }, []);
  return (
    <KbdGroup className="hidden sm:inline-flex" aria-hidden="true">
      <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const actions = React.useMemo(
    () => ({
      openPalette: () => setPaletteOpen(true),
      openInvite: () => setInviteOpen(true),
      openCreateProject: () => setCreateOpen(true),
    }),
    []
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AppProvider value={actions}>
        <div className="flex min-h-screen flex-col md:flex-row">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow"
          >
            Skip to content
          </a>

          <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r bg-sidebar p-4 text-sidebar-foreground md:flex">
            <div className="flex items-center gap-2 px-2 pt-1">
              <span
                aria-hidden="true"
                className="grid size-7 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
              >
                L
              </span>
              <span className="text-lg font-semibold tracking-tight">Lumen</span>
            </div>
            <nav aria-label="Main">
              <NavLinks orientation="vertical" />
            </nav>
            <div className="mt-auto flex items-center gap-3 rounded-lg border bg-background p-3">
              <Avatar>
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.role} · Acme Labs</p>
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
              <div className="flex items-center gap-2 md:hidden">
                <span
                  aria-hidden="true"
                  className="grid size-7 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
                >
                  L
                </span>
                <span className="font-semibold tracking-tight">Lumen</span>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={actions.openPalette}
                  aria-haspopup="dialog"
                  aria-keyshortcuts="Control+K Meta+K"
                  className="text-muted-foreground"
                >
                  <Search aria-hidden="true" />
                  <span>
                    Search<span className="hidden sm:inline"> or jump to…</span>
                  </span>
                  <ShortcutHint />
                </Button>
                <Avatar className="md:hidden">
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
              </div>
            </header>

            <nav aria-label="Main mobile" className="border-b p-2 md:hidden">
              <NavLinks orientation="horizontal" />
            </nav>

            <main id="main" className="flex-1 p-4 sm:p-6 lg:p-8">
              <div className="mx-auto w-full max-w-5xl">{children}</div>
            </main>
          </div>
        </div>

        <CommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          onInvite={actions.openInvite}
          onCreateProject={actions.openCreateProject}
        />
        <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
        <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
      </AppProvider>
    </ThemeProvider>
  );
}
