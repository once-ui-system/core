/**
 * Once UI 2.x → 3.0 codemod: the app's own components (D2).
 *
 * A wrapper whose props are a Once UI layout component's
 * (`React.ComponentProps<typeof Column>`, or an interface that extends them)
 * and that spreads the rest of them onto that component hands a size prop
 * straight on, so a bare number given to it was rem in 2.x exactly as on the
 * component itself. This module finds out whether a wrapper does that, by
 * reading its source: in the same file, through a relative import, or through
 * a path alias of the nearest tsconfig.json / jsconfig.json
 * (`compilerOptions.paths`, `@/*` → `./src/*`), following re-exports
 * (`export { A } from "./A"`, `export * from "./A"`) a few levels deep.
 *
 * It answers only what it can see: a prop the wrapper takes out by name, a
 * rest object used any other way than `{...rest}` on a Once UI layout
 * element, a default import, or a type it cannot read means "not known",
 * and the caller keeps reporting the number instead of rewriting it.
 */
import fs from "node:fs";
import path from "node:path";
import { importBindings, isCoreSource } from "./codemod-2.0.mjs";
import { codeOnly } from "./codemod-3.0-format.mjs";
import { elementsOf } from "./codemod-3.0-leaf.mjs";

const EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".mjs"];
const configs = new Map();

/** JSON with comments and trailing commas (tsconfig's dialect) parsed, or null. */
function parseJsonc(text) {
	let out = "";
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (c === '"') {
			let j = i + 1;
			while (j < text.length && text[j] !== '"') j += text[j] === "\\" ? 2 : 1;
			out += text.slice(i, j + 1);
			i = j;
		} else if (c === "/" && text[i + 1] === "/") {
			while (i < text.length && text[i] !== "\n") i++;
			out += "\n";
		} else if (c === "/" && text[i + 1] === "*") {
			const end = text.indexOf("*/", i + 2);
			i = end < 0 ? text.length : end + 1;
		} else out += c;
	}
	try {
		return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"));
	} catch {
		return null;
	}
}

/** `compilerOptions.paths` of a config file, following `extends` to a relative file: `{ paths, base }`. */
function readConfig(file, depth = 0) {
	const json = fs.existsSync(file) ? parseJsonc(fs.readFileSync(file, "utf8")) : null;
	if (!json) return null;
	const dir = path.dirname(file);
	const options = json.compilerOptions ?? {};
	let inherited = null;
	if (typeof json.extends === "string" && json.extends.startsWith(".") && depth < 4) {
		const parent = path.resolve(dir, json.extends);
		inherited = readConfig(fs.existsSync(parent) ? parent : `${parent}.json`, depth + 1);
	}
	if (!options.paths) return inherited;
	// Paths resolve against baseUrl when it is set, else against the config that declares them.
	return { paths: options.paths, base: path.resolve(dir, options.baseUrl ?? ".") };
}

/** The path aliases in force for `file`: those of the nearest tsconfig.json or jsconfig.json above it. */
export function pathAliases(file) {
	let dir = path.dirname(path.resolve(file));
	const seen = [];
	for (;;) {
		if (configs.has(dir)) {
			const found = configs.get(dir);
			for (const d of seen) configs.set(d, found);
			return found;
		}
		seen.push(dir);
		for (const name of ["tsconfig.json", "jsconfig.json"]) {
			const config = path.join(dir, name);
			if (fs.existsSync(config)) {
				const found = readConfig(config);
				for (const d of seen) configs.set(d, found);
				return found;
			}
		}
		const up = path.dirname(dir);
		if (up === dir) {
			for (const d of seen) configs.set(d, null);
			return null;
		}
		dir = up;
	}
}

/** The candidate paths an alias maps `source` to, or null when no alias matches it. */
function aliasTargets(file, source) {
	const config = file ? pathAliases(file) : null;
	if (!config) return null;
	let best = null;
	for (const [pattern, targets] of Object.entries(config.paths)) {
		if (!Array.isArray(targets)) continue;
		const star = pattern.indexOf("*");
		let captured;
		if (star < 0) {
			if (pattern !== source) continue;
			captured = "";
		} else {
			const prefix = pattern.slice(0, star);
			const suffix = pattern.slice(star + 1);
			if (!source.startsWith(prefix) || !source.endsWith(suffix) || source.length < prefix.length + suffix.length) continue;
			captured = source.slice(prefix.length, source.length - suffix.length);
		}
		// The longest prefix wins, as in TypeScript.
		const weight = star < 0 ? Number.POSITIVE_INFINITY : star;
		if (best && best.weight >= weight) continue;
		best = { weight, paths: targets.map((t) => path.resolve(config.base, t.replace("*", captured))) };
	}
	return best?.paths ?? null;
}

