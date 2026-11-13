"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import UndoIcon from "@mui/icons-material/Undo";
import { tables } from "@/lib/data";
import { guestById } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import RoomPlan from "./RoomPlan";
import SidePanel from "./SidePanel";

function Stat({
  label,
  value,
  sub,
  progress,
  tone,
}: {
  label: string;
  value: string | number;
  sub: string;
  progress?: number;
  tone?: "error" | "success";
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderColor: tone === "error" ? "error.main" : "divider" }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.15, color: tone === "error" ? "error.main" : "text.primary" }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {sub}
      </Typography>
      {progress !== undefined ? (
        <LinearProgress variant="determinate" value={progress} aria-label={label} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
      ) : null}
    </Paper>
  );
}

export default function PlanView() {
  const plan = usePlan();
  const broken = plan.rules.filter((r) => r.status === "broken");
  const open = plan.rules.filter((r) => r.status === "open");
  const free = plan.totalSeats - plan.seatedTotal;
  const picked = plan.picked ? guestById[plan.picked] : null;

  return (
    <Container maxWidth={false} sx={{ maxWidth: 1600, py: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={2} sx={{ flexWrap: "wrap", rowGap: 1 }}>
          <Box>
            <Typography variant="h1" component="h1">
              Seating plan
            </Typography>
            <Typography color="text.secondary">
              Drag a guest onto a seat, or tap a guest and then tap a seat or table.
            </Typography>
          </Box>
          <Button startIcon={<UndoIcon />} variant="outlined" color="inherit" onClick={plan.undo} disabled={!plan.canUndo}>
            Undo
          </Button>
        </Stack>

        <Box
          component="section"
          aria-label="Seating counts"
          sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" } }}
        >
          <Stat
            label="Seated"
            value={plan.seatedConfirmed}
            sub={`of ${plan.confirmed} attending${plan.seatedUnconfirmed ? ` (+${plan.seatedUnconfirmed} unconfirmed)` : ""}`}
            progress={(plan.seatedConfirmed / plan.confirmed) * 100}
          />
          <Stat label="Unseated" value={plan.toSeat.length} sub={plan.toSeat.length === 1 ? "attending guest needs a seat" : "attending guests need a seat"} />
          <Stat label="Free seats" value={free} sub={`of ${plan.totalSeats} across ${tables.length} tables`} />
          <Stat
            label="Rules"
            value={broken.length}
            tone={broken.length ? "error" : "success"}
            sub={broken.length ? `broken, ${open.length} waiting on a seat` : `broken, ${open.length} waiting on a seat`}
          />
        </Box>

        <Box component="section" aria-label="Seats per table">
          <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5 }}>
            {tables.map((t) => {
              const n = plan.occupied[t.id] ?? 0;
              const bad = (plan.brokenByTable[t.id]?.length ?? 0) > 0;
              return (
                <Chip
                  key={t.id}
                  clickable
                  onClick={() => plan.selectTable(t.id)}
                  label={`${t.name} ${n}/${t.seats}`}
                  color={bad ? "error" : n === t.seats ? "primary" : "default"}
                  variant={plan.selectedTable === t.id || n === t.seats || bad ? "filled" : "outlined"}
                  aria-label={`${t.name}: ${n} of ${t.seats} seats taken${bad ? ", rule broken" : ""}`}
                  sx={{ flexShrink: 0, height: 36, fontWeight: 600 }}
                />
              );
            })}
          </Stack>
        </Box>

        {broken.length > 0 ? (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={() => plan.setPanelTab("rules")}>
                Review
              </Button>
            }
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {broken.length === 1 ? "1 rule is broken" : `${broken.length} rules are broken`}
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {broken.map((r) => (
                <li key={r.id}>
                  <Typography variant="body2">{r.summary}</Typography>
                </li>
              ))}
            </Box>
          </Alert>
        ) : (
          <Alert severity="success">All of the couple&apos;s rules are met{open.length ? `, ${open.length} still waiting on a seat.` : "."}</Alert>
        )}

        {picked ? (
          <Alert
            severity="info"
            variant="outlined"
            action={
              <Stack direction="row" spacing={0.5}>
                {plan.guestTable[picked.id] ? (
                  <Button size="small" color="inherit" onClick={() => plan.unseat(picked.id)}>
                    Unseat
                  </Button>
                ) : null}
                <Button size="small" color="inherit" onClick={() => plan.pick(null)}>
                  Cancel
                </Button>
              </Stack>
            }
          >
            Placing <strong>{picked.name}</strong>. Tap an empty seat, a seat to swap with, or a table.
          </Alert>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gap: 2,
            alignItems: "start",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 390px" },
          }}
        >
          <RoomPlan />
          <SidePanel />
        </Box>
      </Stack>
    </Container>
  );
}
