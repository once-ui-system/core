"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import Typography from "@mui/material/Typography";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlined";
import Close from "@mui/icons-material/Close";
import DragIndicator from "@mui/icons-material/DragIndicator";
import ErrorOutline from "@mui/icons-material/ErrorOutlined";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import HourglassEmpty from "@mui/icons-material/HourglassEmpty";
import PersonRemoveOutlined from "@mui/icons-material/PersonRemoveOutlined";
import SwapHoriz from "@mui/icons-material/SwapHoriz";
import TextFields from "@mui/icons-material/TextFields";
import {
  event,
  formatDate,
  guestById,
  guests,
  partyColors,
  planner,
  rsvpLabels,
  tableById,
  tables,
  type Guest,
} from "@/lib/data";
import { usePlan, type PlaceResult } from "@/lib/plan";
import type { RuleResult } from "@/lib/rules";
import FloorPlan from "./FloorPlan";
import { DietChip, GuestDot } from "./GuestBits";
import { useGuestDrag, type DropTarget, type StartDrag } from "./useGuestDrag";

type PanelTab = "unseated" | "tables" | "details";

interface Toast {
  id: number;
  ok: boolean;
  message: string;
}

export default function PlanView() {
  const plan = usePlan();
  const { seats, totals, ruleResults, place, unseat, brokenByTable, tableOfGuest, seatedCount } = plan;

  const [selectedTableId, setSelectedTableId] = useState<string | null>("t-1");
  const [focusGuestId, setFocusGuestId] = useState<string | null>(null);
  const [armedGuestId, setArmedGuestId] = useState<string | null>(null);
  const [showNames, setShowNames] = useState(true);
  const [tab, setTab] = useState<PanelTab>("unseated");
  const [toast, setToast] = useState<Toast | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const announce = useCallback((r: PlaceResult) => {
    setToast({ id: Date.now(), ok: r.ok, message: r.message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!armedGuestId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setArmedGuestId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [armedGuestId]);

  const showTable = useCallback((tableId: string) => {
    setSelectedTableId(tableId);
    setTab("details");
  }, []);

  const placeGuest = useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const r = place(guestId, tableId, seat);
      announce(r);
      if (r.ok) {
        setFocusGuestId(guestId);
        setSelectedTableId(tableId);
        setArmedGuestId(null);
      }
      return r;
    },
    [place, announce],
  );

  const unseatGuest = useCallback(
    (guestId: string) => {
      const r = unseat(guestId);
      announce(r);
      if (r.ok) {
        setArmedGuestId(null);
        setFocusGuestId(guestId);
      }
    },
    [unseat, announce],
  );

  const onDrop = useCallback(
    (guestId: string, target: DropTarget) => {
      if (!target) return;
      if (target.type === "unseat") {
        if (tableOfGuest(guestId)) unseatGuest(guestId);
        return;
      }
      placeGuest(guestId, target.tableId, target.type === "seat" ? target.seat : undefined);
    },
    [placeGuest, unseatGuest, tableOfGuest],
  );

  const { drag, startDrag } = useGuestDrag(onDrop);

  const onTableClick = (tableId: string) => {
    if (armedGuestId) {
      placeGuest(armedGuestId, tableId);
      return;
    }
    showTable(tableId);
  };

  const onSeatClick = (tableId: string, seat: number) => {
    const occupant = seats[tableId]?.[seat] ?? null;
    if (armedGuestId && !occupant) {
      placeGuest(armedGuestId, tableId, seat);
      return;
    }
    if (armedGuestId) {
      placeGuest(armedGuestId, tableId);
      return;
    }
    if (occupant) setFocusGuestId(occupant);
    showTable(tableId);
  };

  const arm = (guestId: string) => {
    setArmedGuestId((cur) => (cur === guestId ? null : guestId));
    setFocusGuestId(guestId);
  };

  const unseated = useMemo(
    () => guests.filter((g) => g.rsvp !== "no" && !tableOfGuest(g.id)),
    // seats changes whenever someone moves
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seats],
  );
  const attendingUnseated = unseated.filter((g) => g.rsvp === "yes");
  const unconfirmedUnseated = unseated.filter((g) => g.rsvp !== "yes");
  const broken = ruleResults.filter((r) => r.status === "broken");
  const dragGuest = drag ? guestById[drag.guestId] : null;
  const dragSeated = drag ? tableOfGuest(drag.guestId) !== null : false;

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, maxWidth: 1680, mx: "auto" }}>
      <Header
        seated={totals.seated}
        capacity={totals.capacity}
        attending={totals.attending}
        attendingUnseated={totals.attendingUnseated}
        broken={broken.length}
      />

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 400px" },
          alignItems: "start",
          mt: 2.5,
        }}
      >
        <Stack spacing={2.5} sx={{ minWidth: 0 }}>
          <RulesCard results={ruleResults} onShow={showTable} />
          <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 1, mb: 1.5 }}
            >
              <Box>
                <Typography variant="h6" component="h2">
                  Room plan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.venue}, {event.room_m.width} × {event.room_m.depth} m. Drag a guest to a table or seat, or tap
                  a guest and then a table.
                </Typography>
              </Box>
              <ToggleButton
                value="names"
                size="small"
                selected={showNames}
                onChange={() => setShowNames((s) => !s)}
                aria-label="Show first names beside seats"
                sx={{ gap: 0.75, px: 1.5 }}
              >
                <TextFields fontSize="small" /> Names
              </ToggleButton>
            </Stack>
            <FloorPlan
              selectedTableId={selectedTableId}
              focusGuestId={focusGuestId}
              armedGuestId={armedGuestId}
              showNames={showNames}
              dragGuestId={drag?.guestId ?? null}
              dropTarget={drag?.target ?? null}
              startDrag={startDrag}
              onTableClick={onTableClick}
              onSeatClick={onSeatClick}
            />
            <Legend />
          </Paper>
        </Stack>

        <Paper
          ref={panelRef}
          variant="outlined"
          sx={{ minWidth: 0, position: { lg: "sticky" }, top: { lg: 88 }, scrollMarginTop: 80 }}
        >
          <Tabs
            value={tab}
            onChange={(_, v: PanelTab) => setTab(v)}
            variant="fullWidth"
            aria-label="Plan side panel"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab value="unseated" label={`To seat (${attendingUnseated.length})`} id="tab-unseated" aria-controls="panel-unseated" />
            <Tab value="tables" label="Tables" id="tab-tables" aria-controls="panel-tables" />
            <Tab value="details" label="Table" id="tab-details" aria-controls="panel-details" />
          </Tabs>
          <Box sx={{ maxHeight: { lg: "calc(100vh - 190px)" }, overflowY: "auto" }}>
            {tab === "unseated" && (
              <Box role="tabpanel" id="panel-unseated" aria-labelledby="tab-unseated">
                <UnseatedPanel
                  attending={attendingUnseated}
                  unconfirmed={unconfirmedUnseated}
                  armedGuestId={armedGuestId}
                  startDrag={startDrag}
                  onArm={arm}
                  draggingSeated={dragSeated}
                  dropActive={drag?.target?.type === "unseat"}
                />
              </Box>
            )}
            {tab === "tables" && (
              <Box role="tabpanel" id="panel-tables" aria-labelledby="tab-tables">
                <TablesPanel
                  selectedTableId={selectedTableId}
                  onSelect={showTable}
                  seatedCount={seatedCount}
                  brokenCount={(id) => (brokenByTable[id] ?? []).length}
                />
              </Box>
            )}
            {tab === "details" && (
              <Box role="tabpanel" id="panel-details" aria-labelledby="tab-details">
                <TableDetails
                  tableId={selectedTableId}
                  focusGuestId={focusGuestId}
                  broken={selectedTableId ? (brokenByTable[selectedTableId] ?? []) : []}
                  onMove={arm}
                  onUnseat={unseatGuest}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Bottom layer: placing bar and result toast */}
      <Stack
        spacing={1}
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 16,
          px: 2,
          zIndex: (t) => t.zIndex.snackbar,
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        {toast && (
          <Alert
            key={toast.id}
            severity={toast.ok ? "success" : "warning"}
            variant="filled"
            role="status"
            onClose={() => setToast(null)}
            sx={{ pointerEvents: "auto", maxWidth: 560, boxShadow: 6 }}
          >
            {toast.message}
          </Alert>
        )}
        {armedGuestId && guestById[armedGuestId] && (
          <PlacingBar
            guest={guestById[armedGuestId]}
            currentTable={tableOfGuest(armedGuestId)}
            seatedCount={seatedCount}
            onPick={(tableId) => placeGuest(armedGuestId, tableId)}
            onCancel={() => setArmedGuestId(null)}
          />
        )}
      </Stack>

      {drag && dragGuest && (
        <Box
          aria-hidden="true"
          sx={{
            position: "fixed",
            left: drag.x + 14,
            top: drag.y + 10,
            zIndex: (t) => t.zIndex.tooltip + 1,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: 1,
            pl: 0.75,
            pr: 1.5,
            py: 0.5,
            borderRadius: 99,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "primary.main",
            boxShadow: 6,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <GuestDot guest={dragGuest} size={26} />
          {dragGuest.name}
        </Box>
      )}
    </Box>
  );
}

function Header(props: {
  seated: number;
  capacity: number;
  attending: number;
  attendingUnseated: number;
  broken: number;
}) {
  const tiles: { label: string; value: string; sub: string; tone?: "error" | "warning" | "success" }[] = [
    { label: "Attending", value: String(props.attending), sub: `of ${guests.length} invited` },
    {
      label: "Seated",
      value: String(props.seated),
      sub: `of ${props.capacity} seats`,
      tone: "success",
    },
    {
      label: "Still to seat",
      value: String(props.attendingUnseated),
      sub: props.attendingUnseated === 0 ? "everyone attending has a seat" : "attending, no seat yet",
      tone: props.attendingUnseated > 0 ? "warning" : "success",
    },
    {
      label: "Rules broken",
      value: String(props.broken),
      sub: props.broken === 0 ? "all rules kept so far" : "see the summary below",
      tone: props.broken > 0 ? "error" : "success",
    },
  ];
  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" } }}
      >
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
            {formatDate(event.date)}
          </Typography>
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: 26, sm: 32 } }}>
            {event.name}
          </Typography>
          <Typography color="text.secondary">
            {event.venue}. Seating plan by {planner.name}.
          </Typography>
        </Box>
        <Box
          component="dl"
          sx={{
            m: 0,
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(4, minmax(120px, 1fr))" },
            gap: 1.5,
            minWidth: { md: 520 },
          }}
        >
          {tiles.map((t) => (
            <Paper key={t.label} variant="outlined" sx={{ px: 1.75, py: 1.25 }}>
              <Typography component="dt" variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {t.label}
              </Typography>
              <Typography
                component="dd"
                sx={{
                  m: 0,
                  fontSize: 26,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  fontVariantNumeric: "tabular-nums",
                  color: t.tone === "error" ? "error.main" : t.tone === "warning" ? "warning.main" : "text.primary",
                }}
              >
                {t.value}
              </Typography>
              <Typography component="dd" variant="caption" color="text.secondary" sx={{ m: 0, display: "block" }}>
                {t.sub}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Stack>
    </Box>
  );
}

function statusIcon(status: RuleResult["status"]) {
  if (status === "broken") return <ErrorOutline color="error" fontSize="small" titleAccess="Broken" />;
  if (status === "open") return <HourglassEmpty color="warning" fontSize="small" titleAccess="Waiting for seating" />;
  return <CheckCircleOutline color="success" fontSize="small" titleAccess="Kept" />;
}

function RulesCard({ results, onShow }: { results: RuleResult[]; onShow: (tableId: string) => void }) {
  const [all, setAll] = useState(false);
  const broken = results.filter((r) => r.status === "broken");
  const open = results.filter((r) => r.status === "open");
  const ok = results.filter((r) => r.status === "ok");
  const shown = all ? results : broken;
  return (
    <Paper
      variant="outlined"
      component="section"
      aria-labelledby="rules-heading"
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderColor: broken.length ? "error.main" : "divider",
      }}
    >
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography variant="h6" component="h2" id="rules-heading">
            The couple&apos;s rules
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap", rowGap: 0.5 }} role="status">
            <Chip
              size="small"
              color={broken.length ? "error" : "default"}
              variant={broken.length ? "filled" : "outlined"}
              label={`${broken.length} broken`}
              sx={broken.length ? { bgcolor: "error.main", color: "error.contrastText" } : undefined}
            />
            <Chip size="small" variant="outlined" label={`${open.length} waiting for seating`} />
            <Chip size="small" variant="outlined" label={`${ok.length} kept`} />
          </Stack>
        </Box>
        <Button
          size="small"
          onClick={() => setAll((a) => !a)}
          endIcon={all ? <ExpandLess /> : <ExpandMore />}
          aria-expanded={all}
        >
          {all ? "Show broken only" : `Show all ${results.length} rules`}
        </Button>
      </Stack>
      <Collapse in={shown.length > 0} unmountOnExit>
        <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0, mt: 1.5 }}>
          {shown.map((r) => (
            <Box
              component="li"
              key={r.index}
              sx={{
                display: "flex",
                gap: 1.25,
                alignItems: "flex-start",
                p: 1.25,
                borderRadius: 2,
                bgcolor: r.status === "broken" ? "action.hover" : "transparent",
                border: 1,
                borderColor: r.status === "broken" ? "error.main" : "divider",
              }}
            >
              <Box sx={{ pt: 0.25 }}>{statusIcon(r.status)}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2">
                  {r.title}
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 400 }}>
                    {r.rule.note}
                  </Typography>
                </Typography>
                <Typography variant="body2">{r.message}</Typography>
              </Box>
              {r.status === "broken" && r.tableIds[0] && (
                <Button size="small" variant="outlined" color="inherit" onClick={() => onShow(r.tableIds[0] ?? "")}>
                  Show
                </Button>
              )}
            </Box>
          ))}
        </Stack>
      </Collapse>
      {shown.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>
          No rule is broken right now. Rules that wait on guests who are not seated yet are listed under &ldquo;Show all&rdquo;.
        </Typography>
      )}
    </Paper>
  );
}

