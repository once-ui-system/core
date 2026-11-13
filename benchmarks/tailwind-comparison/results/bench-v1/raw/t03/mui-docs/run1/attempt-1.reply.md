The docs confirm the naming rule. `PeopleOutline` and `AddCircleOutline` don't exist as paths, but `PeopleOutlined` and `AddCircleOutlined` follow the documented `Outlined` suffix. I'll use the documented plain `People` and `AddCircle` names with the `Outlined` suffix, which the docs show for `Delete`/`DeleteOutlined`. The other imports that already passed the typecheck stay as they are.

```ts lib/data.ts
export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams";

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const;

export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export type MemberRole = "Owner" | "Admin" | "Member" | "Viewer";
export type MemberStatus = "Active" | "Invited" | "Suspended";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  joined: string | null;
}

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export const members: Member[] = [
  { id: "m-01", name: "Maya Okafor", email: "maya@acmelabs.io", role: "Owner", status: "Active", joined: "2024-03-02" },
  { id: "m-02", name: "Daniel Reyes", email: "daniel@acmelabs.io", role: "Admin", status: "Active", joined: "2024-05-19" },
  { id: "m-03", name: "Priya Natarajan", email: "priya@acmelabs.io", role: "Member", status: "Active", joined: "2024-11-07" },
  { id: "m-04", name: "Tomás Lindqvist", email: "tomas@acmelabs.io", role: "Member", status: "Active", joined: "2025-02-14" },
  { id: "m-05", name: "Hana Sato", email: "hana@acmelabs.io", role: "Member", status: "Invited", joined: null },
  { id: "m-06", name: "Grace Mensah", email: "grace@acmelabs.io", role: "Viewer", status: "Active", joined: "2025-06-30" },
  { id: "m-07", name: "Leo Brandt", email: "leo@acmelabs.io", role: "Member", status: "Suspended", joined: "2025-01-21" },
  { id: "m-08", name: "Ines Duarte", email: "ines@acmelabs.io", role: "Viewer", status: "Invited", joined: null },
];

/** Three most recently updated projects, newest first. */
export const recentProjects: Project[] = [...projects]
  .sort((a, b) => b.updated.localeCompare(a.updated))
  .slice(0, 3);

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}
```

```ts lib/commands.ts
export type CommandGroup = "Pages" | "Actions" | "Recent";

export type CommandIconName =
  | "dashboard"
  | "projects"
  | "members"
  | "create"
  | "invite"
  | "theme"
  | "project";

export type CommandRun =
  | { type: "navigate"; href: string }
  | { type: "create-project" }
  | { type: "invite-member" }
  | { type: "toggle-theme" };

export interface Command {
  id: string;
  group: CommandGroup;
  label: string;
  hint?: string;
  keywords?: string;
  icon: CommandIconName;
  run: CommandRun;
}

export const GROUP_ORDER: CommandGroup[] = ["Pages", "Actions", "Recent"];

export function filterCommands(commands: Command[], query: string): Command[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return commands;
  return commands.filter((c) => {
    const haystack = `${c.label} ${c.hint ?? ""} ${c.keywords ?? ""}`.toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}
```

```tsx components/InviteDialog.tsx
"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  onInvited: (email: string) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteDialog({ open, onClose, onInvited }: InviteDialogProps) {
  const [email, setEmail] = React.useState("");
  const [touched, setTouched] = React.useState(false);

  const invalid = touched && !EMAIL_PATTERN.test(email.trim());

  const reset = () => {
    setEmail("");
    setTouched(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) return;
    onInvited(value);
    reset();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="invite-dialog-title"
      slotProps={{ transition: { onExited: reset } }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="invite-dialog-title">Invite a member</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            They will get an email with a link to join your Lumen workspace as a Member.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            required
            id="invite-email"
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            error={invalid}
            helperText={invalid ? "Enter a valid email address, like name@acmelabs.io" : " "}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Send invite
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export function InviteSuccess({ email }: { email: string }) {
  return <Alert severity="success">Invitation sent to {email}</Alert>;
}
```

