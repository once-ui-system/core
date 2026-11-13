"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@/lib/stack";
import { event, formatEventDate } from "@/lib/data";
import RoomPlan from "@/components/RoomPlan";
import RulesPanel from "@/components/RulesPanel";
import StatTiles from "@/components/StatTiles";
import TablePanel from "@/components/TablePanel";
import UnseatedList from "@/components/UnseatedList";

export default function PlanView() {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h1" sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Seating plan
        </Typography>
        <Typography color="text.secondary">
          {event.name} · {formatEventDate(event.date)} · {event.venue}
        </Typography>
      </Box>
      <StatTiles />
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 380px" },
          alignItems: "start",
        }}
      >
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Box sx={{ display: { xs: "block", lg: "none" } }}>
            <UnseatedList variant="strip" />
          </Box>
          <RoomPlan />
          <RulesPanel />
        </Stack>
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Box sx={{ display: { xs: "none", lg: "block" } }}>
            <UnseatedList variant="list" />
          </Box>
          <TablePanel />
        </Stack>
      </Box>
    </Stack>
  );
}
