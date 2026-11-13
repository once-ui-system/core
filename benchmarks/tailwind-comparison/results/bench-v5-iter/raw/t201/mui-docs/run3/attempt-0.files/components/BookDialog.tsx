"use client";

import { useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import AlertChips from "./AlertChips";
import {
  Appointment,
  endTime,
  findClash,
  fmtLongToday,
  fmtTime,
  ownerById,
  patientById,
  patients,
  toMin,
  vets,
} from "@/lib/data";

const SLOTS: string[] = [];
for (let m = 8 * 60; m <= 16 * 60 + 45; m += 15) SLOTS.push(fmtTime(m));
const DURATIONS = [15, 20, 30, 45, 60, 90];

export type NewBooking = { patient: string; vet: string; start: string; minutes: number; reason: string };

export default function BookDialog({
  open,
  onClose,
  appointments,
  onBook,
}: {
  open: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onBook: (b: NewBooking) => void;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [patient, setPatient] = useState("");
  const [vet, setVet] = useState("v-1");
  const [start, setStart] = useState("12:00");
  const [minutes, setMinutes] = useState(20);
  const [reason, setReason] = useState("Follow-up visit");

  const clash = useMemo(() => findClash(appointments, vet, start, minutes), [appointments, vet, start, minutes]);
  const selected = patient ? patientById(patient) : undefined;
  const clashPatient = clash ? patientById(clash.patient) : undefined;
  const clashVet = vets.find((v) => v.id === vet);
  const canSave = Boolean(patient) && !clash && reason.trim().length > 0;

  const submit = () => {
    if (!canSave) return;
    onBook({ patient, vet, start, minutes, reason: reason.trim() });
    setPatient("");
    setReason("Follow-up visit");
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm" aria-labelledby="book-title">
      <DialogTitle id="book-title" sx={{ fontWeight: 800 }}>
        Book an appointment
        <Typography variant="body2" color="text.secondary">
          {fmtLongToday()}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box
          component="form"
          id="book-form"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          sx={{ display: "grid", gap: 2, pt: 1, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}
        >
          <TextField
            select
            required
            label="Patient"
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            sx={{ gridColumn: "1 / -1" }}
          >
            {patients.map((p) => (
              <MenuItem key={p.id} value={p.id} sx={{ minHeight: 48, gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  {p.name} ({p.species}) · {ownerById(p.owner)?.name}
                </Box>
                {p.alerts.length > 0 && <ReportProblemIcon color="error" fontSize="small" titleAccess="Has medical alerts" />}
              </MenuItem>
            ))}
          </TextField>
          {selected && selected.alerts.length > 0 && (
            <Box sx={{ gridColumn: "1 / -1" }}>
              <AlertChips alerts={selected.alerts} />
            </Box>
          )}
          <TextField select label="Vet" value={vet} onChange={(e) => setVet(e.target.value)} sx={{ gridColumn: "1 / -1" }}>
            {vets.map((v) => (
              <MenuItem key={v.id} value={v.id} sx={{ minHeight: 48 }}>
                {v.name} · {v.room}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Time" value={start} onChange={(e) => setStart(e.target.value)} error={Boolean(clash)}>
            {SLOTS.map((s) => {
              const taken = findClash(appointments, vet, s, minutes);
              return (
                <MenuItem key={s} value={s} disabled={Boolean(taken)} sx={{ minHeight: 44 }}>
                  {s}
                  {taken ? " (taken)" : ""}
                </MenuItem>
              );
            })}
          </TextField>
          <TextField select label="Length" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
            {DURATIONS.map((d) => (
              <MenuItem key={d} value={d} sx={{ minHeight: 44 }}>
                {d} min
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Reason for visit"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            sx={{ gridColumn: "1 / -1" }}
          />
          <Box sx={{ gridColumn: "1 / -1" }} aria-live="polite">
            {clash ? (
              <Alert severity="error">
                {clashVet?.name} already has {clashPatient?.name} ({clash.reason}) from {clash.start} to {endTime(clash)}.
                Pick another time or vet.
              </Alert>
            ) : (
              <Alert severity="success" variant="outlined">
                {clashVet?.name} is free {start}–{fmtTime(toMin(start) + minutes)}.
              </Alert>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button type="submit" form="book-form" variant="contained" disabled={!canSave}>
          Book appointment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
