/**
 * Regression tests for the 2.x → 3.0 codemod: components that merged
 * (MIGRATING.md § "2.x → 3.0", 10; F1, F2, F4, F5).
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { transform } from "./codemod-3.0.mjs";
import { elementEnd } from "./codemod-3.0-merges.mjs";

const core = (names) => `import { ${names} } from "@once-ui-system/core";\n`;

/** Migrate `body` with `names` imported from core; the output's body, and the import line. */
const run = (names, body) => {
  const { out, hits, warnings } = transform(core(names) + body);
  const [importLine, ...rest] = out.split("\n");
  // Idempotent: a second run changes nothing.
  assert.equal(transform(out).out, out, "a second run changes nothing");
  return { importLine, body: rest.join("\n"), hits, warnings };
};

describe("the JSX scanner", () => {
  it("finds the end of an element past apostrophes, nesting and expressions", () => {
    const src = `<A x={<B>Don't</B>}><A>inner</A>{cond && <C>it's > 1</C>}</A> tail`;
    assert.equal(src.slice(elementEnd(src, 0)), " tail");
  });
});

describe('F1: Modal → Dialog variant="sheet"', () => {
  it("renames the element and the import, keeping title, open, onClose and backdrop", () => {
    const r = run(
      "Modal",
      `<Modal title="Edit" open={open} onClose={close} backdrop={<Bg />}>\n  <Text>Don't</Text>\n</Modal>\n`,
    );
    assert.equal(r.importLine, core("Dialog").trim());
    assert.equal(
      r.body,
      `<Dialog variant="sheet" title="Edit" open={open} onClose={close} backdrop={<Bg />}>\n  <Text>Don't</Text>\n</Dialog>\n`,
    );
  });

  it("does not import Dialog twice", () => {
    const r = run("Dialog, Modal", '<Modal title="a" open onClose={f}>x</Modal>\n');
    assert.equal(r.importLine, core("Dialog").trim());
  });

  it("keeps an alias", () => {
    const { out } = transform(
      'import { Modal as Sheet } from "@once-ui-system/core";\n<Sheet title="a" open onClose={f}>x</Sheet>\n',
    );
    assert.match(out, /import \{ Dialog as Sheet \}/);
    assert.match(out, /<Sheet variant="sheet" title="a"/);
  });

  it("reports a use that is not an element", () => {
    const r = run("Modal", "const C = Modal;\n");
    assert.ok(r.warnings.some((w) => w.startsWith("Modal: still referenced")));
  });
});

describe('F2: Swiper → Carousel mode="snap"', () => {
  it("keeps items and options, and maps the boolean indicator", () => {
    assert.equal(
      run("Swiper", "<Swiper items={items} />\n").body,
      '<Carousel mode="snap" items={items} />\n',
    );
    assert.equal(
      run("Swiper", "<Swiper items={a} indicator />\n").body,
      '<Carousel mode="snap" items={a} />\n',
    );
    assert.equal(
      run("Swiper", "<Swiper items={a} indicator={false} />\n").body,
      '<Carousel mode="snap" items={a} indicator={false} />\n',
    );
    assert.equal(
      run("Swiper", "<Swiper items={a} indicator={dots} />\n").body,
      '<Carousel mode="snap" items={a} indicator={dots ? "line" : false} />\n',
    );
  });
});

