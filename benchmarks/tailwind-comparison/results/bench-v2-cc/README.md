# Bench v2 brand set, Claude Code track (2026-11-10)

Internal only. No public claim from these numbers.

- **Tasks:** t101-t103, the SaaS shell (t1) in three brand sheets: ledger (teal, serif, light, compact), pop (pink, rounded, light, airy) and signal (orange, mono, dark, balanced).
- **Runs:** all 7 systems × 3 brands × 3 runs, 63 apps.
- **Generation:** Claude Code subagents on Sonnet 5.5, using the plan's session usage and not API credit (METHODOLOGY.md §7 and the 2026-11-10 entry in §11).
- **Rating:** the same blind API rater as Bench v1.
- **Not comparable with the API series:** the harness differs, and cost and tokens are left out.

## Scores

From `leaderboard-brand-cc.md`, medians of per-task medians.

| System | Quality | Pass@1 | Brand adherence | Brand range | JS KB gz |
|---|---|---|---|---|---|
| shadcn/ui | 83.3 | 100% | 100% | 67% | 207 |
| Once UI Stack | 83.3 | 78% | 60% | 44% | 391 |
| Chakra UI | 83.3 | 56% | 80% | 89% | 283 |
| MUI | 79.2 | 44% | 100% | 67% | 285 |
| Tailwind (no library) | 79.2 | 100% | 75% | 56% | 151 |
| Mantine | 79.2 | 22% | 80% | 67% | 266 |
| Once UI (3.0 branch) | 75.0 | 100% | 60% | 56% | 239 |

Brand adherence per brand:

| System | Ledger | Pop | Signal |
|---|---|---|---|
| Once UI | 80% | 60% | 40% |
| Once UI Stack | 80% | 60% | 60% |
| shadcn/ui | 100% | 80% | 100% |
| Tailwind | 100% | 75% | 75% |
| MUI | 100% | 80% | 100% |
| Chakra UI | 100% | 80% | 80% |
| Mantine | 80% | 80% | 60% |

## What it shows

- **Brand colour on fills.** Once UI and Stack apps almost never put the brand colour on a filled element. 1 of 18 home pages did, against 8 of 9 for shadcn.
  - This happens even when the config is exactly right. For example, t101 Once UI run 1 has `brand: "custom"`, `brandSeed: "#0F766E"` and `solid: "color"`.
  - The cause is the generated home pages. They have no solid primary button, and the current navigation item is drawn in neutral grey. The brief asks for the brand colour on the current navigation item.
  - The other systems put their primary colour on the selected item by default.
- **Radius.** Once UI apps on the signal brand used a 20 px button radius where the sheet asks for 4 px. Stack kept 4 px.
- **Reliability.** Once UI, shadcn and Tailwind passed every gate on the first try on all three brands. Stack's misses were type errors from a `brandScale` prop and a background token that core 2.6 does not have.
- **The 4 px grid metric.** This metric reads 0% for Once UI and Stack on the light brands. Both set density through the global `scaling` option (90 for compact, 105 for airy), which scales every spacing value off the 4 px grid. That is a metric artefact, not sloppy spacing. On the balanced brand (scaling 100) Once UI reads 46-71% and Stack about 90%.
- **Quality.** Rater quality is close across systems: 75-83 on a coarse 1-5 scale.

## Audit

- **No run was void.** The audit rule was fixed before rating (METHODOLOGY.md §11).
- **Read-only shell use:** 9 runs used read-only shell commands (`ls`, `grep`, `head`) inside their own sandbox.
- **Edits of own output:** 9 runs edited their own output file with Edit, `sed` or a short Python string replace.
- **Reruns:** two runs were first rerun under the stricter rule and then restored. The discarded reruns are in `void/discarded-reruns/` and are not scored.
- **Where the details are:** per-run tool use is in each `usage.json` under `audit`, and the decisions are in `work/cc-void.txt` (local).

## Reproduce

```bash
BENCH_TASKS=prompts/v3/tasks.json node runner/pilot-prompt.mjs --arm A --task 101 --run 1 --results results/bench-v2-cc
BENCH_TASKS=prompts/v3/tasks.json node runner/pilot-gate.mjs --results results/bench-v2-cc
BENCH_TASKS=prompts/v3/tasks.json node runner/leaderboard.mjs --results results/bench-v2-cc --name brand-cc --out results/bench-v2-cc/leaderboard-brand-cc
```

Arm A tarball: `pnpm pack` of `packages/core` at `f95115a7` (feat/3-0-breaking-cleanup), sha256 `3331adc7da1c4aa9e51dad745edba9894ff08bc41ec6d95d55fbce434c9d4d9b`.
