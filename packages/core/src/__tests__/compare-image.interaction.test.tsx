import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { CompareImage } from "../components/CompareImage";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const Compare = () => (
  <CompareImage
    leftContent={{ src: "/before.jpg", alt: "Before" }}
    rightContent={{ src: "/after.jpg", alt: "After" }}
  />
);

const handle = () => screen.getByRole("slider", { name: "Drag to compare" });
const clips = () =>
  screen
    .getAllByRole("img")
    .map((img) => (img.closest("[style*='clip-path']") as HTMLElement)?.style.clipPath);

/**
 * Two images stacked, with a handle that sets how much of each shows. The
 * handle is a slider: dragged with a mouse or finger, or moved with the
 * arrow keys, Home and End, and it reports where it is.
 */
describe("CompareImage: rendering", () => {
  it("shows both images split down the middle and passes axe", async () => {
    const { container } = render(<Compare />, { wrapper });
    expect(screen.getByRole("img", { name: "Before" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "After" })).toBeInTheDocument();
    expect(handle()).toHaveAttribute("aria-valuenow", "50");
    expect(clips()).toEqual(["inset(0 50% 0 0)", "inset(0 0 0 50%)"]);
    await expectNoAxeViolations(container);
  });

  it("renders node content on either side", () => {
    render(<CompareImage leftContent={{ src: <p>Old</p> }} rightContent={{ src: <p>New</p> }} />, {
      wrapper,
    });
    expect(screen.getByText("Old")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
  });
});

describe("CompareImage: keyboard", () => {
  it("is reachable with Tab and moves with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<Compare />, { wrapper });
    await user.tab();
    expect(handle()).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(handle()).toHaveAttribute("aria-valuenow", "55");
    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowDown}");
    expect(handle()).toHaveAttribute("aria-valuenow", "40");
    await user.keyboard("{Shift>}{ArrowDown}{/Shift}");
    expect(handle()).toHaveAttribute("aria-valuenow", "30");
    expect(clips()).toEqual(["inset(0 70% 0 0)", "inset(0 0 0 30%)"]);
  });

  it("jumps to the ends with Home and End and stays in range", async () => {
    const user = userEvent.setup();
    render(<Compare />, { wrapper });
    handle().focus();
    await user.keyboard("{End}{ArrowRight}");
    expect(handle()).toHaveAttribute("aria-valuenow", "100");
    await user.keyboard("{Home}{ArrowLeft}");
    expect(handle()).toHaveAttribute("aria-valuenow", "0");
  });
});

describe("CompareImage: pointer", () => {
  const box = (container: HTMLElement) => {
    const root = container.firstElementChild as HTMLElement;
    vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
      left: 100,
      width: 400,
      top: 0,
      height: 200,
    } as DOMRect);
    return root;
  };

  it("follows a mouse drag from the handle, clamped to the box", () => {
    const { container } = render(<Compare />, { wrapper });
    box(container);
    fireEvent.mouseDown(handle());
    fireEvent.mouseMove(document, { clientX: 200 });
    expect(handle()).toHaveAttribute("aria-valuenow", "25");
    fireEvent.mouseMove(document, { clientX: 900 });
    expect(handle()).toHaveAttribute("aria-valuenow", "100");
    fireEvent.mouseUp(document);
    fireEvent.mouseMove(document, { clientX: 300 });
    expect(handle()).toHaveAttribute("aria-valuenow", "100");
  });

  it("follows a touch drag", () => {
    const { container } = render(<Compare />, { wrapper });
    box(container);
    fireEvent.touchStart(handle());
    fireEvent.touchMove(document, { touches: [{ clientX: 400 }] });
    expect(handle()).toHaveAttribute("aria-valuenow", "75");
    fireEvent.touchEnd(document);
  });

  it("ignores mouse moves that did not start on the handle", () => {
    const { container } = render(<Compare />, { wrapper });
    box(container);
    fireEvent.mouseMove(document, { clientX: 200 });
    expect(handle()).toHaveAttribute("aria-valuenow", "50");
  });
});
