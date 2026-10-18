#!/usr/bin/env node
/**
 * Once UI 2.x → 3.0 codemod, G2: leaf components take a small prop set.
 *
 * Button, IconButton, ToggleButton, the fields, Switch, Checkbox, RadioButton,
 * Text, Heading, Icon, Avatar, Spinner, StatusIndicator, Kbd, InlineCode,
 * ProgressBar, Logo, SmartLink and NavIcon take their own props and
 * `LeafProps`: the margins, `flex`, `fillWidth`, `position`, `top` / `right` /
 * `bottom` / `left`, `className` and `style`. Every other layout prop
 * (padding, background, border, radius, sizes, `hide`, the `xl`…`xs`
 * breakpoint objects…) goes on a Row or Column around the leaf.
 *
 * The wrapper is written only where it renders exactly what the leaf did:
 *
 *   - the leaf's parent in the same file is a Flex, Row, Column or Grid
 *     rendering a block element (so the wrapper is a flex or grid item in its
 *     place, and a <div> is valid there), and the leaf has no spread;
 *   - what moves is `hide` and breakpoint objects of `{ hide: … }` only (any
 *     leaf); padding on Text or Heading, which draw no box of their own
 *     (wrapped in a Column, which passes the width through); or padding,
 *     background, border and radius on Icon, whose root is a bare fit-content
 *     box (wrapped in `<Row fit>`, the same box);
 *   - the leaf's margins move with it, onto the wrapper; its `fillWidth` is
 *     kept and copied; a `flex` moves only off Text and Heading.
 *
 * `radius="none"` on Button and IconButton is their `corners="none"`.
 * Everything else is reported with the props to move: a parent that is not
 * a layout component or not in the file, a spread, an offset, a prop that
 * overrides the leaf's own look (Kbd and InlineCode `background`, Avatar
 * `border`), a breakpoint object with other keys. Report > guess.
 *
 * Scoped like the other passes: only elements that are Once UI's, found
 * through the file's imports, or by name where nothing is imported (MDX and
 * code samples). Idempotent. Safe on code already written for 3.0: it reads
 * no values, so it is also the pass to run alone over a 3.0 codebase.
 *
 * Usage:  node scripts/codemod-3.0-leaf.mjs <dir> [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	attributesOf,
	importBindings,
	isCoreSource,
	openingTagEnd,
	withLeadingSpace,
} from "./codemod-2.0.mjs";

/** The leaves, and the layout-named props each keeps as its own. */
const TEXT_OWN = [
	"textVariant",
	"family",
	"weight",
	"wrap",
	"truncate",
	"align",
	"onBackground",
	"onSolid",
	"opacity",
	"as",
];
export const LEAVES = {
	Button: ["horizontal"],
	IconButton: [],
	ToggleButton: ["horizontal", "radius", "truncate"],
	Input: ["cursor"],
	Textarea: [],
	NumberInput: [],
	ColorInput: [],
	DateInput: ["minHeight"],
	TagInput: [],
	OTPInput: [],
	Select: [],
	Slider: [],
	Switch: [],
	Checkbox: [],
	RadioButton: [],
	Text: TEXT_OWN,
	Heading: TEXT_OWN,
	Icon: ["onBackground", "onSolid"],
	Avatar: [],
	Spinner: [],
	StatusIndicator: [],
	Kbd: [],
	InlineCode: [],
	ProgressBar: [],
	Logo: ["showIn"],
	SmartLink: [],
	NavIcon: [],
};

/** `LeafProps`: what every leaf takes. */
export const LEAF_PROPS = new Set([
	"margin",
	"marginTop",
	"marginRight",
	"marginBottom",
	"marginLeft",
	"marginX",
	"marginY",
	"flex",
	"fillWidth",
	"position",
	"top",
	"right",
	"bottom",
	"left",
	"className",
	"style",
]);

const BREAKPOINTS = ["xl", "l", "m", "s", "xs"];
const MARGINS = [...LEAF_PROPS].filter((p) => p.startsWith("margin"));
const OFFSETS = ["position", "top", "right", "bottom", "left"];

