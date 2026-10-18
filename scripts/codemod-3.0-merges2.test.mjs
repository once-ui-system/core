/**
 * Regression tests for the 2.x → 3.0 codemod: the F6 merges (MIGRATING.md §
 * "2.x → 3.0", 10). Table takes DataTable's API; twelve more exports fold into
 * the component that survives them.
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { transform } from "./codemod-3.0.mjs";

const core = (names) => `import { ${names} } from "@once-ui-system/core";\n`;

/** Migrate `body` with `names` imported from core; the output's body, and the import line. */
const run = (names, body) => {
  const { out, hits, warnings } = transform(core(names) + body);
  const [importLine, ...rest] = out.split("\n");
  assert.equal(transform(out).out, out, "a second run changes nothing");
  return { importLine, body: rest.join("\n"), hits, warnings };
};

describe("F6: Table data={{ headers, rows }} → Table columns rows", () => {
  it("makes inline headers columns, `content` as `header`, and keeps the rows", () => {
    const r = run(
      "Table",
      `<Table data={{ headers: [{ content: "Name", key: "name", sortable: true }, { content: <B>Don't</B>, key: "b" }], rows: [["a", <C />], ...more] }} />\n`,
    );
    assert.equal(r.importLine, core("Table").trim());
    assert.equal(
      r.body,
      `<Table columns={[{ header: "Name", key: "name", sortable: true }, { header: <B>Don't</B>, key: "b" }]} rows={[["a", <C />], ...more]} />\n`,
    );
  });

  it("maps headers it cannot see into with .map, and a plain name's headers and rows", () => {
    assert.equal(
      run("Table", "<Table data={{ headers: cols, rows }} />\n").body,
      "<Table columns={cols.map(({ content, ...column }) => ({ ...column, header: content }))} rows={rows} />\n",
    );
    assert.equal(
      run("Table", "<Table data={{ headers: cols, rows: list }} />\n").body,
      "<Table columns={cols.map(({ content, ...column }) => ({ ...column, header: content }))} rows={list} />\n",
    );
    assert.equal(
      run("Table", "<Table data={props.table} />\n").body,
      "<Table columns={props.table.headers.map(({ content, ...column }) => ({ ...column, header: content }))} rows={props.table.rows} />\n",
    );
  });

  it("reads shorthand entries: { headers: [...], rows } and a shorthand header content", () => {
    const r = run("Table", '<Table\n  data={{\n    headers: [{ content: "", key: "row" }, { content, key: "us" }],\n    rows,\n  }}\n/>\n');
    assert.match(r.body, /columns=\{\[\{ header: "", key: "row" \}, \{ header: content, key: "us" \}\]\}/);
    assert.match(r.body, /rows=\{rows\}/);
    assert.deepEqual(r.warnings, []);
  });

  it("reports data it cannot read (a call), and counts no change for it", () => {
    const call = transform(`${core("Table")}<Table data={build()} />\n`);
    assert.ok(call.warnings.some((w) => w.startsWith("<Table> data: not an inline")));
    assert.match(call.warnings.join("\n"), /\(line 2\)/);
    assert.ok(!call.hits.some((h) => h.includes("<Table data>")));
  });

  it("renames the page-size props and keeps 2.x's page-size select and first/last buttons", () => {
    assert.equal(
      run("Table", "<Table paginated defaultPageSize={5} data={d} />\n").body,
      "<Table paginated defaultPerPage={5} columns={d.headers.map(({ content, ...column }) => ({ ...column, header: content }))} rows={d.rows} perPageOptions={[5, 10, 20, 50]} showFirstLast />\n",
    );
    assert.match(
      run("Table", "<Table paginated pageSizeOptions={[10, 25]} data={d} />\n").body,
      /perPageOptions=\{\[10, 25\]\}/,
    );
  });

  it("puts the row first in onRowClick, rowClassName, cellClassName and inline actions", () => {
    const r = run(
      "Table",
      '<Table data={d} onRowClick={(i) => open(i)} rowClassName={cls} cellClassName={function (r, c) { return ""; }} actions={[{ icon: "trash", onClick: (index) => remove(index), disabled: (i) => locked[i] }]} />\n',
    );
    assert.match(r.body, /onRowClick=\{\(_row, i\) => open\(i\)\}/);
    assert.match(r.body, /rowClassName=\{\(_row, \.\.\.args\) => cls\(\.\.\.args\)\}/);
    assert.match(r.body, /cellClassName=\{function \(_row, r, c\) \{ return ""; \}\}/);
    assert.match(
      r.body,
      /actions=\{\[\{ icon: "trash", onClick: \(_row, index\) => remove\(index\), disabled: \(_row, i\) => locked\[i\] \}\]\}/,
    );
  });

  it("reports actions it cannot see into", () => {
    const r = run("Table", "<Table data={d} actions={rowActions} />\n");
    assert.ok(r.warnings.some((w) => w.includes("actions: not an inline array")));
  });

  it("leaves a 3.0 Table, and a Table the file defines, alone", () => {
    assert.equal(
      run("Table", "<Table columns={c} rows={r} />\n").body,
      "<Table columns={c} rows={r} />\n",
    );
    const own = "function Table(p) { return null; }\n<Table data={d} />\n";
    assert.equal(transform(own).out, own);
  });

  it("notes the 2.x table types", () => {
    const { warnings } = transform(
      'import type { TableHeader, TableAction } from "@once-ui-system/core";\n',
    );
    assert.ok(warnings.some((w) => w.startsWith("TableHeader: removed")));
    assert.ok(warnings.some((w) => w.startsWith("TableAction: its onClick")));
  });
});

