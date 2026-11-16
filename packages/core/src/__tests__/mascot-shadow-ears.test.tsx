import { render as baseRender } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { Mascot } from "../modules/ai/Mascot";
import { measureOutline } from "../modules/ai/mascotOutline";
import { accessoryBody, bodyShape } from "../modules/ai/mascotShape";

const wrapper = ({ children }: { children: ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);
const render = (ui: ReactElement) => baseRender(ui, { wrapper });

/* A tall rounded rectangle: the kind of drawn body where ears used to float. */
const TALL = "M94 40H106Q152 40 152 86V126Q152 172 106 172H94Q48 172 48 126V86Q48 40 94 40Z";

describe("Mascot shadow", () => {
  it("draws the floor shadow by default and hides it with shadow={false}", () => {
    const { container, rerender } = render(<Mascot />);
    expect(container.querySelectorAll("svg > ellipse")).toHaveLength(1);
    rerender(<Mascot shadow={false} />);
    expect(container.querySelectorAll("svg > ellipse")).toHaveLength(0);
  });
});

describe("measureOutline", () => {
  it("finds the real top edge of a drawn body", () => {
    const m = measureOutline(TALL);
    expect(m).toBeDefined();
    expect(m?.top).toBeCloseTo(40, 0);
    expect(m?.left).toBeCloseTo(48, 0);
    expect(m?.right).toBeCloseTo(152, 0);
    expect(m?.topAt(100)).toBeCloseTo(40, 0);
    // Down the rounded corner: lower than the flat top.
    expect(m?.topAt(60) ?? 0).toBeGreaterThan(50);
    expect(m?.topAt(30)).toBeUndefined();
    const span = m?.spanAt(100);
    expect(span?.[0]).toBeCloseTo(48, 0);
    expect(span?.[1]).toBeCloseTo(152, 0);
  });

  it("reads arcs, relative commands and smooth curves", () => {
    const circle = measureOutline("M34 100a66 66 0 1 0 132 0a66 66 0 1 0 -132 0Z");
    expect(circle?.top).toBeCloseTo(34, 0);
    expect(circle?.bottom).toBeCloseTo(166, 0);
    expect(circle?.topAt(100)).toBeCloseTo(34, 0);
    const smooth = measureOutline("M40 100C40 40 160 40 160 100S40 160 40 100Z");
    expect(smooth?.top ?? 0).toBeLessThan(60);
    expect(measureOutline("not a path")).toBeUndefined();
  });

  it("describes the generated body exactly as before", () => {
    const shape = bodyShape(0.7, 1);
    const body = accessoryBody(shape, undefined, 0.7);
    expect(body.outline).toBeUndefined();
    expect(body.cy).toBe(104);
    expect(body.a).toBe(shape.halfWidth);
  });
});

describe("Mascot cat ears", () => {
  it("roots each ear below the body's edge on a drawn body", () => {
    const { container } = render(<Mascot bodyPath={TALL} accessory="catEars" />);
    const m = measureOutline(TALL);
    const ears = [...container.querySelectorAll("g[transform^='rotate'] > path:first-child")];
    expect(ears).toHaveLength(2);
    for (const ear of ears) {
      const d = ear.getAttribute("d") ?? "";
      const nums = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
      // M x root L x y …: the root is lower than the outline under that corner.
      const [x, root] = nums;
      expect(root).toBeGreaterThan(m?.topAt(x) ?? 0);
    }
  });
});
