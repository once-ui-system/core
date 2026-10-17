# @once-ui-system/core — agent harness

This package ships an agent-first codegen harness under `ai/`, next to this file. Use it when **writing Once UI code**, not full MDX documentation pages. Paths below are relative to this file (in an app: `node_modules/@once-ui-system/core/`).

## Writing a page or feature

Every file you read is sent again on every later turn, so read what you need in one step, then write.

1. Pick the bundle below closest to what you are building and read it, together with any project files you need, in a single step. A bundle is complete: the rules, every component's props, types, gotchas, the quality bar and a gold example. Then write the code.
2. Need a component the bundle does not list? Read its `ai/components/<Name>.json`, all of them in one step.
3. Nothing fits? Read `ai/bundles/page.md` (the rules and the common components) with the `ai/components/<Name>.json` slices your page needs, in one step. `ai/catalog.json` names every component with its purpose.

Never open `ai/spec.json`: it is the full machine spec, for tooling.

<!-- tasks:start -->
| Bundle | For |
|---|---|
| `ai/bundles/marketing-hero.md` | Marketing hero: Headline with text effect, CTA pair, social proof logos, background effect |
| `ai/bundles/pricing.md` | Pricing page: Three tiers, highlighted middle tier, feature comparison table, FAQ accordion |
| `ai/bundles/settings.md` | Settings page: Vertical section tabs, profile form, settings rows with one control each, grouped sub-settings, danger zone |
| `ai/bundles/dashboard.md` | Analytics dashboard: KPI stat cards, charts area, recent-activity list |
| `ai/bundles/chat.md` | Chat UI: Message list with avatars, streaming indicator, input bar with emoji picker |
| `ai/bundles/auth.md` | Auth flow: Sign-up / login with social auth, email form, stacked dialog for OTP |
| `ai/bundles/roadmap.md` | Product roadmap: Kanban-style roadmap with status columns and task cards |
| `ai/bundles/list-page.md` | List / table page: A page of records: title with the primary action, a status filter, a searchable, sortable, paginated Table with status tags and row actions, and an empty state |
| `ai/bundles/editor.md` | Editor shell: A toolbar, a resizable two-pane split (layers and canvas) and a timeline spanning both — video editor, page builder, diff view |
| `ai/bundles/docs-page.md` | Docs or blog article: An MDX article: breadcrumb trail, title and summary, Markdown rendered through the /mdx component map, and an on-page heading nav |
| `ai/bundles/page.md` | Any other page: The rules and the components nearly every page uses, with their types and gotchas. Read it with the `components/<Name>.json` slices your page adds, in one step |
<!-- tasks:end -->

Validate generated code: `npx once-ui-validate-ai-code path/to/file.tsx`. Without a bundle, app shells, sidebars and editors are in `ai/layouts.md`, and Pro blocks to compose from are listed in `ai/examples/blocks/manifest.json`.

## Imports

- Most things come from `@once-ui-system/core`. Charts come from `/data`, `CodeBlock` from `/code`, `MediaUpload` from `/media`, the MDX map from `/mdx`, `defineConfig` from `/config`; `ai/manifest.json` → `imports` lists every entry point with its exports.
- In a Next.js app, import `LayoutProvider` from `@once-ui-system/core/next`: the root export renders links and images as plain `<a>` and `<img>`. The OG route handlers come from there too.

## Setup and remote fallback

`npx once-ui-init-agent` writes AGENTS.md, CLAUDE.md and a Cursor rule into a consumer app. Without `node_modules`, use https://docs.once-ui.com/ai/manifest.json (may not match your installed version exactly).
