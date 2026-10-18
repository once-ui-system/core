#!/usr/bin/env node
/**
 * Once UI 2.x → 3.0 codemod, B2 and F9: import sources.
 *
 *   B2  The subset subpaths are gone: `@once-ui-system/core/components`,
 *       `/contexts`, `/hooks`, `/icons`, `/types`, `/interfaces`, `/utils`
 *       and `/modules` re-exported parts of the root, and `/components/<Name>`
 *       reached every file in `dist/components`. Their imports move to the
 *       root, or to the subpath below when the name moved.
 *   F9  Off the root: `EmojiPicker` (with its emoji data) is on
 *       `@once-ui-system/core/emoji`; `MediaAudioPlayer`, `MediaVideoPlayer`,
 *       `Scrubber` and `CompareImage` are on `@once-ui-system/core/media`,
 *       beside `MediaUpload`.
 *   F8  The sixteen effects (`RevealFx`, `CountFx`, `Effect`…) are their own
 *       package, `@once-ui-system/fx`.
 *   F10 Banner, Book, LogoCloud, ScrollToTop, StylePanel and StyleOverlay are
 *       their own package, `@once-ui-system/blocks`.
 *
 * Rewrites `import`/`export … from` statements (named, type-only, default and
 * namespace) and `import("…")`. A statement that mixes names is split, and a
 * moved name joins an existing import of its subpath when the file has one.
 * What cannot be moved exactly is reported: a namespace import that reaches a
 * moved name (`Once.EmojiPicker`), a deep import of a module that was never
 * public, and any other `@once-ui-system/core/…` specifier 3.0 does not have.
 *
 * It only reads and writes import sources, so it is safe to run on code that
 * is already on 3.0 (unlike the full codemod, whose units pass reads numbers
 * as 2.x rem). Idempotent.
 *
 * Usage:  node scripts/codemod-3.0-imports.mjs <dir> [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { specifiersOf } from "./codemod-2.0.mjs";

const ROOT = "@once-ui-system/core";

/**
 * Exports that left the root barrel in 3.0: for a subpath (F9), or for a
 * package of their own (F8, F10), which the app installs beside core.
 */
export const MOVED_IMPORTS = {
	[`${ROOT}/emoji`]: ["EmojiPicker", "EmojiPickerProps"],
	[`${ROOT}/media`]: [
		"MediaAudioPlayer",
		"MediaAudioPlayerProps",
		"MediaVideoPlayer",
		"Scrubber",
		"ScrubberProps",
		"ScrubberBlock",
		"ScrubberTrack",
		"CompareImage",
	],
	"@once-ui-system/fx": [
		"BlobFx",
		"BlobFxProps",
		"CelebrationFx",
		"CountdownFx",
		"CountdownFxProps",
		"CountFx",
		"CountFxProps",
		"Effect",
		"EffectProps",
		"EffectType",
		"FlipFx",
		"FlipFxProps",
		"GlitchFx",
		"HoloFx",
		"LetterFx",
		"MatrixFx",
		"BulgeConfig",
		"ParticleFx",
		"RevealFx",
		"ShineFx",
		"ShineFxProps",
		"TiltFx",
		"TypeFx",
		"TypeFxProps",
		"WeatherFx",
	],
	"@once-ui-system/blocks": [
		"Banner",
		"Book",
		"BookProps",
		"LogoCloud",
		"ScrollToTop",
		"StyleOverlay",
		"StylePanel",
		"StylePanelProps",
		"useStylePanel",
		"StyleGroupProps",
		"StylePanelCustomLabels",
		"StylePanelGroupLabels",
		"StylePanelHeading",
		"StylePanelLabels",
		"StylePanelNameLabels",
		"StylePanelOptionLabels",
		"StylePanelRootProps",
		"StylePanelRowLabels",
		"StylePanelSchemeRow",
		"StylePanelSwatchLabels",
		"StylePanelValue",
		"StylePanelVisibility",
		"StyleRowProps",
		"StyleSchemeRowProps",
	],
};