function Legend() {
  return (
    <Stack
      direction="row"
      sx={{ mt: 1.5, flexWrap: "wrap", columnGap: 2, rowGap: 0.75, alignItems: "center" }}
      aria-label="Legend"
      component="ul"
    >
      {Object.entries(partyColors).map(([party, color]) => (
        <Box
          component="li"
          key={party}
          sx={{ listStyle: "none", display: "flex", alignItems: "center", gap: 0.75, fontSize: 12.5, color: "text.secondary" }}
        >
          <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: color }} />
          {party}
        </Box>
      ))}
      <Box component="li" sx={{ listStyle: "none", display: "flex", alignItems: "center", gap: 0.75, fontSize: 12.5, color: "text.secondary" }}>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "plan.diet" }} />
        Dietary need
      </Box>
      <Box component="li" sx={{ listStyle: "none", display: "flex", alignItems: "center", gap: 0.75, fontSize: 12.5, color: "text.secondary" }}>
        <Box sx={{ width: 12, height: 12, borderRadius: "50%", border: "2px dashed", borderColor: "text.disabled" }} />
        Empty seat
      </Box>
    </Stack>
  );
}

function UnseatedRow({
  guest,
  armed,
  startDrag,
  onArm,
}: {
  guest: Guest;
  armed: boolean;
  startDrag: StartDrag;
  onArm: (id: string) => void;
}) {
  return (
    <Box
      component="li"
      onPointerDown={(e) => startDrag(e, guest.id)}
      sx={{
        listStyle: "none",
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        pl: 0.5,
        pr: 1,
        py: 0.75,
        borderRadius: 2,
        border: 1,
        borderColor: armed ? "primary.main" : "divider",
        bgcolor: armed ? "action.selected" : "background.paper",
        touchAction: "pan-y",
        cursor: "grab",
        userSelect: "none",
      }}
    >
      <DragIndicator fontSize="small" sx={{ color: "text.disabled", touchAction: "none" }} aria-hidden="true" />
      <GuestDot guest={guest} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {guest.name}
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.25 }}>
          <Typography variant="caption" color="text.secondary">
            {guest.party}
            {guest.rsvp !== "yes" ? ` · ${rsvpLabels[guest.rsvp]}` : ""}
          </Typography>
          {guest.diet && <DietChip diet={guest.diet} />}
        </Stack>
      </Box>
      <Button
        size="small"
        variant={armed ? "contained" : "outlined"}
        onClick={() => onArm(guest.id)}
        aria-pressed={armed}
        aria-label={`${armed ? "Cancel placing" : "Place"} ${guest.name}`}
        sx={{ minWidth: 64, flex: "none" }}
      >
        {armed ? "Placing" : "Place"}
      </Button>
    </Box>
  );
}

