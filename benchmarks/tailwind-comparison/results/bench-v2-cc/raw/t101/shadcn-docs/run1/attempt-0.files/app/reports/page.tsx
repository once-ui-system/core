import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { projects } from "@/lib/data"

export const metadata: Metadata = { title: "Reports" }

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0)

  return (
    <>
      <PageHeader
        title="Reports"
        description="Where the open issues sit across projects."
      />
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Open issues by project</CardTitle>
          <CardDescription>{total} open issues in total.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3">
            {projects.map((project) => {
              const share = total === 0 ? 0 : Math.round((project.issues / total) * 100)
              return (
                <li key={project.key} className="grid gap-1">
                  <div className="flex items-baseline justify-between text-[0.8125rem]">
                    <span>
                      <span className="mr-2 font-mono text-xs text-muted-foreground">
                        {project.key}
                      </span>
                      {project.name}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {project.issues} ({share}%)
                    </span>
                  </div>
                  <Progress
                    value={share}
                    className="h-1.5"
                    aria-label={`${project.name}: ${share}% of open issues`}
                  />
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </>
  )
}
