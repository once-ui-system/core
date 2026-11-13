"use client";

import type { DragEvent, KeyboardEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { tables, type Guest } from "@/lib/data";
import { RSVP_LABEL, guestById, initials, partyColor, tableById } from "@/lib/plan";
import { usePlan, type PanelTab } from "./PlanProvider";
import SeatMenuButton from "./SeatMenuButton";

function PartyAvatar({ guest }: { guest: Guest }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: 34,
        height: 34,
        flexShrink: 0,
        borderRadius: "50%",
        bgcolor: partyColor(guest.party),
        color: "#fff",
        display: "grid",
        placeItems: "center",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {initials(guest.name)}
    </Box>
  );
}

function DietChip({ diet }: { diet: string }) {
  return <Chip size="small" icon={<RestaurantIcon />} label={diet} color="warning" variant="outlined" />;
}

function ToSeatRow({ guest }: { guest: Guest }) {
  const plan = usePlan();
  const isPicked = plan.picked === guest.id;
  const toggle = () => plan.pick(isPicked ? null : guest.id);
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: "center",
        border: 1,
        borderColor: isPicked ? "primary.main" : "divider",
        bgcolor: isPicked ? "action.selected" : "background.paper",
        borderRadius: 2,
        pr: 1,
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        draggable
        aria-pressed={isPicked}
        aria-label={`${isPicked ? "Put down" : "Pick up"} ${guest.name}, then tap a seat or table`}
        onClick={toggle}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        onDragStart={(e: DragEvent) => {
          e.dataTransfer.setData("text/plain", guest.id);
          e.dataTransfer.effectAllowed = "move";
          plan.setDragId(guest.id);
        }}
        onDragEnd={() => plan.setDragId(null)}
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          p: 1,
          minHeight: 48,
          cursor: "grab",
          borderRadius: 2,
          "&:focus-visible": { outline: "3px solid", outlineColor: "primary.main" },
        }}
      >
        <PartyAvatar guest={guest} />
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 600 }}>
            {guest.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {guest.party}
            {guest.diet ? ` · ${guest.diet}` : ""}
            {guest.rsvp !== "yes" ? ` · ${RSVP_LABEL[guest.rsvp]}` : ""}
          </Typography>
        </Box>
      </Box>
      <SeatMenuButton guestId={guest.id} />
    </Stack>
  );
}

