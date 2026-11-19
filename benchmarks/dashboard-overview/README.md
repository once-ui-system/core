# Dashboard Overview benchmark

A stand-in for an analytics dashboard's Overview, built only from core:
five KPI tiles with Sparklines, a LineChart, and seven breakdown cards with
Tables (8 rows, 4 columns, ~230 skeletons while loading). One `loading` flag
drives all of it, as a data-fetching dashboard does. The page is
`apps/dev/src/app/bench/overview/page.tsx`, at `/bench/overview`.

It mirrors the Databuddy Overview that the private `databuddy-once-ui` fork
benchmarks against its Tailwind original, so core's cost there can be
measured without that app's backend.

## Run

```bash
pnpm --filter @once-ui-system/core build
cd apps/dev && npx next build && npx next start --port 3001 &
cd benchmarks/dashboard-overview
node run.cjs <label> 7 4      # 7 runs, 4x CPU throttle (the "phone" profile)
node run.cjs <label> 7 1      # no throttle
```

Needs `playwright` (resolvable from this folder or `NODE_PATH`). Each run:
a cold load at 1440x900 with 6 s of loading skeletons (`?load=`), then a
click on "7d" (a range switch, 600 ms of loading, `?switch=`). Medians go to
stdout and `results.jsonl`:

| Key | What |
|---|---|
| `styleMs`, `layoutMs`, `scriptMs` | CDP totals from navigation to settled |
| `cls` | layout shift, load only |
| `inp` | the range-switch click's event duration |
| `swStyle`, `swScript`, `swLayout` | CDP totals from the click to settled |

`VARIANT=<name>` rewrites the page's CSS with a transform from
`variants.cjs` (`noskel`: no skeleton animation; `nomedia`: no breakpoint
utilities), for A/B runs without a rebuild.

## Results, 9 Nov 2026 (3.0 branch, medians of 7)

| | before, 4x | after, 4x | before, 1x | after, 1x |
|---|---|---|---|---|
| Style recalc, load | 2,718 ms | **255 ms** | 561 ms | **58 ms** |
| Script, load | 857 ms | **618 ms** | 185 ms | **144 ms** |
| Range switch INP | 376 ms | **296 ms** | 96 ms | **72 ms** |
| Range switch script | 320 ms | **197 ms** | 79 ms | **48 ms** |
| Range switch style | 287 ms | 243 ms | 76 ms | 55 ms |
| CLS | 0.001 | 0.001 | 0.001 | 0.001 |

What moved it:

- **Skeleton** animated `background-color`, which only the main thread can
  run: every skeleton cost a style recalc every frame while the page loaded.
  It now pulses `opacity` (compositor). React listens for
  `animationiteration` on its root, and with that listener Chromium still
  ticks running animations on the main thread around each iteration
  boundary, so one iteration now holds 40 pulses (one boundary a minute).
  Table animates its skeleton rows instead of every cell, and the cells no
  longer take an inline delay (which made each one a client Flex).
- **Flex** skips its breakpoint pass when no breakpoint object is given, and
  stops handing React ~25 unset style keys, each written to the DOM as `""`
  on mount.
- **Charts** measure their plot with a ResizeObserver instead of
  `getBoundingClientRect` in a layout effect (a forced layout of the whole
  page on every mount), read the legend's height the same way instead of on
  every render, and remember their size while they load, so a reload draws
  once instead of twice.

The stylesheet's size was not the cost: `VARIANT=nomedia` (every breakpoint
rule removed) saves ~40 ms of the 255 ms. With no skeleton animation at all
(`noskel`) the range switch INP is ~210 ms, so starting the rows' animations
is most of what is left above that.
