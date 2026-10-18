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
		const { out } = run('<Row><Text hide>a</Text></Row>\n');
		assert.ok(out.endsWith("\n<Row><Column hide><Text>a</Text></Column></Row>\n"), out);
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
		assert.match(reported("<div>\n\t<Text hide>a</Text>\n</div>\n"), /<Text> hide: .*Column.*parent/);
	});

	it("a spread", () => {
		assert.match(reported("<Row>\n\t<Text {...p} hide>a</Text>\n</Row>\n"), /spread/);
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
