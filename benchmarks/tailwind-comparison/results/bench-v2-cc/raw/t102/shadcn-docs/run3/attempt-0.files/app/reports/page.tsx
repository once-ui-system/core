import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { projects } from "@/lib/data";

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  const rows = [...projects].sort((a, b) => b.issues - a.issues);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Reports</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          See where your team&apos;s open issues are piling up, project by project.
        </p>
      </section>

      <Card className="gap-6 py-7">
        <CardHeader className="gap-2 px-7">
          <CardTitle className="text-xl">Open issues by project</CardTitle>
          <CardDescription className="text-base">{total} open issues in total.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 px-7">
          {rows.map((p) => {
            const share = total === 0 ? 0 : Math.round((p.issues / total) * 100);
            return (
              <div key={p.key} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold">
                    {p.name} <span className="font-mono text-sm text-muted-foreground">({p.key})</span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {p.issues} issues, {share}%
                  </span>
                </div>
                <Progress value={share} aria-label={`${p.name} share of open issues`} className="h-3" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