describe("F2: ScrollContainer → Scroller track mode", () => {
  it("makes items the children and tile props a tile object", () => {
    const r = run(
      "ScrollContainer",
      '<ScrollContainer aspectRatio="16/9" infinite markers="bottom" items={[<A key="a" />, <B>x, y</B>]} />\n',
    );
    assert.equal(r.importLine, core("Scroller").trim());
    assert.equal(
      r.body,
      '<Scroller infinite markers="bottom" tile={{ aspectRatio: "16/9" }}><A key="a" /><B>x, y</B></Scroller>\n',
    );
  });

  it("keeps an expression as one child, and stays a track with no option set", () => {
    assert.equal(
      run("ScrollContainer", "<ScrollContainer items={list} />\n").body,
      "<Scroller draggable>{list}</Scroller>\n",
    );
    assert.equal(
      run("ScrollContainer", "<ScrollContainer items={items.map((i) => <Tile key={i} />)} />\n")
        .body,
      "<Scroller draggable>{items.map((i) => <Tile key={i} />)}</Scroller>\n",
    );
  });

  it("moves tile numbers after converting them to rem", () => {
    assert.equal(
      run("ScrollContainer", "<ScrollContainer minWidth={20} items={a} />\n").body,
      '<Scroller tile={{ minWidth: "20rem" }}>{a}</Scroller>\n',
    );
  });

  it("moves a same-file const spread into tile, its track options onto Scroller, its numbers to rem", () => {
    const src =
      'const TILE = {\n  radius: "none",\n  proximity: 0.3,\n  minWidth: 20,\n  l: { maxWidth: 30, width: "100%" },\n} as const;\n' +
      "<ScrollContainer\n  infinite\n  {...TILE}\n  maxWidth={w}\n  items={list.map((x) => <A key={x} />)}\n/>\n";
    const r = run("ScrollContainer", src);
    assert.equal(
      r.body,
      'const TILE = {\n  radius: "none",\n  minWidth: "20rem",\n  l: { maxWidth: "30rem", width: "100%" },\n} as const;\n' +
        "<Scroller\n  infinite\n  proximity={0.3}\n  tile={{ ...TILE, maxWidth: w }}\n>\n  {list.map((x) => <A key={x} />)}\n</Scroller>\n",
    );
    assert.ok(!r.warnings.some((w) => /\{\.\.\.TILE\}/.test(w)));
  });

  it("keeps a lone const as the tile, and reports a const used elsewhere too", () => {
    const one = run("ScrollContainer", 'const T = { radius: "none" };\n<ScrollContainer {...T} items={a} />\n');
    assert.equal(one.body, 'const T = { radius: "none" };\n<Scroller tile={T}>{a}</Scroller>\n');
    const two = run(
      "ScrollContainer",
      'const T = { radius: "none" };\n<ScrollContainer {...T} items={a} />\n<Row {...T} />\n',
    );
    assert.match(two.body, /<Scroller \{\.\.\.T\} draggable>/);
    assert.ok(two.warnings.some((w) => /\{\.\.\.T\}: ScrollContainer gave its rest props/.test(w)));
  });

  it("reports a spread, whose props went to every tile", () => {
    const r = run("ScrollContainer", "<ScrollContainer {...rest} items={a} />\n");
    assert.ok(r.warnings.some((w) => /tile=\{\{/.test(w)));
  });
});

describe("F2: AutoScroll → Scroller auto", () => {
  it("collects speed, hover, reverse and scrollGap into auto", () => {
    const r = run(
      "AutoScroll",
      '<AutoScroll fillWidth speed="slow" hover="pause" reverse scrollGap={24}>\n  <Logo />\n</AutoScroll>\n',
    );
    assert.equal(
      r.body,
      '<Scroller auto={{ speed: "slow", hover: "pause", reverse: true, gap: 24 }} fillWidth>\n  <Logo />\n</Scroller>\n',
    );
  });

  it("writes a bare auto with no options", () => {
    assert.equal(
      run("AutoScroll", "<AutoScroll>{logos}</AutoScroll>\n").body,
      "<Scroller auto>{logos}</Scroller>\n",
    );
  });
});

describe("F4: InfoTip → Tooltip content", () => {
  it("moves the children into content and closes the tag", () => {
    assert.equal(
      run("InfoTip", "<InfoTip>Shown on invoices.</InfoTip>\n").body,
      '<Tooltip content="Shown on invoices." />\n',
    );
    assert.equal(
      run("InfoTip", '<InfoTip size="s">{text}</InfoTip>\n').body,
      '<Tooltip size="s" content={text} />\n',
    );
    assert.equal(
      run("InfoTip", "<InfoTip>See <b>this</b></InfoTip>\n").body,
      "<Tooltip content={<>See <b>this</b></>} />\n",
    );
  });
});

describe("F4: Hover and CursorCard → HoverCard", () => {
  it("Hover: placement cover, overlay as children, delays kept", () => {
    assert.equal(
      run(
        "Hover",
        "<Hover trigger={<Card />} overlay={<Row>Over</Row>} delay={200} hideDelay={100} />\n",
      ).body,
      '<HoverCard placement="cover" trigger={<Card />} delay={200} hideDelay={100}><Row>Over</Row></HoverCard>\n',
    );
  });

  it("CursorCard: placement cursor, its own placement as cursorPlacement", () => {
    const r = run(
      "CursorCard",
      '<CursorCard trigger={<A />} overlay={card} placement="top-right" />\n',
    );
    assert.equal(r.importLine, core("HoverCard").trim());
    assert.equal(
      r.body,
      '<HoverCard placement="cursor" trigger={<A />} cursorPlacement="top-right">{card}</HoverCard>\n',
    );
  });

  it("imports HoverCard once for both", () => {
    assert.equal(run("Hover, CursorCard, HoverCard", "").importLine, core("HoverCard").trim());
  });
});

describe("F5: Dropdown, ContextMenu, EmojiPickerDropdown, UserMenu", () => {
  it("DropdownWrapper: dropdown becomes the children, a fragment unwrapped", () => {
    const r = run(
      "DropdownWrapper",
      '<DropdownWrapper trigger={<Button>Sort</Button>} dropdown={<><Option value="a" label="A" /></>} />\n',
    );
    assert.equal(r.importLine, core("Dropdown").trim());
    assert.equal(
      r.body,
      '<Dropdown trigger={<Button>Sort</Button>}><Option value="a" label="A" /></Dropdown>\n',
    );
  });

  it("DropdownWrapper: its rem minWidth is converted first", () => {
    assert.equal(
      run("DropdownWrapper", "<DropdownWrapper minWidth={12} trigger={t} dropdown={menu} />\n")
        .body,
      '<Dropdown minWidth="12rem" trigger={t}>{menu}</Dropdown>\n',
    );
  });

  it("ContextMenu: children become the trigger, dropdown the children", () => {
    const r = run(
      "ContextMenu",
      '<ContextMenu dropdown={menu} placement="bottom-start">\n  <Card>Right-click</Card>\n</ContextMenu>\n',
    );
    assert.equal(
      r.body,
      '<Dropdown openOn="contextmenu" trigger={<Card>Right-click</Card>} placement="bottom-start">\n  {menu}\n</Dropdown>\n',
    );
  });

  it("reports a 2.x Dropdown panel, whose name changed meaning", () => {
    const r = run("Dropdown", '<Dropdown><Option value="a" /></Dropdown>\n');
    assert.ok(r.warnings.some((w) => /without trigger/.test(w)));
  });

  it("EmojiPickerDropdown: EmojiPicker with a trigger, Dropdown props in dropdownProps", () => {
    const r = run(
      "EmojiPickerDropdown",
      '<EmojiPickerDropdown trigger={<IconButton icon="smiley" />} onSelect={add} columns="6" minWidth="20rem" />\n',
    );
    // F9: the import pass then moves EmojiPicker to its own subpath.
    assert.equal(r.importLine, 'import { EmojiPicker } from "@once-ui-system/core/emoji";');
    assert.equal(
      r.body,
      '<EmojiPicker trigger={<IconButton icon="smiley" />} onSelect={add} columns="6" dropdownProps={{ minWidth: "20rem" }} />\n',
    );
  });

  it("UserMenu: User with its dropdown, which stays a trigger without one", () => {
    assert.equal(
      run("UserMenu", '<UserMenu name="A" dropdown={<Menu />} />\n').body,
      '<User name="A" dropdown={<Menu />} />\n',
    );
    assert.equal(
      run("UserMenu", '<UserMenu name="B" />\n').body,
      '<User name="B" dropdown={null} />\n',
    );
  });

  it("renames the prop types", () => {
    const { out } = transform(
      'import type { DropdownWrapperProps, ModalProps, HoverProps } from "@once-ui-system/core";\n',
    );
    assert.equal(
      out,
      'import type { DropdownProps, DialogProps, HoverCardProps } from "@once-ui-system/core";\n',
    );
  });
});

describe("MDX, where components arrive by name", () => {
  it("migrates the elements without an import", () => {
    const { out } = transform("<Swiper items={a} />\n\n<InfoTip>Why</InfoTip>\n");
    assert.equal(out, '<Carousel mode="snap" items={a} />\n\n<Tooltip content="Why" />\n');
  });

  it("leaves an app's own component of the same name alone", () => {
    const src = 'import { Modal } from "./Modal";\n<Modal title="x" />\n';
    assert.equal(transform(src).out, src);
  });
});
