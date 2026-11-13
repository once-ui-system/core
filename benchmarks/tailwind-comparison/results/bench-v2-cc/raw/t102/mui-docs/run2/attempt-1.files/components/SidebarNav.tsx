"use client";

import { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import ExpandLessRounded from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import { isActive, navGroups, type NavItem } from "./nav";

type SidebarNavProps = {
  collapsed: boolean;
  onNavigate?: () => void;
};

type NavLinkProps = {
  item: NavItem;
  active: boolean;
  iconOnly: boolean;
  nested?: boolean;
  onNavigate?: () => void;
};

function NavLink({ item, active, iconOnly, nested, onNavigate }: NavLinkProps) {
  const button = (
    <ListItemButton
      component={NextLink}
      href={item.href}
      selected={active}
      aria-current={active ? "page" : undefined}
      aria-label={iconOnly ? item.label : undefined}
      onClick={onNavigate}
      sx={{ pl: nested ? 4.5 : undefined, justifyContent: iconOnly ? "center" : undefined }}
    >
      <ListItemIcon sx={iconOnly ? { minWidth: 0 } : undefined}>{item.icon}</ListItemIcon>
      {!iconOnly && <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />}
    </ListItemButton>
  );
  return iconOnly ? (
    <Tooltip title={item.label} placement="right">
      {button}
    </Tooltip>
  ) : (
    button
  );
}

export default function SidebarNav({ collapsed, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navGroups.map((g) => [g.id, true])),
  );

  return (
    <Box component="nav" aria-label="Main navigation" sx={{ px: collapsed ? 1.5 : 2, py: 2 }}>
      {navGroups.map((group, index) => {
        const panelId = `nav-group-${group.id}`;
        const isOpen = open[group.id];

        if (collapsed) {
          return (
            <Box key={group.id}>
              {index > 0 && <Divider sx={{ my: 1.5 }} />}
              <List disablePadding aria-label={group.label}>
                {group.items.map((item) => (
                  <ListItem key={item.href} disablePadding>
                    <NavLink item={item} active={isActive(item.href, pathname)} iconOnly />
                  </ListItem>
                ))}
              </List>
            </Box>
          );
        }

        return (
          <List key={group.id} disablePadding sx={{ mb: 1 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setOpen((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <ListItemIcon>{group.icon}</ListItemIcon>
                <ListItemText
                  primary={group.label}
                  slotProps={{ primary: { sx: { fontWeight: 700, color: "text.secondary" } } }}
                />
                {isOpen ? <ExpandLessRounded /> : <ExpandMoreRounded />}
              </ListItemButton>
            </ListItem>
            <Box component="li" sx={{ listStyle: "none" }}>
              <Collapse in={isOpen} timeout="auto" id={panelId}>
                <List disablePadding>
                  {group.items.map((item) => (
                    <ListItem key={item.href} disablePadding>
                      <NavLink
                        item={item}
                        active={isActive(item.href, pathname)}
                        iconOnly={false}
                        nested
                        onNavigate={onNavigate}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          </List>
        );
      })}
    </Box>
  );
}
