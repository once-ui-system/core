# Mantine documentation (local copy)

This folder is a local copy of the official Mantine documentation for agents (`llms.txt` and
the Markdown pages it links), snapshotted on the date in the benchmark's context manifest.
Everything listed here is already set up in the project.

- `llms.txt`: the official index. Every link points at a local page under `pages/`.
- Installed: `@mantine/core`, `hooks`, `form`, `dates` (with dayjs), `charts` (with recharts),
  `notifications`, `modals`, `spotlight`, and `@tabler/icons-react`. PostCSS is configured with
  `postcss-preset-mantine`. The root layout imports each package's styles and mounts
  `ColorSchemeScript`, `MantineProvider` (theme in `app/theme.ts`), `ModalsProvider` and
  `Notifications`, as in `pages/guides-next.md`.
