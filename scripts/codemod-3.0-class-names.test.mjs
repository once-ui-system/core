/**
 * Regression tests for the 2.x → 3.0 codemod: utility class names Tailwind
 * CSS shares (MIGRATING.md § "2.x → 3.0"; break G6).
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renameClasses, transformClassNames } from "./codemod-3.0-class-names.mjs";
import { transform } from "./codemod-3.0.mjs";

const run = (src, opts) => transformClassNames(src, opts);

describe("G6: spacing, offset and grid-column classes", () => {
	it("spells out every spacing family, at the base and at a breakpoint", () => {
		assert.equal(
			renameClasses("p-16 px-4 pt-0 mb-48 mx-auto s-p-8 m-mt-l xl-ml-auto").out,
			"padding-16 padding-x-4 padding-top-0 margin-bottom-48 margin-x-auto s-padding-8 m-margin-top-l xl-margin-left-auto",
		);
	});

	it("renames offsets and grid columns", () => {
		assert.equal(
			renameClasses("top-0 s-left-16 columns-3 m-columns-1 columns-auto-fit").out,
			"offset-top-0 s-offset-left-16 grid-columns-3 m-grid-columns-1 grid-columns-auto-fit",
		);
	});

	it("leaves classes that only look alike", () => {
		const same = "radius-m-4 g-16 hover:p-4 p-auto top-3 columns-13 padding-16 my-class";
		assert.equal(renameClasses(same).out, same);
	});

	it("rewrites className strings, clsx calls and template text, not other strings", () => {
		const src =
			'<div className="p-16 fill-width" title="p-16" />\n' +
			'<div className={clsx("mt-8", open && "s-columns-2", `px-4 ${x ? "pb-0" : ""}`)} />\n' +
			'const label = "mt-8";\n';
		const { out, hits } = run(src);
		assert.equal(
			out,
			'<div className="padding-16 fill-width" title="p-16" />\n' +
				'<div className={clsx("margin-top-8", open && "s-grid-columns-2", `padding-x-4 ${x ? "padding-bottom-0" : ""}`)} />\n' +
				'const label = "mt-8";\n',
		);
		assert.equal(hits.length, 5);
		assert.equal(run(out).out, out);
	});

	it("only reports in a Tailwind project, where the short names are Tailwind's", () => {
		const src = '<div className="p-4 mt-8" />\n';
		const { out, hits, warnings } = run(src, { tailwind: true });
		assert.equal(out, src);
		assert.equal(hits.length, 0);
		assert.match(warnings[0], /p-4, mt-8: Tailwind's class in this project\. If it was Once UI's, it is padding-4, margin-top-8 in 3\.0/);
	});

	it("runs as part of the full codemod", () => {
		const src = 'import { Column } from "@once-ui-system/core";\n<Column className="mt-16" />\n';
		assert.match(transform(src).out, /className="margin-top-16"/);
	});
});
