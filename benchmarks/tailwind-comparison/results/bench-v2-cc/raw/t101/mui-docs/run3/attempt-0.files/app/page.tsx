"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import PageHeading from "@/components/PageHeading";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const count = (s: string) => projects.filter((p) => p.status === s).length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];

  const summaries = [
    { label: "Open issues", value: openIssues, note: `Across ${projects.length} projects` },
    { label: "Active projects", value: count("Active"), note: `${count("Paused")} paused` },
    { label: "Archived", value: count("Archived"), note: "No open issues" },
    { label: "Busiest project", value: busiest.key, note: `${busiest.name}, ${busiest.issues} open` },
  ];

  return (
    <Box>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle="Here is where your workspace stands today."
      />
      <Box
        component="ul"
        aria-label="Summary"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
        }}
      >
        {summaries.map((s) => (
          <li key={s.label}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {s.label}
                </Typography>
                <Typography variant="h3" component="p" sx={{ my: 0.25 }}>
                  {s.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.note}
                </Typography>
              </CardContent>
            </Card>
          </li>
        ))}
      </Box>

      <Card sx={{ mt: 2 }}>
        <CardHeader
          title={
            <Typography variant="h5" component="h2">
              Recent activity
            </Typography>
          }
          action={
            <MuiLink component={Link} href="/projects" variant="body2">
              All projects
            </MuiLink>
          }
        />
        <Divider />
        <List disablePadding>
          {latest.slice(0, 4).map((p, i) => (
            <Box key={p.key}>
              {i > 0 && <Divider component="li" />}
              <ListItem
                secondaryAction={<Chip label={p.status} color={p.status === "Active" ? "primary" : "default"} variant="outlined" />}
                sx={{ pr: 14 }}
              >
                <ListItemText
                  primary={`${p.key} · ${p.name}`}
                  secondary={`Updated ${formatDate(p.updated)}, ${p.issues} open issues`}
                />
              </ListItem>
            </Box>
          ))}
        </List>
      </Card>
    </Box>
  );
}
