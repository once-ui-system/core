"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import MuiLink from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import PageHeader from "../components/PageHeader";
import { formatDate, projects, user } from "../lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));

  const cards = [
    { label: "Active projects", value: String(active), note: `of ${projects.length} in the workspace` },
    { label: "Open issues", value: String(openIssues), note: "across all projects" },
    { label: "Paused", value: String(paused), note: "Mobile beta is waiting on review" },
    { label: "Last activity", value: formatDate(latest[0].updated), note: `${latest[0].name} (${latest[0].key})` },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where things stand across Acme Labs. Open issues are counted per project."
      />

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
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" component="h2">
                {c.label}
              </Typography>
              <Typography variant="h4" component="p" sx={{ my: 0.5 }}>
                {c.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {c.note}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card component="section" aria-labelledby="recent-heading">
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 2 }}>
            <Typography id="recent-heading" variant="h6" component="h2">
              Recently updated
            </Typography>
            <MuiLink component={Link} href="/projects" variant="body2">
              View all projects
            </MuiLink>
          </Box>
          <List disablePadding>
            {latest.slice(0, 4).map((p) => (
              <ListItem
                key={p.key}
                divider
                disableGutters
                secondaryAction={<Chip size="small" variant="outlined" label={`${p.issues} issues`} />}
              >
                <ListItemText
                  primary={`${p.key} · ${p.name}`}
                  secondary={`Updated ${formatDate(p.updated)}`}
                  sx={{ pr: 10 }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </>
  );
}
