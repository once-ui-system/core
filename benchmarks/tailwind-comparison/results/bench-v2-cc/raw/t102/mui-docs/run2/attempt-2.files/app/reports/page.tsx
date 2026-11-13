import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import PageHeader from "@/components/PageHeader";
import { reports } from "@/lib/data";

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Ready-made summaries of how your team is doing."
      />
      <Grid container spacing={3}>
        {reports.map((report) => (
          <Grid key={report.title} size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
                  {report.title}
                </Typography>
                <Typography color="text.secondary">{report.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