/** The packages 3.0 split off core (F8, F10): an app adds them to its dependencies. */
export const NEW_PACKAGES = ["@once-ui-system/fx", "@once-ui-system/blocks"];

/** The new packages `out` imports from and `src` did not: what the app now has to install. */
export function packagesAdded(src, out) {
	const sources = (text) =>
		new Set([...text.matchAll(/(["'])(@once-ui-system\/(?:fx|blocks))\1/g)].map((m) => m[2]));
	const before = sources(src);
	return [...sources(out)].filter((name) => !before.has(name));
}

const MOVED_TO = new Map(
	Object.entries(MOVED_IMPORTS).flatMap(([target, names]) => names.map((name) => [name, target])),
);

/** Subpaths 3.0 removed (B2). Everything they exported is on the root, or moved above. */
export const REMOVED_SUBPATHS = [
	"components",
	"contexts",
	"hooks",
	"icons",
	"types",
	"interfaces",
	"utils",
	"modules",
];

/** The entry points 3.0 has; any other `@once-ui-system/core/…` is reported. */
export const SUBPATHS_3_0 = [
	"config",
	"server",
	"next",
	"data",
	"code",
	"emoji",
	"media",
	"mdx",
	"package.json",
	"AGENTS.md",
];
const isEntry = (source) =>
	source === ROOT ||
	SUBPATHS_3_0.some((sub) => source === `${ROOT}/${sub}`) ||
	/^@once-ui-system\/core\/(css|ai)\//.test(source);

/**
 * Files `./components/*` exposed that were never on the root: internals of
 * other components. 3.0 has no public replacement.
 */
const INTERNAL_MODULES = new Set([
	"DropdownTriggerContext",
	"FormContext",
	"OptionRoleContext",
	"RadioGroupContext",
	"StylePanelSections",
	"SharedInteractiveStyles",
]);

/**
 * What a 2.x source becomes, or null if it is not one of the removed ones.
 * `{ root: true }` for a subset subpath; `{ root: true, module }` for a deep
 * `components/<Name>` import, whose names may also be moved.
 */
function removedSource(source) {
	const m = source.match(/^@once-ui-system\/core\/([^/]+)(?:\/(.+))?$/);
	if (!m || !REMOVED_SUBPATHS.includes(m[1])) return null;
	const [, sub, rest] = m;
	if (!rest) return { module: null };
	if (sub === "components") return { module: rest.replace(/\.(js|tsx?|d\.ts)$/, "").replace(/\/index$/, "") };
	return { module: rest, unknownDeep: true };
}

const STATEMENT =
	/(?<![\w$.])(import|export)(\s+type)?\s*(\{[^}]*\}|\*\s*as\s+[\w$]+|\*|[\w$]+(?:\s*,\s*(?:\{[^}]*\}|\*\s*as\s+[\w$]+))?)\s*from\s*(["'])(@once-ui-system\/core(?:\/[^"']*)?)\4([ \t]*;)?/g;

/** Split a clause into its default, namespace and named parts. */
function clauseParts(clause) {
	const parts = { def: null, ns: null, named: null, star: false };
	let rest = clause.trim();
	if (rest === "*") return { ...parts, star: true };
	const def = rest.match(/^([\w$]+)\s*(?:,\s*|$)/);
	if (def) {
		parts.def = def[1];
		rest = rest.slice(def[0].length);
	}
	const ns = rest.match(/^\*\s*as\s+([\w$]+)/);
	if (ns) parts.ns = ns[1];
	const named = rest.match(/^\{([^}]*)\}/);
	if (named) parts.named = specifiersOf(named[1]);
	return parts;
}

/** `{ a, b }`, or one specifier per line when the clause was written that way. */
function braces(texts, clause, indent) {
	if (!clause.includes("\n")) return `{ ${texts.join(", ")} }`;
	const inner = clause.match(/\n([ \t]*)\S/)?.[1] ?? `${indent}  `;
	return `{\n${texts.map((text) => `${inner}${text},`).join("\n")}\n${indent}}`;
}

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const MARK = "\u0000";

export function transformImports(src) {
	const hits = [];
	const warnings = [];
	/** `${kw}|${target}` → the moved specifiers, in order, and the quote style. */
	const moved = new Map();
	const namespaces = [];
	/** Sources a statement was left alone and reported for. */
	const reported = new Set();

	let out = src.replace(STATEMENT, (whole, keyword, typeKw, clause, q, source, semi, offset) => {
		const removed = removedSource(source);
		if (!removed && source !== ROOT) return whole;
		const parts = clauseParts(clause);
		const kw = `${keyword}${typeKw ? " type" : ""}`;
		semi = semi ? ";" : "";
		if (removed?.unknownDeep) {
			warnings.push(`${source}: 3.0 has no deep imports; import from "${ROOT}" instead`);
			reported.add(source);
			return whole;
		}
		if (removed?.module && INTERNAL_MODULES.has(removed.module)) {
			warnings.push(`${source}: an internal module that ./components/* exposed; 3.0 has no public equivalent`);
			reported.add(source);
			return whole;
		}
		if (parts.def) {
			warnings.push(`${source}: a default import (${parts.def}); Once UI has named exports only, use { ${parts.def} }`);
			reported.add(source);
			return whole;
		}
		// A deep `components/<Name>` import keeps a namespace on the subpath its module moved to.
		const deepTarget = (removed?.module && MOVED_TO.get(removed.module)) || ROOT;
		if (!parts.named) {
			if (parts.ns) namespaces.push(parts.ns);
			if (parts.star && keyword === "export")
				warnings.push(
					`export * from "${source}": in 3.0 it does not re-export EmojiPicker (now on "${ROOT}/emoji"), MediaAudioPlayer, MediaVideoPlayer, Scrubber and CompareImage (now on "${ROOT}/media"), the effects (now in "@once-ui-system/fx") or Banner, Book, LogoCloud, ScrollToTop, StylePanel and StyleOverlay (now in "@once-ui-system/blocks")`,
				);
			if (!removed) return whole;
			hits.push(`${source} → ${deepTarget}`);
			return `${kw} ${clause.trim()} from ${q}${deepTarget}${q}${semi}`;
		}
		const groups = new Map();
		for (const spec of parts.named) {
			const target = MOVED_TO.get(spec.name) ?? ROOT;
			if (!groups.has(target)) groups.set(target, []);
			groups.get(target).push(spec.text);
		}
		if (!removed && groups.size === 1 && groups.has(ROOT)) return whole;
		const lineStart = src.lastIndexOf("\n", offset - 1) + 1;
		const indent = /^[ \t]*$/.test(src.slice(lineStart, offset)) ? src.slice(lineStart, offset) : "";
		const lines = [];
		// What stays on the root first, then each subpath.
		const ordered = [...groups].sort(([a], [b]) => (a === ROOT ? -1 : b === ROOT ? 1 : 0));
		for (const [target, texts] of ordered) {
			for (const text of texts) {
				if (target !== source) hits.push(`${specifiersOf(text)[0].name}: ${source} → ${target}`);
			}
			if (target === ROOT) {
				lines.push(`${kw} ${braces(texts, clause, indent)} from ${q}${ROOT}${q}${semi}`);
				continue;
			}
			const key = `${kw}|${target}`;
			if (!moved.has(key)) moved.set(key, { q, semi, texts: [] });
			moved.get(key).texts.push(...texts);
			lines.push(`${MARK}${key}${MARK}`);
		}
		return lines.join(`\n${indent}`);
	});

	// Moved names join a named import of their subpath that the file already
	// has, or take the place of the first statement they came from.
	for (const [key, { q, semi, texts }] of moved) {
		const [kw, target] = key.split("|");
		const marker = `${MARK}${key}${MARK}`;
		const names = (list) => list.map((text) => specifiersOf(text)[0].name);
		const unique = texts.filter((text, i) => names(texts).indexOf(names([text])[0]) === i);
		const existing = new RegExp(
			`(?<![\\w$.])(${kw.replace(" ", "\\s+")}\\s*\\{)([^}]*)(\\}\\s*from\\s*["']${escape(target)}["'])`,
		);
		const found = out.match(existing);
		let replacement = null;
		if (found) {
			const have = specifiersOf(found[2]);
			const add = unique.filter((text) => !have.some((s) => s.name === names([text])[0]));
			out = out.replace(existing, (_, open, _list, close) => `${open} ${[...have.map((s) => s.text), ...add].join(", ")} ${close}`);
		} else {
			replacement = `${kw} { ${unique.join(", ")} } from ${q}${target}${q}${semi}`;
		}
		// Every other placeholder for this key goes, with the line break before it.
		let first = true;
		out = out.replace(new RegExp(`(\\n[ \\t]*)?${escape(marker)}`, "g"), (_, before = "") => {
			const keep = first && replacement;
			first = false;
			return keep ? `${before}${replacement}` : "";
		});
	}
	// A file that began with a placeholder that went keeps no blank first line.
	if (out.startsWith("\n") && !src.startsWith("\n")) out = out.slice(1);

	// Dynamic imports: `import("@once-ui-system/core/components/X")`.
	out = out.replace(/(?<![\w$.])import\s*\(\s*(["'])(@once-ui-system\/core\/[^"']+)\1\s*\)/g, (whole, q, source) => {
		const removed = removedSource(source);
		if (!removed || removed.unknownDeep || INTERNAL_MODULES.has(removed.module)) return whole;
		const target = (removed.module && MOVED_TO.get(removed.module)) || ROOT;
		hits.push(`import(${source}) → import(${target})`);
		return `import(${q}${target}${q})`;
	});

	// A namespace import of the root no longer reaches a moved name.
	for (const local of namespaces) {
		for (const [name, target] of MOVED_TO) {
			if (new RegExp(`(?<![\\w$.])${escape(local)}\\.${name}\\b`).test(out))
				warnings.push(`${local}.${name}: ${name} is on "${target}" in 3.0; import it from there`);
		}
	}

	// Anything else that names a core subpath 3.0 does not have.
	for (const m of out.matchAll(/(["'`])(@once-ui-system\/core\/[^"'`\s]+)\1/g)) {
		const source = m[2];
		if (isEntry(source) || reported.has(source)) continue;
		warnings.push(`${source}: not an entry point in 3.0; import from "${ROOT}" or one of its subpaths`);
	}
	return { out, hits, warnings: [...new Set(warnings)] };
}

const invokedDirectly =
	process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
	const [dir, ...flags] = process.argv.slice(2);
	if (!dir) {
		console.error("usage: codemod-3.0-imports.mjs <dir> [--dry]");
		process.exit(1);
	}
	const dry = flags.includes("--dry");
	const files = [];
	(function walk(d) {
		for (const e of fs.readdirSync(d, { withFileTypes: true })) {
			if (["node_modules", ".next", ".git", "dist", ".turbo"].includes(e.name)) continue;
			const p = path.join(d, e.name);
			if (e.isDirectory()) walk(p);
			else if (/\.(tsx|jsx|mdx|ts|js|mjs|cjs)$/.test(e.name) && !e.name.endsWith(".d.ts")) files.push(p);
		}
	})(dir);
	let total = 0;
	let touched = 0;
	const install = new Set();
	for (const f of files) {
		const src = fs.readFileSync(f, "utf8");
		const { out, hits, warnings } = transformImports(src);
		for (const name of packagesAdded(src, out)) install.add(name);
		if (!hits.length && !warnings.length) continue;
		console.log(f);
		for (const w of warnings) console.log(`   ! ${w}  (fix by hand)`);
		for (const h of [...new Set(hits)]) console.log(`   ${h}`);
		if (out !== src) {
			touched++;
			total += hits.length;
			if (!dry) fs.writeFileSync(f, out);
		}
	}
	console.log(
		`\n${total} change${total === 1 ? "" : "s"} across ${touched} file${touched === 1 ? "" : "s"}${dry ? " (dry run)" : ""}`,
	);
	if (install.size) console.log(`Now imported, so add to your dependencies: ${[...install].join(", ")}`);
}
