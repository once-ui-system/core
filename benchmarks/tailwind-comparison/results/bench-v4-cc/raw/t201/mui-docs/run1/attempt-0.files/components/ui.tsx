"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Stack from "@mui/material/Stack";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ScheduleIcon from "@mui/icons-material/Schedule";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import type { ReactElement } from "react";
import type { Status } from "@/lib/data";

/** A translucent tint of a theme palette token, safe in light and dark mode. */
export const tint = (token: string, pct: number): string =>
  `color-mix(in srgb, var(--mui-palette-${token}) ${pct}%, transparent)`;

export const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

interface AlertsProps {
  alerts: string[];
  variant?: "chips" | "banner";
  size?: "small" | "medium";
}

/** Medical alerts: solid red with a warning icon and a spoken prefix, so they are never missed. */
export function PatientAlerts({ alerts, variant = "chips", size = "small" }: AlertsProps) {
  if (alerts.length === 0) return null;

  if (variant === "banner") {
    return (
      <Alert
        severity="error"
        variant="filled"
        icon={<WarningAmberIcon fontSize="inherit" />}
        sx={{ alignItems: "flex-start", "& .MuiAlert-message": { width: "100%" } }}
      >
        <AlertTitle sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Medical alert{alerts.length > 1 ? "s" : ""}
        </AlertTitle>
        <Box component="ul" sx={{ m: 0, pl: 2.5, fontSize: "1.0625rem", fontWeight: 600 }}>
          {alerts.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </Box>
      </Alert>
    );
  }

  return (
    <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 0.75 }} role="list" aria-label="Medical alerts">
      {alerts.map((a) => (
        <Chip
          key={a}
          role="listitem"
          color="error"
          size={size}
          icon={<WarningAmberIcon />}
          label={
            <>
              <Box component="span" sx={visuallyHidden}>
                Medical alert:{" "}
              </Box>
              {a}
            </>
          }
          sx={{
            height: "auto",
            maxWidth: "100%",
            fontWeight: 700,
            "& .MuiChip-label": { display: "block", whiteSpace: "normal", py: 0.375 },
          }}
        />
      ))}
    </Stack>
  );
}

const STATUS: Record<Status, { label: string; token: string; icon: ReactElement }> = {
  booked: { label: "Booked", token: "text-secondary", icon: <ScheduleIcon /> },
  checked_in: { label: "Checked in", token: "info-main", icon: <HowToRegIcon /> },
  in_exam: { label: "In exam", token: "primary-main", icon: <MedicalServicesIcon /> },
  done: { label: "Done", token: "success-main", icon: <CheckCircleIcon /> },
  cancelled: { label: "Cancelled", token: "text-disabled", icon: <CancelIcon /> },
};

export const statusLabel = (s: Status): string => STATUS[s].label;

export function StatusChip({ status }: { status: Status }) {
  const m = STATUS[status];
  return (
    <Chip
      size="small"
      icon={m.icon}
      label={m.label}
      variant="outlined"
      sx={{
        fontWeight: 700,
        color: "text.primary",
        borderColor: `var(--mui-palette-${m.token})`,
        bgcolor: tint(m.token, 12),
        "& .MuiChip-icon": { color: `var(--mui-palette-${m.token})` },
        ...(status === "cancelled" ? { textDecoration: "line-through" } : {}),
      }}
    />
  );
}
