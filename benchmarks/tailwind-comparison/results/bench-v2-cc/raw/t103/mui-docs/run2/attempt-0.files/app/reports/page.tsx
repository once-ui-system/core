"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { projects } from "../../lib/data";

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues), 1);
  return (
    <Box>
      <Typography variant="h1" component="h1" gutterBottom>
        Reports
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Open issues by project.
      </Typography>
      <Card>
        <CardContent sx={{ display: "grid", gap: 2.5 }}>
          {projects.map((p) => (
            <Box key={p.key}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2">
                  {p.key} · {p.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {p.issues}
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
    </Box>
  );
}
