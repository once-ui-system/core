"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "./Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Close from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import PersonRemoveOutlined from "@mui/icons-material/PersonRemoveOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SwapHoriz from "@mui/icons-material/SwapHoriz";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { tables } from "@/lib/data";
import { firstName, guestById, rsvpLabel, tableById } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import { GuestDot } from "./UnseatedTray";
import { V, mix } from "./ui";

/* ---------- rules ---------- */

export function RulesCard() {
  const { rules, selectTable } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;
  const kept = rules.filter((r) => r.status === "ok").length;
  const waiting = rules.length - broken - kept;

  return (
    <Card component="section" aria-labelledby="rules-title" sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Typography id="rules-title" variant="h2" component="h2">
          The couple&apos;s rules
        </Typography>
        <Chip
          size="small"
          color={broken ? "error" : "success"}
          label={broken ? `${broken} broken` : "All kept"}
          sx={{ fontWeight: 700 }}
        />
      </Stack>
      <Typography
        variant="body2"
        color={broken ? "error" : "text.secondary"}
        role="status"
        sx={{ mt: 0.5, mb: 1, fontWeight: broken ? 600 : 400 }}
      >
        {broken
          ? `${broken} of ${rules.length} rules broken, ${kept} kept${waiting ? `, ${waiting} not yet checkable` : ""}.`
          : `${kept} of ${rules.length} rules kept${waiting ? `, ${waiting} waiting for seats` : ""}.`}
      </Typography>

      <Stack component="ul" gap={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
        {rules.map((r) => {
          const Icon = r.status === "broken" ? ErrorIcon : r.status === "ok" ? CheckCircle : ScheduleIcon;
          const color = r.status === "broken" ? V.error : r.status === "ok" ? V.success : V.text2;
          const statusText = r.status === "broken" ? "Broken" : r.status === "ok" ? "Kept" : "Waiting";
          const first = r.tables[0];
          return (
            <Box
              component="li"
              key={r.rule.id}
              sx={{
                border: `1px solid ${r.status === "broken" ? mix(V.error, 55) : V.divider}`,
                bgcolor: r.status === "broken" ? mix(V.error, 8) : "transparent",
                borderRadius: 2,
              }}
            >
              <ButtonBase
                disabled={!first}
                onClick={() => first && selectTable(first)}
                sx={{ display: "flex", alignItems: "flex-start", justifyContent: "flex-start", gap: 1, p: 1.25, width: "100%", textAlign: "left", borderRadius: 2 }}
              >
                <Icon aria-hidden sx={{ color, fontSize: 20, mt: 0.25 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                    <Box component="span" sx={{ color, fontWeight: 700 }}>
                      {statusText}:
                    </Box>{" "}
                    {r.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                    {r.detail}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontStyle: "italic" }}>
                    {r.rule.note}
                  </Typography>
                </Box>
              </ButtonBase>
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
}

/* ---------- tables list ---------- */

export function TablesCard() {
  const { seats, selectedTable, selectTable, holding, place, brokenTables, stats } = usePlan();
  return (
    <Card component="section" aria-labelledby="tables-title" sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography id="tables-title" variant="h2" component="h2">
          Tables
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {stats.seatedAll} seated · {stats.emptySeats} empty
        </Typography>
      </Stack>
      <Stack component="ul" gap={0.5} sx={{ listStyle: "none", m: 0, mt: 1, p: 0 }}>
        {tables.map((t) => {
          const taken = (seats[t.id] ?? []).filter(Boolean).length;
          const full = taken >= t.seats;
          const sel = selectedTable === t.id;
          const bad = brokenTables.has(t.id);
          return (
            <li key={t.id}>
              <ButtonBase
                onClick={() => (holding ? place(t.id) : selectTable(t.id))}
                aria-pressed={sel}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "92px 1fr auto",
                  alignItems: "center",
                  gap: 1.5,
                  width: "100%",
                  textAlign: "left",
                  px: 1.25,
                  minHeight: 44,
                  borderRadius: 2,
                  border: `1.5px solid ${sel ? V.primary : "transparent"}`,
                  bgcolor: sel ? mix(V.primary, 10) : holding && !full ? mix(V.primary, 6) : "transparent",
                  "&:hover": { bgcolor: mix(V.primary, 8) },
                  "&.Mui-focusVisible": { outline: `2px solid ${V.primary}`, outlineOffset: 1 },
                }}
              >
                <Box component="span" sx={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 0.5 }}>
                  {t.name}
                  {bad ? <WarningAmber aria-hidden sx={{ fontSize: 16, color: V.error }} /> : null}
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(taken / t.seats) * 100}
                  color={full ? "success" : "primary"}
                  aria-hidden
                  sx={{ height: 6, borderRadius: 3 }}
                />
                <Box component="span" sx={{ fontSize: 13, fontWeight: 700, minWidth: 32, textAlign: "right", color: full ? V.success : V.text }}>
                  {taken}/{t.seats}
                </Box>
              </ButtonBase>
            </li>
          );
        })}
      </Stack>
    </Card>
  );
}

/* ---------- selected table ---------- */

export function dietSummary(ids: (string | null)[]): { diet: string; n: number }[] {
  const counts = new Map<string, number>();
  for (const id of ids) {
    const d = id ? guestById[id]?.diet : null;
    if (d) counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  return Array.from(counts, ([diet, n]) => ({ diet, n }));
}

export function TableDetail() {
  const { selectedTable, selectTable, seats, rules, holding, setHolding, place, unseat, focusGuest, setFocusGuest } =
    usePlan();
  const table = selectedTable ? tableById[selectedTable] : null;

  if (!table) {
    return (
      <Card component="section" aria-labelledby="detail-title" sx={{ p: 2 }}>
        <Typography id="detail-title" variant="h2" component="h2">
          Table details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Select a table on the plan or in the list to see who is sitting there and what they eat.
        </Typography>
      </Card>
    );
  }

  const row = seats[table.id] ?? [];
  const taken = row.filter(Boolean).length;
  const diets = dietSummary(row);
  const issues = rules.filter((r) => r.status === "broken" && r.tables.includes(table.id));

  return (
    <Card component="section" aria-labelledby="detail-title" sx={{ p: 2, borderColor: V.primary }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
        <Box>
          <Typography id="detail-title" variant="h2" component="h2">
            {table.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {taken} of {table.seats} seats taken · {table.seats - taken} free · {table.shape === "long" ? "long table" : "round table"}
          </Typography>
        </Box>
        <IconButton aria-label="Close table details" size="small" onClick={() => selectTable(null)}>
          <Close fontSize="small" />
        </IconButton>
      </Stack>

      {issues.length > 0 ? (
        <Stack gap={0.5} sx={{ mt: 1.25 }}>
          {issues.map((r) => (
            <Stack key={r.rule.id} direction="row" gap={0.75} sx={{ color: V.error, fontSize: 13, fontWeight: 600 }}>
              <ErrorIcon aria-hidden sx={{ fontSize: 18 }} />
              <span>{r.title}: {r.detail}</span>
            </Stack>
          ))}
        </Stack>
      ) : null}

      <Box sx={{ mt: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.06em" }}>
          DIETARY NEEDS AT THIS TABLE
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 0.5 }}>
          {diets.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              None
            </Typography>
          ) : (
            diets.map((d) => (
              <Chip key={d.diet} size="small" color="warning" variant="outlined" label={`${d.diet} × ${d.n}`} />
            ))
          )}
        </Stack>
      </Box>

      <Stack component="ol" gap={0.5} sx={{ listStyle: "none", m: 0, mt: 1.5, p: 0 }}>
        {row.map((gid, i) => {
          const g = gid ? guestById[gid] : null;
          return (
            <Box
              component="li"
              key={i}
              sx={{
                display: "grid",
                gridTemplateColumns: "22px 1fr auto",
                alignItems: "center",
                gap: 1,
                py: 0.75,
                px: 1,
                borderRadius: 2,
                bgcolor: g && focusGuest === g.id ? mix(V.primary, 12) : "transparent",
                borderBottom: `1px solid ${V.divider}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" aria-hidden sx={{ fontWeight: 700 }}>
                {i + 1}
              </Typography>
              {g ? (
                <>
                  <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                    <GuestDot guest={g} size={28} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.25 }}>
                        {g.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {g.party}
                        {g.rsvp !== "yes" ? ` · RSVP ${rsvpLabel[g.rsvp].toLowerCase()}` : ""}
                      </Typography>
                      {g.diet ? (
                        <Chip size="small" color="warning" variant="outlined" label={g.diet} sx={{ mt: 0.25, height: 20, fontSize: 11 }} />
                      ) : null}
                    </Box>
                  </Stack>
                  <Stack direction="row">
                    <Tooltip title={`Move ${firstName(g.name)}`}>
                      <IconButton
                        size="small"
                        aria-label={`Move ${g.name} to another seat`}
                        aria-pressed={holding === g.id}
                        color={holding === g.id ? "primary" : "default"}
                        onClick={() => {
                          setFocusGuest(g.id);
                          setHolding(holding === g.id ? null : g.id);
                        }}
                      >
                        <SwapHoriz fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={`Unseat ${firstName(g.name)}`}>
                      <IconButton size="small" aria-label={`Unseat ${g.name}`} onClick={() => unseat(g.id)}>
                        <PersonRemoveOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    Empty seat
                  </Typography>
                  {holding ? (
                    <Button size="small" onClick={() => place(table.id, i)}>
                      Place here
                    </Button>
                  ) : (
                    <span />
                  )}
                </>
              )}
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
}
