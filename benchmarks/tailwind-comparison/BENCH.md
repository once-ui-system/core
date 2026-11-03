# Once UI Bench

A fixed, versioned suite that scores how well an AI agent builds real apps with each UI system,
plus free measurements of what ships, rerun monthly and on every Once UI release so each system
can be tracked over time. It runs on this folder's runner (see [METHODOLOGY.md](./METHODOLOGY.md)
§11 for the 2026-11-03 entry that defines v1). Internal only: nothing here is a public claim
until Lorant approves the wording.

## Systems (arms)

| Arm | System | The agent gets |
| --- | --- | --- |
| A | Once UI core | Empty Next app with the providers mounted + the shipped `AGENTS.md` and `ai/` harness |
| S | Once UI Stack | The Stack scaffolder's dashboard surface (demo mode) + its `AGENTS.md` map and the installed Once UI harness |
| C | shadcn/ui | Every component installed + its docs, blocks and agent skill |
| D | Tailwind v4 | No library, no docs (lucide-react for icons) |
| M | MUI 9 | Official Next.js setup + its llms.txt docs (Material UI and MUI X) |
| K | Chakra UI 3 | Official Next.js setup, every CLI snippet + its llms.txt docs |
| T | Mantine 9 | Official Next.js setup + its llms.txt docs |

Every arm gets the same Next.js, React and TypeScript, the same system font stack, and
`maplibre-gl` + `react-map-gl` for the map task.

## Tasks (`prompts/v2/briefs.json`)

- **Lite** (monthly, each release): t1 app shell, t3 command bar, t5 team and members,
  t8 onboarding wizard, t9 rebrand.
- **Pro** (each major): t10 property listings with a map, t11 video editor with a timeline,
  t12 AI assistant workspace. Each names extra views (a dialog open, a clip selected, a filter
  open) that the gates screenshot at every width.
- **Full**: all of t1-t12.

## Scores (`runner/leaderboard.mjs`)

Build (API spend): pass@1, accepted within 3 repairs, blinded quality (6 axes, 0-100),
intentionality (1-5), cost per run, tokens per run, quality per dollar.
Design: arena Elo from blind pairwise judging (`runner/arena.mjs`), style discipline (distinct
font sizes, colours and spacing values per route; share of spacing on a 4 px grid).
Ship (free): JS and CSS KB gzip per route, CLS, long-task time, serious axe violations per route.

## Running it

```bash
cd benchmarks/tailwind-comparison
npm ci
git clone --filter=blob:none https://github.com/shadcn-ui/ui ../../../shadcn-src && git -C ../../../shadcn-src checkout c2a67849be260701852b0977ba15eb5f3a0ce2a4
git clone https://github.com/once-ui-system/stack ../../../stack-src && git -C ../../../stack-src checkout <config.json sources.stack.commit>
node runner/fetch-docs.mjs                       # or unpack a saved docs-src.tgz into work/docs-src
node runner/setup.mjs --once-version 3.0.0-beta.1 --shadcn-src ../../../shadcn-src --stack-src ../../../stack-src

export BENCH_TASKS=prompts/v2/tasks.json ANTHROPIC_API_KEY=… ANTHROPIC_WORKSPACE_ID=…
node runner/generate-api.mjs --out results/bench-v1 --tasks 1,3,5,8,9 --arms A,S,C,D,M,K,T --runs 2 --budget-usd 60
node runner/generate-api.mjs --out results/bench-v1 --tasks 10,11,12 --arms A,S,C,D,M,K,T --runs 1 --budget-usd 30
node runner/blind.mjs --results results/bench-v1 && node runner/rate-api.mjs --results results/bench-v1 && node runner/blind.mjs --results results/bench-v1 --unseal
node runner/arena.mjs --results results/bench-v1 --budget-usd 15 && node runner/arena.mjs --results results/bench-v1 --fit
node runner/leaderboard.mjs --results results/bench-v1 --tasks 1,3,5,8,9 --name lite
node runner/leaderboard.mjs --results results/bench-v1 --tasks 10,11,12 --name pro
```

Runs are resumable: rerunning a command skips runs whose `run.json` is final. Keep
`work/docs-src` as `results/<run>/docs-src.tgz` so a top-up run uses the same docs.
