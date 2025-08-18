## Once UI monorepo

This monorepo hosts the official Once UI package and its internal development sandbox. It is designed for testing, development, and contribution—not for production deployment.

## Developer notice

It includes:

- `packages/core`: the published [@once-ui-system/core](https://www.npmjs.com/package/@once-ui-system/core) package
- `apps/docs`: the official documentation of Once UI and Magic templates built with [Magic Docs](https://once-ui.com/products/magic-docs)
- `apps/dev`: a simple sandbox app wired via symlink for testing components

This setup is intended for contributors and maintainers.
If you're building a real project, we recommend using:

1. [Once UI Starter](https://github.com/once-ui-system/nextjs-starter)
2. or install via your package manager:

```bash
npm install @once-ui-system/core
# or
yarn add @once-ui-system/core
# or
pnpm add @once-ui-system/core
```

### For contributors

Fork this repo, install dependencies, and run apps:

```bash
pnpm install
pnpm dev
```

The components will update automatically when you make changes to the Core library. If you modify the CSS modules, you'll have to run `pnpm build` in the `packages/core` directory.

## Documentation

Start here: [docs.once-ui.com](https://docs.once-ui.com/once-ui/quick-start).

## Creators

**Lorant One**: [Portfolio](https://lorant.one) / [Threads](https://www.threads.net/@lorant.one) / [LinkedIn](https://www.linkedin.com/in/lorant-one/)

**Collaborators**: [Once UI Frontiers](https://once-ui.com/about)

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