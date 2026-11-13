"use client";

import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import * as React from "react";
import AlertChips from "@/components/AlertChips";
import {
  CLOSING,
  PATIENTS,
  SLOT_STARTS,
  VETS,
  findClash,
  fmtClock,
  mustPatient,
  nextFreeSlot,
  ownerOf,
  toMinutes,
  vetOf,
  type Appointment,
} from "@/lib/data";

const DURATIONS = [15, 20, 30, 45, 60];

interface Props {
  open: boolean;
  now: number;
  appointments: Appointment[];
  onClose: () => void;
  onBook: (appointment: Omit<Appointment, "id" | "status">) => void;
}

function fmtHHMM(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

export default function BookingDialog({ open, now, appointments, onClose, onBook }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const firstSlot = SLOT_STARTS.find((s) => s >= now) ?? SLOT_STARTS[0];

  const [patientId, setPatientId] = React.useState("");
  const [vetId, setVetId] = React.useState(VETS[0].id);
  const [start, setStart] = React.useState(firstSlot);
  const [minutes, setMinutes] = React.useState(20);
  const [reason, setReason] = React.useState("");

  const patient = patientId ? mustPatient(patientId) : undefined;
  const vet = vetOf(vetId);
  const clash = findClash(appointments, vetId, start, minutes);
  const tooLate = start + minutes > CLOSING;
  const suggestion = clash || tooLate ? nextFreeSlot(appointments, vetId, minutes, start) : undefined;
  const canBook = Boolean(patient) && reason.trim().length > 0 && !clash && !tooLate;

  const submit = () => {
    if (!canBook) return;
    onBook({ patient: patientId, vet: vetId, start: fmtHHMM(start), minutes, reason: reason.trim() });
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm" aria-labelledby="book-title">
      <DialogTitle id="book-title">Book an appointment</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            select
            required
            label="Patient"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            helperText={patient ? `Owner: ${ownerOf(patient).name}, ${ownerOf(patient).phone}` : "Choose who the visit is for"}
          >
            {PATIENTS.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name} · {p.species}, {ownerOf(p).name}
                {p.alerts.length > 0 && <WarningAmberRounded fontSize="small" sx={{ color: "error.main", ml: 1 }} titleAccess="Has medical alerts" />}
              </MenuItem>
            ))}
          </TextField>
          {patient && patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} size="medium" />}
          <TextField select required label="Vet" value={vetId} onChange={(e) => setVetId(e.target.value)}>
            {VETS.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.name} · {v.room}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField select required fullWidth label="Time today" value={String(start)} onChange={(e) => setStart(Number(e.target.value))}>
              {SLOT_STARTS.map((s) => (
                <MenuItem key={s} value={String(s)}>
                  {fmtClock(s)}
                </MenuItem>
              ))}
            </TextField>
            <TextField select required fullWidth label="Length" value={String(minutes)} onChange={(e) => setMinutes(Number(e.target.value))}>
              {DURATIONS.map((d) => (
                <MenuItem key={d} value={String(d)}>
                  {d} minutes
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            required
            label="Reason for visit"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="For example: Ear infection follow-up"
          />
          {clash && (
            <Alert
              severity="error"
              action={
                suggestion !== undefined ? (
                  <Button color="inherit" size="small" onClick={() => setStart(suggestion)}>
                    Use {fmtClock(suggestion)}
                  </Button>
                ) : undefined
              }
            >
              {vet.name} is already booked from {fmtClock(toMinutes(clash.start))} to {fmtClock(toMinutes(clash.start) + clash.minutes)} ({mustPatient(clash.patient).name}, {clash.reason}).
              {suggestion !== undefined ? ` Next free: ${fmtClock(suggestion)}.` : " No free time left today."}
            </Alert>
          )}
          {!clash && tooLate && (
            <Alert severity="warning">The visit would end after closing time ({fmtClock(CLOSING)}). Pick an earlier time or a shorter visit.</Alert>
          )}
          {!clash && !tooLate && patient && reason.trim() && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {vet.name} is free from {fmtClock(start)} to {fmtClock(start + minutes)} in {vet.room}.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" size="large" onClick={submit} disabled={!canBook}>
          Book appointment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
