/**
 * Once UI 2.x → 3.0 codemod: 2.x JSX kept inside JSON strings.
 *
 * Generators and scaffolders keep copies of source in JSON: anchors a
 * transform looks for (`"find": "…<Tag scheme=\"brand\" …"`), templates,
 * snippets. tsc, lint and the build never read them, so once the source is
 * migrated a stale copy only fails when the generator runs ("anchor not
 * found"). Each JSON string value that holds JSX is run through the codemod
 * on its own (by name, as MDX is):
 *
 *   - when the string is a byte-exact copy of text in a file this run
 *     rewrote, and its rewrite is byte-exact text of that file's new
 *     version, the string is rewritten (the copy stays a copy);
 *   - otherwise, when the rewrite changes anything, the string is reported
 *     with what would change, and left alone.
 *
 * Strings with no JSX, or whose JSX needs nothing, are not touched.
 */
import { lineOf } from "./codemod-3.0-format.mjs";

/** Every JSON string literal in `text`: `{ at, end, value }` (offsets of the quoted literal). */
export function jsonStrings(text) {
	const out = [];
	for (let i = 0; i < text.length; i++) {
		if (text[i] !== '"') continue;
		let j = i + 1;
		while (j < text.length && text[j] !== '"') {
			if (text[j] === "\n") break;
			j += text[j] === "\\" ? 2 : 1;
		}
		if (text[j] !== '"') {
			i = j;
			continue;
		}
		const raw = text.slice(i, j + 1);
		let value = null;
		try {
			value = JSON.parse(raw);
		} catch {}
		if (typeof value === "string") out.push({ at: i, end: j + 1, value });
		i = j;
	}
	return out;
}

/** JSX a 2.x → 3.0 rewrite could touch: a capitalised element, or a member one (`<core.Button`). */
const JSX = /<[A-Z][\w$]*(?:\.[A-Z][\w$]*)?(?=[\s/>])/;

/**
 * The JSON file `text` with its JSX strings migrated where that is provably
 * the copy of migrated source, and reports for the rest.
 *
 * `transform(src)` is the codemod's (`{ out, hits, warnings }`); `rewritten`
 * the files this run changed, as `{ src, out }` (the text before and after).
 */
export function transformJsonStrings(text, { transform, rewritten = [] }) {
	const hits = [];
	const warnings = [];
	const edits = [];
	for (const s of jsonStrings(text)) {
		if (!JSX.test(s.value)) continue;
		let r;
		try {
			r = transform(s.value);
		} catch {
			continue;
		}
		if (r.out === s.value) continue;
		const line = lineOf(text, s.at);
		const what = [...new Set(r.hits)].join("; ");
		const copyOf = rewritten.filter((f) => f.src.includes(s.value));
		if (copyOf.length && copyOf.some((f) => f.out.includes(r.out))) {
			const encoded = JSON.stringify(r.out);
			// The string's own escaping (no `<` or `\/`) is JSON.stringify's
			// unless it was written otherwise; a hand-escaped string is reported.
			if (JSON.stringify(s.value) !== text.slice(s.at, s.end)) {
				warnings.push(
					`JSON string: a copy of 2.x source this run rewrote (${what}); its escaping is not JSON.stringify's, so update it by hand to the migrated text (line ${line})`,
				);
				continue;
			}
			edits.push({ at: s.at, end: s.end, text: encoded });
			hits.push(...r.hits.map((h) => `JSON string: ${h}`));
			continue;
		}
		warnings.push(
			copyOf.length
				? `JSON string: a copy of 2.x source that this run rewrote in its own file; the string alone does not migrate to the same text, so update it by hand to match (${what}) (line ${line})`
				: `JSON string: holds 2.x JSX that 3.0 renamed or changed (${what}); if a generator or a find/replace reads it, update it to the 3.0 text (line ${line})`,
		);
	}
	let out = text;
	for (const e of edits.sort((a, b) => b.at - a.at)) out = out.slice(0, e.at) + e.text + out.slice(e.end);
	return { out, hits, warnings };
}
