#!/usr/bin/env node
/**
 * Once UI 2.x → 3.0 codemod, F11: plain part names.
 *
 *   F11 3.0 has no dot-namespaced compounds. A part is a plain named export:
 *       `Sortable.Item` / `Sortable.Handle` → `SortableItem` /
 *       `SortableHandle` (`@once-ui-system/core`), and `StylePanel.Root`,
 *       `StylePanel.Brand` and every other section → `StylePanelRoot`,
 *       `StylePanelBrand`… (`@once-ui-system/blocks`). A dotted name breaks
 *       when a server component reaches into a "use client" module, and two
 *       spellings of one part get mistyped.
 *
 * Rewrites every member reference — JSX tags (`<Sortable.Item>`, and the
 * closing tag), `typeof Sortable.Item`, a namespace's `Once.Sortable.Item` —
 * and adds the part names to the import that brought the compound in (under
 * its alias, if the file aliased it). The compound's own specifier is
 * dropped when nothing else uses it. MDX, where components have no import,
 * is rewritten by name. A part name the file already binds to something
 * else is reported instead. Idempotent.
 *
 * It only touches these names, so it is safe to run on code already on 3.0.
 *
 * Usage:  node scripts/codemod-3.0-part-names.mjs <dir> [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { importBindings, specifiersOf } from "./codemod-2.0.mjs";
import { braceList, codeOnly, located } from "./codemod-3.0-format.mjs";

/** compound → the parts that were attached to it, each now `${compound}${part}`. */
export const PART_NAMES = {
	Sortable: ["Item", "Handle"],
	StylePanel: [
		"Root",
		"Group",
		"Row",
		"Theme",
		"Shape",
		"Brand",
		"Accent",
		"Neutral",
		"Solid",
		"Effect",
		"Surface",
		"Density",
		"Scaling",
		"Transition",
		"DataStyle",
		"BodySize",
		"BodyLineHeight",
		"Page",
		"Color",
		"SolidStyle",
		"BodyText",
		"Advanced",
	],
};

/** Every new plain name, for the import passes. */
export const PART_EXPORTS = Object.entries(PART_NAMES).flatMap(([base, parts]) => parts.map((p) => base + p));

