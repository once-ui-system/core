import { act, render } from "@testing-library/react";
import type React from "react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Core from "../index";
import * as Code from "../modules/code/index";
import * as Data from "../modules/data/index";
import * as Emoji from "../modules/emoji/index";
import * as MediaModule from "../modules/media/index";

/**
 * Every component the package exports renders, on the client and on the
 * server, with the props its docs call minimal, without throwing and without
 * React logging an error or warning (missing keys, unknown DOM props, bad
 * nesting, setState on an unmounted tree). A new export that cannot render
 * with no props fails here until it gets a fixture below, so nothing ships
 * without at least this check. The effects and blocks have the same check in
 * their own packages.
 */

type AnyComponent = React.ComponentType<Record<string, unknown>>;

const exportsUnderTest: Record<string, unknown> = {
  ...Core,
  ...Data,
  ...Code,
  ...MediaModule,
  ...Emoji,
};

const noop = () => {};
const avatar = { src: "/avatar.jpg" };

/** Props for components whose required props make an empty render meaningless. */
const fixtures: Record<string, Record<string, unknown>> = {
  AvatarGroup: { avatars: [avatar, avatar, { value: "AB" }] },
  Breadcrumbs: { items: [{ label: "Home", href: "/" }, { label: "Docs" }] },
  ColorInput: { id: "color", label: "Colour", value: "#ff0000", onValueChange: noop },
  CompareImage: {
    leftContent: { src: "/a.jpg", alt: "Before" },
    rightContent: { src: "/b.jpg", alt: "After" },
  },
  FormErrorSummary: { errors: { email: "Enter an email" } },
  InfiniteScroll: {
    items: ["a", "b"],
    renderItem: (item: string) => item,
    loadMore: async () => false,
  },
  SegmentedControl: {
    value: "a",
    onValueChange: noop,
    buttons: [
      { value: "a", label: "A" },
      { value: "b", label: "B" },
    ],
  },
  Select: {
    id: "select",
    label: "Fruit",
    options: [{ label: "Apple", value: "apple" }],
    value: "",
    onValueChange: noop,
  },
  SettingAxes: { label: "Tilt", axes: [{ label: "X", control: "x" }] },
  Table: { columns: [{ key: "name", header: "Name" }], rows: [{ id: "1", name: "Ada" }] },
  Timeline: { items: [{ label: "Step one" }] },
  ThemeInit: { config: {} },
  MegaMenu: { menuGroups: [{ id: "docs", label: "Docs", href: "/docs" }] },
  MobileMegaMenu: { menuGroups: [{ id: "docs", label: "Docs", href: "/docs" }] },
  OgRoutesProvider: { routes: {} },
  Schema: {
    as: "webPage",
    title: "Title",
    description: "Description",
    baseURL: "https://example.com",
    path: "/",
  },
  Sortable: { items: [] },
  SortableItem: { id: "a", children: "A" },
  Tab: { value: "a", children: "A" },
  TabList: { children: "list" },
  TabPanel: { value: "a", children: "panel" },
  CodeBlock: { codes: [{ code: "const a = 1;", language: "tsx", label: "a.tsx" }] },
  BarChart: { series: [{ key: "a" }], data: [{ label: "Jan", a: 1 }] },
  LineChart: { series: [{ key: "a" }], data: [{ label: "Jan", a: 1 }] },
  LineBarChart: { series: [{ key: "a" }, { key: "b" }], data: [{ label: "Jan", a: 1, b: 2 }] },
  PieChart: { series: { key: "a" }, data: [{ name: "A", a: 1 }] },
  RadialGauge: { value: 40 },
  Icon: { name: "check" },
  Logo: { wordmark: "/logo.svg" },
  ProgressBar: { value: 40 },
  Toast: { tone: "success", children: "Saved" },
  LinearGauge: { value: 40 },
};

/** Components that need a parent to mean anything get it here. */
const inSvg = (child: React.ReactElement) => (
  <svg aria-hidden="true">
    <defs>{child}</defs>
  </svg>
);
const parents: Record<string, (child: React.ReactElement) => React.ReactElement> = {
  LinearGradient: inSvg,
  RadialGradient: inSvg,
  SortableHandle: (child) => <Core.Sortable items={["a"]}>{child}</Core.Sortable>,
  SortableItem: (child) => <Core.Sortable items={["a"]}>{child}</Core.Sortable>,
  Tab: (child) => <Core.Tabs defaultValue="a">{child}</Core.Tabs>,
  TabList: (child) => <Core.Tabs defaultValue="a">{child}</Core.Tabs>,
  TabPanel: (child) => <Core.Tabs defaultValue="a">{child}</Core.Tabs>,
};

/** Exports that are components by shape but have nothing of their own to render. */
const notRendered = new Set([
  // Providers: rendered around every case below.
  "ThemeProvider",
  "LayoutProvider",
  "DataThemeProvider",
  "ToastProvider",
  "IconProvider",
]);

const isComponent = (value: unknown) => {
  if (typeof value === "function") return !/^class\s/.test(Function.prototype.toString.call(value));
  if (!value || typeof value !== "object" || !("$$typeof" in value)) return false;
  const tag = (value as { $$typeof: symbol }).$$typeof;
  return tag === Symbol.for("react.forward_ref") || tag === Symbol.for("react.memo");
};

const components = Object.entries(exportsUnderTest)
  .filter(([name, value]) => /^[A-Z]/.test(name) && !notRendered.has(name) && isComponent(value))
  .sort(([a], [b]) => a.localeCompare(b));

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Core.ThemeProvider>
      <Core.LayoutProvider>
        <Core.DataThemeProvider>
          <Core.ToastProvider>
            <Core.IconProvider>{children}</Core.IconProvider>
          </Core.ToastProvider>
        </Core.DataThemeProvider>
      </Core.LayoutProvider>
    </Core.ThemeProvider>
  );
}

function element(name: string, Component: AnyComponent) {
  const child = createElement(Component, fixtures[name] ?? {});
  return <Providers>{parents[name]?.(child) ?? child}</Providers>;
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

describe("every exported component", () => {
  it("is found", () => {
    // Guards the export walk itself: if it silently found nothing, every case below would vanish.
    expect(components.length).toBeGreaterThan(100);
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
