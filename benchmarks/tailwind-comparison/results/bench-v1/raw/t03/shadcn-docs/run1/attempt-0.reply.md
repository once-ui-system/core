The avatar is fine. Now the page content components, which are server components where possible. The dashboard has buttons that call the context, so I'll give those a small client component.

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
    { label: "Active projects", value: activeProjects, note: "of " + projects.length + " total" },
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

Now the routes. A shared layout in a route group serves `/projects` and `/members`. `app/page.tsx` serves `/` and wraps the dashboard in the same shell, since I can't add a layout above it.

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