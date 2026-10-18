/**
 * Regression tests for the 2.x → 3.0 codemod: types, resets and aliases
 * (MIGRATING.md § "2.x → 3.0", 11).
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { transform } from "./codemod-3.0.mjs";
import { transformTypes } from "./codemod-3.0-types.mjs";

const IMPORT =
	'import { Card, Column, Flex, Grid, Heading, Logo, Row, Text } from "@once-ui-system/core";\n';
const run = (body, imports = IMPORT) => transform(imports + body);
const body = (out, imports = IMPORT) => out.slice(imports.length);

describe("G5: dark and light become showIn", () => {
	it("rewrites a bare or true boolean", () => {
		const { out } = run(
			'<Row dark>a</Row>\n<Column light={true}>b</Column>\n<Logo dark icon="/a.svg" />\n',
		);
		assert.equal(
			body(out),
			'<Row showIn="dark">a</Row>\n<Column showIn="light">b</Column>\n<Logo showIn="dark" icon="/a.svg" />\n',
		);
	});

	it("keeps a condition and drops false", () => {
		const { out } = run(
			"<Row dark={isDark}>a</Row>\n<Row light={false}>b</Row>\n",
		);
		assert.equal(
			body(out),
			'<Row showIn={isDark ? "dark" : undefined}>a</Row>\n<Row>b</Row>\n',
		);
	});

	it("reports both at once", () => {
		const { out, warnings } = run("<Row dark light>a</Row>\n");
		assert.equal(body(out), "<Row dark light>a</Row>\n");
		assert.ok(warnings.some((w) => /dark and light both set/.test(w)));
	});

	it("rewrites any Once UI component, but not ThemeSwitcher's own labels", () => {
		const imports = 'import { AvatarGroup, Spotlight, ThemeSwitcher } from "@once-ui-system/core";\n';
		const { out } = run(
			'<AvatarGroup dark avatars={a} />\n<Spotlight light />\n<ThemeSwitcher dark="Night" />\n',
			imports,
		);
		assert.equal(
			body(out, imports),
			'<AvatarGroup showIn="dark" avatars={a} />\n<Spotlight showIn="light" />\n<ThemeSwitcher dark="Night" />\n',
		);
	});

	it("leaves an app's own component alone", () => {
		const imports = 'import { Row } from "./my-row";\n';
		const { out, hits } = run("<Row dark>a</Row>\n", imports);
		assert.equal(body(out, imports), "<Row dark>a</Row>\n");
		assert.deepEqual(hits, []);
	});
});

describe("G5: textSize, textWeight and textType become textVariant", () => {
	it("folds three literals into one preset", () => {
		const { out } = run(
			'<Row textType="label" textWeight="strong" textSize="s">a</Row>\n',
		);
		assert.equal(body(out), '<Row textVariant="label-strong-s">a</Row>\n');
	});

	it("drops size and weight beside a textVariant, which overrode them", () => {
		const { out } = run(
			'<Flex textVariant="body-default-m" textSize="l" textWeight="strong">a</Flex>\n',
		);
		assert.equal(body(out), '<Flex textVariant="body-default-m">a</Flex>\n');
	});

	it("reports what it cannot fold", () => {
		const { out, warnings } = run('<Row textSize="l">a</Row>\n');
		assert.equal(body(out), '<Row textSize="l">a</Row>\n');
		assert.ok(warnings.some((w) => /textSize: removed in 3.0/.test(w)));
	});
});

describe("G5: Text and Heading size", () => {
	it("drops them beside a textVariant, where 2.x ignored them", () => {
		const { out } = run(
			'<Text textVariant="body-default-s" size="l" weight="strong">a</Text>\n',
		);
		assert.equal(body(out), '<Text textVariant="body-default-s">a</Text>\n');
	});

	it("reports size otherwise, with the preset to write, and keeps a lone weight", () => {
		const { out, warnings } = run(
			'<Heading size="l">a</Heading>\n<Text size="s" weight="strong">b</Text>\n<Text weight="strong">c</Text>\n',
		);
		assert.equal(
			body(out),
			'<Heading size="l">a</Heading>\n<Text size="s" weight="strong">b</Text>\n<Text weight="strong">c</Text>\n',
		);
		assert.ok(warnings.some((w) => /textVariant="heading-strong-l"/.test(w)));
		assert.ok(
			warnings.some((w) =>
				/textVariant="body-strong-s" in place of size and weight/.test(w),
			),
		);
		assert.equal(warnings.length, 2);
	});

	it("runs after the textVariant rename, so a 2.x variant counts", () => {
		const { out } = run('<Text variant="body-default-s" size="l">a</Text>\n');
		assert.equal(body(out), '<Text textVariant="body-default-s">a</Text>\n');
	});
});

describe("G1: as on a component that no longer takes it", () => {
	it("reports it on a composite and not on a layout primitive", () => {
		const { warnings } = run(
			'<Card as="li">a</Card>\n<Column as="ul">b</Column>\n',
		);
		assert.ok(
			warnings.some((w) => /<Card> as: <Card> no longer takes as/.test(w)),
		);
		assert.ok(!warnings.some((w) => /<Column> as/.test(w)));
	});
});

describe("G4: inline list resets", () => {
	it("removes a style that only reset the list", () => {
		const { out } = run(
			'<Column as="ul" gap="8" style={{ listStyle: "none", margin: 0, padding: 0 }}>a</Column>\n',
		);
		assert.equal(body(out), '<Column as="ul" gap="8">a</Column>\n');
	});

	it("keeps the rest of the style, and a zero that beat a spacing prop", () => {
		const { out } = run(
			'<Row as="ol" padding="16" style={{ listStyle: "none", padding: 0, color: "red" }}>a</Row>\n',
		);
		assert.equal(
			body(out),
			'<Row as="ol" padding="16" style={{ padding: 0, color: "red" }}>a</Row>\n',
		);
	});

	it("leaves a div's style alone", () => {
		const src = '<Column style={{ listStyle: "none" }}>a</Column>\n';
		assert.equal(body(run(src).out), src);
	});
});

describe("the types pass", () => {
	it("is idempotent", () => {
		const src =
			IMPORT +
			'<Row dark textType="label" textWeight="strong" textSize="s" as="ul" style={{ listStyle: "none" }}>a</Row>\n';
		const once = transformTypes(src).out;
		assert.equal(transformTypes(once).out, once);
	});
});
