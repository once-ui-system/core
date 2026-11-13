"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import LoginIcon from "@mui/icons-material/HowToReg";
import MedicalIcon from "@mui/icons-material/MedicalServices";
import DoneIcon from "@mui/icons-material/Done";
import AlertBadges, { tint } from "./AlertBadges";
import StatusChip from "./StatusChip";
import { endTime, ownerById, patientById, vetById, type Appointment, type Status } from "@/lib/data";

interface Props {
  appt: Appointment;
  highlighted?: boolean;
  onCheckIn: (a: Appointment) => void;
  onStatus: (a: Appointment, s: Status) => void;
}

export default function AppointmentRow({ appt, highlighted, onCheckIn, onStatus }: Props) {
  const patient = patientById(appt.patient);
  const owner = ownerById(patient.owner);
  const vet = vetById(appt.vet);
  const inactive = appt.status === "done" || appt.status === "cancelled";
  const live = !inactive;

  return (
    <Box
      component="li"
      data-appointment={appt.id}
      sx={{
        display: "grid",
        alignItems: "center",
        gap: { xs: 1, md: 2 },
        px: { xs: 1.5, md: 2 },
        py: 1.5,
        borderBottom: 1,
        borderColor: "divider",
        borderLeft: 4,
        borderLeftColor: appt.urgent && live ? "error.main" : "transparent",
        bgcolor: highlighted ? tint("primary", 14) : appt.urgent && live ? tint("error", 8) : "transparent",
        transition: "background-color .4s",
        gridTemplateColumns: { xs: "1fr auto", md: "104px minmax(0,1.6fr) minmax(0,1fr) minmax(0,1.3fr) 118px 128px" },
        gridTemplateAreas: {
          xs: `"time status" "patient patient" "reason reason" "owner action"`,
          md: `"time patient owner reason status action"`,
        },
        "&:last-of-type": { borderBottom: 0 },
      }}
    >
      <Box sx={{ gridArea: "time", opacity: inactive ? 0.75 : 1 }}>
        <Typography sx={{ fontWeight: 800, fontVariantNumeric: "tabular-nums", fontSize: "1.05rem", lineHeight: 1.2 }}>
          {appt.start}
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.75, fontWeight: 500 }}>
            to {endTime(appt)}
          </Typography>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {vet.short} · {vet.room}
        </Typography>
      </Box>

      <Box sx={{ gridArea: "patient", minWidth: 0, opacity: appt.status === "cancelled" ? 0.6 : 1 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
          <Typography
            component={Link}
            href={`/patients/${patient.id}`}
            sx={{ fontWeight: 750, color: "text.primary", textDecorationColor: "var(--mui-palette-divider)", "&:hover": { color: "primary.main" } }}
          >
            {patient.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {patient.species}, {patient.breed}
          </Typography>
        </Box>
        {patient.alerts.length > 0 && (
          <Box sx={{ mt: 0.5 }}>
            <AlertBadges alerts={patient.alerts} patientName={patient.name} />
          </Box>
        )}
      </Box>

      <Box sx={{ gridArea: "owner", minWidth: 0 }}>
        <Typography variant="body2" noWrap>
          {owner.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", md: "block" } }}>
          {owner.phone}
        </Typography>
      </Box>

      <Box sx={{ gridArea: "reason", minWidth: 0, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
        {appt.urgent && (
          <Chip size="small" color="error" icon={<PriorityHighIcon />} label="Urgent" sx={{ fontWeight: 800 }} />
        )}
        <Typography variant="body2" sx={{ textDecoration: appt.status === "cancelled" ? "line-through" : "none" }}>
          {appt.reason}
        </Typography>
        {highlighted && <Chip size="small" color="primary" label="Just booked" />}
      </Box>

      <Box sx={{ gridArea: "status", justifySelf: { xs: "end", md: "start" } }}>
        <StatusChip status={appt.status} />
      </Box>

      <Box sx={{ gridArea: "action", justifySelf: "end", width: { md: "100%" } }}>
        {appt.status === "booked" && (
          <Button
            variant="contained"
            size="small"
            fullWidth
            startIcon={<LoginIcon />}
            onClick={() => onCheckIn(appt)}
            aria-label={`Check in ${patient.name}`}
            sx={{ minHeight: 44, px: 2 }}
          >
            Check in
          </Button>
        )}
        {appt.status === "checked_in" && (
          <Button variant="outlined" size="small" fullWidth startIcon={<MedicalIcon />} onClick={() => onStatus(appt, "in_exam")} aria-label={`To exam: ${patient.name}`} sx={{ minHeight: 44 }}>
            To exam
          </Button>
        )}
        {appt.status === "in_exam" && (
          <Button variant="outlined" size="small" fullWidth startIcon={<DoneIcon />} onClick={() => onStatus(appt, "done")} aria-label={`Mark done: ${patient.name}`} sx={{ minHeight: 44 }}>
            Mark done
          </Button>
        )}
      </Box>
    </Box>
  );
}
