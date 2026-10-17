import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Slider, type SliderProps } from "../components/Slider";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * Price and duration filters in the apps put two Sliders side by side and keep
 * them from crossing by hand. RangeSlider is one control with two thumbs, each
 * a `slider` the keyboard and a screen reader can use.
 */
const thumb = (name: string) => screen.getByRole("slider", { name });
const startThumb = () => thumb("Minimum");
const endThumb = () => thumb("Maximum");
const track = () => startThumb().parentElement as HTMLElement;

/** jsdom gives every element a zero-sized rect, so pointer maths needs a real one. */
function stubTrack(width = 1000, left = 0) {
  vi.spyOn(track(), "getBoundingClientRect").mockReturnValue({
    width,
    height: 40,
    left,
    right: left + width,
    top: 0,
    bottom: 40,
    x: left,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
}

const Controlled = (props: Partial<Omit<Extract<SliderProps, { range: true }>, "range">>) => {
  const [value, setValue] = useState<[number, number]>([20, 80]);
  return <Slider range label="Price" value={value} onValueChange={setValue} {...props} />;
};

describe("Slider range: structure", () => {
  it("is a group named by its label, holding a Minimum and a Maximum slider", () => {
    render(<Slider range label="Price" defaultValue={[20, 80]} />, { wrapper: wrap });
    const group = screen.getByRole("group", { name: "Price" });
    expect(group).toContainElement(startThumb());
    expect(group).toContainElement(endThumb());
    expect(screen.getAllByRole("slider")).toHaveLength(2);
  });

  it("bounds each thumb by the other, so neither can cross it", () => {
    render(<Slider range label="Price" min={0} max={200} defaultValue={[20, 80]} />, {
      wrapper: wrap,
    });
    expect(startThumb()).toHaveAttribute("aria-valuenow", "20");
    expect(startThumb()).toHaveAttribute("aria-valuemin", "0");
    expect(startThumb()).toHaveAttribute("aria-valuemax", "80");
    expect(endThumb()).toHaveAttribute("aria-valuenow", "80");
    expect(endThumb()).toHaveAttribute("aria-valuemin", "20");
    expect(endThumb()).toHaveAttribute("aria-valuemax", "200");
  });

  it("formats the readout and each thumb's value text with formatValue", () => {
    render(
      <Slider range label="Price" defaultValue={[20, 80]} showValue formatValue={(v) => `$${v}`} />,
      { wrapper: wrap },
    );
    expect(screen.getByText("$20 – $80")).toBeInTheDocument();
    expect(startThumb()).toHaveAttribute("aria-valuetext", "$20");
    expect(endThumb()).toHaveAttribute("aria-valuetext", "$80");
  });

  it("takes the thumbs' names from thumbLabels and the group's from aria-label", () => {
    render(<Slider range aria-label="Duration" thumbLabels={["From", "To"]} />, { wrapper: wrap });
    expect(screen.getByRole("group", { name: "Duration" })).toBeInTheDocument();
    expect(thumb("From")).toHaveAttribute("aria-valuenow", "0");
    expect(thumb("To")).toHaveAttribute("aria-valuenow", "100");
  });

  it("draws the fill between the thumbs", () => {
    const { container } = render(
      <Slider range label="Price" min={100} max={300} defaultValue={[150, 250]} />,
      { wrapper: wrap },
    );
    expect(startThumb().style.insetInlineStart).toBe("25%");
    expect(endThumb().style.insetInlineStart).toBe("75%");
    const fill = container.querySelector<HTMLElement>("[style*='width: 50%']");
    expect(fill?.style.insetInlineStart).toBe("25%");
  });

  it("forwards its ref to the group", () => {
    let node: HTMLDivElement | null = null;
    render(
      <Slider
        range
        ref={(el) => {
          node = el;
        }}
        label="Price"
      />,
      { wrapper: wrap },
    );
    expect(node).toBe(screen.getByRole("group"));
  });
});

describe("Slider range: value", () => {
  it("covers the whole range without a value or defaultValue", () => {
    render(<Slider range label="Price" min={10} max={40} />, { wrapper: wrap });
    expect(startThumb()).toHaveAttribute("aria-valuenow", "10");
    expect(endThumb()).toHaveAttribute("aria-valuenow", "40");
  });

  it("keeps its own state from defaultValue and reports each change as [start, end]", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider range label="Price" defaultValue={[20, 80]} onValueChange={onChange} />, {
      wrapper: wrap,
    });
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(startThumb()).toHaveAttribute("aria-valuenow", "21");
    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(endThumb()).toHaveAttribute("aria-valuenow", "79");
    expect(onChange.mock.calls).toEqual([[[21, 80]], [[21, 79]]]);
  });

  it("is controlled: shows `value`, not the last change, until the parent updates it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <Slider range label="Price" value={[20, 80]} onValueChange={onChange} />,
      {
        wrapper: wrap,
      },
    );
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith([21, 80]);
    expect(startThumb()).toHaveAttribute("aria-valuenow", "20");

    rerender(<Slider range label="Price" value={[21, 80]} onValueChange={onChange} />);
    expect(startThumb()).toHaveAttribute("aria-valuenow", "21");
  });

  it("follows its parent's state when wired up as a controlled input", async () => {
    const user = userEvent.setup();
    render(<Controlled />, { wrapper: wrap });
    await user.tab();
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(startThumb()).toHaveAttribute("aria-valuenow", "22");
    expect(endThumb()).toHaveAttribute("aria-valuemin", "22");
  });

  it("orders and clamps a value it is given", () => {
    render(<Slider range label="Price" value={[90, -10]} />, { wrapper: wrap });
    expect(startThumb()).toHaveAttribute("aria-valuenow", "0");
    expect(endThumb()).toHaveAttribute("aria-valuenow", "90");
  });
});

