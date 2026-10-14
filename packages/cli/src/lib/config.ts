import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export const DEFAULT_API = "https://once-ui.com";

/** Where the token lives: `$XDG_CONFIG_HOME/once-ui/config.json`, else `~/.config/once-ui/`. */
export function configPath(env: NodeJS.ProcessEnv = process.env): string {
  const base = env.XDG_CONFIG_HOME || join(homedir(), ".config");
  return join(base, "once-ui", "config.json");
}

type StoredConfig = { token?: string };

async function readConfig(env: NodeJS.ProcessEnv = process.env): Promise<StoredConfig> {
  try {
    return JSON.parse(await readFile(configPath(env), "utf8")) as StoredConfig;
  } catch {
    return {};
  }
}

/**
 * The access token to send, if any. `ONCE_UI_TOKEN` wins over the stored one,
 * so CI can authenticate without writing a config file.
 */
export async function getToken(env: NodeJS.ProcessEnv = process.env): Promise<string | null> {
  const fromEnv = env.ONCE_UI_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  return (await readConfig(env)).token ?? null;
}

/** Store the token readable by this user only. */
export async function saveToken(token: string, env: NodeJS.ProcessEnv = process.env) {
  const path = configPath(env);
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  await writeFile(path, `${JSON.stringify({ ...(await readConfig(env)), token }, null, 2)}\n`, {
    mode: 0o600,
  });
  // `mode` only applies when the file is created; tighten an existing one too.
  await chmod(path, 0o600);
}

export async function clearToken(env: NodeJS.ProcessEnv = process.env) {
  await rm(configPath(env), { force: true });
}

/** The server to talk to. `--api` or `ONCE_UI_API` point it at a local or preview deployment. */
export function apiBase(flag: string | undefined, env: NodeJS.ProcessEnv = process.env): string {
  return (flag || env.ONCE_UI_API || DEFAULT_API).replace(/\/+$/, "");
}
