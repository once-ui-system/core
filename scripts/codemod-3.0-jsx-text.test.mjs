/**
 * Regression tests: JSX inside a prop value, and apostrophes in JSX text, must
 * not stop the 3.0 codemod from reading an element (preview #272 scanner fix).
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { transform } from "./codemod-3.0.mjs";

const IMPORT = 'import { Input, Text } from "@once-ui-system/core";\n';
const warningsOf = (src) => transform(IMPORT + src, { file: "app/page.tsx" }).warnings.join("\n");

describe("JSX text inside a leaf's props", () => {
	it("reads an Input whose prefix is <Text>https://</Text>", () => {
		const warnings = warningsOf(
			'export const A = () => <Input id="url" label="Site" prefix={<Text variant="body-default-s">https://</Text>} />;\n',
		);
		assert.doesNotMatch(warnings, /could not be read in place/);
	});

	it("reads an Input whose prefix has an apostrophe in JSX text", () => {
		const warnings = warningsOf(
			"export const B = () => <Input id=\"n\" label=\"Name\" prefix={<Text>don't</Text>} />;\n",
		);
		assert.doesNotMatch(warnings, /could not be read in place/);
	});
});
