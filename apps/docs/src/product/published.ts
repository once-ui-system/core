import path from "node:path";
import { gunzipSync } from "node:zlib";
import { type Platform, platformOfSlug } from "@/resources/platforms";
import { currentVersion } from "@/resources/versions";
import type { Availability } from "./availability";

/**
 * Which pages document something the published package does not export yet.
 *
 * Read from npm, not written by hand. A hand-kept `status: "unreleased"` went
 * stale the moment 2.2.0 published: Tabs, VisuallyHidden and a dozen others
 * kept saying "Soon" on the live site after they had shipped. Now a page is
 * marked only while the name it documents is missing from the package a reader
 * would install today, so the mark clears itself when the release lands.
 *
 * The pages that use this revalidate hourly, so a release shows up within the
 * hour without a redeploy.
 */
export const RELEASE_REVALIDATE_SECONDS = 3600;

/**
 * Folders whose pages each document one export, named by the page title (or
 * the `export` frontmatter key when the title is not the export's name).
 * Guides such as basics or quick start are never marked.
 */
const API_SECTIONS = new Set([
  "components",
  "form-controls",
  "hooks",
  "modules",
  "data",
  "effects",
  "contexts",
  "utils",
]);

interface PublishedPackage {
  version: string;
  exports: Set<string>;
}

/** `null`: npm could not be read, so nothing is marked rather than everything. */
type Lookup = PublishedPackage | "unpublished" | null;

const lookups = new Map<string, Promise<Lookup>>();

function distTag(platform: Platform): string {
  // The web docs follow the docs version (the 3.0 beta build reads `next`);
  // other platforms version on their own and read `latest`.
  return platform.id === "web" ? (currentVersion.npmTag ?? "latest") : "latest";
}

function lookup(platform: Platform): Promise<Lookup> {
  const key = `${platform.packageName}@${distTag(platform)}`;
  let pending = lookups.get(key);
  if (!pending) {
    pending = readPublished(platform.packageName, distTag(platform)).catch((error) => {
      console.warn(`Could not read ${key} from npm; no page is marked unreleased.`, error);
      lookups.delete(key);
      return null;
    });
    lookups.set(key, pending);
  }
  return pending;
}

async function readPublished(name: string, tag: string): Promise<Lookup> {
  const registry = `https://registry.npmjs.org/${name.replace("/", "%2f")}`;
  const meta = await fetch(registry, {
    headers: { accept: "application/vnd.npm.install-v1+json" },
    next: { revalidate: RELEASE_REVALIDATE_SECONDS },
  });
  if (meta.status === 404) return "unpublished";
  if (!meta.ok) throw new Error(`registry answered ${meta.status}`);

  const doc = (await meta.json()) as {
    "dist-tags"?: Record<string, string>;
    versions?: Record<string, { dist?: { tarball?: string } }>;
  };
  const version = doc["dist-tags"]?.[tag];
  if (!version) return "unpublished";
  const tarball = doc.versions?.[version]?.dist?.tarball;
  if (!tarball) throw new Error(`no tarball for ${version}`);

  // A version's tarball never changes, so it is cached for good.
  const pack = await fetch(tarball, { cache: "force-cache" });
  if (!pack.ok) throw new Error(`tarball answered ${pack.status}`);
  const files = untar(gunzipSync(Buffer.from(await pack.arrayBuffer())));

  return { version, exports: exportedNames(files) };
}

/** The files of a tarball, by path inside `package/`. */
function untar(tar: Buffer): Map<string, string> {
  const files = new Map<string, string>();
  let offset = 0;
  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    if (header[0] === 0) break;
    const field = (start: number, length: number) =>
      header.toString("utf8", start, start + length).split("\0")[0];
    const name = [field(345, 155), field(0, 100)].filter(Boolean).join("/");
    const size = Number.parseInt(field(124, 12).trim() || "0", 8);
    const type = field(156, 1);
    offset += 512;
    if ((type === "0" || type === "") && /\.(d\.ts|json)$/.test(name)) {
      files.set(name.replace(/^package\//, ""), tar.toString("utf8", offset, offset + size));
    }
    offset += Math.ceil(size / 512) * 512;
  }
  return files;
}

/** Every name the package's entry points export, following `export *`. */
function exportedNames(files: Map<string, string>): Set<string> {
  const pkg = JSON.parse(files.get("package.json") ?? "{}") as {
    types?: string;
    exports?: Record<string, unknown>;
  };
  const entries = new Set<string>();
  if (pkg.types) entries.add(pkg.types);
  for (const target of Object.values(pkg.exports ?? {})) {
    const types =
      typeof target === "object" && target ? (target as { types?: unknown }).types : undefined;
    if (typeof types === "string" && !types.includes("*")) entries.add(types);
  }

  const names = new Set<string>();
  const seen = new Set<string>();
  const resolve = (from: string, spec: string) => {
    const base = path.posix.join(path.posix.dirname(from), spec.replace(/\.js$/, ""));
    return [`${base}.d.ts`, `${base}/index.d.ts`].find((file) => files.has(file));
  };
  const walk = (file: string | undefined) => {
    if (!file || seen.has(file)) return;
    seen.add(file);
    const source = files.get(file);
    if (!source) return;
    for (const m of source.matchAll(/export\s+\*\s+from\s+["']([^"']+)["']/g))
      walk(resolve(file, m[1]));
    for (const m of source.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g)) {
      for (const part of m[1].split(",")) {
        const name = part
          .trim()
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)
          .pop()
          ?.trim();
        if (name) names.add(name);
      }
    }
    for (const m of source.matchAll(
      /export\s+(?:declare\s+)?(?:function|const|class|let|var|type|interface|enum)\s+(\w+)/g,
    )) {
      names.add(m[1]);
    }
  };
  for (const entry of entries) walk(path.posix.normalize(entry));
  return names;
}

export interface ReleasablePage {
  slug: string;
  title: string;
  /** Frontmatter `export`: the name the page documents when not its title, or `false` for a guide. */
  exportName?: string | false;
}

/** Whether the page documents something a reader cannot install yet. */
export async function availabilityOf(page: ReleasablePage): Promise<Availability | undefined> {
  const platform = platformOfSlug(page.slug);
  const published = await lookup(platform);
  if (published === null) return undefined;
  // Before a package's first release, every page of its platform is ahead of it.
  if (published === "unpublished") return "unreleased";

  const segments = page.slug.split("/").slice(platform.root ? 1 : 0);
  if (segments.length < 2 || !API_SECTIONS.has(segments[0])) return undefined;

  // `export: false` opts a guide out; a title that is not an identifier
  // ("Components overview") names no export, so it is a guide too.
  if (page.exportName === false) return undefined;
  const name = page.exportName ?? page.title;
  if (!/^[A-Za-z_$][\w$]*$/.test(name)) return undefined;
  return published.exports.has(name) ? undefined : "unreleased";
}
