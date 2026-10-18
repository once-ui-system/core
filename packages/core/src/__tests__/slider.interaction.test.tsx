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

/**
 * Slider wraps a native range input, so the browser does the stepping. These
 * protect what the wrapper adds around it in a real interaction: it is one
 * Tab stop named by its label, the readout follows the value it reports, and
 * the host's handlers (focus, blur, keydown) still reach the input.
 */
describe("Slider: interaction", () => {
  it("is one Tab stop, named by its label, with its value and bounds", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <Slider label="Brightness" min={0} max={10} step={2} defaultValue={4} showValue />
        <button type="button">After</button>
      </>,
      { wrapper: wrap },
    );
    await user.tab();
    const slider = screen.getByRole("slider", { name: "Brightness" });
    expect(slider).toHaveFocus();
    expect(slider).toHaveValue("4");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "10");
    expect(slider).toHaveAttribute("step", "2");
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    await expectNoAxeViolations(container);
  });

  it("updates the readout and reports a number for each change", () => {
    const onChange = vi.fn();
    render(<Slider label="Brightness" defaultValue={10} showValue onChange={onChange} />, {
      wrapper: wrap,
    });
    const slider = screen.getByRole("slider", { name: "Brightness" });
    fireEvent.change(slider, { target: { value: "35" } });
    fireEvent.change(slider, { target: { value: "36" } });
    expect(onChange.mock.calls).toEqual([[35], [36]]);
    expect(screen.getByText("36")).toBeInTheDocument();
  });

  it("drives a parent's state and readout as a controlled input", () => {
    const Controlled = () => {
      const [value, setValue] = useState(50);
      return (
        <>
          <Slider label="Volume" value={value} onChange={setValue} />
          <output>{value}</output>
        </>
      );
    };
    render(<Controlled />, { wrapper: wrap });
    fireEvent.change(screen.getByRole("slider", { name: "Volume" }), { target: { value: "12" } });
    expect(screen.getByRole("status")).toHaveTextContent("12");
  });

  it("passes the host's keyboard and focus handlers to the input", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <Slider
        aria-label="Volume"
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        defaultValue={5}
      />,
      { wrapper: wrap },
    );
    await user.tab();
    await user.keyboard("{ArrowRight}");
    await user.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: "ArrowRight" }));
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("is left out of the Tab order while disabled, and stays clean for axe", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <Slider label="Volume" disabled defaultValue={5} />
        <button type="button">After</button>
      </>,
      { wrapper: wrap },
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    expect(screen.getByRole("slider", { name: "Volume" })).toBeDisabled();
    await expectNoAxeViolations(container);
  });

  it("can be named by aria-labelledby from outside", () => {
    render(
      <>
        <h2 id="outside">Treble</h2>
        <Slider label="Ignored" aria-labelledby="outside" defaultValue={5} />
      </>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("slider", { name: "Treble" })).toBeInTheDocument();
  });

  it("shows no label row with neither label nor showValue", () => {
    const { container } = render(<Slider aria-label="Volume" defaultValue={5} />, {
      wrapper: wrap,
    });
    expect(container.textContent).toBe("");
  });
});
