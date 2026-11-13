import BugReportRounded from "@mui/icons-material/BugReportRounded";
import FolderRounded from "@mui/icons-material/FolderRounded";
import PauseCircleRounded from "@mui/icons-material/PauseCircleRounded";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import PageHeader from "@/components/PageHeader";
import SummaryCard from "@/components/SummaryCard";
import { formatDate, projects, statusColor, user } from "@/lib/data";

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is where your projects stand today. Nice work keeping things moving."
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Open issues"
            value={String(openIssues)}
            hint="Across all projects"
            icon={<BugReportRounded />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Active projects"
            value={String(active)}
            hint="Currently being worked on"
            icon={<FolderRounded />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Paused projects"
            value={String(paused)}
            hint="Waiting for their moment"
            icon={<PauseCircleRounded />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Busiest project"
            value={busiest.name}
            hint={`${busiest.issues} open issues`}
            icon={<TrendingUpRounded />}
          />
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2">
                Recently updated
              </Typography>
              <List disablePadding sx={{ mt: 1 }}>
                {recent.map((project, index) => (
                  <div key={project.key}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem
                      disableGutters
                      sx={{ py: 2, gap: 2, flexWrap: "wrap", justifyContent: "space-between" }}
                    >
                      <ListItemText
                        sx={{ flex: "1 1 220px" }}
                        primary={project.name}
                        secondary={`${project.key} · Updated ${formatDate(project.updated)}`}
                        slotProps={{ primary: { sx: { fontWeight: 600 } } }}
                      />
                      <Chip label={project.status} color={statusColor[project.status]} variant="outlined" />
                    </ListItem>
                  </div>
                ))}
              </List>
              <Link component={NextLink} href="/projects" sx={{ display: "inline-block", mt: 2 }}>
                See all projects
              </Link>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
