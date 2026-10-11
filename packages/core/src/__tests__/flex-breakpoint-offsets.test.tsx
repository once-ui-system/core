import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Flex } from "../components/Flex";
import { Grid } from "../components/Grid";
import { ServerFlex } from "../components/ServerFlex";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * `top`, `right`, `bottom` and `left` are in every Flex breakpoint object, and
 * foundations generates `.<bp>-top-<step>` and its siblings at every
 * breakpoint, but ServerFlex never wrote them (ServerGrid did). A token offset
 * kept the Flex on the server and then did nothing; a rem number or a CSS unit
 * did nothing on either path. Tokens are classes now, on the server; a number
 * or a CSS unit is inline, on the client, as numeric spacing is.
 *
 * `renderToStaticMarkup` without a provider is the test for "on the server":
 * the client path throws there.
 */
const POSITION = readFileSync(
  join(__dirname, "../../../foundations/scss/styles/position.generated.scss"),
  "utf8",
);

const classesOf = (html: string) => {
  const at = html.indexOf('class="') + 7;
  return html.slice(at, html.indexOf('"', at)).split(" ").filter(Boolean);
};

const onServer = (el: React.ReactElement) => {
  try {
    renderToStaticMarkup(el);
    return true;
  } catch (error) {
    expect(String(error)).toMatch(/LayoutProvider/);
    return false;
  }
};

describe("Flex breakpoint offsets", () => {
  it("writes a token offset as a breakpoint class, on the server", () => {
    const classes = classesOf(
      renderToStaticMarkup(
        <Flex position="absolute" m={{ top: "16", left: "0" }} s={{ top: "72", right: "8" }}>
          x
        </Flex>,
      ),
    );
    for (const cls of ["m-top-16", "m-left-0", "s-top-72", "s-right-8"]) {
      expect(classes).toContain(cls);
    }
    // The cascade: `m` covers `s` and `xs`, and `s` covers `xs`.
    expect(classes).toContain("s-left-0");
    expect(classes).toContain("xs-top-72");
    expect(classes).toContain("xs-left-0");
    expect(classes).toContain("xs-right-8");
    expect(classes.some((cls) => /^(xl|l)-(top|right|bottom|left)-/.test(cls))).toBe(false);
  });

  it("writes xl, and cascades it to every narrower step", () => {
    const classes = classesOf(renderToStaticMarkup(<Flex xl={{ bottom: "24" }} />));
    for (const bp of ["xl", "l", "m", "s", "xs"]) {
      expect(classes, bp).toContain(`${bp}-bottom-24`);
    }
  });

  it("emits only classes foundations generates", () => {
    const classes = classesOf(
      renderToStaticMarkup(
        <ServerFlex
          xl={{ top: "0", left: "160" }}
          m={{ right: "4", bottom: "72" }}
          xs={{ top: "1" }}
        />,
      ),
    ).filter((cls) => /^(xl|l|m|s|xs)-(top|right|bottom|left)-/.test(cls));
    expect(classes.length).toBeGreaterThan(10);
    expect(classes.filter((cls) => !POSITION.includes(`.${cls} {`))).toEqual([]);
  });

  it("writes no class for an offset a class cannot hold", () => {
    // `top: 2` is 2rem; `.m-top-2` is the 0.125rem step. A t-shirt size has
    // no offset class at all.
    const classes = classesOf(
      renderToStaticMarkup(
        <ServerFlex m={{ top: 2 as never, left: "50%" as never, right: "m" as never }} />,
      ),
    );
    expect(classes.some((cls) => /^m-(top|left|right)-/.test(cls))).toBe(false);
  });

  it("moves a rem or CSS-unit offset to the client, as Grid does", () => {
    const cases: [Record<string, unknown>, boolean][] = [
      [{ top: "16" }, true],
      [{ top: 2 }, false],
      [{ left: "50%" }, false],
      [{ bottom: "calc(1rem + 2px)" }, false],
    ];
    for (const [bp, server] of cases) {
      const flex = onServer(<Flex s={bp as never}>x</Flex>);
      const grid = onServer(<Grid s={bp as never}>x</Grid>);
      expect(flex, JSON.stringify(bp)).toBe(server);
      expect(grid, JSON.stringify(bp)).toBe(server);
    }
  });

  it("applies a rem or CSS-unit offset inline at the current breakpoint", () => {
    // jsdom is 1024 wide, which is the `m` step.
    const { container } = render(
      <LayoutProvider>
        <Flex position="absolute" m={{ top: 2, left: "50%", bottom: "16" }}>
          flex
        </Flex>
        <Grid position="absolute" m={{ right: "calc(100% - 4rem)", top: 1.5 }}>
          grid
        </Grid>
      </LayoutProvider>,
    );
    const flex = container.querySelector(".display-flex") as HTMLElement;
    expect(flex.style.top).toBe("2rem");
    expect(flex.style.left).toBe("50%");
    // The token is a class, not a style.
    expect(flex.style.bottom).toBe("");
    expect(flex.classList.contains("m-bottom-16")).toBe(true);
    for (const attr of ["top", "left", "bottom"]) expect(flex.hasAttribute(attr)).toBe(false);

    const grid = container.querySelector(".display-grid") as HTMLElement;
    expect(grid.style.right).toBe("calc(100% - 4rem)");
    expect(grid.style.top).toBe("1.5rem");
  });
});
