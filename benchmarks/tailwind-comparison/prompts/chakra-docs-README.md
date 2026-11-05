# Chakra UI documentation (local copy)

This folder is a local copy of the official Chakra UI v3 documentation for agents (the
`llms-*.txt` files from chakra-ui.com), split into one page per topic and snapshotted on the
date in the benchmark's context manifest. Everything listed here is already set up in the
project.

- `llms.txt`: the index of every local page (`components/`, `charts/`, `styling/`, `theming/`).
- `installation.md`: the Next.js setup, already done.
- The project has every official snippet from `npx @chakra-ui/cli snippet add --all` under
  `@/components/ui/*` (provider, color-mode, toaster, dialog, menu, select, field and the
  rest), so skip any step that says to run the CLI. The root layout mounts `Provider` (with
  next-themes color mode) and `Toaster`.
- Also installed: `@chakra-ui/charts` with recharts, and `react-icons`.
