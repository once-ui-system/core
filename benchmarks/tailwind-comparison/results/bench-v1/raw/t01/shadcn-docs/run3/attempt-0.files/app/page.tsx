import { Activity, AlertCircle, FolderKanban, Users } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  activeProjectCount,
  projects,
  recentActivity,
  totalOpenIssues,
  user,
} from "@/lib/data";

const summaries = [
  {
    title: "Open issues",
    value: String(totalOpenIssues),
    note: "Across all projects",
    icon: AlertCircle,
  },
  {
    title: "Active projects",
    value: String(activeProjectCount),
    note: `${projects.length} projects in total`,
    icon: FolderKanban,
  },
  {
    title: "Weekly active users",
    value: "1,284",
    note: "+6.2% from last week",
    icon: Users,
  },
  {
    title: "Events tracked",
    value: "48.3k",
    note: "In the last 7 days",
    icon: Activity,
  },
];

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];

  return (
    <AppShell>
      <PageHeading
        title={`Welcome back, ${firstName}`}
        description="Here is what is happening across your projects today."
      />

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map((item) => (
          <Card key={item.title} className="gap-3">
            <CardHeader>
              <CardDescription className="flex items-center justify-between">
                <span>{item.title}</span>
                <item.icon className="size-4" aria-hidden="true" />
              </CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {item.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{item.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section
        id="reports"
        aria-labelledby="activity-heading"
        className="mt-6 scroll-mt-20"
      >
        <Card>
          <CardHeader>
            <CardTitle id="activity-heading">Recent activity</CardTitle>
            <CardDescription>
              Latest changes to issues you follow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recentActivity.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{entry.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.project}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{entry.when}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
