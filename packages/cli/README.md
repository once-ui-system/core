# @once-ui-system/cli

The Once UI command line. It scaffolds apps from [Stack](https://once-ui.com/stack) surfaces and adds Once UI blocks to a project.

```bash
npx @once-ui-system/cli create my-app --surfaces landing,docs
npx @once-ui-system/cli add hero1
```

Installed globally, the command is `once-ui`:

```bash
npm install -g @once-ui-system/cli
once-ui add hero1
```

## Commands

| Command | What it does |
| --- | --- |
| `once-ui create <dir> [--surfaces a,b] [--slices billing] [--name n] [--url u]` | Scaffolds a new app into `<dir>` from the surfaces you pick. Without `--surfaces`, it lists the ones you own and asks. |
| `once-ui add <block…> [--overwrite] [--no-install]` | Writes the blocks and every block they import into your project, then installs any missing npm packages with your package manager. Files that already exist are skipped unless you pass `--overwrite`. |
| `once-ui update [block…] [--dry-run] [--force] [--no-install]` | Brings added blocks up to the registry's current version. Files you haven't touched are replaced; files you edited are kept and named, unless you pass `--force`. Blocks a new version imports are added. Without names it updates every block in the project. |
| `once-ui migrate <version> [dir] [--dry-run] [--force]` | Rewrites a project for a new Once UI major (`2.0` or `3.0`): renamed components and props, moved imports, and the new number scale. It prints each change, and the lines it can't rewrite safely to fix by hand. `--dry-run` only prints them. `--force` (3.0) runs on a project that still looks like 1.x. Then install the version it names. |
| `once-ui list` | Shows the surfaces and slices in the current Stack release and marks the ones you own. |
| `once-ui login [--no-browser]` | Signs in through once-ui.com: it opens a page where you approve this machine, and waits. `--no-browser` only prints the link, for a machine without one; open it anywhere you're signed in. |
| `once-ui login --token oui_…` | Saves an access token from [once-ui.com/account/tokens](https://once-ui.com/account/tokens) instead, for CI. A piped token works too. The token is checked before it is stored. |
| `once-ui whoami` | Shows the account you're signed in as and what its plan unlocks. |
| `once-ui logout` | Revokes this machine's token on the server and removes it here. |

## How it works

- **The app is built on the server.** `create` sends the surfaces you picked to `once-ui.com/api/stack/scaffold`, which checks your plan, runs the Stack scaffolder and streams the finished app back as a tarball. The CLI unpacks it into `<dir>`. The CLI never sees the Stack repository or the scaffolder.
- **Access.** The `docs` surface is free and works without signing in. Other surfaces need a plan that includes them. If yours doesn't, the server names what's missing.
- **Signing in.** `login` makes an access token on your machine and puts only its SHA-256 hash in the link it opens, together with a short code it also prints. Check the page shows the same code, then approve: the hash is stored as one of your tokens, and the CLI, which has been polling with the token, sees it start working. The token never passes through the browser. It shows up as "CLI on <machine>" on your tokens page, where you can revoke it.
- **Where `add` writes files.** Blocks go where the registry says (`components/once-ui/pro/…`). If your project has a `src/` folder, they go under `src/`.
- **`once-ui.lock.json`.** `add` records each file it installed with the hash of what the registry sent. `update` uses it to tell a file you haven't touched from one you edited. Commit it with your blocks. Projects with blocks from before the lock still update: blocks are found in the block folder, and a file that differs from the registry is kept until you pass `--force`.
- **Where `migrate` gets its codemod.** It finds the newest published `@once-ui-system/core` release of that major on npm and downloads the codemod from the core repository at that release's tag, so the rewrite matches the version you install. Nothing is installed; the codemod runs with your Node and is deleted afterwards. Commit first, so you can review the diff.
- **Icons.** Many blocks use icons beyond Once UI's built-in set. They come in `components/once-ui/pro/blockIcons.ts`, and `add` registers them in your `IconProvider` when it's wired the usual way (`icons={iconLibrary}`). Otherwise it prints the two lines to add.

## Configuration

| Setting | Default |
| --- | --- |
| Token | `$XDG_CONFIG_HOME/once-ui/config.json`, otherwise `~/.config/once-ui/config.json`. The file is readable by your user only. `ONCE_UI_TOKEN` overrides it. |
| Server | `https://once-ui.com`. Change it with `--api` or `ONCE_UI_API`. |

## Development

```bash
pnpm --filter @once-ui-system/cli build
pnpm --filter @once-ui-system/cli test
node packages/cli/dist/index.js list --api http://localhost:3000
```
