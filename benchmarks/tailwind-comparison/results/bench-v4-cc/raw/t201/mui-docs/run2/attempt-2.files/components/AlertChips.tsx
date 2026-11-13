"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { srOnly } from "@/components/ui";

/** Medical alerts: solid red, an icon and the words, so they read at a glance and are not colour-only. */
export function AlertChips({ alerts, size = "small" }: { alerts: string[]; size?: "small" | "medium" }) {
  if (alerts.length === 0) return null;
  return (
    <Box
      component="ul"
      role="list"
      aria-label="Medical alerts"
      sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexWrap: "wrap", gap: 0.75 }}
    >
      {alerts.map((alert) => (
        <li key={alert}>
          <Chip
            color="error"
            size={size}
            icon={<WarningAmberIcon />}
            label={
              <>
                <Box component="span" sx={srOnly}>
                  Medical alert:{" "}
                </Box>
                {alert}
              </>
            }
            sx={{
              height: "auto",
              maxWidth: "100%",
              fontWeight: 700,
              "& .MuiChip-label": { whiteSpace: "normal", py: 0.375 },
            }}
          />
        </li>
      ))}
    </Box>
  );
}
