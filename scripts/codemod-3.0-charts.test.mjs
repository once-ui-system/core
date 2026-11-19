/**
 * Regression tests for the 2.x → 3.0 codemod on charts: the date picker's
 * range handler is `date.onRangeChange` (MIGRATING.md § "2.x → 3.0", C8).
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { transform } from "./codemod-3.0.mjs";

const IMPORT = 'import { BarChart, LineChart, PieChart } from "@once-ui-system/core";\n';
const run = (body) => transform(IMPORT + body);
const body = (out) => out.slice(out.indexOf("\n") + 1);

describe("C8: chart date.onChange becomes date.onRangeChange", () => {
	it("renames the key in an inline date config on every chart", () => {
		const { out } = run(
			"<LineChart data={d} series={s} date={{ format: \"MMM\", onChange: setRange }} />\n" +
				"<BarChart data={d} series={s} date={{ selector: true, onChange: (r) => log(r) }} />\n",
		);
		assert.equal(
			body(out),
			"<LineChart data={d} series={s} date={{ format: \"MMM\", onRangeChange: setRange }} />\n" +
				"<BarChart data={d} series={s} date={{ selector: true, onRangeChange: (r) => log(r) }} />\n",
		);
	});

	it("reports a date config built elsewhere that names onChange", () => {
		const { out, warnings } = run("const cfg = { selector: true, onChange: setRange };\n<PieChart data={d} date={cfg} />\n");
		assert.match(body(out), /onChange: setRange/);
		assert.ok(warnings.some((w) => /date\.onRangeChange/.test(w)));
	});

	it("leaves a chart's other props and other components' onChange alone", () => {
		const src = '<LineChart data={d} series={s} date={{ format: "MMM" }} />\n';
		assert.equal(body(run(src).out), src);
	});

	it("is idempotent", () => {
		const once = run("<LineChart data={d} date={{ onChange: f }} />\n").out;
		assert.equal(transform(once).out, once);
	});
});
