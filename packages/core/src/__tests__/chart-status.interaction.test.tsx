import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ChartStatus } from "../modules/data/ChartStatus";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * ChartStatus fills the plot with a loading spinner, an error message or an
 * empty message, in that order of precedence, and renders nothing otherwise.
 */
describe("ChartStatus", () => {
  it("renders nothing when there is nothing to report", () => {
    const { container } = render(<ChartStatus />, { wrapper });
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a named loading status", async () => {
    const { container } = render(<ChartStatus loading />, { wrapper });
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("shows the default and custom empty messages", () => {
    const { rerender } = render(<ChartStatus empty />, { wrapper });
    expect(screen.getByText("No data available for the selected period")).toBeInTheDocument();
    rerender(<ChartStatus empty emptyState={<strong>Nothing yet</strong>} />);
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
  });

  it("shows the default and custom error messages", async () => {
    const { container, rerender } = render(<ChartStatus error />, { wrapper });
    expect(screen.getByText("An error occurred while fetching data")).toBeInTheDocument();
    await expectNoAxeViolations(container);
    rerender(<ChartStatus error errorState="Try again later" />);
    expect(screen.getByText("Try again later")).toBeInTheDocument();
  });

  it("puts loading before error, and error before empty", () => {
    const { rerender } = render(<ChartStatus loading empty error />, { wrapper });
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText(/No data/)).toBeNull();
    // A failed request usually leaves data empty too: the error is what to say.
    rerender(<ChartStatus empty error />);
    expect(screen.getByText(/error occurred/)).toBeInTheDocument();
    expect(screen.queryByText(/No data/)).toBeNull();
  });
});
