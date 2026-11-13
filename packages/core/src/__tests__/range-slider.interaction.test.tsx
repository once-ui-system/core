import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Slider } from "../components/Slider";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const thumb = (name: string) => screen.getByRole("slider", { name });

function stubTrack(el: HTMLElement, width = 1000) {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    width,
    height: 40,
    left: 0,
    right: width,
    top: 0,
    bottom: 40,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
}

/**
 * RangeSlider end to end, as a user drives it: Tab goes start thumb, end
 * thumb, then out; the keys and the readout stay in step; values sit on the
 * step grid measured from `min`; and a controlled parent sees every change.
 * The unit-level behaviour lives in range-slider.test.tsx.
 */
describe("RangeSlider: interaction", () => {
  it("tabs through the start thumb, the end thumb, then out", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Slider range label="Price" defaultValue={[10, 90]} />
        <button type="button">Apply</button>
      </>,
      { wrapper: wrap },
    );
    await user.tab();
    expect(thumb("Minimum")).toHaveFocus();
    await user.tab();
    expect(thumb("Maximum")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Apply" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(thumb("Maximum")).toHaveFocus();
  });

  it("keeps the readout and value text in step with the keys", async () => {
    const user = userEvent.setup();
    render(
      <Slider
        range
        label="Budget"
        showValue
        defaultValue={[100, 500]}
        min={0}
        max={1000}
        step={50}
        formatValue={(v) => `€${v}`}
      />,
      { wrapper: wrap },
    );
    await user.tab();
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(screen.getByText("€200 – €500")).toBeInTheDocument();
    expect(thumb("Minimum")).toHaveAttribute("aria-valuetext", "€200");
    await user.tab();
    await user.keyboard("{PageDown}");
    expect(thumb("Maximum")).toHaveAttribute("aria-valuenow", "400");
    expect(screen.getByText("€200 – €400")).toBeInTheDocument();
  });

  it("snaps to the step grid measured from min", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Slider
        range
        label="Size"
        min={5}
        max={95}
        step={10}
        defaultValue={[5, 95]}
        onValueChange={onChange}
      />,
      { wrapper: wrap },
    );
    await user.tab();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(onChange.mock.calls).toEqual([[[15, 95]], [[25, 95]]]);
  });

  it("drives a controlled parent from the keyboard and the pointer", async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [value, setValue] = useState<[number, number]>([20, 60]);
      return (
        <>
          <Slider range label="Range" value={value} onValueChange={setValue} />
          <output>{value.join("-")}</output>
        </>
      );
    };
    render(<Controlled />, { wrapper: wrap });
    await user.tab();
    await user.tab();
    await user.keyboard("{End}");
    expect(screen.getByRole("status")).toHaveTextContent("20-100");

    const track = thumb("Minimum").parentElement as HTMLElement;
    stubTrack(track);
    fireEvent.pointerDown(track, { button: 0, clientX: 50 });
    fireEvent.pointerUp(document);
    expect(screen.getByRole("status")).toHaveTextContent("5-100");
    expect(thumb("Minimum")).toHaveFocus();
  });

  it("ignores keys it does not own", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider range label="Price" defaultValue={[20, 80]} onValueChange={onChange} />, {
      wrapper: wrap,
    });
    await user.tab();
    await user.keyboard("a{Enter} ");
    expect(onChange).not.toHaveBeenCalled();
    expect(thumb("Minimum")).toHaveAttribute("aria-valuenow", "20");
  });

  it("re-clamps to new bounds when min and max change", () => {
    const { rerender } = render(<Slider range label="Price" defaultValue={[20, 80]} />, {
      wrapper: wrap,
    });
    rerender(<Slider range label="Price" defaultValue={[20, 80]} min={30} max={70} />);
    expect(thumb("Minimum")).toHaveAttribute("aria-valuenow", "30");
    expect(thumb("Maximum")).toHaveAttribute("aria-valuenow", "70");
  });

  it("has no axe violations with a readout and custom thumb names", async () => {
    const { container } = render(
      <Slider range label="Hours" showValue thumbLabels={["Opens", "Closes"]} min={0} max={24} />,
      { wrapper: wrap },
    );
    expect(thumb("Opens")).toBeInTheDocument();
    expect(thumb("Closes")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
