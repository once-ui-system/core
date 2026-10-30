# Changelog

Changes to `@once-ui-system/cli`. Releases are tagged `cli-vX.Y.Z`.

## [0.2.0]

### Added

- **`once-ui login` signs in through the browser.** It opens once-ui.com, where you
  check a code and approve the machine; no token to copy. `--no-browser` prints the
  link for machines without one. `--token`, a piped token and `ONCE_UI_TOKEN` still
  work for CI.
- **`once-ui update`** brings added blocks up to the registry's current version,
  replacing files you haven't touched and keeping the ones you edited (`--force`
  replaces them too, `--dry-run` shows what would change). It also works in projects
  whose blocks were added before 0.2.
- **`once-ui migrate 3.0`** rewrites a project for Once UI 3.0 in one command (and
  `migrate 2.0` for 1.x projects). It runs the codemod from the newest 3.x release on
  npm, prints every change and the lines to fix by hand, and names the install to run
  next. `--dry-run` only prints.
- **`once-ui whoami`** shows the account and what its plan unlocks.
- **`once-ui.lock.json`** records what `add` installed, so `update` can tell your
  edits from the registry's.

### Fixed

- **`add` installs packages, not import paths.** A block importing
  `@once-ui-system/core/code` or `next/image` made npm fail on a package of that
  name; app-local imports such as `@/utils/dev-logger` were tried as packages too.
- **Blocks that need icons beyond the built-in set render them.** `add` writes
  `blockIcons.ts` and registers it in your `IconProvider`.
- **Blocks show their images.** `add` downloads the images and videos a block uses
  (avatars, covers, textures) into `public/`; 107 blocks showed broken images before.
  Files already there are kept.
- **A file two blocks share is written once**, not reported as skipped the second time.

### Changed

- **`logout` revokes the token** on the server instead of only deleting the local copy.