/** Whether `source` names the app's own code through one of `file`'s tsconfig path aliases. */
export function isAliasSource(file, source) {
	return aliasTargets(file, source) !== null;
}

/** The file `source`, imported from `file`, resolves to: a relative path or a path alias; null otherwise. */
export function resolveOwn(file, source) {
	const bases = source.startsWith(".") ? [path.resolve(path.dirname(file), source)] : aliasTargets(file, source);
	if (!bases) return null;
	for (const base of bases) {
		const tries = [base, ...EXTENSIONS.map((e) => base + e), ...EXTENSIONS.map((e) => path.join(base, `index${e}`))];
		// `./Button.js` naming `./Button.tsx`, as NodeNext sources write it.
		if (/\.(m?js|jsx)$/.test(base)) tries.push(...[".tsx", ".ts"].map((e) => base.replace(/\.(m?js|jsx)$/, e)));
		for (const t of tries) {
			try {
				if (fs.statSync(t).isFile()) return t;
			} catch {}
		}
	}
	return null;
}

/** The index after the bracket group that opens at `i` (strings and comments skipped). */
function groupEnd(text, i) {
	const close = { "(": ")", "[": "]", "{": "}", "<": ">" }[text[i]];
	let depth = 0;
	for (let j = i; j < text.length; j++) {
		const c = text[j];
		if (c === '"' || c === "'" || c === "`") {
			let k = j + 1;
			while (k < text.length && text[k] !== c) k += text[k] === "\\" ? 2 : 1;
			j = k;
			continue;
		}
		if (c === text[i]) depth++;
		else if (c === close && --depth === 0) return j + 1;
	}
	return -1;
}

/** The top-level comma-separated parts of `text`, trimmed. */
function parts(text) {
	const out = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (c === '"' || c === "'" || c === "`") {
			let k = i + 1;
			while (k < text.length && text[k] !== c) k += text[k] === "\\" ? 2 : 1;
			i = k;
			continue;
		}
		if ("([{<".includes(c)) depth++;
		else if (")]}>".includes(c) && text[i - 1] !== "=") depth--;
		else if (c === "," && depth === 0) {
			out.push(text.slice(start, i).trim());
			start = i + 1;
		}
	}
	out.push(text.slice(start).trim());
	return out.filter(Boolean);
}

const LAYOUT_TYPE = /^(?:React\.)?ComponentProps(?:WithoutRef|WithRef)?<typeof([A-Za-z_$][\w$]*)>$/;

/**
 * The Once UI component whose props `type` (as written in `text`) is,
 * without `prop`: `ComponentProps<typeof Column>`, an interface extending it,
 * a type alias of it intersected with an object type, or an `Omit` of it that
 * leaves `prop` in. Null when it is not one of those.
 */
