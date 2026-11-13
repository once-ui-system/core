"use client";

import * as React from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  formatDate,
  projects,
  reports,
  user,
  weeklyActivity,
} from "@/lib/data";

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" component="p" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {hint}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardView() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const lastUpdated = [...projects].sort((a, b) =>
    b.updated.localeCompare(a.updated),
  )[0];

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
        Welcome back, {user.name.split(" ")[0]}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Here is where things stand across your workspace today.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Open issues"
            value={String(openIssues)}
            hint={`Across ${projects.length} projects`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Active projects"
            value={String(active.length)}
            hint={`${projects.length - active.length} paused or archived`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Busiest project"
            value={busiest.key}
            hint={`${busiest.name}, ${busiest.issues} open issues`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Last activity"
            value={formatDate(lastUpdated.updated)}
            hint={lastUpdated.name}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Issues this week
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Opened and closed per day, all active projects
              </Typography>
              <Box sx={{ width: "100%", height: 280 }}>
                <BarChart
                  height={280}
                  xAxis={[{ scaleType: "band", data: weeklyActivity.days }]}
                  series={[
                    { data: weeklyActivity.opened, label: "Opened" },
                    { data: weeklyActivity.closed, label: "Closed" },
                  ]}
                  hideLegend={false}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card
            variant="outlined"
            id="reports"
            component="section"
            aria-labelledby="reports-heading"
            sx={{ height: "100%", scrollMarginTop: 80 }}
          >
            <CardContent>
              <Typography
                variant="h6"
                component="h2"
                id="reports-heading"
                gutterBottom
              >
                Reports
              </Typography>
              <List disablePadding>
                {reports.map((report) => (
                  <ListItem key={report.title} disableGutters divider>
                    <ListItemText
                      primary={report.title}
                      secondary={`${report.detail}. Updated ${formatDate(report.updated)}`}
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                component={NextLink}
                href="/projects"
                size="small"
                sx={{ mt: 1 }}
              >
                View all projects
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
