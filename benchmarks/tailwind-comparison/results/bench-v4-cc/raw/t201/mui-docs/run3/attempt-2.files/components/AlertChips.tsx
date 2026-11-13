"use client";

import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import Chip from "@mui/material/Chip";

/** A translucent tint of the error color that works in light and dark mode. */
export const errorTint = (pct: number) =>
  `color-mix(in srgb, var(--mui-palette-error-main) ${pct}%, transparent)`;

interface Props {
  alerts: string[];
  size?: "small" | "medium";
}

/** Medical alerts as bold red-bordered chips. Renders nothing when there are none. */
export default function AlertChips({ alerts, size = "small" }: Props) {
  if (alerts.length === 0) return null;
  return (
    <ul
      aria-label="Medical alerts"
      style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 6 }}
    >
      {alerts.map((alert) => (
        <li key={alert}>
          <Chip
            size={size}
            icon={<WarningAmberRounded />}
            label={`Alert: ${alert}`}
            sx={{
              height: "auto",
              minHeight: size === "small" ? 24 : 32,
              maxWidth: "100%",
              color: "text.primary",
              fontWeight: 700,
              border: "1.5px solid",
              borderColor: "error.main",
              bgcolor: errorTint(14),
              "& .MuiChip-icon": { color: "error.main" },
              "& .MuiChip-label": { whiteSpace: "normal", py: 0.25 },
            }}
          />
        </li>
      ))}
    </ul>
  );
}
