"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

/** Soft background tint that follows the active color scheme. */
export const tint = (token: string, pct = 12) =>
  `color-mix(in srgb, var(--mui-palette-${token}-main) ${pct}%, transparent)`;

/**
 * Medical alerts. Solid red, icon plus the full text, so they are never
 * confused with status chips and never rely on color alone.
 */
export default function AlertBadges({
  alerts,
  size = "small",
  patientName,
}: {
  alerts: string[];
  size?: "small" | "medium";
  patientName?: string;
}) {
  if (alerts.length === 0) return null;
  return (
    <Box
      component="ul"
      aria-label={patientName ? `Medical alerts for ${patientName}` : "Medical alerts"}
      sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, listStyle: "none", m: 0, p: 0 }}
    >
      {alerts.map((a) => (
        <li key={a}>
          <Chip
            color="error"
            size={size}
            icon={<ReportProblemIcon />}
            label={a}
            sx={{ height: "auto", "& .MuiChip-label": { whiteSpace: "normal", py: size === "small" ? 0.25 : 0.5 }, fontWeight: 700 }}
          />
        </li>
      ))}
    </Box>
  );
}
