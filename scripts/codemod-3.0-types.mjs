/**
 * Once UI 2.x → 3.0 codemod, G1 G4 G5: types, resets and aliases.
 *
 *   G5  `dark` / `light` → `showIn="dark"` / `showIn="light"` on the layout
 *       components and Logo.
 *   G5  `textSize`, `textWeight`, `textType` on the layout components →
 *       `textVariant` when all three are literals; dropped beside a
 *       `textVariant` (it overrode the size and weight); reported otherwise.
 *   G5  `size` on Text and Heading: dropped beside `textVariant` (2.x ignored
 *       it there, with a console warning). Otherwise, on Text, the
 *       `className="font-…"` 2.x wrote; on Heading, reported (3.0 Heading
 *       always writes `font-m`).
 *   G5  `textWeight` on Icon: dropped (a weight on an svg's box never showed). `weight` stays, and is dropped only beside a
 *       `textVariant`, where 2.x ignored it and 3.0 would apply it.
 *   G1  `as` on a component that no longer takes it (everything but the
 *       layout primitives, Text, Heading, VisuallyHidden, List and Form):
 *       reported, since 2.x's `as` there was untyped and the fix is a wrapper.
 *   G4  `<Column as="ul">` / `as="ol"`: 3.0 resets the list (markers, indent,
 *       margins), where 2.x showed the browser's defaults; what the element
 *       did not set itself is written back exactly (`className="list-disc"
 *       paddingLeft="40px" marginY="1em"`). An inline reset of its own
 *       (`style={{ listStyle: "none", margin: 0 }}`) is kept: it says what the
 *       list is, which a bare `as="ul"` no longer does, so a second run
 *       leaves the list alone.
 *
 * Scoped like the other passes: only elements that are Once UI's, found
 * through the file's imports, or by name where nothing is imported (MDX).
 * Idempotent.
 */
import {
	attributesOf,
	importBindings,
	isCoreSource,
	literal,
	openingTagEnd,
	withLeadingSpace,
} from "./codemod-2.0.mjs";
import { attributeGap, located } from "./codemod-3.0-format.mjs";
import { elementsOf } from "./codemod-3.0-leaf.mjs";

/**
 * Components that took DisplayProps and StyleProps (Flex-based), plus Logo:
 * the names looked for in MDX, which imports nothing. In a file with imports,
 * every Once UI component is looked at, apart from NO_SHOW_IN.
 */
const SHOW_IN_COMPONENTS = new Set(
	(
		"Flex Row Column Grid Text Heading Logo Card Background Avatar Icon Tag Media Dialog Drawer " +
		"Accordion Animation Carousel Fade Mask Line Option Scroller Table Timeline Tooltip HoverCard " +
		"Skeleton Spinner StatusIndicator ProgressBar SegmentedControl Tabs RadioGroup Slider AvatarGroup " +
		"DatePicker Pagination Feedback Kbd OgCard CodeBlock MediaUpload List ListItem SplitView"
	).split(" "),
);

const LAYOUT = new Set(["Flex", "Row", "Column", "Grid"]);

/** Components whose own `dark` / `light` mean something else. */
const NO_SHOW_IN = new Set(["ThemeSwitcher"]);

/** The components that keep `as` in 3.0. */
const TAKES_AS = new Set([
	"Flex",
	"Row",
	"Column",
	"Grid",
	"Text",
	"Heading",
	"VisuallyHidden",
	"List",
	"Form",
	"HeadingLink",
	"MdxHeading",
	"MdxList",
	"ListItem",
	"CountFx",
	"TypeFx",
	"ShineFx",
]);

/**
 * Components that took an untyped `as` through DisplayProps and spread it
 * onto Flex: the ones 3.0 takes it away from.
 */
const LOST_AS = new Set(
	(
		"Card Background Avatar Icon Tag Media Dialog Drawer Accordion AccordionGroup Animation " +
		"Carousel Fade Mask Line Option Scroller Table Timeline Tooltip HoverCard Skeleton Spinner " +
		"StatusIndicator ProgressBar SegmentedControl Tabs RadioGroup Slider DatePicker Pagination " +
		"Feedback Kbd OgCard CodeBlock MediaUpload SplitView Breadcrumbs BlockQuote InlineCode " +
		"LogoCloud NavIcon Setting InfiniteScroll MegaMenu StylePanel ThemeSwitcher"
	).split(" "),
);