function UnseatedPanel({
  attending,
  unconfirmed,
  armedGuestId,
  startDrag,
  onArm,
  draggingSeated,
  dropActive,
}: {
  attending: Guest[];
  unconfirmed: Guest[];
  armedGuestId: string | null;
  startDrag: StartDrag;
  onArm: (id: string) => void;
  draggingSeated: boolean;
  dropActive: boolean;
}) {
  return (
    <Box
      data-drop-unseat=""
      sx={{
        p: 1.5,
        minHeight: 160,
        outline: draggingSeated ? "2px dashed" : "none",
        outlineOffset: -6,
        outlineColor: dropActive ? "primary.main" : "divider",
        bgcolor: dropActive ? "action.hover" : "transparent",
        borderRadius: 2,
      }}
    >
      {draggingSeated && (
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, textAlign: "center", py: 0.5 }}>
          Drop here to unseat
        </Typography>
      )}
      <Typography variant="subtitle2" component="h3" sx={{ mb: 1 }}>
        Attending, no seat yet ({attending.length})
      </Typography>
      {attending.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Everyone who is attending has a seat.
        </Typography>
      ) : (
        <Stack component="ul" spacing={0.75} sx={{ p: 0, m: 0, mb: 2 }}>
          {attending.map((g) => (
            <UnseatedRow key={g.id} guest={g} armed={armedGuestId === g.id} startDrag={startDrag} onArm={onArm} />
          ))}
        </Stack>
      )}
      <Typography variant="subtitle2" component="h3" sx={{ mb: 0.25 }}>
        Not confirmed ({unconfirmed.length})
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
        Maybe, or no reply yet. You can hold seats for them.
      </Typography>
      <Stack component="ul" spacing={0.75} sx={{ p: 0, m: 0 }}>
        {unconfirmed.map((g) => (
          <UnseatedRow key={g.id} guest={g} armed={armedGuestId === g.id} startDrag={startDrag} onArm={onArm} />
        ))}
      </Stack>
    </Box>
  );
}

