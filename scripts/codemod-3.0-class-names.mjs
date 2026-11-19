#!/usr/bin/env node
/**
 * Once UI 2.x → 3.0 codemod, G6: utility class names Tailwind CSS shares.
 *
 *   G6 3.0 spells out the spacing, offset and grid-column utilities, because
 *      Tailwind CSS owns the short names with another scale (its `p-4` is
 *      1rem, Once UI's `p-4` was 4px): `p-16` → `padding-16`, `mt-8` →
 *      `margin-top-8`, `mx-auto` → `margin-x-auto`, `top-16` →
 *      `offset-top-16`, `columns-2` → `grid-columns-2`, with every breakpoint
 *      form (`s-p-16` → `s-padding-16`). Props are unchanged; only a class
 *      written by hand needs this.
 *
 * Rewrites the class names in `className="…"` and in the string and template
 * parts of `className={…}` (clsx and classNames calls included). A project
 * that has Tailwind CSS in its package.json is not rewritten: there `p-4`
 * already meant Tailwind's, so each Once UI-looking class is reported
 * instead. Idempotent.
 *
 * Usage:  node scripts/codemod-3.0-class-names.mjs <dir> [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SPACING = {
	p: "padding",
	px: "padding-x",
	py: "padding-y",
	pt: "padding-top",
	pr: "padding-right",
	pb: "padding-bottom",
	pl: "padding-left",
	m: "margin",
	mx: "margin-x",
	my: "margin-y",
	mt: "margin-top",
	mr: "margin-right",
	mb: "margin-bottom",
	ml: "margin-left",
};

const BP = "((?:xs|s|m|l|xl)-)?";
const STEP = "(?:0|1|2|4|8|12|16|20|24|32|40|48|56|64|72|80|104|128|160)";
// A class is a whole token: not inside `radius-m-4` or `hover:p-4`.
const EDGE_BEFORE = "(?<![\\w:/-])";
const EDGE_AFTER = "(?![\\w-])";
const RULES = [
	[
		new RegExp(`${EDGE_BEFORE}${BP}(px|py|pt|pr|pb|pl|mx|my|mt|mr|mb|ml|p|m)-(${STEP}|xs|s|m|l|xl|auto)${EDGE_AFTER}`, "g"),
		(_, bp = "", prefix, value) =>
			value === "auto" && !prefix.startsWith("m") ? null : `${bp}${SPACING[prefix]}-${value}`,
	],
	[
		new RegExp(`${EDGE_BEFORE}${BP}(top|right|bottom|left)-(${STEP})${EDGE_AFTER}`, "g"),
		(_, bp = "", side, value) => `${bp}offset-${side}-${value}`,
	],
	[
		new RegExp(`${EDGE_BEFORE}${BP}columns-((?:[1-9]|1[0-2])|auto-fit)${EDGE_AFTER}`, "g"),
		(_, bp = "", n) => `${bp}grid-columns-${n}`,
	],
];

/** `text` with every 2.x class rewritten, and what changed. */
export function renameClasses(text) {
	const changed = [];
	let out = text;
	for (const [re, to] of RULES) {
		out = out.replace(re, (whole, ...groups) => {
			const next = to(whole, ...groups.slice(0, -2));
			if (!next) return whole;
			changed.push(`${whole} → ${next}`);
			return next;
		});
	}
	return { out, changed };
}

/** The end of the `{…}` that opens at `start`, skipping strings and templates. */
function braceEnd(src, start) {
	let depth = 0;
	for (let i = start; i < src.length; i++) {
		const c = src[i];
		if (c === '"' || c === "'" || c === "`") {
			const q = c;
			for (i++; i < src.length && src[i] !== q; i++) {
				if (src[i] === "\\") i++;
				else if (q === "`" && src[i] === "$" && src[i + 1] === "{") i = braceEnd(src, i + 1);
			}
		} else if (c === "{") depth++;
		else if (c === "}" && --depth === 0) return i;
	}
	return -1;
}

