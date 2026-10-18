import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Badge, Chip, ProgressBar, RadioGroup, SegmentedControl, ThemeProvider } from "../src";

afterEach(cleanup);

const wrap = (node: React.ReactNode) => render(<ThemeProvider theme="light">{node}</ThemeProvider>);

describe("controls", () => {
  it("picks one radio and turns the others off", () => {
    const onChange = vi.fn();
    wrap(
      <RadioGroup
        label="Size"
        defaultValue="s"
        onChange={onChange}
        options={[
          { value: "s", label: "Small" },
          { value: "l", label: "Large" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Large" }));
    expect(onChange).toHaveBeenCalledWith("l");
    expect(screen.getByRole("radio", { name: "Large" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "Small" }).getAttribute("aria-checked")).toBe("false");
  });

  it("selects a segment", () => {
    const onChange = vi.fn();
    wrap(
      <SegmentedControl
        onChange={onChange}
        buttons={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
        ]}
      />,
    );
    const week = screen.getAllByRole("tab")[1];
    fireEvent.click(week);
    expect(onChange).toHaveBeenCalledWith("week");
    expect(week.getAttribute("aria-selected")).toBe("true");
  });

  it("removes a chip and shows a badge title", () => {
    const onRemove = vi.fn();
    wrap(
      <>
        <Chip label="Oat milk" onRemove={onRemove} />
        <Badge title="New: loyalty cards" arrow />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove Oat milk" }));
    expect(onRemove).toHaveBeenCalled();
    expect(screen.getByText("New: loyalty cards")).toBeTruthy();
  });

  it("reports progress to assistive tech and as a label", () => {
    wrap(<ProgressBar value={70} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("70");
    expect(screen.getByText("70%")).toBeTruthy();
  });
});
