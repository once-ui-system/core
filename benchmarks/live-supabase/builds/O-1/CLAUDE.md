# CLAUDE.md

<!-- once-ui-agent-harness:start -->
## Once UI codegen harness

Before generating Once UI code, pick the task bundle below closest to what you are building and read it, with any
project files you need, in one step. A bundle is complete (rules, component props, types, gotchas and a gold example),
so write from it; open `ai/components/<Name>.json` only for a component it does not list, all in one step. When
nothing fits, start from `node_modules/@once-ui-system/core/AGENTS.md`. Never open `ai/spec.json`.

New signed-in app (sidebar, top bar, content panel)? Start from the working starter instead of writing the root
layout and shell: `cp -r node_modules/@once-ui-system/core/ai/starters/app/src/. src/`, then edit
`src/resources/app.ts` (name, user, nav) and `src/resources/once-ui.config.ts` (theme), and add pages under
`src/app/(app)/`. Details: "Starting an app" in `node_modules/@once-ui-system/core/AGENTS.md`.

| Bundle | For | Adds |
|---|---|---|
| `node_modules/@once-ui-system/core/ai/bundles/marketing-hero.md` | Marketing hero: Headline with text effect, CTA pair, social proof logos, background effect | Background, RevealFx, LetterFx, LogoCloud, Line |
| `node_modules/@once-ui-system/core/ai/bundles/pricing.md` | Pricing page: Three tiers, highlighted middle tier, feature comparison table, FAQ accordion | Background, MatrixFx, BlobFx, RevealFx, CountFx, SegmentedControl, Table, AccordionGroup |
| `node_modules/@once-ui-system/core/ai/bundles/settings.md` | Settings page: Vertical section tabs, profile form, settings rows with one control each, grouped sub-settings, danger zone | Tabs, TabList, Tab, TabPanel, Form, Select, Setting, SettingGroup, SettingAxes, InfoTip, Switch, Slider, NumberInput, Checkbox, MediaUpload, Table, NavItem |
| `node_modules/@once-ui-system/core/ai/bundles/dashboard.md` | Analytics dashboard: KPI stat cards, charts area, recent-activity list | Background, CountFx, StatusIndicator, Table, SegmentedControl, LineChart, BarChart, ChartHeader, RevealFx, Line, Drawer, NavItem |
| `node_modules/@once-ui-system/core/ai/bundles/chat.md` | Chat UI: Message list with avatars, typing indicator, composer with send and attach, conversation list | ChatMessageList, ChatMessage, ChatComposer, TypingIndicator, ConversationItem, SplitView, EmojiPickerDropdown, Fade, Kbd, User, Line |
| `node_modules/@once-ui-system/core/ai/bundles/auth.md` | Auth flow: Sign-up / login with social auth, email form, stacked dialog for OTP | PasswordInput, OTPInput, Media, SmartLink, Line |
| `node_modules/@once-ui-system/core/ai/bundles/roadmap.md` | Product roadmap: Kanban-style roadmap with status columns and task cards | Card, StatusIndicator, User, Scroller |
| `node_modules/@once-ui-system/core/ai/bundles/list-page.md` | List / table page: A page of records: title with the primary action, a status filter, a searchable, sortable, paginated Table with status tags and row actions, and an empty state | SegmentedControl, Select, Table, DropdownWrapper, Option |
| `node_modules/@once-ui-system/core/ai/bundles/editor.md` | Editor shell: A toolbar, a resizable two-pane split (layers and canvas) and a timeline spanning both — video editor, page builder, diff view | SplitView, Scrubber, ToggleButton, Media, MediaVideoPlayer |
| `node_modules/@once-ui-system/core/ai/bundles/docs-page.md` | Docs or blog article: An MDX article: breadcrumb trail, title and summary, Markdown rendered through the /mdx component map, and an on-page heading nav | Breadcrumbs, HeadingNav, MdxHeading, Feedback, CodeBlock |
| `node_modules/@once-ui-system/core/ai/bundles/app-shell.md` | App shell: Signed-in app frame shared by several routes: sidebar with nested nav groups and the current route highlighted, header with breadcrumb, account or workspace menu and command palette, phone drawer | Nav, NavGroup, NavItem, Drawer, Breadcrumbs, UserMenu, DropdownWrapper, Option, Kbar, Kbd, KeyTip, Line, Table |
| `node_modules/@once-ui-system/core/ai/bundles/page.md` | Any other page: The rules and the components nearly every page uses, with their types and gotchas. Read it with the `components/<Name>.json` slices your page adds, in one step | Column, Row, Grid, Heading, Text, Button, IconButton, Icon, Input, Textarea, Tag, Badge, Avatar, Dialog, Skeleton, VisuallyHidden; this bundle alone also has Switch, SegmentedControl, Select, Checkbox, Card |

Validate: `npx once-ui-validate-ai-code path/to/file.tsx`

In a Next.js app, import `LayoutProvider` from `@once-ui-system/core/next`, not the package root —
the root export renders links and images as plain `<a>` and `<img>`.

Remote fallback: https://docs.once-ui.com/ai/manifest.json
<!-- once-ui-agent-harness:end -->
