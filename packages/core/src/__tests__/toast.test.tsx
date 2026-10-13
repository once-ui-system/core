import { act, fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ToastProvider, useToast } from "../contexts/ToastProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ToastProvider>{children}</ToastProvider>
  </LayoutProvider>
);

/** Exposes the context to the test, the way a consumer component reads it. */
let api: ReturnType<typeof useToast>;
const Capture = () => {
  api = useToast();
  return null;
};

const toastWith = (text: string) =>
  screen.queryByText(text)?.closest('[role="status"], [role="alert"]');

/**
 * A toast must never re-run a consumer's effects. `addToast` and
 * `removeToast` were recreated on every render of the provider, and adding a
 * toast re-renders it, so an effect that listed `addToast` re-ran each time a
 * toast appeared. In Kinetic that effect loaded the document: a "saved"
 * toast fetched it again and put the server's copy over the user's edits.
 */
describe("ToastProvider identity", () => {
  it("runs a consumer effect that depends on addToast once across several toasts", () => {
    const effect = vi.fn();
    const Consumer = () => {
      const { addToast, removeToast } = useToast();
      // biome-ignore lint/correctness/useExhaustiveDependencies: depending on the callbacks is the point of the test
      useEffect(() => {
        effect();
      }, [addToast, removeToast]);
      return (
        <button type="button" onClick={() => addToast({ variant: "success", message: "Saved" })}>
          Save
        </button>
      );
    };

    render(<Consumer />, { wrapper: wrap });
    const save = screen.getByRole("button", { name: "Save" });
    fireEvent.click(save);
    fireEvent.click(save);
    fireEvent.click(save);

    expect(screen.getAllByText("Saved")).toHaveLength(3);
    expect(effect).toHaveBeenCalledTimes(1);
  });

  it("returns the new toast's id, which removeToast takes", () => {
    render(<Capture />, { wrapper: wrap });

    let first = "";
    let second = "";
    act(() => {
      first = api.addToast({ variant: "info", message: "First" });
      second = api.addToast({ variant: "info", message: "Second" });
    });

    expect(typeof first).toBe("string");
    expect(first).not.toBe(second);
    expect(api.toasts.map((toast) => toast.id)).toEqual([first, second]);

    act(() => api.removeToast(first));
    expect(screen.queryByText("First")).toBeNull();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});

describe("toast duration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps today's six seconds by default", () => {
    render(<Capture />, { wrapper: wrap });
    act(() => {
      api.addToast({ variant: "success", message: "Default" });
    });

    act(() => vi.advanceTimersByTime(5999));
    expect(screen.getByText("Default")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("Default")).toBeNull();
  });

  it("honours a per-toast duration", () => {
    render(<Capture />, { wrapper: wrap });
    act(() => {
      api.addToast({ variant: "success", message: "Short", duration: 1000 });
      api.addToast({ variant: "success", message: "Long", duration: 3000 });
    });

    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText("Short")).toBeNull();
    expect(screen.getByText("Long")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.queryByText("Long")).toBeNull();
  });

  it("stays up until closed with an infinite duration", () => {
    render(<Capture />, { wrapper: wrap });
    act(() => {
      api.addToast({ variant: "warning", message: "Sticky", duration: Infinity });
    });

    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText("Sticky")).toBeInTheDocument();
  });

  it("pauses while hovered and resumes with what was left", () => {
    render(<Capture />, { wrapper: wrap });
    act(() => {
      api.addToast({ variant: "info", message: "Hover me", duration: 1000 });
    });

    act(() => vi.advanceTimersByTime(600));
    fireEvent.mouseEnter(toastWith("Hover me") as Element);
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByText("Hover me")).toBeInTheDocument();

    fireEvent.mouseLeave(toastWith("Hover me") as Element);
    act(() => vi.advanceTimersByTime(399));
    expect(screen.getByText("Hover me")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("Hover me")).toBeNull();
  });

  it("pauses while focus is inside it", () => {
    render(<Capture />, { wrapper: wrap });
    act(() => {
      api.addToast({
        variant: "info",
        message: "Focus me",
        duration: 1000,
        action: (
          <button type="button" data-testid="undo">
            Undo
          </button>
        ),
      });
    });

    const undo = screen.getByTestId("undo");
    act(() => undo.focus());
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByText("Focus me")).toBeInTheDocument();

    act(() => undo.blur());
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText("Focus me")).toBeNull();
  });
});

describe("toast announcements", () => {
  it("is a polite status for everything but danger", () => {
    render(<Capture />, { wrapper: wrap });
    act(() => {
      api.addToast({ variant: "success", message: "Saved" });
      api.addToast({ variant: "info", message: "Heads up" });
      api.addToast({ variant: "warning", message: "Careful" });
    });

    for (const text of ["Saved", "Heads up", "Careful"]) {
      const toast = toastWith(text);
      expect(toast).toHaveAttribute("role", "status");
      expect(toast).toHaveAttribute("aria-live", "polite");
    }
  });

  it("is an alert for danger", () => {
    render(<Capture />, { wrapper: wrap });
    act(() => {
      api.addToast({ variant: "danger", message: "Failed" });
    });

    expect(toastWith("Failed")).toHaveAttribute("role", "alert");
  });

  it("has no axe violations", async () => {
    render(<Capture />, { wrapper: wrap });
    act(() => {
      api.addToast({ variant: "success", message: "Saved" });
      api.addToast({ variant: "danger", message: "Failed" });
    });

    await expectNoAxeViolations(document.body);
  });
});
