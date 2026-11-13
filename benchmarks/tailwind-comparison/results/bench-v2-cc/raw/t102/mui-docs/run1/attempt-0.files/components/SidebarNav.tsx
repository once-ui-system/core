"use client";

import { useState } from "react";
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
import ExpandLessRounded from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import { isActive, navGroups } from "@/lib/navigation";

interface SidebarNavProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

export default function SidebarNav({ collapsed, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const [closedGroups, setClosedGroups] = useState<Record<string, boolean>>({});

  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{ px: collapsed ? 1.5 : 2, py: 2 }}
    >
      {navGroups.map((group, index) => {
        const isOpen = collapsed || !closedGroups[group.id];
        const listId = `nav-group-${group.id}`;
        const GroupIcon = group.icon;
        return (
          <Box key={group.id} sx={{ mb: 1 }}>
            {collapsed ? (
              index > 0 ? <Divider sx={{ my: 1.5 }} /> : null
            ) : (
              <ListItemButton
                onClick={() =>
                  setClosedGroups((prev) => ({
                    ...prev,
                    [group.id]: !prev[group.id],
                  }))
                }
                aria-expanded={isOpen}
                aria-controls={listId}
                sx={{ color: "text.secondary", minHeight: 48 }}
              >
                <ListItemIcon sx={{ color: "inherit" }}>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText
                  primary={group.label}
                  slotProps={{ primary: { variant: "subtitle2" } }}
                />
                {isOpen ? <ExpandLessRounded /> : <ExpandMoreRounded />}
              </ListItemButton>
            )}
            <Collapse in={isOpen} timeout="auto" id={listId}>
              <List disablePadding sx={{ pl: collapsed ? 0 : 1.5 }}>
                {group.items.map((item) => {
                  const active = isActive(item.href, pathname);
                  const Icon = item.icon;
                  return (
                    <ListItem key={item.href} disablePadding sx={{ display: "block", mt: 0.5 }}>
                      <Tooltip
                        title={collapsed ? item.label : ""}
                        placement="right"
                        arrow
                      >
                        <ListItemButton
                          href={item.href}
                          selected={active}
                          aria-current={active ? "page" : undefined}
                          aria-label={collapsed ? item.label : undefined}
                          onClick={onNavigate}
                          sx={
                            collapsed
                              ? {
                                  justifyContent: "center",
                                  px: 0,
                                  "& .MuiListItemIcon-root": { minWidth: 0 },
                                }
                              : undefined
                          }
                        >
                          <ListItemIcon>
                            <Icon />
                          </ListItemIcon>
                          {collapsed ? null : (
                            <ListItemText
                              primary={item.label}
                              slotProps={{
                                primary: { sx: { fontWeight: active ? 700 : 600 } },
                              }}
                            />
                          )}
                        </ListItemButton>
                      </Tooltip>
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
