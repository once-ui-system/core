import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Avatar } from "../components/Avatar";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * The avatar is drawn as one image (`role="img"`), so whatever it shows (a
 * photo, initials or the empty placeholder) has to reach a screen reader as
 * that image's name, not as a label on a child the image role hides.
 */
describe("Avatar: accessible name", () => {
  it("names an initials avatar by its initials", async () => {
    const { container } = render(<Avatar value="LT" />, { wrapper });
    const img = screen.getByRole("img", { name: /LT/ });
    expect(img).toHaveTextContent("LT");
    await expectNoAxeViolations(container);
  });

  it("names an empty avatar", async () => {
    const { container } = render(<Avatar />, { wrapper });
    expect(screen.getByRole("img", { name: "Empty avatar" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("names an image avatar and renders the image", async () => {
    const { container } = render(<Avatar src="/me.png" />, { wrapper });
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("role", "img");
    expect(root).toHaveAccessibleName("Avatar");
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      expect.stringContaining("me.png"),
    );
    await expectNoAxeViolations(container);
  });

  it("lets an aria-label from the caller win", () => {
    render(<Avatar value="LT" aria-label="Lorant Toth" />, { wrapper });
    expect(screen.getByRole("img", { name: "Lorant Toth" })).toBeInTheDocument();
  });

  it("includes the status in the name of the avatar", async () => {
    const { container } = render(<Avatar value="LT" statusIndicator={{ scheme: "green" }} />, {
      wrapper,
    });
    expect(
      screen.getByRole("img", { name: "Avatar with initials LT, status: green" }),
    ).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});

describe("Avatar: states and sizes", () => {
  it("shows a busy skeleton while loading, without a stray class", async () => {
    const { container } = render(<Avatar loading value="LT" />, { wrapper });
    const skeleton = screen.getByRole("status", { name: "Loading avatar" });
    expect(skeleton).toHaveAttribute("aria-busy", "true");
    expect(skeleton.className).not.toMatch(/undefined/);
    expect(screen.queryByText("LT")).not.toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("sizes a numeric avatar in rem", () => {
    render(<Avatar value="A" size="4rem" />, { wrapper });
    const img = screen.getByRole("img", { name: /A/ });
    expect(img.style.width).toBe("4rem");
    expect(img.style.minHeight).toBe("4rem");
  });

  it("keeps the caller's style next to a numeric size", () => {
    render(<Avatar value="A" size="4rem" style={{ opacity: 0.5 }} />, { wrapper });
    const img = screen.getByRole("img", { name: /A/ });
    expect(img.style.opacity).toBe("0.5");
    expect(img.style.width).toBe("4rem");
  });

  it("shows the placeholder icon when `empty` overrides a value", () => {
    const { container } = render(<Avatar value="LT" empty />, { wrapper });
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("role", "img");
    expect(root.querySelector("svg")).toBeInTheDocument();
    expect(screen.queryByText("LT")).not.toBeInTheDocument();
  });

  it("refuses both value and src", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Avatar value="LT" src="/me.png" />, { wrapper })).toThrow(
      "Avatar cannot have both 'value' and 'src' props.",
    );
  });

  it("forwards the ref to the root", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Avatar ref={ref} value="LT" />, { wrapper });
    expect(ref.current).toBe(screen.getByRole("img", { name: /LT/ }));
  });

  it("is not focusable on its own", () => {
    render(<Avatar value="LT" />, { wrapper });
    expect(screen.getByRole("img", { name: /LT/ })).not.toHaveAttribute("tabindex");
  });
});
