#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { add } from "./commands/add.js";
import { create } from "./commands/create.js";
import { list } from "./commands/list.js";
import { login, logout, whoami } from "./commands/login.js";
import { update } from "./commands/update.js";
import { CliError, createClient } from "./lib/api.js";
import { apiBase, getToken } from "./lib/config.js";

const HELP = `once-ui — scaffold apps from Stack surfaces and add Once UI blocks

Usage
  once-ui create <dir> [--surfaces landing,docs] [--slices billing] [--name my-app] [--url https://…]
  once-ui add <block…> [--overwrite] [--no-install]
  once-ui update [block…] [--dry-run] [--force] [--no-install]
                                Bring added blocks up to date; files you edited are kept
  once-ui list                  Surfaces and slices in the current Stack release, and which you own
  once-ui login [--no-browser]  Sign in through once-ui.com in your browser
  once-ui login --token oui_…   Or save an access token (pipe one in, or set ONCE_UI_TOKEN)
  once-ui whoami                Who you're signed in as, and what your plan unlocks
  once-ui logout                Revoke this machine's token and forget it

Options
  --api <url>   Server to use (default https://once-ui.com, or ONCE_UI_API)
  -h, --help    Show this help
  -v, --version Show the version`;

function version(): string {
  const pkg = new URL("../package.json", import.meta.url);
  return JSON.parse(readFileSync(pkg, "utf8")).version;
}

async function main(argv: string[]) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      api: { type: "string" },
      token: { type: "string" },
      surfaces: { type: "string" },
      slices: { type: "string" },
      name: { type: "string" },
      url: { type: "string" },
      overwrite: { type: "boolean" },
      force: { type: "boolean" },
      "dry-run": { type: "boolean" },
      "no-install": { type: "boolean" },
      "no-browser": { type: "boolean" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });

  const [command, ...rest] = positionals;
  if (values.version) return console.log(version());
  if (values.help || !command) return console.log(HELP);

  const api = apiBase(values.api);
  const client = () => getToken().then((token) => createClient(api, token));

  switch (command) {
    case "login":
      return login(api, { token: values.token, browser: !values["no-browser"] });
    case "logout":
      return logout(api);
    case "whoami":
      return whoami(api);
    case "list":
      return list(await client());
    case "create":
      return create(await client(), rest[0], values);
    case "add":
      return add(await client(), rest, {
        overwrite: values.overwrite,
        install: !values["no-install"],
      });
    case "update":
      return update(await client(), rest, {
        force: values.force,
        dryRun: values["dry-run"],
        install: !values["no-install"],
      });
    default:
      throw new CliError(`Unknown command "${command}".\n\n${HELP}`);
  }
}

main(process.argv.slice(2)).catch((error: unknown) => {
  if (
    error instanceof CliError ||
    (error as { code?: string }).code?.startsWith("ERR_PARSE_ARGS")
  ) {
    console.error((error as Error).message);
  } else {
    console.error(error);
  }
  process.exit(1);
});
