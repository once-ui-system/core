import React, { useRef } from "react";
import { render } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ScrollLock, resetScrollLockState } from "../components/ScrollLock";

const defineScrollMetrics = (
  element: HTMLElement,
  {
    scrollTop = 0,
    scrollHeight = 400,
    clientHeight = 100,
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
};

const createTouchEvent = (type: string, clientY: number) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", {
    configurable: true,
    value: [{ clientY }],
  });
  return event;
};

const ScrollLockHarness = ({
  enabled = true,
  includeAllowedElement = false,
  scrollable = false,
}: {
  enabled?: boolean;
  includeAllowedElement?: boolean;
  scrollable?: boolean;
}) => {
  const allowedRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {includeAllowedElement && (
        <div ref={allowedRef} data-testid="allowed-root">
          <div
            data-testid="allowed-scrollable"
            style={{ overflowY: scrollable ? "auto" : "visible" }}
          >
            <button type="button">Allowed child</button>
          </div>
        </div>
      )}
      <button type="button">Outside child</button>
      <ScrollLock enabled={enabled} allowScrollInElement={includeAllowedElement ? allowedRef : undefined} />
    </>
  );
};

const DualScrollLockHarness = () => {
  const baseAllowedRef = useRef<HTMLDivElement>(null);
  const topAllowedRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={baseAllowedRef} data-testid="base-allowed-root">
        <div data-testid="base-scrollable" style={{ overflowY: "auto" }}>
          <button type="button">Base allowed child</button>
        </div>
      </div>
      <div ref={topAllowedRef} data-testid="top-allowed-root">
        <div data-testid="top-scrollable" style={{ overflowY: "auto" }}>
          <button type="button">Top allowed child</button>
        </div>
      </div>
      <button type="button">Outside child</button>
      <ScrollLock enabled allowScrollInElement={baseAllowedRef} />
      <ScrollLock enabled allowScrollInElement={topAllowedRef} />
    </>
  );
};

beforeEach(() => {
  resetScrollLockState();
  document.body.innerHTML = "";
});

