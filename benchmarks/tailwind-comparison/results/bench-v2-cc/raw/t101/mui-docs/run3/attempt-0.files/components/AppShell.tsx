"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InsightsIcon from "@mui/icons-material/Insights";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { user } from "@/lib/data";

const EXPANDED_WIDTH = 224;
const COLLAPSED_WIDTH = 52;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}
interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: <DashboardOutlinedIcon fontSize="small" /> },
      { label: "Reports", href: "/reports", icon: <AssessmentOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: <FolderOutlinedIcon fontSize="small" /> },
      { label: "Settings", href: "/settings", icon: <SettingsOutlinedIcon fontSize="small" /> },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavContent({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({ analytics: true, workspace: true });

  return (
    <Box component="nav" aria-label="Main" sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ gap: 1, px: collapsed ? 1.25 : 2, minHeight: 48 }}>
        <Box
          aria-hidden
          sx={{
            width: 28,
            height: 28,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: "2px",
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <InsightsIcon sx={{ fontSize: 18 }} />
        </Box>
        {!collapsed && (
          <Typography variant="h6" component="span" sx={{ fontSize: "1.15rem" }}>
            Lumen
          </Typography>
        )}
      </Toolbar>
      <Divider />
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", p: 1 }}>
        {navGroups.map((group, gi) => {
          const expanded = collapsed || open[group.id];
          return (
            <Box key={group.id} sx={{ mb: 0.5 }}>
              {collapsed ? (
                gi > 0 && <Divider sx={{ my: 0.75 }} />
              ) : (
                <ListItemButton
                  onClick={() => setOpen((o) => ({ ...o, [group.id]: !o[group.id] }))}
                  aria-expanded={Boolean(open[group.id])}
                  aria-controls={`nav-group-${group.id}`}
                  sx={{ color: "text.secondary", mt: gi > 0 ? 1 : 0 }}
                >
                  <ListItemText
                    primary={group.label}
                    slotProps={{
                      primary: {
                        variant: "caption",
                        sx: { fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" },
                      },
                    }}
                  />
                  {open[group.id] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </ListItemButton>
              )}
              <Collapse in={expanded} timeout="auto" unmountOnExit={false}>
                <List id={`nav-group-${group.id}`} disablePadding aria-label={group.label}>
                  {group.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    const button = (
                      <ListItemButton
                        component={Link}
                        href={item.href}
                        selected={active}
                        aria-current={active ? "page" : undefined}
                        aria-label={collapsed ? item.label : undefined}
                        onClick={onNavigate}
                        sx={{ mb: 0.25, justifyContent: collapsed ? "center" : "flex-start", px: collapsed ? 1 : 1.5 }}
                      >
                        <ListItemIcon sx={{ minWidth: collapsed ? 0 : 32 }}>{item.icon}</ListItemIcon>
                        {!collapsed && <ListItemText primary={item.label} />}
                      </ListItemButton>
                    );
                    return (
                      <Box component="li" key={item.href} sx={{ listStyle: "none" }}>
                        {collapsed ? (
                          <Tooltip title={`${group.label}: ${item.label}`} placement="right">
                            {button}
                          </Tooltip>
                        ) : (
                          button
                        )}
                      </Box>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"), { noSsr: false });
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const current = React.useMemo(() => {
    for (const group of navGroups) {
      const item = group.items.find((i) => isActive(pathname, i.href));
      if (item) return { group: group.label, label: item.label };
    }
    return { group: "Lumen", label: "Page" };
  }, [pathname]);

  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const paperSx = {
    width,
    boxSizing: "border-box",
    borderRight: 1,
    borderColor: "divider",
    overflowX: "hidden",
    transition: theme.transitions.create("width", { duration: theme.transitions.duration.shorter }),
  } as const;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <MuiLink
        href="#main-content"
        sx={{
          position: "absolute",
          left: 8,
          top: -48,
          zIndex: (t) => t.zIndex.tooltip + 1,
          bgcolor: "background.paper",
          px: 1.5,
          py: 0.75,
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </MuiLink>

      {/* Desktop sidebar */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width,
          flexShrink: 0,
          transition: theme.transitions.create("width", { duration: theme.transitions.duration.shorter }),
          "& .MuiDrawer-paper": paperSx,
        }}
      >
        <NavContent pathname={pathname} collapsed={collapsed} />
      </Drawer>

      {/* Phone drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen && !isDesktop}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: EXPANDED_WIDTH, boxSizing: "border-box" },
        }}
      >
        <NavContent pathname={pathname} collapsed={false} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", color: "text.primary" }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              edge="start"
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <IconButton
              edge="start"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={collapsed}
              onClick={() => setCollapsed((c) => !c)}
              sx={{ display: { xs: "none", md: "inline-flex" } }}
            >
              {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
            </IconButton>
            <Breadcrumbs aria-label="Breadcrumb" sx={{ flex: 1, minWidth: 0, fontSize: "0.8125rem" }}>
              <MuiLink component={Link} href="/" color="text.secondary" underline="hover">
                Lumen
              </MuiLink>
              <Typography variant="body2" color="text.secondary">
                {current.group}
              </Typography>
              <Typography variant="body2" color="text.primary" aria-current="page" sx={{ fontWeight: 600 }}>
                {current.label}
              </Typography>
            </Breadcrumbs>
            <Tooltip title={`${user.name} (${user.role})`}>
              <Avatar
                alt={user.name}
                sx={{ width: 28, height: 28, fontSize: "0.75rem", bgcolor: "primary.main", color: "primary.contrastText" }}
              >
                MO
              </Avatar>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Box component="main" id="main-content" tabIndex={-1} sx={{ flex: 1, p: { xs: 2, md: 3 }, outline: "none" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
