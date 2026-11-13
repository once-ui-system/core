import type { Metadata } from "next";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import PageHeader from "@/components/PageHeader";
import ProjectBars from "@/components/ProjectBars";
import { projects, type ProjectStatus } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

const statuses: ProjectStatus[] = ["Active", "Paused", "Archived"];

export default function Page() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="A snapshot of open issues and project status across the workspace."
      />
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card component="section" aria-labelledby="issues-by-project" sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography id="issues-by-project" variant="h5" component="h2" sx={{ mb: 4 }}>
                Open issues by project
              </Typography>
              <ProjectBars projects={projects} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card component="section" aria-labelledby="projects-by-status" sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography id="projects-by-status" variant="h5" component="h2" sx={{ mb: 2 }}>
                Projects by status
              </Typography>
              <List disablePadding>
                {statuses.map((status) => {
                  const count = projects.filter((project) => project.status === status).length;
                  return (
                    <ListItem
                      key={status}
                      disableGutters
                      sx={{ py: 1.5, justifyContent: "space-between" }}
                    >
                      <ListItemText primary={status} slotProps={{ primary: { variant: "subtitle1" } }} sx={{ flex: "0 1 auto" }} />
                      <Chip label={count} variant="outlined" />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