const TEXT_PIECES = ["textType", "textWeight", "textSize"];

/** The local element names that mean Once UI's `tag` in this file. */
function namesFor(tag, bindings, isCore) {
	const aliases = [];
	for (const [local, { source, canonical }] of bindings)
		if (canonical === tag && isCore(source)) aliases.push(local);
	if (aliases.length) return aliases;
	return bindings.has(tag) || bindings.declared?.has(tag) ? [] : [tag];
}

const expr = (raw) => {
	const v = String(raw).trim();
	return v.startsWith("{") ? v.slice(1, -1).trim() : v;
};

const remove = (src, a) => ({
	at: withLeadingSpace(src, a.at),
	end: a.end,
	text: "",
});

/** G5: `dark` / `light` → `showIn`. */
function rewriteShowIn(src, attrs, push, warn) {
	const dark = attrs.find((a) => a.name === "dark");
	const light = attrs.find((a) => a.name === "light");
	if (!dark && !light) return;
	if (attrs.some((a) => a.name === "showIn")) {
		warn("dark/light beside showIn: keep one, showIn");
		return;
	}
	if (dark && light) {
		warn(
			"dark and light both set: the element showed in neither theme; use showIn for one, or remove both",
		);
		return;
	}
	const a = dark ?? light;
	const theme = a.name;
	if (a.value === null || expr(a.value) === "true") {
		push({
			at: a.at,
			end: a.end,
			text: `showIn="${theme}"`,
			hit: `${theme} → showIn="${theme}"`,
		});
		return;
	}
	const e = expr(a.value);
	if (e === "false") {
		push({ ...remove(src, a), hit: `${theme}={false} removed` });
		return;
	}
	const cond = /^[\w.]+$/.test(e) ? e : `(${e})`;
	push({
		at: a.at,
		end: a.end,
		text: `showIn={${cond} ? "${theme}" : undefined}`,
		hit: `${theme}={…} → showIn`,
	});
}

/** G5: `textSize` / `textWeight` / `textType` → `textVariant`. */
function rewriteTextPieces(src, attrs, push, warn, tag) {
	const pieces = TEXT_PIECES.map((name) => attrs.find((a) => a.name === name));
	if (!pieces.some(Boolean)) return;
	// An Icon draws an svg: a font weight on its box never showed. Its size is
	// a font size, which a text size would compete with.
	if (tag === "Icon") {
		for (const a of pieces) {
			if (!a) continue;
			if (a.name === "textWeight")
				push({ ...remove(src, a), hit: "textWeight removed (it has no effect on an icon)" });
			else
				warn(
					`${a.name}: removed in 3.0; on an Icon it set the font size its own size uses. Drop it, or set the Icon's size`,
				);
		}
		return;
	}
	if (attrs.some((a) => a.name === "textVariant")) {
		for (const a of pieces) {
			if (!a) continue;
			if (a.name === "textType") {
				warn(
					"textType beside textVariant: removed in 3.0; put the family in textVariant",
				);
				continue;
			}
			push({
				...remove(src, a),
				hit: `${a.name} removed (textVariant already set it)`,
			});
		}
		return;
	}
	const values = pieces.map((a) =>
		a && a.value !== null ? literal(a.value) : null,
	);
	if (values.every(Boolean)) {
		const [type, weight, size] = values;
		const [first, ...rest] = pieces.slice().sort((x, y) => x.at - y.at);
		push({
			at: first.at,
			end: first.end,
			text: `textVariant="${type}-${weight}-${size}"`,
			hit: "textType/textWeight/textSize → textVariant",
		});
		for (const a of rest)
			push({ ...remove(src, a), hit: `${a.name} folded into textVariant` });
		return;
	}
	warn(
		`${pieces
			.filter(Boolean)
			.map((a) => a.name)
			.join(
				", ",
			)}: removed in 3.0; write textVariant="family-weight-size" (e.g. "body-default-m")`,
	);
}

