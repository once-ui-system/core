"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { usePlan } from "./PlanProvider";

function Tile({
  label,
  value,
  caption,
  children,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  caption: string;
  children?: React.ReactNode;
  tone?: "error" | "success";
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.75, minWidth: 0 }}>
      <Typography variant="overline" sx={{ color: "text.secondary", lineHeight: 1.4, display: "block" }}>
        {label}
      </Typography>
      <Typography variant="h5" component="p" sx={{ color: tone ? `${tone}.main` : "text.primary", lineHeight: 1.2 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {caption}
      </Typography>
      {children}
    </Paper>
  );
}

export default function StatsBar() {
  const { counts, unseated, results } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  const tentative = counts.seatedTotal - counts.seatedAttending;
  const pct = counts.attending ? (counts.seatedAttending / counts.attending) * 100 : 0;

  return (
    <Box
      aria-label="Seating counts"
      role="group"
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
      }}
    >
      <Tile label="Seated" value={`${counts.seatedAttending} of ${counts.attending}`} caption="attending guests with a seat">
        <LinearProgress
          variant="determinate"
          value={pct}
          aria-label="Share of attending guests seated"
          sx={{ mt: 1, height: 6, borderRadius: 3 }}
        />
      </Tile>
      <Tile
        label="Still to seat"
        value={unseated.length}
        caption={unseated.length === 0 ? "everyone attending is seated" : "attending guests without a seat"}
        tone={unseated.length === 0 ? "success" : undefined}
      />
      <Tile
        label="Free seats"
        value={counts.capacity - counts.seatedTotal}
        caption={`of ${counts.capacity}${tentative > 0 ? ` · ${tentative} held for unconfirmed guests` : ""}`}
      />
      <Tile
        label="Couple's rules"
        value={broken === 0 ? "All clear" : `${broken} broken`}
        caption={`${results.length} rules checked as you work`}
        tone={broken === 0 ? "success" : "error"}
      />
    </Box>
  );
}
