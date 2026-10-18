/**
 * Once UI 2.x → 3.0 codemod: what a value can be, read from the source (D2).
 *
 * A size prop written `maxWidth={layout.content.width}` held a number that
 * 2.x read as rem. Whether it is a number cannot be seen at the use site,
 * but it can often be seen where it comes from: a const in the same file,
 * a config object imported from the app's own files, an entry of a data
 * array mapped into the element, a prop typed `number`, or arithmetic
 * (`hours.length * HOUR` is a number whatever `hours` is). This module
 * follows an expression there and says what it can hold, as a list of
 * atoms: `num`, `str`, `nil` (undefined or null), `bool`, `obj`, `arr`,
 * `fn` and `unknown` (with why). Every atom carries where it was read, so
 * a report can name the line that defines it.
 *
 * It reads source text, not types: a name it cannot follow exactly (bound
 * twice, reassigned, built by a call, a `let`, a spread into an object) is
 * `unknown`, and the caller keeps reporting it instead of rewriting.
 */
import { importBindings } from "./codemod-2.0.mjs";
import { codeOnly } from "./codemod-3.0-format.mjs";
import { readSource, resolveOwn } from "./codemod-3.0-own.mjs";
import { closing, objectEntries, partsBetween, skipLexeme, trimmed } from "./codemod-3.0-scan.mjs";

