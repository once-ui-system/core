"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { usePlan } from "@/lib/plan";
import { tint } from "@/lib/ui";
import type { RuleStatus } from "@/lib/rules";

const ORDER: Record<RuleStatus, number> = { broken: 0, pending: 1, ok: 2 };
const STATUS_LABEL: Record<RuleStatus, string> = { broken: "Broken", pending: "Waiting", ok: "Met" };

export default function RulesPanel() {
  const plan = usePlan();
  const sorted = [...plan.rules].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const broken = plan.rules.filter((r) => r.status === "broken").length;

  return (
    <Paper variant="outlined" component="section" aria-label="The couple's rules" sx={{ p: 1.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
        <Typography variant="h2" sx={{ fontSize: 16, fontWeight: 700 }}>
          The couple&apos;s rules
        </Typography>
        <Chip
          size="small"
          color={broken > 0 ? "error" : "success"}
          label={broken > 0 ? `${broken} broken` : "All met"}
        />
      </Stack>
      <Typography variant="body2" color="text.secondary" role="status" sx={{ mb: 1.25 }}>
        {broken > 0
          ? `${broken} rule${broken > 1 ? "s are" : " is"} broken. The tables involved are marked on the plan.`
          : "No rule is broken with the current seating."}
      </Typography>
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1 }}>
        {sorted.map((r) => {
          const color = r.status === "broken" ? "error" : r.status === "pending" ? "warning" : "success";
          const Icon = r.status === "broken" ? WarningAmberIcon : r.status === "pending" ? HourglassEmptyIcon : CheckCircleIcon;
          const target = r.tableIds[0];
          return (
            <li key={r.id}>
              <ButtonBase
                disabled={!target}
                onClick={() => target && plan.selectTable(target)}
                aria-label={`${r.label}: ${r.subject}. ${STATUS_LABEL[r.status]}. ${r.detail}`}
                sx={{
                  width: "100%",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  textAlign: "left",
                  gap: 1.25,
                  p: 1.25,
                  borderRadius: 2,
                  border: 1,
                  borderColor: r.status === "broken" ? "error.main" : "divider",
                  bgcolor: r.status === "broken" ? tint("error-main", 8) : "transparent",
                  "&.Mui-disabled": { opacity: 1 },
                }}
              >
                <Icon color={color} fontSize="small" sx={{ mt: 0.25 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {r.label}: {r.subject}
                  </Typography>
                  <Typography variant="body2">{r.detail}</Typography>
                  <Typography variant="caption" color="text.secondary" component="div">
                    {r.note}
                  </Typography>
                </Box>
                <Chip size="small" variant="outlined" color={color} label={STATUS_LABEL[r.status]} sx={{ ml: "auto", flexShrink: 0 }} />
              </ButtonBase>
            </li>
          );
        })}
      </Box>
    </Paper>
  );
}
