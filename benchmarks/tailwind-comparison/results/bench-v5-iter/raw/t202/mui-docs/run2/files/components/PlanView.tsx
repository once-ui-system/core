"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "./Stack";
import Typography from "@mui/material/Typography";
import { event, tables } from "@/lib/data";
import { formatDate, totalSeats } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import { RoomPlan } from "./RoomPlan";
import { RulesCard, TableDetail, TablesCard } from "./Sidebar";
import { UnseatedTray } from "./UnseatedTray";
import { V } from "./ui";

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  tone?: "error" | "warning" | "success";
}) {
  const color = tone === "error" ? V.error : tone === "warning" ? V.warning : tone === "success" ? V.success : V.text;
  return (
    <Card sx={{ px: 2, py: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Typography component="p" sx={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, color, letterSpacing: "-0.02em" }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {sub}
      </Typography>
    </Card>
  );
}

export function PlanView() {
  const { stats, rules } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;

  return (
    <Stack gap={2.5}>
      <Box>
        <Typography variant="h1" component="h1">
          {event.name}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {formatDate(event.date)} · {event.venue} · {tables.length} tables, {totalSeats} seats
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
        }}
      >
        <Stat
          label="Seated"
          value={stats.seatedAttending}
          sub={`of ${stats.attending} attending${stats.seatedOther ? ` · +${stats.seatedOther} unconfirmed` : ""}`}
          tone="success"
        />
        <Stat
          label="Unseated"
          value={stats.unseated}
          sub={stats.unseated ? "attending, need a seat" : "everyone is placed"}
          tone={stats.unseated ? "warning" : "success"}
        />
        <Stat label="Empty seats" value={stats.emptySeats} sub={`of ${totalSeats} across ${tables.length} tables`} />
        <Stat
          label="Rules"
          value={broken}
          sub={broken ? `broken of ${rules.length}` : `none broken of ${rules.length}`}
          tone={broken ? "error" : "success"}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          alignItems: "start",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 380px" },
        }}
      >
        <Stack gap={2.5} sx={{ minWidth: 0 }}>
          <UnseatedTray />
          <RoomPlan />
        </Stack>
        <Stack gap={2.5} sx={{ minWidth: 0 }}>
          <RulesCard />
          <TableDetail />
          <TablesCard />
        </Stack>
      </Box>
    </Stack>
  );
}
