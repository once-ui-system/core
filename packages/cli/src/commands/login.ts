import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { hostname } from "node:os";
import { type ApiClient, CliError, createClient, failureFrom } from "../lib/api.js";
import { clearToken, configPath, getToken, saveToken } from "../lib/config.js";
import { readStdin } from "../lib/prompt.js";

function openInBrowser(url: string) {
  const command =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  try {
    const child = spawn(command, args, { stdio: "ignore", detached: true });
    child.on("error", () => {});
    child.unref();
  } catch {
    // no browser here; the URL is printed anyway
  }
}

export type Whoami = {
  email: string | null;
  blocks: boolean;
  tier: string | null;
  stack: "subscription" | "grant" | "free";
};

/** Who the token belongs to, or null while the server doesn't know it (yet). */
export async function fetchWhoami(client: ApiClient): Promise<Whoami | null> {
  const res = await client.fetch("/api/cli/whoami");
  if (res.status === 401) return null;
  if (res.status === 404) {
    throw new CliError(
      `${client.base} does not support browser sign-in. Create a token at ${client.base}/account/tokens and run \`once-ui login --token oui_…\`.`,
    );
  }
  if (!res.ok) throw await failureFrom(res);
  return (await res.json()) as Whoami;
}

/** A new access token, its hash, and the code both the terminal and the approval page show. */
export function newLoginRequest() {
  const token = `oui_${randomBytes(24).toString("hex")}`;
  const hash = createHash("sha256").update(token).digest("hex");
  const code = `${hash.slice(0, 4)}-${hash.slice(4, 8)}`.toUpperCase();
  return { token, hash, code };
}

export function loginUrl(api: string, hash: string, device: string, issuedAt: number) {
  const url = new URL("/cli/login", api);
  url.searchParams.set("h", hash);
  url.searchParams.set("n", device);
  url.searchParams.set("t", String(issuedAt));
  return url.toString();
}

export type LoginFlags = {
  token?: string;
  /** Print the link without opening a browser. */
  browser?: boolean;
  /** How often to ask whether the login was approved, and for how long. Tests shorten these. */
  pollMs?: number;
  timeoutMs?: number;
};

/**
 * Sign the CLI in.
 *
 * By default it opens once-ui.com in the browser: the CLI makes a token here,
 * sends only its hash in the link, and waits until the signed-in user approves
 * it there. `--token`, a piped token or `ONCE_UI_TOKEN` skip the browser for
 * CI and machines without one.
 */
export async function login(api: string, flags: LoginFlags) {
  let token = flags.token?.trim() ?? "";
  if (!token && !process.stdin.isTTY) token = await readStdin();
  if (token) return saveChecked(api, token);

  const request = newLoginRequest();
  const url = loginUrl(api, request.hash, hostname(), Math.floor(Date.now() / 1000));
  console.log(
    `Open this link to sign in, and check it shows the code ${request.code}:\n\n  ${url}\n`,
  );
  if (flags.browser !== false) openInBrowser(url);
  console.log("Waiting for you to approve it in the browser… (Ctrl+C to cancel)");

  const client = createClient(api, request.token);
  const deadline = Date.now() + (flags.timeoutMs ?? 15 * 60 * 1000);
  while (Date.now() < deadline) {
    const who = await fetchWhoami(client);
    if (who) {
      await saveToken(request.token);
      return printSignedIn(who);
    }
    await new Promise((resolve) => setTimeout(resolve, flags.pollMs ?? 2000));
  }
  throw new CliError("The link expired before it was approved. Run `once-ui login` again.");
}

async function saveChecked(api: string, token: string) {
  if (!token.startsWith("oui_")) {
    throw new CliError("That doesn't look like a Once UI access token (they start with oui_).");
  }
  const who = await fetchWhoami(createClient(api, token));
  if (!who)
    throw new CliError("The server did not accept that token. It may be revoked or mistyped.");
  await saveToken(token);
  printSignedIn(who);
}

function printSignedIn(who: Whoami) {
  console.log(`\nSigned in${who.email ? ` as ${who.email}` : ""}. Token saved to ${configPath()}`);
  console.log(describeAccess(who));
}

export function describeAccess(who: Whoami): string {
  const blocks = who.blocks
    ? `Pro blocks: yes${who.tier ? ` (${who.tier})` : ""}`
    : "Pro blocks: no";
  const stack =
    who.stack === "subscription"
      ? "Stack: every surface"
      : who.stack === "grant"
        ? "Stack: the surfaces in your grant"
        : "Stack: free surfaces only";
  return `${blocks} · ${stack}`;
}

export async function whoami(api: string) {
  const token = await getToken();
  if (!token) throw new CliError("Not signed in. Run `once-ui login`.");
  const who = await fetchWhoami(createClient(api, token));
  if (!who) throw new CliError("The stored token is no longer valid. Run `once-ui login` again.");
  console.log(who.email ?? "Signed in");
  console.log(describeAccess(who));
}

/** Forget the token here and revoke it on the server, so a copy of it stops working too. */
export async function logout(api: string) {
  const token = await getToken();
  let revoked = false;
  if (token && !process.env.ONCE_UI_TOKEN) {
    try {
      const res = await createClient(api, token).fetch("/api/cli/token", { method: "DELETE" });
      revoked = res.ok;
    } catch {
      // offline: the local copy still goes
    }
  }
  await clearToken();
  console.log(
    revoked
      ? "Signed out. The token is revoked."
      : `Signed out here. If the token still shows on ${api}/account/tokens, revoke it there.`,
  );
}