const NUMBER = /^-?(\d[\d_]*\.?\d*(e[-+]?\d+)?|\.\d+)$/i;
const STRING = /^(["'])(?:\\.|(?!\1).)*\1$/s;
const IDENT = /^[A-Za-z_$][\w$]*$/;
const NUMERIC_FUNCTIONS = new Set(["Number", "parseInt", "parseFloat"]);
const ARRAY_CALLBACKS = new Set(["map", "flatMap", "forEach", "filter", "find", "findLast", "some", "every", "sort"]);

const contexts = new Map();

/** The reading context of a file (`file` may be null for a source with no path). */
export function contextFor(file, src) {
	const key = file ? `${file}\u0000${src.length}` : null;
	if (key && contexts.get(key)?.original === src) return contexts.get(key);
	// JSX text is prose: an apostrophe in it is not a quote. Blanked (lengths
	// kept), so every offset still points into `src`.
	const text = src.replace(
		/((?<!=)>|\})((?:[^<>{}();=&]|&#?\w+;)*[A-Za-z](?:[^<>{}();=&]|&#?\w+;)*)(?=<\/?[A-Za-z])/g,
		(m, open, prose) => `${open}${prose.replace(/[^\n]/g, " ")}`,
	);
	const ctx = { file, src: text, code: codeOnly(text), imports: importBindings(src), memo: new Map(), scopes: null };
	ctx.original = src;
	if (key) {
		if (contexts.size > 400) contexts.clear();
		contexts.set(key, ctx);
	}
	return ctx;
}

const unknown = (why) => ({ t: "unknown", why });
const atom = (t, ctx, at, end, extra = {}) => ({ t, ctx, at, end, ...extra });

/** Atoms of the expression `src.slice(at, end)` of `ctx`. */
export function evaluate(ctx, at, end, depth = 0) {
	({ at, end } = trimmed(ctx.src, at, end));
	// Comments around it (`// optional: …` above an array entry).
	for (let guard = 0; guard < 20 && ctx.src.startsWith("/", at) && /[/*]/.test(ctx.src[at + 1]); guard++) {
		at = skipLexeme(ctx.src, at);
		({ at, end } = trimmed(ctx.src, at, end));
	}
	for (let guard = 0; guard < 20; guard++) {
		const lineAt = ctx.src.lastIndexOf("\n", end - 1) + 1;
		const comment = lineAt > at ? /^\s*\/\/.*$/.exec(ctx.src.slice(lineAt, end)) : null;
		if (!comment) break;
		({ at, end } = trimmed(ctx.src, at, lineAt));
	}
	if (at >= end) return [unknown("empty")];
	if (depth > 40) return [unknown("too deep to follow")];
	const key = `${at}:${end}`;
	const memo = ctx.memo.get(key);
	if (memo === null) return [unknown("it refers to itself")];
	if (memo) return memo;
	ctx.memo.set(key, null);
	let result;
	try {
		result = evaluateInner(ctx, at, end, depth + 1);
	} catch {
		result = [unknown("it could not be read")];
	}
	ctx.memo.set(key, result);
	return result;
}

/** The operators at the top level of `src[at, end)`, by kind. */
function operators(src, at, end) {
	const ops = { arrow: -1, assign: -1, ternary: -1, logical: [], and: -1, compare: -1, cast: -1, add: [], mul: -1 };
	let depth = 0;
	const operandEnd = (i) => {
		let p = i - 1;
		while (p >= at && /\s/.test(src[p])) p--;
		if (p < at) return false;
		if (/[\w$)\]}"'`]/.test(src[p])) return !/\b(return|typeof|case|in|of|void|delete|throw|await)$/.test(src.slice(Math.max(at, p - 7), p + 1));
		return false;
	};
	for (let i = at; i < end; i++) {
		const past = skipLexeme(src, i);
		if (past !== i) {
			i = past - 1;
			continue;
		}
		const c = src[i];
		if ("([{".includes(c)) {
			depth++;
			continue;
		}
		if (")]}".includes(c)) {
			depth--;
			continue;
		}
		if (depth !== 0) continue;
		const two = src.slice(i, i + 2);
		const three = src.slice(i, i + 3);
		if (two === "=>") {
			if (ops.arrow < 0) ops.arrow = i;
			i++;
		} else if (three === "===" || three === "!==") {
			if (ops.compare < 0) ops.compare = i;
			i += 2;
		} else if (two === "==" || two === "!=" || two === "<=" || two === ">=") {
			if (ops.compare < 0) ops.compare = i;
			i++;
		} else if (two === "??" || two === "||") {
			if (src[i + 2] === "=") {
				ops.assign = i;
				i += 2;
				continue;
			}
			ops.logical.push(i);
			i++;
		} else if (two === "&&") {
			if (ops.and < 0) ops.and = i;
			i++;
		} else if (two === "?." && !/\d/.test(src[i + 2] ?? "")) {
			i++;
		} else if (c === "?") {
			if (ops.ternary < 0) ops.ternary = i;
		} else if (c === "=") {
			if (ops.assign < 0) ops.assign = i;
		} else if (c === "<" || c === ">") {
			if (ops.compare < 0) ops.compare = i;
		} else if (two === "**") {
			if (ops.mul < 0) ops.mul = i;
			i++;
		} else if (c === "*" || c === "/" || c === "%") {
			if (src[i + 1] === "=") ops.assign = i;
			else if (ops.mul < 0) ops.mul = i;
		} else if (c === "+" || c === "-") {
			if (src[i + 1] === c) {
				ops.assign = i; // ++ / --: a write
				i++;
			} else if (src[i + 1] === "=") ops.assign = i;
			else if (operandEnd(i)) ops.add.push({ at: i, op: c });
		} else if (/\s/.test(c) && /^\s(as|satisfies)\s/.test(src.slice(i, i + 12)) && operandEnd(i + 1)) {
			// What follows is a type: its `<`, `=>` and `|` are not operators.
			ops.cast = i;
			break;
		}
	}
	return ops;
}

/** The `:` that pairs with the `?` at `q`, past nested ternaries. */
function colonOf(src, q, end) {
	let nested = 0;
	let depth = 0;
	for (let i = q + 1; i < end; i++) {
		const past = skipLexeme(src, i);
		if (past !== i) {
			i = past - 1;
			continue;
		}
		const c = src[i];
		if ("([{".includes(c)) depth++;
		else if (")]}".includes(c)) depth--;
		else if (depth !== 0) continue;
		else if (src.startsWith("?.", i) && !/\d/.test(src[i + 2] ?? "")) i++;
		else if (src.startsWith("??", i)) i++;
		else if (c === "?") nested++;
		else if (c === ":" && nested-- === 0) return i;
	}
	return -1;
}

const nonNil = (atoms) => atoms.filter((a) => a.t !== "nil");

function evaluateInner(ctx, at, end, depth) {
	const src = ctx.src;
	const text = src.slice(at, end);
	if (NUMBER.test(text)) return [atom("num", ctx, at, end, { value: Number(text.replace(/_/g, "")) })];
	if (STRING.test(text)) return [atom("str", ctx, at, end, { value: text.slice(1, -1) })];
	if (text[0] === "`" && skipLexeme(src, at) === end) return [atom("str", ctx, at, end)];
	if (text === "undefined" || text === "null") return [atom("nil", ctx, at, end)];
	if (text === "true" || text === "false") return [atom("bool", ctx, at, end)];
	const ops = operators(src, at, end);
	if (ops.arrow >= 0) return [atom("fn", ctx, at, end)];
	if (ops.assign >= 0) return [unknown("it is an assignment")];
	if (ops.ternary >= 0) {
		const colon = colonOf(src, ops.ternary, end);
		if (colon < 0) return [unknown("a ternary could not be read")];
		return [...evaluate(ctx, ops.ternary + 1, colon, depth), ...evaluate(ctx, colon + 1, end, depth)];
	}
	if (ops.logical.length) {
		const cuts = [at, ...ops.logical.map((i) => i + 2)];
		const ends = [...ops.logical, end];
		const parts = cuts.map((a, k) => evaluate(ctx, a, ends[k], depth));
		return parts.flatMap((p, k) => (k < parts.length - 1 ? nonNil(p) : p));
	}
	if (ops.and >= 0) return [unknown("`&&` can give its left side (false, 0, \"\")")];
	if (ops.compare >= 0) return [atom("bool", ctx, at, end)];
	if (ops.cast >= 0) return evaluate(ctx, at, ops.cast, depth);
	if (ops.add.length) {
		// `a - b` is a number whatever a and b are; `a + b` only when both are.
		if (ops.add.every((o) => o.op === "-")) return [atom("num", ctx, at, end)];
		const cuts = [at, ...ops.add.map((o) => o.at + 1)];
		const ends = [...ops.add.map((o) => o.at), end];
		const parts = cuts.map((a, k) => evaluate(ctx, a, ends[k], depth));
		if (parts.every((p) => p.length && p.every((x) => x.t === "num"))) return [atom("num", ctx, at, end)];
		if (parts.some((p) => p.length && p.every((x) => x.t === "str"))) return [atom("str", ctx, at, end)];
		return [unknown("`+` may join strings")];
	}
	if (ops.mul >= 0) return [atom("num", ctx, at, end)];
	// Prefix operators.
	if (/^[-+~]/.test(text)) return [atom("num", ctx, at, end)];
	if (text[0] === "!") return [atom("bool", ctx, at, end)];
	if (/^typeof\b/.test(text)) return [atom("str", ctx, at, end)];
	if (/^(await|new|void|delete|yield)\b/.test(text)) return [unknown(`it is a \`${text.split(/\s/)[0]}\` expression`)];
	if (text[0] === "{" && closing(src, at) === end - 1) return [atom("obj", ctx, at, end)];
	if (text[0] === "[" && closing(src, at) === end - 1) return [atom("arr", ctx, at, end)];
	if (text.endsWith("!")) return evaluate(ctx, at, end - 1, depth);
	return evaluateChain(ctx, at, end, depth);
}

/** `head.key?.[i](args)…`: a name or a group, then member, index and call segments. */
function evaluateChain(ctx, at, end, depth) {
	const src = ctx.src;
	let i = at;
	let atoms;
	let marker = null; // Math, Number…: a global whose calls are numbers
	if (src[i] === "(") {
		const close = closing(src, i);
		if (close < 0 || close >= end) return [unknown("a group could not be read")];
		atoms = evaluate(ctx, i + 1, close, depth);
		i = close + 1;
	} else {
		const m = /^[A-Za-z_$][\w$]*/.exec(src.slice(i, end));
		if (!m) return [unknown("it could not be read")];
		const name = m[0];
		i += name.length;
		if (name === "Math" || NUMERIC_FUNCTIONS.has(name) || name === "String") {
			if (!ctx.imports.has(name) && !declared(ctx, name)) marker = name;
		}
		atoms = marker ? [] : resolveName(ctx, name, at, depth);
	}
	while (i < end) {
		while (i < end && /\s/.test(src[i])) i++;
		if (i >= end) break;
		let optional = false;
		if (src.startsWith("?.", i)) {
			optional = true;
			i += 2;
			while (i < end && /\s/.test(src[i])) i++;
		}
		if (src[i] === "!" && !optional) {
			i++;
			continue;
		}
		if (src[i] === "." || (optional && /[A-Za-z_$]/.test(src[i]))) {
			if (src[i] === ".") i++;
			while (i < end && /\s/.test(src[i])) i++;
			const m = /^[A-Za-z_$#][\w$]*/.exec(src.slice(i, end));
			if (!m) return [unknown("a member could not be read")];
			i += m[0].length;
			if (marker) {
				marker = marker === "Math" ? (m[0] === "PI" || m[0] === "E" ? "num" : "Math.fn") : null;
				if (marker === "num") {
					atoms = [atom("num", ctx, at, i)];
					marker = null;
				}
				if (!marker && !atoms.length) return [unknown("it could not be read")];
				continue;
			}
			atoms = atoms.flatMap((a) => member(a, m[0], optional, depth));
			continue;
		}
		if (src[i] === "[") {
			const close = closing(src, i);
			if (close < 0 || close >= end) return [unknown("an index could not be read")];
			const index = evaluate(ctx, i + 1, close, depth);
			atoms = atoms.flatMap((a) => indexed(a, index, optional, depth));
			i = close + 1;
			continue;
		}
		if (src[i] === "(") {
			const close = closing(src, i);
			if (close < 0 || close >= end) return [unknown("a call could not be read")];
			if (marker === "Math.fn" || NUMERIC_FUNCTIONS.has(marker)) atoms = [atom("num", ctx, at, close + 1)];
			else if (marker === "String") atoms = [atom("str", ctx, at, close + 1)];
			else atoms = atoms.flatMap((a) => (a.t === "method" ? called(a) : a.t === "fn" ? returnsOf(a, depth) : a.t === "nil" && optional ? [a] : [unknown("it is the result of a call")]));
			marker = null;
			i = close + 1;
			continue;
		}
		return [unknown("it could not be read")];
	}
	if (marker) return [unknown("it could not be read")];
	return atoms.map((a) => (a.t === "method" ? unknown("it is a method") : a));
}

/** What a method call returns, where that is fixed by the receiver's type. */
function called(m) {
	if (m.of === "num" && /^(toFixed|toString|toPrecision|toLocaleString)$/.test(m.name)) return [atom("str", m.ctx, m.at, m.end)];
	if (m.of === "str" && /^(trim\w*|slice|substring|toLowerCase|toUpperCase|padStart|padEnd|replace\w*|concat|toString|at|charAt)$/.test(m.name))
		return [atom("str", m.ctx, m.at, m.end)];
	if (m.of === "str" && /^(indexOf|lastIndexOf|search|charCodeAt|localeCompare)$/.test(m.name)) return [atom("num", m.ctx, m.at, m.end)];
	if (m.of === "arr" && /^(indexOf|lastIndexOf|findIndex|push)$/.test(m.name)) return [atom("num", m.ctx, m.at, m.end)];
	if (m.of === "arr" && /^join$/.test(m.name)) return [atom("str", m.ctx, m.at, m.end)];
	return [unknown(`it is what .${m.name}() returns`)];
}

/** `a.key` for one atom of `a`. */
function member(a, key, optional, depth) {
	if (a.t === "unknown") return [a];
	if (a.t === "nil") return optional ? [a] : [unknown(`it reads .${key} of undefined`)];
	if (a.t === "obj") {
		const { entries, opaque } = objectEntries(a.ctx.src.slice(a.at, a.end));
		const found = entries.filter((e) => e.key === key);
		if (opaque) return [unknown(`the object it comes from has a spread or a computed key`)];
		if (!found.length) {
			const method = entries.some((e) => e.key === key);
			return method ? [unknown(`.${key} is a method`)] : [atom("nil", a.ctx, a.at, a.end)];
		}
		const e = found[found.length - 1];
		if (e.shorthand) return resolveName(a.ctx, key, a.at + e.at, depth);
		return evaluate(a.ctx, a.at + e.at, a.at + e.end, depth);
	}
	if (a.t === "tobj") {
		const found = keyType(a.type, key);
		if (!found) return [unknown(`its type has no .${key}`)];
		const atoms = typeAtoms(a.ctx, found.text, depth + 1, a.at);
		return found.optional ? [...atoms, atom("nil", a.ctx, a.at, a.at)] : atoms;
	}
	if (key === "length" && (a.t === "arr" || a.t === "str")) return [atom("num", a.ctx, a.at, a.end)];
	if (a.t === "num" || a.t === "str" || a.t === "arr") return [{ t: "method", of: a.t, name: key, ctx: a.ctx, at: a.at, end: a.end }];
	return [unknown(`it reads .${key} of a ${a.t}`)];
}

/** `a[index]` for one atom of `a`. */
function indexed(a, index, optional, depth) {
	if (a.t === "unknown") return [a];
	if (a.t === "nil") return optional ? [a] : [unknown("it indexes undefined")];
	const literalKey = index.length === 1 && (index[0].t === "str" || index[0].t === "num") && index[0].value !== undefined ? String(index[0].value) : null;
	if (a.t === "arr") {
		const items = itemsOf(a);
		if (!items) return [unknown("the array it comes from has a spread")];
		if (literalKey !== null && /^\d+$/.test(literalKey)) return items[Number(literalKey)] ? evaluate(a.ctx, items[Number(literalKey)].at, items[Number(literalKey)].end, depth) : [atom("nil", a.ctx, a.at, a.end)];
		// Any entry, or past the end.
		return [...items.flatMap((p) => evaluate(a.ctx, p.at, p.end, depth)), atom("nil", a.ctx, a.at, a.end)];
	}
	if (a.t === "obj") {
		if (literalKey !== null) return member(a, literalKey, optional, depth);
		const { entries, opaque } = objectEntries(a.ctx.src.slice(a.at, a.end));
		if (opaque) return [unknown("the object it comes from has a spread or a computed key")];
		// Any entry: a Record indexed by its key type.
		return entries.flatMap((e) => (e.shorthand ? resolveName(a.ctx, e.key, a.at + e.at, depth) : evaluate(a.ctx, a.at + e.at, a.at + e.end, depth)));
	}
	return [unknown(`it indexes a ${a.t}`)];
}

/** The entries of an array literal atom as spans, or null when one is a spread. */
function itemsOf(a) {
	const parts = partsBetween(a.ctx.src, a.at, a.end - 1);
	if (parts.some((p) => a.ctx.src.startsWith("...", p.at))) return null;
	return parts;
}

/** Whether the file declares `name` itself (a const, function, class or parameter). */
function declared(ctx, name) {
	return new RegExp(`(?:\\b(?:const|let|var|function|class)\\s+${name}\\b)|[(,{]\\s*${name}\\s*[,)}:=]`).test(ctx.code);
}

/** The end of the statement whose expression starts at `at`: `;`, or a line break before the next statement. */
export function statementEnd(src, at) {
	let depth = 0;
	for (let i = at; i < src.length; i++) {
		const past = skipLexeme(src, i);
		if (past !== i) {
			i = past - 1;
			continue;
		}
		const c = src[i];
		if ("([{".includes(c)) depth++;
		else if (")]}".includes(c)) {
			if (depth === 0) return i;
			depth--;
		} else if (depth === 0 && (c === ";" || c === ",")) return i;
		else if (depth === 0 && c === "\n") {
			const next = /^\n\s*(\S+)/.exec(src.slice(i));
			if (!next || /^(const|let|var|export|function|import|type|interface|return|if|for|while|class|\/\/|\/\*|\}|<)/.test(next[1])) return i;
			if (/^[A-Za-z_$][\w$]*\s*\(/.test(src.slice(i).trimStart()) && !/(?:[-+*/%?:&|=,(]|=>)\s*$/.test(src.slice(at, i))) return i;
		}
	}
	return src.length;
}

/**
 * The value `name`, read at `pos`, is bound to: a parameter of an enclosing
 * function (an array callback's item, or a prop typed in this file), a const
 * declared once in the file, or an import from the app's own files.
 */
export function resolveName(ctx, name, pos, depth = 0) {
	if (name === "undefined") return [atom("nil", ctx, pos, pos + name.length)];
	if (name === "NaN" || name === "Infinity") return [atom("num", ctx, pos, pos + name.length)];
	const param = bindingAt(ctx, name, pos);
	const decls = [...ctx.code.matchAll(new RegExp(`(?<![\\w$.])(const|let|var|function|class|enum)\\s+${name.replace(/\$/g, "\\$")}(?![\\w$])`, "g"))];
	const patterns = new RegExp(`\\b(?:const|let|var)\\s*[{[][^=;]*(?<![\\w$.:])${name.replace(/\$/g, "\\$")}(?![\\w$])[^=;]*[}\\]]\\s*(?::[^=;]+)?=`).test(ctx.code);
	if (param) {
		if (decls.length || patterns) return [unknown(`${name} is bound more than once in this file`)];
		return param(depth);
	}
	if (patterns) return decls.length ? [unknown(`${name} is bound more than once in this file`)] : destructured(ctx, name, depth);
	// Several: the one whose block holds the read, the innermost (block scope).
	const visible = decls.length > 1 ? innermostVisible(ctx, decls, pos) : decls[0];
	if (decls.length > 1 && !visible) return [unknown(`${name} is declared more than once in this file`)];
	if (visible) {
		const kind = visible[1];
		if (kind === "function") return [atom("fn", ctx, visible.index, visible.index)];
		if (kind !== "const") return [unknown(`${name} is a ${kind}, which may be reassigned`)];
		return constValue(ctx, name, visible.index, depth);
	}
	const bound = ctx.imports.get(name);
	if (bound) {
		const target = ctx.file && resolveOwn(ctx.file, bound.source);
		if (!target) return [unknown(`${name} is imported from ${bound.source}`)];
		const text = readSource(target);
		if (text === null) return [unknown(`${bound.source} could not be read`)];
		return exportValue(contextFor(target, text), bound.canonical.replace(/^type\s+/, ""), depth + 1);
	}
	return [unknown(`${name} is not defined in this file`)];
}

/** Of several declarations of a name, the one in the innermost block around `pos`, or null. */
function innermostVisible(ctx, decls, pos) {
	let best = null;
	let bestOpen = -2;
	for (const d of decls) {
		let open = -1;
		for (let j = d.index - 1, depth = 0; j >= 0; j--) {
			const c = ctx.code[j];
			if (c === "}" || c === ")" || c === "]") depth++;
			else if (c === "{" || c === "(" || c === "[") {
				if (depth === 0) {
					open = j;
					break;
				}
				depth--;
			}
		}
		const close = open < 0 ? ctx.src.length : closing(ctx.src, open);
		if (pos <= open || pos > close) continue;
		if (open === bestOpen) return null;
		if (open > bestOpen) {
			best = d;
			bestOpen = open;
		}
	}
	return best;
}

/** `const { a, b: name = 1 } = value`, declared once: that key of what `value` evaluates to. */
function destructured(ctx, name, depth) {
	const esc = name.replace(/\$/g, "\\$");
	const found = [];
	for (const m of ctx.code.matchAll(/\b(const|let|var)\s*([{[])/g)) {
		const open = m.index + m[0].length - 1;
		const close = closing(ctx.src, open);
		if (close < 0) continue;
		const pattern = ctx.src.slice(open + 1, close);
		if (!new RegExp(`(?<![\\w$.])${esc}(?![\\w$])`).test(pattern)) continue;
		found.push({ kind: m[1], brace: m[2], open, close });
	}
	if (found.length !== 1) return [unknown(`${name} is destructured more than once in this file`)];
	const { kind, brace, open, close } = found[0];
	if (kind !== "const") return [unknown(`${name} is destructured into a ${kind}`)];
	if (brace !== "{") return [unknown(`${name} is destructured from an array`)];
	const head = /^\s*(?::[^=]+?)?=(?![=>])\s*/.exec(ctx.src.slice(close + 1));
	if (!head) return [unknown(`${name} is destructured from another value`)];
	const initAt = close + 1 + head[0].length;
	const initEnd = statementEnd(ctx.src, initAt);
	let entry = null;
	for (const q of partsBetween(ctx.src, open, close)) {
		const piece = ctx.src.slice(q.at, q.end);
		const m = /^([A-Za-z_$][\w$]*)\s*(?::\s*([A-Za-z_$][\w$]*))?\s*(=\s*)?/.exec(piece);
		if (m && (m[2] ?? m[1]) === name && !piece.startsWith("...")) entry = { key: m[1], defaultAt: m[3] ? q.at + m[0].length : null, defaultEnd: q.end };
	}
	if (!entry) return [unknown(`${name} is destructured from another value`)];
	const values = evaluate(ctx, initAt, initEnd, depth + 1).flatMap((a) => member(a, entry.key, false, depth + 1));
	if (entry.defaultAt === null) return values;
	return [...nonNil(values), ...evaluate(ctx, entry.defaultAt, entry.defaultEnd, depth + 1)];
}

/** The value of `const name = …` declared at `at`, or unknown when the file writes to it. */
function constValue(ctx, name, at, depth) {
	const head = new RegExp(`const\\s+${name.replace(/\$/g, "\\$")}\\s*(?::\\s*([^=;]+?))?\\s*=(?![=>])\\s*`, "y");
	head.lastIndex = at;
	const h = head.exec(ctx.src);
	if (!h) return [unknown(`${name} could not be read`)];
	const initAt = h.index + h[0].length;
	const initEnd = statementEnd(ctx.src, initAt);
	const esc = name.replace(/\$/g, "\\$");
	// A write to one of its members, or a mutating call, changes what it holds.
	const writes = new RegExp(
		`(?<![\\w$.])${esc}(?:\\s*(?:\\?\\.|\\.)\\s*[\\w$]+|\\s*\\[[^\\]]*\\])+\\s*(?:[-+*/%]?=(?![=>])|\\+\\+|--)|(?<![\\w$.])${esc}\\s*\\.\\s*(?:push|pop|splice|shift|unshift|sort|reverse|fill|copyWithin)\\s*\\(|Object\\.assign\\(\\s*${esc}\\b`,
	);
	if (writes.test(ctx.code)) return [unknown(`${name} is written to in this file`)];
	return evaluate(ctx, initAt, initEnd, depth).map((a) => (a.t === "unknown" ? a : { ...a, decl: a.decl ?? { ctx, name, at, initAt, initEnd, annotated: Boolean(h[1]) } }));
}

/** The value a module exports as `name`. */
function exportValue(ctx, name, depth) {
	if (depth > 12) return [unknown(`${name}'s export could not be followed`)];
	const esc = name.replace(/\$/g, "\\$");
	const direct = new RegExp(`\\bexport\\s+(const|let|var|function|class)\\s+${esc}(?![\\w$])`).exec(ctx.code);
	if (direct) {
		if (direct[1] === "function") return [atom("fn", ctx, direct.index, direct.index)];
		if (direct[1] !== "const") return [unknown(`${name} is an exported ${direct[1]}`)];
		const decls = [...ctx.code.matchAll(new RegExp(`(?<![\\w$.])(const|let|var|function|class)\\s+${esc}(?![\\w$])`, "g"))];
		if (decls.length !== 1) return [unknown(`${name} is declared more than once in its file`)];
		return constValue(ctx, name, direct.index + direct[0].indexOf("const"), depth);
	}
	for (const m of ctx.code.matchAll(/\bexport\s*\{([^}]*)\}\s*(?:from\s*(["'])([^"']*)\2)?/g)) {
		for (const spec of m[1].split(",").map((s) => s.trim()).filter(Boolean)) {
			const [orig, as] = spec.replace(/^type\s+/, "").split(/\s+as\s+/).map((x) => x.trim());
			if ((as ?? orig) !== name) continue;
			if (!m[3]) {
				// `export { local }` (the source of the path is in `ctx.src`, the code only blanks it).
				const decls = [...ctx.code.matchAll(new RegExp(`(?<![\\w$.])(const|let|var|function|class)\\s+${orig}(?![\\w$])`, "g"))];
				if (decls.length !== 1) return [unknown(`${orig} is declared more than once in its file`)];
				if (decls[0][1] === "function") return [atom("fn", ctx, decls[0].index, decls[0].index)];
				if (decls[0][1] !== "const") return [unknown(`${orig} is a ${decls[0][1]}`)];
				return constValue(ctx, orig, decls[0].index, depth);
			}
			const source = ctx.src.slice(m.index, m.index + m[0].length).match(/from\s*(["'])([^"']*)\1/)?.[2];
			const next = source && ctx.file && resolveOwn(ctx.file, source);
			const text = next ? readSource(next) : null;
			if (text === null) return [unknown(`${name} is re-exported from ${source}`)];
			return exportValue(contextFor(next, text), orig, depth + 1);
		}
	}
	for (const m of ctx.src.matchAll(/\bexport\s*\*\s*from\s*(["'])([^"']+)\1/g)) {
		const next = ctx.file && resolveOwn(ctx.file, m[2]);
		const text = next ? readSource(next) : null;
		if (text === null) continue;
		const found = exportValue(contextFor(next, text), name, depth + 1);
		if (!(found.length === 1 && found[0].t === "unknown" && /is not exported/.test(found[0].why))) return found;
	}
	return [unknown(`${name} is not exported by ${ctx.file ? ctx.file.split("/").pop() : "its file"}`)];
}

// ─── Parameters ──────────────────────────────────────────────────────────

/** Every function in the file with its parameter list and body, read once. */
function scopesOf(ctx) {
	if (ctx.scopes) return ctx.scopes;
	const { code, src } = ctx;
	const scopes = [];
	// Arrow functions: `(a, b) =>`, `a =>`, `({ a }: T) =>`.
	for (const m of code.matchAll(/=>/g)) {
		const arrow = m.index;
		let p = arrow - 1;
		while (p >= 0 && /\s/.test(code[p])) p--;
		let paramsAt;
		let paramsEnd;
		let single = null;
		// A return type: `): T =>`.
		const typed = /\)\s*:\s*[^()=;{}]*$/.exec(code.slice(Math.max(0, p - 120), p + 1));
		if (code[p] !== ")" && typed) p = Math.max(0, p - 120) + typed.index;
		if (code[p] === ")") {
			const open = openerOf(code, p);
			if (open < 0) continue;
			paramsAt = open + 1;
			paramsEnd = p;
		} else if (/[\w$]/.test(code[p])) {
			let q = p;
			while (q >= 0 && /[\w$]/.test(code[q])) q--;
			single = code.slice(q + 1, p + 1);
			paramsAt = q + 1;
			paramsEnd = p + 1;
		} else continue;
		let b = arrow + 2;
		while (b < code.length && /\s/.test(code[b])) b++;
		const bodyEnd = code[b] === "{" ? closing(src, b) + 1 : statementEnd(src, b);
		const beforeAt = single ? paramsAt : paramsAt - 1;
		const beforeStart = Math.max(0, beforeAt - 80);
		scopes.push({ paramsAt, paramsEnd, single, bodyAt: arrow + 2, bodyEnd, before: code.slice(beforeStart, beforeAt), beforeStart });
	}
	// Function declarations and expressions: `function Name<T>(…) {`.
	for (const m of code.matchAll(/\bfunction\b\s*\*?\s*[\w$]*\s*(?:<[^>]*>)?\s*\(/g)) {
		const open = m.index + m[0].length - 1;
		const close = closing(src, open);
		if (close < 0) continue;
		const brace = code.indexOf("{", close);
		if (brace < 0) continue;
		const beforeStart = Math.max(0, m.index - 80);
		scopes.push({ paramsAt: open + 1, paramsEnd: close, bodyAt: brace, bodyEnd: closing(src, brace) + 1, before: code.slice(beforeStart, m.index), beforeStart, declared: true });
	}
	// `for (const x of xs)`: x is an item of xs.
	for (const m of code.matchAll(/\bfor\s*(?:await\s*)?\(\s*(?:const|let|var)\s+/g)) {
		const open = code.indexOf("(", m.index);
		const close = closing(src, open);
		if (close < 0) continue;
		const head = src.slice(m.index + m[0].length, close);
		const of = /\s+of\s+/.exec(head);
		if (!of) continue;
		let b = close + 1;
		while (b < code.length && /\s/.test(code[b])) b++;
		const bodyEnd = code[b] === "{" ? closing(src, b) + 1 : statementEnd(src, b);
		const at = m.index + m[0].length;
		scopes.push({ paramsAt: at, paramsEnd: at + of.index, bodyAt: close, bodyEnd, forOf: { at: at + of.index + of[0].length, end: close } });
	}
	ctx.scopes = scopes;
	return scopes;
}

/** The index of the bracket that opens the one closing at `i`, reading backwards. */
function openerOf(code, i) {
	let depth = 0;
	for (let j = i; j >= 0; j--) {
		if (")]}".includes(code[j])) depth++;
		else if ("([{".includes(code[j]) && --depth === 0) return j;
	}
	return -1;
}

/** The names a parameter list binds: `{ name, index, key, defaultAt, defaultEnd, rest }`. */
function bindingsOf(src, at, end) {
	const out = [];
	const parts = partsBetween(src, at - 1, end);
	parts.forEach((p, index) => {
		let text = src.slice(p.at, p.end);
		if (text.startsWith("{") || text.startsWith("[")) {
			const close = closing(src, p.at);
			const inner = partsBetween(src, p.at, close);
			for (const q of inner) {
				const piece = src.slice(q.at, q.end);
				const m = /^(?:\.\.\.\s*)?([A-Za-z_$][\w$]*)\s*(?::\s*([A-Za-z_$][\w$]*))?\s*(=\s*)?/.exec(piece);
				if (!m) continue;
				const local = src[p.at] === "{" ? (m[2] ?? m[1]) : m[1];
				out.push({
					name: local,
					index,
					key: src[p.at] === "{" && !piece.startsWith("...") ? m[1] : null,
					rest: piece.startsWith("..."),
					position: src[p.at] === "[" ? inner.indexOf(q) : null,
					defaultAt: m[3] ? q.at + m[0].length : null,
					defaultEnd: m[3] ? q.end : null,
					patternEnd: close,
				});
			}
			return;
		}
		text = text.replace(/^\.\.\.\s*/, "");
		const m = /^([A-Za-z_$][\w$]*)\s*(\??)\s*(?::[^=]*)?(=\s*)?/.exec(text);
		if (m) out.push({ name: m[1], index, key: null, defaultAt: m[3] ? p.at + m[0].length : null, defaultEnd: m[3] ? p.end : null });
	});
	return out;
}

/**
 * The innermost function parameter (or for-of item) named `name` whose
 * function contains `pos`, as a thunk giving its atoms; null when none does.
 */
function bindingAt(ctx, name, pos) {
	let best = null;
	for (const s of scopesOf(ctx)) {
		if (pos < s.bodyAt || pos >= s.bodyEnd) continue;
		if (best && s.bodyAt < best.scope.bodyAt) continue;
		const b = s.single === name ? { name, index: 0, key: null } : s.single ? null : bindingsOf(ctx.src, s.paramsAt, s.paramsEnd).find((x) => x.name === name);
		if (b) best = { scope: s, binding: b };
	}
	if (!best) return null;
	const { scope, binding } = best;
	return (depth) => {
		if (binding.rest) return [unknown(`${name} is a rest parameter`)];
		const withDefault = (atoms) => {
			if (binding.defaultAt === null || binding.defaultAt === undefined) return atoms;
			return [...nonNil(atoms), ...evaluate(ctx, binding.defaultAt, binding.defaultEnd, depth)];
		};
		// An item of the array an array method or a for-of reads.
		const items = scope.forOf ? evaluate(ctx, scope.forOf.at, scope.forOf.end, depth) : callbackReceiver(ctx, scope, depth);
		if (items) {
			if (!scope.forOf && binding.index === 1 && binding.key === null) return [atom("num", ctx, pos, pos)];
			if (binding.index !== 0) return [unknown(`${name} is a callback parameter`)];
			const elements = items.flatMap((a) => {
				if (a.t === "nil") return [];
				if (a.t !== "arr") return [a.t === "unknown" ? a : unknown(`${name} is an item of a ${a.t}`)];
				const parts = itemsOf(a);
				if (!parts) return [unknown("the array it comes from has a spread")];
				return parts.flatMap((p) => evaluate(a.ctx, p.at, p.end, depth));
			});
			if (binding.key) return withDefault(elements.flatMap((e) => member(e, binding.key, false, depth)));
			if (binding.position !== null && binding.position !== undefined) return [unknown(`${name} is destructured from an item`)];
			return withDefault(elements);
		}
		// A prop: its type in this file says what it holds.
		if (binding.index === 0 && binding.key) return withDefault(propType(ctx, scope, binding, depth));
		return [unknown(`${name} is a parameter`)];
	};
}

/** The array an `xs.map(item => …)` callback reads (atoms), or null when the function is not such a callback. */
function callbackReceiver(ctx, scope, depth) {
	if (scope.declared && !/\(\s*$/.test(scope.before)) return null;
	const m = /\.\s*([A-Za-z]+)\s*\(\s*(?:async\s*)?$/.exec(scope.before);
	if (!m || !ARRAY_CALLBACKS.has(m[1])) return null;
	// The receiver: a member chain ending at the `.` before the method.
	const dot = scope.beforeStart + m.index;
	let i = dot - 1;
	const code = ctx.code;
	while (i >= 0 && /\s/.test(code[i])) i--;
	if (code[i] === "?") i--;
	const endAt = i + 1;
	for (;;) {
		while (i >= 0 && /\s/.test(code[i])) i--;
		if (code[i] === ")" || code[i] === "]") {
			i = openerOf(code, i) - 1;
			if (i < -1) return [unknown("the array could not be read")];
		}
		while (i >= 0 && /[\w$]/.test(code[i])) i--;
		let j = i;
		while (j >= 0 && /\s/.test(code[j])) j--;
		if (code[j] === "." || code[j] === "!") {
			i = code[j - 1] === "?" ? j - 2 : j - 1;
			continue;
		}
		break;
	}
	return evaluate(ctx, i + 1, endAt, depth);
}

/** A destructured prop's atoms, from its member type: `width: number`, `maxWidth?: SiteMaxWidth`. */
function propType(ctx, scope, binding, depth) {
	const { src } = ctx;
	const types = [];
	const after = /^\s*:\s*/.exec(src.slice(binding.patternEnd + 1));
	if (after) {
		const at = binding.patternEnd + 1 + after[0].length;
		const end = typeEnd(src, at);
		types.push(src.slice(at, end));
	}
	// `const X: React.FC<Props> = ({ … }) =>`: the last FC< before the parameters.
	const window = src.slice(Math.max(0, scope.paramsAt - 2000), scope.paramsAt - 1);
	const fcAt = Math.max(window.lastIndexOf("FC<"), window.lastIndexOf("FunctionComponent<"));
	const generic = fcAt >= 0 ? /^(?:FC|FunctionComponent)<([\s\S]*)>\s*=\s*(?:async\s*)?$/.exec(window.slice(fcAt)) : null;
	if (generic) types.push(generic[1]);
	const ref = /forwardRef\s*<([\s\S]*?)>\s*\(\s*\(?\s*$/.exec(src.slice(Math.max(0, scope.paramsAt - 600), scope.paramsAt - 1));
	if (ref) types.push(partsBetween(`(${ref[1]})`, 0, ref[1].length + 1).map((p) => `(${ref[1]})`.slice(p.at, p.end))[1] ?? "");
	for (const t of types) {
		const found = memberType(ctx, t.trim(), binding.key, 0);
		if (found) {
			const atoms = typeAtoms(ctx, found.text, depth + 1, scope.paramsAt);
			return found.optional ? [...atoms, atom("nil", ctx, scope.paramsAt, scope.paramsAt)] : atoms;
		}
	}
	return [unknown(`${binding.name} is a prop whose type is not read here`)];
}

/** The end of a type annotation that starts at `at` (before `)`, `,` or `=` at its depth). */
function typeEnd(src, at) {
	let depth = 0;
	for (let i = at; i < src.length; i++) {
		const past = skipLexeme(src, i);
		if (past !== i) {
			i = past - 1;
			continue;
		}
		const c = src[i];
		if ("<([{".includes(c)) depth++;
		else if (">)]}".includes(c) && src[i - 1] !== "=") {
			if (depth === 0) return i;
			depth--;
		} else if ((c === "," || c === "=") && depth === 0) return i;
	}
	return src.length;
}

/** The type of `key` in an object type's text `{ a: T; key?: U }`: `{ text, optional }`, or null. */
function keyType(text, key) {
	const re = new RegExp(`(?:^|[;,{\\n])\\s*(?:readonly\\s+)?(?:${key}|"${key}"|'${key}')(\\??)\\s*:\\s*`, "g");
	let m;
	while ((m = re.exec(text))) {
		// Only a member of this object, not of one nested in it.
		const before = text.slice(0, m.index + 1);
		let depth = 0;
		for (let i = 0; i < before.length; i++) {
			const past = skipLexeme(before, i);
			if (past !== i) {
				i = past - 1;
				continue;
			}
			if ("<([{".includes(before[i])) depth++;
			else if (">)]}".includes(before[i]) && before[i - 1] !== "=") depth--;
		}
		if (depth !== 1) continue;
		const at = m.index + m[0].length;
		let end = at;
		let d = 0;
		for (; end < text.length; end++) {
			const past = skipLexeme(text, end);
			if (past !== end) {
				end = past - 1;
				continue;
			}
			const c = text[end];
			if ("<([{".includes(c)) d++;
			else if (">)]}".includes(c) && text[end - 1] !== "=") {
				if (d === 0) break;
				d--;
			} else if (d === 0 && (c === ";" || c === "," || c === "\n")) break;
		}
		return { text: text.slice(at, end).trim(), optional: m[1] === "?" };
	}
	return null;
}

/** `{ text, optional }` for `key` in the type `type` (an object type, an interface or alias in this file, or an `&`). */
function memberType(ctx, type, key, depth) {
	if (depth > 4) return null;
	const t = type.trim();
	if (t.startsWith("{")) return keyType(t, key);
	const pieces = splitType(t, "&");
	if (pieces.length > 1) {
		for (const p of pieces) {
			const found = memberType(ctx, p, key, depth + 1);
			if (found) return found;
		}
		return null;
	}
	if (!IDENT.test(t)) return null;
	const iface = new RegExp(`\\binterface\\s+${t}\\b[^{]*\\{`).exec(ctx.src);
	if (iface) {
		const open = iface.index + iface[0].length - 1;
		return keyType(ctx.src.slice(open, closing(ctx.src, open) + 1), key);
	}
	const alias = new RegExp(`\\btype\\s+${t}\\s*(?:<[^>]*>)?\\s*=\\s*`).exec(ctx.src);
	if (alias) {
		const at = alias.index + alias[0].length;
		return memberType(ctx, ctx.src.slice(at, typeStatementEnd(ctx.src, at)), key, depth + 1);
	}
	return null;
}

/** The end of a `type X = …` right-hand side. */
function typeStatementEnd(src, at) {
	let depth = 0;
	for (let i = at; i < src.length; i++) {
		const past = skipLexeme(src, i);
		if (past !== i) {
			i = past - 1;
			continue;
		}
		const c = src[i];
		if ("<([{".includes(c)) depth++;
		else if (">)]}".includes(c) && src[i - 1] !== "=") depth--;
		else if (depth === 0 && c === ";") return i;
		else if (depth === 0 && c === "\n" && !/^\n\s*[|&]/.test(src.slice(i)) && !/[|&=]\s*$/.test(src.slice(at, i))) return i;
	}
	return src.length;
}

/** The top-level pieces of a type joined by `sep` (`|` or `&`). */
function splitType(text, sep) {
	const out = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < text.length; i++) {
		const past = skipLexeme(text, i);
		if (past !== i) {
			i = past - 1;
			continue;
		}
		const c = text[i];
		if ("<([{".includes(c)) depth++;
		else if (">)]}".includes(c) && text[i - 1] !== "=") depth--;
		else if (c === sep && depth === 0) {
			out.push(text.slice(start, i));
			start = i + 1;
		}
	}
	out.push(text.slice(start));
	return out.map((p) => p.trim()).filter(Boolean);
}

/**
 * What a value of the type `text` (read in `ctx`) can be: `number` and
 * number literals are numbers, `string`, string literals and template
 * literal types (`${number}%`) are strings, an alias or interface (in this
 * file, or imported from the app's own) is read through.
 */
function typeAtoms(ctx, text, depth, at = 0) {
	const t = text.trim().replace(/^readonly\s+/, "");
	if (depth > 10) return [unknown(`it is typed ${t}`)];
	const union = splitType(t.replace(/^\|/, ""), "|");
	if (union.length > 1) return union.flatMap((p) => typeAtoms(ctx, p, depth + 1, at));
	if (t.startsWith("(") && closing(t, 0) === t.length - 1) return typeAtoms(ctx, t.slice(1, -1), depth + 1, at);
	if (t === "number" || NUMBER.test(t)) return [atom("num", ctx, at, at)];
	if (t === "string" || STRING.test(t) || (t.startsWith("`") && t.endsWith("`"))) return [atom("str", ctx, at, at)];
	if (t === "undefined" || t === "null" || t === "void") return [atom("nil", ctx, at, at)];
	if (t === "boolean" || t === "true" || t === "false") return [atom("bool", ctx, at, at)];
	if (t.startsWith("{") && closing(t, 0) === t.length - 1) return [atom("tobj", ctx, at, at, { type: t })];
	if (!IDENT.test(t)) return [unknown(`it is typed ${t.length > 40 ? `${t.slice(0, 40)}…` : t}`)];
	const iface = new RegExp(`\\binterface\\s+${t}\\b[^{]*\\{`).exec(ctx.code);
	if (iface) {
		const open = iface.index + iface[0].length - 1;
		return [atom("tobj", ctx, iface.index, iface.index, { type: ctx.src.slice(open, closing(ctx.src, open) + 1) })];
	}
	const alias = new RegExp(`\\btype\\s+${t}\\s*=\\s*`).exec(ctx.code);
	if (alias) {
		const from = alias.index + alias[0].length;
		return typeAtoms(ctx, ctx.src.slice(from, typeStatementEnd(ctx.src, from)), depth + 1, from);
	}
	const bound = ctx.imports.get(t) ?? ctx.imports.get(`type ${t}`);
	if (bound) {
		const target = ctx.file && resolveOwn(ctx.file, bound.source);
		const source = target ? readSource(target) : null;
		if (source === null) return [unknown(`it is typed ${t}, from ${bound.source}`)];
		const next = contextFor(target, source);
		const name = bound.canonical.replace(/^type\s+/, "");
		if (!new RegExp(`\\bexport\\s+(?:type|interface)\\s+${name}\\b`).test(next.code)) return [unknown(`it is typed ${t}, which ${bound.source} does not declare itself`)];
		return typeAtoms(next, name, depth + 1, at);
	}
	return [unknown(`it is typed ${t}`)];
}

/** What a call of the function atom `f` returns: its return type, or what its returns evaluate to. */
function returnsOf(f, depth) {
	if (depth > 8) return [unknown("it is the result of a call")];
	const { ctx } = f;
	const { src } = ctx;
	if (/^(?:export\s+)?async\b/.test(src.slice(f.at, f.at + 20)) || /^(?:export\s+)?function\s*\*/.test(src.slice(f.at, f.at + 20)))
		return [unknown("it is the result of an async or generator call")];
	const own = scopesOf(ctx)
		.filter((s) => !s.forOf && s.paramsAt >= f.at && (f.end > f.at ? s.bodyEnd <= f.end : true))
		.sort((x, y) => x.paramsAt - y.paramsAt)[0];
	if (!own) return [unknown("it is the result of a call")];
	const between = src.slice(own.single ? own.paramsEnd : own.paramsEnd + 1, own.declared ? own.bodyAt : own.bodyAt - 2);
	const typed = /^\s*:\s*([\s\S]+?)\s*$/.exec(between);
	if (typed && !/\bis\b|^asserts\b|^Promise\b/.test(typed[1])) return typeAtoms(ctx, typed[1], depth + 1, own.paramsEnd);
	let b = own.bodyAt;
	while (b < own.bodyEnd && /\s/.test(src[b])) b++;
	if (own.declared || src[b] === "{") {
		const atoms = [];
		const inner = scopesOf(ctx).filter((s) => s !== own && s.bodyAt > own.bodyAt && s.bodyEnd <= own.bodyEnd && !s.forOf);
		let any = false;
		for (const m of ctx.code.slice(b, own.bodyEnd).matchAll(/(?<![\w$.])return\b/g)) {
			const at = b + m.index;
			if (inner.some((s) => at >= s.bodyAt && at < s.bodyEnd)) continue;
			any = true;
			const from = at + m[0].length;
			const end = statementEnd(src, from);
			if (!src.slice(from, end).trim()) atoms.push(atom("nil", ctx, at, from));
			else atoms.push(...evaluate(ctx, from, end, depth + 1));
		}
		return any ? atoms : [atom("nil", ctx, b, b)];
	}
	return evaluate(ctx, b, own.bodyEnd, depth + 1);
}

/**
 * What an expression in `src` (at `at`…`end`, read in `file`) can be, in
 * short: `kind` is "num" when every value it can take is a number, "str"
 * when none is a number, "mixed" or "unknown" otherwise; `atoms` are the
 * values, and `why` says what could not be read.
 */
export function numberKind({ file, src }, at, end) {
	const ctx = contextFor(file, src);
	const atoms = evaluate(ctx, at, end);
	const unknownAtom = atoms.find((a) => a.t === "unknown");
	if (unknownAtom) return { kind: "unknown", atoms, why: unknownAtom.why };
	const nums = atoms.filter((a) => a.t === "num");
	if (atoms.length && nums.length === atoms.length) return { kind: "num", atoms };
	if (!nums.length) return { kind: "str", atoms };
	return { kind: "mixed", atoms };
}

/**
 * The spans an expression's value is chosen from: both branches of a
 * ternary and every side of `??` / `||`, recursively (the condition is not
 * one). `(a ? { … } : { … })` → the two object literals.
 */
export function valueSpans(src, at, end, outer = null) {
	({ at, end } = trimmed(src, at, end));
	if (at >= end) return [];
	// `outer` is the whole branch (`("active" as const)`), `at`…`end` its value (`"active"`).
	const branch = outer ?? { at, end };
	const ops = operators(src, at, end);
	if (ops.ternary >= 0 && ops.arrow < 0 && ops.assign < 0) {
		const colon = colonOf(src, ops.ternary, end);
		if (colon >= 0) return [...valueSpans(src, ops.ternary + 1, colon), ...valueSpans(src, colon + 1, end)];
	}
	if (ops.logical.length && ops.arrow < 0 && ops.assign < 0) {
		const cuts = [at, ...ops.logical.map((i) => i + 2)];
		const ends = [...ops.logical, end];
		return cuts.flatMap((a, k) => valueSpans(src, a, ends[k]));
	}
	if (ops.cast >= 0 && ops.arrow < 0) return valueSpans(src, at, ops.cast, branch);
	return [{ at, end, outerAt: branch.at, outerEnd: branch.end }];
}