function TablesPanel({
  selectedTableId,
  onSelect,
  seatedCount,
  brokenCount,
}: {
  selectedTableId: string | null;
  onSelect: (id: string) => void;
  seatedCount: (id: string) => number;
  brokenCount: (id: string) => number;
}) {
  return (
    <Stack component="ul" spacing={0.75} sx={{ p: 1.5, m: 0 }}>
      {tables.map((t) => {
        const n = seatedCount(t.id);
        const b = brokenCount(t.id);
        const sel = selectedTableId === t.id;
        return (
          <Box component="li" key={t.id} sx={{ listStyle: "none" }}>
            <Box
              component="button"
              type="button"
              onClick={() => onSelect(t.id)}
              aria-current={sel ? "true" : undefined}
              sx={{
                all: "unset",
                boxSizing: "border-box",
                width: "100%",
                cursor: "pointer",
                p: 1.25,
                borderRadius: 2,
                border: 1,
                borderColor: sel ? "primary.main" : "divider",
                bgcolor: sel ? "action.selected" : "background.paper",
                "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                <Typography variant="subtitle2">{t.name}</Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  {b > 0 && <Chip size="small" color="error" variant="outlined" icon={<ErrorOutline />} label={`${b} broken`} />}
                  <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                    {n} / {t.seats}
                  </Typography>
                </Stack>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(n / t.seats) * 100}
                color={n === t.seats ? "success" : "primary"}
                aria-label={`${t.name} seats filled`}
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                {t.seats - n === 0 ? "Full" : `${t.seats - n} ${t.seats - n === 1 ? "seat" : "seats"} free`}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

function TableDetails({
  tableId,
  focusGuestId,
  broken,
  onMove,
  onUnseat,
}: {
  tableId: string | null;
  focusGuestId: string | null;
  broken: RuleResult[];
  onMove: (guestId: string) => void;
  onUnseat: (guestId: string) => void;
}) {
  const { seats } = usePlan();
  const table = tableId ? tableById[tableId] : null;
  if (!table || !tableId) {
    return (
      <Typography color="text.secondary" sx={{ p: 2 }}>
        Select a table on the plan to see who sits there and what they eat.
      </Typography>
    );
  }
  const row = seats[tableId] ?? [];
  const seated = row.map((id) => (id ? guestById[id] : undefined));
  const diets = new Map<string, number>();
  for (const g of seated) if (g?.diet) diets.set(g.diet, (diets.get(g.diet) ?? 0) + 1);
  const count = seated.filter(Boolean).length;

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 0.5 }}>
        <Typography variant="h6" component="h3">
          {table.name}
        </Typography>
        <Typography color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
          {count} of {table.seats} seats
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {table.shape === "long" ? "Long table" : "Round table"} at {table.x} m, {table.y} m.
      </Typography>

      {broken.map((r) => (
        <Alert key={r.index} severity="error" icon={<ErrorOutline />} sx={{ mb: 1.5 }}>
          <strong>{r.title}.</strong> {r.message}
        </Alert>
      ))}

      <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
        Dietary needs at this table
      </Typography>
      {diets.size === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          None noted.
        </Typography>
      ) : (
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
          {[...diets.entries()].map(([d, n]) => (
            <Chip key={d} size="small" variant="outlined" color={d.toLowerCase().includes("allergy") ? "error" : "warning"} label={`${n} × ${d}`} />
          ))}
        </Stack>
      )}

      <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
        Seats
      </Typography>
      <Stack component="ol" spacing={0.5} sx={{ p: 0, m: 0 }}>
        {row.map((id, i) => {
          const g = id ? guestById[id] : undefined;
          return (
            <Box
              component="li"
              key={i}
              sx={{
                listStyle: "none",
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 1,
                py: 0.75,
                minHeight: 52,
                borderRadius: 2,
                border: 1,
                borderStyle: g ? "solid" : "dashed",
                borderColor: g && g.id === focusGuestId ? "primary.main" : "divider",
                bgcolor: g && g.id === focusGuestId ? "action.selected" : "transparent",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ width: 16, textAlign: "right", fontVariantNumeric: "tabular-nums", flex: "none" }}
              >
                {i + 1}
              </Typography>
              {g ? (
                <>
                  <GuestDot guest={g} size={30} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {g.name}
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.25 }}>
                      <Typography variant="caption" color="text.secondary">
                        {g.party}
                      </Typography>
                      {g.diet && <DietChip diet={g.diet} />}
                    </Stack>
                  </Box>
                  <IconButton size="small" onClick={() => onMove(g.id)} aria-label={`Move ${g.name} to another table`}>
                    <SwapHoriz fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => onUnseat(g.id)} aria-label={`Unseat ${g.name}`}>
                    <PersonRemoveOutlined fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Empty seat
                </Typography>
              )}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

function PlacingBar({
  guest,
  currentTable,
  seatedCount,
  onPick,
  onCancel,
}: {
  guest: Guest;
  currentTable: string | null;
  seatedCount: (id: string) => number;
  onPick: (tableId: string) => void;
  onCancel: () => void;
}) {
  return (
    <Paper
      role="region"
      aria-label="Placing a guest"
      sx={{
        pointerEvents: "auto",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexWrap: "wrap",
        px: 1.5,
        py: 1,
        maxWidth: 720,
        width: "100%",
        boxShadow: 8,
        border: 2,
        borderColor: "primary.main",
      }}
    >
      <GuestDot guest={guest} size={34} />
      <Box sx={{ flex: "1 1 160px", minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
          {currentTable ? "Moving" : "Placing"} {guest.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Tap a table or an empty seat on the plan
        </Typography>
      </Box>
      <TextField
        select
        size="small"
        label="Or choose a table"
        value=""
        onChange={(e) => onPick(e.target.value)}
        sx={{ minWidth: 170 }}
        slotProps={{ select: { displayEmpty: false } }}
      >
        {tables.map((t) => {
          const free = t.seats - seatedCount(t.id);
          return (
            <MenuItem key={t.id} value={t.id} disabled={free === 0 || t.id === currentTable}>
              {t.name} ({free} free)
            </MenuItem>
          );
        })}
      </TextField>
      <Button onClick={onCancel} startIcon={<Close />} color="inherit">
        Cancel
      </Button>
    </Paper>
  );
}
