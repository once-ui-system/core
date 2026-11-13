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
