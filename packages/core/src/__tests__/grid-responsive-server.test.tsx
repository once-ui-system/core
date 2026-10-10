import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Flex } from "../components/Flex";
import { Grid } from "../components/Grid";
import { ServerGrid } from "../components/ServerGrid";

/**
 * Any breakpoint prop used to switch `Grid` to `ClientGrid`, which reads
 * `useLayout` — so `<Grid columns="3" m={{ columns: 2 }}>` needed a
 * `LayoutProvider` above it and could not be a server component, while the
 * same shape on `Flex` could. The classes were never the problem: the
 * responsive column classes are generated for every breakpoint, and
 * `ClientGrid` used them itself. A responsive Grid now stays on the server
 * whenever Flex would, under the same rule.
 *
 * `renderToStaticMarkup` without a provider is the test for "on the server":
 * the client path throws there.
 */
const STYLES = join(__dirname, "../../../foundations/scss/styles");
const GENERATED = ["grid", "spacing", "display", "position"]
  .map((name) => readFileSync(join(STYLES, `${name}.generated.scss`), "utf8"))
  .join("\n");

const classesOf = (html: string) => {
  const at = html.indexOf('class="') + 7;
  return html.slice(at, html.indexOf('"', at)).split(" ").filter(Boolean);
};

describe("responsive Grid on the server", () => {
  it("renders breakpoint columns with no LayoutProvider", () => {
    const html = renderToStaticMarkup(
      <Grid columns="3" m={{ columns: 2 }} s={{ columns: 1 }} gap="12">
        x
      </Grid>,
    );
    const classes = classesOf(html);
    expect(classes).toContain("columns-3");
    expect(classes).toContain("m-columns-2");
    expect(classes).toContain("s-columns-1");
    // The cascade: `s` also covers `xs` unless `xs` says otherwise.
    expect(classes).toContain("xs-columns-1");
  });

  it("takes a numeric column count, which is a class too", () => {
    const classes = classesOf(renderToStaticMarkup(<Grid columns={4} s={{ columns: 2 }} />));
    expect(classes).toContain("columns-4");
    expect(classes).toContain("s-columns-2");
  });

  it("writes xl, and cascades it down to every narrower step", () => {
    const classes = classesOf(renderToStaticMarkup(<Grid xl={{ columns: 4, gap: "24" }} />));
    for (const bp of ["xl", "l", "m", "s", "xs"]) {
      expect(classes, bp).toContain(`${bp}-columns-4`);
      expect(classes, bp).toContain(`${bp}-g-24`);
    }
  });

  it("writes breakpoint spacing, which it used to drop on both paths", () => {
    // `ClientGrid` applied only `style` and `aspectRatio` at a breakpoint, and
    // ServerGrid wrote no spacing class, so `s={{ gap: "4" }}` did nothing.
    const classes = classesOf(
      renderToStaticMarkup(<Grid gap="24" s={{ gap: "8", padding: "16", marginTop: "4" }} />),
    );
    expect(classes).toContain("s-g-8");
    expect(classes).toContain("s-p-16");
    expect(classes).toContain("s-mt-4");
  });

  it("writes the display, position and effect families Flex writes", () => {
    const classes = classesOf(
      renderToStaticMarkup(
        <Grid
          m={{
            hide: true,
            position: "sticky",
            top: "0",
            overflow: "hidden",
            opacity: 50,
            zIndex: 1,
            pointerEvents: "none",
            transition: "micro-medium",
          }}
          s={{ hide: false }}
        />,
      ),
    );
    for (const cls of [
      "m-grid-hide",
      "s-grid-show",
      "m-position-sticky",
      "m-top-0",
      "m-overflow-hidden",
      "m-opacity-50",
      "m-z-index-1",
      "m-pointer-events-none",
      "m-transition-micro-medium",
    ]) {
      expect(classes).toContain(cls);
    }
  });

  it("emits no class that foundations does not generate", () => {
    // Every breakpoint class has a rule behind it — the class-name snapshot
    // cannot tell a dead class from a live one, but the generated files can.
    const classes = classesOf(
      renderToStaticMarkup(
        <ServerGrid
          xl={{ columns: 6, gap: "16", overflowY: "auto", zIndex: 2 }}
          m={{ columns: 3, padding: "8", hide: false, top: "16" }}
          xs={{ columns: 1, gap: "4", position: "relative" }}
        />,
      ),
    ).filter((cls) => /^(xl|l|m|s|xs)-/.test(cls));
    const dead = classes.filter((cls) => !GENERATED.includes(`.${cls} {`));
    expect(classes.length).toBeGreaterThan(20);
    expect(dead).toEqual([]);
  });

  it("writes no class for an offset a class cannot hold", () => {
    // `top: 2` is 2rem; `.m-top-2` is the 0.125rem token. Writing it would be
    // wrong rather than merely missing.
    const classes = classesOf(
      renderToStaticMarkup(<ServerGrid m={{ top: 2 as never, left: "50%" as never }} />),
    );
    expect(classes.some((cls) => cls.startsWith("m-top-"))).toBe(false);
    expect(classes.some((cls) => cls.startsWith("m-left-"))).toBe(false);
  });

  it("falls back to the client exactly where Flex does", () => {
    const cases: Record<string, unknown>[] = [
      { columns: 2 },
      { gap: "4" },
      { gap: 0.25 },
      { width: 20 },
      { aspectRatio: "16 / 9" },
      { style: { color: "red" } },
      { opacity: 50, zIndex: 2 },
      { padding: 2 },
    ];
    const onServer = (el: React.ReactElement) => {
      try {
        renderToStaticMarkup(el);
        return true;
      } catch (error) {
        expect(String(error)).toMatch(/LayoutProvider/);
        return false;
      }
    };
    for (const bp of cases) {
      const flex = onServer(<Flex s={bp as never}>x</Flex>);
      const grid = onServer(<Grid s={bp as never}>x</Grid>);
      expect(grid, JSON.stringify(bp)).toBe(flex);
    }
    // And the split itself: classes stay, a rem value or a width leaves.
    expect(onServer(<Grid s={{ columns: 1, gap: "4" }} />)).toBe(true);
    expect(onServer(<Grid s={{ gap: 0.25 }} />)).toBe(false);
    expect(onServer(<Grid s={{ width: 20 }} />)).toBe(false);
  });
});
