import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Form } from "../components/Form";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";

/**
 * Form derives each cell's corners from where it actually lands in the grid,
 * rather than from the caller counting positions by hand.
 *
 * The cases below are the ones hand-assigned `corners="top" | "none" |
 * "bottom"` gets wrong: a child that conditionally disappears, a child that
 * spans, a last row that does not fill, and a column count that changes with
 * the viewport. Each is written so it fails against a stack that writes its
 * corners positionally, not just so it passes against this one.
 */

/**
 * CSS-module class names arrive scoped, and the two bundlers in play here
 * scope them differently: `_corner-tl_355e5b` under Vite, and
 * `Form-module-scss-module__freG9a__corner-tl` under Turbopack. Treat `_` and
 * whitespace as boundaries on both sides but never `-`, so `corner-tl` matches
 * either form and still does not match the breakpoint-scoped `xs-corner-tl`.
 */
const has = (el: Element | null, name: string) => {
  if (!el) return false;
  return new RegExp(`(?:^|[\\s_])${name}(?=_|\\s|$)`).test(el.className.toString());
};

const cells = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-testid^="form-cell-"]'));

/** The four corners a cell rounds, as a stable string for comparison. */
const corners = (el: Element) =>
  (["tl", "tr", "bl", "br"] as const).filter((c) => has(el, `corner-${c}`)).join(",");

describe("Form — stacked in one dimension", () => {
  it("rounds only the outside of the group", () => {
    const { container } = render(
      <Form density="stacked">
        <Input id="a" />
        <Input id="b" />
        <Input id="c" />
      </Form>,
    );

    const [first, middle, last] = cells(container);
    expect(corners(first)).toBe("tl,tr");
    expect(corners(middle)).toBe("");
    expect(corners(last)).toBe("bl,br");
  });

  it("collapses every border but the first", () => {
    const { container } = render(
      <Form density="stacked">
        <Input id="a" />
        <Input id="b" />
        <Input id="c" />
      </Form>,
    );

    const [first, middle, last] = cells(container);
    expect(has(first, "fuse-top")).toBe(false);
    expect(has(middle, "fuse-top")).toBe(true);
    expect(has(last, "fuse-top")).toBe(true);
  });

  it("moves the bottom corners when a trailing field stops rendering", () => {
    // The motivating bug. A stack that assigns `corners="bottom"` to the
    // fourth child leaves the group ending square the moment that child is
    // gone; here the third child has to pick the corners up.
    const stack = (showLast: boolean) => (
      <Form density="stacked">
        <Input id="a" />
        <Input id="b" />
        <Input id="c" />
        {showLast && <Input id="d" />}
      </Form>
    );

    const { container, rerender } = render(stack(true));
    expect(cells(container)).toHaveLength(4);
    expect(corners(cells(container)[2])).toBe("");
    expect(corners(cells(container)[3])).toBe("bl,br");

    rerender(stack(false));
    expect(cells(container)).toHaveLength(3);
    expect(corners(cells(container)[2])).toBe("bl,br");
  });

  it("gives a lone child all four corners", () => {
    const { container } = render(
      <Form density="stacked">
        <Input id="only" />
      </Form>,
    );
    expect(corners(cells(container)[0])).toBe("tl,tr,bl,br");
    expect(has(cells(container)[0], "fuse-top")).toBe(false);
  });

  it("renders nothing rather than throwing when every child is conditional", () => {
    const { container } = render(
      <Form density="stacked">
        {false}
        {null}
      </Form>,
    );
    expect(cells(container)).toHaveLength(0);
  });
});

describe("Form — stacked in two dimensions", () => {
  it("places corners around a grid with spanning children", () => {
    const { container } = render(
      <Form density="stacked" columns={2}>
        <Input id="first" />
        <Input id="last" />
        <Input id="email" span={2} />
        <Textarea id="note" span={2} />
      </Form>,
    );

    const c = cells(container);
    expect(corners(c[0])).toBe("tl");
    expect(corners(c[1])).toBe("tr");
    expect(corners(c[2])).toBe("");
    expect(corners(c[3])).toBe("bl,br");

    // The second column collapses leftward; the spanning rows collapse upward.
    expect(has(c[1], "fuse-left")).toBe(true);
    expect(has(c[2], "fuse-left")).toBe(false);
    expect(has(c[2], "fuse-top")).toBe(true);
  });

  it("rounds the bottom-right of a cell left exposed by a ragged last row", () => {
    // Three cells in two columns. The group is L-shaped, so the second cell's
    // bottom edge is on the outside even though it is not the last child —
    // something no positional rule expresses.
    const { container } = render(
      <Form density="stacked" columns={2}>
        <Input id="a" />
        <Input id="b" />
        <Input id="c" />
      </Form>,
    );

    const c = cells(container);
    expect(corners(c[0])).toBe("tl");
    expect(corners(c[1])).toBe("tr,br");
    expect(corners(c[2])).toBe("bl,br");
  });

  it("clamps a span to the column count", () => {
    const { container } = render(
      <Form density="stacked" columns={2}>
        <Input id="a" span={5} />
        <Input id="b" />
      </Form>,
    );

    const c = cells(container);
    expect(has(c[0], "span-2")).toBe(true);
    expect(has(c[0], "span-5")).toBe(false);
    // Clamped to the full width, so it owns both top corners on its own.
    expect(corners(c[0])).toBe("tl,tr");
  });

  it("treats a zero or negative span as one column", () => {
    const { container } = render(
      <Form density="stacked" columns={2}>
        <Input id="a" span={0} />
        <Input id="b" span={-3} />
      </Form>,
    );

    const c = cells(container);
    expect(has(c[0], "span-2")).toBe(false);
    expect(corners(c[0])).toBe("tl,bl");
    expect(corners(c[1])).toBe("tr,br");
  });
});