/** Each quoted part of an expression: string literals and template text, not `${…}`. */
function quotedSpans(src, from, to) {
	const spans = [];
	for (let i = from; i < to; i++) {
		const c = src[i];
		if (c !== '"' && c !== "'" && c !== "`") continue;
		let start = i + 1;
		for (i++; i < to && src[i] !== c; i++) {
			if (src[i] === "\\") i++;
			else if (c === "`" && src[i] === "$" && src[i + 1] === "{") {
				spans.push([start, i]);
				const end = braceEnd(src, i + 1);
				// `${cond ? "pb-0" : ""}`: the strings inside are classes too.
				spans.push(...quotedSpans(src, i + 2, end));
				i = end;
				start = i + 1;
			}
		}
		spans.push([start, i]);
	}
	return spans;
}

/**
 * G6. `tailwind`: the project uses Tailwind CSS, so the short names are
 * Tailwind's and are only reported.
 */
export function transformClassNames(src, { tailwind = false } = {}) {
	const hits = [];
	const warnings = [];
	const spans = [];
	for (const m of src.matchAll(/\bclassName=(["'])([^"']*)\1/g)) {
		const at = m.index + "className=".length + 1;
		spans.push([at, at + m[2].length]);
	}
	for (const m of src.matchAll(/\bclassName=\{/g)) {
		const open = m.index + m[0].length - 1;
		const close = braceEnd(src, open);
		if (close > 0) spans.push(...quotedSpans(src, open + 1, close));
	}
	if (!spans.length) return { out: src, hits, warnings };
	spans.sort((a, b) => b[0] - a[0]);
	let out = src;
	for (const [from, to] of spans) {
		const { out: text, changed } = renameClasses(out.slice(from, to));
		if (!changed.length) continue;
		if (tailwind) {
			const line = src.slice(0, from).split("\n").length;
			warnings.push(
				`className ${changed.map((c) => c.split(" → ")[0]).join(", ")}: Tailwind's class in this project. If it was Once UI's, it is ${changed.map((c) => c.split(" → ")[1]).join(", ")} in 3.0 (line ${line})`,
			);
			continue;
		}
		out = out.slice(0, from) + text + out.slice(to);
		for (const c of changed) hits.push(`className ${c}`);
	}
	return { out, hits, warnings };
}

/** Whether the package.json at or above `dir` lists Tailwind CSS. */
export function usesTailwind(dir) {
	for (let d = path.resolve(dir); ; d = path.dirname(d)) {
		const file = path.join(d, "package.json");
		if (fs.existsSync(file)) {
			try {
				const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
				const deps = { ...pkg.dependencies, ...pkg.devDependencies };
				return Object.keys(deps).some((name) => name === "tailwindcss" || name.startsWith("@tailwindcss/"));
			} catch {
				return false;
			}
		}
		if (path.dirname(d) === d) return false;
	}
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
	const [dir, ...flags] = process.argv.slice(2);
	if (!dir) {
		console.error("usage: codemod-3.0-class-names.mjs <dir> [--dry]");
		process.exit(1);
	}
	const dry = flags.includes("--dry");
	const tailwind = usesTailwind(dir);
	let total = 0;
	(function walk(d) {
		for (const e of fs.readdirSync(d, { withFileTypes: true })) {
			if (["node_modules", ".next", ".git", "dist"].includes(e.name)) continue;
			const p = path.join(d, e.name);
			if (e.isDirectory()) walk(p);
			else if (/\.(tsx|jsx|mdx)$/.test(e.name)) {
				const src = fs.readFileSync(p, "utf8");
				const { out, hits, warnings } = transformClassNames(src, { tailwind });
				if (!hits.length && !warnings.length) continue;
				console.log(p);
				for (const w of warnings) console.log(`   ! ${w}  (fix by hand)`);
				for (const h of hits) console.log(`   ${h}`);
				total += hits.length;
				if (!dry && out !== src) fs.writeFileSync(p, out);
			}
		}
	})(dir);
	console.log(`\n${total} class name${total === 1 ? "" : "s"} rewritten${dry ? " (dry run)" : ""}`);
}
