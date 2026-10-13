# Full run on 2.1.0-rc.0: Once UI vs Tailwind

> **rc.0, not for public claims.** This is the pre-registered full run on the release
> candidate. The claim run is the repeat on the final `2.1.0` (`results/full-2.1.0/`).
> Every number below is reproducible from `results/full-rc0/` with the scripts in
> `runner/`. The method is in [`../METHODOLOGY.md`](../METHODOLOGY.md).

- **Date:** 2026-10-13. **Model:** `claude-sonnet-5-5` via the API (`runner/generate-api.mjs`),
  thinking `between_tools`, effort `high`, default temperature.
- **Once UI:** published `@once-ui-system/core@2.1.0-rc.0`, tarball sha256 `13399e658234f5f2…`
  (full hash in `full-rc0/context-manifest.json`). **shadcn/ui:** `c2a6784`.
- **Tasks:** all 12. **Arms:** A Once UI + harness · B Once UI from memory · C Tailwind v4 +
  shadcn/ui + its docs and agent skill · D Tailwind v4 from memory (+ lucide-react).
- **Runs:** 240 (12 × 4 × 5), all accepted within 3 repair rounds. No runs voided.
- **Spend:** about $98 at list prices, uncached ($94.1 generation, $3.5 rating). That's
  above the $55 estimate, because arm A read far more harness docs than the pilot suggested
  (see below), and it's inside the $110 budget.

## Headline numbers (A vs C, the pre-registered primary comparison)

Reduction = 1 − A ÷ C per task (median of 5 runs), so a positive number means Once UI used less.

| Metric | Median of tasks | Range | Tasks where A < C | 95% bootstrap CI |
|---|---|---|---|---|
| **Code tokens**, page only, normalised (exact `count_tokens`) | **20.6%** | −24% to 54% | 9/12 | 3% to 33% |
| Code bytes, normalised | 18.7% | −33% to 51% | 9/12 | 0% to 30% |
| Code lines, normalised | 12% | −40% to 49% | 8/12 | −7% to 20% |
| Visible output tokens per run | −9% | −46% to 35% | 4/12 | −30% to 3% |
| **Total tokens per run** (exact input net of overhead + output) | **−717%** | −1842% to −97% | 0/12 | −1078% to −464% |
| Cost per run, prefix caching assumed (secondary) | −263% | −495% to −87% | 0/12 | −367% to −165% |

Per-task code-token reductions, tasks 1–12: −2, 54, −2, 28, 44, 31, 7, 21, 35, 18, 20, −24 (%).

### Claim conditions, A vs C (METHODOLOGY §5.1), copied verbatim from `full-rc0/tables.md`

| Metric | 1. CI lower bound > 0 | 2. X < Y on ≥ 9 tasks | 3. holds without tasks 1, 5, 8 | 4. pass rate within 10 pp | 5. ratings within 0.5 | Claim allowed |
|---|---|---|---|---|---|---|
| Visible output tokens (proxy) | **no** | **no** (4/12) | **no** | yes | yes | no |
| Total tokens, net of Claude Code overhead (exact input + proxy output) | **no** | **no** (0/12) | **no** | yes | yes | no |
| Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | yes | yes (9/12) | yes | yes | yes | **yes** |
| Code lines, normalised | **no** | **no** (8/12) | yes | yes | yes | no |
| Code bytes, normalised | yes | yes (9/12) | yes | yes | yes | **yes** |

### Claim wording (METHODOLOGY §5.2), filled in for rc.0 only

> **Code:** "…and wrote a median **20%** less code: tokens of the formatted page,
> comments removed (per-task range **−24%** to **54%**). shadcn/ui additionally copied a
> median **467** lines of component source into each project."

The §5.2 code sentence starts with "…and", as a continuation of the output-token sentence,
which is **not** allowed here. A standalone version would need its own wording, approved by
Lorant. §5.2 has no sentence for code bytes, so that one stays unworded.

**What the run says:**

1. **Less code: holds, but smaller than the pilot.** A wrote a median 20.6% fewer code tokens than C
   (pilot: 40% on 3 tasks). It's driven by tasks 2, 5, 6 and 9. On tasks 1, 3 and 12 it's flat or
   reversed. The bytes claim only just clears condition 1 (CI lower bound rounds to 0%).
2. **Fewer output tokens: not supported.** A generated a median 9% *more* visible output than C.
3. **Total tokens: the opposite, and worse than the pilot.** A's median net input was about
   410k–620k tokens per run, against 21k–312k for C. A used about 8× C's total tokens.
