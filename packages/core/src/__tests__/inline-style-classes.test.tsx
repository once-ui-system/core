import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Column, Grid, Heading, Row, Text } from "..";

/**
 * Props core used to write as inline style on nearly every page are utility
 * classes from foundations now: `minWidth={0}` (min-width-0), `align`
 * (text-align-*) and `wrap` (text-wrap-*). A value no class covers still goes
 * inline, so nothing a prop accepted stops working.
 */
describe("common inline styles as classes", () => {
  it("minWidth={0} and minHeight={0} are classes on Flex and Grid", () => {
    render(
      <>
        <Row data-testid="row" minWidth={0} minHeight="0" />
        <Column data-testid="col" fillWidth minWidth="0px" />
        <Grid data-testid="grid" minWidth={0} />
      </>,
    );
    for (const id of ["row", "col", "grid"]) {
      const el = screen.getByTestId(id);
      expect(el).toHaveClass("min-width-0");
      expect(el.style.minWidth).toBe("");
    }
    expect(screen.getByTestId("row")).toHaveClass("min-height-0");
    expect(screen.getByTestId("row").style.minHeight).toBe("");
  });

  it("a non-zero minWidth stays inline", () => {
    render(<Row data-testid="row" minWidth={2} />);
    expect(screen.getByTestId("row")).not.toHaveClass("min-width-0");
    expect(screen.getByTestId("row").style.minWidth).not.toBe("");
  });

  it("align and wrap are classes on Text, Heading and Flex", () => {
    render(
      <>
        <Text data-testid="text" align="center" wrap="nowrap">
          a
        </Text>
        <Heading data-testid="heading" align="left" wrap="balance">
          b
        </Heading>
        <Row data-testid="row" align="right" />
      </>,
    );
    const text = screen.getByTestId("text");
    expect(text).toHaveClass("text-align-center", "text-wrap-nowrap");
    expect(text.getAttribute("style") ?? "").toBe("");
    expect(screen.getByTestId("heading")).toHaveClass("text-align-left", "text-wrap-balance");
    expect(screen.getByTestId("row")).toHaveClass("text-align-right");
    expect(screen.getByTestId("row").style.textAlign).toBe("");
  });

  it("a value without a class still goes inline", () => {
    render(
      <Text data-testid="text" align="match-parent">
        a
      </Text>,
    );
    expect(screen.getByTestId("text").style.textAlign).toBe("match-parent");
  });
});
