"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { usePlan } from "@/lib/plan";

function Tile({
  label,
  value,
  caption,
  color,
  progress,
}: {
  label: string;
  value: React.ReactNode;
  caption: string;
  color?: string;
  progress?: number;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.75 }}>
      <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4, display: "block" }}>
        {label}
      </Typography>
      <Typography component="div" sx={{ fontSize: 30, fontWeight: 800, lineHeight: 1.15, color: color ?? "text.primary" }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {caption}
      </Typography>
      {progress !== undefined ? (
        <LinearProgress
          variant="determinate"
          value={progress}
          aria-label="Seats filled"
          sx={{ mt: 1, height: 6, borderRadius: 3 }}
        />
      ) : null}
    </Paper>
  );
}

export default function StatTiles() {
  const { stats, rules } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;
  const waiting = rules.filter((r) => r.status === "pending").length;
  return (
    <Box
      role="group"
      aria-label="Seating counts"
      aria-live="polite"
      sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" } }}
    >
      <Tile
        label="Seated"
        value={stats.seated}
        caption={`of ${stats.capacity} seats, ${stats.freeSeats} free`}
        progress={(stats.seated / stats.capacity) * 100}
      />
      <Tile
        label="To seat"
        value={stats.toSeat}
        caption={`of ${stats.attending} attending guests`}
        color={stats.toSeat > 0 ? "var(--mui-palette-warning-main)" : "var(--mui-palette-success-main)"}
      />
      <Tile label="Awaiting reply" value={stats.awaiting} caption="maybe or pending, not seated" />
      <Tile
        label="Couple's rules"
        value={broken === 0 ? "All met" : `${broken} broken`}
        caption={waiting > 0 ? `${waiting} waiting on seating` : "every rule checked"}
        color={broken > 0 ? "var(--mui-palette-error-main)" : "var(--mui-palette-success-main)"}
      />
    </Box>
  );
}