describe("F6: DataTable → Table", () => {
  it("renames the element, the import and the types, importing Table once", () => {
    const r = run("DataTable, Table", "<DataTable columns={c} rows={r} selectable />\n");
    assert.equal(r.importLine, core("Table").trim());
    assert.equal(r.body, "<Table columns={c} rows={r} selectable />\n");
    const { out } = transform(
      'import { type DataTableColumn, type DataTableSort } from "@once-ui-system/core";\nconst c: DataTableColumn<Row>[] = [];\nlet s: DataTableSort | null;\n',
    );
    assert.match(out, /import \{ type TableColumn, type TableSort \}/);
    assert.match(out, /const c: TableColumn<Row>\[\] = \[\];\nlet s: TableSort \| null;/);
  });
});

describe("F6: the date range pickers fold into `range`", () => {
  it("DateRangePicker → DatePicker range, dual → months={2}", () => {
    const r = run("DateRangePicker", "<DateRangePicker dual value={v} onValueChange={set} />\n");
    assert.equal(r.importLine, core("DatePicker").trim());
    assert.equal(r.body, "<DatePicker range value={v} onValueChange={set} months={2} />\n");
    assert.equal(
      run("DateRangePicker", "<DateRangePicker dual={wide} />\n").body,
      "<DatePicker range months={wide ? 2 : 1} />\n",
    );
    assert.equal(
      run("DateRangePicker", "<DateRangePicker dual={false} />\n").body,
      "<DatePicker range />\n",
    );
  });

  it("DateRangeInput → DateInput range, keeping its labels", () => {
    const r = run("DateRangeInput", '<DateRangeInput id="d" startLabel="From" endLabel="To" />\n');
    assert.equal(r.importLine, core("DateInput").trim());
    assert.equal(r.body, '<DateInput range id="d" startLabel="From" endLabel="To" />\n');
  });

  it("migrates 2.x onChange on the way", () => {
    assert.equal(
      run("DateRangePicker", "<DateRangePicker onChange={set} />\n").body,
      "<DatePicker range onValueChange={set} />\n",
    );
  });
});

