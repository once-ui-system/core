import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Column } from "../components/Column";
import { Grid } from "../components/Grid";
import { Heading } from "../components/Heading";
import { Text } from "../components/Text";

/**
 * Numeric spacing is written inline as the four sides, never as the shorthand.
 *
 * With `padding` / `margin` written as the CSS shorthand next to longhands left
 * `undefined`, the server rendered the shorthand but the client did not: React
 * writes an undefined longhand as `''` after the shorthand, which clears it.
 * `<Column padding={1}>` mounted on the client had `style=""`. These run in
 * jsdom, i.e. through the client path, and fail against that version.
 */
const sides = (el: HTMLElement, prop: "padding" | "margin") => {
  const s = el.style;
  return prop === "padding"
    ? [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft]
    : [s.marginTop, s.marginRight, s.marginBottom, s.marginLeft];
};

describe("numeric spacing", () => {
  it("keeps padding={n} on a client mount", () => {
    const { getByTestId } = render(<Column data-testid="c" padding={1} />);
    expect(sides(getByTestId("c"), "padding")).toEqual(["1rem", "1rem", "1rem", "1rem"]);
  });

  it("keeps margin={n} on a client mount", () => {
    const { getByTestId } = render(<Column data-testid="c" margin={2} />);
    expect(sides(getByTestId("c"), "margin")).toEqual(["2rem", "2rem", "2rem", "2rem"]);
  });

  it("keeps the box when four sides become one padding", () => {
    const { getByTestId, rerender } = render(
      <Column data-testid="c" paddingTop={2} paddingRight={1} paddingBottom={2} paddingLeft={1} />,
    );
    rerender(<Column data-testid="c" padding={2} />);
    expect(sides(getByTestId("c"), "padding")).toEqual(["2rem", "2rem", "2rem", "2rem"]);
  });

  it("lets a side beat its axis, and an axis beat the whole box", () => {
    const { getByTestId } = render(
      <Column data-testid="c" padding={1} paddingX={2} paddingLeft={3} />,
    );
    expect(sides(getByTestId("c"), "padding")).toEqual(["1rem", "2rem", "1rem", "3rem"]);
  });

  it("applies to Grid, Text and Heading too", () => {
    const { getByTestId } = render(
      <>
        <Grid data-testid="g" padding={1} />
        <Text data-testid="t" padding={1} />
        <Heading data-testid="h" margin={1} />
      </>,
    );
    expect(sides(getByTestId("g"), "padding")).toEqual(["1rem", "1rem", "1rem", "1rem"]);
    expect(sides(getByTestId("t"), "padding")).toEqual(["1rem", "1rem", "1rem", "1rem"]);
    expect(sides(getByTestId("h"), "margin")).toEqual(["1rem", "1rem", "1rem", "1rem"]);
  });
});