```tsx components/CommandPalette.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import InputAdornment from "@mui/material/InputAdornment";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import DashboardIcon from "@mui/icons-material/SpaceDashboardOutlined";
import FolderIcon from "@mui/icons-material/FolderOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import AddIcon from "@mui/icons-material/AddCircleOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAddAltOutlined";
import ContrastIcon from "@mui/icons-material/Contrast";
import {
  GROUP_ORDER,
  filterCommands,
  type Command,
  type CommandIconName,
} from "@/lib/commands";

const ICONS: Record<CommandIconName, React.ElementType> = {
  dashboard: DashboardIcon,
  projects: FolderIcon,
  members: PeopleIcon,
  create: AddIcon,
  invite: PersonAddIcon,
  theme: ContrastIcon,
  project: FolderIcon,
};

interface CommandPaletteProps {
  open: boolean;
  commands: Command[];
  onClose: () => void;
  onRun: (command: Command) => void;
}

export default function CommandPalette({ open, commands, onClose, onRun }: CommandPaletteProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);
  const baseId = React.useId();
  const listboxId = `${baseId}-listbox`;
  const optionId = React.useCallback((id: string) => `${baseId}-opt-${id}`, [baseId]);

  const results = React.useMemo(() => filterCommands(commands, query), [commands, query]);

  // Flat, display-ordered list so arrow keys cross group boundaries.
  const grouped = React.useMemo(
    () =>
      GROUP_ORDER.map((group) => ({
        group,
        items: results.filter((c) => c.group === group),
      })).filter((g) => g.items.length > 0),
    [results],
  );
  const flat = React.useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  const safeActive = flat.length === 0 ? -1 : Math.min(active, flat.length - 1);
  const activeCommand = safeActive >= 0 ? flat[safeActive] : undefined;

  React.useEffect(() => {
    if (!activeCommand || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[id="${optionId(activeCommand.id)}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeCommand, optionId]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (flat.length) setActive((safeActive + 1) % flat.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (flat.length) setActive((safeActive - 1 + flat.length) % flat.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(Math.max(flat.length - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeCommand) onRun(activeCommand);
    }
  };

  const resetState = () => {
    setQuery("");
    setActive(0);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      aria-label="Command palette"
      slotProps={{ transition: { onExited: resetState } }}
      sx={{
        "& .MuiDialog-container": {
          alignItems: { xs: "stretch", sm: "flex-start" },
        },
        "& .MuiDialog-paper": {
          mt: { sm: "12vh" },
          maxHeight: { sm: "70vh" },
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, py: 1.25 }}>
        <InputBase
          autoFocus
          fullWidth
          placeholder="Search pages, actions and projects…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={handleKeyDown}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          }
          endAdornment={
            <Box
              component="kbd"
              aria-hidden
              sx={{
                fontFamily: "inherit",
                fontSize: 12,
                color: "text.secondary",
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                px: 0.75,
                py: 0.25,
              }}
            >
              Esc
            </Box>
          }
          slotProps={{
            input: {
              role: "combobox",
              "aria-label": "Search commands",
              "aria-expanded": true,
              "aria-controls": listboxId,
              "aria-autocomplete": "list",
              "aria-activedescendant": activeCommand ? optionId(activeCommand.id) : undefined,
              autoComplete: "off",
              spellCheck: false,
            },
          }}
          sx={{ fontSize: 16 }}
        />
      </Box>

      <Box
        ref={listRef}
        id={listboxId}
        role="listbox"
        aria-label="Results"
        sx={{ overflowY: "auto", py: 1, flex: 1, minHeight: { xs: 0, sm: 120 } }}
      >
        {grouped.map(({ group, items }) => {
          const headingId = `${baseId}-group-${group}`;
          return (
            <Box key={group} role="group" aria-labelledby={headingId}>
              <Typography
                id={headingId}
                variant="overline"
                component="div"
                sx={{ px: 2, pt: 1, color: "text.secondary", lineHeight: 2 }}
              >
                {group}
              </Typography>
              {items.map((command) => {
                const Icon = ICONS[command.icon];
                const selected = activeCommand?.id === command.id;
                return (
                  <Box
                    key={command.id}
                    id={optionId(command.id)}
                    role="option"
                    aria-selected={selected}
                    onClick={() => onRun(command)}
                    onMouseMove={() => {
                      const index = flat.findIndex((c) => c.id === command.id);
                      if (index !== safeActive) setActive(index);
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mx: 1,
                      px: 1.5,
                      py: 1,
                      minHeight: 44,
                      borderRadius: 1,
                      cursor: "pointer",
                      color: "text.primary",
                      bgcolor: selected ? "action.selected" : "transparent",
                    }}
                  >
                    <Icon fontSize="small" color={selected ? "primary" : "action"} />
                    <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
                      {command.label}
                    </Typography>
                    {command.hint ? (
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {command.hint}
                      </Typography>
                    ) : null}
                  </Box>
                );
              })}
            </Box>
          );
        })}
        {flat.length === 0 ? (
          <Typography
            role="status"
            variant="body2"
            color="text.secondary"
            sx={{ px: 3, py: 4, textAlign: "center" }}
          >
            No results for &ldquo;{query}&rdquo;
          </Typography>
        ) : null}
      </Box>

      <Box
        aria-hidden
        sx={{
          display: { xs: "none", sm: "flex" },
          gap: 2,
          px: 2,
          py: 1,
          borderTop: 1,
          borderColor: "divider",
          color: "text.secondary",
          fontSize: 12,
        }}
      >
        <span>↑↓ to navigate</span>
        <span>↵ to select</span>
        <span>esc to close</span>
      </Box>
    </Dialog>
  );
}
```

