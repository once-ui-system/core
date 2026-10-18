/**
 * Regression tests for the 2.x → 3.0 codemod: import sources
 * (MIGRATING.md § "2.x → 3.0", 12; breaks B2, F8, F9 and F10).
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MOVED_IMPORTS, packagesAdded, transformImports } from "./codemod-3.0-imports.mjs";
import { transform } from "./codemod-3.0.mjs";

const run = (src) => transformImports(src);
const idempotent = (src) => {
	const once = run(src).out;
	assert.equal(run(once).out, once);
	return once;
};

describe("B2: the subset subpaths move to the root", () => {
	for (const sub of ["components", "contexts", "hooks", "icons", "types", "interfaces", "utils", "modules"]) {
		it(`@once-ui-system/core/${sub}`, () => {
			const src = `import { Thing } from "@once-ui-system/core/${sub}";\n`;
			const { out, hits } = run(src);
			assert.equal(out, 'import { Thing } from "@once-ui-system/core";\n');
			assert.equal(hits.length, 1);
		});
	}

	it("keeps type-only imports, inline `type`, aliases and the quote style", () => {
		const src =
			"import type { SpacingToken } from '@once-ui-system/core/types';\n" +
			"import { useTheme as theme, type ThemeProviderProps } from '@once-ui-system/core/contexts'\n";
		assert.equal(
			idempotent(src),
			"import type { SpacingToken } from '@once-ui-system/core';\n" +
				"import { useTheme as theme, type ThemeProviderProps } from '@once-ui-system/core'\n",
		);
	});

	it("moves a deep components/<Name> import to the root", () => {
		const src = 'import { Button, type ButtonProps } from "@once-ui-system/core/components/Button";\n';
		assert.equal(idempotent(src), 'import { Button, type ButtonProps } from "@once-ui-system/core";\n');
	});

	it("accepts the file extension on a deep import", () => {
		const src = 'import { Row } from "@once-ui-system/core/components/Row.js";\n';
		assert.equal(run(src).out, 'import { Row } from "@once-ui-system/core";\n');
	});

	it("moves a namespace import and an export-from", () => {
		const src =
			'import * as Once from "@once-ui-system/core/components";\n' +
			'export { Button } from "@once-ui-system/core/components";\n';
		assert.equal(
			idempotent(src),
			'import * as Once from "@once-ui-system/core";\nexport { Button } from "@once-ui-system/core";\n',
		);
	});

	it("moves a dynamic import", () => {
		const src = 'const m = await import("@once-ui-system/core/hooks");\n';
		assert.equal(run(src).out, 'const m = await import("@once-ui-system/core");\n');
	});

	it("reports an internal module ./components/* exposed, and leaves it", () => {
		const src = 'import { FormContext } from "@once-ui-system/core/components/FormContext";\n';
		const { out, warnings } = run(src);
		assert.equal(out, src);
		assert.match(warnings.join("\n"), /FormContext: an internal module/);
	});

	it("reports a deep import below another removed subpath", () => {
		const src = 'import { x } from "@once-ui-system/core/utils/colorScheme";\n';
		const { out, warnings } = run(src);
		assert.equal(out, src);
		assert.match(warnings.join("\n"), /no deep imports/);
	});

	it("reports a default import, which never resolved", () => {
		const src = 'import Button from "@once-ui-system/core/components/Button";\n';
		const { out, warnings } = run(src);
		assert.equal(out, src);
		assert.match(warnings.join("\n"), /named exports only/);
	});

	it("reports any other specifier 3.0 does not have (a mock, a dist path)", () => {
		const src = 'vi.mock("@once-ui-system/core/components/Button");\nconst p = "@once-ui-system/core/dist/index.js";\n';
		const { warnings } = run(src);
		assert.equal(warnings.length, 2);
		assert.ok(warnings.every((w) => /not an entry point in 3.0/.test(w)));
	});

	it("leaves the 3.0 entry points and other packages alone", () => {
		const src = [
			'import { Button } from "@once-ui-system/core";',
			'import { LayoutProvider } from "@once-ui-system/core/next";',
			'import { LineChart } from "@once-ui-system/core/data";',
			'import { CodeBlock } from "@once-ui-system/core/code";',
			'import { mdxComponents } from "@once-ui-system/core/mdx";',
			'import { defineConfig } from "@once-ui-system/core/config";',
			'import "@once-ui-system/core/css/styles.css";',
			'import { Thing } from "@once-ui-system/core-extra/components";',
			'import { Button as B } from "./components";',
			"",
		].join("\n");
		const { out, hits, warnings } = run(src);
		assert.equal(out, src);
		assert.deepEqual(hits, []);
		assert.deepEqual(warnings, []);
	});
});

describe("F9: EmojiPicker and the media components leave the root", () => {
	it("splits a root import, keeping the rest on the root", () => {
		const src =
			'import { Button, EmojiPicker, Scrubber, type ScrubberProps, CompareImage } from "@once-ui-system/core";\n';
		assert.equal(
			idempotent(src),
			'import { Button } from "@once-ui-system/core";\n' +
				'import { EmojiPicker } from "@once-ui-system/core/emoji";\n' +
				'import { Scrubber, type ScrubberProps, CompareImage } from "@once-ui-system/core/media";\n',
		);
	});

	it("replaces an import of moved names only", () => {
		const src = 'import { EmojiPicker as Picker } from "@once-ui-system/core";\nconst x = 1;\n';
		assert.equal(idempotent(src), 'import { EmojiPicker as Picker } from "@once-ui-system/core/emoji";\nconst x = 1;\n');
	});

	it("joins an existing import of the subpath", () => {
		const src =
			'import { Row, Scrubber } from "@once-ui-system/core";\n' +
			'import { MediaUpload } from "@once-ui-system/core/media";\n';
		assert.equal(
			idempotent(src),
			'import { Row } from "@once-ui-system/core";\n' +
				'import { MediaUpload, Scrubber } from "@once-ui-system/core/media";\n',
		);
	});

	it("gathers names from several statements into one import", () => {
		const src =
			'import { Row, CompareImage } from "@once-ui-system/core";\n' +
			'import { Scrubber } from "@once-ui-system/core/components";\n' +
			"const a = 1;\n";
		assert.equal(
			idempotent(src),
			'import { Row } from "@once-ui-system/core";\n' +
				'import { CompareImage, Scrubber } from "@once-ui-system/core/media";\n' +
				"const a = 1;\n",
		);
	});

	it("keeps type-only imports type-only", () => {
		const src = 'import type { EmojiPickerProps, ButtonProps } from "@once-ui-system/core";\n';
		assert.equal(
			idempotent(src),
			'import type { ButtonProps } from "@once-ui-system/core";\n' +
				'import type { EmojiPickerProps } from "@once-ui-system/core/emoji";\n',
		);
	});

	it("moves the players from ./components/* to ./media", () => {
		const src =
			'import { MediaAudioPlayer } from "@once-ui-system/core/components/MediaAudioPlayer";\n' +
			'import { MediaVideoPlayer } from "@once-ui-system/core/components/MediaVideoPlayer";\n';
		assert.equal(
			idempotent(src),
			'import { MediaAudioPlayer, MediaVideoPlayer } from "@once-ui-system/core/media";\n',
		);
	});

	it("moves a dynamic import of a player, and a namespace of one", () => {
		const src =
			'const V = dynamic(() => import("@once-ui-system/core/components/MediaVideoPlayer").then((m) => m.MediaVideoPlayer));\n' +
			'import * as Audio from "@once-ui-system/core/components/MediaAudioPlayer";\n';
		assert.equal(
			run(src).out,
			'const V = dynamic(() => import("@once-ui-system/core/media").then((m) => m.MediaVideoPlayer));\n' +
				'import * as Audio from "@once-ui-system/core/media";\n',
		);
	});

	it("moves a re-export", () => {
		const src = 'export { CompareImage, Row } from "@once-ui-system/core";\n';
		assert.equal(
			idempotent(src),
			'export { Row } from "@once-ui-system/core";\nexport { CompareImage } from "@once-ui-system/core/media";\n',
		);
	});

	it("rewrites the import in a code sample (MDX, a docs string)", () => {
		const src = "const code = `import { EmojiPicker, Row } from \"@once-ui-system/core\";\n\n<EmojiPicker />`;\n";
		assert.equal(
			idempotent(src),
			'const code = `import { Row } from "@once-ui-system/core";\nimport { EmojiPicker } from "@once-ui-system/core/emoji";\n\n<EmojiPicker />`;\n',
		);
	});

	it("keeps a multi-line import multi-line", () => {
		const src = 'import {\n  Column,\n  EmojiPicker,\n  Row,\n} from "@once-ui-system/core";\n';
		assert.equal(
			idempotent(src),
			'import {\n  Column,\n  Row,\n} from "@once-ui-system/core";\nimport { EmojiPicker } from "@once-ui-system/core/emoji";\n',
		);
	});

	it("merges two deep imports in a code string without leaving a blank line", () => {
		const src =
			'const code = `import { MediaAudioPlayer } from "@once-ui-system/core/components/MediaAudioPlayer";\nimport { MediaVideoPlayer } from "@once-ui-system/core/components/MediaVideoPlayer";`;\n';
		assert.equal(
			idempotent(src),
			'const code = `import { MediaAudioPlayer, MediaVideoPlayer } from "@once-ui-system/core/media";`;\n',
		);
	});

	it("keeps the indentation of an indented statement", () => {
		const src = '  import { Card, Scrubber } from "@once-ui-system/core";\n';
		assert.equal(
			run(src).out,
			'  import { Card } from "@once-ui-system/core";\n  import { Scrubber } from "@once-ui-system/core/media";\n',
		);
	});

	it("reports a namespace import that reaches a moved name", () => {
		const { warnings } = run('import * as Once from "@once-ui-system/core";\n<Once.EmojiPicker />;\n');
		assert.match(warnings.join("\n"), /Once\.EmojiPicker: EmojiPicker is on "@once-ui-system\/core\/emoji"/);
	});

	it("reports `export *`, which no longer carries the moved names", () => {
		const { warnings } = run('export * from "@once-ui-system/core";\n');
		assert.match(warnings.join("\n"), /does not re-export EmojiPicker/);
	});

	it("does not touch a same-named import from elsewhere", () => {
		const src = 'import { EmojiPicker } from "./my-picker";\n';
		assert.equal(run(src).out, src);
	});
});

describe("F8, F10: the effects and the blocks are packages of their own", () => {
	it("moves the effects to @once-ui-system/fx and the blocks to @once-ui-system/blocks", () => {
		const src =
			'import { Button, RevealFx, type CountFxProps, StylePanel, LogoCloud, MatrixFx } from "@once-ui-system/core";\n';
		assert.equal(
			idempotent(src),
			'import { Button } from "@once-ui-system/core";\n' +
				'import { RevealFx, type CountFxProps, MatrixFx } from "@once-ui-system/fx";\n' +
				'import { StylePanel, LogoCloud } from "@once-ui-system/blocks";\n',
		);
	});

	it("moves every one of the sixteen effects and the six blocks", () => {
		const effects = MOVED_IMPORTS["@once-ui-system/fx"].filter((n) => !/Props$|Type$|Config$/.test(n));
		const blocks = MOVED_IMPORTS["@once-ui-system/blocks"].filter((n) => /^[A-Z]/.test(n) && !/Props$|Labels$|Heading$|Value$|Visibility$|Row$/.test(n));
		assert.equal(effects.length, 16);
		assert.deepEqual(blocks.sort(), ["Banner", "Book", "LogoCloud", "ScrollToTop", "StyleOverlay", "StylePanel"]);
		const { out } = run(`import { ${[...effects, ...blocks].join(", ")} } from "@once-ui-system/core";\n`);
		assert.doesNotMatch(out, /from "@once-ui-system\/core"/);
		assert.match(out, new RegExp(`import \\{ ${effects.join(", ")} \\} from "@once-ui-system/fx";`));
	});

	it("moves a type-only import, StylePanel's types and its hook", () => {
		const src =
			'import type { StylePanelValue, StylePanelLabels, SpacingToken } from "@once-ui-system/core";\n' +
			'import { useStylePanel } from "@once-ui-system/core";\n';
		assert.equal(
			idempotent(src),
			'import type { SpacingToken } from "@once-ui-system/core";\n' +
				'import type { StylePanelValue, StylePanelLabels } from "@once-ui-system/blocks";\n' +
				'import { useStylePanel } from "@once-ui-system/blocks";\n',
		);
	});

	it("joins an existing import of the package", () => {
		const src =
			'import { Row, ShineFx } from "@once-ui-system/core";\n' +
			'import { RevealFx } from "@once-ui-system/fx";\n';
		assert.equal(
			idempotent(src),
			'import { Row } from "@once-ui-system/core";\nimport { RevealFx, ShineFx } from "@once-ui-system/fx";\n',
		);
	});

	it("moves a deep 2.x import of an effect or a block", () => {
		const src =
			'import { TiltFx } from "@once-ui-system/core/components/TiltFx";\n' +
			'import { Book } from "@once-ui-system/core/components";\n';
		assert.equal(
			idempotent(src),
			'import { TiltFx } from "@once-ui-system/fx";\nimport { Book } from "@once-ui-system/blocks";\n',
		);
	});

	it("moves the import in a code sample", () => {
		const src = "const code = `import { Column, TypeFx } from \"@once-ui-system/core\";\n\n<TypeFx words=\"Hi\" />`;\n";
		assert.equal(
			idempotent(src),
			'const code = `import { Column } from "@once-ui-system/core";\nimport { TypeFx } from "@once-ui-system/fx";\n\n<TypeFx words="Hi" />`;\n',
		);
	});

	it("reports a namespace import that reaches an effect", () => {
		const { warnings } = run('import * as Once from "@once-ui-system/core";\n<Once.RevealFx />;\n');
		assert.match(warnings.join("\n"), /Once\.RevealFx: RevealFx is on "@once-ui-system\/fx"/);
	});

	it("leaves an import from the new packages alone", () => {
		const src = 'import { RevealFx } from "@once-ui-system/fx";\nimport { Banner } from "@once-ui-system/blocks";\n';
		const { out, hits, warnings } = run(src);
		assert.equal(out, src);
		assert.deepEqual(hits, []);
		assert.deepEqual(warnings, []);
	});

	it("names the packages a file now needs installed", () => {
		const src = 'import { Row, RevealFx } from "@once-ui-system/core";\n';
		assert.deepEqual(packagesAdded(src, run(src).out), ["@once-ui-system/fx"]);
		assert.deepEqual(packagesAdded(run(src).out, run(src).out), []);
	});
});

describe("the full codemod runs the import pass", () => {
	it("moves EmojiPickerDropdown, merged into EmojiPicker, onto ./emoji", () => {
		const src = 'import { EmojiPickerDropdown } from "@once-ui-system/core";\n<EmojiPickerDropdown trigger={<b />} />;\n';
		const { out } = transform(src);
		assert.match(out, /import \{ EmojiPicker \} from "@once-ui-system\/core\/emoji";/);
		assert.match(out, /<EmojiPicker trigger=\{<b \/>\} \/>/);
	});

	it("moves a deep import", () => {
		const { out } = transform('import { Button } from "@once-ui-system/core/components/Button";\n<Button />;\n');
		assert.match(out, /import \{ Button \} from "@once-ui-system\/core";/);
	});

	it("renames Particle and FadingLettersFx before moving them to @once-ui-system/fx", () => {
		const { out } = transform(
			'import { Particle, FadingLettersFx } from "@once-ui-system/core";\n<Particle />;\n<FadingLettersFx text="Hi" />;\n',
		);
		assert.doesNotMatch(out, /@once-ui-system\/core"/);
		assert.match(out, /from "@once-ui-system\/fx";/);
		assert.match(out, /<ParticleFx \/>/);
		assert.match(out, /<TypeFx /);
	});

	it("reports CodeBlock styleButton, whose StyleOverlay is in @once-ui-system/blocks", () => {
		const { warnings } = transform('import { CodeBlock } from "@once-ui-system/core/code";\n<CodeBlock styleButton codes={[]} />;\n');
		assert.match(warnings.join("\n"), /<CodeBlock> styleButton: removed: pass actions=/);
	});
});
