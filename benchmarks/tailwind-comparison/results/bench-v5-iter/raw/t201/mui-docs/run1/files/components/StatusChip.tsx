"use client";

import Chip from "@mui/material/Chip";
import EventIcon from "@mui/icons-material/EventOutlined";
import HourglassIcon from "@mui/icons-material/HourglassTop";
import MedicalIcon from "@mui/icons-material/MedicalServices";
import DoneIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelIcon from "@mui/icons-material/CancelOutlined";
import { STATUS_LABEL, type Status } from "@/lib/data";

const config: Record<Status, { color: "default" | "warning" | "info" | "success"; variant: "filled" | "outlined"; icon: React.ReactElement }> = {
  booked: { color: "default", variant: "outlined", icon: <EventIcon /> },
  checked_in: { color: "warning", variant: "filled", icon: <HourglassIcon /> },
  in_exam: { color: "info", variant: "filled", icon: <MedicalIcon /> },
  done: { color: "success", variant: "outlined", icon: <DoneIcon /> },
  cancelled: { color: "default", variant: "outlined", icon: <CancelIcon /> },
};

export default function StatusChip({ status }: { status: Status }) {
  const c = config[status];
  return (
    <Chip
      size="small"
      color={c.color}
      variant={c.variant}
      icon={c.icon}
      label={STATUS_LABEL[status]}
      sx={status === "cancelled" ? { textDecoration: "line-through" } : undefined}
    />
  );
}
