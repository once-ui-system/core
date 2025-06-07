## Once UI monorepo

This monorepo hosts the official Once UI package and its internal development sandbox. It is designed for testing, development, and contribution—not for production deployment.

## Developer notice

It includes:

- `packages/core`: the published [@once-ui-system/core](https://www.npmjs.com/package/@once-ui-system/core) package
- `apps/dev`: a local sandbox app wired via symlink for live development

This setup is intended for contributors and maintainers.
If you're building a real project, we recommend using:

1. [Once UI Starter](https://github.com/once-ui-system/starter)
2. or install via your package manager:

```bash
npm install @once-ui-system/core
# or
yarn add @once-ui-system/core
# or
pnpm add @once-ui-system/core
```

### For contributors

Fork this repo, install dependencies, and run the dev test app:

```bash
pnpm install
cd apps/dev
pnpm dev
```

## Documentation

Start here: [docs.once-ui.com](https://docs.once-ui.com/once-ui/quick-start).

## Creators

**Lorant One**: [Portfolio](https://lorant.one) / [Threads](https://www.threads.net/@lorant.one) / [LinkedIn](https://www.linkedin.com/in/lorant-one/)

**Zsofia Komaromi**: [Portfolio](https://zsofia.pro) / [Threads](https://www.threads.net/@zsofia_kom) / [LinkedIn](https://www.linkedin.com/in/zsofiakomaromi/)

## Join the movement

![Design Engineers Club](https://docs.once-ui.com/images/docs/vibe-coding-dark.jpg)

Join the [Design Engineers Club](https://discord.com/invite/5EyAQ4eNdS) on Discord. Build with intention. Share with integrity.

## Feedback & Bugs

Found a bug? [Report it](https://github.com/once-ui-system/core/issues/new?labels=bug&template=bug_report.md)
Got an idea? [Submit a request](https://github.com/once-ui-system/core/issues/new?labels=feature%20request&template=feature_request.md)

## Support us

Once UI is an indie project. [Sponsor us](https://github.com/sponsors/once-ui-system) and get featured on our site!

## License

Distributed under the MIT License. See `LICENSE.txt`.