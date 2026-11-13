"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { user } from "../lib/data";
import { isActive, navGroups, type NavItem } from "../lib/nav";

export const DRAWER_WIDTH = 248;
export const DRAWER_WIDTH_COLLAPSED = 68;

function NavLink({
  item,
  active,
  collapsed,
  nested,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  nested: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const button = (
    <ListItemButton
      component={Link}
      href={item.href}
      selected={active}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      onClick={onNavigate}
      sx={{
        minHeight: 40,
        mx: 1,
        my: 0.25,
        justifyContent: collapsed ? "center" : "flex-start",
        px: collapsed ? 1 : 2,
        pl: nested && !collapsed ? 4 : undefined,
      }}
    >
      <ListItemIcon
        sx={{ minWidth: 0, mr: collapsed ? 0 : 1.5, justifyContent: "center", color: "inherit" }}
      >
        <Icon fontSize="small" />
      </ListItemIcon>
      {!collapsed && (
        <ListItemText primary={item.label} slotProps={{ primary: { variant: "body2" } }} />
      )}
    </ListItemButton>
  );
  return collapsed ? (
    <Tooltip title={item.label} placement="right">
      {button}
    </Tooltip>
  ) : (
    button
  );
}

export default function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState<Record<string, boolean>>({
    analytics: true,
    workspace: true,
  });

  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{ display: "flex", flexDirection: "column", height: "100%", overflowX: "hidden" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          height: 64,
          px: collapsed ? 0 : 2.5,
          justifyContent: collapsed ? "center" : "flex-start",
          flexShrink: 0,
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "grid",
            placeItems: "center",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontWeight: 700,
          }}
        >
          L
        </Box>
        {!collapsed && (
          <Typography variant="h6" component="span" sx={{ letterSpacing: "0.12em" }}>
            LUMEN
          </Typography>
        )}
      </Box>
      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: "auto", py: 1 }}>
        {navGroups.map((group, index) => {
          const isOpen = open[group.id] ?? true;
          if (collapsed) {
            return (
              <React.Fragment key={group.id}>
                {index > 0 && <Divider sx={{ my: 1, mx: 1.5 }} />}
                <List disablePadding aria-label={group.label}>
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      active={isActive(pathname, item.href)}
                      collapsed
                      nested={false}
                      onNavigate={onNavigate}
                    />
                  ))}
                </List>
              </React.Fragment>
            );
          }
          return (
            <List key={group.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => setOpen((o) => ({ ...o, [group.id]: !isOpen }))}
                aria-expanded={isOpen}
                aria-controls={`nav-group-${group.id}`}
                sx={{ mx: 1, px: 2, minHeight: 36 }}
              >
                <ListItemText
                  primary={group.label}
                  slotProps={{
                    primary: { variant: "overline", color: "text.secondary", lineHeight: 2 },
                  }}
                />
                {isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </ListItemButton>
              <Collapse in={isOpen} timeout="auto">
                <List id={`nav-group-${group.id}`} component="div" disablePadding>
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      active={isActive(pathname, item.href)}
                      collapsed={false}
                      nested
                      onNavigate={onNavigate}
                    />
                  ))}
                </List>
              </Collapse>
            </List>
          );
        })}
      </Box>

      <Divider />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 1.5,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Tooltip title={collapsed ? `${user.name}, ${user.role}` : ""} placement="right">
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", color: "primary.contrastText", fontSize: 14 }}>
            MO
          </Avatar>
        </Tooltip>
        {!collapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap component="div">
              {user.role}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
