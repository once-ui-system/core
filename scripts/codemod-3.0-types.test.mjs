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

	it("writes Text size as the class 2.x wrote, keeps a lone weight, and reports Heading size", () => {
		const { out, warnings } = run(
			'<Heading size="l">a</Heading>\n<Text size="s" weight="strong">b</Text>\n<Text weight="strong">c</Text>\n<Text size="xs" className="price">d</Text>\n',
		);
		assert.equal(
			body(out),
			'<Heading size="l">a</Heading>\n<Text className="font-s" weight="strong">b</Text>\n<Text weight="strong">c</Text>\n<Text className="price font-xs">d</Text>\n',
		);
		// A Heading with no parent in the file: whether one sets a family is not known.
		assert.equal(warnings.length, 1);
		assert.match(warnings[0], /<Heading> size: .*direct parent.*drop it .*textVariant="<that family>-strong-l"/);
		assert.doesNotMatch(warnings.join("\n"), /body-strong-s/);
	});

	it("drops Heading size m, writes s and xs as their class, drops l and xl under a parent with no family", () => {
		const imports = 'import { Column, Heading, Row } from "@once-ui-system/core";\n';
		const { out, warnings } = run(
			'<Column gap="8">\n  <Heading as="h2" size="l">a</Heading>\n  <Heading size="m">b</Heading>\n  <Heading size="s" className="x">c</Heading>\n  <Heading size="xs">d</Heading>\n</Column>\n',
			imports,
		);
		assert.equal(
			body(out, imports),
			'<Column gap="8">\n  <Heading as="h2">a</Heading>\n  <Heading>b</Heading>\n  <Heading className="x font-s">c</Heading>\n  <Heading className="font-xs">d</Heading>\n</Column>\n',
		);
		assert.deepEqual(warnings, []);
	});

	it("reports Heading size l under a parent that may set a family", () => {
		const imports = 'import { Column, Heading } from "@once-ui-system/core";\nimport { Panel } from "./Panel";\n';
		for (const src of [
			'<Column textVariant="body-default-m"><Heading size="l">a</Heading></Column>\n',
			'<Column className="font-body"><Heading size="xl">a</Heading></Column>\n',
			'<Column {...rest}><Heading size="l">a</Heading></Column>\n',
			'<Panel><Heading size="l">a</Heading></Panel>\n',
		]) {
			const { out, warnings } = run(src, imports);
			assert.equal(body(out, imports), src);
			assert.ok(warnings.some((w) => /<Heading> size: /.test(w)), src);
		}
	});

	it("reports Text size beside a className it cannot extend, with the class, not a preset", () => {
		const { out, warnings } = run('<Text size="s" className={cls}>a</Text>\n');
		assert.equal(body(out), '<Text size="s" className={cls}>a</Text>\n');
		assert.match(warnings[0], /className="font-s"/);
		assert.match(warnings[0], /would change size/);
	});

	it("drops textWeight on an Icon, and reports its textSize without a textVariant", () => {
		const { out, warnings } = run('<Icon name="at" textWeight="default" size="xs" />\n<Icon name="x" textSize="s" />\n');
		assert.equal(body(out), '<Icon name="at" size="xs" />\n<Icon name="x" textSize="s" />\n');
		assert.equal(warnings.length, 1);
		assert.match(warnings[0], /<Icon> textSize: .*Drop it/);
		assert.doesNotMatch(warnings[0], /textVariant/);
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