const ONCE = /^@once-ui-system\/(?:core|blocks)(?:\/|$)/;
const esc = (s) => s.replace(/[$]/g, "\\$");
const IMPORT = /import\s+(type\s+)?\{([^}]*)\}\s*from\s*(["'])([^"']+)\3/g;

/** The local name a specifier binds. */
const localOf = (text) => text.replace(/^type\s+/, "").split(/\s+as\s+/).pop().trim();
const keyOf = (text) => text.replace(/^type\s+/, "");

/**
 * `src` with `add` joined to, and `drop` taken out of, the `import { … }`
 * statement that binds `local` — in alphabetical place when the list was
 * sorted, else at its end, laid out as the list was.
 */
function editImport(src, local, add, drop) {
	IMPORT.lastIndex = 0;
	let m;
	while ((m = IMPORT.exec(src))) {
		// Skip an import inside a code sample's template string.
		if ((src.slice(0, m.index).match(/`/g) ?? []).length % 2 !== 0) continue;
		const clause = m[2];
		const parts = specifiersOf(clause).map((s) => s.text);
		if (!parts.some((p) => localOf(p) === local)) continue;
		const have = new Set(parts.map(localOf));
		const added = add.filter((n) => !have.has(n));
		const kept = drop ? parts.filter((p) => localOf(p) !== local) : parts;
		if (!added.length && kept.length === parts.length) return src;
		const sorted = parts.every((p, i) => i === 0 || keyOf(parts[i - 1]).localeCompare(keyOf(p)) <= 0);
		const all = sorted ? [...kept, ...added].sort((a, b) => keyOf(a).localeCompare(keyOf(b))) : [...kept, ...added];
		const lineStart = src.lastIndexOf("\n", m.index) + 1;
		const indent = /^[ \t]*/.exec(src.slice(lineStart, m.index))[0];
		const open = m.index + m[0].indexOf("{");
		const close = open + 1 + clause.length + 1;
		return src.slice(0, open) + braceList(all, clause, indent) + src.slice(close);
	}
	return src;
}

/** Namespaces the file imports Once UI under: `import * as Once from "@once-ui-system/core"`. */
function namespacesOf(src) {
	return [...src.matchAll(/import\s+\*\s+as\s+([\w$]+)\s+from\s*(["'])([^"']+)\2/g)]
		.filter((m) => ONCE.test(m[3]))
		.map((m) => m[1]);
}

export function transformPartNames(src, { file = null } = {}) {
	const hits = [];
	const warnings = [];
	const mdx = /\.mdx$/.test(file ?? "");
	// Where code is: comments and quoted strings blanked (a displayName or an
	// error message stays), template strings kept (code samples migrate too).
	// MDX prose names the parts in backticks, so all of it is read.
	const code = mdx ? src : codeOnly(src, { jsxText: true });
	// An import in MDX is sample text in a code fence: read the names as written.
	const bindings = mdx ? Object.assign(new Map(), { declared: new Set() }) : importBindings(src);
	const edits = [];
	const imports = [];

	for (const [base, parts] of Object.entries(PART_NAMES)) {
		const alternation = parts.join("|");
		let locals = [...bindings].filter(([, b]) => b.canonical === base && ONCE.test(b.source)).map(([l]) => l);
		const imported = locals.length > 0;
		// MDX gets its components from the provider, with no import.
		if (!imported && !bindings.has(base) && !bindings.declared?.has(base)) locals = [base];

		for (const local of locals) {
			const re = new RegExp(`(?<![\\w$.])${esc(local)}\\.(${alternation})(?![\\w$])`, "g");
			const added = new Set();
			let rewrote = false;
			for (const m of code.matchAll(re)) {
				const target = base + m[1];
				// Already imported, maybe under an alias.
				const own = [...bindings].find(([, b]) => b.canonical === target && ONCE.test(b.source));
				let name = target;
				if (own) {
					name = own[0];
				} else if (bindings.has(target) || bindings.declared?.has(target)) {
					warnings.push(
						located(`${local}.${m[1]}: ${target} is already a name in this file; import Once UI's ${target} under another name and use that`, src, m.index),
					);
					continue;
				} else if (imported) {
					added.add(target);
				}
				edits.push({ at: m.index, end: m.index + m[0].length, text: name, hit: `${base}.${m[1]} → ${target}` });
				rewrote = true;
			}
			if (imported && rewrote) imports.push({ local, add: [...added] });
		}

		for (const ns of namespacesOf(src)) {
			const re = new RegExp(`(?<![\\w$.])${esc(ns)}\\.${base}\\.(${alternation})(?![\\w$])`, "g");
			for (const m of code.matchAll(re))
				edits.push({
					at: m.index,
					end: m.index + m[0].length,
					text: `${ns}.${base}${m[1]}`,
					hit: `${base}.${m[1]} → ${base}${m[1]}`,
				});
		}
	}

	if (!edits.length) return { out: src, hits, warnings };
	let out = src;
	edits.sort((a, b) => b.at - a.at);
	for (const e of edits) {
		out = out.slice(0, e.at) + e.text + out.slice(e.end);
		hits.push(e.hit);
	}
	for (const { local, add } of imports) {
		// Drop the compound's specifier when nothing outside its import uses it any more.
		const rest = codeOnly(out, { jsxText: true }).replace(/^import\s[^;]*?from\s*["'][^"']+["'];?/gm, "");
		const used = new RegExp(`(?<![\\w$.])${esc(local)}(?![\\w$])`).test(rest);
		out = editImport(out, local, add, !used);
	}
	return { out, hits, warnings };
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
	const [dir, ...flags] = process.argv.slice(2);
	if (!dir) {
		console.error("usage: codemod-3.0-part-names.mjs <dir> [--dry]");
		process.exit(1);
	}
	const dry = flags.includes("--dry");
	const files = [];
	(function walk(d) {
		for (const e of fs.readdirSync(d, { withFileTypes: true })) {
			if (["node_modules", ".next", ".git", "dist", ".turbo"].includes(e.name)) continue;
			const p = path.join(d, e.name);
			if (e.isDirectory()) walk(p);
			else if (/\.(tsx|jsx|mdx|ts|js|mjs|cjs|md)$/.test(e.name) && !e.name.endsWith(".d.ts")) files.push(p);
		}
	})(dir);
	let total = 0;
	let touched = 0;
	for (const f of files) {
		const src = fs.readFileSync(f, "utf8");
		const { out, hits, warnings } = transformPartNames(src, { file: f.replace(/\.md$/, ".mdx") });
		if (!hits.length && !warnings.length) continue;
		console.log(f);
		for (const w of warnings) console.log(`   ! ${w}  (fix by hand)`);
		for (const h of [...new Set(hits)]) console.log(`   ${h}  ×${hits.filter((x) => x === h).length}`);
		if (out !== src) {
			touched++;
			total += hits.length;
			if (!dry) fs.writeFileSync(f, out);
		}
	}
	console.log(`\n${total} change${total === 1 ? "" : "s"} across ${touched} file${touched === 1 ? "" : "s"}${dry ? " (dry run)" : ""}`);
}
