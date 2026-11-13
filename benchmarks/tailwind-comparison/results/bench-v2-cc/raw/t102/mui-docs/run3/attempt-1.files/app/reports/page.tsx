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
    <Box sx={{ display: "grid", gap: 4 }}>
      <Box>
        <Typography variant="h1" component="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
          Reports
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: "1.1rem" }}>
          Open issues by project.
        </Typography>
      </Box>
      <Card>
        <CardContent sx={{ display: "grid", gap: 3 }}>
          {projects.map((p) => (
            <Box key={p.key}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography sx={{ fontWeight: 600 }}>{p.name}</Typography>
                <Typography color="text.secondary">{p.issues} open</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(p.issues / max) * 100}
                aria-label={`${p.name}: ${p.issues} open issues`}
                sx={{ height: 12, borderRadius: 3 }}
              />
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}
