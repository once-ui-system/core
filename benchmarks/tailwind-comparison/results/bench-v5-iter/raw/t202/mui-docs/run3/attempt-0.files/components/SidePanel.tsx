"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import DietChip from "./DietChip";
import { guestById, guests, tableById } from "@/lib/data";
import { partyEdge, partyTint } from "@/lib/party";
import { usePlan } from "@/lib/plan";
import { ruleKindLabel, type RuleStatus } from "@/lib/rules";

const statusMeta: Record<RuleStatus, { label: string; color: "success" | "error" | "default"; icon: React.ReactNode }> = {
  ok: { label: "Kept", color: "success", icon: <CheckCircleIcon fontSize="small" color="success" /> },
  broken: { label: "Broken", color: "error", icon: <ErrorIcon fontSize="small" color="error" /> },
  open: { label: "Waiting", color: "default", icon: <HourglassEmptyIcon fontSize="small" color="disabled" /> },
};

function Section({
  title,
  action,
  children,
  id,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <Paper variant="outlined" component="section" aria-labelledby={id} sx={{ p: 2 }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5, gap: 1 }}>
        <Typography variant="h2" component="h2" id={id}>
          {title}
        </Typography>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

export function UnseatedList() {
  const { unseated, heldGuest, hold, unseat } = usePlan();
  const [over, setOver] = useState(false);
  const waiting = guests.filter((g) => g.rsvp === "maybe" || g.rsvp === "pending").length;
  const declined = guests.filter((g) => g.rsvp === "no").length;

  return (
    <Section
      id="unseated-title"
      title="Guests to seat"
      action={<Chip size="small" label={unseated.length} color={unseated.length ? "primary" : "success"} />}
    >
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const gid = e.dataTransfer.getData("text/plain");
          if (guestById[gid]) unseat(gid);
        }}
        sx={{
          borderRadius: 1.5,
          outline: over ? "2px dashed var(--mui-palette-primary-main)" : "2px dashed transparent",
          outlineOffset: 2,
        }}
      >
        {unseated.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            Everyone attending has a seat.
          </Typography>
        ) : (
          <Stack component="ul" spacing={0.75} sx={{ listStyle: "none", m: 0, p: 0 }}>
            {unseated.map((id) => {
              const g = guestById[id];
              const isHeld = heldGuest === id;
              return (
                <li key={id}>
                  <Box
                    component="button"
                    type="button"
                    draggable
                    aria-pressed={isHeld}
                    onClick={() => hold(isHeld ? null : id)}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    sx={{
                      width: "100%",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                      minHeight: 48,
                      px: 1.25,
                      py: 0.75,
                      borderRadius: 1.5,
                      border: "1.5px solid",
                      borderColor: isHeld ? "primary.main" : "divider",
                      borderLeft: "5px solid",
                      borderLeftColor: partyEdge(g.party),
                      bgcolor: isHeld
                        ? "color-mix(in srgb, var(--mui-palette-primary-main) 14%, var(--mui-palette-background-paper))"
                        : partyTint(g.party, 12),
                      color: "text.primary",
                      font: "inherit",
                      cursor: "grab",
                      "&:hover": { borderColor: "primary.main" },
                      "&:focus-visible": { outline: "3px solid var(--mui-palette-primary-main)", outlineOffset: 2 },
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {g.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap component="div">
                        {g.party}
                      </Typography>
                    </Box>
                    <DietChip diet={g.diet} />
                  </Box>
                </li>
              );
            })}
          </Stack>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1.5, mb: 0 }}>
        Drop a seated guest here to unseat them. {waiting} guests have not confirmed and {declined} declined; they are
        not listed.
      </Typography>
    </Section>
  );
}

export function RulesSummary() {
  const { rules, brokenRules, selectTable } = usePlan();
  const kept = rules.filter((r) => r.status === "ok").length;
  const open = rules.filter((r) => r.status === "open").length;
  return (
    <Section
      id="rules-title"
      title="The couple's rules"
      action={
        <Chip
          size="small"
          color={brokenRules.length ? "error" : "success"}
          label={brokenRules.length ? `${brokenRules.length} broken` : "All kept"}
        />
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} aria-live="polite">
        {brokenRules.length} broken, {kept} kept, {open} waiting for guests to be seated.
      </Typography>
      <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
        {rules.map((r) => {
          const meta = statusMeta[r.status];
          return (
            <Box
              component="li"
              key={r.index}
              sx={{
                display: "flex",
                gap: 1.25,
                p: 1.25,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: r.status === "broken" ? "error.main" : "divider",
                bgcolor:
                  r.status === "broken"
                    ? "color-mix(in srgb, var(--mui-palette-error-main) 8%, var(--mui-palette-background-paper))"
                    : "transparent",
              }}
            >
              <Box sx={{ pt: 0.25 }}>{meta.icon}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" component="div">
                  {ruleKindLabel[r.rule.kind]} · <strong>{meta.label}</strong>
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {r.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" component="div">
                  {r.detail}
                </Typography>
                <Typography variant="caption" color="text.secondary" component="div" sx={{ fontStyle: "italic" }}>
                  {r.rule.note}
                </Typography>
                {r.status === "broken" && r.tableIds.length > 0 ? (
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}>
                    {r.tableIds.map((t) => (
                      <Button key={t} size="small" variant="outlined" color="error" onClick={() => selectTable(t)}>
                        Show {tableById[t].name}
                      </Button>
                    ))}
                  </Stack>
                ) : null}
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Section>
  );
}

export function TableDetails() {
  const { selectedTable, seats, selectTable, flaggedTables, heldGuest, place, hold, unseat } = usePlan();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedTable && ref.current && window.matchMedia("(max-width: 1199px)").matches) {
      ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedTable]);

  const table = selectedTable ? tableById[selectedTable] : null;
  if (!table) {
    return (
      <Section id="table-title" title="Table details">
        <Typography variant="body2" color="text.secondary">
          Select a table on the plan to see who sits there and what they can eat.
        </Typography>
      </Section>
    );
  }
  const row = seats[table.id] ?? [];
  const seated = row.filter((x): x is string => x !== null);
  const diets = new Map<string, number>();
  for (const id of seated) {
    const d = guestById[id].diet;
    if (d) diets.set(d, (diets.get(d) ?? 0) + 1);
  }
  const flags = flaggedTables[table.id] ?? [];

  return (
    <div ref={ref}>
      <Section
        id="table-title"
        title={table.name}
        action={
          <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
            <Chip size="small" label={`${seated.length} of ${table.seats} seats`} />
            <IconButton size="small" aria-label="Close table details" onClick={() => selectTable(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        }
      >
        {flags.length > 0 ? (
          <Box
            role="alert"
            sx={{
              mb: 1.5,
              p: 1.25,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "error.main",
              bgcolor: "color-mix(in srgb, var(--mui-palette-error-main) 8%, var(--mui-palette-background-paper))",
            }}
          >
            {flags.map((f) => (
              <Typography key={f.index} variant="body2">
                <strong>{ruleKindLabel[f.rule.kind]}:</strong> {f.title}. {f.detail}.
              </Typography>
            ))}
          </Box>
        ) : null}

        <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
          Dietary needs at this table
        </Typography>
        <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", mb: 1.5 }}>
          {diets.size === 0 ? (
            <Typography variant="body2">None noted.</Typography>
          ) : (
            Array.from(diets.entries()).map(([d, n]) => (
              <Chip
                key={d}
                size="small"
                color={d === "Nut allergy" ? "error" : "warning"}
                variant="outlined"
                label={`${n} × ${d}`}
              />
            ))
          )}
        </Stack>

        <Stack component="ol" spacing={0.5} sx={{ listStyle: "none", m: 0, p: 0 }}>
          {row.map((gid, i) => {
            const g = gid ? guestById[gid] : null;
            return (
              <Box
                component="li"
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minHeight: 48,
                  px: 1,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderStyle: g ? "solid" : "dashed",
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ width: 18, textAlign: "right" }}>
                  {i + 1}
                </Typography>
                {g ? (
                  <>
                    <Box
                      aria-hidden
                      sx={{ width: 8, alignSelf: "stretch", my: 0.75, borderRadius: 1, bgcolor: partyEdge(g.party) }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {g.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="div" noWrap>
                        {g.party}
                      </Typography>
                    </Box>
                    <DietChip diet={g.diet} />
                    <IconButton
                      size="small"
                      aria-label={`Unseat ${g.name}`}
                      onClick={() => unseat(g.id)}
                      sx={{ width: 40, height: 40 }}
                    >
                      <PersonRemoveIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      Empty seat
                    </Typography>
                    {heldGuest ? (
                      <Button size="small" variant="contained" onClick={() => place(heldGuest, table.id, i)}>
                        Seat {guestById[heldGuest].name.split(" ")[0]}
                      </Button>
                    ) : null}
                  </>
                )}
              </Box>
            );
          })}
        </Stack>
        {heldGuest ? (
          <Button size="small" sx={{ mt: 1 }} onClick={() => hold(null)}>
            Cancel moving {guestById[heldGuest].name}
          </Button>
        ) : null}
      </Section>
    </div>
  );
}
