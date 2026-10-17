import { act, render, screen } from "@testing-library/react";
import type React from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Kbd } from "../components/Kbd";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const setPlatform = (platform: string) =>
  vi.spyOn(window.navigator, "platform", "get").mockReturnValue(platform);

const caps = (root: ParentNode = document) =>
  Array.from(root.querySelectorAll("kbd")).map((kbd) => kbd.textContent);

/**
 * Shorty's and Stack's KeyTip take pre-drawn caps (`["⌘", "Z"]`) and show ⌘
 * to everyone; the headers print "Cmd" or "Ctrl" after an effect. This takes
 * the hotkey string useHotkeys registers and draws it for the platform.
 */
describe("Kbd keys", () => {
  it("draws mod as Ctrl and spells modifiers out off Apple platforms", () => {
    setPlatform("Win32");
    const { container } = render(<Kbd keys="mod+shift+z" />, { wrapper: wrap });
    expect(caps(container)).toEqual(["Ctrl", "Shift", "Z"]);
    expect(container).toHaveTextContent("Control+Shift+Z");
  });

  it("draws Apple symbols on Apple platforms", () => {
    setPlatform("MacIntel");
    const { container } = render(<Kbd keys="mod+alt+enter" />, { wrapper: wrap });
    expect(caps(container)).toEqual(["⌘", "⌥", "↵"]);
    expect(container).toHaveTextContent("Command+Option+Return");
  });

  it("names arrows, escape and space, and capitalises letters", () => {
    setPlatform("Linux x86_64");
    const { container } = render(<Kbd keys={["esc", "space", "up", "k"]} />, {
      wrapper: wrap,
    });
    expect(caps(container)).toEqual(["Esc", "Space", "↑", "K"]);
  });

  it("joins sequence steps with then and alternatives with or", () => {
    setPlatform("Win32");
    const { container } = render(<Kbd keys={["g i", "down"]} />, { wrapper: wrap });
    expect(caps(container)).toEqual(["G", "I", "↓"]);
    expect(container).toHaveTextContent("GthenI");
    expect(container).toHaveTextContent("or↓");
    expect(container).toHaveTextContent("G then I or Down Arrow");
  });

  it("shows the label before the keys", () => {
    setPlatform("Win32");
    render(<Kbd label="Undo" keys="mod+z" />, { wrapper: wrap });
    const tip = screen.getByText("Undo");
    expect(tip.textContent?.startsWith("Undo")).toBe(true);
  });

  it("hides the keycaps from assistive technology and speaks the combination", () => {
    setPlatform("MacIntel");
    render(
      <button type="button">
        <Kbd label="Search" keys="mod+k" />
      </button>,
      { wrapper: wrap },
    );
    for (const kbd of document.querySelectorAll("kbd")) {
      expect(kbd.closest('[aria-hidden="true"]')).not.toBeNull();
    }
    expect(screen.getByRole("button", { name: "Search Command+K" })).toBeInTheDocument();
  });

  it("renders Ctrl on the server and switches to ⌘ after hydrating on a Mac", async () => {
    setPlatform("MacIntel");
    const tree = (
      <LayoutProvider>
        <Kbd keys="mod+k" />
      </LayoutProvider>
    );
    const html = renderToString(tree);
    expect(html).toContain("Ctrl");
    expect(html).not.toContain("⌘");

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, tree);
    });
    expect(errors).not.toHaveBeenCalled();
    expect(caps(container)).toEqual(["⌘", "K"]);
    act(() => root?.unmount());
    container.remove();
  });

  it("has no axe violations in a sentence or a button", async () => {
    setPlatform("Win32");
    const { container } = render(
      <>
        <p>
          Press <Kbd keys="shift+?" /> for help.
        </p>
        <button type="button">
          <Kbd label="Save" keys="mod+s" />
        </button>
      </>,
      { wrapper: wrap },
    );
    await expectNoAxeViolations(container);
  });
});
