import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Column } from "../components/Column";
import { Grid } from "../components/Grid";
import { Heading } from "../components/Heading";
import { Text } from "../components/Text";
import { tokenLength as t } from "../utils/layoutClasses";

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
    expect(sides(getByTestId("c"), "padding")).toEqual([t(1), t(1), t(1), t(1)]);
  });

  it("keeps margin={n} on a client mount", () => {
    const { getByTestId } = render(<Column data-testid="c" margin={2} />);
    expect(sides(getByTestId("c"), "margin")).toEqual([t(2), t(2), t(2), t(2)]);
  });

  it("keeps the box when four sides become one padding", () => {
    const { getByTestId, rerender } = render(
      <Column data-testid="c" paddingTop={2} paddingRight={1} paddingBottom={2} paddingLeft={1} />,
    );
    rerender(<Column data-testid="c" padding={2} />);
    expect(sides(getByTestId("c"), "padding")).toEqual([t(2), t(2), t(2), t(2)]);
  });

  it("lets a side beat its axis, and an axis beat the whole box", () => {
    const { getByTestId } = render(
      <Column data-testid="c" padding={1} paddingX={2} paddingLeft={3} />,
    );
    expect(sides(getByTestId("c"), "padding")).toEqual([t(1), t(2), t(1), t(3)]);
  });

  it("applies to Grid, Text and Heading too", () => {
    const { getByTestId } = render(
      <>
        <Grid data-testid="g" padding={1} />
        <Text data-testid="t" margin={1} />
        <Heading data-testid="h" margin={1} />
      </>,
    );
    expect(sides(getByTestId("g"), "padding")).toEqual([t(1), t(1), t(1), t(1)]);
    expect(sides(getByTestId("t"), "margin")).toEqual([t(1), t(1), t(1), t(1)]);
    expect(sides(getByTestId("h"), "margin")).toEqual([t(1), t(1), t(1), t(1)]);
  });
});
