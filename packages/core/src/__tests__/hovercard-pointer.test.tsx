import { fireEvent, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HoverCard } from "../components/HoverCard.js";
import { LayoutProvider } from "../contexts/LayoutProvider.js";

/**
 * 2.2's CursorCard and Hover cases (#184, #187), against their 3.0 home,
 * HoverCard `placement="cursor"` / `"cover"`: the cursor card's own
 * `transform` replaced its translate props, and both took any device with
 * touch events (a touchscreen laptop with a mouse) for a phone. The pointer is
 * now read from `(hover: none)`. A bare number is px in 3.0.
 */

const inLayout = (ui: ReactElement) => render(<LayoutProvider>{ui}</LayoutProvider>);

const hoverNone = () =>
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query === "(hover: none)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );

afterEach(() => {
  vi.restoreAllMocks();
});

describe("HoverCard placement=cursor", () => {
  it("composes the cursor position with translateX/translateY", () => {
    // jsdom has `ontouchstart`, which 2.x read as a touch device.
    expect("ontouchstart" in window).toBe(true);
    const { getByText } = inLayout(
      <HoverCard placement="cursor" trigger={<span>trigger</span>} translateX={16}>
        <span>card</span>
      </HoverCard>,
    );
    fireEvent.mouseEnter(getByText("trigger").parentElement as HTMLElement);
    const card = getByText("card").parentElement as HTMLElement;
    expect(card.style.transform).toMatch(/^translate\(calc\(0px - 100%\)/);
    expect(card.style.transform).toMatch(/ translate\(16px, 0\)$/);
  });

  it("does not follow the pointer where it cannot hover", () => {
    hoverNone();
    const { getByText, queryByText } = inLayout(
      <HoverCard placement="cursor" trigger={<span>trigger</span>}>
        <span>card</span>
      </HoverCard>,
    );
    fireEvent.mouseEnter(getByText("trigger").parentElement as HTMLElement);
    expect(queryByText("card")).toBeNull();
  });
});
