/**
 * Regression tests for the 2.x → 3.0 codemod: plain part names
 * (MIGRATING.md § "2.x → 3.0"; break F11).
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PART_EXPORTS, transformPartNames } from "./codemod-3.0-part-names.mjs";
import { transform } from "./codemod-3.0.mjs";

const run = (src, opts) => transformPartNames(src, opts);
const idempotent = (src, opts) => {
	const once = run(src, opts).out;
	assert.equal(run(once, opts).out, once);
	return once;
};

describe("F11: Sortable's parts", () => {
	it("rewrites the JSX tags and joins the parts to the core import", () => {
		const src =
			'import { Sortable, Text } from "@once-ui-system/core";\n' +
			"<Sortable items={ids} handle>\n" +
			"  <Sortable.Item id={id}>\n" +
			"    <Sortable.Handle />\n" +
			"  </Sortable.Item>\n" +
			"</Sortable>\n";
		const { out, hits } = run(src);
		assert.equal(
			out,
			'import { Sortable, SortableHandle, SortableItem, Text } from "@once-ui-system/core";\n' +
				"<Sortable items={ids} handle>\n" +
				"  <SortableItem id={id}>\n" +
				"    <SortableHandle />\n" +
				"  </SortableItem>\n" +
				"</Sortable>\n",
		);
		assert.equal(hits.length, 3);
		assert.equal(run(out).out, out);
	});

	it("rewrites a type reference and drops the compound when nothing else uses it", () => {
		const src = 'import { Sortable } from "@once-ui-system/core";\ntype P = React.ComponentProps<typeof Sortable.Item>;\n';
		assert.equal(
			idempotent(src),
			'import { SortableItem } from "@once-ui-system/core";\ntype P = React.ComponentProps<typeof SortableItem>;\n',
		);
	});

	it("follows an alias, adding the plain names", () => {
		const src = 'import { Sortable as List } from "@once-ui-system/core";\n<List items={a}><List.Item id="x" /></List>\n';
		assert.equal(
			idempotent(src),
			'import { Sortable as List, SortableItem } from "@once-ui-system/core";\n<List items={a}><SortableItem id="x" /></List>\n',
		);
	});

	it("uses a part the file already imports, under its alias", () => {
		const src =
			'import { Sortable, SortableItem as Row } from "@once-ui-system/core";\n<Sortable items={a}><Sortable.Item id="x" /></Sortable>\n';
		assert.equal(
			idempotent(src),
			'import { Sortable, SortableItem as Row } from "@once-ui-system/core";\n<Sortable items={a}><Row id="x" /></Sortable>\n',
		);
	});

	it("keeps a multi-line import's layout", () => {
		const src =
			'import {\n  Column,\n  Sortable,\n} from "@once-ui-system/core";\n<Sortable items={a}><Sortable.Item id="x" /></Sortable>\n';
		assert.equal(
			idempotent(src),
			'import {\n  Column,\n  Sortable,\n  SortableItem,\n} from "@once-ui-system/core";\n<Sortable items={a}><SortableItem id="x" /></Sortable>\n',
		);
	});

	it("rewrites a namespace's member", () => {
		const src = 'import * as Once from "@once-ui-system/core";\n<Once.Sortable items={a}><Once.Sortable.Item id="x" /></Once.Sortable>\n';
		assert.equal(
			idempotent(src),
			'import * as Once from "@once-ui-system/core";\n<Once.Sortable items={a}><Once.SortableItem id="x" /></Once.Sortable>\n',
		);
	});

	it("leaves another library's Sortable alone", () => {
		const src = 'import { Sortable } from "./dnd";\n<Sortable.Item id="x" />\n';
		assert.equal(run(src).out, src);
	});

	it("reports a part name the file binds to something else", () => {
		const src =
			'import { Sortable } from "@once-ui-system/core";\nconst SortableItem = () => null;\n<Sortable.Item id="x" />\n';
		const { out, warnings } = run(src);
		assert.equal(out, src);
		assert.equal(warnings.length, 1);
		assert.match(warnings[0], /SortableItem is already a name/);
	});

	it("leaves strings and comments' quoted text alone in code", () => {
		const src = 'import { Sortable } from "@once-ui-system/core";\nconst name = "Sortable.Item";\n<Sortable items={a} />\n';
		assert.equal(run(src).out, src);
	});

	it("rewrites MDX by name, prose included", () => {
		const src = "Wrap each row in a `Sortable.Item`.\n\n<Sortable items={a}>\n  <Sortable.Item id=\"x\" />\n</Sortable>\n";
		assert.equal(
			idempotent(src, { file: "a.mdx" }),
			"Wrap each row in a `SortableItem`.\n\n<Sortable items={a}>\n  <SortableItem id=\"x\" />\n</Sortable>\n",
		);
	});
});

describe("F11: StylePanel's sections", () => {
	it("has a plain name for every section", () => {
		for (const name of ["StylePanelRoot", "StylePanelGroup", "StylePanelBrand", "StylePanelPage", "StylePanelAdvanced"])
			assert.ok(PART_EXPORTS.includes(name), name);
	});

	it("rewrites the sections and joins them to the blocks import", () => {
		const src =
			'import { StylePanel } from "@once-ui-system/blocks";\n' +
			"<StylePanel.Root>\n" +
			'  <StylePanel.Group title="Brand">\n' +
			"    <StylePanel.Brand />\n" +
			"    <StylePanel.Accent />\n" +
			"  </StylePanel.Group>\n" +
			"</StylePanel.Root>\n";
		assert.equal(
			idempotent(src),
			'import { StylePanelAccent, StylePanelBrand, StylePanelGroup, StylePanelRoot } from "@once-ui-system/blocks";\n' +
				"<StylePanelRoot>\n" +
				'  <StylePanelGroup title="Brand">\n' +
				"    <StylePanelBrand />\n" +
				"    <StylePanelAccent />\n" +
				"  </StylePanelGroup>\n" +
				"</StylePanelRoot>\n",
		);
	});

	it("keeps StylePanel when the preset is still rendered", () => {
		const src = 'import { StylePanel } from "@once-ui-system/blocks";\n<StylePanel />\n<StylePanel.Brand label="Primary" />\n';
		assert.equal(
			idempotent(src),
			'import { StylePanel, StylePanelBrand } from "@once-ui-system/blocks";\n<StylePanel />\n<StylePanelBrand label="Primary" />\n',
		);
	});

	it("leaves StylePanel's other members alone", () => {
		const src = 'import { StylePanel } from "@once-ui-system/blocks";\nStylePanel.displayName;\n';
		assert.equal(run(src).out, src);
	});
});

describe("F11 in the full codemod", () => {
	it("moves 2.x core sections to blocks, renaming onChange on the way", () => {
		const src =
			'import { StylePanel, Sortable } from "@once-ui-system/core";\n' +
			"<StylePanel.Root value={v} onChange={save}><StylePanel.Theme /></StylePanel.Root>\n" +
			'<Sortable items={a}><Sortable.Item id="x" /></Sortable>\n';
		const { out } = transform(src);
		assert.match(out, /import \{ Sortable, SortableItem \} from "@once-ui-system\/core";/);
		assert.match(out, /import \{ StylePanelRoot, StylePanelTheme \} from "@once-ui-system\/blocks";/);
		assert.match(out, /<StylePanelRoot value=\{v\} onValueChange=\{save\}><StylePanelTheme \/><\/StylePanelRoot>/);
		assert.match(out, /<SortableItem id="x" \/>/);
		assert.equal(transform(out).out, out);
	});
});
