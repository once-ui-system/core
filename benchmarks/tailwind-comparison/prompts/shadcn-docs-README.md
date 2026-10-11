# shadcn/ui documentation (local copy)

This folder is a local copy of the shadcn/ui documentation and agent skill, pinned to one
commit of github.com/shadcn-ui/ui. Everything listed here is already set up in the project.

- `skill/SKILL.md`: the official shadcn/ui agent skill (rules in `skill/rules/`). The
  shadcn CLI is **not** available in this environment: every component is already
  installed under `@/components/ui/*`, so skip any step that says to run `npx shadcn`.
- `llms.txt`: the official documentation index. A link of the form
  `https://ui.shadcn.com/docs/components/<name>` is available here as
  `components/<name>.mdx`.
- `components/*.mdx`: per-component docs (Radix flavour, matching the installed components).
  A `<ComponentPreview name="x" />` tag refers to the example source in `examples/x.tsx`.
- `examples/*.tsx`: the example source behind each docs preview.
- `blocks/`: the official shadcn/ui blocks (dashboard, login, sidebar, ...).
- `installation/next.mdx`: Next.js setup notes (already done).

Imports in `examples/` and `blocks/` have been rewritten to the project's paths
(`@/components/ui/*`, `@/lib/utils`, `@/hooks/*`), as the shadcn CLI does.
