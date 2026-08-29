import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog, DropdownWrapper, ContextMenu } from ".";
import { LayoutProvider } from "../contexts";
import { KbarContent } from "../modules/navigation/Kbar";
import { resetScrollLockTestState } from "../internal/scrollLockState";
import { resetScrollLockState } from "../components/ScrollLock";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/",
}));

const defineScrollMetrics = (
  element: HTMLElement,
  {
    scrollTop = 10,
    scrollHeight = 600,
    clientHeight = 120,
  }: {
    scrollTop?: number;
    scrollHeight?: number;
    clientHeight?: number;
  } = {},
) => {
  Object.defineProperty(element, "scrollTop", {
    configurable: true,
    writable: true,
    value: scrollTop,
  });
  Object.defineProperty(element, "scrollHeight", {
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(element, "clientHeight", {
    configurable: true,
    value: clientHeight,
  });
  element.style.overflowY = "auto";
};

const createTouchEvent = (type: "touchstart" | "touchmove", clientY: number) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", {
    configurable: true,
    value: [{ clientY }],
  });
  return event;
};

const findScrollableAncestor = (target: HTMLElement): HTMLElement | null => {
  let current: HTMLElement | null = target;
  while (current && current !== document.body) {
    if (typeof current.className === "string" && current.className.includes("overflow-y-auto")) {
      return current;
    }

    const overflowY = window.getComputedStyle(current).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") {
      return current;
    }
    current = current.parentElement;
  }

  return null;
};

type KbarItem = {
  id: string;
  name: string;
  section: string;
  shortcut: string[];
  keywords: string;
};

const kbarItems: KbarItem[] = Array.from({ length: 8 }, (_, index) => ({
  id: `item-${index}`,
  name: `Kbar Item ${index + 1}`,
  section: "Quick actions",
  shortcut: ["Cmd", `${index + 1}`],
  keywords: "command palette action",
}));

const OverlayIntegrationHarness = () => (
  <LayoutProvider>
    <button type="button" data-testid="outside-scroll-target">
      Outside all overlays
    </button>
    <Dialog
      open
      onClose={() => undefined}
      title="Dialog overlay"
      stack
      children={
        <div data-testid="dialog-scroll-region" style={{ overflowY: "auto", maxHeight: "80px" }}>
          <button type="button">Dialog allowed action</button>
        </div>
      }
    />
    <DropdownWrapper
      open
      trigger={<button type="button">Open dropdown</button>}
      dropdown={
        <div data-testid="dropdown-scroll-region" style={{ overflowY: "auto", maxHeight: "80px" }}>
          <button type="button">Dropdown allowed action</button>
        </div>
      }
    />
    <ContextMenu
      open
      onOpenChange={() => undefined}
      dropdown={
        <div data-testid="context-scroll-region" style={{ overflowY: "auto", maxHeight: "80px" }}>
          <button type="button">Context allowed action</button>
        </div>
      }
    >
      <button type="button">Context anchor</button>
    </ContextMenu>
    <KbarContent open onClose={() => undefined} items={kbarItems} />
  </LayoutProvider>
);

beforeEach(() => {
  resetScrollLockState();
  resetScrollLockTestState();
  document.body.innerHTML = "";
});

describe("ScrollLock integration with concurrent overlays", () => {
  const setupTargets = async () => {
    render(<OverlayIntegrationHarness />);

    const topOption = await screen.findByText("Kbar Item 1");
    const backgroundTarget = await screen.findByRole("button", { name: "Dropdown allowed action" });
    const outsideTarget = screen.getByTestId("outside-scroll-target");

    const dropdownScrollRegion = screen.getByTestId("dropdown-scroll-region");
    const dialogScrollRegion = screen.getByTestId("dialog-scroll-region");
    const contextScrollRegion = screen.getByTestId("context-scroll-region");
    const kbarScrollRegion = findScrollableAncestor(topOption as HTMLElement);

    defineScrollMetrics(dropdownScrollRegion);
    defineScrollMetrics(dialogScrollRegion);
    defineScrollMetrics(contextScrollRegion);

    await waitFor(() => {
      expect(kbarScrollRegion).not.toBeNull();
    });
    defineScrollMetrics(kbarScrollRegion as HTMLElement);

    return {
      topTarget: kbarScrollRegion as HTMLElement,
      backgroundTarget,
      outsideTarget,
    };
  };

  it("allows wheel scroll in top and background allowed regions, blocks outside", async () => {
    const { topTarget, backgroundTarget, outsideTarget } = await setupTargets();

    const topEvent = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 80 });
    topTarget.dispatchEvent(topEvent);

    const backgroundEvent = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 80 });
    backgroundTarget.dispatchEvent(backgroundEvent);

    const outsideEvent = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 80 });
    outsideTarget.dispatchEvent(outsideEvent);

    expect(topEvent.defaultPrevented).toBe(false);
    expect(backgroundEvent.defaultPrevented).toBe(false);
    expect(outsideEvent.defaultPrevented).toBe(true);
  });

  it("allows touch scroll in top and background allowed regions, blocks outside", async () => {
    const { topTarget, backgroundTarget, outsideTarget } = await setupTargets();

    topTarget.dispatchEvent(createTouchEvent("touchstart", 120));
    const topMoveEvent = createTouchEvent("touchmove", 60);
    topTarget.dispatchEvent(topMoveEvent);

    backgroundTarget.dispatchEvent(createTouchEvent("touchstart", 120));
    const backgroundMoveEvent = createTouchEvent("touchmove", 60);
    backgroundTarget.dispatchEvent(backgroundMoveEvent);

    outsideTarget.dispatchEvent(createTouchEvent("touchstart", 120));
    const outsideMoveEvent = createTouchEvent("touchmove", 60);
    outsideTarget.dispatchEvent(outsideMoveEvent);

    expect(topMoveEvent.defaultPrevented).toBe(false);
    expect(backgroundMoveEvent.defaultPrevented).toBe(false);
    expect(outsideMoveEvent.defaultPrevented).toBe(true);
  });

  it("allows keyboard scroll keys in top and background allowed regions, blocks outside", async () => {
    const { topTarget, backgroundTarget, outsideTarget } = await setupTargets();

    const topEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "PageDown",
    });
    topTarget.dispatchEvent(topEvent);

    const backgroundEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "PageDown",
    });
    backgroundTarget.dispatchEvent(backgroundEvent);

    const outsideEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "PageDown",
    });
    outsideTarget.dispatchEvent(outsideEvent);

    expect(topEvent.defaultPrevented).toBe(false);
    expect(backgroundEvent.defaultPrevented).toBe(false);
    expect(outsideEvent.defaultPrevented).toBe(true);
  });
});