describe("Form — responsive columns", () => {
  it("states the whole placement per breakpoint and none at the base", () => {
    // Corners computed once cannot follow a column count that changes with the
    // viewport, so the answer is emitted per breakpoint and the base is left
    // empty rather than leaving a wider layout's classes for a narrower query
    // to undo.
    const { container } = render(
      <Form density="stacked" columns={{ xs: 1, m: 2 }}>
        <Input id="a" />
        <Input id="b" />
        <Input id="c" span={2} />
      </Form>,
    );

    const c = cells(container);
    expect(corners(c[0])).toBe("");
    expect(has(c[0], "fuse-top")).toBe(false);
    expect(has(c[0], "fuse-left")).toBe(false);

    for (const bp of ["xl", "l", "m", "s", "xs"]) {
      expect(has(c[0], `${bp}-reset`)).toBe(true);
    }
  });

  it("gives a cell different corners at different breakpoints", () => {
    const { container } = render(
      <Form density="stacked" columns={{ xs: 1, m: 2 }}>
        <Input id="a" />
        <Input id="b" />
        <Input id="c" span={2} />
      </Form>,
    );

    const second = cells(container)[1];

    // Two columns: second cell sits top-right, collapsing leftward.
    expect(has(second, "m-corner-tr")).toBe(true);
    expect(has(second, "m-fuse-left")).toBe(true);
    expect(has(second, "m-fuse-top")).toBe(false);

    // One column: it is the middle of a stack — no corners, collapsing upward.
    expect(has(second, "xs-corner-tr")).toBe(false);
    expect(has(second, "xs-fuse-left")).toBe(false);
    expect(has(second, "xs-fuse-top")).toBe(true);
  });

  it("drops a span that no longer fits the narrow column count", () => {
    const { container } = render(
      <Form density="stacked" columns={{ xs: 1, m: 2 }}>
        <Input id="a" />
        <Input id="b" />
        <Input id="c" span={2} />
      </Form>,
    );

    const third = cells(container)[2];
    expect(has(third, "m-span-2")).toBe(true);
    expect(has(third, "xs-span-2")).toBe(false);
  });
});

describe("Form — the other densities", () => {
  it.each(["tight", "spacious"] as const)("%s fuses nothing", (density) => {
    const { container } = render(
      <Form density={density}>
        <Input id="a" />
        <Input id="b" />
      </Form>,
    );

    for (const cell of cells(container)) {
      expect(corners(cell)).toBe("");
      expect(has(cell, "fuse-top")).toBe(false);
      expect(has(cell, "fuse-left")).toBe(false);
    }
  });

  it("still lays spans out when not stacked", () => {
    const { container } = render(
      <Form density="tight" columns={2}>
        <Input id="a" span={2} />
      </Form>,
    );
    expect(has(cells(container)[0], "span-2")).toBe(true);
  });
});

describe("Form — the span prop", () => {
  it("never reaches the DOM", () => {
    // `span` is a layout instruction addressed to Form. Left on the child it
    // would be spread onto the <input> as an invalid attribute.
    const { container } = render(
      <Form density="stacked" columns={2}>
        <Input id="a" span={2} />
      </Form>,
    );

    const input = container.querySelector("input");
    expect(input).not.toBeNull();
    expect(input?.hasAttribute("span")).toBe(false);
  });

  it("is dropped by the field on its own, outside a Form", () => {
    const { container } = render(<Input id="solo" span={2} />);
    expect(container.querySelector("input")?.hasAttribute("span")).toBe(false);
  });
});

describe("Form — the surface hook the corners rely on", () => {
  it("is present on both field primitives", () => {
    // Form reaches the bordered box through `[data-surface]` because the box
    // is two levels below the cell, not one. Losing the hook would silently
    // stop every corner rule in Form.module.scss from matching.
    const input = render(<Input id="a" />);
    expect(input.container.querySelector("[data-surface]")).not.toBeNull();

    const textarea = render(<Textarea id="b" />);
    expect(textarea.container.querySelector("[data-surface]")).not.toBeNull();
  });
});

describe("Form — size", () => {
  const sizeClass = (el: Element | null) =>
    (["xs", "s", "m", "l", "xl"] as const).filter((s) => has(el, s)).join(",");

  it("sets the size for every field in the group", () => {
    const { container } = render(
      <Form density="stacked" size="s">
        <Input id="a" />
        <Textarea id="b" />
      </Form>,
    );

    const surfaces = container.querySelectorAll("[data-surface]");
    expect(surfaces).toHaveLength(2);
    for (const surface of surfaces) {
      expect(sizeClass(surface)).toBe("s");
    }
  });

  it("lets a field keep a size it sets itself", () => {
    const { container } = render(
      <Form density="stacked" size="s">
        <Input id="a" />
        <Input id="b" size="xl" />
      </Form>,
    );

    const [first, second] = container.querySelectorAll("[data-surface]");
    expect(sizeClass(first)).toBe("s");
    expect(sizeClass(second)).toBe("xl");
  });

  it("still defaults to m outside a Form", () => {
    const { container } = render(<Input id="solo" />);
    expect(sizeClass(container.querySelector("[data-surface]"))).toBe("m");
  });

  it("does not leak size onto the cell wrapper as an attribute", () => {
    const { container } = render(
      <Form density="stacked" size="s">
        <Input id="a" />
      </Form>,
    );
    expect(container.querySelector('[data-testid="form-cell-0"]')?.hasAttribute("size")).toBe(
      false,
    );
  });
});
