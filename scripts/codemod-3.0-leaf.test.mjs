/**
 * Regression tests for the 2.x → 3.0 codemod's G2 pass: leaf components take
 * LeafProps (MIGRATING.md § "2.x → 3.0", 13).
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { transform } from "./codemod-3.0.mjs";
import { elementsOf, LEAF_PROPS, LEAVES, transformLeaf } from "./codemod-3.0-leaf.mjs";

const IMPORT = 'import { Button, Icon, Row, Text } from "@once-ui-system/core";\n';
const run = (body, imports = IMPORT) => transformLeaf(imports + body);
const body = (out, imports = IMPORT) => out.slice(imports.length);

describe("G2: the leaf set", () => {
	it("is the small shared prop set", () => {
		assert.deepEqual(
			[...LEAF_PROPS].sort(),
			[
				"bottom",
				"className",
				"fillWidth",
				"flex",
				"left",
				"margin",
				"marginBottom",
				"marginLeft",
				"marginRight",
				"marginTop",
				"marginX",
				"marginY",
				"position",
				"right",
				"style",
				"top",
			],
		);
		for (const tag of ["Button", "Text", "Heading", "Icon", "Input", "Switch", "Logo", "NavIcon"])
			assert.ok(tag in LEAVES, tag);
		for (const tag of ["Tag", "Media", "Line", "Skeleton", "Row", "Column"]) assert.ok(!(tag in LEAVES), tag);
	});
});

describe("G2: elementsOf", () => {
	it("knows each element's lexical parent, and skips generics", () => {
		const els = elementsOf("const a = useRef<Text>(null);\n<Row>\n\t<Text>a</Text>\n\t<>\n\t\t<Icon />\n\t</>\n</Row>\n");
		const text = els.find((e) => e.name === "Text");
		const icon = els.find((e) => e.name === "Icon");
		assert.equal(els.filter((e) => e.name === "Text").length, 1);
		assert.equal(text.parent?.name, "Row");
		assert.ok(icon);
	});
});

describe("G2: dropped props move to a wrapper where that renders the same", () => {
	it("moves hide and a hide breakpoint, with the margins, to a Row", () => {
		const { out, hits, warnings } = run(
			'<Row>\n\t<Button hide s={{ hide: false }} marginTop="8">\n\t\tGo\n\t</Button>\n</Row>\n',
		);
		assert.equal(
			body(out),
			'<Row>\n\t<Row hide s={{ hide: false }} marginTop="8">\n\t\t<Button>\n\t\t\tGo\n\t\t</Button>\n\t</Row>\n</Row>\n',
		);
		assert.equal(hits.length, 1);
		assert.deepEqual(warnings, []);
	});

	it("keeps fillWidth on both, so the wrapper sizes like the leaf did", () => {
		const { out } = run('<Row>\n\t<Button fillWidth s={{ hide: true }}>Go</Button>\n</Row>\n');
		assert.equal(
			body(out),
			"<Row>\n\t<Row fillWidth s={{ hide: true }}>\n\t\t<Button fillWidth>Go</Button>\n\t</Row>\n</Row>\n",
		);
	});

	it("moves Text padding to a Column and adds the import", () => {
		const { out } = run('<Row>\n\t<Text padding="8" onBackground="neutral-weak">a</Text>\n</Row>\n');
		assert.equal(
			out,
			'import { Button, Column, Icon, Row, Text } from "@once-ui-system/core";\n<Row>\n\t<Column padding="8">\n\t\t<Text onBackground="neutral-weak">a</Text>\n\t</Column>\n</Row>\n',
		);
	});

	it("moves an Icon's box to a fitted Row", () => {
		const { out } = run('<Row>\n\t<Icon name="x" padding="4" radius="full" background="brand-weak" />\n</Row>\n');
		assert.equal(
			body(out),
			'<Row>\n\t<Row fit padding="4" radius="full" background="brand-weak">\n\t\t<Icon name="x" />\n\t</Row>\n</Row>\n',
		);
	});

	it("keeps an element inline when it does not start its line", () => {
		const { out } = run('<Row><Button hide>a</Button></Row>\n');
		assert.ok(out.endsWith("\n<Row><Row hide><Button>a</Button></Row></Row>\n"), out);
	});

	// 2.x Text and Heading took `hide` out and ignored it, so a wrapper that
	// honours it would hide text that showed.
	it("drops hide on Text and Heading, where 2.x ignored it, and says so", () => {
		const { out, warnings } = run('<Row>\n\t<Text hide s={{ hide: true }}>a</Text>\n\t<Heading hide>b</Heading>\n</Row>\n');
		assert.equal(body(out), "<Row>\n\t<Text>a</Text>\n\t<Heading>b</Heading>\n</Row>\n");
		assert.equal(warnings.length, 2);
		assert.match(warnings[0], /no effect on Text in 2\.x/);
	});

	it("renames Button radius=\"none\" to corners", () => {
		const { out } = run('<Row>\n\t<Button radius="none">a</Button>\n</Row>\n');
		assert.equal(body(out), '<Row>\n\t<Button corners="none">a</Button>\n</Row>\n');
	});

	it("leaves the kept props alone and is idempotent", () => {
		const src = '<Row>\n\t<Text marginTop="8" fillWidth>a</Text>\n\t<Button hide>b</Button>\n</Row>\n';
		const once = run(src).out;
		const twice = transformLeaf(once);
		assert.equal(twice.out, once);
		assert.equal(twice.hits.length, 0);
		assert.ok(body(once).includes('<Text marginTop="8" fillWidth>a</Text>'));
	});

	it("only touches Once UI's components", () => {
		const src = 'import { Text } from "./mine";\nimport { Row } from "@once-ui-system/core";\n<Row>\n\t<Text hide>a</Text>\n</Row>\n';
		assert.equal(transformLeaf(src).out, src);
	});
});

describe("G2: what it cannot do exactly is reported", () => {
	const reported = (src) => {
		const r = run(src);
		assert.equal(r.out, IMPORT + src, "unchanged");
		assert.equal(r.warnings.length, 1);
		return r.warnings[0];
	};

	it("padding on a Button (the wrapper would not render the same)", () => {
		assert.match(reported('<Row>\n\t<Button padding="8">a</Button>\n</Row>\n'), /<Button> padding: .*Row/);
	});

	it("a parent that is not a layout component in this file", () => {
		assert.match(reported("<div>\n\t<Button hide>a</Button>\n</div>\n"), /<Button> hide: .*Row.*parent/);
	});

	it("a spread", () => {
		assert.match(reported("<Row>\n\t<Button {...p} hide>a</Button>\n</Row>\n"), /spread/);
	});

	it("an offset or flex beside a moved prop on a non-text leaf", () => {
		assert.match(reported('<Row>\n\t<Button hide position="absolute" top="0">a</Button>\n</Row>\n'), /<Button> hide/);
	});

	it("a size, which no wrapper reproduces", () => {
		assert.match(reported("<Row>\n\t<Text maxWidth={20}>a</Text>\n</Row>\n"), /<Text> maxWidth/);
	});
});

describe("G2: wired into the full codemod", () => {
	it("runs as part of transform()", () => {
		const { out, hits } = transform(`${IMPORT}<Row>\n\t<Button hide>Go</Button>\n</Row>\n`);
		assert.ok(out.includes("<Row hide>"), out);
		assert.ok(hits.some((h) => h.includes("→ <Row> around it")));
	});
});

describe("G2: the trial-migration cases", () => {
	const IMP =
		'import { Avatar, Card, Column, Icon, InlineCode, Kbd, ListItem, Row, Spinner, StatusIndicator, Text } from "@once-ui-system/core";\n';
	const out = (src) => {
		const r = transform(IMP + src);
		assert.equal(transform(r.out).out, r.out, "a second run changes nothing");
		return { body: r.out.slice(IMP.length), warnings: r.warnings };
	};

	it("moves solid into the Icon box, and counts a Card as a layout parent", () => {
		assert.equal(
			out('<Row><Icon name="x" solid="brand-medium" padding="4" /></Row>\n').body,
			'<Row><Row fit solid="brand-medium" padding="4"><Icon name="x" /></Row></Row>\n',
		);
		assert.equal(
			out('<Card><Icon name="x" padding="4" /></Card>\n').body,
			'<Card><Row fit padding="4"><Icon name="x" /></Row></Card>\n',
		);
	});

	it("boxes an Icon in running text with an inline span, as 2.x's root was", () => {
		assert.equal(
			out('<p><Icon name="x" padding="4" /></p>\n').body,
			'<p><Row as="span" inline fit padding="4"><Icon name="x" /></Row></p>\n',
		);
	});

	it("wraps a Spinner in the centred Row its 2.x root was, wherever it is", () => {
		assert.equal(
			out('<Row><Spinner size="s" padding="8" fillWidth marginTop="4" /></Row>\n').body,
			'<Row><Row center padding="8" fillWidth marginTop="4"><Spinner size="s" /></Row></Row>\n',
		);
		assert.equal(out('<p><Spinner padding="8" /></p>\n').body, '<p><Row center padding="8"><Spinner /></Row></p>\n');
		const w = out('<Row><Spinner padding="8" {...rest} /></Row>\n').warnings.join("\n");
		assert.doesNotMatch(w, /would not render the same/);
	});

	it("gives Text in running text its padding as an inline style of the token", () => {
		assert.equal(
			out('<p>Hi <Text paddingX="4" paddingLeft="8">x</Text></p>\n').body,
			'<p>Hi <Text style={{ paddingRight: "var(--static-space-4)", paddingLeft: "var(--static-space-8)" }}>x</Text></p>\n',
		);
		assert.equal(
			out('<p><Text padding="4" style={{ color: "red" }}>x</Text></p>\n').body,
			'<p><Text style={{ padding: "var(--static-space-4)", color: "red" }}>x</Text></p>\n',
		);
		assert.equal(
			out('<p><Text padding="4" className="a">x</Text></p>\n').body,
			'<p><Text style={{ padding: "var(--static-space-4)" }} className="a">x</Text></p>\n',
		);
	});

	it("covers ListItem and the text effects", () => {
		assert.equal(
			out('<Column><ListItem padding="8">x</ListItem></Column>\n').body,
			'<Column><ListItem style={{ padding: "var(--static-space-8)" }}>x</ListItem></Column>\n',
		);
	});

	it("turns zIndex, opacity and textVariant literals into classes, and drops Kbd fit", () => {
		assert.equal(
			out('<Row><Avatar zIndex={2} opacity={50} src="a" /></Row>\n').body,
			'<Row><Avatar className="z-index-2 opacity-50" src="a" /></Row>\n',
		);
		assert.equal(
			out('<Row><StatusIndicator opacity={50} className="dot" /></Row>\n').body,
			'<Row><StatusIndicator className="dot opacity-50" /></Row>\n',
		);
		assert.equal(
			out('<Row><InlineCode textVariant="code-default-s">x</InlineCode></Row>\n').body,
			'<Row><InlineCode className="font-code font-default font-s">x</InlineCode></Row>\n',
		);
		assert.equal(out("<Row><Kbd fit>K</Kbd></Row>\n").body, "<Row><Kbd>K</Kbd></Row>\n");
	});

	it("writes Avatar border, borderWidth, borderStyle and radius as the classes and style they were", () => {
		assert.equal(
			out('<Row><Avatar src="a" border="brand-alpha-medium" borderWidth={2} borderStyle="dashed" radius="m" /></Row>\n').body,
			'<Row><Avatar src="a" style={{ borderColor: "var(--brand-alpha-medium)", borderRadius: "var(--radius-m)" }} className="border-2 border-dashed" /></Row>\n',
		);
		assert.equal(
			out('<Row><Avatar src="a" border="surface" radius="none" style={{ top: 1 }} /></Row>\n').body,
			'<Row><Avatar src="a" style={{ borderColor: "var(--surface-border)", borderRadius: "0", top: 1 }} /></Row>\n',
		);
		assert.equal(
			out('<Row><Avatar src="a" border="transparent" borderStyle="solid" /></Row>\n').body,
			'<Row><Avatar src="a" style={{ borderColor: "var(--static-transparent)" }} /></Row>\n',
		);
	});

	it("reports an Avatar borderWidth with no class of its own", () => {
		const { body, warnings } = out('<Row><Avatar src="a" borderWidth={3} /></Row>\n');
		assert.equal(body, '<Row><Avatar src="a" borderWidth={3} /></Row>\n');
		assert.match(warnings.join("\n"), /<Avatar> borderWidth: not taken by a leaf/);
	});
});
