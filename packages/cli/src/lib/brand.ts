import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { type ApiClient, CliError, failureFrom } from "./api.js";

/**
 * Brands from once-ui.com's Brand Kit, through its API (/api/brand-kit/v1):
 * generate one from a description (Pro and Indie), keep a candidate, and
 * write a saved brand into an app. The server draws every file; this side
 * writes them and points the app's once-ui.config at the brand.
 */

export type Candidate = { pick: number; mark: string; wordmark: string | null };

export type Generation = {
  generationId: string | null;
  name: string | null;
  tagline: string | null;
  brand: string | null;
  font: string | null;
  candidates: Candidate[];
  boardUrl: string;
};

export type BrandSummary = {
  id: string;
  name: string;
  tagline: string | null;
  brand: string;
  scheme: string;
  font: string;
  icon: string;
};

export type BrandFile = { path: string; text?: string; base64?: string };

export type PulledBrand = BrandSummary & {
  config: { name: string; style: { brand: string; brandSeed: string }; fonts: { heading: string } };
  files: BrandFile[];
  agentsNote?: string;
};

async function json<T>(client: ApiClient, path: string, init?: RequestInit): Promise<T> {
  const res = await client.fetch(path, init);
  if (res.status === 404)
    throw new CliError(
      "Brand Kit's API is not open on this account yet (or that brand does not exist).",
    );
  if (!res.ok) throw await failureFrom(res);
  return (await res.json()) as T;
}

const post = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export const generateBrand = (client: ApiClient, prompt: string, engine?: string) =>
  json<Generation>(client, "/api/brand-kit/v1/generate", post({ prompt, engine }));

export const saveCandidate = (client: ApiClient, generationId: string, pick: number) =>
  json<BrandSummary>(client, "/api/brand-kit/v1/brands", post({ generationId, pick }));

export const listBrands = (client: ApiClient) =>
  json<{ brands: BrandSummary[] }>(client, "/api/brand-kit/v1/brands");

export const pullBrand = (client: ApiClient, id: string) =>
  json<PulledBrand>(client, `/api/brand-kit/v1/brands/${encodeURIComponent(id)}`);

/** Where once-ui.config lives in an app, or null. */
export function findConfig(dir: string): string | null {
  for (const file of [
    "src/resources/once-ui.config.js",
    "src/resources/once-ui.config.ts",
    "src/resources/once-ui.config.mjs",
    "once-ui.config.js",
    "once-ui.config.ts",
  ]) {
    if (existsSync(join(dir, file))) return file;
  }
  return null;
}

/** `"Space Grotesk"` → `Space_Grotesk`, the export name `next/font/google` uses. */
const fontExport = (family: string) => family.replace(/[^A-Za-z0-9]+/g, "_");

/**
 * Points a once-ui.config at a brand: `brand: "custom"` with the exact color
 * as `brandSeed`, the heading typeface and the product name. Each edit is
 * skipped when its anchor is not there, so a config that drifted keeps its
 * own look instead of breaking.
 */
export function brandConfig(source: string, brand: PulledBrand["config"]): string {
  const seed = brand.style.brandSeed;
  let out = source;
  const style = /(const style\s*=\s*\{)([\s\S]*?)(\n\};?)/.exec(out);
  if (style) {
    let body = style[2].replace(/(\n\s*brand:\s*)["'][^"']*["']/, `$1"custom"`);
    if (/\n\s*brandSeed:/.test(body))
      body = body.replace(/(\n\s*brandSeed:\s*)["'][^"']*["']/, `$1"${seed}"`);
    else if (/\n(\s*)brand:/.test(body))
      body = body.replace(/(\n(\s*)brand:[^\n]*)/, `$1\n$2brandSeed: "${seed}",`);
    out = out.replace(style[0], `${style[1]}${body}${style[3]}`);
  }
  out = out.replace(
    /(const schema\s*=\s*\{[\s\S]*?\n\s*name:\s*)("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')/,
    (_, lead: string) => `${lead}${JSON.stringify(brand.name)}`,
  );
  const font = brand.fonts.heading;
  const heading = /const heading\s*=\s*([A-Z][A-Za-z0-9_]*)\(/.exec(out);
  if (font && heading && heading[1] !== fontExport(font)) {
    const id = fontExport(font);
    const imported = new RegExp(`import \\{[^}]*\\b${id}\\b[^}]*\\} from ["']next/font/google["']`);
    if (!imported.test(out)) {
      out = out.replace(
        /(import \{[^}]*\} from ["']next\/font\/google["'];?)/,
        `$1\nimport { ${id} } from "next/font/google";`,
      );
    }
    out = out.replace(heading[0], `const heading = ${id}(`);
  }
  return out;
}

/** Writes a pulled brand into the app at `dir`. Returns what it wrote. */
export async function applyBrand(dir: string, brand: PulledBrand) {
  const root = resolve(dir);
  const written: string[] = [];
  for (const file of brand.files) {
    const target = resolve(root, file.path);
    // The server names the paths; never write outside the app.
    if (target !== root && !target.startsWith(`${root}${sep}`))
      throw new CliError(`Refusing to write ${file.path}: it is outside ${dir}.`);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(
      target,
      file.base64 !== undefined ? Buffer.from(file.base64, "base64") : (file.text ?? ""),
    );
    written.push(relative(root, target));
  }
  const configFile = findConfig(root);
  if (configFile) {
    const path = join(root, configFile);
    const source = await readFile(path, "utf8");
    const next = brandConfig(source, brand.config);
    if (next !== source) {
      await writeFile(path, next);
      written.push(configFile);
    }
  }
  const agents = join(root, "AGENTS.md");
  if (brand.agentsNote && existsSync(agents)) {
    const notes = await readFile(agents, "utf8");
    if (!notes.includes(brand.agentsNote)) {
      await writeFile(agents, `${notes.trimEnd()}\n\n${brand.agentsNote}\n`);
      written.push("AGENTS.md");
    }
  }
  return { written, configFile };
}
