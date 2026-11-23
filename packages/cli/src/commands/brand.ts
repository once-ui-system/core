import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { type ApiClient, CliError } from "../lib/api.js";
import {
  applyBrand,
  type BrandSummary,
  findConfig,
  generateBrand,
  listBrands,
  pullBrand,
  saveCandidate,
} from "../lib/brand.js";
import { ask } from "../lib/prompt.js";

export type BrandFlags = {
  /** Which candidate to keep, 0 to 3, instead of asking (for scripts and agents). */
  pick?: string;
  /** board (default), board-icons or svg. */
  engine?: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const line = (b: BrandSummary) =>
  `  ${b.id}  ${b.name.padEnd(18)} ${b.brand}  ${b.scheme.padEnd(8)} ${b.font}`;

/**
 * Generates a brand from a description, lets the person pick one of the four
 * candidates (their SVGs are written to a temp folder to open, and the board
 * link shows them all), and keeps it. Returns the saved brand.
 */
export async function newBrand(
  client: ApiClient,
  description: string,
  flags: BrandFlags = {},
): Promise<BrandSummary> {
  console.log("Drawing four candidates on once-ui.com (this takes up to two minutes)…");
  const generation = await generateBrand(client, description, flags.engine);
  if (!generation.generationId || !generation.candidates.length)
    throw new CliError("The generation came back empty. Try again with a few more words.");

  const folder = await mkdtemp(join(tmpdir(), "once-ui-brand-"));
  for (const c of generation.candidates) {
    await writeFile(join(folder, `candidate-${c.pick}.svg`), c.mark);
    if (c.wordmark) await writeFile(join(folder, `candidate-${c.pick}-wordmark.svg`), c.wordmark);
  }
  console.log(
    `\n${generation.name ?? "Your brand"}${generation.tagline ? `: ${generation.tagline}` : ""}`,
  );
  console.log(`Color ${generation.brand ?? "?"}, type ${generation.font ?? "Geist"}`);
  console.log(`\nCandidates 0 to ${generation.candidates.length - 1}, as SVG in ${folder}`);
  console.log(`See them all on the board: ${generation.boardUrl}\n`);

  const last = generation.candidates.length - 1;
  const answer = flags.pick ?? (await ask(`Keep which one? (0-${last}) `));
  const pick = Number.parseInt(answer, 10);
  if (!Number.isInteger(pick) || pick < 0 || pick > last)
    throw new CliError(`Pick a number from 0 to ${last}.`);
  const saved = await saveCandidate(client, generation.generationId, pick);
  console.log(`Saved "${saved.name}" as ${saved.id}.`);
  return saved;
}

/** Writes a saved brand into the app at `dir`. */
export async function pull(client: ApiClient, id: string, dir = ".") {
  if (!findConfig(dir))
    throw new CliError(
      `${dir === "." ? "This folder" : dir} has no once-ui.config. Run this in an app's root, or pass the app's folder.`,
    );
  const brand = await pullBrand(client, id);
  const { written, configFile } = await applyBrand(dir, brand);
  console.log(`\nWrote "${brand.name}" into ${relative(process.cwd(), dir) || "."}:`);
  for (const file of written) console.log(`  ${file}`);
  if (configFile)
    console.log(
      `\n${configFile}: brand "custom", brandSeed ${brand.brand}, heading ${brand.font}.`,
    );
}

/** `once-ui brand new|list|pull`. */
export async function brand(client: ApiClient, args: string[], flags: BrandFlags) {
  const [sub, ...rest] = args;
  switch (sub) {
    case "list": {
      const { brands } = await listBrands(client);
      if (!brands.length) {
        console.log('No saved brands yet. Make one with `once-ui brand new "what it is"`.');
        return;
      }
      console.log("Your brands (id, name, color, nearest scheme, typeface):");
      for (const b of brands) console.log(line(b));
      return;
    }
    case "new": {
      const description = rest.join(" ").trim();
      if (!description) throw new CliError('Usage: once-ui brand new "Fjell, maps for hikers"');
      const saved = await newBrand(client, description, flags);
      if (findConfig(".")) await pull(client, saved.id, ".");
      else console.log(`\nPut it into an app with: once-ui brand pull ${saved.id} <dir>`);
      return;
    }
    case "pull": {
      const [id, dir] = rest;
      if (!id || !UUID.test(id))
        throw new CliError("Usage: once-ui brand pull <id> [dir]  (ids: once-ui brand list)");
      return pull(client, id, dir ?? ".");
    }
    default:
      throw new CliError(
        'Usage: once-ui brand new "<description>" [--pick 0-3] | brand list | brand pull <id> [dir]',
      );
  }
}

/** `create --brand`: a saved brand's id, or a description to generate from. */
export async function brandForCreate(client: ApiClient, value: string, flags: BrandFlags) {
  if (UUID.test(value.trim())) return value.trim();
  return (await newBrand(client, value, flags)).id;
}
