"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TimerIcon from "@mui/icons-material/Timer";
import AlertBadges, { tint } from "./AlertBadges";
import { fromMin, patientById, vetById, type Appointment } from "@/lib/data";

export default function WaitingList({ appointments, now }: { appointments: Appointment[]; now: number }) {
  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0));

  return (
    <Paper variant="outlined" component="section" aria-labelledby="waiting-title" sx={{ overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
        <Typography id="waiting-title" component="h2" variant="h2" sx={{ flex: 1 }}>
          Waiting room
        </Typography>
        <Chip color={waiting.length ? "warning" : "default"} label={`${waiting.length} waiting`} size="small" />
      </Box>
      <Box aria-live="polite" sx={{ m: 0 }}>
        {waiting.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            Nobody is waiting. Checked-in patients appear here with their wait time.
          </Typography>
        ) : (
          <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {waiting.map((a, i) => {
              const p = patientById(a.patient);
              const vet = vetById(a.vet);
              const mins = Math.max(0, Math.floor(now - (a.checkedInAt ?? now)));
              const long = mins >= 25;
              return (
                <Box
                  component="li"
                  key={a.id}
                  data-waiting={a.id}
                  sx={{ display: "flex", gap: 1.5, px: 2, py: 1.5, borderBottom: i < waiting.length - 1 ? 1 : 0, borderColor: "divider", bgcolor: long ? tint("warning", 10) : "transparent" }}
                >
                  <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "action.selected", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.85rem", flexShrink: 0 }} aria-hidden>
                    {i + 1}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography component={Link} href={`/patients/${p.id}`} sx={{ fontWeight: 750, color: "text.primary" }}>
                      {p.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {a.reason} · {vet.short}, {vet.room}
                    </Typography>
                    {p.alerts.length > 0 && (
                      <Box sx={{ mt: 0.75 }}>
                        <AlertBadges alerts={p.alerts} patientName={p.name} />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end", fontWeight: 800, color: long ? "warning.main" : "text.primary", fontVariantNumeric: "tabular-nums" }}>
                      <TimerIcon fontSize="small" aria-hidden />
                      {mins} min
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      since {fromMin(a.checkedInAt ?? now)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
