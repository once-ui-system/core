# @once-ui-system/core — agent harness

This package ships an agent-first codegen harness under `ai/`, next to this file. Use it when **writing Once UI code**, not full MDX documentation pages. Paths below are relative to this file (in an app: `node_modules/@once-ui-system/core/`).

## Starting an app

A new signed-in app (sidebar, top bar, content panel) starts from `ai/starters/app/`: a working Next.js App Router setup with Once UI's CSS, fonts, providers and theme in `src/app/layout.tsx`, the shell mounted once in `src/app/(app)/layout.tsx`, and two pages. Copy it over the create-next-app files, then edit it rather than rewriting it:

```bash
cp -r "$(node -p "require('path').dirname(require.resolve('@once-ui-system/core/package.json'))")/ai/starters/app/src/." src/ && rm -f src/app/page.module.css src/app/globals.css
```

The `node -p` part finds the installed package wherever it is, so the copy also works in an npm or pnpm workspace that hoists it out of the app's own `node_modules`.

No `src/` folder? Copy into the project root instead.

Can't run shell commands (you can only read files and reply with code)? Then nothing was copied, and an import of `AppShell` or `resources/app` breaks the build. Write the starter files your code imports (`components/AppShell.tsx`, `resources/app.ts`) in your reply, taking their content from `ai/starters/app/src/`, keep the project's own `app/layout.tsx`, and import only files you write or have opened in the project.

The copy takes `src/` only. Keep the project's own `next.config` (with whatever create-next-app put there, such as `cacheComponents`) and add one entry to it, `experimental.optimizePackageImports: ["@once-ui-system/core"]`, as `ai/starters/app/next.config.ts` does; do not replace the file with the starter's. Without it, every route that imports the package root from a server component ships about 110 kB of extra JavaScript under webpack. Under Turbopack (the default for `next build` in Next 16) that setting does nothing and is not needed: the package's entry points list their exports by name, so importing from the package root ships only the components a route uses. Each component's own path, `@once-ui-system/core/components/Button`, also works, as the starter's layout and pages show.

- `src/resources/app.ts`: product name, user and nav. The sidebar, breadcrumb and ⌘K palette all read it. Each nav href needs a page under `src/app/(app)/`; copy `home/page.tsx`.
- `src/resources/once-ui.config.ts`: brand, accent, neutral and `defaultTheme`, which is what a first visit sees: the starter's `"system"` follows the device, `"dark"` or `"light"` opens in that theme whatever the device says. `theme` itself stays `"system"`, or the theme switch stops working. Primary buttons take the brand colour only with `solid: "color"`; the starter's `"contrast"` draws them black or white whatever the brand. An exact brand colour is `brand: "custom", brandSeed: "#0F766E"` with your hex: that colour is step 500, which every brand solid uses in both themes, and the other steps are generated around it, so brand text stays readable. Show the brand on the page you are on with `<Nav tone="brand">`, which tints the current NavItem (the default is a grey fill). Use `brandScale` only for a brand book that fixes every shade, and number it dark to light (100 darkest, 1200 lightest, the reverse of Tailwind).
- `src/components/AppShell.tsx`: the frame. Change it only to change the frame; it already covers the app-shell bundle's quality bar.

Set the theme before the first page; the starter's gray, blue and `solid: "contrast"` read as unbranded. In `once-ui.config.ts` pick `brand` (or `brandSeed`), `neutral` and `solid: "color"`, and in `layout.tsx` give `--font-heading` its own family. An app used all day also sets `density: "compact"` and `border: "conservative"`. Then build each page from the bundle below that fits it.

## Writing a page or feature

Every file you read is sent again on every later turn, so read what you need in one step, then write.

1. Pick the bundle below closest to what you are building and read it, together with any project files you need (in a Next.js app at least `app/layout.tsx`, which mounts the providers), in a single step. Open those project files by path: listing their folder first costs a turn, and every turn re-sends the bundle. A bundle is complete: the rules, every component's props, types, gotchas, the quality bar and a gold example. Read one bundle, not two: a second one doubles what every later turn re-sends, and a component it adds is cheaper as its `ai/components/<Name>.json` slice. Then write the code.
2. Need a component the bundle does not list? Every bundle has the components in the `page.md` row; the Adds column names what each one carries on top. Read the `ai/components/<Name>.json` of anything else your page needs in that same step, not after the bundle.
3. Nothing fits? Read `ai/bundles/page.md` (the rules and the common components) with the `ai/components/<Name>.json` slices your page needs, in one step. `ai/catalog.json` names every component with its purpose.

Never open `ai/spec.json`: it is the full machine spec, for tooling.

