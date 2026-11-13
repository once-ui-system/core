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
 *   - the leaf's parent in the same file is a Flex, Row, Column, Grid, Card,
 *     Mask or Fade rendering a block element (so the wrapper is a flex or
 *     grid item in its place, and a <div> is valid there), and the leaf has
 *     no spread;
 *   - what moves is `hide` and breakpoint objects of `{ hide: … }` only (any
 *     leaf); padding on Text or Heading, which draw no box of their own
 *     (wrapped in a Column, which passes the width through); or padding,
 *     background, solid, border and radius on Icon, whose root is a bare
 *     fit-content box (wrapped in `<Row fit>`, the same box);
 *   - the leaf's margins move with it, onto the wrapper; its `fillWidth` is
 *     kept and copied; a `flex` moves only off Text and Heading.
 *
 * Two wrappers are exact anywhere: an Icon's box outside a layout parent is
 * `<Row as="span" inline fit>` (2.x's Icon root), and a Spinner's layout
 * props go on `<Row center>` (2.x's Spinner root), its flex, fillWidth and
 * offsets with them. Where Text-like padding cannot be wrapped (running
 * text, a className, style or handler beside it, ListItem and the text
 * effects), it becomes the inline style 2.x's class was, with the token's
 * variable (`var(--static-space-4)`). Literal `zIndex` / `opacity` on a leaf
 * and InlineCode `textVariant` become their classes; Kbd `fit` is dropped
 * (2.x Kbd was already fit).
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
import { addToCoreImport, lineMap, located, splitLine } from "./codemod-3.0-format.mjs";

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
	// Built on Text, so they take its props: a leaf's set, and Text's own.
	ListItem: TEXT_OWN,
	CountFx: TEXT_OWN,
	ShineFx: TEXT_OWN,
	TypeFx: TEXT_OWN,
};

/** The leaves that hand an unknown prop to a native <input> or <textarea>. */
const NATIVE_FIELDS = new Set(["Input", "NumberInput", "ColorInput", "Textarea"]);
/** The leaves that render a Text or Heading: padding becomes inline style where no wrapper can take it. */
const TEXT_LEAVES = new Set(["Text", "Heading", "ListItem", "CountFx", "ShineFx", "TypeFx"]);
/** Those a Column may wrap: ListItem is an <li>, and the effects are best left in their own element. */
const COLUMN_WRAPPED = new Set(["Text", "Heading"]);

/**
 * The leaves whose 2.x root was a Flex: a literal `zIndex`, `opacity` or
 * `textVariant` there was a class on that root, which 3.0 still has, so the
 * class on the leaf's `className` renders the same. Text and Heading put
 * `zIndex` on their element as the same class.
 */
const FLEX_ROOTED = new Set([
	"Icon",
	"Avatar",
	"Spinner",
	"StatusIndicator",
	"Kbd",
	"InlineCode",
	"NavIcon",
]);
const Z_INDEX = new Set(["-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
const OPACITY = new Set(["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100"]);

/** Props equal to what the leaf already did in 2.x: dropping them renders the same. */
const NO_OPS = { Kbd: ["fit", "inline"] };
/** Values equal to the leaf's own, in 2.x and 3.0 alike (KbdCap's padding): dropping them renders the same. */
const SAME_VALUES = { Kbd: { paddingX: "4", paddingY: "2" } };

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
/** What places an absolutely positioned leaf, besides OFFSETS: a wrapper in its place takes them. */
const PLACEMENT = new Set(["translateX", "translateY"]);

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
	"solid",
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

/**
 * Layout components whose children are flex or grid items of their root
 * element: the primitives, and the Flex-based components that render their
 * children straight into it (a Card's are the items of its Flex).
 */
const LAYOUT_PARENTS = ["Flex", "Row", "Column", "Grid", "Card", "Mask", "Fade"];
const PRIMITIVES = new Set(["Flex", "Row", "Column", "Grid"]);
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
	// Flow content too: a <div> is valid in a list item, a cell, a quote.
	"li",
	"td",
	"th",
	"dd",
	"dt",
	"blockquote",
	"details",
	"dialog",
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
	return bindings.has(tag) || bindings.declared?.has(tag) ? [] : [tag];
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

/** Size props a wrapper takes over from its only child. */
const SIZES = new Set(["width", "maxWidth", "minWidth", "height", "maxHeight", "minHeight"]);

/** Whether `el`'s parent is a layout component of this file that holds no other element and sets no size itself. */
function soleChild(el, layoutOf, src) {
	const parent = el.parent;
	if (!parent || !layoutOf.has(parent.name) || parent.end < 0) return false;
	const inner = src.slice(parent.openEnd, src.lastIndexOf("<", parent.end - 1));
	const before = inner.slice(0, el.at - parent.openEnd).trim();
	const after = inner.slice(el.end - parent.openEnd).trim();
	if (before || after) return false;
	return !attributesOf(src, parent.nameEnd, parent.openEnd - 1).some((a) => SIZES.has(a.name) || a.name.startsWith("fill") || a.name === "fit");
}

/** The outermost of the fragments `el` sits in (`el` itself when it is in none). */
function topFragment(el) {
	let top = el;
	while (top.parent && (top.parent.name === "" || top.parent.name === "Fragment" || top.parent.name === "React.Fragment")) top = top.parent;
	return top;
}

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
	// Notes on what a round did (not left to do), kept from every round.
	const notes = [];
	let out = src;
	// A report's line, read in a later round's text, as the line in `src`.
	const back = (text, list) => {
		if (text === src) return list;
		const map = lineMap(text, src);
		return list.map((w) => {
			const { text: msg, line } = splitLine(w);
			return line === null ? w : `${msg} (line ${map(line)})`;
		});
	};
	for (let round = 0; round < 4; round++) {
		const r = leafRound(out, isCore);
		hits.push(...r.hits);
		notes.push(...back(out, r.notes));
		// What the last round still reports is what is left to do by hand.
		warnings.length = 0;
		warnings.push(...back(out, r.warnings));
		if (r.out === out) break;
		out = r.out;
	}
	if (hits.length) out = withWrapperImports(out, hits, warnings, isCore);
	out = leafPropTypes(out, isCore, hits, warnings);
	warnings.unshift(...notes);
	return { out, hits, warnings };
}

/**
 * The props a leaf no longer takes, named through its type:
 * `Pick<ComponentProps<typeof Icon>, "onBackground" | "background">` →
 * `Pick<ComponentProps<typeof Icon>, "onBackground"> & Pick<ComponentProps<typeof Row>, "background">`
 * (the Row that now carries them takes the type 2.x's Flex gave them), and
 * `ComponentProps<typeof Icon>["background"]` → `…<typeof Row>["background"]`.
 */
function leafPropTypes(src, isCore, hits, warnings) {
	const bindings = importBindings(src);
	const row = [...bindings].find(([local, b]) => b.canonical === "Row" && isCore(b.source) && !local.startsWith("type "))?.[0] ?? null;
	let out = src;
	for (const tag of Object.keys(LEAVES)) {
		const own = new Set(LEAVES[tag]);
		const moves = (k) => LAYOUT_PROPS.has(k) && !LEAF_PROPS.has(k) && !own.has(k);
		for (const [local, b] of bindings) {
			if (b.canonical !== tag || !isCore(b.source) || local.startsWith("type ")) continue;
			const props = `((?:React\\s*\\.\\s*)?ComponentProps(?:WithoutRef|WithRef)?\\s*<\\s*typeof\\s+)${local}(\\s*>)`;
			const pick = new RegExp(`(?<![\\w$.])Pick\\s*<\\s*${props}\\s*,\\s*((?:["'][\\w]+["']\\s*\\|?\\s*)+)>`, "g");
			out = out.replace(pick, (whole, head, close, list, at) => {
				const keys = [...list.matchAll(/(["'])(\w+)\1/g)].map((m) => ({ q: m[1], k: m[2] }));
				const moved = keys.filter((x) => moves(x.k));
				if (!moved.length) return whole;
				if (!row) {
					warnings.push(located(`Pick<ComponentProps<typeof ${tag}>, …>: ${tag} does not take ${moved.map((x) => x.k).join(", ")} in 3.0; pick them from Row's props, the Row that carries them`, out, at));
					return whole;
				}
				const kept = keys.filter((x) => !moves(x.k));
				const names = (xs) => xs.map((x) => `${x.q}${x.k}${x.q}`).join(" | ");
				const rowPick = `Pick<${head}${row}${close}, ${names(moved)}>`;
				const text = kept.length ? `Pick<${head}${local}${close}, ${names(kept)}> & ${rowPick}` : rowPick;
				hits.push(`Pick<ComponentProps<typeof ${tag}>, …> ${moved.map((x) => x.k).join(", ")} → Row's props`);
				// `Pick<…>[]`: the intersection is one type.
				return kept.length && /^\s*\[/.test(out.slice(at + whole.length)) ? `(${text})` : text;
			});
			const index = new RegExp(`(?<![\\w$.])${props}(\\s*\\[\\s*)(["'])(\\w+)\\4(\\s*\\])`, "g");
			out = out.replace(index, (whole, head, close, open, q, k, end, at) => {
				if (!moves(k)) return whole;
				if (!row) {
					warnings.push(located(`ComponentProps<typeof ${tag}>["${k}"]: ${tag} does not take ${k} in 3.0; use Row's`, out, at));
					return whole;
				}
				hits.push(`ComponentProps<typeof ${tag}>["${k}"] → Row's`);
				return `${head}${row}${close}${open}${q}${k}${q}${end}`;
			});
		}
	}
	return out;
}

function leafRound(src, isCore) {
	const hits = [];
	const warnings = [];
	const notes = [];
	const edits = [];
	const bindings = importBindings(src);
	const leafOf = new Map();
	for (const tag of Object.keys(LEAVES))
		for (const name of namesFor(tag, bindings, isCore)) leafOf.set(name, tag);
	const layoutOf = new Map();
	for (const tag of LAYOUT_PARENTS)
		for (const name of namesFor(tag, bindings, isCore)) layoutOf.set(name, tag);

	const elements = elementsOf(src);
	for (const el of elements) {
		const tag = leafOf.get(el.name);
		if (!tag) continue;
		const attrs = attributesOf(src, el.nameEnd, el.openEnd - 1);
		const own = new Set(LEAVES[tag]);
		let dropped = attrs.filter(
			(a) => LAYOUT_PROPS.has(a.name) && !LEAF_PROPS.has(a.name) && !own.has(a.name),
		);
		// Edits inside the opening tag, applied to the element before any wrapping.
		const ops = [];
		const done = [];
		const spread = /\{\s*\.\.\./.test(src.slice(el.nameEnd, el.openEnd));

		// Button and IconButton name their own `radius="none"`.
		if (tag === "Button" || tag === "IconButton") {
			const radius = dropped.find((a) => a.name === "radius");
			if (radius && unquote(radius.value) === "none" && !attrs.some((a) => a.name === "corners")) {
				ops.push({ at: radius.at, end: radius.end, text: 'corners="none"' });
				done.push(`<${tag}> radius="none" → corners="none"`);
				dropped = dropped.filter((a) => a !== radius);
			}
		}

		// What 2.x already did by itself: drop it.
		for (const name of NO_OPS[tag] ?? []) {
			const a = dropped.find((x) => x.name === name);
			if (!a || !(a.value === null || /^\{\s*true\s*\}$/.test(a.value))) continue;
			ops.push({ ...remove(src, a), text: "" });
			done.push(`<${tag}> ${name} removed (2.x ${tag} was already ${name})`);
			dropped = dropped.filter((x) => x !== a);
		}

		for (const [name, value] of Object.entries(SAME_VALUES[tag] ?? {})) {
			const a = dropped.find((x) => x.name === name);
			if (!a || unquote(a.value) !== value) continue;
			ops.push({ ...remove(src, a), text: "" });
			done.push(`<${tag}> ${name}="${value}" removed (the ${tag}'s own padding)`);
			dropped = dropped.filter((x) => x !== a);
		}

		// A literal zIndex, opacity or textVariant whose 2.x class 3.0 still has.
		const classes = [];
		const classed = [];
		for (const a of dropped) {
			const cls = classFor(tag, a);
			if (cls) {
				classes.push(cls);
				classed.push(a);
			}
		}
		if (classes.length) {
			const merged = withClassName(src, attrs, classes, classed[0]);
			if (merged) {
				ops.push(...merged.ops);
				for (const a of classed) if (!merged.ops.some((o) => o.at === a.at)) ops.push({ ...remove(src, a), text: "" });
				done.push(`<${tag}> ${classed.map((a) => a.name).join(", ")} → className="${classes.join(" ")}"`);
				dropped = dropped.filter((a) => !classed.includes(a));
			}
		}

		// Avatar's border and radius: 2.x put them on its root Flex after its own
		// border="neutral-strong" radius="full", so they replaced those. 3.0's
		// Avatar keeps its own, so a width or style becomes the class 2.x wrote
		// (border-2 and border-dashed come after border-1 and border-solid in
		// the stylesheet, so they win), and a colour or radius the declaration
		// its class made, inline (its class would lose to the Avatar's own).
		if (tag === "Avatar" && !spread && !attrs.some((a) => a.name === "loading")) {
			const cls = [];
			const style = [];
			const done2 = [];
			for (const a of dropped) {
				const v = a.value === null ? null : literalValue(a.value);
				if (v === null) continue;
				if (a.name === "borderWidth" && BORDER_WIDTHS.has(v)) cls.push([a, `border-${v}`]);
				else if (a.name === "borderStyle" && (v === "dashed" || v === "solid")) cls.push([a, v === "solid" ? null : "border-dashed"]);
				else if (a.name === "border" && borderColor(v)) style.push([a, `borderColor: "${borderColor(v)}"`]);
				else if (a.name === "radius" && RADII.has(v)) style.push([a, `borderRadius: "${v === "none" ? "0" : `var(--radius-${v})`}"`]);
				else continue;
				done2.push(a);
			}
			const classes = cls.map(([, c]) => c).filter(Boolean);
			const merged = classes.length ? withClassName(src, attrs, classes, cls.find(([, c]) => c)[0]) : { ops: [] };
			const styled = style.length ? styleWith(src, attrs, style.map(([, e]) => e), style[0][0]) : { ops: [] };
			if (merged && styled && done2.length) {
				const placed = [...merged.ops, ...styled.ops];
				ops.push(...placed);
				for (const a of done2) if (!placed.some((o) => o.at === a.at)) ops.push({ ...remove(src, a), text: "" });
				done.push(`<Avatar> ${done2.map((a) => a.name).join(", ")} → ${[classes.length && `className="${classes.join(" ")}"`, style.length && "style"].filter(Boolean).join(" and ")} (what 2.x's classes did)`);
				dropped = dropped.filter((a) => !done2.includes(a));
			}
		}

		const finish = (extraWarning) => {
			if (extraWarning) warnings.push(located(extraWarning, src, el.at));
			if (!ops.length) return;
			let element = src.slice(el.at, el.openEnd);
			for (const o of [...ops].sort((x, y) => y.at - x.at)) element = element.slice(0, o.at - el.at) + o.text + element.slice(o.end - el.at);
			edits.push({ at: el.at, end: el.openEnd, text: element, hits: done });
		};

		if (!dropped.length) {
			finish();
			continue;
		}
		const warn = (why) => `<${tag}> ${dropped.map((a) => a.name).join(", ")}: ${why}`;

		const textLike = TEXT_LEAVES.has(tag);
		// 2.x Text and Heading took `hide` (and `s={{ hide }}`) out and ignored
		// it: dropping it keeps the page as it rendered. A wrapper would make it
		// take effect, which the author may have wanted, so it is reported.
		if (textLike) {
			const inert = dropped.filter(
				(a) => a.name === "hide" || (BREAKPOINTS.includes(a.name) && hideOnly(a.value) !== null),
			);
			if (inert.length) {
				for (const a of inert) ops.push({ ...remove(src, a), text: "" });
				done.push(`<${tag}> ${inert.map((a) => a.name).join(", ")} dropped`);
				notes.push(
					located(
						`<${tag}> ${inert.map((a) => a.name).join(", ")}: had no effect on ${tag} in 2.x and was dropped; to hide it, wrap it in a Column with hide`,
						src,
						el.at,
					),
				);
				dropped = dropped.filter((a) => !inert.includes(a));
				if (!dropped.length) {
					finish();
					continue;
				}
			}
		}
		// 2.x Input, NumberInput, ColorInput and Textarea spread what they did
		// not take onto the native <input> or <textarea>, where `height` is an
		// attribute only an image input reads (2.0 renamed the old `height` to
		// `size`): it did nothing, and dropping it keeps the page as it was.
		if (NATIVE_FIELDS.has(tag)) {
			const type = attrs.find((a) => a.name === "type");
			const image = type && (type.value === null || unquote(type.value) === null || unquote(type.value) === "image");
			const inert = image ? [] : dropped.filter((a) => a.name === "height");
			if (inert.length) {
				for (const a of inert) ops.push({ ...remove(src, a), text: "" });
				done.push(`<${tag}> height dropped (2.x passed it to the native <${tag === "Textarea" ? "textarea" : "input"}>, where it did nothing; the size prop is \`size\`)`);
				dropped = dropped.filter((a) => !inert.includes(a));
				if (!dropped.length) {
					finish();
					continue;
				}
			}
		}
		const spinner = tag === "Spinner";
		// An absolutely placed leaf (`position="absolute" left top translateX="-50%"`):
		// a Row in its place takes the placement, shrink-wrapped to the leaf, so
		// the translate's percentages are of the same box.
		const position = unquote(attrs.find((a) => a.name === "position")?.value);
		const placed = !textLike && !spinner && (position === "absolute" || position === "fixed") && !attrs.some((a) => a.name === "fillWidth" || a.name === "flex");
		const movable = (a) => {
			if (placed && PLACEMENT.has(a.name)) return true;
			if (a.name === "hide") return a.value === null || /^\{\s*(true|false)\s*\}$/.test(a.value);
			if (BREAKPOINTS.includes(a.name)) return hideOnly(a.value) !== null;
			if (textLike) return PADDING.has(a.name);
			if (tag === "Icon") return ICON_BOX.has(a.name);
			// Spinner's root is a centred Flex in 2.x and 3.0: a Row around it is the same box.
			if (spinner) return !BREAKPOINTS.includes(a.name);
			return false;
		};
		const stuck = dropped.filter((a) => !movable(a));
		const wrapperKind = textLike ? "Column" : "Row";
		const suggestion = `wrap it in a ${wrapperKind} that carries them`;
		if (stuck.length) {
			// A padding string that is no spacing token: 2.x wrote a class of
			// that name (px-1rem), which does not exist, so the side had none.
			const dead = stuck.filter((a) => PADDING.has(a.name) && unquote(a.value) !== null && !/^\d+$/.test(unquote(a.value)));
			// Kbd's root was a 2.x Flex its props were spread onto (after its own padding).
			if (tag === "Kbd" && dead.length === stuck.length) {
				const sides = (a) =>
					({ padding: ["padding"], paddingX: ["paddingLeft", "paddingRight"], paddingY: ["paddingTop", "paddingBottom"] })[a.name] ?? [a.name];
				const zero = dead.flatMap((a) => sides(a).map((k) => `${k}: 0`)).join(", ");
				const meant = dead.flatMap((a) => sides(a).map((k) => `${k}: "${unquote(a.value)}"`)).join(", ");
				finish(
					warn(
						`not a spacing token: 2.x wrote the class ${dead.map((a) => `${{ padding: "p", paddingX: "px", paddingY: "py", paddingTop: "pt", paddingRight: "pr", paddingBottom: "pb", paddingLeft: "pl" }[a.name]}-${unquote(a.value)}`).join(", ")}, which does not exist, so that padding was 0` +
							` (it replaced the Kbd's own). To keep the 2.x look write style={{ ${zero} }}; for the size it names, style={{ ${meant} }}`,
					),
				);
				continue;
			}
			finish(warn(`not taken by a leaf in 3.0; ${adviceFor(tag, stuck, suggestion)}${soleChild(el, layoutOf, src) && stuck.some((a) => SIZES.has(a.name)) ? `; its parent ${el.parent.name} holds only it, so moving the sizes onto that ${el.parent.name} is likely what you want` : ""}`));
			continue;
		}
		const styling = dropped.some((a) => a.name !== "hide" && !BREAKPOINTS.includes(a.name));
		const onlyPadding = dropped.every((a) => PADDING.has(a.name));
		// Only `hide` and `{ hide }` breakpoints, on a leaf that is a JSX prop's
		// value (`trigger={<NavIcon hide m={{ hide: false }} />}`, the stock
		// Once UI header): the slot holds whatever it is given, so a Row shown
		// and hidden with them is exact there, whatever the parent.
		// The same inside fragments (`<>…<NavIcon hide m={{ hide: false }} />…</>`),
		// which render no box: what holds the wrapper is the fragment's own
		// place, a layout component in this file or a JSX prop's slot.
		let outer = el.parent;
		while (outer && (outer.name === "" || outer.name === "Fragment" || outer.name === "React.Fragment")) outer = outer.parent;
		const inSlot = (e) => elements.some((x) => x !== e && x.nameEnd <= e.at && e.at < x.openEnd);
		const viaFragment =
			outer !== el.parent &&
			!attrs.some((a) => a.name === "flex" || OFFSETS.includes(a.name)) &&
			(outer ? layoutOf.has(outer.name) : inSlot(topFragment(el)));
		const visibility = !styling && !spread && ((!el.parent && inSlot(el)) || viaFragment);
		const translated = placed && dropped.some((a) => PLACEMENT.has(a.name));
		let why = visibility
			? el.end < 0
				? "its closing tag was not found"
				: null
			: blocker({ src, el, attrs, tag, textLike, styling, layoutOf, spread, placed: translated });
		if (!why && textLike && !COLUMN_WRAPPED.has(tag)) why = `a Column would change what ${tag} renders`;

		// Padding on text that no wrapper can take is the class's own declaration, inline.
		if (why && textLike && onlyPadding && !spread) {
			const style = paddingStyle(src, attrs, dropped);
			if (style) {
				ops.push(...style.ops);
				done.push(`<${tag}> ${dropped.map((a) => a.name).join(", ")} → style`);
				finish();
				continue;
			}
			why = "a padding value is not a token or a CSS length";
		}
		if (why) {
			// Only `hide` and `{ hide }` breakpoints: the wrapper to paste.
			const paste =
				!styling && !spread
					? `: <Row ${dropped.map((a) => src.slice(a.at, a.end)).join(" ")}><${el.name} …/></Row>`
					: "";
			finish(warn(`not taken by a leaf in 3.0; ${suggestion}${paste} (${why})`));
			continue;
		}

		// The wrapper: what moves, the margins, and the sizing that keeps the box.
		const moved = attrs.filter(
			(a) =>
				dropped.includes(a) ||
				MARGINS.includes(a.name) ||
				// The outermost element of a list item carries its key.
				a.name === "key" ||
				(textLike && a.name === "flex") ||
				(translated && OFFSETS.includes(a.name)) ||
				(spinner && ["flex", "fillWidth", ...OFFSETS].includes(a.name)),
		);
		const fillWidth = spinner ? null : attrs.find((a) => a.name === "fillWidth");
		const inLayout = el.parent && layoutOf.has(el.parent.name);
		const wrapperName = names(layoutOf, wrapperKind)[0] ?? wrapperKind;
		// Outside a flex or grid parent, an Icon's box is its 2.x root: an inline-flex span.
		const iconBox = tag === "Icon" && styling ? (inLayout ? ["fit"] : ['as="span"', "inline", "fit"]) : [];
		const wrapperAttrs = [
			...iconBox,
			...(spinner ? ["center"] : []),
			...(fillWidth ? [src.slice(fillWidth.at, fillWidth.end)] : []),
			...moved.filter((a) => !(spinner && a.name === "center")).map((a) => src.slice(a.at, a.end)),
		];
		for (const a of moved) ops.push({ ...remove(src, a), text: "" });
		let element = src.slice(el.at, el.end);
		for (const o of [...ops].sort((x, y) => y.at - x.at)) element = element.slice(0, o.at - el.at) + o.text + element.slice(o.end - el.at);
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
			hits: [...done, `<${tag}> ${dropped.map((a) => a.name).join(", ")} → <${wrapperName}> around it`],
		});
	}
	// A leaf the element scanner did not reach (something before it it could
	// not read): never silent, since its props may need moving.
	const seen = new Set(elements.map((e) => e.at));
	for (const [name, tag] of leafOf) {
		for (const m of src.matchAll(new RegExp(`<${name.replace(".", "\\.")}(?=[\\s/>])`, "g"))) {
			if (seen.has(m.index) || /[\w$)\].]/.test(src[m.index - 1] ?? "")) continue;
			const end = openingTagEnd(src, m.index + name.length + 1);
			const own = new Set(LEAVES[tag]);
			const props = end < 0 ? [] : attributesOf(src, m.index + name.length + 1, end).filter((a) => LAYOUT_PROPS.has(a.name) && !LEAF_PROPS.has(a.name) && !own.has(a.name));
			if (end >= 0 && !props.length) continue;
			warnings.push(
				located(
					`<${tag}>${props.length ? ` ${props.map((a) => a.name).join(", ")}` : ""}: this element could not be read in place (check the code before it); ${props.length ? "these are not taken by a leaf in 3.0, move them to a Row or Column around it" : "check its layout props by hand"}`,
					src,
					m.index,
				),
			);
		}
	}
	return { out: applyEdits(src, edits, hits), hits, warnings, notes };
}

const names = (layoutOf, tag) => [...layoutOf].filter(([, t]) => t === tag).map(([n]) => n);

/** The 2.x class a literal `zIndex`, `opacity` or `textVariant` was on this leaf, or null. */
function classFor(tag, a) {
	const v = a.value === null ? null : literalValue(a.value);
	if (v === null) return null;
	if (a.name === "zIndex" && Z_INDEX.has(v) && (FLEX_ROOTED.has(tag) || TEXT_LEAVES.has(tag))) return `z-index-${v}`;
	if (a.name === "opacity" && OPACITY.has(v) && FLEX_ROOTED.has(tag)) return `opacity-${v}`;
	if (a.name === "textVariant" && FLEX_ROOTED.has(tag) && tag !== "Icon") {
		const parts = v.split("-");
		if (parts.length < 3 || parts.some((p) => !/^[a-z]+$/.test(p))) return null;
		const size = parts.pop();
		const weight = parts.pop();
		return `font-${parts.join("-")} font-${weight} font-${size}`;
	}
	return null;
}

const BORDER_WIDTHS = new Set(["1", "2", "4", "6", "8"]);
const RADII = new Set(["none", "xs", "s", "m", "l", "xl", "full"]);
const SCHEMES = /^(neutral|brand|accent|info|danger|warning|success)$/;

/** The colour 2.x's border class for `value` declared (`.brand-border-medium`), or null. */
function borderColor(value) {
	if (value === "transparent") return "var(--static-transparent)";
	if (value === "surface") return "var(--surface-border)";
	const [scheme, a, b] = value.split("-");
	if (!SCHEMES.test(scheme)) return null;
	if (a === "alpha" && /^(weak|medium|strong)$/.test(b ?? "")) return `var(--${scheme}-alpha-${b})`;
	if (b === undefined && /^(weak|medium|strong)$/.test(a ?? "")) return `var(--${scheme}-border-${a})`;
	return null;
}

/**
 * Ops that put `entries` first in the element's inline style: a literal
 * `style={{ … }}` keeps its own entries after them (they beat the 2.x class),
 * another expression is spread after them. A missing style is written where
 * `at` was.
 */
function styleWith(src, attrs, entries, at) {
	const style = attrs.find((a) => a.name === "style");
	if (!style) return { ops: [{ at: at.at, end: at.end, text: `style={{ ${entries.join(", ")} }}` }] };
	const raw = String(style.value ?? "").trim();
	if (!raw.startsWith("{")) return null;
	const inline = /^\{\s*\{([\s\S]*)\}\s*\}$/.exec(raw);
	const rest = inline ? inline[1].trim().replace(/,\s*$/, "") : `...${raw.slice(1, -1).trim()}`;
	if (inline && rest.includes("\n")) {
		// A style object written over several lines gains its entries on lines of their own.
		const indent = /\n([ \t]*)\S/.exec(inline[1])?.[1] ?? "  ";
		const close = /\n([ \t]*)$/.exec(inline[1])?.[1] ?? "";
		const body = inline[1].replace(/^\s*\n/, "").replace(/\s*$/, "");
		return { ops: [{ at: style.at, end: style.end, text: `style={{\n${entries.map((e) => `${indent}${e},`).join("\n")}\n${body}\n${close}}}` }] };
	}
	return { ops: [{ at: style.at, end: style.end, text: `style={{ ${[...entries, ...(rest ? [rest] : [])].join(", ")} }}` }] };
}

/** `"1"`, `{1}`, `{"1"}`, `{-1}` → the text of the literal; anything else → null. */
function literalValue(raw) {
	const v = String(raw).trim();
	const inner = v.startsWith("{") ? v.slice(1, -1).trim() : v;
	const str = /^(["'])([^"']*)\1$/.exec(inner);
	if (str) return str[2];
	return /^-?\d+$/.test(inner) ? inner : null;
}

/**
 * Ops that add `classes` to the element's className: a literal one gains
 * them, a member chain (`styles.card`) becomes a template literal, and a
 * missing one is written where `at` was. Null when the className is another
 * expression, which could be undefined.
 */
function withClassName(src, attrs, classes, at) {
	const cls = attrs.find((a) => a.name === "className");
	const list = classes.join(" ");
	if (!cls) return { ops: [{ at: at.at, end: at.end, text: `className="${list}"` }] };
	if (cls.value === null) return null;
	const literal = /^\{?\s*(["'])([^"']*)\1\s*\}?$/.exec(String(cls.value).trim());
	if (literal) return { ops: [{ at: cls.at, end: cls.end, text: `className="${`${literal[2]} ${list}`.trim()}"` }] };
	const expr = String(cls.value).trim().slice(1, -1).trim();
	if (/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[["'][^"']+["']\])+$/.test(expr))
		return { ops: [{ at: cls.at, end: cls.end, text: `className={\`\${${expr}} ${list}\`}` }] };
	return null;
}

/** The CSS custom property behind a 2.x spacing token, or a CSS length as it is; null otherwise. */
function spaceValue(raw) {
	const v = literalValue(raw) ?? (/^\{?\s*["']([^"']+)["']\s*\}?$/.exec(String(raw).trim())?.[1] ?? null);
	if (v === null) return null;
	if (SPACE_TOKENS.has(v)) return `var(--static-space-${v})`;
	if (/^(xs|s|m|l|xl)$/.test(v)) return `var(--responsive-space-${v})`;
	if (/^-?\d*\.?\d+(rem|px|em|%|vh|vw)$/.test(v)) return v;
	return null;
}
const SPACE_TOKENS = new Set(
	"0 1 2 4 8 12 16 20 24 32 40 48 56 64 72 80 104 128 160".split(" "),
);

/**
 * The padding props as the inline style the 2.x classes declared. A side
 * beats its axis, and an axis beats `padding`, as the classes' order did.
 */
function paddingStyle(src, attrs, padding) {
	const value = {};
	for (const a of padding) {
		const v = spaceValue(a.value);
		if (v === null) return null;
		value[a.name] = v;
	}
	const side = (s, axis) => value[`padding${s}`] ?? value[axis] ?? value.padding;
	const t = side("Top", "paddingY");
	const r = side("Right", "paddingX");
	const b = side("Bottom", "paddingY");
	const l = side("Left", "paddingX");
	let entries;
	if (t && r && b && l) {
		const short = t === b && r === l ? (t === r ? [t] : [t, r]) : [t, r, b, l];
		entries = [`padding: "${short.join(" ")}"`];
	} else {
		entries = [
			["paddingTop", t],
			["paddingRight", r],
			["paddingBottom", b],
			["paddingLeft", l],
		]
			.filter(([, v]) => v)
			.map(([k, v]) => `${k}: "${v}"`);
	}
	const ops = padding.map((a) => ({ ...remove(src, a), text: "" }));
	const style = attrs.find((a) => a.name === "style");
	if (!style) {
		// In the first padding prop's place.
		const first = padding.reduce((x, y) => (y.at < x.at ? y : x));
		ops.splice(ops.findIndex((o) => o.end === first.end), 1, {
			at: first.at,
			end: first.end,
			text: `style={{ ${entries.join(", ")} }}`,
		});
		return { ops };
	}
	const raw = String(style.value ?? "").trim();
	const inline = /^\{\s*\{([\s\S]*)\}\s*\}$/.exec(raw);
	// The 2.x class lost to the element's own style, so the style's entries come last.
	const rest = inline ? inline[1].trim().replace(/,\s*$/, "") : `...${raw.slice(1, -1).trim()}`;
	if (!raw.startsWith("{")) return null;
	ops.push({ at: style.at, end: style.end, text: `style={{ ${[...entries, ...(rest ? [rest] : [])].join(", ")} }}` });
	return { ops };
}

/** What to say about props no wrapper here can take. */
function adviceFor(tag, stuck, suggestion) {
	const bp = stuck.filter((a) => BREAKPOINTS.includes(a.name));
	if (bp.length) return `${suggestion} (breakpoint objects belong to Flex, Row, Column and Grid)`;
	if (tag === "Kbd" || tag === "InlineCode" || tag === "Avatar" || tag === "NavIcon")
		return `${suggestion}, or drop them (they override the ${tag}'s own look)`;
	if (stuck.every((a) => a.name === "zIndex" || a.name === "opacity"))
		return `${suggestion}, or write the class it was (className="z-index-1", "opacity-60") for a literal`;
	return `${suggestion}, or drop them`;
}

/** Why wrapping this element would not render exactly the same, or null. */
function blocker({ src, el, attrs, tag, textLike, styling, layoutOf, spread, placed = false }) {
	if (el.end < 0) return "its closing tag was not found";
	if (spread) return "a spread may carry more props";
	const spinner = tag === "Spinner";
	if (spinner) {
		if (attrs.some((a) => a.name === "className" || a.name === "style"))
			return "its className or style would land inside the Row";
		return null;
	}
	const iconBox = tag === "Icon" && styling;
	const parent = el.parent;
	const inLayout = parent && layoutOf.has(parent.name);
	if (!inLayout && !iconBox) return "its parent is not a Flex, Row, Column, Grid or Card in this file";
	if (inLayout && PRIMITIVES.has(layoutOf.get(parent.name))) {
		const parentAttrs = attributesOf(src, parent.nameEnd, parent.openEnd - 1);
		const parentAs = parentAttrs.find((a) => a.name === "as");
		if (parentAs && !BLOCK_ELEMENTS.has(unquote(parentAs.value)))
			return `its parent renders as ${parentAs.value}`;
	}
	if (!placed && attrs.some((a) => OFFSETS.includes(a.name))) return "it is positioned";
	if (!textLike && attrs.some((a) => a.name === "flex")) return "its flex would not reach it";
	if (iconBox && attrs.some((a) => a.name === "fillWidth" || a.name === "tooltip"))
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
	const out = addToCoreImport(src, missing);
	if (out === null) {
		// MDX and code samples import nothing; their components are in scope.
		if ([...bindings.values()].some((b) => isCore(b.source)))
			warnings.push(`${missing.join(", ")}: import them from "@once-ui-system/core"`);
		return src;
	}
	return out;
}

/** Apply edits right to left so earlier offsets stay valid; an overlapping edit is dropped. */
function applyEdits(src, edits, hits) {
	edits.sort((x, y) => y.at - x.at || y.end - x.end);
	let out = src;
	let lastAt = Number.POSITIVE_INFINITY;
	for (const e of edits) {
		if (e.end > lastAt) continue;
		out = out.slice(0, e.at) + e.text + out.slice(e.end);
		hits.push(...(e.hits ?? [e.hit]));
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