describe("ScrollLock", () => {
  it("does not attach listeners when enabled is false", () => {
    const addSpy = vi.spyOn(window, "addEventListener");

    render(<ScrollLock enabled={false} />);

    expect(addSpy).not.toHaveBeenCalledWith("wheel", expect.any(Function), expect.anything());
    expect(addSpy).not.toHaveBeenCalledWith("touchmove", expect.any(Function), expect.anything());
    expect(addSpy).not.toHaveBeenCalledWith("keydown", expect.any(Function), expect.anything());
  });

  it("does not prevent wheel events when disabled", () => {
    render(<ScrollLock enabled={false} />);

    const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 80 });
    document.body.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it("prevents wheel events when enabled with no allowed element", () => {
    render(
      <>
        <button type="button">Outside child</button>
        <ScrollLock enabled />
      </>,
    );

    const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 80 });
    document.body.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("prevents wheel events outside the allowed element", () => {
    const { getByRole } = render(
      <ScrollLockHarness enabled includeAllowedElement scrollable />,
    );
    const outside = getByRole("button", { name: "Outside child" });
    const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 80 });

    outside.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("allows wheel events inside a scrollable allowed element", () => {
    const { getByTestId, getByRole } = render(
      <ScrollLockHarness enabled includeAllowedElement scrollable />,
    );
    const scrollable = getByTestId("allowed-scrollable");
    const allowedChild = getByRole("button", { name: "Allowed child" });
    defineScrollMetrics(scrollable, { scrollTop: 10, scrollHeight: 500, clientHeight: 100 });

    const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 80 });
    allowedChild.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it("prevents wheel events at the bottom of a scrollable allowed element", () => {
    const { getByTestId, getByRole } = render(
      <ScrollLockHarness enabled includeAllowedElement scrollable />,
    );
    const scrollable = getByTestId("allowed-scrollable");
    const allowedChild = getByRole("button", { name: "Allowed child" });
    defineScrollMetrics(scrollable, { scrollTop: 400, scrollHeight: 400, clientHeight: 100 });

    const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 80 });
    allowedChild.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("prevents wheel events at the top of a scrollable allowed element when scrolling upward", () => {
    const { getByTestId, getByRole } = render(
      <ScrollLockHarness enabled includeAllowedElement scrollable />,
    );
    const scrollable = getByTestId("allowed-scrollable");
    const allowedChild = getByRole("button", { name: "Allowed child" });
    defineScrollMetrics(scrollable, { scrollTop: 0, scrollHeight: 400, clientHeight: 100 });

    const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: -80 });
    allowedChild.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("prevents wheel events inside a non-scrollable allowed element", () => {
    const { getByRole } = render(<ScrollLockHarness enabled includeAllowedElement scrollable={false} />);
    const allowedChild = getByRole("button", { name: "Allowed child" });

    const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 80 });
    allowedChild.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("allows wheel scrolling in an allowed container when multiple instances are mounted", () => {
    const { getByRole, getByTestId } = render(<DualScrollLockHarness />);
    const topScrollable = getByTestId("top-scrollable");
    const topAllowedChild = getByRole("button", { name: "Top allowed child" });

    defineScrollMetrics(topScrollable, { scrollTop: 10, scrollHeight: 600, clientHeight: 100 });

    const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 60 });
    topAllowedChild.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it("keeps outside scrolling blocked when multiple instances are mounted", () => {
    const { getByRole } = render(<DualScrollLockHarness />);
    const outside = getByRole("button", { name: "Outside child" });
    const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 60 });

    outside.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("prevents touch scroll outside the allowed element", () => {
    const { getByRole } = render(
      <ScrollLockHarness enabled includeAllowedElement scrollable />,
    );
    const outside = getByRole("button", { name: "Outside child" });

    outside.dispatchEvent(createTouchEvent("touchstart", 100));
    const moveEvent = createTouchEvent("touchmove", 50);
    outside.dispatchEvent(moveEvent);

    expect(moveEvent.defaultPrevented).toBe(true);
  });

  it("allows touch scroll inside a scrollable allowed element", () => {
    const { getByTestId, getByRole } = render(
      <ScrollLockHarness enabled includeAllowedElement scrollable />,
    );
    const scrollable = getByTestId("allowed-scrollable");
    const allowedChild = getByRole("button", { name: "Allowed child" });
    defineScrollMetrics(scrollable, { scrollTop: 10, scrollHeight: 500, clientHeight: 100 });

    allowedChild.dispatchEvent(createTouchEvent("touchstart", 100));
    const moveEvent = createTouchEvent("touchmove", 50);
    allowedChild.dispatchEvent(moveEvent);

    expect(moveEvent.defaultPrevented).toBe(false);
  });

  it.each(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "])(
    'prevents keyboard scroll key "%s" outside the allowed element',
    (key) => {
      const { getByRole } = render(
        <ScrollLockHarness enabled includeAllowedElement scrollable />,
      );
      const outside = getByRole("button", { name: "Outside child" });
      const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key });

      outside.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    },
  );

  it("allows keyboard scroll keys inside the allowed element", () => {
    const { getByRole } = render(
      <ScrollLockHarness enabled includeAllowedElement scrollable />,
    );
    const allowedChild = getByRole("button", { name: "Allowed child" });
    const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "ArrowDown" });

    allowedChild.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it("removes all event listeners on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<ScrollLockHarness enabled includeAllowedElement scrollable />);

    unmount();

    expect(addSpy).toHaveBeenCalledWith("wheel", expect.any(Function), { passive: false, capture: true });
    expect(addSpy).toHaveBeenCalledWith("touchstart", expect.any(Function), { passive: true, capture: true });
    expect(addSpy).toHaveBeenCalledWith("touchmove", expect.any(Function), { passive: false, capture: true });
    expect(addSpy).toHaveBeenCalledWith("keydown", expect.any(Function), { capture: true });
    expect(removeSpy).toHaveBeenCalledWith("wheel", expect.any(Function), { capture: true });
    expect(removeSpy).toHaveBeenCalledWith("touchstart", expect.any(Function), { capture: true });
    expect(removeSpy).toHaveBeenCalledWith("touchmove", expect.any(Function), { capture: true });
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function), { capture: true });
  });

  it("does not fire listeners after being disabled via prop change", () => {
    const { rerender, getByRole } = render(<ScrollLockHarness enabled />);
    rerender(<ScrollLockHarness enabled={false} />);

    const outside = getByRole("button", { name: "Outside child" });
    const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 80 });
    outside.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });
});