/** Every layout prop 2.x put on a Flex: FlexLayoutProps, plus the breakpoints. */
export const LAYOUT_PROPS = new Set(
	(
		"direction horizontal vertical center wrap flex textVariant background solid " +
		"borderTop borderRight borderBottom borderLeft borderX borderY border borderStyle borderWidth " +
		"topRadius rightRadius bottomRadius leftRadius topLeftRadius topRightRadius bottomLeftRadius " +
		"bottomRightRadius radius shadow cursor blendMode blur backdropBlur theme themeBorder themeSolid " +
		"themeSurface padding paddingLeft paddingRight paddingTop paddingBottom paddingX paddingY margin " +
		"marginLeft marginRight marginTop marginBottom marginX marginY gap top right bottom left " +
		"translateX translateY width height maxWidth minWidth minHeight maxHeight fit fitWidth fitHeight " +
		"fill fillWidth fillHeight aspectRatio inline hide pointerEvents userSelect position overflow " +
		"overflowX overflowY scrollbar transition opacity zIndex showIn onBackground onSolid align " +
		BREAKPOINTS.join(" ")
	).split(" "),
);

const PADDING = new Set([
	"padding",
	"paddingTop",
	"paddingRight",
	"paddingBottom",
	"paddingLeft",
	"paddingX",
	"paddingY",
]);
/** The box an Icon's root draws nothing of, so a `<Row fit>` can draw it. */
const ICON_BOX = new Set([
	...PADDING,
	"background",
	"border",
	"borderTop",
	"borderRight",
	"borderBottom",
	"borderLeft",
	"borderX",
	"borderY",
	"borderStyle",
	"borderWidth",
	"radius",
	"topRadius",
	"rightRadius",
	"bottomRadius",
	"leftRadius",
	"topLeftRadius",
	"topRightRadius",
	"bottomLeftRadius",
	"bottomRightRadius",
]);

/** Layout components whose children are flex or grid items. */
const LAYOUT_PARENTS = ["Flex", "Row", "Column", "Grid"];
/** `as` values on a parent that still take a <div> child. */
const BLOCK_ELEMENTS = new Set([
	"div",
	"section",
	"article",
	"header",
	"footer",
	"main",
	"nav",
	"aside",
	"form",
	"fieldset",
	"figure",
	"label",
]);
/** `as` values on Text or Heading that a wrapping <div> may hold. */
const TEXT_ELEMENTS = new Set([
	"span",
	"p",
	"div",
	"label",
	"strong",
	"em",
	"small",
	"code",
	"time",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
]);

/** The local names that mean Once UI's `tag` in this file. */
function namesFor(tag, bindings, isCore) {
	const aliases = [];
	for (const [local, { source, canonical }] of bindings)
		if (canonical === tag && isCore(source)) aliases.push(local);
	if (aliases.length) return aliases;
	return bindings.has(tag) ? [] : [tag];
}

const unquote = (raw) => {
	if (raw === null || raw === undefined) return null;
	const v = String(raw).trim();
	const inner = v.startsWith("{") ? v.slice(1, -1).trim() : v;
	const m = /^(["'])([^"']*)\1$/.exec(inner);
	return m ? m[2] : null;
};

/**
 * Every JSX element in `src`, with its parent, found by a tag scanner that
 * keeps a stack per region: the children of an element, and, separately, the
 * inside of each opening tag (attribute values, code samples in template
 * strings), whose elements have no parent known to it.
 */
export function elementsOf(src) {
	const elements = [];
	const TAG = /<(\/?)([A-Za-z][\w.]*)(?=[\s/>])|<(\/?)>/g;
	function scan(from, to) {
		const stack = [];
		TAG.lastIndex = from;
		let m;
		while ((m = TAG.exec(src)) && m.index < to) {
			const at = m.index;
			const closing = Boolean(m[1] || m[3]);
			// A generic (`useState<T>`), a comparison (`a<b`) or a member: not JSX.
			if (!closing && at > 0 && /[\w$)\].]/.test(src[at - 1])) continue;
			const name = m[2] ?? "";
			if (closing) {
				const end = src.indexOf(">", at);
				if (end < 0) break;
				const i = stack.map((e) => e.name).lastIndexOf(name);
				if (i >= 0) {
					stack[i].end = end + 1;
					stack.length = i;
				}
				TAG.lastIndex = end + 1;
				continue;
			}
			const nameEnd = at + 1 + name.length;
			const end = name ? openingTagEnd(src, nameEnd) : at + 1;
			if (end < 0 || end > to) break;
			const selfClosing = src[end - 1] === "/";
			const el = {
				name,
				at,
				nameEnd,
				openEnd: end + 1,
				end: selfClosing ? end + 1 : -1,
				parent: stack[stack.length - 1] ?? null,
			};
			elements.push(el);
			if (name && end > nameEnd) scan(nameEnd, end);
			TAG.lastIndex = end + 1;
			if (!selfClosing) stack.push(el);
		}
	}
	scan(0, src.length);
	return elements;
}

