"use client";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlaceIcon from "@mui/icons-material/Place";
import RoomPlan from "@/components/RoomPlan";
import { RulesSummary, TableDetails, UnseatedList } from "@/components/SidePanel";
import { event, tables } from "@/lib/data";
import { usePlan } from "@/lib/plan";

const dateLabel = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${event.date}T00:00:00Z`));

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "error" | "success";
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.75, minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" component="div">
        {label}
      </Typography>
      <Typography
        component="div"
        sx={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, color: tone ? `${tone}.main` : "text.primary" }}
      >
        {value}
      </Typography>
      {hint ? (
        <Typography variant="caption" color="text.secondary" component="div">
          {hint}
        </Typography>
      ) : null}
    </Paper>
  );
}

export default function PlanPage() {
  const { seatedCount, attendingCount, unseated, capacity, brokenRules, seats } = usePlan();
  const pct = attendingCount ? Math.round((seatedCount / attendingCount) * 100) : 0;

  return (
    <Box sx={{ maxWidth: 1600, mx: "auto" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" }, gap: 1, mb: 2 }}
      >
        <Box>
          <Typography variant="h1" component="h1">
            {event.name}
          </Typography>
          <Stack direction="row" sx={{ gap: 2, flexWrap: "wrap", color: "text.secondary", mt: 0.5 }}>
            <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
              <CalendarMonthIcon fontSize="small" />
              <Typography variant="body2">{dateLabel}</Typography>
            </Stack>
            <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
              <PlaceIcon fontSize="small" />
              <Typography variant="body2">{event.venue}</Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>

      <Box
        component="section"
        aria-label="Seating counts"
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Stat
          label="Seated"
          value={
            <>
              {seatedCount}
              <Typography component="span" color="text.secondary" sx={{ fontSize: 16, fontWeight: 500 }}>
                {" "}
                of {attendingCount}
              </Typography>
            </>
          }
          hint={
            <Box sx={{ mt: 0.75 }}>
              <LinearProgress
                variant="determinate"
                value={pct}
                aria-label="Share of attending guests seated"
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          }
        />
        <Stat
          label="Unseated"
          value={unseated.length}
          tone={unseated.length ? undefined : "success"}
          hint="attending, still need a seat"
        />
        <Stat
          label="Free seats"
          value={capacity - seatedCount}
          hint={`${capacity} seats at ${tables.length} tables`}
        />
        <Stat
          label="Rules broken"
          value={brokenRules.length}
          tone={brokenRules.length ? "error" : "success"}
          hint={brokenRules.length ? "flagged on the plan" : "every rule is kept"}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 380px" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <RoomPlan />
          <Paper variant="outlined" component="section" aria-label="Guests per table" sx={{ p: 1.5 }}>
            <Stack
              component="ul"
              direction="row"
              sx={{ listStyle: "none", m: 0, p: 0, gap: 1, flexWrap: "wrap" }}
            >
              {tables.map((t) => {
                const n = (seats[t.id] ?? []).filter(Boolean).length;
                return (
                  <Box
                    component="li"
                    key={t.id}
                    sx={{
                      px: 1.25,
                      py: 0.5,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      fontSize: 13,
                    }}
                  >
                    {t.name}: <strong>{n}</strong> of {t.seats}
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Stack>
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <TableDetails />
          <UnseatedList />
          <RulesSummary />
        </Stack>
      </Box>
    </Box>
  );
}