describe("F6: RangeSlider → Slider range", () => {
  it("adds range and keeps every prop", () => {
    const r = run(
      "RangeSlider, Slider",
      '<RangeSlider label="Price" defaultValue={[20, 80]} minDistance={5} thumbLabels={["Min", "Max"]} />\n',
    );
    assert.equal(r.importLine, core("Slider").trim());
    assert.equal(
      r.body,
      '<Slider range label="Price" defaultValue={[20, 80]} minDistance={5} thumbLabels={["Min", "Max"]} />\n',
    );
  });
});

describe('F6: PasswordInput → Input type="password"', () => {
  it("sets the type last, as PasswordInput did, and drops a type it overrode", () => {
    assert.equal(
      run("PasswordInput", '<PasswordInput id="p" type="text" {...field} />\n').body,
      '<Input id="p" {...field} type="password" />\n',
    );
  });

  it("reports a suffix, which PasswordInput replaced and Input shows", () => {
    const r = run("PasswordInput", '<PasswordInput id="p" suffix={<Hint />} />\n');
    assert.ok(r.warnings.some((w) => w.startsWith("<PasswordInput> suffix")));
  });
});

describe("F6: KeyTip → Kbd keys", () => {
  it("renames; keys and label carry over", () => {
    const r = run("KeyTip, Kbd", '<KeyTip keys="mod+z" label="Undo" />\n');
    assert.equal(r.importLine, core("Kbd").trim());
    assert.equal(r.body, '<Kbd keys="mod+z" label="Undo" />\n');
  });
});

describe("F6: MasonryGrid → Grid masonry", () => {
  it("adds masonry; columns, gap and breakpoints carry over", () => {
    const r = run(
      "MasonryGrid",
      '<MasonryGrid columns={4} gap="16" s={{ columns: 1 }}>{cards}</MasonryGrid>\n',
    );
    assert.equal(r.importLine, core("Grid").trim());
    assert.equal(r.body, '<Grid masonry columns={4} gap="16" s={{ columns: 1 }}>{cards}</Grid>\n');
  });

  it("reports xl, which MasonryGrid never read as columns", () => {
    const r = run("MasonryGrid", "<MasonryGrid xl={{ columns: 4 }}>x</MasonryGrid>\n");
    assert.ok(r.warnings.some((w) => w.startsWith("<MasonryGrid> xl")));
  });
});

describe("F6: Pulse → StatusIndicator pulse", () => {
  it("adds pulse; 2.x scheme became tone in the tone pass", () => {
    const r = run("Pulse", '<Pulse scheme="danger" size="s" />\n');
    assert.equal(r.importLine, core("StatusIndicator").trim());
    assert.equal(r.body, '<StatusIndicator pulse tone="danger" size="s" />\n');
  });
});

describe('F6: FadingLettersFx → TypeFx mode="fade"', () => {
  it("renames text, animationState and messageIdx", () => {
    const r = run(
      "FadingLettersFx",
      '<FadingLettersFx text="Hello" animationState={state} messageIdx={2} variant="body-default-l" />\n',
    );
    // F8: TypeFx is in @once-ui-system/fx, so the import pass moves it there.
    assert.equal(r.importLine, 'import { TypeFx } from "@once-ui-system/fx";');
    assert.equal(
      r.body,
      '<TypeFx mode="fade" words="Hello" state={state} textVariant="body-default-l" delay={5000} />\n',
    );
    assert.match(
      run(
        "FadingLettersFx",
        '<FadingLettersFx text={t} animationState="entering" messageIdx={i} />\n',
      ).body,
      /delay=\{\(i\) \* 2500\}/,
    );
    assert.doesNotMatch(
      run(
        "FadingLettersFx",
        '<FadingLettersFx text={t} animationState="visible" messageIdx={0} />\n',
      ).body,
      /delay/,
    );
  });
});

