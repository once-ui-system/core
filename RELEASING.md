# Releasing @once-ui-system/core

This document defines what counts as a patch, minor, or major release for this package,
and how a release moves from proposal to npm. It exists because Once UI has two consumer
groups with different sensitivities: human developers upgrading manually, and AI codegen
agents that consume the in-package harness (`AGENTS.md`, `ai/manifest.json`,
`ai/catalog.json`) and typically pin or auto-follow versions. Changes that a human would
shrug at can silently break an agent that was trained on, or validates against, the
previous API surface.

## Version criteria

### Patch (1.7.x → 1.7.x+1)

Nothing a consumer must react to:

- Bug fixes that restore documented/intended behavior without changing the API surface
- Visual corrections (a broken border, a wrong token reference) that don't change
  component props or markup structure consumers can target
- Dependency bumps **within the same major** of a runtime dependency
- Security patches for transitive dependencies (overrides/lockfile-level)
- Docs, `ai/` harness content fixes, and internal refactors with identical output

### Minor (1.7.x → 1.8.0)

Additive or behavior-adjacent — safe to upgrade, but there is something new to know:

- New components, props, tokens, utility classes, or type unions **widening**
  (e.g. adding `TextWeight` variants)
- Swapping a runtime dependency for an equivalent (e.g. `classnames` → `clsx`)
- Behavior changes to shared internals that are intended as improvements but alter
  observable behavior (e.g. `DropdownWrapper` sizing) — these ride minors so they're
  visible in release notes, never patches
- Deprecations (the old way still works)
- New or changed entries in the package `exports` map that only **add** resolution paths

### Major (1.x → 2.0.0)

Anything a consumer must act on:

- Removing or renaming components, props, exports, tokens, or CSS classes
- **Narrowing** type unions or prop types
- Removing conditions from the `exports` map (e.g. dropping `require`) or changing
  module format — package-resolution changes break at install/build time, the worst
  kind of surprise
- Raising peer-dependency floors (React, Next.js, sass)
- Changing default behavior in ways that alter rendered output for existing code
- The library split (core/blocks/server) planned in the roadmap

### The AI-consumer rule

If a change would invalidate what `ai/manifest.json`, `ai/catalog.json`, or the
documented examples say — even if technically additive — it must ship with updated
harness files in the same release, and the release notes must call it out. Agents
downstream (Studio, Aveiro/Magic, Chirio) key off these files.

## Release flow

1. **Everything lands in `CHANGELOG.md` first.** PRs that change the package add entries
   to the `[Unreleased]` section as they merge.
2. **Proposal.** A release PR sets the version, moves `[Unreleased]` under the new
   version heading with a date, and states the classification rationale (which criteria
   above applied).
3. **Verification.** `pnpm --filter @once-ui-system/core build`, `typecheck`, and `test`
   must pass; test regressions against the known-failure baseline in `AGENTS.md` block
   the release.
4. **Approval and publish.** The maintainer (Lorant) reviews and approves the release PR
   and runs `npm publish`. Nothing is published by automation or agents — releases are
   proposals until the maintainer executes them.
5. **After publish:** create the GitHub release from the changelog entry, and notify
   downstream projects that pin the package (see cross-project notes in `ROADMAP.md`).

## Pre-releases

A pre-release goes to the **same package** on a **different dist-tag**. There is
no second package, and there does not need to be: `npm install` resolves the
`latest` tag, and a prerelease version does not satisfy a stable semver range —
not `^1.8.2`, not `^2.0.0`, not even `*`. Someone has to ask for it by name.

```bash
# from packages/core, with the release PR merged and the tree clean
pnpm build && pnpm typecheck && pnpm test
npm publish            # publishConfig.tag pins this to `alpha`
```

`packages/core/package.json` carries `publishConfig.tag`, so a bare
`npm publish` cannot set `latest` by accident — which it otherwise would,
whatever the version string says. **Do not pass `--tag latest` to a prerelease**,
and when 2.0.0 final is ready, remove `publishConfig.tag` in the same PR that
sets the version.

Verify the tag landed where you meant it:

```bash
npm view @once-ui-system/core dist-tags
# latest: 1.8.4   alpha: 2.0.0-alpha.0
```

If it goes to `latest` by mistake, `npm dist-tag add @once-ui-system/core@1.8.4
latest` restores it immediately — the bad version stays published but stops
being what anyone installs.

### What ships

`files` in `packages/core/package.json` is an allowlist, so a new directory
ships nothing until it is named there. Check it before a release:

```bash
npm pack --dry-run
```

`@once-ui-system/foundations` is `private` and must stay that way while core
inlines its SCSS and CSS at build time. Publishing core with a dependency on an
unpublished package is the one failure that breaks every consumer at once.

## Out of scope for this document

Marketing names for releases
— none are in use today; introducing them is a maintainer decision.
