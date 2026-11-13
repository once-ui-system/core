"use client";

import CancelOutlined from "@mui/icons-material/CancelOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import EventOutlined from "@mui/icons-material/EventOutlined";
import HourglassTop from "@mui/icons-material/HourglassTop";
import MedicalServicesOutlined from "@mui/icons-material/MedicalServicesOutlined";
import Chip from "@mui/material/Chip";
import { STATUS_LABEL, type Status } from "@/lib/data";

const META: Record<
  Status,
  { color: "default" | "warning" | "info" | "success"; variant: "filled" | "outlined"; icon: React.ReactElement }
> = {
  booked: { color: "default", variant: "outlined", icon: <EventOutlined /> },
  checked_in: { color: "warning", variant: "filled", icon: <HourglassTop /> },
  in_exam: { color: "info", variant: "filled", icon: <MedicalServicesOutlined /> },
  done: { color: "success", variant: "outlined", icon: <CheckCircleOutline /> },
  cancelled: { color: "default", variant: "outlined", icon: <CancelOutlined /> },
};

export default function StatusChip({ status, size = "small" }: { status: Status; size?: "small" | "medium" }) {
  const m = META[status];
  return <Chip size={size} color={m.color} variant={m.variant} icon={m.icon} label={STATUS_LABEL[status]} />;
}
