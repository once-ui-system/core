# @once-ui-system/core — agent harness

This package ships an agent-first codegen harness under `ai/`, next to this file. Use it when **writing Once UI code**, not full MDX documentation pages. Paths below are relative to this file (in an app: `node_modules/@once-ui-system/core/`).

## Starting an app

A new signed-in app (sidebar, top bar, content panel) starts from `ai/starters/app/`: a working Next.js App Router setup with Once UI's CSS, fonts, providers and theme in `src/app/layout.tsx`, the shell mounted once in `src/app/(app)/layout.tsx`, and two pages. Copy it over the create-next-app files, then edit it rather than rewriting it:

```bash
cp -r node_modules/@once-ui-system/core/ai/starters/app/src/. src/ && rm -f src/app/page.module.css src/app/globals.css
```

No `src/` folder? Copy into the project root instead.

- `src/resources/app.ts`: product name, user and nav. The sidebar, breadcrumb and ⌘K palette all read it. Each nav href needs a page under `src/app/(app)/`; copy `home/page.tsx`.
- `src/resources/once-ui.config.ts`: brand, accent, neutral and `defaultTheme` (`theme` itself stays `"system"`, or the theme switch stops working).
- `src/components/AppShell.tsx`: the frame. Change it only to change the frame; it already covers the app-shell bundle's quality bar.

Then build each page from the bundle below that fits it.

## Writing a page or feature

Every file you read is sent again on every later turn, so read what you need in one step, then write.

1. Pick the bundle below closest to what you are building and read it, together with any project files you need (in a Next.js app at least `app/layout.tsx`, which mounts the providers), in a single step. Open those project files by path: listing their folder first costs a turn, and every turn re-sends the bundle. A bundle is complete: the rules, every component's props, types, gotchas, the quality bar and a gold example. Then write the code.
2. Need a component the bundle does not list? Every bundle has the components in the `page.md` row; the Adds column names what each one carries on top. Read the `ai/components/<Name>.json` of anything else your page needs in that same step, not after the bundle.
3. Nothing fits? Read `ai/bundles/page.md` (the rules and the common components) with the `ai/components/<Name>.json` slices your page needs, in one step. `ai/catalog.json` names every component with its purpose.

Never open `ai/spec.json`: it is the full machine spec, for tooling.

<!-- tasks:start -->
| Bundle | For | Adds |
|---|---|---|
| `ai/bundles/marketing-hero.md` | Marketing hero: Headline with text effect, CTA pair, social proof logos, background effect | Background, RevealFx, LetterFx, LogoCloud, Line |
| `ai/bundles/pricing.md` | Pricing page: Three tiers, highlighted middle tier, feature comparison table, FAQ accordion | Background, MatrixFx, BlobFx, RevealFx, CountFx, SegmentedControl, Table, AccordionGroup |
| `ai/bundles/settings.md` | Settings page: Vertical section tabs, profile form, settings rows with one control each, grouped sub-settings, danger zone | Tabs, TabList, Tab, TabPanel, Form, Select, Setting, SettingGroup, SettingAxes, InfoTip, Switch, Slider, NumberInput, Checkbox, MediaUpload, Table, NavItem |
| `ai/bundles/dashboard.md` | Analytics dashboard: KPI stat cards, charts area, recent-activity list | Background, CountFx, StatusIndicator, Table, SegmentedControl, LineChart, BarChart, ChartHeader, RevealFx, Line, Drawer, NavItem |
| `ai/bundles/chat.md` | Chat UI: Message list with avatars, typing indicator, composer with send and attach, conversation list | ChatMessageList, ChatMessage, ChatComposer, TypingIndicator, ConversationItem, SplitView, EmojiPickerDropdown, Fade, Kbd, User, Line |
| `ai/bundles/auth.md` | Auth flow: Sign-up / login with social auth, email form, stacked dialog for OTP | PasswordInput, OTPInput, Media, SmartLink, Line |
| `ai/bundles/roadmap.md` | Product roadmap: Kanban-style roadmap with status columns and task cards | Card, StatusIndicator, User, Scroller |
| `ai/bundles/list-page.md` | List / table page: A page of records: title with the primary action, a status filter, a searchable, sortable, paginated Table with status tags and row actions, and an empty state | SegmentedControl, Select, Table, DropdownWrapper, Option |
| `ai/bundles/editor.md` | Editor shell: A toolbar, a resizable two-pane split (layers and canvas) and a timeline spanning both — video editor, page builder, diff view | SplitView, Scrubber, ToggleButton, Media, MediaVideoPlayer |
| `ai/bundles/docs-page.md` | Docs or blog article: An MDX article: breadcrumb trail, title and summary, Markdown rendered through the /mdx component map, and an on-page heading nav | Breadcrumbs, HeadingNav, MdxHeading, Feedback, CodeBlock |
| `ai/bundles/app-shell.md` | App shell: Signed-in app frame shared by several routes: sidebar with nested nav groups and the current route highlighted, header with breadcrumb, account or workspace menu and command palette, phone drawer | NavGroup, NavItem, Drawer, Breadcrumbs, UserMenu, DropdownWrapper, Option, Kbar, Line, Table |
| `ai/bundles/page.md` | Any other page: The rules and the components nearly every page uses, with their types and gotchas. Read it with the `components/<Name>.json` slices your page adds, in one step | Column, Row, Grid, Heading, Text, Button, IconButton, Icon, Input, Textarea, Tag, Badge, Avatar, Dialog, Skeleton, VisuallyHidden; this bundle alone also has Switch, SegmentedControl |
<!-- tasks:end -->

Validate generated code: `npx once-ui-validate-ai-code path/to/file.tsx`. Without a bundle, app shells, sidebars and editors are in `ai/layouts.md`, and Pro blocks to compose from are listed in `ai/examples/blocks/manifest.json`.

## Imports

- Most things come from `@once-ui-system/core`. Charts come from `/data`, `CodeBlock` from `/code`, `MediaUpload` from `/media`, the MDX map from `/mdx`, `defineConfig` from `/config`; `ai/manifest.json` → `imports` lists every entry point with its exports.
- In a Next.js app, import `LayoutProvider` from `@once-ui-system/core/next`: the root export renders links and images as plain `<a>` and `<img>`. The OG route handlers come from there too.

## Setup and remote fallback

`npx once-ui-init-agent` writes AGENTS.md, CLAUDE.md and a Cursor rule into a consumer app. Without `node_modules`, use https://docs.once-ui.com/ai/manifest.json (may not match your installed version exactly).
