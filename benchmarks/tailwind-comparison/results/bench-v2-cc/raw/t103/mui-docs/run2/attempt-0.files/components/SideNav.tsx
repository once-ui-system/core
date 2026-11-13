"use client";

import * as React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Bolt from "@mui/icons-material/Bolt";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { navGroups } from "./nav-config";

interface SideNavProps {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export default function SideNav({ pathname, collapsed = false, onNavigate }: SideNavProps) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({
    analytics: true,
    workspace: true,
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          height: 64,
          px: collapsed ? 0 : 2.5,
          justifyContent: collapsed ? "center" : "flex-start",
          flexShrink: 0,
        }}
      >
        <Bolt color="primary" aria-hidden />
        {!collapsed && (
          <Typography variant="h5" component="span">
            Lumen
          </Typography>
        )}
      </Box>
      <Divider />
      <List component="nav" aria-label="Main navigation" sx={{ px: 1, py: 1.5, flex: 1 }}>
        {navGroups.map((group, index) => {
          const expanded = collapsed || open[group.id];
          const listId = `nav-group-${group.id}`;
          return (
            <Box key={group.id} component="div" sx={{ mb: 1 }}>
              {collapsed ? (
                index > 0 && <Divider sx={{ my: 1 }} />
              ) : (
                <ListItemButton
                  onClick={() => setOpen((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                  aria-expanded={expanded}
                  aria-controls={listId}
                  sx={{ px: 1.5, py: 0.5 }}
                >
                  <ListItemText
                    primary={group.label}
                    slotProps={{
                      primary: {
                        variant: "caption",
                        sx: {
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "text.secondary",
                          fontWeight: 600,
                        },
                      },
                    }}
                  />
                  {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </ListItemButton>
              )}
              <Collapse in={expanded} timeout="auto">
                <List component="div" id={listId} disablePadding>
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    const button = (
                      <ListItemButton
                        key={item.href}
                        component={Link}
                        href={item.href}
                        selected={active}
                        aria-current={active ? "page" : undefined}
                        aria-label={collapsed ? item.label : undefined}
                        onClick={onNavigate}
                        sx={{
                          minHeight: 40,
                          mb: 0.25,
                          px: 1.5,
                          pl: collapsed ? 1.5 : 2.5,
                          justifyContent: collapsed ? "center" : "flex-start",
                        }}
                      >
                        <ListItemIcon
                          sx={{ minWidth: 0, mr: collapsed ? 0 : 1.5, color: "inherit" }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        {!collapsed && (
                          <ListItemText
                            primary={item.label}
                            slotProps={{
                              primary: { variant: "body2", sx: { fontWeight: active ? 600 : 400 } },
                            }}
                          />
                        )}
                      </ListItemButton>
                    );
                    return collapsed ? (
                      <Tooltip key={item.href} title={item.label} placement="right">
                        {button}
                      </Tooltip>
                    ) : (
                      button
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>
    </Box>
  );
}
