"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { usePlan } from "@/lib/plan";
import { tint } from "@/lib/ui";
import GuestRow from "@/components/GuestRow";

export default function UnseatedList({ variant }: { variant: "list" | "strip" }) {
  const plan = usePlan();
  const [over, setOver] = React.useState(false);
  const canDrop = plan.dragId !== null && plan.assign[plan.dragId] !== null;
  const strip = variant === "strip";

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-label="Guests without a seat"
      onDragOver={(e: React.DragEvent<HTMLElement>) => {
        if (!canDrop) return;
        e.preventDefault();
        if (!over) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        setOver(false);
        const id = plan.dragId ?? e.dataTransfer.getData("text/plain");
        plan.setDragId(null);
        if (id) plan.unseat(id);
      }}
      sx={{
        p: 1.5,
        outline: over ? "2px dashed var(--mui-palette-primary-main)" : "none",
        bgcolor: over ? tint("primary-main", 10) : "background.paper",
      }}
    >
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h2" sx={{ fontSize: 16, fontWeight: 700 }}>
          Needs a seat ({plan.unseatedAttending.length})
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {canDrop ? "Drop here to unseat" : "Tap or drag a guest"}
        </Typography>
      </Stack>

      {plan.unseatedAttending.length === 0 ? (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1, color: "success.main" }}>
          <CheckCircleIcon fontSize="small" />
          <Typography variant="body2">Everyone attending has a seat.</Typography>
        </Stack>
      ) : (
        <Box
          component="ul"
          sx={{
            listStyle: "none",
            m: 0,
            p: 0,
            display: "flex",
            flexDirection: strip ? "row" : "column",
            gap: 1,
            overflowX: strip ? "auto" : "visible",
            pb: strip ? 0.5 : 0,
          }}
        >
          {plan.unseatedAttending.map((g) => (
            <li key={g.id} style={strip ? { flex: "0 0 auto", minWidth: 230 } : undefined}>
              <GuestRow guest={g} />
            </li>
          ))}
        </Box>
      )}

      {plan.unseatedUnconfirmed.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="overline" color="text.secondary">
            Not confirmed yet ({plan.unseatedUnconfirmed.length})
          </Typography>
          <Box
            component="ul"
            sx={{
              listStyle: "none",
              m: 0,
              mt: 0.5,
              p: 0,
              display: "flex",
              flexDirection: strip ? "row" : "column",
              gap: 1,
              overflowX: strip ? "auto" : "visible",
              pb: strip ? 0.5 : 0,
            }}
          >
            {plan.unseatedUnconfirmed.map((g) => (
              <li key={g.id} style={strip ? { flex: "0 0 auto", minWidth: 230 } : undefined}>
                <GuestRow guest={g} />
              </li>
            ))}
          </Box>
        </Box>
      ) : null}
    </Paper>
  );
}
