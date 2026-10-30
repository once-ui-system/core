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

  The open-source, agentic design system for React

  [![npm version](https://img.shields.io/npm/v/@once-ui-system/core.svg)](https://www.npmjs.com/package/@once-ui-system/core)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE.md)
  [![npm downloads](https://img.shields.io/npm/dm/@once-ui-system/core.svg)](https://www.npmjs.com/package/@once-ui-system/core)
  [![Discord](https://img.shields.io/discord/1083398120035074148?color=7289da&logo=discord&logoColor=white)](https://discord.com/invite/5EyAQ4eNdS)
</div>



<br/>

## Documentation

Learn how to set up and build with Once UI at [docs.once-ui.com](https://docs.once-ui.com/quick-start).

## Installation

```bash
npm install @once-ui-system/core
```

## Upgrading

Coming from 1.8.x? See [MIGRATING.md](./MIGRATING.md) — a codemod does most of
it, and the rest is six short steps.

## Getting started

```bash
git clone https://github.com/once-ui-system/core.git
cd core
pnpm install
pnpm dev
```

This boots both apps in parallel via Turborepo:
- **Docs** → `http://localhost:3000`
- **Dev sandbox** → `http://localhost:3001`

> **Note:** `pnpm install` automatically builds the core library via a postinstall hook, so no separate build step is needed after initial setup.

## Project structure

This is a **pnpm monorepo** with Turborepo. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full directory layout, conventions, and where to contribute.

```
core/
├── packages/core/     # @once-ui-system/core — the design system library
├── apps/dev/          # Next.js 16 sandbox for component development
└── apps/docs/         # Next.js 16 documentation site
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers in parallel (docs → :3000, dev → :3001, core watch) |
| `pnpm build` | Build everything (library + apps) |
| `pnpm test` | Run all tests via Turbo |
| `pnpm lint` | Lint everything via Turbo |
| `pnpm typecheck` | Typecheck everything in parallel |
| `pnpm format` | Format all files |
| `pnpm clean` | Clean all build artifacts |
| `pnpm start` | Start all built apps (docs → :3000, dev → :3001) |

Individual workspace commands:

| Command | Description |
|---------|-------------|
| `pnpm dev:docs` | Docs app only → `http://localhost:3000` |
| `pnpm dev:dev` | Dev sandbox only → `http://localhost:3001` |
| `pnpm build:core` | Build just the library |
| `pnpm test:core` | Run core tests only |
| `pnpm lint:core` | Lint core only |
| `pnpm start:docs` | Start built docs app only |
| `pnpm start:dev` | Start built dev app only |

## AI codegen harness

The library ships an AI codegen harness in `packages/core/ai/` — a manifest, task bundles, component slices, and validation scripts. This powers the [Freebuff](https://freebuff.com) integration and enables AI agents to generate Once UI code correctly. See [AI Coding docs](https://docs.once-ui.com/ai-coding) for details.

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
4. Run `pnpm test` before submitting.

**Where to start:**
- Fix or add a component → `packages/core/src/components/`
- Fix a complex module (CodeBlock, etc.) → `packages/core/src/modules/`
- Update docs → `apps/docs/src/content/once-ui/`
- Change design tokens → `packages/core/src/tokens/`

## Sponsors

Once UI is an indie project, kept going by the companies and people who use it.

### Supported by

<a href="https://neon.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/sponsors/neon-logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset=".github/assets/sponsors/neon-logo-light.svg">
    <img alt="Neon" src=".github/assets/sponsors/neon-logo-light.svg" height="40">
  </picture>
</a>
&nbsp;&nbsp;&nbsp;
<a href="https://sentry.io">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/sponsors/sentry-logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset=".github/assets/sponsors/sentry-logo-light.svg">
    <img alt="Sentry" src=".github/assets/sponsors/sentry-logo-light.svg" height="40">
  </picture>
</a>

Once UI is part of the [Neon](https://neon.com) Open Source Program. Neon is serverless Postgres.
Sentry supports us through [Sentry for Open Source](https://sentry.io/for/open-source/), and we build with [Claude](https://claude.com) through Anthropic's program for open-source maintainers.

### Company sponsors

Founding and Ecosystem sponsors get their logo here.

<table>
  <tr>
    <td align="center" width="400">
      <a href="https://once-ui.com/sponsors"><b>Founding</b></a><br/>
      <sub>$2,000 / month · one partner at a time</sub><br/><br/>
      <a href="https://once-ui.com/sponsors">Your logo here</a>
    </td>
    <td align="center" width="400">
      <a href="https://once-ui.com/sponsors"><b>Ecosystem</b></a><br/>
      <sub>$750 / month</sub><br/><br/>
      <a href="https://once-ui.com/sponsors">Your logo here</a>
    </td>
  </tr>
</table>

| Tier | Price | Where your logo runs |
| --- | --- | --- |
| Founding | $2,000 / month | This README, the documentation site and once-ui.com/sponsors; named in every release; a standing line to the team |
| Ecosystem | $750 / month | This README and once-ui.com/sponsors; named in every release for the term |
| Supporter | $250 / month | once-ui.com/sponsors; named in the quarter's release notes |

See [once-ui.com/sponsors](https://once-ui.com/sponsors) for the details, or get in touch through the form there.

### Individual sponsors

Individuals can [sponsor us through GitHub Sponsors](https://github.com/sponsors/once-ui-system) or [thanks.dev](https://thanks.dev/u/gh/once-ui-system) and get featured on our site.