const remove = (src, a) => ({ at: withLeadingSpace(src, a.at), end: a.end });

/** `{{ hide: true }}` → true, `{{ hide: false }}` → false, anything else → null. */
function hideOnly(raw) {
	if (raw === null) return null;
	const m = /^\{\s*\{\s*hide\s*:\s*(true|false)\s*,?\s*\}\s*\}$/.exec(String(raw));
	return m ? m[1] === "true" : null;
}

/**
 * The G2 pass. `isCore(source)` decides which imports are Once UI. Repeats
 * until nothing more changes, so a leaf inside a leaf it wraps is reached.
 */
export function transformLeaf(src, { isCore = isCoreSource } = {}) {
	const hits = [];
	const warnings = [];
	let out = src;
	for (let round = 0; round < 4; round++) {
		const r = leafRound(out, isCore);
		hits.push(...r.hits);
		// What the last round still reports is what is left to do by hand.
		warnings.length = 0;
		warnings.push(...r.warnings);
		if (r.out === out) break;
		out = r.out;
	}
	if (hits.length) out = withWrapperImports(out, hits, warnings, isCore);
	return { out, hits, warnings };
}

function leafRound(src, isCore) {
	const hits = [];
	const warnings = [];
	const edits = [];
	const bindings = importBindings(src);
	const leafOf = new Map();
	for (const tag of Object.keys(LEAVES))
		for (const name of namesFor(tag, bindings, isCore)) leafOf.set(name, tag);
	const layoutOf = new Map();
	for (const tag of LAYOUT_PARENTS)
		for (const name of namesFor(tag, bindings, isCore)) layoutOf.set(name, tag);

	for (const el of elementsOf(src)) {
		const tag = leafOf.get(el.name);
		if (!tag) continue;
		const attrs = attributesOf(src, el.nameEnd, el.openEnd - 1);
		const own = new Set(LEAVES[tag]);
		const dropped = attrs.filter(
			(a) => LAYOUT_PROPS.has(a.name) && !LEAF_PROPS.has(a.name) && !own.has(a.name),
		);
		if (!dropped.length) continue;
		const warn = (why) =>
			warnings.push(
				`<${tag}> ${dropped.map((a) => a.name).join(", ")}: ${why}`,
			);

		// Button and IconButton name their own `radius="none"`.
		if (tag === "Button" || tag === "IconButton") {
			const radius = dropped.find((a) => a.name === "radius");
			if (radius && unquote(radius.value) === "none" && !attrs.some((a) => a.name === "corners")) {
				edits.push({
					at: radius.at,
					end: radius.end,
					text: 'corners="none"',
					hit: `<${tag}> radius="none" → corners="none"`,
				});
				dropped.splice(dropped.indexOf(radius), 1);
				if (!dropped.length) continue;
			}
		}

		const textLike = tag === "Text" || tag === "Heading";
		const movable = (a) => {
			if (a.name === "hide") return a.value === null || /^\{\s*(true|false)\s*\}$/.test(a.value);
			if (BREAKPOINTS.includes(a.name)) return hideOnly(a.value) !== null;
			if (textLike) return PADDING.has(a.name);
			if (tag === "Icon") return ICON_BOX.has(a.name);
			return false;
		};
		const stuck = dropped.filter((a) => !movable(a));
		const suggestion = `wrap it in a ${textLike ? "Column" : "Row"} that carries them`;
		if (stuck.length) {
			warn(`not taken by a leaf in 3.0; ${suggestion}, or drop them (${describeStuck(tag, stuck)})`);
			continue;
		}
		const styling = dropped.some((a) => a.name !== "hide" && !BREAKPOINTS.includes(a.name));
		const why = blocker({ src, el, attrs, tag, textLike, styling, layoutOf });
		if (why) {
			warn(`not taken by a leaf in 3.0; ${suggestion} (${why})`);
			continue;
		}

		// The wrapper: what moves, the margins, and the sizing that keeps the box.
		const moved = attrs.filter(
			(a) => dropped.includes(a) || MARGINS.includes(a.name) || (textLike && a.name === "flex"),
		);
		const fillWidth = attrs.find((a) => a.name === "fillWidth");
		const wrapperName = (textLike ? names(layoutOf, "Column") : names(layoutOf, "Row"))[0] ?? (textLike ? "Column" : "Row");
		const wrapperAttrs = [
			...(tag === "Icon" && styling ? ["fit"] : []),
			...(fillWidth ? [src.slice(fillWidth.at, fillWidth.end)] : []),
			...moved.map((a) => src.slice(a.at, a.end)),
		];
		let element = src.slice(el.at, el.end);
		for (const a of [...moved].sort((x, y) => y.at - x.at)) {
			const r = remove(src, a);
			element = element.slice(0, r.at - el.at) + element.slice(r.end - el.at);
		}
		const lineStart = src.lastIndexOf("\n", el.at - 1) + 1;
		const indent = src.slice(lineStart, el.at);
		const unit = indent.includes("\t") ? "\t" : "  ";
		const open = `<${wrapperName} ${wrapperAttrs.join(" ")}>`;
		const close = `</${wrapperName}>`;
		const text =
			/^[ \t]*$/.test(indent) && !element.includes("`")
				? `${open}\n${indent}${unit}${element.replace(/\n/g, `\n${unit}`)}\n${indent}${close}`
				: `${open}${element}${close}`;
		edits.push({
			at: el.at,
			end: el.end,
			text,
			hit: `<${tag}> ${dropped.map((a) => a.name).join(", ")} → <${wrapperName}> around it`,
		});
	}
	return { out: applyEdits(src, edits, hits), hits, warnings };
}

