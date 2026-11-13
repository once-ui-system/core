The `project/` directory only holds the original files, so the modules I wrote were never saved there; the typecheck reported them missing because only some of my files existed. I'll re-emit every file in full, with the same paths relative to the project root.

One more thing needed fixing: `components/app-shell.tsx` imported `Kbd` and `KbdGroup` correctly, but `KbdGroup` renders a `<kbd>` and I passed `aria-hidden` to it, which is fine. The typecheck errors all trace back to the missing files, so no further code changes were needed.

```ts lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived";
export type MemberRole = "Owner" | "Admin" | "Member" | "Viewer";
export type MemberStatus = "Active" | "Invited" | "Suspended";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  joined: string | null;
}

export const product = {
  name: "Lumen",
  description:
    "A product-analytics and issue-tracking app for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export const members: Member[] = [
  { id: "m-01", name: "Maya Okafor", email: "maya@acmelabs.io", role: "Owner", status: "Active", joined: "2024-03-02" },
  { id: "m-02", name: "Daniel Reyes", email: "daniel@acmelabs.io", role: "Admin", status: "Active", joined: "2024-05-19" },
  { id: "m-03", name: "Priya Natarajan", email: "priya@acmelabs.io", role: "Member", status: "Active", joined: "2024-11-07" },
  { id: "m-04", name: "Tomás Lindqvist", email: "tomas@acmelabs.io", role: "Member", status: "Active", joined: "2025-02-14" },
  { id: "m-05", name: "Hana Sato", email: "hana@acmelabs.io", role: "Member", status: "Invited", joined: null },
  { id: "m-06", name: "Grace Mensah", email: "grace@acmelabs.io", role: "Viewer", status: "Active", joined: "2025-06-30" },
  { id: "m-07", name: "Leo Brandt", email: "leo@acmelabs.io", role: "Member", status: "Suspended", joined: "2025-01-21" },
  { id: "m-08", name: "Ines Duarte", email: "ines@acmelabs.io", role: "Viewer", status: "Invited", joined: null },
];

/** The three most recently updated projects, newest first. */
export const recentProjects: Project[] = [...projects]
  .sort((a, b) => b.updated.localeCompare(a.updated))
  .slice(0, 3);

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Formats an ISO date (YYYY-MM-DD) deterministically, avoiding locale/timezone drift. */
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
```

```tsx components/app-context.tsx
"use client";

import * as React from "react";

interface AppActions {
  openPalette: () => void;
  openInvite: () => void;
  openCreateProject: () => void;
}

const AppContext = React.createContext<AppActions | null>(null);

export const AppProvider = AppContext.Provider;

export function useAppActions(): AppActions {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useAppActions must be used inside <AppShell>");
  return ctx;
}
```

