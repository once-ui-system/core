# Material UI documentation (local copy)

This folder is a local copy of the official Material UI and MUI X documentation for agents
(`llms.txt`), snapshotted on the date in the benchmark's context manifest. Everything listed
here is already set up in the project.

- `llms.txt`: the official Material UI documentation index. Every link points at a local page
  under `material-ui/`.
- `x-llms.txt`: the official MUI X index (charts, data grid, date pickers, tree view). Pages are
  under `x/`. Installed: `@mui/x-charts` and `@mui/x-data-grid` (the free, MIT-licensed
  packages). Date pickers, tree view and every Pro or Premium feature are **not** installed.
- Also installed: `@mui/material`, `@mui/icons-material`, Emotion, and `@mui/material-nextjs`.
  The root layout already mounts `AppRouterCacheProvider`, `ThemeProvider` (theme in
  `app/theme.ts`, CSS variables with light and dark color schemes), `CssBaseline` and
  `InitColorSchemeScript`, as in `material-ui/integrations/nextjs.md`.
