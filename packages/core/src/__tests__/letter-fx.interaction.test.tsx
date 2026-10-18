import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LetterFx } from "../components/LetterFx";
import { expectNoAxeViolations } from "../test/axe";
import { mockReducedMotion } from "../test/fxTestUtils";

/** What is on screen: while a run is in flight the real text sits in a visually hidden copy for screen readers. */
const shown = (el: Element) => (el.querySelector('[aria-hidden="true"]') ?? el).textContent ?? "";

const settle = async (ms = 2000) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

/**
 * LetterFx scrambles its text into random characters and resolves it letter
 * by letter, on hover, at mount ("instant") or from the function handed to
 * onTrigger ("custom"). Whatever runs, it must end on the original text.
 */
describe("LetterFx", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders its text as is until triggered", async () => {
    const { container } = render(<LetterFx>Launch day</LetterFx>);
    expect(screen.getByText("Launch day")).toBeInTheDocument();
    vi.useRealTimers();
    await expectNoAxeViolations(container);
  });

  it("scrambles on hover and resolves back to the text", async () => {
    const charset = ["#"];
    render(<LetterFx charset={charset}>Hi there</LetterFx>);
    const el = screen.getByText("Hi there");
    fireEvent.mouseOver(el);
    // Spaces survive the scramble.
    expect(shown(el)).toBe("## #####");
    await settle();
    expect(shown(el)).toBe("Hi there");
  });

  it("ignores hovers while a run is in flight", async () => {
    const random = vi.spyOn(Math, "random");
    render(<LetterFx speed="slow">Hello</LetterFx>);
    const el = screen.getByText("Hello");
    fireEvent.mouseOver(el);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    const callsMidRun = random.mock.calls.length;
    fireEvent.mouseOver(el);
    fireEvent.mouseOver(el);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60);
    });
    // One extra scramble frame (5 letters) at most, not two more runs.
    expect(random.mock.calls.length - callsMidRun).toBeLessThanOrEqual(5);
    await settle(3000);
    expect(shown(el)).toBe("Hello");
  });

  it("does not react to hover with another trigger", () => {
    render(
      <LetterFx trigger="custom" charset={["#"]}>
        Hello
      </LetterFx>,
    );
    fireEvent.mouseOver(screen.getByText("Hello"));
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("runs once at mount with trigger instant", async () => {
    const { container } = render(
      <LetterFx trigger="instant" charset={["#"]}>
        Hello
      </LetterFx>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(shown(el)).toBe("#####");
    await settle();
    expect(shown(el)).toBe("Hello");
    await settle();
    expect(shown(el)).toBe("Hello");
  });

  it("hands a start function to onTrigger with trigger custom", async () => {
    let start: (() => void) | undefined;
    const { container } = render(
      <LetterFx
        trigger="custom"
        charset={["#"]}
        onTrigger={(fn) => {
          start = fn;
        }}
      >
        Hello
      </LetterFx>,
    );
    expect(start).toBeTypeOf("function");
    act(() => start?.());
    const el = container.firstElementChild as HTMLElement;
    expect(shown(el)).toBe("#####");
    await settle();
    expect(shown(el)).toBe("Hello");
  });

  it("resolves faster at speed fast than slow", async () => {
    const { container: fast } = render(<LetterFx speed="fast">Hello</LetterFx>);
    const { container: slow } = render(<LetterFx speed="slow">Hello</LetterFx>);
    fireEvent.mouseOver(fast.firstElementChild as HTMLElement);
    fireEvent.mouseOver(slow.firstElementChild as HTMLElement);
    await settle(200);
    expect(fast.textContent).toBe("Hello");
    expect(slow.textContent).not.toBe("Hello");
  });

  // The scramble ran whatever the visitor's motion preference.
  it("keeps the text still under reduced motion, on every trigger", async () => {
    mockReducedMotion(true);
    let fire: (() => void) | undefined;
    const { container } = render(
      <>
        <LetterFx charset={["#"]}>Hover me</LetterFx>
        <LetterFx trigger="instant" charset={["#"]}>
          At mount
        </LetterFx>
        <LetterFx
          trigger="custom"
          charset={["#"]}
          onTrigger={(trigger) => {
            fire = trigger;
          }}
        >
          On demand
        </LetterFx>
      </>,
    );
    const random = vi.spyOn(Math, "random");
    fireEvent.mouseOver(screen.getByText("Hover me"));
    act(() => fire?.());
    expect(container.textContent).toBe("Hover meAt mountOn demand");
    await settle(100);
    expect(container.textContent).toBe("Hover meAt mountOn demand");
    expect(random).not.toHaveBeenCalled();
  });

  it("follows new text", () => {
    const { rerender } = render(<LetterFx>One</LetterFx>);
    rerender(<LetterFx>Two</LetterFx>);
    expect(screen.getByText("Two")).toBeInTheDocument();
  });

  it("still renders content that is not a plain string", () => {
    render(<LetterFx>{2026}</LetterFx>);
    expect(screen.getByText("2026")).toBeInTheDocument();
  });

  it("forwards ref, className and style to the span", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <LetterFx ref={ref} className="headline" style={{ color: "red" }}>
        Hello
      </LetterFx>,
    );
    expect(ref.current?.tagName).toBe("SPAN");
    expect(ref.current).toHaveClass("headline");
    expect(ref.current?.style.color).toBe("red");
  });
});
