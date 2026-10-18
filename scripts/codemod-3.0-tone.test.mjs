/**
 * Regression tests for the 2.x → 3.0 codemod: tone separate from variant,
 * textVariant on Text and Heading, and Badge and Chip folded into Tag
 * (MIGRATING.md § "2.x → 3.0", 8 and 9).
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { transform } from "./codemod-3.0.mjs";

const IMPORT = 'import { Badge, Button, Chip, Feedback, IconButton, Tag, Text } from "@once-ui-system/core";\n';
const run = (body, imports = IMPORT) => transform(imports + body);
const body = (out, imports = IMPORT) => out.slice(out.indexOf("\n") + 1);

describe("E2: Button and IconButton variant is appearance only", () => {
	it("moves danger, success and warning to tone on the default primary variant", () => {
		for (const tone of ["danger", "success", "warning"]) {
			const { out } = run(`<Button variant="${tone}" label="x" />\n<IconButton variant='${tone}' icon="close" />\n`);
			assert.equal(body(out), `<Button tone="${tone}" label="x" />\n<IconButton tone='${tone}' icon="close" />\n`);
		}
	});

	it("folds quaternary into ghost, in a literal and inside a ternary", () => {
		const { out } = run('<Button variant="quaternary" />\n<Button variant={on ? "primary" : "quaternary"} />\n');
		assert.equal(body(out), '<Button variant="ghost" />\n<Button variant={on ? "primary" : "ghost"} />\n');
	});

	it("leaves the appearance variants alone", () => {
		const src = '<Button variant="secondary" />\n<Button variant="tertiary" />\n<Button variant="ghost" />\n<Button variant="link" />\n';
		const imports = 'import { Button } from "@once-ui-system/core";\n';
		const { out, hits } = run(src, imports);
		assert.equal(body(out, imports), src);
		assert.deepEqual(hits, []);
	});

	it("reports a variant it cannot read", () => {
		const { out, warnings } = run("<Button variant={kind} />\n");
		assert.equal(body(out), "<Button variant={kind} />\n");
		assert.ok(warnings.some((w) => /variant=\{kind\}/.test(w)));
	});

	it("turns the icon-only color into tone, and reports that the label is tinted too", () => {
		const { out, warnings } = run('<Button variant="secondary" color="brand-strong">Go</Button>\n');
		assert.equal(body(out), '<Button variant="secondary" tone="brand">Go</Button>\n');
		assert.ok(warnings.some((w) => /label as well as the icons/.test(w)));
	});
});

describe("E1: tone where 2.x said variant, scheme, state or hue", () => {
	it("renames Feedback and Toast variant", () => {
		const { out } = run('<Feedback variant="danger" title="x" />\n<Toast variant="success">ok</Toast>\n');
		assert.equal(body(out), '<Feedback tone="danger" title="x" />\n<Toast tone="success">ok</Toast>\n');
	});

	it("renames Tag and Pulse scheme, and makes Tag's gradient a variant", () => {
		const { out } = run('<Tag scheme="brand" label="a" />\n<Tag scheme="gradient" label="b" />\n<Pulse scheme="danger" />\n');
		assert.equal(body(out), '<Tag tone="brand" label="a" />\n<Tag variant="gradient" label="b" />\n<StatusIndicator pulse tone="danger" />\n');
	});

	it("gives StatusIndicator and Avatar status a scheme, the palette hue", () => {
		const { out } = run('<StatusIndicator color="green" />\n<Avatar statusIndicator={{ color: "red" }} />\n');
		assert.equal(body(out), '<StatusIndicator scheme="green" />\n<Avatar statusIndicator={{ scheme: "red" }} />\n');
	});

	it("splits the gauges' hue into tone and hueRange", () => {
		const { out, warnings } = run('<LinearGauge hue="success" />\n<RadialGauge hue={[0, 120]} />\n<RadialGauge hue={h} />\n');
		assert.equal(body(out), '<LinearGauge tone="success" />\n<RadialGauge hueRange={[0, 120]} />\n<RadialGauge hue={h} />\n');
		assert.ok(warnings.some((w) => /hue=\{h\}/.test(w)));
	});

	it("rewrites Timeline items' state to tone", () => {
		const { out } = run(
			'<Timeline items={[{ state: "default", label: "a" }, { label: "b", state: "active" }, { label: "c", state: "danger" }]} />\n',
		);
		assert.equal(
			body(out),
			'<Timeline items={[{ label: "a" }, { label: "b", tone: "brand" }, { label: "c", tone: "danger" }]} />\n',
		);
	});

	it("rewrites Timeline items a same-file const holds", () => {
		const { out, warnings } = run('const steps = [{ label: "a", state: "active" }, { label: "b", state: "default" }];\n<Timeline items={steps} />\n');
		assert.equal(body(out), 'const steps = [{ label: "a", tone: "brand" }, { label: "b" }];\n<Timeline items={steps} />\n');
		assert.deepEqual(warnings, []);
		assert.equal(transform(out).out, out);
	});

	it("follows a const through .map, renaming the item's reads and the type index", () => {
		const imports = 'import { Timeline, type TimelineItem } from "@once-ui-system/core";\n';
		const src =
			'const hiringSteps = [\n  { label: "Intro", state: "active" },\n  { label: "Offer", state: "default" },\n];\n' +
			'<Timeline\n  items={hiringSteps.map((item) => ({\n    ...item,\n    state: item.state as TimelineItem["state"],\n  }))}\n/>;\n';
		const { out, warnings } = run(src, imports);
		assert.equal(
			body(out, imports),
			'const hiringSteps = [\n  { label: "Intro", tone: "brand" },\n  { label: "Offer" },\n];\n' +
				'<Timeline\n  items={hiringSteps.map((item) => ({\n    ...item,\n    tone: item.tone as TimelineItem["tone"],\n  }))}\n/>;\n',
		);
		assert.deepEqual(warnings, []);
		assert.equal(transform(out).out, out);
	});

	it("reports Timeline items it cannot see: a value, a second use, a spread", () => {
		for (const src of [
			'const steps = [{ label: "a", state: current }];\n<Timeline items={steps} />\n',
			'const steps = [{ label: "a", state: "active" }];\n<Timeline items={steps} />\nlog(steps[0].state);\n',
			'const steps = [{ label: "a", state: "active" }, ...more];\n<Timeline items={steps} />\n',
			'const steps = [{ label: "a", state: "active" }];\n<Timeline items={steps.map((s) => ({ ...s, state: s.done ? "success" : "active" }))} />\n',
		]) {
			const { out, warnings } = run(src);
			assert.equal(body(out), src);
			assert.ok(warnings.some((w) => /<Timeline> items=\{steps/.test(w)), src);
		}
	});

	it("renames a Scrubber's tracks built in a useMemo, and the scheme type index", () => {
		const imports = 'import { Scrubber, type ScrubberTrack } from "@once-ui-system/core/media";\n';
		const src =
			'const KIND: Record<Kind, { scheme: ScrubberTrack["scheme"] }> = { scene: { scheme: "brand" } };\n' +
			"const tracks = useMemo<ScrubberTrack[]>(\n  () =>\n    (project?.tracks ?? []).map((track) => ({\n      id: track.id,\n      scheme: KIND[track.kind].scheme,\n" +
			"      onAdd: (time: number) => add(track.id, time),\n      blocks: track.clips.map((clip) => ({ id: clip.id, scheme: clip.kind === \"scene\" ? clip.scheme : undefined })),\n    })),\n  [project?.tracks],\n);\n" +
			"<Scrubber duration={1} value={0} tracks={tracks} />;\n";
		const { out, warnings } = run(src, imports);
		assert.equal(
			body(out, imports),
			src
				.replace('ScrubberTrack["scheme"]', 'ScrubberTrack["tone"]')
				.replace("scheme: KIND[track.kind].scheme", "tone: KIND[track.kind].scheme")
				.replace('scheme: clip.kind === "scene"', 'tone: clip.kind === "scene"'),
		);
		assert.deepEqual(warnings, []);
	});

	it("leaves a Scrubber's data alone when a callback in it builds another scheme object", () => {
		const imports = 'import { Scrubber } from "@once-ui-system/core/media";\n';
		const src =
			"const tracks = rows.map((r) => ({ id: r.id, scheme: r.scheme, onAdd: () => save({ scheme: r.scheme }) }));\n<Scrubber tracks={tracks} />;\n";
		const { out, warnings } = run(src, imports);
		assert.equal(body(out, imports), src);
		assert.ok(warnings.some((w) => /tracks=\{tracks\}/.test(w)));
	});

	it("rewrites Table actions and Scrubber tracks", () => {
		const { out } = run(
			'<Table actions={[{ icon: "trash", variant: "danger", onClick }]} />\n<Scrubber tracks={[{ id: "a", scheme: "accent", blocks: [{ id: "b", scheme: "info" }] }]} />\n',
		);
		assert.equal(
			body(out),
			'<Table actions={[{ icon: "trash", variant: "primary", tone: "danger", onClick }]} />\n<Scrubber tracks={[{ id: "a", tone: "accent", blocks: [{ id: "b", tone: "info" }] }]} />\n',
		);
	});

	it("renames the variant key of addToast's object", () => {
		const imports = 'import { useToast } from "@once-ui-system/core";\n';
		const { out } = run('const { addToast } = useToast();\naddToast({ variant: "danger", message: "x" });\n', imports);
		assert.equal(body(out, imports), 'const { addToast } = useToast();\naddToast({ tone: "danger", message: "x" });\n');
	});
});

describe("E2: Text and Heading take textVariant", () => {
	it("renames variant, in TSX and by name in MDX", () => {
		const { out } = run('<Text variant="body-default-s">a</Text>\n');
		assert.equal(body(out), '<Text textVariant="body-default-s">a</Text>\n');
		const mdx = transform('<Heading as="h2" variant="display-strong-s">Title</Heading>\n');
		assert.equal(mdx.out, '<Heading as="h2" textVariant="display-strong-s">Title</Heading>\n');
	});

	it("leaves an app's own Text alone", () => {
		const src = 'import { Text } from "./my-text";\n<Text variant="big">a</Text>\n';
		assert.equal(transform(src).out, src);
	});
});

describe("F3: Badge and Chip are Tag", () => {
	it("maps Badge's props and keeps its look with variant=announce", () => {
		const { out } = run('<Badge title="New" icon="rocket" href="/blog" effect={false} />\n');
		assert.equal(body(out), '<Tag variant="announce" label="New" prefixIcon="rocket" href="/blog" effect={false} />\n');
	});

	it("maps Chip's props and writes selected where 2.x defaulted it to true", () => {
		const { out } = run(
			'<Chip label="A" onRemove={drop} iconButtonProps={{ tooltip: "x" }} />\n<Chip label="B" selected={false} />\n',
		);
		assert.equal(
			body(out),
			'<Tag selected label="A" onRemove={drop} removeButtonProps={{ tooltip: "x" }} />\n<Tag label="B" selected={false} />\n',
		);
	});

	it("renames closing tags and folds the imports into one Tag", () => {
		const { out } = run("<Badge>New</Badge>\n<Chip label=\"x\">y</Chip>\n");
		assert.match(out, /^import \{ Button, Feedback, IconButton, Tag, Text \} from "@once-ui-system\/core";/);
		assert.match(out, /<Tag variant="announce">New<\/Tag>/);
		assert.match(out, /<Tag selected label="x">y<\/Tag>/);
	});

	it("keeps an alias, renames the props types, and is idempotent", () => {
		const src =
			'import { Badge as Pill, type BadgeProps } from "@once-ui-system/core";\nconst p: BadgeProps = {};\n<Pill title="x" />\n';
		const once = transform(src).out;
		assert.equal(
			once,
			'import { Tag as Pill, type TagProps } from "@once-ui-system/core";\nconst p: TagProps = {};\n<Pill variant="announce" label="x" />\n',
		);
		assert.equal(transform(once).out, once);
	});

	it("does not import Tag twice", () => {
		const src = 'import { Badge } from "@once-ui-system/core";\nimport { Tag } from "@once-ui-system/core";\n<Badge title="x" />\n';
		const { out } = transform(src);
		assert.equal(out, 'import { Tag } from "@once-ui-system/core";\n<Tag variant="announce" label="x" />\n');
	});

	it("leaves an app's own Badge alone", () => {
		const src = 'import { Badge } from "./ui";\n<Badge title="x" />\n';
		assert.equal(transform(src).out, src);
	});
});

describe("E/F3 is idempotent", () => {
	it("changes nothing on a second run", () => {
		const src =
			IMPORT +
			'<Badge title="a" />\n<Chip label="b" />\n<Button variant="danger" />\n<Text variant="body-default-s">x</Text>\n<Tag scheme="gradient" />\n';
		const once = transform(src).out;
		const twice = transform(once);
		assert.equal(twice.out, once);
		assert.deepEqual(twice.hits, []);
	});
});
