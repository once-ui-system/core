"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import PageHeader from "@/components/PageHeader";
import {
  activeProjects,
  busiestProject,
  byRecency,
  formatDate,
  projects,
  totalIssues,
  user,
} from "@/lib/data";

const summary = [
  { label: "Issues", value: String(totalIssues), note: `across ${projects.length} projects` },
  {
    label: "Active projects",
    value: String(activeProjects.length),
    note: `of ${projects.length} in the workspace`,
  },
  {
    label: "Most issues",
    value: busiestProject.key,
    note: `${busiestProject.name}, ${busiestProject.issues} issues`,
  },
  {
    label: "Last update",
    value: formatDate(byRecency[0].updated),
    note: byRecency[0].name,
  },
];

export default function DashboardView() {
  const firstName = user.name.split(" ")[0];
  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is where your projects stand."
      />

      <Grid container spacing={1.5} component="section" aria-label="Summary">
        {summary.map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary" component="p">
                  {item.label}
                </Typography>
                <Typography variant="h2" component="p" sx={{ my: 0.25 }}>
                  {item.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.note}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card component="section" aria-labelledby="recent-heading" sx={{ mt: 1.5 }}>
        <CardContent sx={{ pb: 0 }}>
          <Typography id="recent-heading" variant="h3" component="h2">
            Recently updated
          </Typography>
        </CardContent>
        <List disablePadding sx={{ pb: 0.5 }}>
          {byRecency.map((project) => (
            <ListItem key={project.key} disablePadding>
              <ListItemButton
                component={Link}
                href="/projects"
                sx={{ px: 2, gap: 1.5, borderRadius: 0 }}
                aria-label={`${project.name}, ${project.issues} issues, updated ${formatDate(project.updated)}`}
              >
                <Chip label={project.key} variant="outlined" sx={{ minWidth: 48, fontWeight: 600 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                    {project.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {project.status} · {formatDate(project.updated)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
                  {project.issues} {project.issues === 1 ? "issue" : "issues"}
                </Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Card>
    </>
  );
}
