# Once UI — AI generation eval suite

Fixed prompt set for measuring harness effectiveness. Run each task with and
without the harness (rules.md + spec.json), ideally across two models, and
score with the checklist below. Add a regression task whenever a new pitfall
is found in the wild.

## Tasks

1. **Analytics dashboard** — KPI stat cards (trend indicators), a line chart, a bar chart, recent-activity list. Tests: data components, `CountFx`, grid responsiveness.
2. **Settings page** — sidebar sections, profile form (avatar upload, inputs, selects), danger zone. Tests: form controls, `MediaUpload`, surface recipes.
3. **Pricing page** — three tiers, highlighted middle tier, feature comparison table, FAQ accordion. Tests: `Card`, `Badge`, `Table`, `Accordion`, proportional emphasis.
4. **Chat UI** — message list with avatars, streaming indicator, input bar with emoji picker, command palette hint. Tests: `EmojiPickerDropdown`, `Kbd`, `Spinner`, scroll containers.
5. **Marketing hero** — headline with text effect, CTA pair, social proof logos, background effect. Tests: effects usage (`LetterFx`/`TypeFx`/`RevealFx`, `Background`/`MatrixFx`/`BlobFx`), restraint.
6. **Auth flow** — login with password + OTP step in a stacked dialog. Tests: `Dialog` `stack`, `OTPInput`, `PasswordInput`, validation states.
7. **E-commerce product card grid** — image, price, tag, hover actions, skeleton loading state. Tests: `Card`, `Media`, `Skeleton`, `Tag`, hover patterns.
8. **Onboarding checklist** — progress bar, step list with status indicators, celebratory completion. Tests: `ProgressBar`, `StatusIndicator`, `CelebrationFx`.
9. **Data table page** — sortable table, filters row (segmented control, date range, search), pagination. Tests: `Table`, `SegmentedControl`, `DateRangePicker`, toolbar composition.
10. **User profile popover** — avatar trigger, `UserMenu`/`HoverCard` with stats and actions. Tests: overlay components, `AvatarGroup`.
11. **Changelog/timeline page** — versioned entries on a `Timeline`, tags per release, copyable code snippets. Tests: `Timeline`, `CodeBlock`, `InlineCode`.
12. **Feedback widget** — floating trigger, dialog with rating chips, textarea, toast on submit. Tests: `Chip` selection, `useToast`/`Feedback`, positioning.

## Scoring checklist (per task)

Mechanical (count occurrences):

- [ ] Compiles / no invented props or components
- [ ] Redundant-default props (`position="relative"`, `variant="primary"` on Button, ...) — target: 0
- [ ] Shorthand violations (`fillWidth fillHeight` instead of `fill`, `horizontal+vertical center` instead of `center`, `Flex direction=` instead of `Row`/`Column`) — target: 0
- [ ] `style={{}}` uses where a token prop exists — target: 0
- [ ] Raw HTML elements where a component exists (`img`, `a`, `button`) — target: 0
- [ ] Hex/rgb colors — target: 0
- [ ] Distinct Once UI components used — higher is better (task-appropriate)

Judgment (1–5):

- [ ] Proportionality: spacing rhythm, type scale, surface hierarchy look like real Once UI
- [ ] Component appropriateness: purpose-built components chosen over generic primitives
- [ ] Responsiveness: breakpoint props used where layout should adapt
- [ ] Restraint: effects enhance rather than dominate

## Pitfall log

Record every recurring failure here; each entry should become a rule in
`rules.md` or a gold example, plus stay in this list as a regression check.

| Date | Pitfall observed | Fix applied |
|------|------------------|-------------|
| 2026-06-12 | `position="relative"` written despite being default | rules.md #3 |
| 2026-06-12 | `fillWidth fillHeight` instead of `fill` | rules.md #2 |
| 2026-06-12 | `horizontal="center" vertical="center"` instead of `center` | rules.md #2 |
| 2026-06-12 | Only ~10 common components used, defaults only | rules.md #12–13 |
| 2026-06-12 | Section gaps too small (48), page feels cramped | rules.md #17 |
| 2026-06-12 | Section headings too small (`heading-strong-m`), hero undersized | rules.md #18 |
| 2026-06-12 | Testimonial quote (BlockQuote default) larger than section title | rules.md #19 |
| 2026-06-12 | Identical centered heading+subtitle on every section (dated); Tag+sparkle eyebrow | rules.md #20 |
| 2026-06-12 | Absolute Background missing `top="0" left="0"` → offset by parent padding | rules.md #21, recipes.md |
| 2026-06-12 | Gradient `width: 500` (125% of container); units misunderstood | rules.md #22 |
| 2026-06-12 | `brand-background-weak` glow at `opacity: 30` — invisible vs page | rules.md #23, recipes.md |
| 2026-06-12 | `RevealFx delay={index * 80}` (seconds!) and `translateY={16}` (16rem!) | rules.md #24, recipes.md #7 |
| 2026-06-12 | `LogoCloud` without `columns` → single-column stack | rules.md #25 |
| 2026-06-12 | No decorative components used beyond one gradient; flat result | recipes.md + rules.md #26 |
| 2026-06-12 | RevealFx on every section (dated, eye-grabbing); mount-timed animations finish off-screen | rules.md #27–29, recipes.md #7 |
| 2026-06-12 | Hero gradient clipped: ambient layer inside narrow `maxWidth` container with `overflow="hidden"` | rules.md #21b, recipes.md #1 |
| 2026-06-12 | Reveal on hero text fragments + lone highlighted card (incoherent grouping) | rules.md #28b |
| 2026-06-12 | `Card` used for static panels (tiers, testimonials, stats) | rules.md #12 |
| 2026-06-12 | Arbitrary `maxWidth` numbers; no container-width convention | rules.md #15 |
| 2026-06-12 | Design intent (style/layout/color/decoration/imagery) guessed instead of asked | rules.md "Before you build" |
| 2026-06-12 | Invented icon names (`more`, `bell`, `arrowRight`) | rules.md #14b, IconName list in spec.json |
| 2026-06-12 | `Badge title` + children rendered same text twice ("2 unread2") | rules.md #14c |
| 2026-06-12 | `Fade` wrapped the whole message list → washed-out content | rules.md #14d |
