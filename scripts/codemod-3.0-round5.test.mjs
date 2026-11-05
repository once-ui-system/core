/**
 * Regression tests for the 2.x → 3.0 codemod, round 5: what the satellite
 * upgrades (starter, motion, magic-docs, Tavilio, Magic Portfolio, Studio,
 * Stack) still did by hand, or were not told about.
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { jsonStrings, transformJsonStrings } from "./codemod-3.0-json.mjs";
import { dependencyNote, formatNote, transform } from "./codemod-3.0.mjs";

const CLI = join(dirname(fileURLToPath(import.meta.url)), "codemod-3.0.mjs");
const core = (names) => `import { ${names} } from "@once-ui-system/core";\n`;
const run = (src, file = "/app/src/a.tsx") => transform(src, { file });

/** A small app on disk: `files` is { path: text }. Removed by the caller. */
function app(files) {
	const root = mkdtempSync(join(tmpdir(), "codemod-r5-"));
	for (const [name, text] of Object.entries(files)) {
		mkdirSync(dirname(join(root, name)), { recursive: true });
		writeFileSync(join(root, name), text);
	}
	return root;
}

describe("2.x JSX inside JSON strings", () => {
	const SRC = `${core("Row, Tag")}export const A = () => <Row>AI chat<Tag size="s" scheme="brand" label="New" /></Row>;\n`;

	it("reads every JSON string with its offsets", () => {
		const text = '{"a": "x\\"y", "b": ["<Tag />"]}';
		assert.deepEqual(
			jsonStrings(text).map((s) => s.value),
			["a", 'x"y', "b", "<Tag />"],
		);
	});

	it("rewrites a string that is a byte-exact copy of source this run rewrote", () => {
		const out = run(SRC).out;
		const anchor = 'AI chat<Tag size="s" scheme="brand" label="New" /></Row>;';
		const json = `{\n  "absentTransforms": [{ "find": ${JSON.stringify(anchor)} }]\n}\n`;
		const r = transformJsonStrings(json, { transform: (s) => transform(s), rewritten: [{ src: SRC, out }] });
		assert.deepEqual(r.warnings, []);
		assert.match(r.out, /tone=\\"brand\\"/);
		assert.ok(out.includes(JSON.parse(r.out).absentTransforms[0].find));
		assert.ok(r.hits.some((h) => h.startsWith("JSON string:")));
	});

	it("reports 2.x JSX in a string that copies nothing this run saw", () => {
		const json = '{ "snippet": "<Text variant=\\"body-default-m\\">Hi</Text>" }\n';
		const r = transformJsonStrings(json, { transform: (s) => transform(s), rewritten: [] });
		assert.equal(r.out, json);
		assert.equal(r.warnings.length, 1);
		assert.match(r.warnings[0], /^JSON string: holds 2\.x JSX .*textVariant.* \(line 1\)$/);
	});

	it("leaves strings without JSX, and JSX that needs nothing, alone", () => {
		const json = '{ "a": "x < y", "b": "<Row gap=\\"8\\">a</Row>", "c": "use <b>bold</b>" }\n';
		const r = transformJsonStrings(json, { transform: (s) => transform(s), rewritten: [] });
		assert.equal(r.out, json);
		assert.deepEqual(r.warnings, []);
	});

	it("runs from the CLI, after the source files", () => {
		const root = app({
			"src/a.tsx": SRC,
			"composition/landing.json": `{ "find": ${JSON.stringify('<Tag size="s" scheme="brand" label="New" />')} }\n`,
		});
		try {
			const res = spawnSync(process.execPath, [CLI, root], { encoding: "utf8" });
			assert.equal(res.status, 0, res.stderr);
			assert.match(readFileSync(join(root, "composition/landing.json"), "utf8"), /tone=\\"brand\\"/);
			assert.match(res.stdout, /landing\.json\n.*JSON string: /);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});

describe("the closing notes", () => {
	it("lists the files that import each package now", () => {
		const note = dependencyNote(
			new Map([
				["@once-ui-system/fx", ["/app/src/app/not-found.tsx"]],
				["@once-ui-system/blocks", ["/app/src/b.tsx", "/app/src/a.tsx"]],
			]),
			"/app",
		);
		assert.match(note, /@once-ui-system\/fx: src\/app\/not-found\.tsx\n/);
		assert.match(note, /@once-ui-system\/blocks: src\/a\.tsx, src\/b\.tsx\n/);
		assert.match(note, /generates other apps/);
	});

	it("tells the reader to run a formatter on the changed files", () => {
		assert.match(formatNote(["a", "b"]), /^Run your formatter on the 2 changed files/);
	});
});

describe("ElementType", () => {
	const E = core("ElementType, Row");
	it("is a <button type=\"button\"> for onClick without href, and leaves the import", () => {
		const { out, hits } = run(`${E}<Row><ElementType onClick={go} className="row">a</ElementType></Row>;\n`);
		assert.equal(out, `${core("Row")}<Row><button type="button" onClick={go} className="row">a</button></Row>;\n`);
		assert.ok(hits.some((h) => h.includes("<ElementType> → <button")));
	});

	it("keeps a literal type, makes an http(s) href a new-tab <a>, and no href nor handler a Flex", () => {
		const { out } = run(
			`${E}<ElementType type="submit">a</ElementType>;\n<ElementType href="https://x.dev">b</ElementType>;\n<ElementType className="c" />;\n`,
		);
		assert.match(out, /<button type="submit">a<\/button>/);
		assert.match(out, /<a target="_blank" rel="noreferrer" href="https:\/\/x\.dev">b<\/a>/);
		assert.match(out, /<Flex className="c" \/>/);
		assert.match(out, /import \{ Flex, Row \} from "@once-ui-system\/core";/);
	});

	it("reports a computed href with a ready local replacement", () => {
		const { out, warnings } = run(`${E}<ElementType href={href} onClick={go}>a</ElementType>;\n`);
		assert.match(out, /<ElementType href=\{href\}/);
		assert.ok(warnings.some((w) => /<ElementType>: its href is computed/.test(w) && /\(line 2\)$/.test(w)));
		assert.ok(warnings.some((w) => w.includes("const Interactive = ({ href, ...rest }) => href ? <Link href={href} {...rest} /> : <button type=\"button\" {...rest} />")));
	});
});

describe("a leaf with only hide props", () => {
	const I = core("NavIcon, Row");
	it("is wrapped in a Row inside a fragment under a layout parent", () => {
		const { out, warnings } = run(`${I}<Row>\n\t{open && (\n\t\t<>\n\t\t\t<NavIcon hide m={{ hide: false }} onClick={t} />\n\t\t</>\n\t)}\n</Row>;\n`);
		assert.deepEqual(warnings, []);
		assert.match(out, /<Row hide m=\{\{ hide: false \}\}>\n\t\t\t\t<NavIcon onClick=\{t\} \/>\n\t\t\t<\/Row>/);
	});

	it("is reported with the wrapper to paste where the parent is unknown", () => {
		const { warnings } = run(`${I}<div>\n\t<NavIcon hide m={{ hide: false }} />\n</div>;\n`);
		assert.equal(warnings.length, 1);
		assert.match(warnings[0], /<Row hide m=\{\{ hide: false \}\}><NavIcon …\/><\/Row>/);
	});
});

describe("Text size through the app's own Text wrapper", () => {
	it("is reported at the call site, with the class to write", () => {
		const root = app({
			"src/Price.tsx":
				'import { Text } from "@once-ui-system/core";\ninterface PriceProps extends Omit<React.ComponentProps<typeof Text>, "children"> { amount: number }\nexport const Price = ({ amount, ...rest }: PriceProps) => <Text {...rest}>{amount}</Text>;\n',
			"src/Cart.tsx": `${core("Row")}import { Price } from "./Price";\nexport const C = () => <Row><Price amount={1} size="s" /></Row>;\n`,
		});
		try {
			const file = join(root, "src/Cart.tsx");
			const { warnings } = transform(readFileSync(file, "utf8"), { file });
			assert.equal(warnings.length, 1);
			assert.match(warnings[0], /<Price> size="s": Price passes size on to a Text.*className="font-s"/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("stays quiet when the wrapper takes size itself", () => {
		const src = `${core("Row, Text")}const Price = ({ size, ...rest }: React.ComponentProps<typeof Text>) => <Text {...rest} />;\nexport const C = () => <Row><Price size="s" /></Row>;\n`;
		assert.deepEqual(run(src).warnings, []);
	});
});

describe("report noise", () => {
	it("says nothing about a zero-argument onToggle, inline or a same-file function", () => {
		const src = `${core("Accordion, NavGroup")}const toggle = () => setOpen((o) => !o);\n<NavGroup onToggle={toggle} />;\n<Accordion onToggle={() => flip()} />;\n`;
		const { out, warnings } = run(src);
		assert.equal((out.match(/onOpenChange=/g) ?? []).length, 2);
		assert.deepEqual(warnings, []);
		assert.equal(run(`${core("NavGroup")}<NavGroup onToggle={(e) => go(e)} />;\n`).warnings.length, 1);
	});

	it("says nothing about DatePicker open beside autoFocus", () => {
		assert.deepEqual(run(`${core("DatePicker")}<DatePicker open={o} autoFocus />;\n`).warnings, []);
		assert.equal(run(`${core("DatePicker")}<DatePicker open={o} />;\n`).warnings.length, 1);
	});

	it("says nothing about a Button variant declared as primary | secondary", () => {
		const src = `${core("Button")}type V = "primary" | "secondary";\nexport const B = ({ variant }: { variant?: V }) => <Button variant={variant} />;\n`;
		assert.deepEqual(run(src).warnings, []);
		const tones = `${core("Button")}export const B = ({ variant }: { variant?: "primary" | "danger" }) => <Button variant={variant} />;\n`;
		assert.equal(run(tones).warnings.length, 1);
	});

	it("says nothing about a RevealFx duration from a same-file const in milliseconds", () => {
		const src = `${core("RevealFx")}const CARD_FADE = 600;\n<RevealFx speed={CARD_FADE}>a</RevealFx>;\n`;
		const { out, warnings } = run(src);
		assert.match(out, /duration=\{CARD_FADE\}/);
		assert.deepEqual(warnings, []);
	});

	it("says nothing about values typed as literal strings", () => {
		const consts = `${core("Row")}const RULER_H = "24" as const;\ntype LaneHeight = typeof RULER_H;\nexport const L = ({ height }: { height: LaneHeight }) => <Row height={height} />;\n`;
		assert.deepEqual(run(consts).warnings, []);
		const annotated = `${core("Row")}const CORNERS: { top?: "0"; left?: "0"; cursor: string }[] = [\n\t{ top: "0", cursor: "a" },\n\t{ left: "0", cursor: "b" },\n];\nexport const C = () => CORNERS.map((h) => <Row key={h.cursor} top={h.top} left={h.left} />);\n`;
		assert.deepEqual(run(annotated).warnings, []);
	});
});

describe("magic-docs: Accordion and Feedback", () => {
	it("Accordion open={expr} → defaultOpen, and says 2.x followed later changes", () => {
		const { out, warnings } = run(`${core("Accordion")}<Accordion open={expanded} title="a">b</Accordion>;\n`);
		assert.match(out, /defaultOpen=\{expanded\}/);
		assert.equal(warnings.length, 1);
		assert.match(warnings[0], /2\.x also opened or closed the accordion when expanded changed/);
		assert.deepEqual(run(`${core("Accordion")}<Accordion open title="a">b</Accordion>;\n`).warnings, []);
	});

	it("reports a bare Feedback icon, in MDX too", () => {
		const { warnings } = transform('<Feedback icon tone="info">a</Feedback>\n', { file: "/app/a.mdx" });
		assert.equal(warnings.length, 1);
		assert.match(warnings[0], /<Feedback> icon: a bare icon .*showIcon=\{false\}/);
		assert.deepEqual(transform('<Feedback icon="check">a</Feedback>\n', { file: "/app/a.mdx" }).warnings, []);
	});
});

describe("Kbd padding equal to its own", () => {
	it("is dropped", () => {
		const { out, warnings } = run(`${core("Kbd, Row")}<Row><Kbd paddingX="4" paddingY="2">K</Kbd></Row>;\n`);
		assert.match(out, /<Kbd>K<\/Kbd>/);
		assert.deepEqual(warnings, []);
		assert.equal(run(`${core("Kbd, Row")}<Row><Kbd paddingX="8">K</Kbd></Row>;\n`).warnings.length, 1);
	});
});

describe("ParticleFx speed and CodeBlock highlight", () => {
	it("divides a speed expression that is always a number by 0.3", () => {
		const src = 'import { ParticleFx } from "@once-ui-system/core";\nexport const P = ({ config }: { config: { speed: number } }) => <ParticleFx speed={config.speed} />;\n';
		const { out, warnings } = run(src);
		assert.match(out, /speed=\{config\.speed \/ 0\.3\}/);
		assert.deepEqual(warnings, []);
		const unknown = run('import { ParticleFx } from "@once-ui-system/core";\nexport const P = ({ s }) => <ParticleFx speed={s} />;\n');
		assert.match(unknown.out, /speed=\{s\}/);
		assert.match(unknown.warnings.join("\n"), /write speed=\{s \/ 0\.3\}/);
	});

	it("puts a moved highlight on its own line in an entry written one key per line", () => {
		const src = `${core("CodeBlock")}<CodeBlock\n\thighlight="2"\n\tcodes={[\n\t\t{\n\t\t\tcode: "a",\n\t\t\tlanguage: "tsx",\n\t\t},\n\t]}\n/>;\n`;
		const { out } = run(src);
		assert.match(out, /\{\n\t\t\thighlight: "2",\n\t\t\tcode: "a",/);
	});
});

describe("a destructured prop with a numeric default, typed by an interface that extends", () => {
	it("reads the interface after a closing brace (not JSX text) and writes the template", () => {
		const src = `${core("Column, Row")}interface P extends Omit<React.ComponentProps<typeof Column>, "children"> {\n\taxisMinWidth?: number;\n}\nconst A: React.FC<P> = ({ axisMinWidth = 13, ...flex }) => (\n\t<Column {...flex}>\n\t\t<Row flex={1} minWidth={axisMinWidth} />\n\t</Column>\n);\n`;
		const { out, warnings } = run(src);
		assert.deepEqual(warnings, []);
		assert.match(out, /minWidth=\{`\$\{axisMinWidth\}rem`\}/);
	});
});

describe("a component the file declares itself", () => {
	it("is not merged or renamed as Once UI's, though nothing is imported by its name", () => {
		const src = `${core("HoverCard, Icon, Row")}const InfoTip = ({ children }) => <HoverCard trigger={<Icon name="info" />}>{children}</HoverCard>;\nexport const A = ({ info }) => <Row><InfoTip>{info}</InfoTip></Row>;\n`;
		const { out, hits } = run(src);
		assert.equal(out, src);
		assert.deepEqual(hits, []);
	});

	it("still migrates by name in a code sample's template literal", () => {
		const src = "export const sample = `function Demo() {}\\n<Text variant=\"body-default-m\">a</Text>`;\n";
		assert.match(run(src).out, /textVariant=/);
	});
});

describe("Scrubber tracks from a useMemo with a block body", () => {
	it("renames scheme → tone in the objects it returns, and in their blocks", () => {
		const src = `import { Scrubber, type ScrubberTrack } from "@once-ui-system/core/media";\nexport const T = ({ a }) => {\n\tconst tracks = useMemo<ScrubberTrack[]>(() => {\n\t\tconst x = a * 2;\n\t\treturn [\n\t\t\t{ id: "clip", scheme: "brand", blocks: [{ start: 0, end: x, scheme: "danger" }] },\n\t\t\t{ id: "words", scheme: "neutral" },\n\t\t];\n\t}, [a]);\n\treturn <Scrubber tracks={tracks} />;\n};\n`;
		const { out, warnings } = run(src);
		assert.deepEqual(warnings, []);
		assert.equal((out.match(/tone: "/g) ?? []).length, 3);
		assert.ok(!/scheme:/.test(out));
	});

	it("still reports when a nested block returns too", () => {
		const src = `import { Scrubber } from "@once-ui-system/core/media";\nexport const T = ({ a }) => {\n\tconst tracks = useMemo(() => {\n\t\tif (a) {\n\t\t\treturn [];\n\t\t}\n\t\treturn [{ id: "c", scheme: "brand" }];\n\t}, [a]);\n\treturn <Scrubber tracks={tracks} />;\n};\n`;
		assert.match(run(src).warnings.join("\n"), /tracks\[\]\.scheme/);
	});
});

describe('as="ul" whose items are flex boxes', () => {
	it("adds no marker class (a flex <li> drew none in 2.x), and nothing when margin and padding are set", () => {
		const items = `${core("Column, Row")}<Column as="ul" margin="0" paddingLeft="0">\n\t<Row as="li">a</Row>\n\t<Row as="li">b</Row>\n</Column>;\n`;
		const r = run(items);
		assert.equal(r.out, items);
		assert.deepEqual(r.warnings, []);
		const plain = run(`${core("Column")}<Column as="ul" margin="0" paddingLeft="0">\n\t<li>a</li>\n</Column>;\n`);
		assert.match(plain.out, /className="list-disc"/);
	});
});

describe("an inserted attribute follows the element's layout", () => {
	it("goes on its own line, at the attributes' indent, when they are one per line", () => {
		const { out } = run(`${core("Badge")}<Badge\n\ttextVariant="code-default-s"\n\ttitle="New"\n/>;\n`);
		assert.match(out, /<Tag\n\tvariant="announce"\n\ttextVariant="code-default-s"\n\tlabel="New"\n\/>/);
		const one = run(`${core("Badge")}<Badge title="New" />;\n`).out;
		assert.match(one, /<Tag variant="announce" label="New" \/>/);
	});

	it("restores list styles after the last attribute on its own line", () => {
		const { out } = run(`${core("Column")}<Column\n\tas="ul"\n\tgap="8"\n>\n\t<li>a</li>\n</Column>;\n`);
		assert.match(out, /\tgap="8"\n\tclassName="list-disc"\n\tpaddingLeft="40px"\n\tmarginY="1em"\n>/);
	});
});

describe("Table data → columns and rows keeps the layout", () => {
	it("writes one column per line and de-indents the rows a level", () => {
		const src = `${core("Table")}export const T = () => (\n  <Table\n    data={{\n      headers: [\n        { content: "Name", key: "name" },\n        { content: "Role", key: "role" },\n      ],\n      rows: [\n        ["Ada", "Engineer"],\n      ],\n    }}\n  />\n);\n`;
		assert.equal(
			run(src).out.split("\n").slice(1).join("\n"),
			'export const T = () => (\n  <Table\n    columns={[\n      { header: "Name", key: "name" },\n      { header: "Role", key: "role" },\n    ]}\n    rows={[\n      ["Ada", "Engineer"],\n    ]}\n  />\n);\n',
		);
	});
});

describe("dev, 2.x's development logger", () => {
	it("is imported from the app's own logger when it has one", () => {
		const { out, warnings } = transform(`import { Row, dev } from "@once-ui-system/core";\ndev.log("x");\n`, {
			file: "/app/src/components/a.tsx",
			devLogger: "/app/src/utils/dev.ts",
		});
		assert.equal(out, `import { dev } from "../utils/dev";\nimport { Row } from "@once-ui-system/core";\ndev.log("x");\n`);
		assert.deepEqual(warnings, []);
	});

	it("is reported with a logger to paste otherwise", () => {
		const { warnings } = run(`import { dev } from "@once-ui-system/core";\ndev.log("x");\n`);
		assert.match(warnings.join("\n"), /export const dev = Object\.fromEntries/);
	});
});

describe("leaf reports with a precise hint", () => {
	it("Kbd padding that is no token: says 2.x had none, with both styles to paste", () => {
		const { warnings } = run(`${core("Kbd, Row")}<Row><Kbd paddingX="1rem">K</Kbd></Row>;\n`);
		assert.equal(warnings.length, 1);
		assert.match(warnings[0], /px-1rem, which does not exist.*style=\{\{ paddingLeft: 0, paddingRight: 0 \}\}.*style=\{\{ paddingLeft: "1rem", paddingRight: "1rem" \}\}/);
	});

	it("sizes on a leaf whose parent holds only it: points at the parent", () => {
		const { warnings } = run(`${core("ProgressBar, Row")}<Row><ProgressBar value={4} maxWidth={20} /></Row>;\n`);
		assert.match(warnings.join("\n"), /its parent Row holds only it, so moving the sizes onto that Row/);
	});
});

describe("a range handler typed with required dates", () => {
	it("is reported, inline or through a same-file function", () => {
		const inline = run(`${core("DateRangePicker")}<DateRangePicker onChange={(r: { startDate: Date; endDate: Date }) => set(r)} />;\n`);
		assert.match(inline.warnings.join("\n"), /handler's parameter is typed \{ startDate: Date; endDate: Date \}.*DateRange/);
		const named = run(`${core("DatePicker")}const pick = (range: { startDate: Date; endDate: Date }) => set(range);\n<DatePicker range onChange={pick} />;\n`);
		assert.equal(named.warnings.length, 1);
		assert.deepEqual(run(`${core("DatePicker")}<DatePicker range onChange={(r: DateRange) => set(r)} />;\n`).warnings, []);
	});
});

describe("strings that generate Once UI source", () => {
	it("are reported when code fills in a prop that changed meaning", () => {
		const src = "export const gen = (props) => `<Button variant=\"${props.variant}\" label=\"Go\" />\n<Column maxWidth={${props.w}} />`;\n";
		const { out, warnings } = run(src);
		assert.equal(out, src);
		assert.ok(warnings.some((w) => /^a string generates Once UI source with <Button> variant, <Column> maxWidth filled in by code.* \(line 1\)$/.test(w)), warnings.join("\n"));
	});

	it("are migrated like any JSX when they are static", () => {
		const { out } = run(`export const gen = (v) => '<Button variant="danger" label="' + v + '" />';\n`);
		assert.match(out, /tone="danger"/);
	});

	it("stay quiet when there is nothing to change, or the string is an attribute's text", () => {
		assert.deepEqual(run(`export const a = '<Button variant="primary" />';\n`).warnings, []);
		assert.deepEqual(run(`${core("Text")}<Text title="<Text variant=x>" />;\n`).warnings.filter((w) => w.startsWith("a string")), []);
	});
});

describe("Skeleton lengths", () => {
	it("2.x numbers become the rem strings they were (3.0 Skeleton takes no t-shirt width)", () => {
		const { out } = run(`${core("Skeleton")}<Skeleton shape="line" size="xl" width={12} height={2.5} />;\n`);
		assert.match(out, /<Skeleton shape="line" size="xl" width="12rem" height="2\.5rem" \/>/);
	});
});
