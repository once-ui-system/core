import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ServerFlex } from "../components/ServerFlex";
import { ServerGrid } from "../components/ServerGrid";

/**
 * `.s-flex-show` is display: none outside its media query, so it reads "show
 * only from s down". `s={{ hide: selected }}` emitted it whenever `selected`
 * was false, which hid the element on desktop: a list/detail page rendered
 * empty at 1440px in the token dry run. The show class now appears only where
 * a wider breakpoint hides the element.
 */
const classesOf = (html: string) => {
  const at = html.indexOf('class="') + 7;
  return html.slice(at, html.indexOf('"', at)).split(" ");
};

describe("breakpoint show classes", () => {
  it("adds no show class when nothing wider hides the element", () => {
    const flex = classesOf(renderToStaticMarkup(<ServerFlex s={{ hide: false }}>x</ServerFlex>));
    const grid = classesOf(renderToStaticMarkup(<ServerGrid m={{ hide: false }}>x</ServerGrid>));
    expect(flex.filter((c) => c.endsWith("-show"))).toEqual([]);
    expect(grid.filter((c) => c.endsWith("-show"))).toEqual([]);
  });

  it("keeps the documented hide-on-desktop pattern", () => {
    const flex = classesOf(
      renderToStaticMarkup(
        <ServerFlex hide s={{ hide: false }}>
          x
        </ServerFlex>,
      ),
    );
    expect(flex).toEqual(expect.arrayContaining(["flex-hide", "s-flex-show", "xs-flex-show"]));
    const fromL = classesOf(
      renderToStaticMarkup(<ServerFlex l={{ hide: true }} s={{ hide: false }} />),
    );
    expect(fromL).toEqual(expect.arrayContaining(["l-flex-hide", "m-flex-hide", "s-flex-show"]));
    expect(fromL).not.toContain("l-flex-show");
  });
});
