"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CheckCircle from "@mui/icons-material/CheckCircle";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { RULE_LABEL, ruleTitle, type RuleResult, type RuleStatus } from "@/lib/seating";
import { tint } from "@/lib/ui";
import { usePlan } from "./PlanProvider";

const ORDER: Record<RuleStatus, number> = { broken: 0, open: 1, ok: 2 };
const STATUS_LABEL: Record<RuleStatus, string> = { broken: "Broken", open: "Waiting", ok: "Kept" };

function StatusIcon({ status }: { status: RuleStatus }) {
  if (status === "broken") return <WarningAmber color="error" fontSize="small" />;
  if (status === "ok") return <CheckCircle color="success" fontSize="small" />;
  return <InfoOutlined color="action" fontSize="small" />;
}

export default function RulesPanel() {
  const plan = usePlan();
  const sorted = [...plan.results].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const broken = sorted.filter((r) => r.status === "broken").length;
  const ok = sorted.filter((r) => r.status === "ok").length;
  const open = sorted.length - broken - ok;

  const openRule = (r: RuleResult) => {
    const t = r.tables[0] ?? plan.guestTable[r.rule.guests.find((g) => plan.guestTable[g]) ?? ""] ?? null;
    if (t) plan.selectTable(t);
  };

  return (
    <Paper variant="outlined" component="section" aria-labelledby="rules-title" sx={{ p: 1.5 }}>
      <Typography id="rules-title" variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
        The couple&apos;s rules
      </Typography>
      <Typography
        variant="body2"
        role="status"
        sx={{ mt: 0.5, mb: 1, color: broken ? "error.main" : "text.secondary", fontWeight: broken ? 600 : 400 }}
      >
        {broken > 0
          ? `${broken} ${broken === 1 ? "rule is" : "rules are"} broken. ${ok} kept, ${open} waiting on guests to be seated.`
          : `No rule is broken. ${ok} kept, ${open} waiting on guests to be seated.`}
      </Typography>

      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1 }}>
        {sorted.map((r) => (
          <li key={r.rule.id}>
            <ButtonBase
              onClick={() => openRule(r)}
              disabled={r.tables.length === 0 && !r.rule.guests.some((g) => plan.guestTable[g])}
              sx={{
                width: "100%",
                display: "block",
                textAlign: "left",
                p: 1.25,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: r.status === "broken" ? "error.main" : "divider",
                bgcolor: r.status === "broken" ? tint("error-main", 8) : "transparent",
                "&:focus-visible": { outline: "3px solid var(--mui-palette-primary-main)", outlineOffset: 1 },
              }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <Box sx={{ pt: 0.25 }}>
                  <StatusIcon status={r.status} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                    <Chip size="small" variant="outlined" label={RULE_LABEL[r.rule.kind]} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: r.status === "broken" ? "error.main" : "text.secondary" }}>
                      {STATUS_LABEL[r.status]}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {ruleTitle(r.rule)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {r.message}
                  </Typography>
                  <Typography variant="caption" component="p" sx={{ fontStyle: "italic", mt: 0.25, color: "text.secondary" }}>
                    {r.rule.note}
                  </Typography>
                </Box>
              </Box>
            </ButtonBase>
          </li>
        ))}
      </Box>
    </Paper>
  );
}
