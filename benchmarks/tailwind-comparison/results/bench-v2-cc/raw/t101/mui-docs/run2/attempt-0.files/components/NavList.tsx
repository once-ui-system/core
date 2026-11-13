"use client";

import { Fragment, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { isActive, navGroups } from "@/lib/navigation";

interface NavListProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export default function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname();
  const baseId = useId();
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navGroups.map((g) => [g.id, true])),
  );

  if (collapsed) {
    return (
      <Box component="nav" aria-label="Primary" sx={{ px: 0.75, py: 1 }}>
        {navGroups.map((group, index) => (
          <Fragment key={group.id}>
            {index > 0 && <Divider sx={{ my: 1 }} />}
            <List disablePadding aria-label={group.label}>
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <ListItem key={item.href} disablePadding sx={{ display: "block", mb: 0.25 }}>
                    <Tooltip title={item.label} placement="right">
                      <ListItemButton
                        component={Link}
                        href={item.href}
                        selected={active}
                        aria-current={active ? "page" : undefined}
                        aria-label={`${group.label}: ${item.label}`}
                        onClick={onNavigate}
                        sx={{ justifyContent: "center", px: 1 }}
                      >
                        <ListItemIcon sx={{ minWidth: 0, justifyContent: "center" }}>
                          <Icon fontSize="small" />
                        </ListItemIcon>
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </List>
          </Fragment>
        ))}
      </Box>
    );
  }

  return (
    <Box component="nav" aria-label="Primary" sx={{ px: 0.75, py: 1 }}>
      {navGroups.map((group) => {
        const isOpen = open[group.id] ?? true;
        const GroupIcon = group.icon;
        const panelId = `${baseId}-${group.id}`;
        return (
          <Box key={group.id} sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => setOpen((prev) => ({ ...prev, [group.id]: !(prev[group.id] ?? true) }))}
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <ListItemIcon>
                <GroupIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={group.label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
              {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </ListItemButton>
            <Collapse in={isOpen} timeout="auto" id={panelId}>
              <List disablePadding aria-label={group.label}>
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <ListItem key={item.href} disablePadding sx={{ display: "block", mt: 0.25 }}>
                      <ListItemButton
                        component={Link}
                        href={item.href}
                        selected={active}
                        aria-current={active ? "page" : undefined}
                        onClick={onNavigate}
                        sx={{ pl: 3 }}
                      >
                        <ListItemIcon>
                          <Icon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
}
