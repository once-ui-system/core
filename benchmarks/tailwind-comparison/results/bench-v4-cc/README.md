# Real-world app set, Claude Code track (2026-11-10)

Internal only. No public claim from these numbers.

- **Why:** Lorant 2026-11-10: the brand set is a good benchmark prompt but not a real one. Nobody asks an agent for a 2 px button radius. This set gives a specific use case and leaves the style open, to see what each system produces on its own.
- **Tasks** (`prompts/v4/tasks.json`), both picked because Stack has no template for them:
  - **t201 vet-front-desk ("Pawpoint"):** front desk for a small vet clinic. Routes `/` (today's schedule, check-in) and `/patients/p-104`. Interaction: check a patient in. View: new appointment dialog.
  - **t202 seating-planner ("Seatwise"):** wedding seating planner. Routes `/` (floor plan) and `/guests`. Interaction: click Table 3. View: Table 1 selected.
  - Style line, the same for every arm: "Style: up to you. It should look and feel like software the people above would pay for and use all day; no style guide is given, so the visual choices are yours."
- **Runs:** all 7 systems × 2 tasks × 3 runs, 42 apps, all accepted.
- **Generation:** Claude Code subagents on Sonnet 5.5, using plan usage, not API credit. Same protocol as `results/bench-v2-cc` (METHODOLOGY.md §7 and §11).
- **Rating:** the same blind API rater as Bench v1, about $2.9 at list price (927k input tokens, 7k output).
- **Not comparable with the API series:** the harness differs, and cost and tokens are left out.

## Scores

From `leaderboard-realworld-cc.md`, medians of per-task medians.

| System | Quality | Intentionality | Pass@1 | JS KB gz |
|---|---|---|---|---|
| MUI | 75.0 | 4 | 0% | 353 |
| shadcn/ui | 75.0 | 4 | 83% | 219 |
| Tailwind (no library) | 75.0 | 4 | 100% | 160 |
| Mantine | 72.9 | 3.5 | 50% | 314 |
| Once UI Stack | 72.9 | 4 | 100% | 398 |
| Chakra UI | 70.8 | 3.5 | 83% | 314 |
| Once UI (3.0 branch) | 68.8 | 3 | 33% | 240 |

Once UI per run: t201 71 / 71 / 71, t202 67 / 67 / 62. Stack per run: t201 71 / 71 / 83, t202 79 / 71 / 75.

## What it shows

- **Once UI looks stock when no style is given.** It scored 3 for intentionality on all 6 runs, the only system with no run above 3. The rater's notes say "fairly stock card-based design" and generic. No Once UI run changed the default theme in `providers.tsx`.
- **Stack scores mostly measure hand-written CSS.** In 5 of 6 Stack runs the agent wrote its own stylesheet (0-1 `@once-ui-system` imports, 103-176 `className`s per run). The one Stack run built from Once UI components (t201 run 2) looks like arm A and scored intentionality 3; the best run, t201 run 3, has no Once UI imports. Do not read S against A as "Once UI plus a shell".
- **Responsive layout of custom surfaces.** The Once UI seating floor plans were clipped on tablet and phone, and the Table 1 selected view showed no details.
- **Reliability.** Once UI passed on the first try in 2 of 6 runs. Most repairs were type errors from passing `padding` to `Text`, which the 3.0 `Text` does not accept. Stack and Tailwind passed every run first time; MUI needed a repair on every run.
- **Quality is close.** The spread is 69-75 on a coarse 1-5 scale, so one rating point moves a system several places.

## Audit

- **No run was void** under the §11 audit rule.
- t201 MUI run 1 edited its own output with a short Bash/Python script during two repairs (allowed, logged).
- t202 Chakra run 2 and t202 MUI run 3 ran `echo skip`; four runs wrote placeholder text to their scratchpad. No run read outside its sandbox.
- t202 Mantine run 3 left a stray `parts/data.ts` that was not delivered.
- t202 Chakra run 2 was first gated while its agent was still editing; that gate was discarded and the run regated. A final check found no attempt newer than its `gates.json`.
- **Brief data error:** the t202 "keep apart" rule lists guests g-29 and g-30, but its note names Sean and Ryan (g-30 and g-31). Every run got the same data, so it is kept.

## Reproduce

```bash
BENCH_TASKS=prompts/v4/tasks.json node runner/pilot-prompt.mjs --arm A --task 201 --run 1 --results results/bench-v4-cc
BENCH_TASKS=prompts/v4/tasks.json node runner/pilot-gate.mjs --results results/bench-v4-cc
BENCH_TASKS=prompts/v4/tasks.json node runner/leaderboard.mjs --results results/bench-v4-cc --name realworld-cc --out results/bench-v4-cc/leaderboard-realworld-cc
```

Arm A tarball: `pnpm pack` of `packages/core` at `ed6465a6` (feat/3-0-breaking-cleanup), sha256 `b7a90904a70ec965462880912f85af2f0ead526bbfb9792acf5a91e7a6c4c401`. S is the Stack scaffold on core 2.6.0.
