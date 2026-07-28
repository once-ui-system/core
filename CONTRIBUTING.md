# Contributing to Once UI

First off, thank you for taking the time to contribute! Once UI is an indie project built by creators who care deeply about great interfaces, systems thinking, and developer experience. Every bug report, feature suggestion, or pull request helps.

## Monorepo structure

This repo uses a monorepo layout with PNPM workspaces and Turborepo:

| Path | Description |
|------|-------------|
| `packages/core` | The Once UI package [@once-ui-system/core](https://www.npmjs.com/package/@once-ui-system/core) — all components, tokens, and utilities |
| `apps/dev` | Local sandbox app for testing components (not for production) |
| `apps/docs` | Documentation site at [docs.once-ui.com](https://docs.once-ui.com) |

For the full directory layout and conventions, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Running the dev environment

The dev app is symlinked to the core package for rapid iteration.

```bash
pnpm install
cd apps/dev
pnpm dev
```

This boots a local app at `http://localhost:3000` using the latest version of the package, ideal for testing and development.

To iterate on the library while running the dev app:

```bash
# Terminal 1 — watch mode for the library
pnpm --filter @once-ui-system/core dev

# Terminal 2 — dev app
cd apps/dev && pnpm dev
```

## Rebuilding the library

If apps fail to resolve `@once-ui-system/core`, rebuild it:

```bash
pnpm --filter @once-ui-system/core build
```

The build runs: `clean` → `generate-emoji-data` → `generate-ai-spec` → `tsc` → `copy-files` → `build:css`

## Running tests

```bash
pnpm --filter @once-ui-system/core test
```

Note: 4 tests (Dialog inert + ScrollLock wheel) currently fail under jsdom 68/72 pass — this is a pre-existing jsdom behavior issue, not an env problem.

## Contributing guidelines

### Bug reports

Use [this template](https://github.com/once-ui-system/core/issues/new?labels=bug&template=bug_report.md).

Include screenshots, steps to reproduce, and your environment if possible.

### Feature requests

Use [this template](https://github.com/once-ui-system/core/issues/new?labels=feature%20request&template=feature_request.md).

We prioritize improvements that serve real use cases or improve design/dev workflow.

### Pull requests

We welcome PRs for:
- UI component fixes or improvements
- Accessibility enhancements
- Performance tweaks
- New utilities or design patterns that fit the system
- Documentation improvements

Before submitting a PR:
1. Test your changes in `apps/dev` — use `ComponentsCheckPage.tsx` to verify components visually
2. Run tests: `pnpm --filter @once-ui-system/core test`
3. Rebuild the library: `pnpm --filter @once-ui-system/core build`
4. Reference an issue when applicable

### Code conventions

- Follow our [component conventions](https://docs.once-ui.com/once-ui/basics/components) and file structure.
- Use the naming system and design tokens already defined in the project.
- Components should be server-compatible or marked `"use client"`.
- Use `forwardRef` and accept `className`/`style` overrides.
- Export new components through `src/components/index.ts` → `src/index.ts`.
- Use SCSS modules (`.module.scss`) for scoped component styles.

## Join the community

We hang out in the [Design Engineers Club](https://discord.com/invite/5EyAQ4eNdS) on Discord. Come ask questions, share builds, or just vibe with others building cool things.

## Indie credits

This is an indie-built system. We appreciate contributors deeply. You may get featured in the docs or invited to inner-circle experiments if you consistently help improve Once UI.

Thanks again,
— Lorant
