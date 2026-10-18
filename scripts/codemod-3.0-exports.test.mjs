/**
 * Regression tests for the 2.x → 3.0 codemod: exports that became internal
 * and exports that were renamed (MIGRATING.md § "2.x → 3.0", 7).
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { transform } from "./codemod-3.0.mjs";

const run = (src) => transform(src);

describe("exports that became internal", () => {
	const internal = [
		"ServerFlex",
		"ClientFlex",
		"ServerGrid",
		"ClientGrid",
		"Cursor",
		"ElementType",
		"InteractiveDetails",
		"Toaster",
		"Arrow",
		"ArrowNavigation",
		"useArrowNavigationContext",
		"withArrowNavigation",
		"dev",
		"getLastOpenedDropdown",
		"setLastOpenedDropdown",
		"clearLastOpenedDropdown",
		"MissingDependency",
		"escapeHtml",
		"safeScriptJson",
		"sanitizeHref",
	];

	it("reports each one, with what to use instead, and leaves the code alone", () => {
		for (const name of internal) {
			const src = `import { Row, ${name} } from "@once-ui-system/core";\n<${name} />;\n`;
			const { out, warnings } = run(src);
			assert.equal(out, src, name);
			const note = warnings.find((w) => w.startsWith(`${name}:`));
			assert.ok(note, `${name} is reported`);
			assert.match(note, /internal in 3\.0/, name);
		}
	});

	it("points ArrowNavigation at the hook and the Flex halves at Flex", () => {
		const { warnings } = run(
			'import { ArrowNavigation, ServerFlex, ClientGrid } from "@once-ui-system/core";\n',
		);
		assert.match(warnings.join("\n"), /ArrowNavigation: .*useArrowNavigation/);
		assert.match(warnings.join("\n"), /ServerFlex: .*use Flex/);
		assert.match(warnings.join("\n"), /ClientGrid: .*use Grid/);
	});

	it("reports a re-export of an internal name too", () => {
		const { warnings } = run('export { Arrow } from "@once-ui-system/core";\n');
		assert.ok(warnings.some((w) => w.startsWith("Arrow:")));
	});

	it("ignores the same names from another package", () => {
		const { warnings } = run('import { Arrow, dev } from "./local";\n');
		assert.deepEqual(warnings, []);
	});
});

describe("DialogProvider", () => {
	it("drops the import and turns the wrapper into a fragment", () => {
		const src = [
			'import { Dialog, DialogProvider } from "@once-ui-system/core";',
			"export const App = () => (",
			"  <DialogProvider>",
			"    <Dialog open={a} onClose={c} title='A' base />",
			"    <Dialog open={b} onClose={c} title='B' stack />",
			"  </DialogProvider>",
			");",
			"",
		].join("\n");
		const { out, hits } = run(src);
		assert.equal(
			out,
			[
				'import { Dialog } from "@once-ui-system/core";',
				"export const App = () => (",
				"  <>",
				"    <Dialog open={a} onClose={c} title='A' base />",
				"    <Dialog open={b} onClose={c} title='B' stack />",
				"  </>",
				");",
				"",
			].join("\n"),
		);
		assert.ok(hits.includes("<DialogProvider> unwrapped"));
	});

	it("removes an import that held only DialogProvider", () => {
		const src =
			'import { DialogProvider } from "@once-ui-system/core";\nconst x = <DialogProvider>{children}</DialogProvider>;\n';
		assert.equal(run(src).out, "const x = <>{children}</>;\n");
	});

	it("flags a use the codemod cannot unwrap", () => {
		const src =
			'import { DialogProvider } from "@once-ui-system/core";\nconst P = DialogProvider;\n';
		const { warnings } = run(src);
		assert.ok(
			warnings.some(
				(w) => w.startsWith("DialogProvider:") && /by hand/.test(w),
			),
		);
	});

	it("is idempotent", () => {
		const src =
			'import { Dialog, DialogProvider } from "@once-ui-system/core";\n<DialogProvider><Dialog /></DialogProvider>;\n';
		const once = run(src).out;
		assert.equal(run(once).out, once);
	});
});

describe("generateMetadata → createMetadata", () => {
	it("renames the import and every call", () => {
		const src = [
			'import { generateMetadata, Meta } from "@once-ui-system/core";',
			"export const metadata = generateMetadata({ title: 'Home' });",
			"const again = generateMetadata;",
			"",
		].join("\n");
		const { out, hits } = run(src);
		assert.equal(
			out,
			[
				'import { createMetadata, Meta } from "@once-ui-system/core";',
				"export const metadata = createMetadata({ title: 'Home' });",
				"const again = createMetadata;",
				"",
			].join("\n"),
		);
		assert.ok(hits.includes("generateMetadata → createMetadata"));
	});

	it("keeps a local alias and leaves the route's own generateMetadata alone", () => {
		const src = [
			'import { generateMetadata as build } from "@once-ui-system/core";',
			"export async function generateMetadata() {",
			"  return build({ title: 'Post' });",
			"}",
			"",
		].join("\n");
		assert.equal(
			run(src).out,
			[
				'import { createMetadata as build } from "@once-ui-system/core";',
				"export async function generateMetadata() {",
				"  return build({ title: 'Post' });",
				"}",
				"",
			].join("\n"),
		);
	});

	it("does not touch a property or a longer name", () => {
		const src =
			'import { generateMetadata } from "@once-ui-system/core";\nx.generateMetadata(); generateMetadataFor(); generateMetadata();\n';
		assert.equal(
			run(src).out,
			'import { createMetadata } from "@once-ui-system/core";\nx.generateMetadata(); generateMetadataFor(); createMetadata();\n',
		);
	});

	it("keeps a re-export's public name and warns about Next's convention", () => {
		const { out, warnings } = run(
			'export { generateMetadata } from "@once-ui-system/core";\n',
		);
		assert.equal(
			out,
			'export { createMetadata as generateMetadata } from "@once-ui-system/core";\n',
		);
		assert.ok(warnings.some((w) => /route-segment/.test(w)));
	});

	it("is idempotent", () => {
		const src =
			'import { generateMetadata } from "@once-ui-system/core";\ngenerateMetadata({});\n';
		const once = run(src).out;
		assert.equal(run(once).out, once);
	});
});

describe("Particle → ParticleFx still renames components", () => {
	it("renames the import and the tags", () => {
		const { out } = run(
			'import { Particle } from "@once-ui-system/core";\n<Particle density={1} />;\n',
		);
		assert.equal(
			out,
			'import { ParticleFx } from "@once-ui-system/core";\n<ParticleFx density={1} />;\n',
		);
	});
});
