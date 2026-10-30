import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Sparkline } from "../modules/data/Sparkline";
import { expectNoAxeViolations } from "../test/axe";

/**
 * Sparkline: a tiny trend line, pure SVG, one image to a screen reader. It
 * renders on the server, so the markup itself is what is pinned here.
 */
const values = [120, 180, 160, 240, 360, 340];

describe("Sparkline", () => {
  it("renders on the server: an image of a stretched SVG with a non-scaling line", () => {
    const html = renderToStaticMarkup(<Sparkline data={values} />);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Trend from 120 to 340, high 360"');
    expect(html).toContain('preserveAspectRatio="none"');
    expect(html).toContain('vector-effect="non-scaling-stroke"');
    expect(html).toContain("width:100%");
    expect(html).toContain("height:32px");
  });

  it("names the low point when it is below both ends", () => {
    render(<Sparkline data={[5, 1, 8]} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe(
      "Trend from 5 to 8, high 8, low 1",
    );
  });

  it("writes the summary in valueFormat and locale, and takes an aria-label over it", () => {
    const { unmount } = render(
      <Sparkline
        data={[120000, 340000]}
        locale="hu-HU"
        valueFormat={{ style: "currency", currency: "HUF", maximumFractionDigits: 0 }}
      />,
    );
    expect(screen.getByRole("img").getAttribute("aria-label")?.replace(/\s/g, " ")).toBe(
      "Trend from 120 000 Ft to 340 000 Ft, high 340 000 Ft",
    );
    unmount();
    render(<Sparkline data={values} aria-label="Signups this week" />);
    expect(screen.getByRole("img", { name: "Signups this week" })).toBeTruthy();
  });

  it("reads rows by valueKey, or by their first number", () => {
    const rows = [
      { day: "Mon", visits: 3 },
      { day: "Tue", visits: 9 },
    ];
    const { unmount } = render(<Sparkline data={rows} valueKey="visits" />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("Trend from 3 to 9, high 9");
    unmount();
    render(<Sparkline data={rows} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("Trend from 3 to 9, high 9");
  });

  it("draws a line through every point, top for the highest", () => {
    const { container } = render(<Sparkline data={[0, 10, 5]} curve="linear" />);
    expect(container.querySelector("path")?.getAttribute("d")).toBe("M0,100L50,0L100,50");
  });

  it("draws each curve", () => {
    const d = (curve: "natural" | "monotone" | "step") =>
      render(<Sparkline data={[0, 10, 5, 8]} curve={curve} />)
        .container.querySelector("path")
        ?.getAttribute("d");
    expect(d("step")).toBe("M0,100H16.67V0H33.33H50V50H66.67H83.33V20H100");
    expect(d("monotone")).toMatch(/^M0,100C/);
    expect(d("natural")).toMatch(/^M0,100C/);
  });

  it("fills an area under the line", () => {
    const { container } = render(<Sparkline data={values} variant="area" />);
    const paths = container.querySelectorAll("path");
    expect(paths).toHaveLength(2);
    expect(paths[0].getAttribute("d")).toMatch(/L100,100L0,100Z$/);
    expect(paths[0].getAttribute("fill")).toMatch(/^url\(#sparkline-/);
    expect(container.querySelector("linearGradient")).toBeTruthy();
  });

  it("draws bars from zero, and marks the last one with showLast", () => {
    const { container } = render(<Sparkline data={[2, 4, -2]} variant="bar" showLast />);
    const bars = [...container.querySelectorAll("rect")];
    expect(bars).toHaveLength(3);
    // The domain is -2 to 4: zero sits a third of the way up.
    expect(bars.map((b) => [b.getAttribute("y"), b.getAttribute("height")])).toEqual([
      ["33.33", "33.33"],
      ["0", "66.67"],
      ["66.67", "33.33"],
    ]);
    expect(bars.map((b) => b.getAttribute("fill-opacity"))).toEqual(["0.4", "0.4", "1"]);
  });

  it("puts a dot on the last point with showLast", () => {
    const { container } = render(<Sparkline data={[0, 10]} showLast />);
    const dot = container.querySelector("span > span") as HTMLElement;
    expect(dot.style.left).toBe("100%");
    expect(dot.style.top).toBe("0%");
  });

  it("takes min and max for the edges", () => {
    const { container } = render(<Sparkline data={[5, 5]} min={0} max={10} curve="linear" />);
    expect(container.querySelector("path")?.getAttribute("d")).toBe("M0,50L100,50");
  });

  it("sizes in px from a number, and passes a CSS length through", () => {
    const { container } = render(<Sparkline data={values} width={120} height="2rem" />);
    const box = container.firstElementChild as HTMLElement;
    expect(box.style.width).toBe("120px");
    expect(box.style.height).toBe("2rem");
  });

  it("paints with a chart colour token", () => {
    const { container } = render(<Sparkline data={values} color="emerald" />);
    expect(container.querySelector("path")?.getAttribute("stroke")).toBe("var(--data-emerald)");
  });

  it("is still an image, saying so, without data", () => {
    render(<Sparkline data={[]} />);
    expect(screen.getByRole("img", { name: "No data" })).toBeTruthy();
  });

  it("has no axe violations, alone and in a table cell", async () => {
    const { container } = render(
      <table>
        <tbody>
          <tr>
            <th scope="row">Visits</th>
            <td>
              <Sparkline data={values} variant="area" showLast width={80} height={20} />
            </td>
          </tr>
        </tbody>
      </table>,
    );
    await expectNoAxeViolations(container);
  });
});
