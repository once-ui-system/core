"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { useColorScheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import BoltIcon from "@mui/icons-material/Bolt";
import CommandPalette from "@/components/CommandPalette";
import InviteDialog from "@/components/InviteDialog";
import { recentProjects, user } from "@/lib/data";
import type { Command } from "@/lib/commands";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/members", label: "Members" },
] as const;

function buildCommands(): Command[] {
  return [
    { id: "page-dashboard", group: "Pages", label: "Dashboard", hint: "/", keywords: "home overview", icon: "dashboard", run: { type: "navigate", href: "/" } },
    { id: "page-projects", group: "Pages", label: "Projects", hint: "/projects", keywords: "issues", icon: "projects", run: { type: "navigate", href: "/projects" } },
    { id: "page-members", group: "Pages", label: "Members", hint: "/members", keywords: "team people", icon: "members", run: { type: "navigate", href: "/members" } },
    { id: "action-create-project", group: "Actions", label: "Create project", keywords: "new add", icon: "create", run: { type: "create-project" } },
    { id: "action-invite-member", group: "Actions", label: "Invite member", keywords: "add teammate email", icon: "invite", run: { type: "invite-member" } },
    { id: "action-toggle-theme", group: "Actions", label: "Toggle theme", keywords: "dark light mode appearance", icon: "theme", run: { type: "toggle-theme" } },
    ...recentProjects.map<Command>((p) => ({
      id: `recent-${p.key}`,
      group: "Recent",
      label: p.name,
      hint: p.key,
      keywords: `${p.key} ${p.status} project`,
      icon: "project",
      run: { type: "navigate", href: "/projects" },
    })),
  ];
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, systemMode, setMode } = useColorScheme();
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [isMac, setIsMac] = React.useState(false);

  const commands = React.useMemo(buildCommands, []);

  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent));
  }, []);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleRun = (command: Command) => {
    setPaletteOpen(false);
    const { run } = command;
    switch (run.type) {
      case "navigate":
        router.push(run.href);
        break;
      case "invite-member":
        setInviteOpen(true);
        break;
      case "create-project":
        router.push("/projects");
        setNotice("Project creation is coming soon. Opened your projects instead.");
        break;
      case "toggle-theme": {
        const current = mode === "system" ? systemMode : mode;
        setMode(current === "dark" ? "light" : "dark");
        break;
      }
    }
  };

  const shortcutLabel = isMac ? "⌘K" : "Ctrl K";

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "absolute",
          left: 8,
          top: -48,
          zIndex: (t) => t.zIndex.tooltip,
          bgcolor: "background.paper",
          color: "text.primary",
          px: 2,
          py: 1,
          borderRadius: 1,
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Box>

      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
      >
        <Toolbar sx={{ gap: { xs: 1, sm: 2 }, flexWrap: "wrap" }}>
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "primary.main",
              textDecoration: "none",
              mr: { xs: 0, sm: 2 },
            }}
          >
            <BoltIcon />
            <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
              Lumen
            </Typography>
          </Box>

          <Box
            component="nav"
            aria-label="Main"
            sx={{ display: "flex", gap: 0.5, order: { xs: 3, md: 0 }, width: { xs: "100%", md: "auto" }, pb: { xs: 1, md: 0 } }}
          >
            {NAV.map((item) => {
              const current =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  color={current ? "primary" : "inherit"}
                  aria-current={current ? "page" : undefined}
                  sx={{
                    fontWeight: current ? 700 : 500,
                    bgcolor: current ? "action.selected" : "transparent",
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setPaletteOpen(true)}
            startIcon={<SearchIcon />}
            aria-haspopup="dialog"
            aria-keyshortcuts="Control+K Meta+K"
            sx={{
              borderColor: "divider",
              color: "text.secondary",
              textTransform: "none",
              minHeight: 40,
              gap: 0.5,
            }}
          >
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, mr: 1 }}>
              Search
            </Box>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
              Search
            </Box>
            <Box
              component="kbd"
              sx={{
                display: { xs: "none", sm: "inline-block" },
                fontFamily: "inherit",
                fontSize: 12,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                px: 0.75,
                py: 0.125,
              }}
            >
              {shortcutLabel}
            </Box>
          </Button>

          <Tooltip title={`${user.name} · ${user.role}`}>
            <IconButton aria-label={`Account: ${user.name}`} size="small">
              <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: "primary.main" }}>
                MO
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container
        component="main"
        id="main-content"
        maxWidth="lg"
        sx={{ flex: 1, py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}
      >
        {children}
      </Container>

      <CommandPalette
        open={paletteOpen}
        commands={commands}
        onClose={() => setPaletteOpen(false)}
        onRun={handleRun}
      />
      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={(email) => {
          setInviteOpen(false);
          setNotice(`Invitation sent to ${email}`);
        }}
      />
      <Snackbar
        open={notice !== null}
        autoHideDuration={4000}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setNotice(null)} severity="success" variant="filled" sx={{ width: "100%" }}>
          {notice}
        </Alert>
      </Snackbar>
    </Box>
  );
}