describe("F6: SettingAxes and SettingGroup → Setting", () => {
  it("SettingAxes renames, its axes carry over", () => {
    const r = run("Setting, SettingAxes", '<SettingAxes label="Tilt" axes={axes} />\n');
    assert.equal(r.importLine, core("Setting").trim());
    assert.equal(r.body, '<Setting label="Tilt" axes={axes} />\n');
  });

  it("SettingGroup renames; one with neither control nor open stays a closed group", () => {
    assert.equal(
      run(
        "SettingGroup",
        '<SettingGroup label="Sync" control={<Switch />} open={on}>x</SettingGroup>\n',
      ).body,
      '<Setting label="Sync" control={<Switch />} open={on}>x</Setting>\n',
    );
    assert.equal(
      run("SettingGroup", '<SettingGroup label="Sync">x</SettingGroup>\n').body,
      '<Setting label="Sync" open={false}>x</Setting>\n',
    );
  });

  it("renames the prop types", () => {
    const { out } = transform(
      'import type { SettingAxesProps, SettingGroupProps } from "@once-ui-system/core";\n',
    );
    assert.match(out, /import type \{ SettingProps \}/);
  });
});

describe('F6: MobileMegaMenu → MegaMenu collapseBelow="always"', () => {
  it("renames and keeps onClose", () => {
    const r = run(
      "MegaMenu, MobileMegaMenu",
      "<MobileMegaMenu menuGroups={groups} onClose={close} />\n",
    );
    assert.equal(r.importLine, core("MegaMenu").trim());
    assert.equal(
      r.body,
      '<MegaMenu collapseBelow="always" menuGroups={groups} onClose={close} />\n',
    );
  });
});

describe("F6: an old name used as a value", () => {
  it("is reported", () => {
    const r = run("KeyTip", "const Hint = KeyTip;\n");
    assert.ok(r.warnings.some((w) => w.startsWith("KeyTip: still referenced")));
  });
});

describe("F6: an old name in a component map, a comment or text", () => {
  it("keeps a shorthand key's tag name, on the survivor", () => {
    const r = run("ScrollContainer, DropdownWrapper, UserMenu, Text", "export const components = { ScrollContainer, DropdownWrapper, UserMenu, Text };\n");
    assert.equal(r.importLine, core("Scroller, Dropdown, User, Text").trim());
    assert.equal(
      r.body,
      "export const components = { ScrollContainer: Scroller, DropdownWrapper: Dropdown, UserMenu: User, Text };\n",
    );
    assert.deepEqual(r.warnings, []);
  });

  it("keeps the layout of a multi-line map", () => {
    const r = run("ScrollContainer, Text", "const components = {\n  Text,\n  ScrollContainer,\n};\n");
    assert.equal(r.body, "const components = {\n  Text,\n  ScrollContainer: Scroller,\n};\n");
  });

  it("reports, and leaves alone, a destructuring pattern, a JSX value and an export list", () => {
    for (const body of [
      "const { ScrollContainer } = registry;\n",
      "<Slot as={ScrollContainer} />;\n",
      "const C = cond ? ScrollContainer : Text;\n",
      "export { ScrollContainer };\n",
    ]) {
      const r = run("ScrollContainer, Text", body);
      assert.equal(r.body, body);
      assert.ok(r.warnings.some((w) => /ScrollContainer: still referenced/.test(w)), body);
    }
  });

  it("stays quiet about a comment, a string or JSX text", () => {
    const r = run(
      "ScrollContainer",
      '// was a ScrollContainer\n/* ScrollContainer */\nconst a = "ScrollContainer";\nconst b = <p>Like a ScrollContainer, it\'s a rail</p>;\nconst c = <code>&lt;ScrollContainer /&gt;</code>;\n<ScrollContainer items={x} />;\n',
    );
    assert.deepEqual(r.warnings.filter((w) => /ScrollContainer:/.test(w)), []);
  });
});
