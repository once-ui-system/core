"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { formatDate, projects, user } from "../lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { label: "Open issues", value: String(openIssues), note: `across ${projects.length} projects` },
    { label: "Active projects", value: String(active.length), note: active.map((p) => p.key).join(", ") },
    { label: "Busiest project", value: busiest.name, note: `${busiest.issues} open issues` },
    { label: "Last activity", value: formatDate(latest.updated), note: latest.name },
  ];

  return (
    <Box sx={{ display: "grid", gap: 5 }}>
      <Box>
        <Typography variant="h1" component="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
          Welcome back, {user.name.split(" ")[0]}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: "1.1rem" }}>
          Your team has {openIssues} open issues today. Here is how things look across your workspace.
        </Typography>
      </Box>

      <Box
        component="section"
        aria-label="Summary"
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
        }}
      >
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.08em" }}>
                {card.label}
              </Typography>
              <Typography variant="h3" component="p" sx={{ mt: 1, color: "primary.main", fontSize: "1.9rem" }}>
                {card.value}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {card.note}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card component="section" aria-labelledby="recent-heading">
        <CardContent>
          <Typography id="recent-heading" variant="h4" component="h2">
            Recently updated
          </Typography>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, mt: 2, display: "grid" }}>
            {[...projects]
              .sort((a, b) => b.updated.localeCompare(a.updated))
              .slice(0, 3)
              .map((p) => (
                <Box
                  component="li"
                  key={p.key}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    py: 2,
                    borderTop: "1px solid var(--mui-palette-divider)",
                    flexWrap: "wrap",
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    {p.name}{" "}
                    <Typography component="span" color="text.secondary">
                      ({p.key})
                    </Typography>
                  </Typography>
                  <Typography color="text.secondary">{formatDate(p.updated)}</Typography>
                </Box>
              ))}
          </Box>
          <Box sx={{ mt: 2 }}>
            <MuiLink component={Link} href="/projects">
              See all projects
            </MuiLink>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
