"use client";

import { useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import AlertBadges from "./AlertBadges";
import { conflictMessage, useClinic } from "@/lib/clinic-store";
import { DAY_END, DAY_START, findConflict, fromMin, ownerById, patientById, patients, toMin, vets, type Appointment } from "@/lib/data";

const DURATIONS = [15, 20, 30, 45, 60, 90];
const SLOTS: string[] = [];
for (let m = DAY_START; m < DAY_END; m += 15) SLOTS.push(fromMin(m));

function firstFreeSlot(appts: Appointment[], vet: string, minutes: number, from: number): string {
  const startAt = Math.ceil(from / 15) * 15;
  for (const s of SLOTS) {
    const m = toMin(s);
    if (m >= startAt && m + minutes <= DAY_END && !findConflict(appts, vet, m, minutes)) return s;
  }
  return SLOTS.find((s) => !findConflict(appts, vet, toMin(s), minutes)) ?? SLOTS[0];
}

function BookForm({ onClose, onBooked }: { onClose: () => void; onBooked: (a: Appointment) => void }) {
  const { appointments, now, book } = useClinic();
  const [patient, setPatient] = useState("");
  const [vet, setVet] = useState(vets[0].id);
  const [minutes, setMinutes] = useState(20);
  const [start, setStart] = useState(() => firstFreeSlot(appointments, vets[0].id, 20, now));
  const [reason, setReason] = useState("Follow-up");
  const [urgent, setUrgent] = useState(false);
  const [touched, setTouched] = useState(false);

  const taken = useMemo(() => {
    const set = new Set<string>();
    for (const s of SLOTS) {
      const m = toMin(s);
      if (m + minutes > DAY_END || findConflict(appointments, vet, m, minutes)) set.add(s);
    }
    return set;
  }, [appointments, vet, minutes]);

  const clash = conflictMessage(appointments, vet, start, minutes);
  const selected = patient ? patientById(patient) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!patient || clash) return;
    const res = book({ patient, vet, start, minutes, reason, urgent });
    if (res.ok) onBooked(res.appointment);
  };

  return (
    <Box component="form" onSubmit={submit} noValidate sx={{ display: "contents" }}>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <TextField
            select
            required
            label="Patient"
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            error={touched && !patient}
            helperText={touched && !patient ? "Pick the patient to book." : " "}
            fullWidth
            sx={{ "& .MuiFormHelperText-root": { mt: 0.5 } }}
          >
            {patients.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name} ({p.species}) · {ownerById(p.owner).name}
              </MenuItem>
            ))}
          </TextField>

          {selected && selected.alerts.length > 0 && (
            <Alert severity="error" variant="outlined" icon={false} sx={{ borderWidth: 2, fontWeight: 600 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 800 }}>
                Medical alerts for {selected.name}
              </Typography>
              <AlertBadges alerts={selected.alerts} patientName={selected.name} />
            </Alert>
          )}

          <TextField select required label="Vet" value={vet} onChange={(e) => setVet(e.target.value)} fullWidth>
            {vets.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.name} · {v.room}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField select required label="Time" value={start} onChange={(e) => setStart(e.target.value)} fullWidth slotProps={{ select: { MenuProps: { slotProps: { paper: { style: { maxHeight: 360 } } } } } }}>
              {SLOTS.map((s) => (
                <MenuItem key={s} value={s} disabled={taken.has(s) && s !== start}>
                  {s}
                  {taken.has(s) ? "  (not free)" : ""}
                </MenuItem>
              ))}
            </TextField>
            <TextField select required label="Length" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} fullWidth>
              {DURATIONS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d} minutes
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {clash && (
            <Alert severity="error" role="alert">
              {clash}
            </Alert>
          )}

          <TextField label="Reason for visit" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth />
          <FormControlLabel control={<Checkbox checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />} label="Urgent visit" />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ minHeight: 44 }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={Boolean(clash)} sx={{ minHeight: 44, px: 3 }}>
          Book appointment
        </Button>
      </DialogActions>
    </Box>
  );
}

export default function BookDialog({ open, onClose, onBooked }: { open: boolean; onClose: () => void; onBooked: (a: Appointment) => void }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm" aria-labelledby="book-title">
      <DialogTitle id="book-title" sx={{ fontWeight: 800 }}>
        Book an appointment
      </DialogTitle>
      <BookForm onClose={onClose} onBooked={onBooked} />
    </Dialog>
  );
}
