"use client";

import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import AppointmentRow from "./AppointmentRow";
import BookDialog from "./BookDialog";
import WaitingList from "./WaitingList";
import { sortAppointments, useClinic } from "@/lib/clinic-store";
import { TODAY, formatDayLong, patientById, toMin, vetById, vets, type Appointment, type Status } from "@/lib/data";

function Stat({ label, value, hint, accent }: { label: string; value: string; hint: string; accent?: "warning" | "info" | "primary" }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.75, borderTop: 3, borderTopColor: accent ? `${accent}.main` : "divider" }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "1.6rem", fontWeight: 800, lineHeight: 1.2 }}>{value}</Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {hint}
      </Typography>
    </Paper>
  );
}

export default function ScheduleView() {
  const { appointments, now, checkIn, setStatus } = useClinic();
  const [vetFilter, setVetFilter] = useState<string>("all");
  const [bookOpen, setBookOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);

  useEffect(() => {
    if (!highlight) return;
    const t = window.setTimeout(() => setHighlight(null), 8000);
    return () => window.clearTimeout(t);
  }, [highlight]);

  const sorted = useMemo(() => sortAppointments(appointments), [appointments]);
  const visible = vetFilter === "all" ? sorted : sorted.filter((a) => a.vet === vetFilter);

  const waiting = appointments.filter((a) => a.status === "checked_in");
  const inExam = appointments.filter((a) => a.status === "in_exam");
  const booked = sorted.filter((a) => a.status === "booked");
  const longest = waiting.reduce((m, a) => Math.max(m, Math.floor(now - (a.checkedInAt ?? now))), 0);
  const next = booked[0];
  const urgentBooked = booked.filter((a) => a.urgent).length;

  const onCheckIn = (a: Appointment) => {
    checkIn(a.id);
    setMessage(`${patientById(a.patient).name} is checked in and on the waiting list.`);
  };
  const onStatus = (a: Appointment, s: Status) => {
    setStatus(a.id, s);
    setMessage(`${patientById(a.patient).name}: ${s === "in_exam" ? "sent to exam" : "marked done"}.`);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, gap: 2, flexWrap: "wrap", mb: 2.5 }}>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {formatDayLong(TODAY)}
          </Typography>
          <Typography component="h1" variant="h1">
            Today&apos;s schedule
          </Typography>
        </Box>
        <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => setBookOpen(true)} sx={{ minHeight: 48, px: 3 }}>
          Book appointment
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", md: "repeat(4, minmax(0,1fr))" }, gap: 1.5, mb: 2.5 }}>
        <Stat label="Waiting" value={String(waiting.length)} hint={waiting.length ? `longest ${longest} min` : "nobody waiting"} accent="warning" />
        <Stat label="In exam" value={String(inExam.length)} hint={inExam.length ? inExam.map((a) => patientById(a.patient).name).join(", ") : "none right now"} accent="info" />
        <Stat label="Still to arrive" value={String(booked.length)} hint={urgentBooked ? `${urgentBooked} urgent` : "no urgent visits"} />
        <Stat label="Next booked" value={next ? next.start : "None"} hint={next ? `${patientById(next.patient).name} · ${vetById(next.vet).short}` : "all seen"} accent="primary" />
      </Box>

      <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,1fr) 380px" }, alignItems: "start" }}>
        <Box sx={{ order: { xs: 2, lg: 1 }, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 1.5 }}>
            <Typography component="h2" variant="h2" sx={{ flex: 1 }}>
              All appointments
              <Typography component="span" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
                {visible.length}
              </Typography>
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={vetFilter}
              onChange={(_, v: string | null) => v && setVetFilter(v)}
              aria-label="Filter by vet"
              sx={{ flexWrap: "wrap", "& .MuiToggleButton": { minHeight: 40, textTransform: "none", px: 1.75 } }}
            >
              <ToggleButton value="all">All vets</ToggleButton>
              {vets.map((v) => (
                <ToggleButton key={v.id} value={v.id}>
                  {v.short}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <Box
              aria-hidden
              sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "104px minmax(0,1.6fr) minmax(0,1fr) minmax(0,1.3fr) 118px 128px", gap: 2, px: 2, py: 1, pl: "20px", bgcolor: "action.hover", borderBottom: 1, borderColor: "divider", color: "text.secondary" }}
            >
              {["Time / vet", "Patient", "Owner", "Reason", "Status", ""].map((h, i) => (
                <Typography key={i} variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {h}
                </Typography>
              ))}
            </Box>
            <Box component="ul" aria-label="Appointments today" sx={{ listStyle: "none", m: 0, p: 0 }}>
              {visible.map((a) => (
                <AppointmentRow key={a.id} appt={a} highlighted={highlight === a.id} onCheckIn={onCheckIn} onStatus={onStatus} />
              ))}
            </Box>
            {visible.length === 0 && (
              <Typography color="text.secondary" sx={{ p: 3 }}>
                No appointments for this vet today.
              </Typography>
            )}
          </Paper>
        </Box>

        <Box sx={{ order: { xs: 1, lg: 2 }, position: { lg: "sticky" }, top: { lg: 88 } }}>
          <WaitingList appointments={appointments} now={now} />
        </Box>
      </Box>

      <BookDialog
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        onBooked={(a) => {
          setBookOpen(false);
          setHighlight(a.id);
          setVetFilter("all");
          setMessage(`Booked ${patientById(a.patient).name} with ${vetById(a.vet).name} at ${a.start}.`);
        }}
      />
      <Snackbar open={message !== null} autoHideDuration={5000} onClose={(_, r) => r !== "clickaway" && setMessage(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" variant="filled" onClose={() => setMessage(null)} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
