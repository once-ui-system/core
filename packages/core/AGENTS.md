# @once-ui-system/core — agent harness

This package ships an agent-first codegen harness under `ai/`, next to this file. Use it when **writing Once UI code**, not full MDX documentation pages. Paths below are relative to this file (in an app: `node_modules/@once-ui-system/core/`).

## Starting an app

A new signed-in app (sidebar, top bar, content panel) starts from `ai/starters/app/`: Once UI's CSS, fonts, providers and theme in `src/app/layout.tsx`, the shell mounted once in `src/app/(app)/layout.tsx`, and two pages. With a shell, copy it over the create-next-app files, then edit it rather than rewriting it:

```bash
cp -r node_modules/@once-ui-system/core/ai/starters/app/src/. src/ && rm -f src/app/page.module.css src/app/globals.css
```

No `src/` folder? Copy into the project root. Also set `experimental.optimizePackageImports: ["@once-ui-system/core"]` in `next.config`, as `ai/starters/app/next.config.ts` does, or every route that imports the package root from a server component ships about 110 kB of extra JavaScript.

- `src/resources/app.ts`: product name, user and nav. The sidebar, breadcrumb and ⌘K palette read it. Each nav href needs a page under `src/app/(app)/`; copy `home/page.tsx`.
- `src/resources/once-ui.config.ts`: brand, accent, neutral and `defaultTheme` (`theme` stays `"system"`, or the theme switch stops working).
- `src/components/AppShell.tsx`: the frame. Change it only to change the frame; it already covers the app-shell bundle's quality bar.

Can't run shell commands (you only read files and reply with code)? Nothing was copied. Read these three with your bundle, in that same step, and write them in your reply (keep the project's own `app/layout.tsx`): `ai/starters/app/src/components/AppShell.tsx` (the frame), `ai/starters/app/src/resources/app.ts` (what it reads) and `ai/starters/app/src/app/(app)/layout.tsx` (mounts it once). Import only files you write or the project already has.

## Writing a page or feature

Every file you read is sent again on every later turn, so plan the reads, make them in one step, then write.

1. Pick the bundle below closest to what you are building and read it in a single step with the project files you need, by path (in a Next.js app at least `app/layout.tsx`, which mounts the providers) and, for an app, the starter files above. Every path you need is named here, in the bundle or in the task: listing folders to find them costs turns, and each turn re-sends the bundle. A bundle is complete: the rules, every component's props, types, hooks, gotchas (including how components such as Kbar behave), the quality bar and a gold example. Read one bundle, not two: a component another one adds is cheaper as its `ai/components/<Name>.json` slice.
2. Need a component the bundle does not list? Every bundle has the components in the `page.md` row; the Adds column names what each one carries on top. Read the `ai/components/<Name>.json` of anything else your page needs in that same step. A component the bundle lists has nothing more in its slice.
3. Nothing fits? Read `ai/bundles/page.md` (the rules and the common components) with the slices your page needs, in one step. `ai/catalog.json` names every component with its purpose.

With a bundle, reading `catalog.json`, `gotchas.json`, `functions.json`, other examples or `node_modules` only adds cost: what a page needs from them is in the bundle. Never open `ai/spec.json`: it is the full machine spec, for tooling.

<!-- tasks:start -->
| Bundle | For | Adds |
|---|---|---|
| `ai/bundles/marketing-hero.md` | Marketing hero: Headline with text effect, CTA pair, social proof logos, background effect | Background, RevealFx, LetterFx, LogoCloud, Line |
| `ai/bundles/pricing.md` | Pricing page: Three tiers, highlighted middle tier, feature comparison table, FAQ accordion | Background, MatrixFx, BlobFx, RevealFx, CountFx, SegmentedControl, Table, AccordionGroup |
| `ai/bundles/settings.md` | Settings page: Vertical section tabs, profile form, settings rows with one control each, grouped sub-settings, danger zone | Tabs, TabList, Tab, TabPanel, Form, Select, Setting, Tooltip, Switch, Slider, NumberInput, Checkbox, MediaUpload, Table, NavItem |
| `ai/bundles/dashboard.md` | Analytics dashboard: KPI stat cards, charts area, recent-activity list | Background, CountFx, StatusIndicator, Table, SegmentedControl, LineChart, BarChart, ChartHeader, RevealFx, Line, Drawer, NavItem |
| `ai/bundles/chat.md` | Chat UI: Message list with avatars, typing indicator, composer with send and attach, conversation list | ChatMessageList, ChatMessage, ChatComposer, TypingIndicator, ConversationItem, SplitView, EmojiPicker, Fade, Kbd, User, Line |
| `ai/bundles/auth.md` | Auth flow: Sign-up / login with social auth, email form, stacked dialog for OTP | OTPInput, Media, SmartLink, Line |
| `ai/bundles/roadmap.md` | Product roadmap: Kanban-style roadmap with status columns and task cards | Card, StatusIndicator, User, Scroller |
| `ai/bundles/list-page.md` | List / table page: A page of records: title with the primary action, a status filter, a searchable, sortable, paginated Table with status tags and row actions, and an empty state | SegmentedControl, Select, Table, Dropdown, Option, Map, MapMarkers, MapPin, MapPopup |
| `ai/bundles/editor.md` | Editor shell: A toolbar, a resizable two-pane split (layers and canvas) and a timeline spanning both — video editor, page builder, diff view | SplitView, Scrubber, ToggleButton, Media, MediaVideoPlayer |
| `ai/bundles/docs-page.md` | Docs or blog article: An MDX article: breadcrumb trail, title and summary, Markdown rendered through the /mdx component map, and an on-page heading nav | Breadcrumbs, HeadingNav, MdxHeading, Feedback, CodeBlock |
| `ai/bundles/app-shell.md` | App shell: Signed-in app frame shared by several routes: sidebar with nested nav groups and the current route highlighted, header with breadcrumb, account or workspace menu and command palette, phone drawer | Nav, NavGroup, NavItem, Drawer, Breadcrumbs, User, Dropdown, Option, Kbar, Kbd, Line, Table |
| `ai/bundles/page.md` | Any other page: The rules and the components nearly every page uses, with their types and gotchas. Read it with the `components/<Name>.json` slices your page adds, in one step | Column, Row, Grid, Heading, Text, Button, IconButton, Icon, Input, Textarea, Tag, Badge, Avatar, Dialog, Skeleton, VisuallyHidden; this bundle alone also has Switch, SegmentedControl, Select, Checkbox, Card |
<!-- tasks:end -->

Validate generated code: `npx once-ui-validate-ai-code path/to/file.tsx`. Without a bundle, app shells, sidebars and editors are in `ai/layouts.md`, and Pro blocks to compose from are listed in `ai/examples/blocks/manifest.json`.

## Phone apps

`@once-ui-system/native` has the same components and props for React Native, with its own harness for phone screens: `node_modules/@once-ui-system/native/AGENTS.md`. For an app on the web and on phones, build each from its own package's bundles and share the content and the theme options.

## Setup

`npx once-ui-init-agent` points a consumer app's AGENTS.md, CLAUDE.md and Cursor rules here. Without `node_modules`, use https://docs.once-ui.com/ai/manifest.json (may not match your installed version exactly).
