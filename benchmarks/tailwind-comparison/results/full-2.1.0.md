# Claim run on 2.1.0: Once UI vs shadcn/ui (trimmed)

> **Internal until Lorant approves any public use.** This is the pre-registered claim run on
> the published `2.1.0`, trimmed to the primary pair and 3 runs per task because of budget
> (METHODOLOGY §5 and §11, logged before the first call). Every number below is reproducible
> from `results/full-2.1.0/` with the scripts in `runner/`.

- **Date:** 2026-10-15. **Model:** `claude-sonnet-5-5` via the API, thinking `between_tools`,
  effort `high`, default temperature (unchanged from rc.0).
- **Once UI:** published `@once-ui-system/core@2.1.0`, tarball sha256 `b5f5cd6b80f57e8c…`
  (full hash in `full-2.1.0/context-manifest.json`). **shadcn/ui:** `c2a6784`.
- **Arms:** A Once UI + the 2.1.0 AI harness · C Tailwind v4 + shadcn/ui + its docs and skill.
  B and D were not run (§5); their rc.0 numbers stay internal.
- **Runs:** 72 (12 tasks × 2 arms × 3), all accepted within 3 repair rounds. None voided.
  Screenshots waited for animations to settle (§11, 2026-10-14).
- **Spend:** about $30.4 at list prices, uncached ($29.4 generation, $1.1 rating).

## Result: no public claim on any metric

Once UI still writes less code, and the code-token result now passes the statistics. It fails
condition 5: the blinded rater scored A's **completeness** a median 3, against C's 4.

| Metric (A vs C, reduction = 1 − A ÷ C) | Median of tasks | Range | Tasks where A < C | 95% bootstrap CI |
|---|---|---|---|---|
| **Code tokens**, normalised (exact `count_tokens`) | **17%** | −6% to 54% | 10/12 | 2% to 40% |
| Code bytes, normalised | 14% | −19% to 58% | 7/12 | −2% to 35% |
| Code lines, normalised | 8% | −19% to 52% | 7/12 | −12% to 23% |
| Visible output tokens per run | 3% | −81% to 73% | 6/12 | −10% to 20% |
| **Total tokens per run** (exact input net of overhead + output) | **−269%** | −746% to 5% | 1/12 | −423% to −123% |
| Cost per run, prefix caching assumed (secondary) | −99% | −235% to 45% | 1/12 | −121% to −30% |

Per-task code-token reductions, tasks 1–12: 2, 54, 2, 15, 41, 19, −1, −6, 38, 25, 42, 6 (%).

### Claim conditions (METHODOLOGY §5.1), copied from `full-2.1.0/tables.md`

| Metric | 1. CI lower bound > 0 | 2. X < Y on ≥ 9 tasks | 3. holds without tasks 1, 5, 8 | 4. pass rate within 10 pp | 5. ratings within 0.5 | Claim allowed |
|---|---|---|---|---|---|---|
| Visible output tokens | **no** | **no** (6/12) | yes | yes | **no** | no |
| Total tokens | **no** | **no** (1/12) | **no** | yes | **no** | no |
| Code tokens | yes | yes (10/12) | yes | yes | **no** | no |
| Code lines | **no** | **no** (7/12) | yes | yes | **no** | no |
| Code bytes | **no** | **no** (7/12) | yes | yes | **no** | no |

Blinded ratings, median over runs pooled across tasks (1–5): A 4 / **3** / 4 / 5, C 4 / **4** / 4 / 5
(polish / completeness / responsiveness / restraint).

## What changed since rc.0

| | rc.0 (5 runs) | 2.1.0 (3 runs) |
|---|---|---|
| Code tokens, A vs C | 20.6% less (CI 3% to 33%), 9/12 | 17% less (CI 2% to 40%), 10/12 |
| Total tokens, A vs C | 8.2× C (−717%) | 3.7× C (−269%) |
| A cost per run, median, uncached | about $1.00 | $0.42 (C: $0.17) |
| First-attempt pass, A / C | – | 29/36 / 33/36 (A: 7 type errors) |
| Completeness rating, A / C | within 0.5 | 3 / 4 |

The 2.1.0 harness fixes cut A's token overhead by more than half. The completeness gap is
where A's pages left out something the task asked for, judging from the rater's notes. For
example, all three A settings pages (task 2) lack the danger zone. On task 12, oversized
image placeholders crowd out the card text. A few notes for both arms mention empty states
or skeletons at phone width.

## Cost check for benchmark v2 (not part of the claim)

One run of each of the four setups on a practice app (`prompts/practice/tasks.json`, a
two-route help center that is not one of the 8 v2 tasks) cost **$1.48** in total: A $0.85, B $0.20,
C $0.31, D $0.12. All four passed the gates. Scaled to 8 tasks × 4 setups × 5 runs, that is about $60
before rating. The real v2 tasks are larger than this practice app, so a budget of $60 to $120
is a safer estimate than the $150 to $300 in the v2 doc.
