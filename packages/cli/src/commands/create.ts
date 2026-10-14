import { existsSync } from "node:fs";
import { mkdir, readdir, rm } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { x as extract } from "tar";
import { type ApiClient, CliError, failureFrom, getCatalog } from "../lib/api.js";
import { packageNameFrom } from "../lib/paths.js";
import { ask } from "../lib/prompt.js";

export type CreateFlags = {
  surfaces?: string;
  slices?: string;
  name?: string;
  url?: string;
};

const split = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Scaffold a new app into `dir` from the surfaces asked for.
 *
 * Without `--surfaces` it lists what the account owns and asks. The server
 * assembles the app and streams it back as a tarball, which is unpacked
 * straight into the directory; nothing else is written.
 */
export async function create(client: ApiClient, dir: string | undefined, flags: CreateFlags) {
  if (!dir) throw new CliError("Usage: once-ui create <directory> [--surfaces landing,docs]");
  const target = resolve(dir);
  if (existsSync(target) && (await readdir(target)).length > 0) {
    throw new CliError(`${dir} already exists and is not empty.`);
  }

  let surfaces = split(flags.surfaces);
  if (!surfaces.length) {
    const catalog = await getCatalog(client);
    const owned = catalog.surfaces.filter((s) => s.owned);
    console.log("Surfaces you can scaffold:");
    for (const s of owned) console.log(`  ${s.id.padEnd(10)} ${s.title}`);
    const others = catalog.surfaces.filter((s) => !s.owned).map((s) => s.id);
    if (others.length) console.log(`Not in your plan: ${others.join(", ")}`);
    surfaces = split(await ask("Which surfaces? (comma-separated) "));
    if (!surfaces.length) throw new CliError("No surfaces chosen.");
  }

  const res = await client.fetch("/api/stack/scaffold", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      surfaces,
      slices: split(flags.slices),
      name: flags.name ?? packageNameFrom(target),
      ...(flags.url ? { url: flags.url } : {}),
    }),
  });
  if (!res.ok) throw await failureFrom(res);
  if (!res.body) throw new CliError("The server sent an empty response.");

  const created = !existsSync(target);
  await mkdir(target, { recursive: true });
  try {
    await pipeline(
      Readable.fromWeb(res.body as unknown as WebReadableStream<Uint8Array>),
      extract({ cwd: target }),
    );
  } catch (error) {
    if (created) await rm(target, { recursive: true, force: true });
    throw error;
  }

  const shown = relative(process.cwd(), target) || ".";
  const release = res.headers.get("x-stack-release");
  console.log(
    `\nCreated ${shown} from ${surfaces.join(", ")}${release ? ` (Stack ${release.slice(0, 7)})` : ""}.`,
  );
  console.log("\nNext:");
  if (shown !== ".") console.log(`  cd ${shown}`);
  console.log("  npm install");
  console.log("  npm run dev");
}
