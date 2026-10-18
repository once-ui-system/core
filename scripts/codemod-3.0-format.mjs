/**
 * Once UI 2.x → 3.0 codemod: writing import lists the way the file wrote them.
 *
 * Every pass that renames, adds or moves an import specifier writes its list
 * through `braceList`, so a list on one line stays on one line, and a list
 * written one name per line keeps that layout: the same indentation, the
 * closing brace where it was, and a trailing comma only when the original
 * list ended with one. Formatters (Biome, Prettier) then have nothing to undo.
 */

/**
 * `texts` as an import's `{ … }`, laid out like `clause` (the text that was
 * between the braces). `indent` is the indentation of the statement itself,
 * for the closing brace of a multi-line list.
 */
export function braceList(texts, clause, indent = "") {
	if (!clause.includes("\n")) {
		const pad = /^\s/.test(clause) || !clause.trim() ? " " : "";
		return `{${pad}${texts.join(", ")}${pad}}`;
	}
	const inner = clause.match(/\n([ \t]*)\S/)?.[1] ?? `${indent}  `;
	const trailing = /,\s*$/.test(clause);
	const last = texts.length - 1;
	return `{\n${texts.map((t, i) => `${inner}${t}${i < last || trailing ? "," : ""}`).join("\n")}\n${indent}}`;
}

/**
 * `names` added to the file's first `import { … } from "@once-ui-system/core"`
 * (not one inside a code sample's template string): in alphabetical place
 * when the list was sorted, else at its end. Null when there is no such import.
 */
export function addToCoreImport(src, names) {
	const IMPORT = /^import\s+\{([^}]*)\}\s*from\s*(["'])@once-ui-system\/core\2/gm;
	let m;
	while ((m = IMPORT.exec(src))) {
		if ((src.slice(0, m.index).match(/`/g) ?? []).length % 2 === 0) break;
	}
	if (!m) return null;
	const inner = m[1];
	const parts = inner
		.split(",")
		.map((p) => p.trim())
		.filter(Boolean);
	const have = new Set(parts.map((p) => p.replace(/^type\s+/, "").split(/\s+as\s+/).pop().trim()));
	const add = names.filter((n) => !have.has(n));
	if (!add.length) return src;
	const key = (p) => p.replace(/^type\s+/, "");
	const sorted = parts.every((p, i) => i === 0 || key(parts[i - 1]).localeCompare(key(p)) <= 0);
	const all = sorted ? [...parts, ...add].sort((a, b) => key(a).localeCompare(key(b))) : [...parts, ...add];
	return `${src.slice(0, m.index)}import ${braceList(all, inner)} from ${m[2]}@once-ui-system/core${m[2]}${src.slice(m.index + m[0].length)}`;
}

/**
 * `src` with comments and string contents blanked (lengths kept), and with
 * JSX text too when `jsxText` is set: what is left are the names code uses.
 */
export function codeOnly(src, { jsxText = false } = {}) {
	const blank = (m) => m.replace(/[^\n]/g, " ");
	let out = src.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/(^|[^:\w"'`\\])(\/\/.*)$/gm, (m, a, c) => a + blank(c));
	if (jsxText)
		out = out.replace(
			/((?<!=)>|\})((?:[^<>{}();=&]|&#?\w+;)*[A-Za-z](?:[^<>{}();=&]|&#?\w+;)*)(?=<\/?[A-Za-z])/g,
			(m, open, text) => `${open}${blank(text)}`,
		);
	return out.replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, (m) => m[0] + blank(m.slice(1, -1)) + m[0]);
}

/**
 * The specifier that binds `local` taken out of the file's
 * `import { … } from "@once-ui-system/core"` statements, keeping their
 * layout; a statement left empty goes with its line.
 */
export function removeFromCoreImport(src, local) {
	const re = /(?<![^\n])([ \t]*)import\s+(type\s+)?\{([^}]*)\}\s*from\s*(["'])(@once-ui-system\/core)\4(;?)[ \t]*(\n|$)/g;
	return src.replace(re, (whole, indent, typeKw, clause, q, source, semi, nl) => {
		const parts = clause
			.split(",")
			.map((p) => p.trim())
			.filter(Boolean);
		const keep = parts.filter((p) => p.replace(/^type\s+/, "").split(/\s+as\s+/).pop().trim() !== local);
		if (keep.length === parts.length) return whole;
		if (!keep.length) return "";
		return `${indent}import ${typeKw ?? ""}${braceList(keep, clause, indent)} from ${q}${source}${q}${semi}${nl}`;
	});
}
