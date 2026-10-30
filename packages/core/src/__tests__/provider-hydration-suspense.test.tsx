import { act } from "@testing-library/react";
import React, { Suspense } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { DataThemeProvider } from "../contexts/DataThemeProvider";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ThemeProvider, useTheme } from "../contexts/ThemeProvider";

/**
 * CodeBlock, the charts, Map and MediaUpload are React.lazy behind
 * `<Suspense fallback={null}>`. The providers update their state as they
 * mount; done urgently, that update reached the boundaries still waiting for
 * their chunk, and React threw away the server HTML for the empty fallback.
 * The page collapsed and grew back when the chunk came: a layout shift of
 * 0.28 on every docs page with code. Mounting must leave that HTML alone.
 */
const Providers = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ThemeProvider theme="system">
      <DataThemeProvider>{children}</DataThemeProvider>
    </ThemeProvider>
  </LayoutProvider>
);

// Reads the theme, like every component inside a CodeBlock.
const Server = () => {
  useTheme();
  return <p id="lazy">server html</p>;
};

let container: HTMLDivElement;
afterEach(() => {
  container?.remove();
  document.documentElement.removeAttribute("data-theme");
});

describe("providers mounting around a lazy component", () => {
  it("keep the server HTML of a Suspense boundary that is still loading", async () => {
    // ThemeInit painted light for this visitor; the server rendered the
    // default (dark), so the provider has a real change to make on mount.
    document.documentElement.setAttribute("data-theme", "light");
    const html = renderToString(
      <Providers>
        <Suspense fallback={null}>
          <Server />
        </Suspense>
      </Providers>,
    );
    container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    const serverNode = container.querySelector("#lazy");
    expect(serverNode).not.toBeNull();

    let load: (value: { default: React.ComponentType }) => void = () => {};
    const Lazy = React.lazy(
      () => new Promise<{ default: React.ComponentType }>((resolve) => (load = resolve)),
    );

    await act(async () => {
      hydrateRoot(
        container,
        <Providers>
          <Suspense fallback={null}>
            <Lazy />
          </Suspense>
        </Providers>,
        { onRecoverableError: () => {} },
      );
    });
    // The chunk has not loaded, the providers have mounted.
    expect(container.querySelector("#lazy")).toBe(serverNode);

    await act(async () => load({ default: Server }));
    expect(container.querySelector("#lazy")).toBe(serverNode);
  });
});
