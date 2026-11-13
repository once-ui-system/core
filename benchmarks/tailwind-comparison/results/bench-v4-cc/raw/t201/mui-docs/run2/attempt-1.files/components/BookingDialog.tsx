"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { AlertChips } from "@/components/AlertChips";
import {
  CLOSE,
  fmtClock,
  fmtDate,
  findClash,
  nextFreeSlot,
  ownerById,
  patientById,
  patients,
  roundUp15,
  toMinutes,
  vetById,
  vets,
  TODAY,
  type Appointment,
  type Patient,
} from "@/lib/data";

const DURATIONS = [15, 20, 30, 45, 60, 90, 120];

interface Props {
  open: boolean;
  onClose: () => void;
  appointments: Appointment[];
  now: number;
  onBook: (a: { patient: string; vet: string; start: number; minutes: number; reason: string; urgent: boolean }) => void;
}

export function BookingDialog({ open, onClose, appointments, now, onBook }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm" aria-labelledby="book-title">
      <BookingForm onClose={onClose} appointments={appointments} now={now} onBook={onBook} />
    </Dialog>
  );
}

function BookingForm({ onClose, appointments, now, onBook }: Omit<Props, "open">) {
  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [vetId, setVetId] = React.useState("");
  const [start, setStart] = React.useState<number | "">("");
  const [minutes, setMinutes] = React.useState(20);
  const [reason, setReason] = React.useState("");
  const [urgent, setUrgent] = React.useState(false);

  const firstSlot = roundUp15(now);
  const slots: number[] = [];
  for (let s = firstSlot; s < CLOSE; s += 15) slots.push(s);
  if (start !== "" && !slots.includes(start)) slots.unshift(start);

  const clashFor = (s: number) =>
    patient && vetId ? findClash(appointments, { vet: vetId, patient: patient.id, start: s, minutes }) : null;

  const clash = start !== "" ? clashFor(start) : null;
  const endsLate = start !== "" && start + minutes > CLOSE;
  const suggestion =
    clash && patient && vetId ? nextFreeSlot(appointments, { vet: vetId, patient: patient.id, minutes }, Math.max(now, firstSlot)) : null;
  const valid = !!patient && !!vetId && start !== "" && reason.trim().length > 0 && !clash && !endsLate;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !patient || start === "") return;
    onBook({ patient: patient.id, vet: vetId, start, minutes, reason: reason.trim(), urgent });
  };

  const clashText = (() => {
    if (!clash) return "";
    const other = patientById(clash.appt.patient);
    const s = toMinutes(clash.appt.start);
    const range = `${fmtClock(s)} to ${fmtClock(s + clash.appt.minutes)}`;
    if (clash.kind === "vet") {
      return `${vetById(clash.appt.vet).name} is already booked ${range} (${other?.name}, ${clash.appt.reason}).`;
    }
    return `${patient?.name} already has an appointment ${range} with ${vetById(clash.appt.vet).name}.`;
  })();

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <DialogTitle id="book-title">Book an appointment</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Autocomplete<Patient>
            value={patient}
            onChange={(_e, v) => setPatient(v)}
            options={patients}
            autoHighlight
            getOptionLabel={(p) => `${p.name} (${ownerById(p.owner).name})`}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            noOptionsText="No patient or owner matches"
            renderOption={(props, p) => {
              const { key, ...rest } = props;
              return (
                <li key={key} {...rest}>
                  <Stack spacing={0.5} sx={{ width: 1, py: 0.5 }}>
                    <Typography>
                      <b>{p.name}</b>{" "}
                      <Typography component="span" variant="body2" sx={{ color: "text.secondary" }}>
                        {p.species}, {p.breed} · {ownerById(p.owner).name}
                      </Typography>
                    </Typography>
                    <AlertChips alerts={p.alerts} />
                  </Stack>
                </li>
              );
            }}
            renderInput={(params) => <TextField {...params} label="Patient or owner" required />}
          />

          {patient && patient.alerts.length > 0 && (
            <Alert severity="error" variant="outlined" sx={{ "& .MuiAlert-message": { width: 1 } }}>
              <Typography variant="subtitle2" gutterBottom>
                Medical alerts for {patient.name}
              </Typography>
              <AlertChips alerts={patient.alerts} />
            </Alert>
          )}

          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <TextField select required label="Vet" value={vetId} onChange={(e) => setVetId(e.target.value)}>
              {vets.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.name} · {v.room}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Length" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
              {DURATIONS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d} minutes
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              required
              label="Start time"
              value={start}
              onChange={(e) => setStart(Number(e.target.value))}
              helperText={`Today, ${fmtDate(TODAY)}. Open until ${fmtClock(CLOSE)}.`}
              error={!!clash || endsLate}
              slotProps={{ select: { MenuProps: { slotProps: { paper: { sx: { maxHeight: 320 } } } } } }}
            >
              {slots.map((s) => {
                const busy = clashFor(s);
                return (
                  <MenuItem key={s} value={s}>
                    {fmtClock(s)}
                    {busy ? (
                      <Typography component="span" variant="caption" sx={{ color: "error.main", ml: 1 }}>
                        {busy.kind === "vet" ? "vet busy" : "patient busy"}
                      </Typography>
                    ) : null}
                  </MenuItem>
                );
              })}
            </TextField>
            <TextField
              required
              label="Reason for visit"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Booster shot"
            />
          </Box>

          {clash && (
            <Alert
              severity="error"
              action={
                suggestion !== null ? (
                  <Button color="inherit" size="small" onClick={() => setStart(suggestion)}>
                    Use {fmtClock(suggestion)}
                  </Button>
                ) : undefined
              }
            >
              {clashText} Pick another time
              {suggestion !== null ? ` (next free: ${fmtClock(suggestion)}).` : "."}
            </Alert>
          )}
          {endsLate && !clash && (
            <Alert severity="error">This visit would end after closing time ({fmtClock(CLOSE)}). Pick an earlier start or a shorter length.</Alert>
          )}

          <FormControlLabel
            control={<Switch checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />}
            label="Urgent visit (highlight on the schedule)"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ minWidth: 96 }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={!valid} sx={{ minWidth: 160 }}>
          Book appointment
        </Button>
      </DialogActions>
    </Box>
  );
}
