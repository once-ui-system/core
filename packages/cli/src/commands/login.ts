import { spawn } from "node:child_process";
import { CliError, createClient, getCatalog } from "../lib/api.js";
import { clearToken, configPath, saveToken } from "../lib/config.js";
import { ask, readStdin } from "../lib/prompt.js";

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

/**
 * Store an access token for later commands.
 *
 * The token comes from `--token`, from stdin when it is piped, or from a paste
 * after the tokens page opens in the browser. It is checked against the API
 * before it is saved, so a typo fails here and not three commands later.
 */
export async function login(api: string, flags: { token?: string }) {
  let token = flags.token?.trim() ?? "";
  if (!token && !process.stdin.isTTY) token = await readStdin();
  if (!token) {
    const url = `${api}/account/tokens`;
    console.log(`Create an access token at ${url}`);
    openInBrowser(url);
    token = await ask("Paste the token here: ");
  }
  if (!token.startsWith("oui_")) {
    throw new CliError("That doesn't look like a Once UI access token (they start with oui_).");
  }

  const catalog = await getCatalog(createClient(api, token));
  if (!catalog.signedIn) {
    throw new CliError("The server did not accept that token. It may be revoked or mistyped.");
  }

  await saveToken(token);
  const owned = catalog.surfaces.filter((s) => s.owned).map((s) => s.id);
  console.log(`Signed in. Token saved to ${configPath()}`);
  console.log(`Surfaces you can scaffold: ${owned.join(", ") || "none"}`);
}

export async function logout() {
  await clearToken();
  console.log("Signed out. The token still exists on the server; revoke it on the tokens page.");
}
