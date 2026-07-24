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
2. Load bootstrap files: `ai/rules.compact.md` + `ai/catalog.json` (~6KB)
3. Match intent via `ai/tasks/index.json` → e.g. `ai/tasks/pricing.json`
4. Fetch component slices listed in the task bundle (`ai/components/*.json`)
5. Read the gold example referenced by the task; for production fidelity, read Pro blocks from `ai/examples/blocks/manifest.json`
6. Validate generated code: `npx once-ui-validate-ai-code path/to/file.tsx`

## npm exports

```tsx
// Readable paths (version-pinned to your install)
import manifest from '@once-ui-system/core/ai/manifest.json';
```

```bash
# One-time project setup (writes AGENTS.md + Cursor rule in consumer app)
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
- Static panels: `Column background="surface" border="neutral-alpha-weak" radius="l" padding="24"`
- `Card` is interactive only (`href` or `onClick`)

Full rules: `@once-ui-system/core/ai/rules.compact.md`
