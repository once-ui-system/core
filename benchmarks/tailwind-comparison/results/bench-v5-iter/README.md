# Iterative track, real-world set (2026-11-11)

Internal only. No public claim from these numbers.

- **Why:** Lorant 2026-11-10 (3.0 thread, "Iterative track" card). The one-shot gates were unfair in two ways. A broken className still passes, but a wrong typed prop fails the build. And nobody builds a real app in a single run. So in this track every agent gets the same tools a developer has (type-check, build, screenshots), within a fixed budget, and every app must really use its system.
- **Tasks:** the v4 real-world set, unchanged (`prompts/v4/tasks.json`): t201 vet front desk ("Pawpoint") and t202 wedding seating planner ("Seatwise"), with the same open style line.
- **Protocol** (`runner/iter-run.mjs`, `runner/iter-check.mjs`):
  - Each agent writes the app's files under `<run>/files/`.
  - The one shell command it may run is `iter-check`, at most 6 times. Each check copies the files into the arm's project and runs the type-check, `next build` and the render gates at phone, tablet and desktop width. It also runs the brief's interaction and named views, and the adherence check. It then prints the result with the screenshot paths, so the agent can open its own pages.
  - Whatever is in `files/` when the agent replies "done" is scored. A run is accepted only if those final files pass every gate and the adherence check.
- **Adherence check** (`runner/adherence.mjs`, thresholds fixed before the first run):
  - At least 60% of UI components must come from the system. Raw HTML controls (button, input, select, textarea, table, dialog, progress, meter) count against it.
  - At most 12 raw colour literals outside the arm's theme files.
  - At most 150 lines of custom stylesheet rules. Tokens, braces and at-rules are not counted.
  - The Tailwind arm has no component share, so only the two caps apply to it.
- **Runs:** 7 systems × 2 tasks × 3 runs, 42 apps, all accepted.
- **Generation:** Claude Code subagents on Sonnet 5.5, using plan usage, not API credit.
- **Rating:** the same blind API rater as v4. The rater saw only the final screenshots, never the checks. Cost $2.82 at list price.
- **Arm A** is the same 3.0-branch pack as v4 (`ed6465a6`, sha256 `b7a90904…c401`). The newer 3.0 head includes core#472, "app guidance from the real-world bench". That guidance was written from these two tasks, so measuring it here would score it on its own training examples. It needs fresh tasks. S is the Stack scaffold on core 2.6.0, as in v4.

## Scores

Quality and intentionality are from `leaderboard-iterative.md`, as medians of per-task medians. The v4 column is the one-shot round on the same tasks (`results/bench-v4-cc`).

| System | Quality v4 (one shot) | Quality v5 (iterative) | Intentionality v5 | First check passed | Checks used (mean of 6) | Minutes per run (median) |
|---|---|---|---|---|---|---|
| shadcn/ui | 75.0 | 75.0 | 4 | 5/6 | 2.8 | 17 |
| Tailwind (no library) | 75.0 | 75.0 | 4 | 5/6 | 3.0 | 18 |
| MUI | 75.0 | 75.0 | 4 | 1/6 | 3.7 | 11 |
| Chakra UI | 70.8 | 75.0 | 4 | 5/6 | 3.8 | 15 |
| Mantine | 72.9 | 72.9 | 3.5 | 0/6 | 4.3 | 18 |
| Once UI Stack | 72.9 | 70.8 | 4 | 3/6 | 3.2 | 16 |
| Once UI (3.0 branch) | 68.8 | 68.8 | 3 | 4/6 | 2.8 | 11 |

Once UI per run: t201 75 / 75 / 71, t202 62.5 / 62.5 / 75. Stack per run: t201 83 / 75 / 71, t202 67 / 62.5 / 71.

## Adherence

| System | Lowest system share | Most raw colours | Most custom CSS lines |
|---|---|---|---|
| Once UI | 100% | 0 | 0 |
| Once UI Stack | 96% | 0 | 67 |
| shadcn/ui | 94% | 9 | 4 |
| Tailwind | – | 11 | 15 |
| MUI | 100% | 4 | 0 |
| Chakra UI | 100% | 3 | 0 |
| Mantine | 100% | 8 | 99 |

The adherence check failed a check in five runs: Stack in two runs, and shadcn, Tailwind and Mantine in one each. Every one of those agents fixed it before replying. In v4, 5 of 6 Stack runs hand-wrote their CSS (103-176 classNames, 0-1 Once UI imports). Here every Stack app is at least 96% Once UI components.

## What it shows

- **Iteration barely moved quality.** Five of seven systems scored the same as one-shot. Chakra rose one step (70.8 to 75). Stack fell one step once it had to use Once UI instead of hand-written CSS.
- **Once UI is still last, for the same reason as in v4.** Intentionality was 3 on 5 of 6 runs, and the rater's notes still say "fairly generic". The agents had screenshots, but two of the three seating planners still clip the floor plan on tablet and phone, and the third is cramped on phone.
- **Reliability is no longer a Once UI weakness.** In v4, Once UI passed the gates first time in 2 of 6 runs. Here the first check passed in 4 of 6, and only 2 checks failed in all (both type errors). Once UI and MUI were also the fastest arms at a median of 11 minutes per run.
- **Many agents did not look.** Several agents passed a check and never opened the later screenshots, or left axe colour-contrast findings unfixed. Unlimited checks would not have helped them; the gap is judgement, not tooling.

## Audit

- **No run was void** under the §11 audit rule.
- **Bash use outside the check command:** several agents used Bash for things other than the check. They edited their own files with `sed` or Python, ran read-only `ls`, `grep` or `cat` inside the arm's sandbox, made directories, or piped the check through `grep` or `tail`. Some ran `iter-check --help`, which fails without using a check. All of these are allowed under the §11 rule and logged.
- **Sandbox edit:** t202 shadcn run 1 edited the sandbox's `project/app/globals.css` by mistake and then reverted it. The file was verified identical to the scaffold.
- **Missing interaction:** in t202 shadcn run 1, the gate's click on Table 3 timed out, so the rater saw no interaction or table-selected screenshot. The interaction gate records errors but does not fail a run, as in v4.
- **Brief data error, as in v4:** the "keep apart" rule lists g-29 and g-30 but its note names Sean and Ryan Doyle (g-30 and g-31). Agents split between following the ids and following the note. Every run got the same data.

## Reproduce

```bash
BENCH_TASKS=prompts/v4/tasks.json node runner/iter-run.mjs prompt --arm A --task 201 --run 1 --results results/bench-v5-iter
# a Claude Code subagent (model: sonnet) follows <run>/prompt.txt and replies "done"
BENCH_TASKS=prompts/v4/tasks.json node runner/iter-run.mjs finalize --arm A --task 201 --run 1 --results results/bench-v5-iter
BENCH_TASKS=prompts/v4/tasks.json node runner/blind.mjs --results results/bench-v5-iter
node runner/rate-api.mjs --results results/bench-v5-iter
BENCH_TASKS=prompts/v4/tasks.json node runner/blind.mjs --results results/bench-v5-iter --unseal
BENCH_TASKS=prompts/v4/tasks.json node runner/leaderboard.mjs --results results/bench-v5-iter --name iterative --out results/bench-v5-iter/leaderboard-iterative
```

Arm A for these runs: install the `ed6465a6` pack into `arms/once` and rebuild the sandbox. The committed tarball is unchanged.
