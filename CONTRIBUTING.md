# Contributing to Once UI

First off, thank you for taking the time to contribute! Once UI is an indie project built by creators who care deeply about great interfaces, systems thinking, and developer experience. Every bug report, feature suggestion, or pull request helps.

## Monorepo structure

This repo uses a monorepo layout with PNPM workspaces:

`/packages/core` → The Once UI package [@once-ui-system/core](https://www.npmjs.com/package/@once-ui-system/core)
`/apps/dev` → Local sandbox app for testing components (not for production)

## Running the dev environment

The dev app is symlinked to the core package for rapid iteration.

```bash
pnpm install
cd apps/dev
pnpm dev
```

This will boot up a local app using the latest version of the package, ideal for testing and development.

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

Before submitting a PR:
- Make sure your changes pass linting: `pnpm lint`
- Format your code: `pnpm format`
- Test your changes in `apps/dev`
- Reference an issue when applicable

### Best practices

- Follow our [component conventions](https://docs.once-ui.com/once-ui/basics/components) and file structure.
- Use the naming system and design tokens already defined in the project.

## Join the community

We hang out in the [Design Engineers Club](https://discord.com/invite/5EyAQ4eNdS) on Discord. Come ask questions, share builds, or just vibe with others building cool things.

## Indie credits

This is an indie-built system. We appreciate contributors deeply. You may get featured in the docs or invited to inner-circle experiments if you consistently help improve Once UI.

Thanks again,
— Lorant