"use client";

import type { ReactElement } from "react";
import Chip from "@mui/material/Chip";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import type { Status } from "@/lib/data";

const META: Record<
  Status,
  { label: string; color: "default" | "info" | "primary" | "success"; variant: "filled" | "outlined"; icon: ReactElement }
> = {
  booked: { label: "Booked", color: "default", variant: "outlined", icon: <EventAvailableIcon /> },
  checked_in: { label: "Checked in", color: "info", variant: "filled", icon: <HourglassTopIcon /> },
  in_exam: { label: "In exam", color: "primary", variant: "filled", icon: <MedicalServicesIcon /> },
  done: { label: "Done", color: "success", variant: "outlined", icon: <DoneAllIcon /> },
  cancelled: { label: "Cancelled", color: "default", variant: "outlined", icon: <EventBusyIcon /> },
};

export function StatusChip({ status }: { status: Status }) {
  const m = META[status];
  return <Chip size="small" label={m.label} color={m.color} variant={m.variant} icon={m.icon} sx={{ fontWeight: 600 }} />;
}