```tsx components/AppShell.tsx
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
            <Box component="span" sx={{ mr: { sm: 1 } }}>
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
```

```tsx components/StatusChip.tsx
import Chip from "@mui/material/Chip";

type Color = "default" | "success" | "warning" | "error" | "info";

const COLORS: Record<string, Color> = {
  Active: "success",
  Paused: "warning",
  Archived: "default",
  Invited: "info",
  Suspended: "error",
};

export default function StatusChip({ status }: { status: string }) {
  return <Chip size="small" label={status} color={COLORS[status] ?? "default"} variant="outlined" />;
}
```

```tsx components/DashboardView.tsx
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import StatusChip from "@/components/StatusChip";
import { formatDate, members, projects, recentProjects, user } from "@/lib/data";

export default function DashboardView() {
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const activeMembers = members.filter((m) => m.status === "Active").length;
  const pendingInvites = members.filter((m) => m.status === "Invited").length;

  const stats = [
    { label: "Open issues", value: openIssues },
    { label: "Active projects", value: activeProjects },
    { label: "Active members", value: activeMembers },
    { label: "Pending invites", value: pendingInvites },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
        Good to see you, {user.name.split(" ")[0]}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        Here is how your workspace is doing. Press Ctrl+K (Cmd+K on a Mac) to jump anywhere.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
        }}
      >
        {stats.map((s) => (
          <Card key={s.label} variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {s.label}
              </Typography>
              <Typography variant="h4" component="p" sx={{ fontWeight: 700, mt: 0.5 }}>
                {s.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" component="h2">
            Recently updated projects
          </Typography>
          <List disablePadding>
            {recentProjects.map((p) => (
              <ListItem
                key={p.key}
                disableGutters
                divider
                secondaryAction={<StatusChip status={p.status} />}
                sx={{ pr: 12 }}
              >
                <ListItemText
                  primary={`${p.name} (${p.key})`}
                  secondary={`${p.issues} open issues · updated ${formatDate(p.updated)}`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
```

```tsx app/page.tsx
import AppShell from "@/components/AppShell";
import DashboardView from "@/components/DashboardView";

export default function Page() {
  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  );
}
```

```tsx app/(app)/layout.tsx
import AppShell from "@/components/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/(app)/projects/page.tsx
import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import StatusChip from "@/components/StatusChip";
import { formatDate, projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
        Projects
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        {projects.length} projects across your workspace.
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table aria-label="Projects" sx={{ minWidth: 520 }}>
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Open issues</TableCell>
              <TableCell>Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.key} hover>
                <TableCell component="th" scope="row" sx={{ fontFamily: "ui-monospace, monospace" }}>
                  {p.key}
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>
                  <StatusChip status={p.status} />
                </TableCell>
                <TableCell align="right">{p.issues}</TableCell>
                <TableCell>{formatDate(p.updated)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
```

```tsx app/(app)/members/page.tsx
import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import StatusChip from "@/components/StatusChip";
import { formatDate, members } from "@/lib/data";

export const metadata: Metadata = { title: "Members · Lumen" };

export default function MembersPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
        Members
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        {members.length} people have access to this workspace. Use the command palette to invite more.
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table aria-label="Members" sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell component="th" scope="row">
                  {m.name}
                </TableCell>
                <TableCell>{m.email}</TableCell>
                <TableCell>{m.role}</TableCell>
                <TableCell>
                  <StatusChip status={m.status} />
                </TableCell>
                <TableCell>{formatDate(m.joined)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
```