```tsx components/invite-member-dialog.tsx
"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteMemberDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setEmail("");
      setError(null);
    }
    onOpenChange(next);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setError("Enter a valid email address, like name@company.com.");
      return;
    }
    toast.success(`Invitation sent to ${value}`);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Invite a member</DialogTitle>
            <DialogDescription>
              They&apos;ll get an email with a link to join Acme Labs on Lumen.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              autoComplete="off"
              placeholder="teammate@acmelabs.io"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "invite-email-error" : undefined}
              autoFocus
            />
            {error ? (
              <p id="invite-email-error" role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Send invite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

```tsx components/create-project-dialog.tsx
"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("");
      setError(null);
    }
    onOpenChange(next);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = name.trim();
    if (value.length < 2) {
      setError("Give the project a name with at least 2 characters.");
      return;
    }
    toast.success(`Project “${value}” created`);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Create a project</DialogTitle>
            <DialogDescription>
              Projects group issues and analytics for one product or surface.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              autoComplete="off"
              placeholder="e.g. Billing dashboard"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "project-name-error" : undefined}
              autoFocus
            />
            {error ? (
              <p id="project-name-error" role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

```tsx components/command-palette.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  FolderKanban,
  FolderPlus,
  LayoutDashboard,
  Moon,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { formatDate, recentProjects } from "@/lib/data";

interface PageEntry {
  id: string;
  label: string;
  keywords: string[];
  icon: LucideIcon;
  href: string;
}

const pages: PageEntry[] = [
  { id: "page-dashboard", label: "Dashboard", keywords: ["home", "overview"], icon: LayoutDashboard, href: "/" },
  { id: "page-projects", label: "Projects", keywords: ["issues"], icon: FolderKanban, href: "/projects" },
  { id: "page-members", label: "Members", keywords: ["team", "people"], icon: Users, href: "/members" },
];

export function CommandPalette({
  open,
  onOpenChange,
  onInvite,
  onCreateProject,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: () => void;
  onCreateProject: () => void;
}) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [search, setSearch] = React.useState("");

  // Reset the query every time the palette closes.
  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  function run(action: () => void) {
    onOpenChange(false);
    // Let the palette finish closing so focus moves cleanly to what follows.
    window.setTimeout(action, 0);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Search pages, actions and recent projects, then press Enter to run one."
    >
      <CommandInput
        placeholder="Search pages, actions and projects…"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results for “{search}”.</CommandEmpty>

        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.id}
              value={page.id}
              keywords={[page.label, ...page.keywords]}
              onSelect={() => run(() => router.push(page.href))}
            >
              <page.icon aria-hidden="true" />
              <span>{page.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            value="action-create-project"
            keywords={["Create project", "new", "add"]}
            onSelect={() => run(onCreateProject)}
          >
            <FolderPlus aria-hidden="true" />
            <span>Create project</span>
          </CommandItem>
          <CommandItem
            value="action-invite-member"
            keywords={["Invite member", "add", "teammate", "email"]}
            onSelect={() => run(onInvite)}
          >
            <UserPlus aria-hidden="true" />
            <span>Invite member</span>
          </CommandItem>
          <CommandItem
            value="action-toggle-theme"
            keywords={["Toggle theme", "dark", "light", "appearance"]}
            onSelect={() =>
              run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))
            }
          >
            <Moon aria-hidden="true" />
            <span>Toggle theme</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recent">
          {recentProjects.map((project) => (
            <CommandItem
              key={project.key}
              value={`recent-${project.key}`}
              keywords={[project.name, project.key, project.status]}
              onSelect={() => run(() => router.push("/projects"))}
            >
              <FolderKanban aria-hidden="true" />
              <span className="truncate">{project.name}</span>
              <Badge variant="outline" className="font-mono">
                {project.key}
              </Badge>
              <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
                {formatDate(project.updated)}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
```

```tsx components/app-shell.tsx
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
```

```tsx components/page-header.tsx
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
```

```tsx components/action-buttons.tsx
"use client";

import { FolderPlus, UserPlus } from "lucide-react";

import { useAppActions } from "@/components/app-context";
import { Button } from "@/components/ui/button";

export function CreateProjectButton({
  variant = "default",
}: {
  variant?: "default" | "outline";
}) {
  const { openCreateProject } = useAppActions();
  return (
    <Button type="button" variant={variant} onClick={openCreateProject}>
      <FolderPlus aria-hidden="true" />
      Create project
    </Button>
  );
}

export function InviteMemberButton({
  variant = "default",
}: {
  variant?: "default" | "outline";
}) {
  const { openInvite } = useAppActions();
  return (
    <Button type="button" variant={variant} onClick={openInvite}>
      <UserPlus aria-hidden="true" />
      Invite member
    </Button>
  );
}
```

```tsx components/status-badge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  Active: "bg-emerald-500",
  Paused: "bg-amber-500",
  Invited: "bg-sky-500",
  Suspended: "bg-red-500",
  Archived: "bg-zinc-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", tone[status] ?? "bg-zinc-400")}
      />
      {status}
    </Badge>
  );
}
```

```tsx components/dashboard.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  CreateProjectButton,
  InviteMemberButton,
} from "@/components/action-buttons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, members, projects, recentProjects, user } from "@/lib/data";

export function Dashboard() {
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const activeMembers = members.filter((m) => m.status === "Active").length;
  const pendingInvites = members.filter((m) => m.status === "Invited").length;

  const stats = [
    { label: "Open issues", value: openIssues, note: `across ${projects.length} projects` },
    { label: "Active projects", value: activeProjects, note: `of ${projects.length} total` },
    { label: "Active members", value: activeMembers, note: `${members.length} on the team` },
    { label: "Pending invites", value: pendingInvites, note: "waiting to join" },
  ];

  return (
    <>
      <PageHeader
        title={`Good to see you, ${user.name.split(" ")[0]}`}
        description="Here's what's happening across Acme Labs on Lumen."
        actions={
          <>
            <InviteMemberButton variant="outline" />
            <CreateProjectButton />
          </>
        }
      />

      <section aria-label="Summary" className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="gap-2 py-5">
            <CardHeader className="gap-1">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stat.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recently updated projects</CardTitle>
            <CardDescription>The three projects with the latest activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recentProjects.map((project) => (
                <li key={project.key} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 first:pt-0 last:pb-0">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                    {project.key}
                  </span>
                  <span className="font-medium">{project.name}</span>
                  <StatusBadge status={project.status} />
                  <span className="ml-auto text-sm text-muted-foreground">
                    {project.issues} open · {formatDate(project.updated)}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/projects"
              className="mt-4 inline-flex items-center gap-1 rounded-sm text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              View all projects <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jump anywhere, fast</CardTitle>
            <CardDescription>
              Open the command palette to navigate, create and switch themes without leaving the keyboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="flex flex-wrap items-center gap-2">
              Press
              <KbdGroup>
                <Kbd>Ctrl</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
              or
              <KbdGroup>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
              on a Mac.
            </p>
            <p className="text-muted-foreground">
              On a phone, tap the Search button in the header.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
```

```tsx components/projects-view.tsx
import { CreateProjectButton } from "@/components/action-buttons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, projects } from "@/lib/data";

export function ProjectsView() {
  return (
    <>
      <PageHeader
        title="Projects"
        description={`${projects.length} projects in your workspace.`}
        actions={<CreateProjectButton />}
      />
      <div className="rounded-xl border bg-card">
        <Table>
          <caption className="sr-only">Projects in the Acme Labs workspace</caption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Project</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Open issues</TableHead>
              <TableHead className="pr-4 text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.key}>
                <TableCell className="pl-4 font-medium">{project.name}</TableCell>
                <TableCell>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                    {project.key}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={project.status} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{project.issues}</TableCell>
                <TableCell className="pr-4 text-right text-muted-foreground">
                  {formatDate(project.updated)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
```

```tsx components/members-view.tsx
import { InviteMemberButton } from "@/components/action-buttons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, initials, members } from "@/lib/data";

export function MembersView() {
  return (
    <>
      <PageHeader
        title="Members"
        description={`${members.length} people on the Acme Labs team.`}
        actions={<InviteMemberButton />}
      />
      <div className="rounded-xl border bg-card">
        <Table>
          <caption className="sr-only">Members of the Acme Labs workspace</caption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{initials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  <StatusBadge status={member.status} />
                </TableCell>
                <TableCell className="pr-4 text-right text-muted-foreground">
                  {formatDate(member.joined)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
```

```tsx app/(app)/layout.tsx
import { AppShell } from "@/components/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/(app)/projects/page.tsx
import type { Metadata } from "next";

import { ProjectsView } from "@/components/projects-view";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return <ProjectsView />;
}
```

```tsx app/(app)/members/page.tsx
import type { Metadata } from "next";

import { MembersView } from "@/components/members-view";

export const metadata: Metadata = { title: "Members · Lumen" };

export default function MembersPage() {
  return <MembersView />;
}
```

```tsx app/page.tsx
import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard";

export const metadata: Metadata = { title: "Dashboard · Lumen" };

export default function Page() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
```