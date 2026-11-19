import { act, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "../contexts/ThemeProvider";
import { elementTheme, useElementTheme } from "../hooks/useElementTheme";

const tree = (html: string) => {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.appendChild(host);
  return host.querySelector("#t") as Element;
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("elementTheme", () => {
  it("is the nearest light or dark, flipped by each invert between", () => {
    expect(elementTheme(tree('<div data-theme="dark"><i id="t"></i></div>'), "light")).toBe("dark");
    expect(elementTheme(tree('<div data-theme="invert"><i id="t"></i></div>'), "light")).toBe(
      "dark",
    );
    expect(
      elementTheme(
        tree('<div data-theme="light"><div data-theme="invert"><i id="t"></i></div></div>'),
        "dark",
      ),
    ).toBe("dark");
    expect(
      elementTheme(
        tree('<div data-theme="invert"><div data-theme="invert"><i id="t"></i></div></div>'),
        "dark",
      ),
    ).toBe("dark");
    expect(elementTheme(tree('<i id="t" data-theme="invert"></i>'), "dark")).toBe("light");
  });

  it("falls back to the page's theme", () => {
    expect(elementTheme(tree('<i id="t"></i>'), "dark")).toBe("dark");
    expect(elementTheme(null, "light")).toBe("light");
  });
});

describe("useElementTheme", () => {
  const Probe = () => {
    const ref = useRef<HTMLSpanElement>(null);
    const theme = useElementTheme(ref);
    return (
      <span ref={ref} data-testid="probe">
        {theme}
      </span>
    );
  };

  it("reads its subtree and follows a data-theme changed above it", async () => {
    const { getByTestId } = render(
      <ThemeProvider theme="light">
        <div data-theme="invert" data-testid="band">
          <Probe />
        </div>
      </ThemeProvider>,
    );
    expect(getByTestId("probe").textContent).toBe("dark");
    await act(async () => {
      getByTestId("band").setAttribute("data-theme", "light");
    });
    expect(getByTestId("probe").textContent).toBe("light");
  });
});
