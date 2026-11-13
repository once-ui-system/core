"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { formatDate, projects, user } from "../lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const archived = projects.filter((p) => p.status === "Archived").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);

  const stats = [
    { label: "Active projects", value: active, note: `of ${projects.length} in the workspace` },
    { label: "Open issues", value: openIssues, note: "across all projects" },
    { label: "Paused", value: paused, note: "waiting to resume" },
    { label: "Archived", value: archived, note: "read-only" },
  ];

  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4);

  return (
    <Box>
      <Typography variant="h1" component="h1" gutterBottom>
        Welcome back, {user.name.split(" ")[0]}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Signed in as {user.email}. Here is where your projects stand.
      </Typography>

      <Box
        component="section"
        aria-label="Summary"
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          mb: 3,
        }}
      >
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {stat.label}
              </Typography>
              <Typography variant="h3" component="p" sx={{ my: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.note}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card component="section" aria-labelledby="recent-heading">
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Typography id="recent-heading" variant="h4" component="h2">
              Recently updated
            </Typography>
            <Button component={Link} href="/projects" variant="contained">
              View all projects
            </Button>
          </Box>
          <List disablePadding sx={{ mt: 1 }}>
            {recent.map((p) => (
              <ListItem
                key={p.key}
                divider
                disableGutters
                secondaryAction={
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(p.updated)}
                  </Typography>
                }
                sx={{ pr: 14 }}
              >
                <Chip label={p.key} size="small" variant="outlined" sx={{ mr: 2, fontFamily: "ui-monospace, monospace" }} />
                <ListItemText primary={p.name} secondary={`${p.issues} open issues`} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