const names = (layoutOf, tag) => [...layoutOf].filter(([, t]) => t === tag).map(([n]) => n);

/** Why wrapping this element would not render exactly the same, or null. */
function blocker({ src, el, attrs, tag, textLike, styling, layoutOf }) {
	if (el.end < 0) return "its closing tag was not found";
	const parent = el.parent;
	if (!parent || !layoutOf.has(parent.name))
		return "its parent is not a Flex, Row, Column or Grid in this file";
	const parentAttrs = attributesOf(src, parent.nameEnd, parent.openEnd - 1);
	const parentAs = parentAttrs.find((a) => a.name === "as");
	if (parentAs && !BLOCK_ELEMENTS.has(unquote(parentAs.value)))
		return `its parent renders as ${parentAs.value}`;
	if (/\{\s*\.\.\./.test(src.slice(el.nameEnd, el.openEnd)))
		return "a spread may carry more props";
	if (attrs.some((a) => OFFSETS.includes(a.name))) return "it is positioned";
	if (!textLike && attrs.some((a) => a.name === "flex")) return "its flex would not reach it";
	if (tag === "Icon" && styling && attrs.some((a) => a.name === "fillWidth" || a.name === "tooltip"))
		return "fillWidth or a tooltip on the Icon";
	if (textLike) {
		const as = attrs.find((a) => a.name === "as");
		if (as && !TEXT_ELEMENTS.has(unquote(as.value))) return `it renders as ${as.value}`;
		if (
			styling &&
			attrs.some((a) =>
				["className", "style", "onClick", "href", "truncate"].includes(a.name),
			)
		)
			return "its own className, style, handler or truncation would see the padding move";
	}
	return null;
}

function describeStuck(tag, stuck) {
	const bp = stuck.filter((a) => BREAKPOINTS.includes(a.name));
	if (bp.length) return "breakpoint objects belong to Flex, Row, Column and Grid";
	if (tag === "Kbd" || tag === "InlineCode" || tag === "Avatar" || tag === "NavIcon")
		return `they override the ${tag}'s own look`;
	return "a wrapper would not render the same";
}

/** Add the wrappers the pass wrote to the file's Once UI import. */
function withWrapperImports(src, hits, warnings, isCore) {
	const used = new Set();
	for (const h of hits) {
		const m = /→ <(\w+)> around it$/.exec(h);
		if (m) used.add(m[1]);
	}
	if (!used.size) return src;
	const bindings = importBindings(src);
	const missing = [...used].filter((n) => !bindings.has(n));
	if (!missing.length) return src;
	const IMPORT = /^import\s+\{([^}]*)\}\s*from\s*(["'])(@once-ui-system\/core)\2/gm;
	let m;
	while ((m = IMPORT.exec(src))) {
		// Not one inside a code sample (a template string).
		if ((src.slice(0, m.index).match(/`/g) ?? []).length % 2 === 0) break;
	}
	if (!m || !isCore(m[3])) {
		// MDX and code samples import nothing; their components are in scope.
		if ([...bindings.values()].some((b) => isCore(b.source)))
			warnings.push(`${missing.join(", ")}: import them from "@once-ui-system/core"`);
		return src;
	}
	const inner = m[1];
	const multiline = inner.includes("\n");
	const parts = inner
		.split(",")
		.map((p) => p.trim())
		.filter(Boolean);
	const all = [...parts, ...missing].sort((a, b) =>
		a.replace(/^type\s+/, "").localeCompare(b.replace(/^type\s+/, "")),
	);
	const indent = multiline ? (/\n([ \t]+)\S/.exec(inner)?.[1] ?? "  ") : "";
	const list = multiline ? `\n${all.map((p) => `${indent}${p},`).join("\n")}\n` : ` ${all.join(", ")} `;
	return src.slice(0, m.index) + `import {${list}} from ${m[2]}${m[3]}${m[2]}` + src.slice(m.index + m[0].length);
}

/** Apply edits right to left so earlier offsets stay valid; an overlapping edit is dropped. */
function applyEdits(src, edits, hits) {
	edits.sort((x, y) => y.at - x.at || y.end - x.end);
	let out = src;
	let lastAt = Number.POSITIVE_INFINITY;
	for (const e of edits) {
		if (e.end > lastAt) continue;
		out = out.slice(0, e.at) + e.text + out.slice(e.end);
		hits.push(e.hit);
		lastAt = e.at;
	}
	return out;
}

const invokedDirectly =
	process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
	const [dir, ...flags] = process.argv.slice(2);
	if (!dir) {
		console.error("usage: codemod-3.0-leaf.mjs <dir> [--dry]");
		process.exit(1);
	}
	const dry = flags.includes("--dry");
	const files = [];
	(function walk(d) {
		for (const e of fs.readdirSync(d, { withFileTypes: true })) {
			if (["node_modules", ".next", ".git", "dist"].includes(e.name)) continue;
			const p = path.join(d, e.name);
			if (e.isDirectory()) walk(p);
			else if (/\.(tsx|jsx|mdx)$/.test(e.name)) files.push(p);
		}
	})(dir);
	let total = 0;
	let touched = 0;
	let flagged = 0;
	for (const f of files) {
		const src = fs.readFileSync(f, "utf8");
		const { out, hits, warnings } = transformLeaf(src);
		if (!hits.length && !warnings.length) continue;
		console.log(f);
		for (const w of [...new Set(warnings)]) console.log(`   ! ${w}  (fix by hand)`);
		for (const h of [...new Set(hits)]) console.log(`   ${h}  ×${hits.filter((x) => x === h).length}`);
		flagged += warnings.length;
		if (hits.length) {
			touched++;
			total += hits.length;
			if (!dry) fs.writeFileSync(f, out);
		}
	}
	console.log(
		`\n${total} change${total === 1 ? "" : "s"} across ${touched} file${touched === 1 ? "" : "s"}` +
			(flagged ? `, ${flagged} to fix by hand` : "") +
			(dry ? " (dry run)" : ""),
	);
}
