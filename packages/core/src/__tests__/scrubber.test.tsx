import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Scrubber,
  ScrubberFilmstrip,
  ScrubberWaveform,
  scrollForZoom,
  snapTime,
} from "../components/Scrubber";
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
    stubTrackWidth(screen.getByRole("slider"));
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
    stubTrackWidth(screen.getByRole("slider"));
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
    stubTrackWidth(screen.getByRole("slider"));
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

describe("Scrubber, editor grade", () => {
  const twoTracks = (overrides: Partial<React.ComponentProps<typeof Scrubber>> = {}) => (
    <Scrubber
      duration={10000}
      value={5000}
      onValueChange={() => {}}
      tracks={[
        {
          id: "scenes",
          movable: true,
          resizable: true,
          blocks: [
            { id: "a", start: 0, end: 2000, label: "Intro" },
            {
              id: "cut",
              start: 2000,
              end: 3000,
              label: "idle 1 s",
              variant: "gap",
              description: "Nothing moved for 1 s",
            },
            { id: "b", start: 6000, end: 8000, label: "Pay", badge: "4×" },
          ],
        },
      ]}
      {...overrides}
    />
  );

  it("snaps a trimmed edge to a neighbouring edge within the threshold", () => {
    expect(snapTime(2950, [0, 3000, 5000], 100)).toEqual({ time: 3000, guide: 3000 });
    expect(snapTime(2800, [0, 3000, 5000], 100)).toEqual({ time: 2800, guide: null });
  });

  it("keeps the time under the pointer when zooming", () => {
    // 200 px into a 2x view scrolled 100 px: time sits at 300/2 = 150 px of 1x.
    // At 4x that is 600 px, so the view scrolls to 400 to keep it at 200.
    expect(scrollForZoom(100, 200, 2, 4)).toBe(400);
    expect(scrollForZoom(0, 50, 2, 1)).toBe(0);
  });

  it("snaps a dragged edge and shows the guide", () => {
    const onBlockChange = vi.fn();
    render(twoTracks({ snap: true, onBlockChange }), { wrapper: wrap });
    stubTrackWidth(screen.getByRole("slider"));
    // Pay's start handle at 6000 = 600 px; drag it to 504 px = 5040 ms, which
    // is within 8 px (80 ms) of the playhead at 5000.
    const pay = screen.getByLabelText("Pay");
    const startHandle = pay.querySelector('[class*="cursor-ew-resize"], div[style*="ew-resize"]');
    fireEvent.pointerDown(startHandle ?? pay.lastElementChild!.previousElementSibling!, {
      button: 0,
      clientX: 600,
    });
    fireEvent.pointerMove(document, { clientX: 504 });
    expect(onBlockChange).toHaveBeenLastCalledWith("scenes", "b", { start: 5000, end: 8000 });
    expect(screen.getByTestId("scrubber-snap-guide")).toBeInTheDocument();
    fireEvent.pointerUp(document);
    expect(screen.queryByTestId("scrubber-snap-guide")).toBeNull();
  });

  it("draws a cut as a gap with its reason", () => {
    render(twoTracks(), { wrapper: wrap });
    const cut = screen.getByLabelText("Nothing moved for 1 s");
    expect(cut.className).toMatch(/gap/);
    expect(cut).toHaveAttribute("title", "Nothing moved for 1 s");
  });

  it("shows a badge on a block", () => {
    render(twoTracks(), { wrapper: wrap });
    expect(screen.getByText("4×")).toBeInTheDocument();
  });

  it("draws a range with Shift-drag and clears it with a click", () => {
    const onRangeChange = vi.fn();
    const { container, rerender } = render(twoTracks({ ruler: true, onRangeChange }), {
      wrapper: wrap,
    });
    stubTrackWidth(screen.getByRole("slider"));
    const rulerRow = container.querySelector('[class*="border-bottom"]') as HTMLElement;
    fireEvent.pointerDown(rulerRow, { button: 0, clientX: 300, shiftKey: true });
    fireEvent.pointerMove(document, { clientX: 700 });
    expect(onRangeChange).toHaveBeenLastCalledWith({ start: 3000, end: 7000 });
    fireEvent.pointerUp(document);

    rerender(twoTracks({ ruler: true, onRangeChange, range: { start: 3000, end: 7000 } }));
    expect(screen.getByTestId("scrubber-range")).toBeInTheDocument();
    fireEvent.pointerDown(rulerRow, { button: 0, clientX: 100 });
    expect(onRangeChange).toHaveBeenLastCalledWith(null);
  });

  it("zooms with the keyboard and reports it", () => {
    const onZoomChange = vi.fn();
    render(twoTracks({ onZoomChange }), { wrapper: wrap });
    fireEvent.keyDown(screen.getByRole("slider"), { key: "+" });
    expect(onZoomChange).toHaveBeenLastCalledWith(1.5);
    expect(screen.getByRole("slider").style.width).toBe("150%");
  });

  it("previews the hovered time", () => {
    render(twoTracks({ renderPreview: (time) => <span>frame {time}</span> }), { wrapper: wrap });
    const slider = screen.getByRole("slider");
    stubTrackWidth(slider);
    fireEvent.pointerMove(slider, { clientX: 250 });
    expect(screen.getByText("frame 2500")).toBeInTheDocument();
    expect(screen.getByTestId("scrubber-preview")).toHaveTextContent("0:03");
    fireEvent.pointerLeave(slider);
    expect(screen.queryByTestId("scrubber-preview")).toBeNull();
  });

  it("marks a highlighted block for the shimmer", () => {
    render(
      <Scrubber
        duration={10000}
        value={0}
        onValueChange={() => {}}
        tracks={[
          { id: "t", blocks: [{ id: "x", start: 0, end: 1000, label: "New", highlight: true }] },
        ]}
      />,
      { wrapper: wrap },
    );
    expect(screen.getByLabelText("New").className).toMatch(/highlight/);
  });

  it("puts markers on the ruler", () => {
    render(twoTracks({ ruler: true, markers: [{ id: "m", time: 4000, label: "Click: Pay" }] }), {
      wrapper: wrap,
    });
    expect(screen.getByRole("img", { name: "Click: Pay" })).toBeInTheDocument();
  });
});

describe("Scrubber helpers", () => {
  it("draws a waveform bar per peak", () => {
    const { container } = render(<ScrubberWaveform peaks={[0.2, 0.8, 1]} />);
    expect(container.querySelectorAll("rect")).toHaveLength(3);
  });

  it("draws a filmstrip frame per image", () => {
    const { container } = render(<ScrubberFilmstrip frames={["a.png", "b.png"]} />, {
      wrapper: wrap,
    });
    expect(container.querySelectorAll("img")).toHaveLength(2);
  });
});
