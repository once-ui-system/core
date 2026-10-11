import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeInit } from "../components/ThemeInit";
import { ThemeProvider, useStyle } from "../contexts/ThemeProvider";

/**
 * tokens.css has always styled `data-desktop-size`, `data-tablet-size`,
 * `data-mobile-size` (the root font size per width range) and
 * `data-cursor-interactive`, but nothing in the API could set them: an app
 * had to write the attributes onto <html> by hand.
 */

const root = document.documentElement;
const knobs = [
  "data-desktop-size",
  "data-tablet-size",
  "data-mobile-size",
  "data-cursor-interactive",
];

afterEach(() => {
  localStorage.clear();
  for (const name of root.getAttributeNames()) {
    if (name.startsWith("data-")) root.removeAttribute(name);
  }
});

describe("root font size and cursor", () => {
  it("ThemeProvider writes them to <html>", () => {
    render(
      <ThemeProvider desktopSize="17" tabletSize="16" mobileSize="14" cursorInteractive="default">
        <span />
      </ThemeProvider>,
    );
    expect(root.getAttribute("data-desktop-size")).toBe("17");
    expect(root.getAttribute("data-tablet-size")).toBe("16");
    expect(root.getAttribute("data-mobile-size")).toBe("14");
    expect(root.getAttribute("data-cursor-interactive")).toBe("default");
  });

  it("leaves them off when not set, so the CSS defaults and app overrides stand", () => {
    render(
      <ThemeProvider brand="cyan">
        <span />
      </ThemeProvider>,
    );
    for (const name of knobs) expect(root.hasAttribute(name)).toBe(false);
  });

  it("setStyle changes them and a reload restores them", () => {
    let setStyle: ReturnType<typeof useStyle>["setStyle"] = () => {};
    function Grab() {
      setStyle = useStyle().setStyle;
      return null;
    }
    const first = render(
      <ThemeProvider>
        <Grab />
      </ThemeProvider>,
    );
    act(() => setStyle({ mobileSize: "13", cursorInteractive: "default" }));
    expect(root.getAttribute("data-mobile-size")).toBe("13");
    expect(localStorage.getItem("data-mobile-size")).toBe("13");
    first.unmount();
    root.removeAttribute("data-mobile-size");

    let seen: string | undefined;
    function Probe() {
      seen = useStyle().mobileSize;
      return null;
    }
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(seen).toBe("13");
    expect(root.getAttribute("data-mobile-size")).toBe("13");
  });

  it("ThemeInit sets them before the first paint", () => {
    const element = ThemeInit({ config: { desktopSize: "18", cursorInteractive: "default" } }) as {
      props: { dangerouslySetInnerHTML: { __html: string } };
    };
    new Function(element.props.dangerouslySetInnerHTML.__html)();
    expect(root.getAttribute("data-desktop-size")).toBe("18");
    expect(root.getAttribute("data-cursor-interactive")).toBe("default");
  });
});
