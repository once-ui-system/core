"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  CLOSE_MIN,
  OPEN_MIN,
  TODAY,
  fmtDate,
  fmtTime,
  findClash,
  ownerById,
  patientById,
  patients,
  toMin,
  vetById,
  vets,
  type Appointment,
  type Patient,
} from "@/lib/data";
import { PatientAlerts, visuallyHidden } from "./ui";

const SLOTS = Array.from({ length: (CLOSE_MIN - OPEN_MIN) / 15 }, (_, i) => OPEN_MIN + i * 15);
const DURATIONS = [15, 20, 30, 45, 60, 90, 120];

interface Props {
  rows: Appointment[];
  now: number;
  onClose: () => void;
  onBook: (a: Appointment) => void;
}

const minToHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export default function BookDialog({ rows, now, onClose, onBook }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vetId, setVetId] = useState("");
  const [time, setTime] = useState<number | "">("");
  const [minutes, setMinutes] = useState(20);
  const [reason, setReason] = useState("");

  const clash = vetId !== "" && time !== "" ? findClash(rows, vetId, time, minutes) : undefined;
  const pastClose = time !== "" && time + minutes > CLOSE_MIN;
  const inPast = time !== "" && time < Math.floor(now / 15) * 15;
  const valid = patient !== null && vetId !== "" && time !== "" && !clash && !pastClose && !inPast;

  let problem = "";
  if (clash) {
    const cp = patientById(clash.patient);
    problem = `${vetById(vetId)?.name} already has ${cp?.name ?? "a patient"} (${clash.reason}) from ${fmtTime(toMin(clash.start))} to ${fmtTime(toMin(clash.start) + clash.minutes)}. Pick another time or vet.`;
  } else if (pastClose) {
    problem = `That visit would run past closing at ${fmtTime(CLOSE_MIN)}.`;
  } else if (inPast) {
    problem = "That time has already passed.";
  }

  function slotNote(s: number): string {
    if (s < Math.floor(now / 15) * 15) return "passed";
    if (vetId && findClash(rows, vetId, s, minutes)) return "taken";
    return "";
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || patient === null || time === "") return;
    onBook({
      id: `a-${String(rows.length + 1).padStart(2, "0")}`,
      patient: patient.id,
      vet: vetId,
      start: minToHHMM(time),
      minutes,
      reason: reason.trim() || "Follow-up visit",
      status: "booked",
    });
  }

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      aria-labelledby="book-title"
      slotProps={{ paper: { component: "form", onSubmit: submit, noValidate: true } }}
    >
      <DialogTitle id="book-title" sx={{ fontWeight: 800 }}>
        Book an appointment
        <Typography variant="body2" color="text.secondary" component="div">
          {fmtDate(TODAY, "long")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Autocomplete<Patient>
            options={patients}
            value={patient}
            onChange={(_e, p) => setPatient(p)}
            getOptionLabel={(p) => `${p.name} (${p.species}), ${ownerById(p.owner)?.name ?? ""}`}
            renderOption={(props, p) => {
              const { key, ...rest } = props;
              return (
                <li key={key} {...rest}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700 }}>{p.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {p.species}, {p.breed} · {ownerById(p.owner)?.name}
                    </Typography>
                  </Box>
                  {p.alerts.length > 0 && (
                    <>
                      <WarningAmberIcon color="error" aria-hidden />
                      <Box component="span" sx={visuallyHidden}>
                        Has medical alerts
                      </Box>
                    </>
                  )}
                </li>
              );
            }}
            renderInput={(params) => <TextField {...params} label="Patient" required placeholder="Search by pet or owner name" />}
          />
          {patient && patient.alerts.length > 0 && <PatientAlerts alerts={patient.alerts} variant="banner" />}

          <TextField select required label="Vet" value={vetId} onChange={(e) => setVetId(e.target.value)} id="book-vet">
            {vets.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.name} · {v.room}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              required
              fullWidth
              label="Start time"
              id="book-time"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
              helperText={vetId ? undefined : "Choose a vet to see free times"}
            >
              {SLOTS.map((s) => {
                const note = slotNote(s);
                return (
                  <MenuItem key={s} value={s} disabled={note !== ""}>
                    {fmtTime(s)}
                    {note && (
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({note})
                      </Typography>
                    )}
                  </MenuItem>
                );
              })}
            </TextField>
            <TextField
              select
              fullWidth
              label="Length"
              id="book-length"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            >
              {DURATIONS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d} minutes
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            label="Reason for visit"
            id="book-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Follow-up visit"
          />

          <Box aria-live="polite">{problem && <Alert severity="error">{problem}</Alert>}</Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} size="large">
          Cancel
        </Button>
        <Button type="submit" variant="contained" size="large" disabled={!valid}>
          Book appointment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
