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
| `once-ui list` | Shows the surfaces and slices in the current Stack release and marks the ones you own. |
| `once-ui login [--token oui_…]` | Saves an access token from [once-ui.com/account/tokens](https://once-ui.com/account/tokens). The token is checked before it is stored. |
| `once-ui logout` | Removes the stored token. |

## How it works

- **The app is built on the server.** `create` sends the surfaces you picked to `once-ui.com/api/stack/scaffold`, which checks your plan, runs the Stack scaffolder and streams the finished app back as a tarball. The CLI unpacks it into `<dir>`. The CLI never sees the Stack repository or the scaffolder.
- **Access.** The `docs` surface is free and works without signing in. Other surfaces need a plan that includes them. If yours doesn't, the server names what's missing.
- **Where `add` writes files.** Blocks go where the registry says (`components/once-ui/pro/…`). If your project has a `src/` folder, they go under `src/`.

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
