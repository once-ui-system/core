# Full run: step by step (for a fresh session)

This runs the pre-registered benchmark ([METHODOLOGY.md](./METHODOLOGY.md)) on the
published `@once-ui-system/core@2.1.0-rc.0` and writes `results/full-rc0/`. For the claim
run on the final release, repeat it with `2.1.0` and `results/full-2.1.0/`.

**Expected cost:** about $55 at list prices (`claude-sonnet-5-5`, n = 5, 240 runs, about
$50 generation + $4 rating); budget **$110** with the 2× margin. `count_tokens` is free.
**Expected time:** 3–4 h wall-clock. Most of it is `next build` in the gates; the four arms
run in parallel.

Rules that still apply: no public claims and no posts. The numbers go to Lorant, who
approves any public use. Never print or commit the API key.

## 0. Preconditions

```bash
cd benchmarks/tailwind-comparison
node --version                                   # 22.x
test -n "$ANTHROPIC_API_KEY" && echo "API key: set" || echo "API key: MISSING"   # never echo the value
npm view @once-ui-system/core dist-tags          # expect next: 2.1.0-rc.0
ls /opt/pw-browsers/chromium-1194/chrome-linux/chrome || echo "set CHROMIUM_PATH to a Chromium binary"
df -h .                                          # about 3 GB free for scaffolds, builds and results
```

If the key is missing, stop. It's an environment secret that Lorant adds; don't ask for it
in chat.

## 1. Install and build the sandboxes

```bash
npm ci
git clone --filter=blob:none https://github.com/shadcn-ui/ui ../../../shadcn-src
git -C ../../../shadcn-src checkout c2a67849be260701852b0977ba15eb5f3a0ce2a4
node runner/setup.mjs --once-version 2.1.0-rc.0 --shadcn-src ../../../shadcn-src
```

`setup.mjs` packs the published rc.0 from npm, re-resolves `arms/once` against it (this
updates `arms/once/package-lock.json`; commit that with the results), installs the other
two scaffolds from their lockfiles, and builds every arm's read-only sandbox. It also
prints the rc.0 tarball's sha256 and writes it to `work/context-manifest.json`.

Check arm A's harness is the fixed one (icon names out of `spec.json`), and stop if any
check fails:

```bash
node runner/check-harness.mjs
```

It checks:
- `catalog.json` has a top-level `iconNames` array (99 names), equal to `spec.json`'s.
- `rules.compact.md` sends icon names to `iconNames` in `catalog.json`. Its one remaining
  `spec.json` mention, about `functions`/`importFrom`, is expected.
- `rules.md` rules 14b and 31 and the `Icon.names` gotcha point at `catalog.json`.

The committed `ai/` files on the release branch can lag behind; the package build
regenerates them, so check the installed tarball (this does), not the repo.

## 2. Self-test (no API cost), then a one-run canary

```bash
node runner/generate-api.mjs --mock --out work/mock-results --tasks 3 --arms A
node runner/generate-api.mjs --out results/full-rc0 --tasks 3 --arms A --runs 1
cat results/full-rc0/raw/t03/once-harness/run1/run.json
node -e 'const u=require("./results/full-rc0/raw/t03/once-harness/run1/usage.json");console.log(u.exact,u.attempts)'
```

The canary costs a few cents and becomes run 1 of the full run: the runner is resumable
and skips runs whose `run.json` is final. If it errors on a request parameter, fix the
runner, delete `results/full-rc0/`, and log the change in METHODOLOGY §11 before going on.

## 3. Full generation (12 tasks × 4 arms × 5 runs)

```bash
node runner/generate-api.mjs --out results/full-rc0 --runs 5 > work/full-rc0.log 2>&1
```

Run it in the background, because it takes hours. Re-running the same command resumes it.
Each run writes `prompt.txt`, `attempt-N.reply.md`, `attempt-N.tsx`,
`attempt-N.gates.json`, the screenshots (including the scripted-interaction ones),
`usage.json` (exact usage per API call), `transcript.json` and `run.json`.

## 4. Metrics, blinded rating, report

```bash
node runner/metrics.mjs --results results/full-rc0 --exact      # code size + exact count_tokens
node runner/blind.mjs   --results results/full-rc0              # packets + sealed key (work/)
node runner/rate-api.mjs --results results/full-rc0             # one rater call per packet (resumable)
node runner/blind.mjs   --results results/full-rc0 --unseal     # ratings.json + blind-key.json
rm -rf results/full-rc0/blind                                   # duplicates of raw/ screenshots
cp work/context-manifest.json results/full-rc0/
node runner/report.mjs  --results results/full-rc0 > results/full-rc0/tables.md
```

`tables.md` ends with the **claim-conditions table** (METHODOLOGY §5.1) for A vs C. A
claim is allowed only where its row says **yes**.

## 5. Write-up and hand-off

1. Write `results/full-rc0.md` in the same shape as `results/pilot.md`: headline table, the
   claim-conditions table copied verbatim, per-arm detail, incidents, threats.
   - If a claim is allowed, fill in the exact wording from METHODOLOGY §5.2 and change
     nothing else.
   - Label the whole file "rc.0, not for public claims": the claim run is the one on 2.1.0.
2. Size check: `du -sh results/full-rc0`. Screenshots dominate (the pilot's 36 runs came to
   about 11 MB). If the total is over about 60 MB, ask Lorant whether to keep screenshots in git
   or attach them to a GitHub release; keep every JSON, TSX and prompt in git either way.
3. Commit `results/full-rc0/`, `results/full-rc0.md` and `arms/once/package-lock.json` on a
   branch from `main`, push, and open a PR. Send the numbers to Lorant. No public claims.

## Troubleshooting

- **A gate bug or a harness change found mid-run** (like the pilot's prefetch 404s):
  - Fix it.
  - Void the affected attempts by moving their `.gates.json` out of the way, and re-gate
    them with `node runner/pilot-gate.mjs --results results/full-rc0`.
  - Log it in METHODOLOGY §11 with "during full run".
  - Never change prompts, tasks, n or the model mid-run.
- **429 / 5xx:** the runner retries each call with exponential backoff and logs it in
  `usage.json` → `calls[].infra_error`. Infrastructure failures never void model output.
- **Disk full:** delete `work/gate/*/.next` and `work/mock-results`; the scaffolds'
  `node_modules` are hard links, so deleting a gate copy frees little.