<!-- tasks:start -->
| Bundle | For | Adds |
|---|---|---|
| `ai/bundles/marketing-hero.md` | Marketing hero: Headline with text effect, CTA pair, social proof logos, background effect | Background, RevealFx, LetterFx, LogoCloud, Line |
| `ai/bundles/pricing.md` | Pricing page: Three tiers, highlighted middle tier, feature comparison table, FAQ accordion | Background, MatrixFx, BlobFx, RevealFx, CountFx, SegmentedControl, Table, AccordionGroup |
| `ai/bundles/settings.md` | Settings page: Vertical section tabs, profile form, settings rows with one control each, grouped sub-settings, danger zone | Tabs, TabList, Tab, TabPanel, Form, Select, Setting, Tooltip, Switch, Slider, NumberInput, Checkbox, MediaUpload, Table, NavItem |
| `ai/bundles/dashboard.md` | Analytics dashboard: KPI stat cards, charts area, recent-activity list | Background, CountFx, StatusIndicator, Table, SegmentedControl, LineChart, BarChart, ChartHeader, RevealFx, Line, Drawer, NavItem |
| `ai/bundles/chat.md` | Chat UI: An assistant or team chat: conversation list, thread with a typing or working state, composer with send and attach, the assistant's Mascot, every loading, empty and error state | ChatMessageList, ChatMessage, ChatComposer, TypingIndicator, ConversationItem, SplitView, EmojiPicker, Fade, Kbd, User, Line, Mascot, Logo, WorkingIndicator, Feedback |
| `ai/bundles/auth.md` | Auth flow: Sign-up / login with social auth, email form, stacked dialog for OTP | OTPInput, Media, SmartLink, Line |
| `ai/bundles/roadmap.md` | Product roadmap: Kanban-style roadmap with status columns and task cards | Card, StatusIndicator, User, Scroller |
| `ai/bundles/list-page.md` | List / table page: A page of records: title with the primary action, a status filter, a searchable, sortable, paginated Table with status tags and row actions, and an empty state | SegmentedControl, Select, Table, Dropdown, Option, Map, MapMarkers, MapPin, MapPopup |
| `ai/bundles/editor.md` | Editor shell: A toolbar, a resizable two-pane split (layers and canvas) and a timeline spanning both — video editor, page builder, diff view | SplitView, Scrubber, ToggleButton, Media, MediaVideoPlayer, Feedback |
| `ai/bundles/docs-page.md` | Docs or blog article: An MDX article: breadcrumb trail, title and summary, Markdown rendered through the /mdx component map, and an on-page heading nav | Breadcrumbs, HeadingNav, MdxHeading, Feedback, CodeBlock |
| `ai/bundles/app-shell.md` | App shell: Signed-in app frame shared by several routes: sidebar with nested nav groups and the current route highlighted, header with breadcrumb, account or workspace menu and command palette, phone drawer | Nav, NavGroup, NavItem, Drawer, Breadcrumbs, User, Dropdown, Option, Kbar, Kbd, Line, Table |
| `ai/bundles/map-app.md` | Map app: A map-first app: full-bleed Map with floating panels for the list and the selected item, markers that cluster, areas, filters, and every loading, empty and error state | Map, MapMarkers, MapPin, MapPopup, MapCircle, Card, SegmentedControl, Timeline, Logo, Feedback, Drawer |
| `ai/bundles/page.md` | Any other page: The rules and the components nearly every page uses, with their types and gotchas. Read it with the `components/<Name>.json` slices your page adds, in one step | Column, Row, Grid, Heading, Text, Button, IconButton, Icon, Input, Textarea, Tag, Badge, Avatar, Dialog, Skeleton, VisuallyHidden; this bundle alone also has Switch, SegmentedControl, Select, Checkbox, Card |
<!-- tasks:end -->

Validate generated code: `npx once-ui-validate-ai-code path/to/file.tsx`. Without a bundle, app shells, sidebars and editors are in `ai/layouts.md`, and Pro blocks to compose from are listed in `ai/examples/blocks/manifest.json`.

## Build it to ship, even when the brief doesn't ask

Most briefs never mention data, states or a brand; every one expects them. Every bundle's rules spell this out, and the validator checks it:

- **Use what ships.** Before writing a component of your own, check `ai/catalog.json`. A brand mark is `Logo`. An assistant or character is `Mascot`, never a hand-drawn SVG. Uploads go through `MediaUpload` or `ChatComposer attach`. Places go on `Map`, and steps or history go in `Timeline`.
- **Backend-ready.** Write a `lib/` data layer of typed async functions over mock data with a short delay. Screens call those functions, never the mock array.
- **Every state.** A screen that loads data shows loading (Skeleton), empty, error (Feedback with Retry) and filled. A write is optimistic, and rolls back with a danger toast when it fails.
- **Designed, not stock.** One idea carries the screen: a map app is the map with panels floating over it, and an assistant chat has the Mascot's face. The brand is identity (Logo, Mascot colour, Nav tone), not a fill on every button.

## Phone apps

`@once-ui-system/native` has the same components and props for React Native, with its own harness for phone screens: `node_modules/@once-ui-system/native/AGENTS.md`. For an app on the web and on phones, build each from its own package's bundles and share the content and the theme options.

## Setup

`npx once-ui-init-agent` points a consumer app's AGENTS.md, CLAUDE.md and Cursor rules here. Without `node_modules`, use https://docs.once-ui.com/ai/manifest.json (may not match your installed version exactly).
