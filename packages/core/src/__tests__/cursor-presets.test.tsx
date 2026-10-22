import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Flex } from "../components/Flex";
import { Grid } from "../components/Grid";
import { ThemeInit } from "../components/ThemeInit";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ThemeProvider } from "../contexts/ThemeProvider";
import { cursorProps } from "../utils/cursor";

const root = document.documentElement;
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

afterEach(() => {
  localStorage.clear();
  root.removeAttribute("data-cursor");
});

describe("cursorProps", () => {
  it("writes a preset as data-cursor, a known keyword as a class, anything else inline", () => {
    expect(cursorProps("soft")).toEqual({ attributes: { "data-cursor": "soft" } });
    expect(cursorProps("system")).toEqual({ attributes: { "data-cursor": "system" } });
    expect(cursorProps("pointer")).toEqual({ className: "cursor-pointer", attributes: {} });
    expect(cursorProps("crosshair")).toEqual({ style: "crosshair", attributes: {} });
    expect(cursorProps(undefined)).toEqual({ attributes: {} });
  });
});

describe("Flex and Grid cursor", () => {
  it("a preset scopes to the subtree, with no class or inline cursor", () => {
    const { container } = render(<Flex cursor="rounded" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute("data-cursor")).toBe("rounded");
    expect(el.className).not.toMatch(/cursor-/);
    expect(el.style.cursor).toBe("");
  });

  it("a keyword with a class is not also written inline, so a preset can restyle it", () => {
    const { container } = render(<Grid cursor="pointer" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/\bcursor-pointer\b/);
    expect(el.style.cursor).toBe("");
  });

  it("keeps a keyword when a style object moves Flex to the client", () => {
    // ClientFlex used to drop every string cursor.
    const { container } = render(<Flex cursor="interactive" style={{ color: "red" }} />, {
      wrapper,
    });
    expect((container.firstElementChild as HTMLElement).className).toMatch(
      /\bcursor-interactive\b/,
    );
  });
});

describe("a node that follows the pointer", () => {
  // A mouse: jsdom reports touch support, and the setup's matchMedia matches nothing.
  beforeEach(() => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query === "(pointer: fine)",
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
  });
  afterEach(() => vi.restoreAllMocks());

  const setup = () => {
    const result = render(
      <Flex cursor={<span data-testid="dot">•</span>} padding="16">
        <span data-testid="surface">surface</span>
        <button type="button" style={{ cursor: "pointer" }}>
          Buy
        </button>
      </Flex>,
      { wrapper },
    );
    const host = result.container.firstElementChild as HTMLElement;
    // jsdom has no stylesheet: stand in for `[data-cursor-follow] { cursor: none }`.
    host.style.cursor = "none";
    for (const child of host.querySelectorAll<HTMLElement>("span")) child.style.cursor = "none";
    const follower = () => document.body.querySelector("[data-testid='dot']")?.parentElement;
    return { ...result, host, follower };
  };

  it("hides the native cursor through data-cursor-follow, not an inline style", () => {
    const { host } = setup();
    expect(host.hasAttribute("data-cursor-follow")).toBe(true);
  });

  it("shows over the surface and steps aside over a control", () => {
    const { host, follower, getByTestId, getByRole } = setup();
    const surface = getByTestId("surface");

    act(() => {
      fireEvent.pointerEnter(host, { clientX: 10, clientY: 10, pointerType: "mouse" });
      fireEvent.pointerMove(surface, { clientX: 12, clientY: 12, pointerType: "mouse" });
    });
    expect(follower()?.hasAttribute("data-visible")).toBe(true);

    act(() => {
      fireEvent.pointerMove(getByRole("button"), {
        clientX: 40,
        clientY: 12,
        pointerType: "mouse",
      });
    });
    expect(follower()?.hasAttribute("data-visible")).toBe(false);

    act(() => {
      fireEvent.pointerMove(surface, { clientX: 14, clientY: 12, pointerType: "mouse" });
    });
    expect(follower()?.hasAttribute("data-visible")).toBe(true);

    act(() => {
      fireEvent.pointerLeave(host, { pointerType: "mouse" });
    });
    expect(follower()?.hasAttribute("data-visible")).toBe(false);
  });

  it("never shows for touch", () => {
    const { host, follower, getByTestId } = setup();
    act(() => {
      fireEvent.pointerEnter(host, { clientX: 10, clientY: 10, pointerType: "touch" });
      fireEvent.pointerMove(getByTestId("surface"), {
        clientX: 12,
        clientY: 12,
        pointerType: "touch",
      });
    });
    expect(follower()?.hasAttribute("data-visible")).toBe(false);
  });
});

describe("app-wide preset", () => {
  it("ThemeProvider writes data-cursor to <html>", () => {
    render(
      <ThemeProvider cursor="soft">
        <span />
      </ThemeProvider>,
    );
    expect(root.getAttribute("data-cursor")).toBe("soft");
  });

  it("ThemeInit sets it before the first paint", () => {
    const element = ThemeInit({ config: { cursor: "dot" } }) as {
      props: { dangerouslySetInnerHTML: { __html: string } };
    };
    new Function(element.props.dangerouslySetInnerHTML.__html)();
    expect(root.getAttribute("data-cursor")).toBe("dot");
  });
});
