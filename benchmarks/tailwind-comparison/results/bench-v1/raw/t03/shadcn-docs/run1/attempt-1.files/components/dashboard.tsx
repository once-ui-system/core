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