/**
 * G5: Text / Heading `size`. 2.x wrote it as a bare `font-${size}` class,
 * which sets a size only under a parent that sets the family. On Text that
 * class is exactly `className="font-…"` in 3.0; Heading always writes
 * `font-m` in 3.0, so its `size` is reported (drop it, or write a preset).
 * `weight` stays (alone it sets the weight, beside a preset it now swaps the
 * preset's), but 2.x ignored it beside `textVariant`, so there it is removed
 * to render as before.
 */
function rewriteTextSizeWeight(src, attrs, tag, push, warn, parent = null) {
	const size = attrs.find((a) => a.name === "size");
	const weight = attrs.find((a) => a.name === "weight");
	if (attrs.some((a) => a.name === "textVariant")) {
		for (const a of [size, weight])
			if (a)
				push({
					...remove(src, a),
					hit: `<${tag}> ${a.name} removed (2.x ignored it beside textVariant)`,
				});
		return;
	}
	if (!size) return;
	const s = literal(size.value);
	const family = attrs.find((a) => a.name === "family");
	const f =
		(family && literal(family.value)) ||
		(tag === "Heading" ? "heading" : "body");
	const w =
		(weight && literal(weight.value)) ||
		(tag === "Heading" ? "strong" : "default");
	if (tag === "Text" && s && /^(xs|s|m|l|xl)$/.test(s)) {
		const cls = attrs.find((a) => a.name === "className");
		const lit = cls?.value ? /^\{?\s*(["'])([^"']*)\1\s*\}?$/.exec(String(cls.value).trim()) : null;
		if (!cls) {
			push({ at: size.at, end: size.end, text: `className="font-${s}"`, hit: `size="${s}" → className="font-${s}"` });
			return;
		}
		if (lit) {
			push({ ...remove(src, size), hit: `size="${s}" → className="font-${s}"` });
			push({
				at: cls.at,
				end: cls.end,
				text: `className="${`${lit[2]} font-${s}`.trim()}"`,
				hit: `size="${s}" → className="font-${s}"`,
			});
			return;
		}
	}
	if (tag === "Heading" && s && /^(xs|s|m|l|xl)$/.test(s)) {
		// 3.0 Heading writes font-m. font-m is what 2.x wrote without a size;
		// font-s and font-xs come after it in the stylesheet, so beside it they
		// win exactly as they did alone. font-l and font-xl come before it and
		// lose: they are dropped only where they did nothing, under a parent
		// in this file that sets no font family.
		const why = { m: "3.0 Heading writes font-m itself" }[s] ?? (s === "l" || s === "xl" ? familyFree(parent) : null);
		if (why) {
			push({ ...remove(src, size), hit: `<Heading> size="${s}" removed (${why})` });
			return;
		}
		if (s === "s" || s === "xs") {
			const cls = attrs.find((a) => a.name === "className");
			const lit = cls?.value ? /^\{?\s*(["'])([^"']*)\1\s*\}?$/.exec(String(cls.value).trim()) : null;
			if (!cls) {
				push({ at: size.at, end: size.end, text: `className="font-${s}"`, hit: `<Heading> size="${s}" → className="font-${s}"` });
				return;
			}
			if (lit) {
				push({ ...remove(src, size), hit: `<Heading> size="${s}" → className="font-${s}"` });
				push({ at: cls.at, end: cls.end, text: `className="${`${lit[2]} font-${s}`.trim()}"`, hit: `<Heading> size="${s}" → className="font-${s}"` });
				return;
			}
		}
	}
	if (tag === "Heading") {
		warn(
			`<Heading> size: removed in 3.0. 2.x's font-${s ?? "…"} class set a size only when the Heading's direct parent had a font family class ` +
				`(a textVariant, or a font-heading, font-body… className); with none, drop it (it did nothing). ` +
				`Under one, write textVariant="<that family>-${w}-${s ?? "m"}"`,
		);
		return;
	}
	warn(
		`<${tag}> size: removed in 3.0; write className="font-${s ?? "…"}", the class 2.x wrote (it set a size only under a parent that set the family). ` +
			`textVariant="${f}-${w}-${s ?? "m"}" would also set the family, so the text would change size where no parent set one`,
	);
}

/** Layout primitives whose root carries no font class unless it is given one. */
const PLAIN_PARENTS = new Set(["Flex", "Row", "Column", "Grid"]);
const FONT_PROPS = new Set(["textVariant", "textType", "textSize", "textWeight", "variant", "className"]);

/** Why a Heading under `parent` had no font family around it in 2.x, or null when that cannot be seen. */
function familyFree(parent) {
	if (!parent || !PLAIN_PARENTS.has(parent.tag) || parent.spread) return null;
	if (parent.attrs.some((a) => FONT_PROPS.has(a.name))) return null;
	return `its parent ${parent.tag} sets no font family, so 2.x's font class did nothing there`;
}

/**
 * G4: `as="ul"` / `as="ol"` on a layout primitive resets the list in 3.0
 * (`:where(.reset-list) { list-style: none; margin: 0; padding: 0 }`). In 2.x
 * the browser's defaults applied: markers, `padding-inline-start: 40px`,
 * `margin-block: 1em`. What the element did not set itself is written back
 * exactly: `className="list-disc"` (or `list-decimal`), `paddingLeft="40px"`,
 * `marginY="1em"`, each only where no prop or inline style of its own
 * replaced it in 2.x. A className, a spread, a style that is not a literal
 * object, or a list inside another list is reported.
 */
const LIST_RESTORE_NOTE =
	'3.0 resets a list\'s markers, indent and margins (2.x showed the browser\'s); to keep them, add className="list-disc" paddingLeft="40px" marginY="1em" (list-decimal for an ol)';

function restoreList(src, attrs, tag, push, warn, spread, ancestors, children = () => []) {
	const as = attrs.find((a) => a.name === "as");
	const element = as && as.value !== null ? literal(as.value) : null;
	if (element !== "ul" && element !== "ol") return;
	const marker = element === "ul" ? "list-disc" : "list-decimal";
	const cls = attrs.find((a) => a.name === "className");
	const clsText = cls?.value ? /^\{?\s*(["'])([^"']*)\1\s*\}?$/.exec(String(cls.value).trim())?.[2] : null;
	// Written by this pass on an earlier run, or by hand: nothing to add.
	if (clsText !== null && clsText !== undefined && /\blist-(disc|decimal|none)\b/.test(clsText) && clsText.split(/\s+/).every((c) => /^list-(disc|decimal|none)$/.test(c))) return;
	const report = (why) => warn(`<${tag} as="${element}">: ${LIST_RESTORE_NOTE} (${why})`);
	if (spread) return report("a spread may set them");
	if (cls) return report("its className may set them");
	if (ancestors().some((a) => a === "li" || a === "ul" || a === "ol")) return report("a nested list's browser margins were 0");
	const style = attrs.find((a) => a.name === "style");
	let styleKeys = [];
	if (style) {
		const m = style.value ? /^\{\s*\{([\s\S]*)\}\s*\}$/.exec(String(style.value)) : null;
		if (!m || /\.\.\./.test(m[1])) return report("its style may set them");
		styleKeys = [...m[1].matchAll(/(?:^|,)\s*["']?([A-Za-z]+)["']?\s*:/g)].map((x) => x[1]);
	}
	const has = (...names) => attrs.some((a) => names.includes(a.name)) || styleKeys.some((k) => names.includes(k));
	const add = [];
	// Items that are flex or grid boxes (`<Row as="li">`) draw no marker: 2.x showed none.
	const items = children();
	const boxed = items.length > 0 && items.every((c) => c.box);
	if (!boxed && !styleKeys.some((k) => /^listStyle/.test(k))) add.push(`className="${marker}"`);
	if (!has("padding", "paddingX", "paddingLeft", "paddingInline", "paddingInlineStart")) add.push('paddingLeft="40px"');
	const top = has("margin", "marginY", "marginTop", "marginBlock", "marginBlockStart");
	const bottom = has("margin", "marginY", "marginBottom", "marginBlock", "marginBlockEnd");
	if (!top && !bottom) add.push('marginY="1em"');
	else if (!top) add.push('marginTop="1em"');
	else if (!bottom) add.push('marginBottom="1em"');
	if (!add.length) return;
	const last = attrs[attrs.length - 1];
	const gap = attributeGap(src, last.end);
	push({
		at: last.end,
		end: last.end,
		text: `${gap}${add.join(gap)}`,
		hit: `<${tag} as="${element}"> ${add.join(" ")} (the browser's list styles, which 3.0 resets)`,
	});
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

/** The G1/G4/G5 pass. `isCore(source)` decides which imports are Once UI. */
export function transformTypes(src, { isCore = isCoreSource } = {}) {
	const hits = [];
	const warnings = [];
	const bindings = importBindings(src);
	const edits = [];
	const imported = [...bindings.values()]
		.filter((b) => isCore(b.source) && /^[A-Z]/.test(b.canonical))
		.map((b) => b.canonical);
	const showIn = new Set([...SHOW_IN_COMPONENTS, ...imported].filter((t) => !NO_SHOW_IN.has(t)));
	const tags = new Set([
		...showIn,
		...LAYOUT,
		...LOST_AS,
		"Text",
		"Heading",
	]);
	// The element around each Heading, read once and only when a Heading has a size.
	let elements = null;
	const parentOf = (at) => {
		elements ??= elementsOf(src);
		const el = elements.find((e) => e.at === at);
		if (!el?.parent) return null;
		const parent = el.parent;
		const bound = bindings.get(parent.name);
		return {
			tag: bound && isCore(bound.source) ? bound.canonical : bound ? null : parent.name,
			attrs: attributesOf(src, parent.nameEnd, parent.openEnd - 1),
			spread: /\{\s*\.\.\./.test(src.slice(parent.nameEnd, parent.openEnd)),
		};
	};
	// The elements around a list, to tell a nested one (whose 2.x browser
	// margins were 0) from a top-level one.
	const ancestorsOf = (at) => {
		elements ??= elementsOf(src);
		const out = [];
		for (let el = elements.find((e) => e.at === at)?.parent; el; el = el.parent) {
			const as = attributesOf(src, el.nameEnd, el.openEnd - 1).find((a) => a.name === "as");
			out.push((as && as.value !== null ? literal(as.value) : null) ?? el.name);
		}
		return out;
	};
	// The element children of a list, each with whether it is a flex or grid box.
	const childrenOf = (at) => {
		elements ??= elementsOf(src);
		const el = elements.find((e) => e.at === at);
		if (!el) return [];
		return elements
			.filter((c) => c.parent === el)
			.map((c) => {
				const bound = bindings.get(c.name);
				const canonical = bound ? (isCore(bound.source) ? bound.canonical : null) : c.name;
				return { box: ["Flex", "Row", "Column", "Grid"].includes(canonical) };
			});
	};
	for (const tag of tags) {
		for (const name of namesFor(tag, bindings, isCore)) {
			const open = new RegExp(`<${name.replace(".", "\\.")}(?=[\\s/>])`, "g");
			let m;
			while ((m = open.exec(src))) {
				const from = m.index + name.length + 1;
				const end = openingTagEnd(src, from);
				if (end < 0) continue;
				const attrs = attributesOf(src, from, end);
				const push = (e) =>
					edits.push({
						...e,
						hit: e.hit.startsWith("<") ? e.hit : `<${tag}> ${e.hit}`,
					});
				const warn = (w) =>
					warnings.push(located(w.startsWith("<") ? w : `<${tag}> ${w}`, src, m.index));
				if (showIn.has(tag)) rewriteShowIn(src, attrs, push, warn);
				if (tag !== "Text" && tag !== "Heading" && showIn.has(tag))
					rewriteTextPieces(src, attrs, push, warn, tag);
				if (tag === "Text" || tag === "Heading")
					rewriteTextSizeWeight(src, attrs, tag, push, warn, tag === "Heading" ? parentOf(m.index) : null);
				if (LAYOUT.has(tag)) {
					restoreList(src, attrs, tag, push, warn, /\{\s*\.\.\./.test(src.slice(from, end)), () => ancestorsOf(m.index), () => childrenOf(m.index));
				}
				if (
					LOST_AS.has(tag) &&
					!TAKES_AS.has(tag) &&
					attrs.some((a) => a.name === "as" && a.value !== null)
				)
					warn(
						`as: <${tag}> no longer takes as (it was untyped in 2.x); wrap it, e.g. <Column as="li"><${tag} … /></Column>`,
					);
			}
		}
	}
	return { out: applyEdits(src, edits, hits), hits, warnings };
}
