import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { reports } from "@/lib/data";

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Friendly summaries that land in your inbox, so nobody has to go hunting for numbers."
      />
      <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <li key={report.title}>
            <Card className="h-full py-7">
              <CardHeader>
                <CardTitle className="text-xl">{report.title}</CardTitle>
                <CardDescription>{report.cadence}</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground">{report.description}</CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