function layoutPropsOf(text, type, prop, isLayout, depth = 0) {
	const t = type.replace(/\s+/g, "");
	// `A & { … }`: one piece is a layout component's props, the object pieces leave the prop alone.
	const pieces = parts(t.replace(/&/g, ",")).length > 1 && !/[<({][^>)}]*&/.test(t) ? t.split("&") : null;
	if (pieces && depth < 4) {
		let found = null;
		for (const piece of pieces) {
			if (piece.startsWith("{")) {
				if (new RegExp(`(^|[;,{])${prop}\\??:`).test(piece)) return null;
				continue;
			}
			found ??= layoutPropsOf(text, piece, prop, isLayout, depth + 1);
		}
		return found;
	}
	const direct = LAYOUT_TYPE.exec(t);
	if (direct) return isLayout(direct[1]) ? direct[1] : null;
	const omit = /^Omit<(.+),((?:"[^"]*"|'[^']*')(?:\|(?:"[^"]*"|'[^']*'))*)>$/.exec(t);
	if (omit) {
		const names = omit[2].split("|").map((n) => n.slice(1, -1));
		return names.includes(prop) ? null : layoutPropsOf(text, omit[1], prop, isLayout, depth + 1);
	}
	if (!/^[A-Za-z_$][\w$]*$/.test(t) || depth > 3) return null;
	const declares = (body) => new RegExp(`(^|[;,{\\s])${prop}\\??\\s*:`).test(body);
	const iface = new RegExp(`\\binterface\\s+${t}\\s*(?:<[^>]*>)?\\s+extends\\s+([^{]+)\\{`).exec(text);
	if (iface) {
		const bodyAt = iface.index + iface[0].length - 1;
		const end = groupEnd(text, bodyAt);
		if (end < 0 || declares(text.slice(bodyAt, end))) return null;
		const bases = parts(iface[1]);
		for (const base of bases) {
			const found = layoutPropsOf(text, base, prop, isLayout, depth + 1);
			if (found) return found;
		}
		return null;
	}
	const alias = new RegExp(`\\btype\\s+${t}\\s*=\\s*`).exec(text);
	if (alias) {
		const at = alias.index + alias[0].length;
		const end = text.slice(at).search(/;|\n\s*(?:export|const|let|function|interface|type|import)\b/);
		const rhs = text.slice(at, end < 0 ? undefined : at + end);
		let found = null;
		for (const piece of rhs.split("&").map((p) => p.trim())) {
			if (piece.startsWith("{")) {
				if (declares(piece)) return null;
				continue;
			}
			found ??= layoutPropsOf(text, piece, prop, isLayout, depth + 1);
		}
		return found;
	}
	return null;
}

/**
 * Whether component `name`, exported by `file` (whose text is `text`), hands
 * `prop` on unchanged to a Once UI element that reads a 2.x number as rem.
 * `isRem(canonical, prop)` says which Once UI components do. The element's
 * name, or null when that cannot be seen.
 */
export function forwardsProp({ file, text, name, prop, isRem }, depth = 0) {
	if (depth > 4 || text === null) return null;
	// Local name → Once UI component, `import { type Flex }` included.
	const core = new Map();
	for (const [local, b] of importBindings(text))
		if (isCoreSource(b.source)) core.set(local.replace(/^type\s+/, ""), b.canonical.replace(/^type\s+/, ""));
	const coreName = (local) => core.get(local) ?? null;
	// Re-exports, to the file that defines it.
	for (const m of text.matchAll(/export\s*\{([^}]*)\}\s*from\s*(["'])([^"']+)\2/g)) {
		for (const spec of m[1].split(",").map((s) => s.trim()).filter(Boolean)) {
			const [orig, as] = spec.replace(/^type\s+/, "").split(/\s+as\s+/).map((x) => x.trim());
			if ((as ?? orig) !== name) continue;
			const next = file && resolveOwn(file, m[3]);
			return next ? forwardsProp({ file: next, text: read(next), name: orig, prop, isRem }, depth + 1) : null;
		}
	}
	const def = new RegExp(
		`(?:^|[\\s;])(?:export\\s+)?(?:(?:const|let|var)\\s+${name}\\s*(?::\\s*([^=]+?))?\\s*=|function\\s+${name}\\s*(?:<[^>]*>)?\\s*(?=\\())`,
	).exec(text);
	if (!def) {
		for (const m of text.matchAll(/export\s*\*\s*from\s*(["'])([^"']+)\1/g)) {
			const next = file && resolveOwn(file, m[2]);
			const found = next ? forwardsProp({ file: next, text: read(next), name, prop, isRem }, depth + 1) : null;
			if (found) return found;
		}
		return null;
	}
	// The first parameter: an object pattern `({ a, ...rest }: Props)`, or
	// the props object itself `(props: Props)`.
	const after = def.index + def[0].length;
	const head = text.slice(after, after + 400);
	const open = /\(\s*(?:\{|[A-Za-z_$][\w$]*\s*:)/.exec(head);
	if (!open) return null;
	let rest;
	let paramAt;
	let paramEnd;
	if (open[0].endsWith("{")) {
		paramAt = after + open.index + open[0].length - 1;
		paramEnd = groupEnd(text, paramAt);
		if (paramEnd < 0) return null;
		const pattern = parts(text.slice(paramAt + 1, paramEnd - 1));
		rest = pattern.find((p) => p.startsWith("..."))?.slice(3).trim();
		if (pattern.some((p) => new RegExp(`^${prop}\\b`).test(p))) return null; // taken out by name
	} else {
		rest = /\(\s*([A-Za-z_$][\w$]*)/.exec(open[0])[1];
		paramAt = after + open.index + open[0].indexOf(rest);
		paramEnd = paramAt + rest.length;
	}
	if (!rest || !/^[A-Za-z_$][\w$]*$/.test(rest)) return null;
	// The props type: on the parameter, in forwardRef<El, Props>, or in FC<Props>.
	const types = [];
	const annotated = /^\s*:\s*/.exec(text.slice(paramEnd));
	if (annotated) {
		const at = paramEnd + annotated[0].length;
		let depthT = 0;
		let end = at;
		for (; end < text.length; end++) {
			const c = text[end];
			if ("<([{".includes(c)) depthT++;
			else if (">)]}".includes(c) && text[end - 1] !== "=") {
				if (depthT === 0) break;
				depthT--;
			} else if (c === "," && depthT === 0) break;
		}
		types.push(text.slice(at, end));
	}
	const between = text.slice(after, paramAt);
	const ref = /forwardRef\s*<([\s\S]*)>\s*\(/.exec(between);
	if (ref) types.push(parts(ref[1])[1] ?? "");
	const fc = def[1] && /^(?:React\.)?(?:FC|FunctionComponent)\s*<([\s\S]*)>$/.exec(def[1].trim());
	if (fc) types.push(fc[1]);
	const isLayout = (local) => {
		const c = coreName(local);
		return Boolean(c && isRem(c, prop));
	};
	if (!types.some((t) => layoutPropsOf(text, t, prop, isLayout))) return null;
	// The rest object is spread onto Once UI layout elements (or onto another
	// wrapper that does the same), and otherwise only read for other props.
	const code = codeOnly(text, { jsxText: true });
	// Every use of the name, `...rest` included (a lone dot before it is another object's member).
	const uses = [...code.matchAll(new RegExp(`(?<![\\w$])(?<!(?<!\\.\\.)\\.)${rest}(?![\\w$])`, "g"))];
	const elements = elementsOf(text);
	const own = importBindings(text);
	let target = null;
	for (const u of uses) {
		if (u.index >= paramAt && u.index < paramEnd) continue;
		// The same name as another function's rest parameter: `({ a, ...rest }) =>`.
		// (Read on the source: a type annotation after the pattern can look like JSX text.)
		if (code.slice(u.index - 3, u.index) === "..." && /^\s*\}\s*(?::|\)|=(?!=))/.test(text.slice(u.index + rest.length))) continue;
		// Another parameter of the same name: `(rest: T) =>`, `function f(rest)`.
		if (/[(,]\s*$/.test(code.slice(Math.max(0, u.index - 20), u.index)) && /^\s*[:,)]/.test(text.slice(u.index + rest.length))) continue;
		// `rest.direction`: reading another prop leaves this one where it was.
		const member = /^\s*\??\.\s*([A-Za-z_$][\w$]*)/.exec(text.slice(u.index + rest.length));
		if (member) {
			if (member[1] === prop || /^\s*=(?!=)/.test(text.slice(u.index + rest.length + member[0].length))) return null;
			continue;
		}
		const spread = /\{\s*\.\.\.\s*$/.test(code.slice(Math.max(0, u.index - 10), u.index)) && /^\s*\}/.test(code.slice(u.index + rest.length));
		if (!spread) return null;
		const el = elements.find((e) => e.nameEnd <= u.index && u.index < e.openEnd);
		if (!el) return null;
		const canonical = coreName(el.name);
		if (canonical) {
			if (!isRem(canonical, prop)) return null;
			target ??= canonical;
			continue;
		}
		// Another wrapper of the app's own, here or imported: it must pass the prop on too.
		const b = own.get(el.name);
		const next = b ? file && (b.source.startsWith(".") || isAliasSource(file, b.source)) && resolveOwn(file, b.source) : file;
		const via =
			b && !next
				? null
				: forwardsProp({ file: next || null, text: b ? read(next) : text, name: b ? b.canonical : el.name, prop, isRem }, depth + 1);
		if (!via) return null;
		target ??= via;
	}
	return target;
}

function read(file) {
	try {
		return fs.readFileSync(file, "utf8");
	} catch {
		return null;
	}
}

export { read as readSource };
