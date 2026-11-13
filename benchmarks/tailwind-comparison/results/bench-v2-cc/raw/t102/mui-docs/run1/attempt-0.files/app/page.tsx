import type { Metadata } from "next";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BugReportRounded from "@mui/icons-material/BugReportRounded";
import FolderRounded from "@mui/icons-material/FolderRounded";
import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
import UpdateRounded from "@mui/icons-material/UpdateRounded";
import PageHeader from "@/components/PageHeader";
import ProjectBars from "@/components/ProjectBars";
import SummaryCard from "@/components/SummaryCard";
import { formatDate, projects, user } from "@/lib/data";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  const firstName = user.name.split(" ")[0];
  const totalIssues = projects.reduce((sum, project) => sum + project.issues, 0);
  const activeCount = projects.filter((project) => project.status === "Active").length;
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is where your team's projects stand today. Nice work keeping things moving."
      />

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Open issues"
            value={String(totalIssues)}
            hint={`Across ${projects.length} projects`}
            icon={<BugReportRounded />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Active projects"
            value={String(activeCount)}
            hint={`${projects.length} in the workspace`}
            icon={<FolderRounded />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Busiest project"
            value={busiest.name}
            hint={`${busiest.issues} open issues`}
            icon={<LocalFireDepartmentRounded />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Latest update"
            value={formatDate(latest.updated)}
            hint={latest.name}
            icon={<UpdateRounded />}
          />
        </Grid>

        <Grid size={12}>
          <Card component="section" aria-labelledby="where-work-is">
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                sx={{
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 2,
                  mb: 4,
                }}
              >
                <Typography id="where-work-is" variant="h5" component="h2">
                  Where the work is
                </Typography>
                <Button href="/projects" variant="contained">
                  See all projects
                </Button>
              </Stack>
              <ProjectBars projects={projects} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
