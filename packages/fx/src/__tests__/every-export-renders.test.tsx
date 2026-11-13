import {
  DataThemeProvider,
  IconProvider,
  LayoutProvider,
  ThemeProvider,
  ToastProvider,
} from "@once-ui-system/core";
import { act, render } from "@testing-library/react";
import type React from "react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Fx from "../index.js";

/**
 * Every effect the package exports renders, on the client and on the server,
 * with the props its docs call minimal, without throwing and without React
 * logging an error or warning. Core's every-export-renders.test.tsx is the
 * same check for core; it covered the effects too until 3.0 moved them here.
 */

type AnyComponent = React.ComponentType<Record<string, unknown>>;

/** Props for components whose required props make an empty render meaningless. */
const fixtures: Record<string, Record<string, unknown>> = {
  CountdownFx: { targetDate: "2030-01-01T00:00:00Z" },
  CountFx: { value: 42 },
  TypeFx: { words: ["Design", "Build"] },
};

const isComponent = (value: unknown) => {
  if (typeof value === "function") return !/^class\s/.test(Function.prototype.toString.call(value));
  if (!value || typeof value !== "object" || !("$$typeof" in value)) return false;
  const tag = (value as { $$typeof: symbol }).$$typeof;
  return tag === Symbol.for("react.forward_ref") || tag === Symbol.for("react.memo");
};

const components = Object.entries(Fx as Record<string, unknown>)
  .filter(([name, value]) => /^[A-Z]/.test(name) && isComponent(value))
  .sort(([a], [b]) => a.localeCompare(b));

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <DataThemeProvider>
          <ToastProvider>
            <IconProvider>{children}</IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}

function element(name: string, Component: AnyComponent) {
  return <Providers>{createElement(Component, fixtures[name] ?? {})}</Providers>;
}

/** React reports bad markup through console.error/warn; a log here is a failure. */
let logs: string[] = [];
beforeEach(() => {
  logs = [];
  for (const level of ["error", "warn"] as const) {
    vi.spyOn(console, level).mockImplementation((...args: unknown[]) => {
      logs.push(`console.${level}: ${args.map(String).join(" ").slice(0, 400)}`);
    });
  }
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("every exported effect", () => {
  it("is found", () => {
    // Guards the export walk itself: if it silently found nothing, every case below would vanish.
    expect(components.length).toBeGreaterThan(3);
  });

  it.each(components)("%s renders on the client and unmounts cleanly", async (name, value) => {
    const view = render(element(name, value as AnyComponent));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    view.unmount();
    expect(logs).toEqual([]);
  });

  it.each(components)("%s renders on the server", (name, value) => {
    expect(() => renderToString(element(name, value as AnyComponent))).not.toThrow();
    expect(logs).toEqual([]);
  });
});

describe("TypeFx with no words yet", () => {
  it("types nothing instead of crashing", async () => {
    const view = render(element("TypeFx", Fx.TypeFx as unknown as AnyComponent));
    view.rerender(
      <Providers>
        <Fx.TypeFx words={[]} />
      </Providers>,
    );
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    view.unmount();
    expect(logs).toEqual([]);
  });
});
