# @once-ui-system/core — agent harness

This package ships an agent-first codegen harness under `ai/`. Use it when **writing Once UI code**, not full MDX documentation pages.

## Entry point

```
@once-ui-system/core/ai/manifest.json
```

Or from disk:

```
node_modules/@once-ui-system/core/ai/manifest.json
```

## Bootstrap workflow

1. Read `ai/manifest.json`
2. Load bootstrap files: `ai/rules.compact.md` + `ai/catalog.json` (about 30KB together)
3. Match intent via `ai/tasks/index.json`, then read that task's bundle, e.g. `ai/bundles/pricing.json`: the task with every component slice, type and gotcha it names, in one file
4. Fetch a slice from `ai/components/*.json` only for a component the bundle does not have. Read what you need in one step; never open `spec.json` (it is for tooling)
5. Read the gold example referenced by the task; for production fidelity, read Pro blocks from `ai/examples/blocks/manifest.json`
6. Validate generated code: `npx once-ui-validate-ai-code path/to/file.tsx`

## npm exports

```tsx
// Readable paths (version-pinned to your install)
import manifest from '@once-ui-system/core/ai/manifest.json';
```

```bash
# One-time project setup (writes AGENTS.md, CLAUDE.md and a Cursor rule in the consumer app)
npx once-ui-init-agent
```

## Remote fallback

If you cannot read `node_modules`, use the docs host (may not match your installed version exactly):

- https://docs.once-ui.com/ai/manifest.json
- https://docs.once-ui.com/ai/rules.compact.md
- https://docs.once-ui.com/once-ui/ai-coding

## Key rules (summary)

- Use `Column` / `Row`, not `Flex` unless direction changes at breakpoints
- Use `fill`, not `fillWidth fillHeight`; use `center`, not `horizontal="center" vertical="center"`
- Static panels: `Column background="surface" border radius="l" padding="24"`
- `Card` is interactive only (`href` or `onClick`)
- In a Next.js app, import `LayoutProvider` from `@once-ui-system/core/next` — the root export renders links and images as plain `<a>` and `<img>`; the OG route handlers (`createOgFetchRoute`, `createOgProxyRoute`) come from there too
- Not everything is on the root: charts from `/data`, `CodeBlock` from `/code`, `MediaUpload` from `/media`, the MDX map (`mdxComponents`, `createMdxComponents`) from `/mdx`, `defineConfig` from `/config`. `ai/manifest.json` → `imports` lists every entry point with its exports

Full rules: `@once-ui-system/core/ai/rules.compact.md`
