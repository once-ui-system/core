<br/>

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://docs.once-ui.com/trademarks/icon-dark.svg" width="64" height="64">
    <source media="(prefers-color-scheme: light)" srcset="https://docs.once-ui.com/trademarks/icon-light.svg" width="64" height="64">
    <img alt="Once UI Logo" src="https://docs.once-ui.com/trademarks/icon-dark.svg" width="64" height="64">
  </picture><picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://docs.once-ui.com/trademarks/type-dark.svg" width="200" height="64">
    <source media="(prefers-color-scheme: light)" srcset="https://docs.once-ui.com/trademarks/type-light.svg" width="200" height="64">
    <img alt="Once UI Wordmark" src="https://docs.once-ui.com/trademarks/type-dark.svg" width="200" height="64">
  </picture>

  <br/>

  The indie design system for Next.js apps

  [![npm version](https://img.shields.io/npm/v/@once-ui-system/core.svg)](https://www.npmjs.com/package/@once-ui-system/core)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE.md)
  [![npm downloads](https://img.shields.io/npm/dm/@once-ui-system/core.svg)](https://www.npmjs.com/package/@once-ui-system/core)
  [![Discord](https://img.shields.io/discord/1083398120035074148?color=7289da&logo=discord&logoColor=white)](https://discord.com/invite/5EyAQ4eNdS)
</div>



<br/>

## Documentation

Learn how to set up and build with Once UI at [docs.once-ui.com](https://docs.once-ui.com/once-ui/quick-start).

## Installation

```bash
npm install @once-ui-system/core
```

## Getting started

```bash
git clone https://github.com/once-ui-system/core.git
cd core
pnpm install
cd apps/dev
pnpm dev
```

This boots the development sandbox at `http://localhost:3000` with the latest version of the library linked.

## Project structure

This is a **pnpm monorepo** with Turborepo. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full directory layout, conventions, and where to contribute.

```
core/
├── packages/core/     # @once-ui-system/core — the design system library
├── apps/dev/          # Next.js 16 sandbox for component development
└── apps/docs/         # Next.js 15 documentation site
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all workspace dependencies |
| `pnpm --filter @once-ui-system/core build` | Build the library (types, JS, CSS, AI artifacts) |
| `pnpm --filter @once-ui-system/core test` | Run unit tests with Vitest |
| `cd apps/dev && pnpm dev` | Start the dev sandbox |
| `cd apps/docs && pnpm dev` | Start the docs site |

## Authors

Built and maintained by [**Lorant One**](https://lorant.one).

## Community

Join the [Design Engineers Club](https://discord.com/invite/5EyAQ4eNdS) for help, support and discussion.

Found a bug? Report it [here](https://github.com/once-ui-system/core/issues/new?labels=bug&template=bug_report.md). Got a feature request? Submit it [here](https://github.com/once-ui-system/core/issues/new?labels=feature%20request&template=feature_request.md).

## Contributing

We welcome contributions! Before submitting a PR:

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the codebase layout.
2. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on code style, PR process, and conventions.
3. Test your changes in `apps/dev` — use `ComponentsCheckPage.tsx` to visually verify components.
4. Run `pnpm --filter @once-ui-system/core test` before submitting.

**Where to start:**
- Fix or add a component → `packages/core/src/components/`
- Fix a complex module (CodeBlock, etc.) → `packages/core/src/modules/`
- Update docs → `apps/docs/src/content/once-ui/`
- Change design tokens → `packages/core/src/tokens/`

## Sponsors

Once UI is an indie project. [Sponsor us](https://github.com/sponsors/once-ui-system) and get featured on our site!
