import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { DataTooltip } from "../modules/data/DataTooltip";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const payload = [
  { name: "Revenue", value: 1200, color: "red", payload: { date: "2026-03-04" } },
  { name: "Status", value: "ok", stroke: "blue", payload: { date: "2026-03-04" } },
];

/**
 * DataTooltip is the hover card a chart hands recharts: nothing while
 * inactive, otherwise the (date-formatted) label over one row per series with
 * its swatch, name and value. Any label recharts passes, 0 included, is shown.
 */
describe("DataTooltip", () => {
  it("renders nothing while inactive or without data", () => {
    const { container, rerender } = render(<DataTooltip payload={payload} label="x" />, {
      wrapper,
    });
    expect(container).toBeEmptyDOMElement();
    rerender(<DataTooltip active payload={[]} label="x" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the formatted date label and one row per series", async () => {
    const { container } = render(<DataTooltip active payload={payload} label="2026-03-04" />, {
      wrapper,
    });
    expect(screen.getByText("Mar 4")).toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("1,200")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("ok")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("uses a custom date format", () => {
    render(
      <DataTooltip active payload={payload} label="2026-03-04" date={{ format: "yyyy/MM/dd" }} />,
      { wrapper },
    );
    expect(screen.getByText("2026/03/04")).toBeInTheDocument();
  });

  it("prefers the data point's own label", () => {
    render(
      <DataTooltip
        active
        payload={[{ name: "A", value: 1, payload: { label: "Q1 2026" } }]}
        label="2026-01-01"
      />,
      { wrapper },
    );
    expect(screen.getByText("Q1 2026")).toBeInTheDocument();
  });

  it("shows a numeric 0 label, not a stray 0", () => {
    const { container } = render(
      <DataTooltip active payload={[{ name: "A", value: "five", payload: {} }]} label={0} />,
      { wrapper },
    );
    expect(screen.getByText("0")).toBeInTheDocument();
    // The 0 is the header text, inside a Text, not a bare text node in the card.
    const card = container.firstElementChild as HTMLElement;
    expect(Array.from(card.childNodes).some((node) => node.nodeType === Node.TEXT_NODE)).toBe(
      false,
    );
  });

  it("omits the header without a label", () => {
    render(<DataTooltip active payload={[{ name: "A", value: "v", payload: {} }]} />, {
      wrapper,
    });
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("replaces the first series name with DataTooltip and can hide swatches", () => {
    const { container, rerender } = render(
      <DataTooltip active payload={payload} DataTooltip={<em>Custom</em>} />,
      { wrapper },
    );
    expect(screen.getByText("Custom")).toBeInTheDocument();
    expect(screen.queryByText("Revenue")).toBeNull();
    const swatches = () =>
      Array.from(container.querySelectorAll<HTMLElement>("div")).filter((el) =>
        el.style.border.includes("1px solid"),
      );
    expect(swatches().map((el) => el.style.borderColor)).toEqual(["red", "blue"]);
    rerender(<DataTooltip active payload={payload} showSwatches={false} />);
    expect(swatches()).toHaveLength(0);
  });
});
