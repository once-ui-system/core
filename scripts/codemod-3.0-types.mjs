/**
 * Once UI 2.x → 3.0 codemod, G1 G4 G5: types, resets and aliases.
 *
 *   G5  `dark` / `light` → `showIn="dark"` / `showIn="light"` on the layout
 *       components and Logo.
 *   G5  `textSize`, `textWeight`, `textType` on the layout components →
 *       `textVariant` when all three are literals; dropped beside a
 *       `textVariant` (it overrode the size and weight); reported otherwise.
 *   G5  `size` on Text and Heading: dropped beside `textVariant` (2.x ignored
 *       it there, with a console warning); reported otherwise, with the
 *       `textVariant` to write. `weight` stays, and is dropped only beside a
 *       `textVariant`, where 2.x ignored it and 3.0 would apply it.
 *   G1  `as` on a component that no longer takes it (everything but the
 *       layout primitives, Text, Heading, VisuallyHidden, List and Form):
 *       reported, since 2.x's `as` there was untyped and the fix is a wrapper.
 *   G4  `<Column as="ul" style={{ listStyle: "none", margin: 0, padding: 0 }}>`:
 *       the declarations the list reset now makes are removed (margin and
 *       padding only when no spacing prop sits beside them, since inline
 *       zero beat the prop).
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
	return bindings.has(tag) ? [] : [tag];
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
function rewriteTextPieces(src, attrs, push, warn) {
	const pieces = TEXT_PIECES.map((name) => attrs.find((a) => a.name === name));
	if (!pieces.some(Boolean)) return;
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
 * G5: Text / Heading `size` → `textVariant`. `weight` stays (alone it sets
 * the weight, beside a preset it now swaps the preset's), but 2.x ignored it
 * beside `textVariant`, so there it is removed to render as before.
 */
function rewriteTextSizeWeight(src, attrs, tag, push, warn) {
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
	const family = attrs.find((a) => a.name === "family");
	const f =
		(family && literal(family.value)) ||
		(tag === "Heading" ? "heading" : "body");
	const w =
		(weight && literal(weight.value)) ||
		(tag === "Heading" ? "strong" : "default");
	const s = (size && literal(size.value)) || "m";
	warn(
		`<${tag}> size: removed in 3.0; write textVariant="${f}-${w}-${s}"${weight ? " in place of size and weight" : ""} ` +
			"(a preset sets all three; 2.x's size alone only took effect under a parent that set the family)",
	);
}

/** G4: inline list resets that `as="ul"` now makes. */
function rewriteListStyle(src, attrs, tag, push) {
	const as = attrs.find((a) => a.name === "as");
	const element = as && as.value !== null ? literal(as.value) : null;
	if (element !== "ul" && element !== "ol") return;
	const style = attrs.find((a) => a.name === "style");
	if (!style?.value) return;
	const raw = String(style.value);
	const m = /^\{\s*\{([\s\S]*)\}\s*\}$/.exec(raw);
	if (!m) return;
	const body = m[1];
	if (/[{(`]|\.\.\./.test(body)) return; // nested values or spreads: leave it
	const entries = body
		.split(",")
		.map((e) => e.trim())
		.filter(Boolean);
	const hasPadding = attrs.some((a) => /^padding/.test(a.name));
	const hasMargin = attrs.some((a) => /^margin/.test(a.name));
	const reset = (entry) => {
		const [k, v] = entry
			.split(":")
			.map((x) => x?.trim().replace(/^["']|["']$/g, ""));
		if (k === "listStyle" || k === "listStyleType") return v === "none";
		if (k === "margin" && !hasMargin) return v === "0" || v === "0px";
		if (k === "padding" && !hasPadding) return v === "0" || v === "0px";
		if (k === "paddingLeft" || k === "paddingInlineStart")
			return !hasPadding && (v === "0" || v === "0px");
		return false;
	};
	const kept = entries.filter((e) => !reset(e));
	if (kept.length === entries.length) return;
	if (!kept.length) {
		push({
			...remove(src, style),
			hit: `<${tag} as="${element}"> inline list reset removed (as="${element}" resets itself)`,
		});
		return;
	}
	const valueAt = src.indexOf(raw, style.at);
	push({
		at: valueAt,
		end: valueAt + raw.length,
		text: `{{ ${kept.join(", ")} }}`,
		hit: `<${tag} as="${element}"> inline list reset removed (as="${element}" resets itself)`,
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
					warnings.push(w.startsWith("<") ? w : `<${tag}> ${w}`);
				if (showIn.has(tag)) rewriteShowIn(src, attrs, push, warn);
				if (tag !== "Text" && tag !== "Heading" && showIn.has(tag))
					rewriteTextPieces(src, attrs, push, warn);
				if (tag === "Text" || tag === "Heading")
					rewriteTextSizeWeight(src, attrs, tag, push, warn);
				if (LAYOUT.has(tag)) rewriteListStyle(src, attrs, tag, push);
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
