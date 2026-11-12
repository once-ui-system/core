import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Scrubber } from "../components/Scrubber";
import { LayoutProvider } from "../contexts/LayoutProvider";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/** jsdom gives every element a zero-sized rect, so pointer maths needs a real one. */
function stubTrackWidth(el: Element, width = 1000, left = 0) {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
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

const tracks = [
  {
    id: "zooms",
    movable: true,
    resizable: true,
    blocks: [{ id: "z1", start: 2000, end: 4000, label: "Zoom" }],
  },
];

describe("Scrubber", () => {
  it("is a plain seek bar with no tracks", () => {
    render(<Scrubber duration={10000} value={2500} onValueChange={() => {}} />, { wrapper: wrap });
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuemax", "10000");
    expect(slider).toHaveAttribute("aria-valuenow", "2500");
  });

  it("formats the elapsed and total time", () => {
    render(<Scrubber duration={125000} value={65000} onValueChange={() => {}} />, {
      wrapper: wrap,
    });
    expect(screen.getByText("1:05")).toBeInTheDocument();
    expect(screen.getByText("2:05")).toBeInTheDocument();
  });

  it("grows an hours field only when it needs one", () => {
    render(<Scrubber duration={3725000} value={0} onValueChange={() => {}} />, { wrapper: wrap });
    expect(screen.getByText("1:02:05")).toBeInTheDocument();
  });

  it("seeks with the keyboard", () => {
    const onChange = vi.fn();
    render(<Scrubber duration={10000} value={5000} onValueChange={onChange} />, { wrapper: wrap });
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(5100);
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenLastCalledWith(4900);
    fireEvent.keyDown(slider, { key: "Home" });
    expect(onChange).toHaveBeenLastCalledWith(0);
    fireEvent.keyDown(slider, { key: "End" });
    expect(onChange).toHaveBeenLastCalledWith(10000);
  });

  it("clamps keyboard seeking to the timeline", () => {
    const onChange = vi.fn();
    render(<Scrubber duration={10000} value={0} onValueChange={onChange} />, { wrapper: wrap });
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("positions a block by time, not by layout", () => {
    render(<Scrubber duration={10000} value={0} onValueChange={() => {}} tracks={tracks} />, {
      wrapper: wrap,
    });
    const block = screen.getByText("Zoom").parentElement as HTMLElement;
    expect(block.style.left).toBe("20%");
    expect(block.style.width).toBe("20%");
  });

  it("selects a block on pointer down", () => {
    const onSelect = vi.fn();
    render(
      <Scrubber
        duration={10000}
        value={0}
        onValueChange={() => {}}
        tracks={tracks}
        selected={null}
        onSelectedChange={onSelect}
      />,
      { wrapper: wrap },
    );
    fireEvent.pointerDown(screen.getByText("Zoom").parentElement as HTMLElement, { button: 0 });
    expect(onSelect).toHaveBeenCalledWith("z1");
  });

  it("reports a move as absolute times measured from the gesture start", () => {
    const onBlockChange = vi.fn();
    const onGestureStart = vi.fn();
    const { container } = render(
      <Scrubber
        duration={10000}
        value={0}
        onValueChange={() => {}}
        tracks={tracks}
        onBlockChange={onBlockChange}
        onGestureStart={onGestureStart}
      />,
      { wrapper: wrap },
    );
    stubTrackWidth(container.firstElementChild!.firstElementChild!);
    const block = screen.getByText("Zoom").parentElement as HTMLElement;
    fireEvent.pointerDown(block, { button: 0, clientX: 200 });
    expect(onGestureStart).toHaveBeenCalledTimes(1);
    // +100px of a 1000px / 10000ms track is +1000ms on both edges.
    fireEvent.pointerMove(document, { clientX: 300 });
    expect(onBlockChange).toHaveBeenLastCalledWith("zooms", "z1", { start: 3000, end: 5000 });
    // Measured from the gesture start, so this is +2000ms, not +3000ms.
    fireEvent.pointerMove(document, { clientX: 400 });
    expect(onBlockChange).toHaveBeenLastCalledWith("zooms", "z1", { start: 4000, end: 6000 });
  });

  it("clamps a drag to the timeline", () => {
    const onBlockChange = vi.fn();
    const { container } = render(
      <Scrubber
        duration={10000}
        value={0}
        onValueChange={() => {}}
        tracks={tracks}
        onBlockChange={onBlockChange}
      />,
      { wrapper: wrap },
    );
    stubTrackWidth(container.firstElementChild!.firstElementChild!);
    fireEvent.pointerDown(screen.getByText("Zoom").parentElement as HTMLElement, {
      button: 0,
      clientX: 200,
    });
    fireEvent.pointerMove(document, { clientX: -5000 });
    expect(onBlockChange).toHaveBeenLastCalledWith("zooms", "z1", { start: 0, end: 0 });
  });

  it("leaves a locked block alone", () => {
    const onBlockChange = vi.fn();
    render(
      <Scrubber
        duration={10000}
        value={0}
        onValueChange={() => {}}
        onBlockChange={onBlockChange}
        tracks={[
          {
            id: "zooms",
            movable: true,
            resizable: true,
            blocks: [{ id: "z1", start: 2000, end: 4000, label: "Zoom", locked: true }],
          },
        ]}
      />,
      { wrapper: wrap },
    );
    fireEvent.pointerDown(screen.getByText("Zoom").parentElement as HTMLElement, {
      button: 0,
      clientX: 200,
    });
    fireEvent.pointerMove(document, { clientX: 300 });
    expect(onBlockChange).not.toHaveBeenCalled();
  });

  it("adds on an empty track that accepts it", () => {
    const onAdd = vi.fn();
    const { container } = render(
      <Scrubber
        duration={10000}
        value={0}
        onValueChange={() => {}}
        tracks={[{ id: "zooms", blocks: [], onAdd }]}
      />,
      { wrapper: wrap },
    );
    const trackRow = container.querySelector('[class*="radius-s"]') as HTMLElement;
    stubTrackWidth(container.firstElementChild!.firstElementChild!);
    fireEvent.pointerDown(trackRow, { button: 0, clientX: 500 });
    expect(onAdd).toHaveBeenCalledWith(5000);
  });

  it("hands a right-click on a block to the caller", () => {
    const onBlockContextMenu = vi.fn();
    render(
      <Scrubber
        duration={10000}
        value={0}
        onValueChange={() => {}}
        tracks={tracks}
        onBlockContextMenu={onBlockContextMenu}
      />,
      { wrapper: wrap },
    );
    fireEvent.contextMenu(screen.getByText("Zoom").parentElement as HTMLElement);
    expect(onBlockContextMenu).toHaveBeenCalledWith(expect.anything(), "zooms", "z1");
  });
});

describe("Scrubber ruler and track headers", () => {
  it("picks a round tick interval for the duration", async () => {
    const { rulerInterval } = await import("../components/Scrubber");
    expect(rulerInterval(30_000)).toBe(5_000);
    expect(rulerInterval(10_000)).toBe(1_000);
    expect(rulerInterval(600_000)).toBe(60_000);
    expect(rulerInterval(0)).toBe(0);
  });

  it("labels the ruler's ticks and seeks when it is pressed", () => {
    const onValueChange = vi.fn();
    render(
      <Scrubber duration={30_000} value={0} onValueChange={onValueChange} tracks={tracks} ruler />,
      { wrapper: wrap },
    );
    for (const label of ["0:00", "0:05", "0:15", "0:30"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    const slider = screen.getByRole("slider");
    stubTrackWidth(slider);
    fireEvent.pointerDown(screen.getByText("0:15").closest("div")?.parentElement as Element, {
      button: 0,
      clientX: 500,
    });
    expect(onValueChange).toHaveBeenLastCalledWith(15_000);
  });

  it("draws a header for every track once one has a label", () => {
    render(
      <Scrubber
        duration={30_000}
        value={0}
        onValueChange={() => {}}
        tracks={[
          { ...tracks[0], label: "Video" },
          { id: "audio", blocks: [] },
        ]}
      />,
      { wrapper: wrap },
    );
    expect(screen.getByText("Video")).toBeTruthy();
    // The header column sits outside the slider, so the label is not part of its name.
    expect(screen.getByRole("slider").textContent).not.toContain("Video");
  });
});
