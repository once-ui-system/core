"use client";

import { useState, type ReactNode } from "react";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { tables } from "@/lib/data";
import { guestById } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

export default function SeatMenuButton({ guestId }: { guestId: string }) {
  const plan = usePlan();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const guest = guestById[guestId];
  if (!guest || guest.rsvp === "no") return null;
  const current = plan.guestTable[guestId] ?? null;
  const close = () => setAnchor(null);

  const items: ReactNode[] = tables.map((t) => {
    const free = t.seats - (plan.occupied[t.id] ?? 0);
    return (
      <MenuItem
        key={t.id}
        selected={t.id === current}
        disabled={free === 0 && t.id !== current}
        onClick={() => {
          plan.place(guestId, t.id);
          close();
        }}
      >
        {t.name}
        <span style={{ marginLeft: 16, opacity: 0.7, fontSize: "0.85em" }}>
          {t.id === current ? "current" : free === 0 ? "full" : `${free} free`}
        </span>
      </MenuItem>
    );
  });
  if (current) {
    items.push(<Divider key="divider" />);
    items.push(
      <MenuItem
        key="unseat"
        onClick={() => {
          plan.unseat(guestId);
          close();
        }}
      >
        Unseat
      </MenuItem>,
    );
  }

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        aria-label={`${current ? "Move" : "Seat"} ${guest.name}`}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        endIcon={<ArrowDropDownIcon />}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ minHeight: 36, whiteSpace: "nowrap", flexShrink: 0 }}
      >
        {current ? "Move" : "Seat"}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
        {items}
      </Menu>
    </>
  );
}
