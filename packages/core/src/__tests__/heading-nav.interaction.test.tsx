import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { HeadingNav } from "../modules/navigation/HeadingNav";
import { expectNoAxeViolations } from "../test/axe";
import { mockReducedMotion } from "../test/fxTestUtils";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const Page = (props: React.ComponentProps<typeof HeadingNav>) => (
  <>
    <HeadingNav {...props} />
    <main>
      <h2 id="install">Install</h2>
      <h3 id="pnpm">With pnpm</h3>
      <h2 id="usage">Usage</h2>
      <h2 id="skip" data-exclude-nav>
        Skipped
      </h2>
    </main>
  </>
);

// jsdom throws computing a style with calc(var()) (the links' indent), which
// role queries do for every candidate, so find the links by their text.
const links = () => Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href^='#']"));
const link = (name: string) =>
  screen.getByText(name, { selector: "a *" }).closest("a") as HTMLElement;

const placeAt = (id: string, top: number) => {
  const el = document.getElementById(id) as HTMLElement;
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({ top } as DOMRect);
};

afterEach(() => {
  vi.useRealTimers();
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
});

/**
 * The "On this page" list: one link per h2-h6 on the page (minus the ones
 * marked data-exclude-nav), indented by level, scrolling to its section on
 * click or Enter, and telling assistive tech which section is current.
 */
describe("HeadingNav: rendering", () => {
  it("lists the page's headings as links and passes axe", async () => {
    const { container } = render(<Page />, { wrapper });
    const all = links();
    expect(all.map((l) => l.textContent)).toEqual(["Install", "With pnpm", "Usage"]);
    expect(all.map((l) => l.getAttribute("href"))).toEqual(["#install", "#pnpm", "#usage"]);
    expect(screen.getByText("On this page")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("indents a deeper heading", () => {
    render(<Page />, { wrapper });
    expect(link("With pnpm").style.paddingLeft).toBe("calc(1 * var(--static-space-8))");
    expect(link("Install").style.paddingLeft).toBe("calc(0 * var(--static-space-8))");
  });

  it("drops the header with header={false}", () => {
    render(<Page header={false} />, { wrapper });
    expect(screen.queryByText("On this page")).not.toBeInTheDocument();
    expect(links()).toHaveLength(3);
  });

  it("renders nothing inside when the page has no headings", () => {
    const { container } = render(<HeadingNav />, { wrapper });
    expect(container.firstElementChild).toBeEmptyDOMElement();
  });

  it("marks the first section current to begin with", () => {
    render(<Page />, { wrapper });
    expect(link("Install")).toHaveAttribute("aria-current", "location");
    expect(link("Usage")).not.toHaveAttribute("aria-current");
  });
});

describe("HeadingNav: interaction", () => {
  it("scrolls to the section on click, 150px above it, and marks it current", async () => {
    const user = userEvent.setup();
    render(<Page />, { wrapper });
    placeAt("usage", 900);
    await user.click(link("Usage"));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 750, behavior: "smooth" });
    expect(link("Usage")).toHaveAttribute("aria-current", "location");
    expect(link("Install")).not.toHaveAttribute("aria-current");
  });

  it("jumps to the section instead of smooth-scrolling under reduced motion", async () => {
    mockReducedMotion(true);
    const user = userEvent.setup();
    render(<Page />, { wrapper });
    placeAt("usage", 900);
    await user.click(link("Usage"));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 750, behavior: "auto" });
  });

  it("follows a link from the keyboard", async () => {
    const user = userEvent.setup();
    render(<Page />, { wrapper });
    await user.tab();
    await user.tab();
    expect(link("With pnpm")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(link("With pnpm")).toHaveAttribute("aria-current", "location");
  });

  it("moves the current section as the page scrolls past it", () => {
    vi.useFakeTimers();
    render(<Page />, { wrapper });
    // Positions are read on mount and again on resize.
    placeAt("install", 0);
    placeAt("pnpm", 500);
    placeAt("usage", 1200);
    fireEvent(window, new Event("resize"));

    Object.defineProperty(window, "scrollY", { configurable: true, value: 1100 });
    act(() => {
      fireEvent.scroll(window);
      vi.advanceTimersByTime(50);
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(link("Usage")).toHaveAttribute("aria-current", "location");
  });
});
