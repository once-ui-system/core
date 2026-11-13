"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PageHeader from "../../components/PageHeader";
import { projects } from "../../lib/data";

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues), 1);
  return (
    <>
      <PageHeader title="Reports" description="Open issues by project, scaled to the busiest one." />
      <Card>
        <CardContent sx={{ display: "grid", gap: 2.5 }}>
          {projects.map((p) => (
            <Box key={p.key}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2">
                  {p.key} · {p.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {p.issues} open
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(p.issues / max) * 100}
                aria-label={`${p.name}: ${p.issues} open issues`}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