function ToSeatPanel() {
  const plan = usePlan();
  const dropUnseat = (e: DragEvent) => {
    e.preventDefault();
    if (plan.dragId && plan.guestTable[plan.dragId]) plan.unseat(plan.dragId);
    plan.setDragId(null);
  };
  const canDrop = Boolean(plan.dragId && plan.guestTable[plan.dragId]);
  return (
    <Stack
      spacing={1}
      onDragOver={(e: DragEvent) => {
        if (canDrop) e.preventDefault();
      }}
      onDrop={dropUnseat}
      sx={{
        borderRadius: 2,
        outline: canDrop ? "2px dashed" : "none",
        outlineColor: "primary.main",
        outlineOffset: 4,
      }}
    >
      <Typography variant="h3" component="h3">
        Attending, no seat yet ({plan.toSeat.length})
      </Typography>
      {canDrop ? (
        <Typography variant="body2" color="primary">
          Drop here to unseat this guest.
        </Typography>
      ) : null}
      {plan.toSeat.length === 0 ? (
        <Alert severity="success">Everyone attending has a seat.</Alert>
      ) : (
        <Stack spacing={1} component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
          {plan.toSeat.map((id) => (
            <li key={id}>
              <ToSeatRow guest={guestById[id]} />
            </li>
          ))}
        </Stack>
      )}
      {plan.awaitingToSeat.length > 0 ? (
        <>
          <Typography variant="h3" component="h3" sx={{ pt: 1 }}>
            Not confirmed yet ({plan.awaitingToSeat.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Maybe or awaiting a reply. You can seat them provisionally.
          </Typography>
          <Stack spacing={1} component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {plan.awaitingToSeat.map((id) => (
              <li key={id}>
                <ToSeatRow guest={guestById[id]} />
              </li>
            ))}
          </Stack>
        </>
      ) : null}
    </Stack>
  );
}

function RulesPanel() {
  const plan = usePlan();
  return (
    <Stack spacing={1.25}>
      <Typography variant="h3" component="h3">
        The couple&apos;s rules
      </Typography>
      <Stack spacing={1} component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
        {plan.rules.map((r) => {
          const color = r.status === "broken" ? "error" : r.status === "ok" ? "success" : "warning";
          const Icon = r.status === "broken" ? ErrorOutlineIcon : r.status === "ok" ? CheckCircleIcon : HourglassEmptyIcon;
          const status = r.status === "broken" ? "Broken" : r.status === "ok" ? "Met" : "Waiting for a seat";
          return (
            <Paper component="li" key={r.id} variant="outlined" sx={{ p: 1.5, borderColor: `${color}.main` }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                <Icon color={color} aria-hidden />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
                    <Typography sx={{ fontWeight: 700 }}>{r.title}</Typography>
                    <Chip size="small" color={color} label={status} />
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {r.names}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {r.detail}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }} component="div">
                    {r.rule.note}
                  </Typography>
                  {r.warning ? (
                    <Typography variant="caption" color="warning.main" component="div" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {r.warning}
                    </Typography>
                  ) : null}
                  {r.tableIds.length > 0 ? (
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
                      {r.tableIds.map((tid) => (
                        <Button key={tid} size="small" variant="outlined" color="inherit" onClick={() => plan.selectTable(tid)}>
                          Show {tableById[tid].name}
                        </Button>
                      ))}
                    </Stack>
                  ) : null}
                </Box>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Stack>
  );
}

function TablePanel() {
  const plan = usePlan();
  const table = plan.selectedTable ? tableById[plan.selectedTable] : null;
  if (!table) {
    return (
      <Stack spacing={1.5}>
        <Typography variant="h3" component="h3">
          Table details
        </Typography>
        <Typography color="text.secondary">
          Select a table in the room to see who sits there and what they eat.
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
          {tables.map((t) => (
            <Chip key={t.id} clickable label={t.name} onClick={() => plan.selectTable(t.id)} />
          ))}
        </Stack>
      </Stack>
    );
  }
  const row = plan.seats[table.id] ?? [];
  const count = plan.occupied[table.id] ?? 0;
  const problems = plan.brokenByTable[table.id] ?? [];
  const diets = new Map<string, number>();
  for (const id of row) {
    const d = id ? guestById[id]?.diet : null;
    if (d) diets.set(d, (diets.get(d) ?? 0) + 1);
  }
  const picked = plan.picked ? guestById[plan.picked] : null;

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="h3" component="h3">
          {table.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {count} of {table.seats} seats taken, {table.seats - count} free
        </Typography>
      </Box>
      {problems.map((r) => (
        <Alert key={r.id} severity="error" sx={{ py: 0.5 }}>
          <strong>{r.title}.</strong> {r.detail}
        </Alert>
      ))}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Dietary needs at this table
        </Typography>
        {diets.size === 0 ? (
          <Typography variant="body2">None noted.</Typography>
        ) : (
          <Stack direction="row" spacing={0.75} sx={{ mt: 0.5, flexWrap: "wrap", rowGap: 0.75 }}>
            {Array.from(diets.entries()).map(([d, n]) => (
              <DietChip key={d} diet={`${d} × ${n}`} />
            ))}
          </Stack>
        )}
      </Box>
      {picked && plan.guestTable[picked.id] !== table.id ? (
        <Button variant="contained" onClick={() => plan.place(picked.id, table.id)} disabled={count >= table.seats}>
          Seat {picked.name} here
        </Button>
      ) : null}
      <Stack spacing={0.75} component="ol" sx={{ listStyle: "none", p: 0, m: 0 }}>
        {row.map((id, i) => {
          const g = id ? guestById[id] : null;
          return (
            <Stack
              component="li"
              key={i}
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                border: 1,
                borderStyle: g ? "solid" : "dashed",
                borderColor: g && plan.brokenGuests.has(g.id) ? "error.main" : "divider",
                borderRadius: 2,
                p: 1,
                minHeight: 52,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ width: 40, flexShrink: 0 }}>
                Seat {i + 1}
              </Typography>
              {g ? (
                <>
                  <PartyAvatar guest={g} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 600 }}>
                      {g.name}
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {g.party}
                      </Typography>
                      {g.diet ? <DietChip diet={g.diet} /> : null}
                    </Stack>
                  </Box>
                  <SeatMenuButton guestId={g.id} />
                  <IconButton aria-label={`Unseat ${g.name}`} size="small" onClick={() => plan.unseat(g.id)}>
                    <PersonRemoveIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <Typography color="text.secondary" sx={{ flex: 1 }}>
                  Empty
                </Typography>
              )}
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}

export default function SidePanel() {
  const plan = usePlan();
  const broken = plan.rules.filter((r) => r.status === "broken").length;
  return (
    <Paper
      variant="outlined"
      component="section"
      aria-label="Guests, rules and table details"
      sx={{
        position: { lg: "sticky" },
        top: { lg: 16 },
        maxHeight: { lg: "calc(100dvh - 32px)" },
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Tabs
        value={plan.panelTab}
        onChange={(_, v: PanelTab) => plan.setPanelTab(v)}
        variant="fullWidth"
        aria-label="Side panel"
        sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
      >
        <Tab value="toSeat" label={`To seat (${plan.toSeat.length})`} id="tab-toSeat" aria-controls="panel-toSeat" />
        <Tab value="rules" label={`Rules${broken ? ` (${broken})` : ""}`} id="tab-rules" aria-controls="panel-rules" />
        <Tab value="table" label="Table" id="tab-table" aria-controls="panel-table" />
      </Tabs>
      <Box
        role="tabpanel"
        id={`panel-${plan.panelTab}`}
        aria-labelledby={`tab-${plan.panelTab}`}
        sx={{ p: 2, overflowY: "auto", flex: 1 }}
      >
        {plan.panelTab === "toSeat" ? <ToSeatPanel /> : plan.panelTab === "rules" ? <RulesPanel /> : <TablePanel />}
      </Box>
    </Paper>
  );
}