describe("Slider range: keyboard", () => {
  it("steps with the arrow keys, by a tenth with Page Up and Down, to the ends with Home and End", async () => {
    const user = userEvent.setup();
    render(<Slider range label="Price" min={0} max={200} step={2} defaultValue={[40, 160]} />, {
      wrapper: wrap,
    });
    await user.tab();
    const start = startThumb();
    expect(start).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(start).toHaveAttribute("aria-valuenow", "42");
    await user.keyboard("{ArrowDown}");
    expect(start).toHaveAttribute("aria-valuenow", "40");
    await user.keyboard("{PageUp}");
    expect(start).toHaveAttribute("aria-valuenow", "60");
    await user.keyboard("{PageDown}{PageDown}");
    expect(start).toHaveAttribute("aria-valuenow", "20");
    await user.keyboard("{End}");
    expect(start).toHaveAttribute("aria-valuenow", "160");
    await user.keyboard("{Home}");
    expect(start).toHaveAttribute("aria-valuenow", "0");

    await user.tab();
    await user.keyboard("{Home}");
    expect(endThumb()).toHaveAttribute("aria-valuenow", "0");
    await user.keyboard("{End}");
    expect(endThumb()).toHaveAttribute("aria-valuenow", "200");
  });

  it("never lets the thumbs cross, and keeps minDistance between them", async () => {
    const user = userEvent.setup();
    render(<Slider range label="Price" defaultValue={[40, 50]} minDistance={5} />, {
      wrapper: wrap,
    });
    await user.tab();
    await user.keyboard("{PageUp}{PageUp}");
    expect(startThumb()).toHaveAttribute("aria-valuenow", "45");
    expect(endThumb()).toHaveAttribute("aria-valuemin", "50");

    await user.tab();
    await user.keyboard("{Home}");
    expect(endThumb()).toHaveAttribute("aria-valuenow", "50");
    expect(startThumb()).toHaveAttribute("aria-valuemax", "45");
  });

  it("lands on the step grid without floating-point noise", async () => {
    const user = userEvent.setup();
    render(<Slider range label="Opacity" min={0} max={1} step={0.1} defaultValue={[0.2, 0.8]} />, {
      wrapper: wrap,
    });
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(startThumb()).toHaveAttribute("aria-valuenow", "0.3");
  });

  it("swaps Left and Right in a right-to-left layout", async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <Slider range label="Price" defaultValue={[20, 80]} />
      </div>,
      { wrapper: wrap },
    );
    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(startThumb()).toHaveAttribute("aria-valuenow", "21");
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(startThumb()).toHaveAttribute("aria-valuenow", "19");
  });

  it("does not report a key that changes nothing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider range label="Price" onValueChange={onChange} />, { wrapper: wrap });
    await user.tab();
    await user.keyboard("{Home}{ArrowLeft}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("takes the thumbs out of the Tab order while disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <>
        <Slider range label="Price" disabled onValueChange={onChange} />
        <button type="button">After</button>
      </>,
      { wrapper: wrap },
    );
    expect(startThumb()).toHaveAttribute("aria-disabled", "true");
    expect(startThumb()).not.toHaveAttribute("tabindex");
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    fireEvent.keyDown(startThumb(), { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("Slider range: pointer", () => {
  it("moves the nearer thumb to a press on the track and drags it", () => {
    const onChange = vi.fn();
    render(<Slider range label="Price" defaultValue={[20, 80]} onValueChange={onChange} />, {
      wrapper: wrap,
    });
    stubTrack();

    fireEvent.pointerDown(track(), { button: 0, clientX: 700 });
    expect(endThumb()).toHaveAttribute("aria-valuenow", "70");
    expect(endThumb()).toHaveFocus();

    fireEvent.pointerMove(document, { clientX: 655 });
    expect(endThumb()).toHaveAttribute("aria-valuenow", "66");
    fireEvent.pointerUp(document);
    fireEvent.pointerMove(document, { clientX: 900 });
    expect(endThumb()).toHaveAttribute("aria-valuenow", "66");

    fireEvent.pointerDown(track(), { button: 0, clientX: 100 });
    expect(startThumb()).toHaveAttribute("aria-valuenow", "10");
    expect(startThumb()).toHaveFocus();
    expect(onChange.mock.calls.at(-1)).toEqual([[10, 66]]);
  });

  it("stops a dragged thumb at the other one", () => {
    render(<Slider range label="Price" defaultValue={[20, 80]} minDistance={10} />, {
      wrapper: wrap,
    });
    stubTrack();
    fireEvent.pointerDown(startThumb(), { button: 0, clientX: 200 });
    fireEvent.pointerMove(document, { clientX: 950 });
    expect(startThumb()).toHaveAttribute("aria-valuenow", "70");
    fireEvent.pointerMove(document, { clientX: -400 });
    expect(startThumb()).toHaveAttribute("aria-valuenow", "0");
    fireEvent.pointerUp(document);
  });

  it("grabs a thumb where it is, without jumping on the press", () => {
    const onChange = vi.fn();
    render(<Slider range label="Price" defaultValue={[20, 80]} onValueChange={onChange} />, {
      wrapper: wrap,
    });
    stubTrack();
    fireEvent.pointerDown(endThumb(), { button: 0, clientX: 806 });
    expect(onChange).not.toHaveBeenCalled();
    expect(endThumb()).toHaveFocus();
    fireEvent.pointerMove(document, { clientX: 900 });
    expect(endThumb()).toHaveAttribute("aria-valuenow", "90");
    fireEvent.pointerUp(document);
  });

  it("lets the first move decide which of two stacked thumbs a press grabs", () => {
    render(<Slider range label="Price" defaultValue={[100, 100]} />, { wrapper: wrap });
    stubTrack();

    // Both at the top: only the start thumb can move, and it is the one that does.
    fireEvent.pointerDown(endThumb(), { button: 0, clientX: 1000 });
    fireEvent.pointerMove(document, { clientX: 600 });
    expect(startThumb()).toHaveAttribute("aria-valuenow", "60");
    expect(endThumb()).toHaveAttribute("aria-valuenow", "100");
    expect(startThumb()).toHaveFocus();
    fireEvent.pointerUp(document);
  });

  it("measures from the right in a right-to-left layout", () => {
    render(
      <div dir="rtl">
        <Slider range label="Price" defaultValue={[20, 80]} />
      </div>,
      { wrapper: wrap },
    );
    stubTrack();
    fireEvent.pointerDown(track(), { button: 0, clientX: 900 });
    expect(startThumb()).toHaveAttribute("aria-valuenow", "10");
  });

  it("ignores the pointer while disabled, and buttons other than the main one", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Slider range label="Price" defaultValue={[20, 80]} onValueChange={onChange} />,
      { wrapper: wrap },
    );
    stubTrack();
    fireEvent.pointerDown(track(), { button: 2, clientX: 500 });
    rerender(
      <Slider range label="Price" defaultValue={[20, 80]} onValueChange={onChange} disabled />,
    );
    fireEvent.pointerDown(track(), { button: 0, clientX: 500 });
    fireEvent.pointerMove(document, { clientX: 600 });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("Slider range: forms", () => {
  const values = (container: HTMLElement) =>
    new FormData(container.querySelector("form") as HTMLFormElement);

  it("submits both values under one name, start first", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <Slider range label="Price" name="price" defaultValue={[20, 80]} />
      </form>,
      { wrapper: wrap },
    );
    expect(values(container).getAll("price")).toEqual(["20", "80"]);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(values(container).getAll("price")).toEqual(["21", "80"]);
  });

  it("submits each value under its own name", () => {
    const { container } = render(
      <form>
        <Slider range label="Price" name={["minPrice", "maxPrice"]} defaultValue={[20, 80]} />
      </form>,
      { wrapper: wrap },
    );
    expect(values(container).get("minPrice")).toBe("20");
    expect(values(container).get("maxPrice")).toBe("80");
  });

  it("submits nothing while disabled", () => {
    const { container } = render(
      <form>
        <Slider range label="Price" name="price" disabled />
      </form>,
      { wrapper: wrap },
    );
    expect(values(container).getAll("price")).toEqual([]);
  });
});

describe("Slider range: rendering", () => {
  it("renders both thumbs on the server", () => {
    const html = renderToString(
      <LayoutProvider>
        <Slider range label="Price" defaultValue={[25, 75]} />
      </LayoutProvider>,
    );
    expect(html.match(/role="slider"/g)).toHaveLength(2);
    expect(html).toContain('aria-valuenow="25"');
    expect(html).toContain('aria-valuenow="75"');
  });

  it("has no axe violations: labelled, named by aria-label, and disabled", async () => {
    const { container, rerender } = render(
      <Slider range label="Price" defaultValue={[20, 80]} showValue />,
      { wrapper: wrap },
    );
    await expectNoAxeViolations(container);
    rerender(<Slider range aria-label="Price" thumbLabels={["From", "To"]} />);
    await expectNoAxeViolations(container);
    rerender(<Slider range label="Price" disabled />);
    await expectNoAxeViolations(container);
  });
});