4. **Quality.** Conditions 4 and 5 pass as written: every arm was accepted 60/60, and every arm's
   median blinded rating is 4 / 4 / 4 / 5. But see the threats below.

## Per-arm detail

Full per-task tables are in [`full-rc0/tables.md`](./full-rc0/tables.md).

| | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| Accepted / first-attempt pass | 60/60 · **35/60** | 60/60 · **30/60** | 60/60 · 55/60 | 60/60 · 54/60 |
| First-attempt failures | typecheck 22, render 3 | typecheck 28, render 2 | typecheck 5 | render 4, typecheck 2 |
| API calls per run (median range over tasks) | 9–13 | 5–8 | 5–10 | 4–5 |
| Docs files read per run (median range over tasks) | 15–29 | 0 | 1–9 | 0 |
| Cost per run, uncached (median range over tasks) | $0.70–$1.40 | $0.08–$0.23 | $0.10–$0.75 | $0.06–$0.14 |
| Blinded rating, median (polish / completeness / responsiveness / restraint) | 4 / 4 / 4 / 5 | 4 / 4 / 4 / 5 | 4 / 4 / 4 / 5 | 4 / 4 / 4 / 5 |
| Blinded rating, mean (same axes; descriptive only) | 3.67 / 3.60 / 3.68 / 4.42 | 3.90 / 3.83 / 3.80 / 4.85 | 4.00 / 3.97 / 3.88 / 4.90 | 3.93 / 4.02 / 3.87 / 4.85 |
| Once UI `validate-ai-code` issues per page | median 1 (0–3) | median 4 (1–15) | – | – |

The validator counts come from `validate-ai-code` `46be018f1a0f7b9d`, which is stricter than the
pilot's, so don't compare them with the pilot.

The harness effect (A vs B) is mixed. It cut code tokens by a median 23% (11/12 tasks) and
validator issues from 4 to 1. It only raised first-attempt pass from 30 to 35 of 60, and it
multiplied total tokens about 17×.

## Findings for the Once UI harness (not benchmark results)

- **`spec.json` is still the largest harness cost.** The rc.0 fix moved icon names into
  `catalog.json`, but `docs/ai/spec.json` was still read in 50 of 60 arm-A runs. It accounts for
  47% of all characters arm A read (6.6M of 13.8M). Next come `catalog.json` (17%) and component
  slices (16%, 701 reads). The model finds it by listing `docs/ai/`, and `rules.compact.md` still
  points there for `functions`/`importFrom`.
- **Arm A's first attempts fail on types.** 22 of A's 25 first-attempt failures were typecheck
  failures, against 5 for C.

## Protocol incidents

- **Setup (`runner/setup.mjs`):** `npm install` in `arms/once` failed with EINTEGRITY, because the
  lockfile kept the 2.0.0 tarball's integrity for the `file:` dependency. setup now drops that one
  lock entry before installing, and npm re-records it (`arms/once/package-lock.json` is
  committed). Nothing measured changed.
- **API access:** the API key is not scoped to a workspace. The runner now sends
  `anthropic-workspace-id` when `ANTHROPIC_WORKSPACE_ID` is set (`generate-api.mjs`,
  `metrics.mjs`, `rate-api.mjs`). No request parameter changed.
- **Report (`runner/report.mjs`):** "Docs files read" counted only Claude Code's `Read` tool, so it
  showed 0 for every API run. It now counts the API runner's `read_file` too. It's descriptive and
  not part of any claim condition.
- The generation process hit this session's 2-hour background limit at 231/240 runs and was
  resumed with the same command. The runner skips finished runs, so nothing was regenerated.

## Threats to validity

- **Ratings hide a gap in the means.** Condition 5 is defined on medians, and every median ties at
  4/4/4/5. A's mean restraint is 4.42 against C's 4.90, and A trails C by 0.2–0.5 on every axis.
  A stricter quality condition could fail.
- **First-attempt pass differs a lot** (A 35/60, C 55/60). Condition 4 counts acceptance within 3
  repairs, which all arms reach. Repairs cost tokens, and those are counted in total tokens.
- **Single rater model.** All 240 ratings come from one blinded `claude-sonnet-5-5` call per run.
- **rc.0, not 2.1.0.** Any harness change between rc.0 and 2.1.0 (for example the `spec.json`
  routing above) changes A's totals. Claims must come from the 2.1.0 run.
